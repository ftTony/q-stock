import { PrismaClient, Prisma } from "@prisma/client";
import {
  isUsMarketCloseWindow,
  usTradeDate,
} from "@/lib/market/session";
import {
  closePushTitle,
  formatClosePushBody,
} from "@/lib/push/format-close-body";
import { gatherCloseQuotes } from "@/lib/push/gather-close-quotes";
import { sendPushToUser } from "@/lib/push/send";
import { isPushConfigured } from "@/lib/push/vapid";
import type { AssetType } from "@/lib/types";

function pushEnabled(): boolean {
  if (!isPushConfigured()) return false;
  const v = process.env.WATCHLIST_CLOSE_PUSH_ENABLED;
  if (v == null || v === "") return true;
  return v !== "0" && v.toLowerCase() !== "false";
}

function parseWindowMinutes(): { startMinutes: number; endMinutes: number } {
  const parse = (raw: string | undefined, fallback: number) => {
    if (!raw?.trim()) return fallback;
    const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return fallback;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return fallback;
    return h * 60 + min;
  };
  // Reuse digest window env so email + push fire in the same hour.
  return {
    startMinutes: parse(process.env.WATCHLIST_DIGEST_START_ET, 16 * 60),
    endMinutes: parse(process.env.WATCHLIST_DIGEST_END_ET, 17 * 60),
  };
}

/**
 * After US regular close: one PWA push per subscribed user with US watchlist prices.
 * Idempotent via WatchlistClosePushLog (separate from email digest log).
 */
export async function tickWatchlistClosePush(
  prisma: PrismaClient,
): Promise<void> {
  if (!pushEnabled()) return;

  const now = new Date();
  const window = parseWindowMinutes();
  if (!isUsMarketCloseWindow(now, window)) return;

  const tradeDate = usTradeDate(now);

  const users = await prisma.user.findMany({
    where: {
      pushSubscriptions: { some: {} },
      watchlist: { some: { assetType: "stock" } },
    },
    select: {
      id: true,
      locale: true,
      watchlist: {
        where: { assetType: "stock" },
        select: { symbol: true, assetType: true },
        orderBy: { createdAt: "asc" },
        take: 40,
      },
    },
    take: 50,
  });

  if (!users.length) {
    console.info(`[close-push] no subscribers @ ${tradeDate}`);
    return;
  }

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.watchlist.length) {
      skipped++;
      continue;
    }

    let claimId: string | null = null;
    try {
      const claim = await prisma.watchlistClosePushLog.create({
        data: { userId: user.id, tradeDate, itemCount: 0 },
      });
      claimId = claim.id;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        skipped++;
        continue;
      }
      console.error(`[close-push] claim failed ${user.id}`, err);
      continue;
    }

    try {
      const rows = await gatherCloseQuotes({
        userId: user.id,
        items: user.watchlist.map((w) => ({
          symbol: w.symbol,
          assetType: w.assetType as AssetType,
        })),
      });

      const body = formatClosePushBody(rows);
      if (!body.trim()) {
        skipped++;
        if (claimId) {
          await prisma.watchlistClosePushLog
            .delete({ where: { id: claimId } })
            .catch(() => undefined);
        }
        continue;
      }

      const result = await sendPushToUser(user.id, {
        title: closePushTitle(user.locale),
        body,
        url: "/watchlist",
      });

      if (result.sent === 0) {
        if (claimId) {
          await prisma.watchlistClosePushLog
            .delete({ where: { id: claimId } })
            .catch(() => undefined);
        }
        skipped++;
        continue;
      }

      await prisma.watchlistClosePushLog.update({
        where: { id: claimId! },
        data: { itemCount: rows.length, sentAt: new Date() },
      });
      sent++;
      console.info(
        `[close-push] user=${user.id} items=${rows.length} devices=${result.sent} date=${tradeDate}`,
      );
    } catch (err) {
      console.error(`[close-push] send failed ${user.id}`, err);
      if (claimId) {
        await prisma.watchlistClosePushLog
          .delete({ where: { id: claimId } })
          .catch(() => undefined);
      }
    }
  }

  console.info(
    `[close-push] done date=${tradeDate} sent=${sent} skipped=${skipped} users=${users.length}`,
  );
}
