import { getQuotes } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import type { CloseQuoteRow } from "@/lib/push/format-close-body";
import type { AssetType } from "@/lib/types";

/** Quotes-only gather for close push (no AI / sentiment — small-server safe). */
export async function gatherCloseQuotes(opts: {
  userId: string;
  items: Array<{ symbol: string; assetType: AssetType }>;
}): Promise<CloseQuoteRow[]> {
  return withUserMarket(opts.userId, async () => {
    const items = opts.items.slice(0, 40);
    if (!items.length) return [];

    const quotes = await getQuotes(
      items.map((i) => ({
        symbol: i.symbol,
        assetType: i.assetType,
      })),
    ).catch(() => []);

    const quoteMap = new Map(
      quotes.map((q) => [`${q.assetType}:${q.symbol}`, q]),
    );

    return items.map((item) => {
      const q = quoteMap.get(`${item.assetType}:${item.symbol}`);
      return {
        symbol: item.symbol,
        assetType: item.assetType,
        price: q && Number.isFinite(q.price) ? q.price : null,
        percentChange:
          q && Number.isFinite(q.percentChange) ? q.percentChange : null,
      };
    });
  });
}
