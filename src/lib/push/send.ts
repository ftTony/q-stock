import webpush from "web-push";
import { prisma } from "@/lib/db";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isPushConfigured,
} from "@/lib/push/vapid";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

let vapidReady = false;

function ensureVapid(): boolean {
  if (!isPushConfigured()) return false;
  if (!vapidReady) {
    webpush.setVapidDetails(
      getVapidSubject(),
      getVapidPublicKey()!,
      getVapidPrivateKey()!,
    );
    vapidReady = true;
  }
  return true;
}

function isGoneStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}

/** Send one payload to all of a user's stored subscriptions; prune dead endpoints. */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; pruned: number }> {
  if (!ensureVapid()) return { sent: 0, pruned: 0 };

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    take: 10,
  });
  if (!subs.length) return { sent: 0, pruned: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/watchlist",
  });

  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { TTL: 60 * 60 * 12, urgency: "normal" },
        );
        sent++;
      } catch (err) {
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode?: number }).statusCode)
            : undefined;
        if (isGoneStatus(status)) {
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => undefined);
          pruned++;
        } else {
          console.error(`[push] send failed ${sub.id}`, err);
        }
      }
    }),
  );

  return { sent, pruned };
}
