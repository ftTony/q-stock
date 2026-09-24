import {
  type IpoItem,
  type IpoStatus,
  parseIpoStatus,
} from "@/lib/market/ipo-types";
import { getFutuIpoList } from "@/lib/market/providers/futu-ipo";
import { getLongbridgeIpoList } from "@/lib/market/providers/longbridge-ipo";
import { listContentProviders } from "@/lib/market/router";

export type { IpoItem, IpoStatus };
export { parseIpoStatus };

export type IpoListResult = {
  items: IpoItem[];
  source: "futu" | "longbridge" | null;
};

/**
 * HK IPO: Longbridge → Futu.
 * Futu「已上市」uses Recent IPOs plate (次新股 HK.LIST1290).
 */
export async function getIpoList(
  status: IpoStatus,
  limit = 4,
): Promise<IpoListResult> {
  for (const id of listContentProviders()) {
    if (id === "finnhub") continue;
    try {
      if (id === "longbridge") {
        const items = await getLongbridgeIpoList(status, limit);
        if (items.length > 0) {
          return { items, source: "longbridge" };
        }
        continue;
      }
      if (id === "futu") {
        const items = await getFutuIpoList(status, limit);
        return { items, source: "futu" };
      }
    } catch (err) {
      console.error(`${id} ipo`, err);
    }
  }

  return { items: [], source: null };
}
