import {
  type IpoItem,
  type IpoStatus,
  parseIpoStatus,
} from "@/lib/market/ipo-types";
import { getFutuIpoList } from "@/lib/market/providers/futu-ipo";
import { getLongbridgeIpoList } from "@/lib/market/providers/longbridge-ipo";
import {
  listEquityAttempts,
  runWithEquityAttempt,
} from "@/lib/market/router";

export type { IpoItem, IpoStatus };
export { parseIpoStatus };

export type IpoListResult = {
  items: IpoItem[];
  source: "futu" | "longbridge" | null;
};

/**
 * HK IPO along the same equity attempt chain (user broker → platform brokers).
 * Futu「已上市」uses Recent IPOs plate (次新股 HK.LIST1290).
 */
export async function getIpoList(
  status: IpoStatus,
  limit = 4,
): Promise<IpoListResult> {
  for (const attempt of listEquityAttempts()) {
    if (attempt.id === "finnhub") continue;
    try {
      if (attempt.id === "longbridge") {
        const items = await runWithEquityAttempt(attempt, () =>
          getLongbridgeIpoList(status, limit),
        );
        if (items.length > 0) {
          return { items, source: "longbridge" };
        }
        continue;
      }
      if (attempt.id === "futu") {
        const items = await runWithEquityAttempt(attempt, () =>
          getFutuIpoList(status, limit),
        );
        return { items, source: "futu" };
      }
    } catch (err) {
      console.error(`${attempt.id}:${attempt.source} ipo`, err);
    }
  }

  return { items: [], source: null };
}
