import { PrismaClient, Prisma } from "@prisma/client";
import { gatherWatchlistDigest } from "@/lib/digest/gather-watchlist-digest";
import { sendWatchlistDigestForUser } from "@/lib/digest/watchlist-digest-email";
import {
  isUsMarketCloseWindow,
  usTradeDate,
} from "@/lib/market/session";
import type { AssetType } from "@/lib/types";

function digestEnabled(): boolean {
  const v = process.env.WATCHLIST_DIGEST_ENABLED;
  if (v == null || v === "") return true;
  return v !== "0" && v.toLowerCase() !== "false";
}

function parseWindowMinutes(): { startMinutes: number; endMinutes: number } {
  // HH:MM ET, defaults 16:00–17:00
  const parse = (raw: string | undefined, fallback: number) => {
    if (!raw?.trim()) return fallback;
    const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return fallback;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return fallback;
    return h * 60 + min;
  };
  return {
    startMinutes: parse(process.env.WATCHLIST_DIGEST_START_ET, 16 * 60),
    endMinutes: parse(process.env.WATCHLIST_DIGEST_END_ET, 17 * 60),
  };
}

export async function tickWatchlistDigest(prisma: PrismaClient): Promise<void> {
  if (!digestEnabled()) return;

  const now = new Date();
  const window = parseWindowMinutes();
  if (!isUsMarketCloseWindow(now, window)) return;

  const tradeDate = usTradeDate(now);

  const users = await prisma.user.findMany({
    where: { watchlist: { some: {} } },
    select: {
      id: true,
      email: true,
      locale: true,
      watchlist: {
        select: { symbol: true, assetType: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!users.length) {
    console.info(`[digest] no watchlist users @ ${tradeDate}`);
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
      const claim = await prisma.watchlistDigestLog.create({
        data: {
          userId: user.id,
          tradeDate,
          itemCount: 0,
        },
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
      console.error(`[digest] claim failed ${user.id}`, err);
      continue;
    }

    try {
      const payload = await gatherWatchlistDigest({
        userId: user.id,
        locale: user.locale,
        tradeDate,
        items: user.watchlist.map((w) => ({
          symbol: w.symbol,
          assetType: w.assetType as AssetType,
        })),
      });

      await sendWatchlistDigestForUser({
        userId: user.id,
        to: user.email,
        payload,
      });

      await prisma.watchlistDigestLog.update({
        where: { id: claimId },
        data: { itemCount: payload.rows.length, sentAt: new Date() },
      });
      sent++;
      console.info(
        `[digest] sent ${user.email} items=${payload.rows.length} date=${tradeDate}`,
      );
    } catch (err) {
      console.error(`[digest] send failed ${user.id}`, err);
      if (claimId) {
        await prisma.watchlistDigestLog
          .delete({ where: { id: claimId } })
          .catch(() => undefined);
      }
    }
  }

  console.info(
    `[digest] done date=${tradeDate} sent=${sent} skipped=${skipped} users=${users.length}`,
  );
}
