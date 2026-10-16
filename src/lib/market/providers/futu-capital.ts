import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type { CapitalSnapshot } from "@/lib/market/providers/longbridge-research";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

type FlowItem = {
  capital_flow_item_time?: number;
  in_flow?: number;
  super_in_flow?: number;
  big_in_flow?: number;
  mid_in_flow?: number;
  sml_in_flow?: number;
};

/**
 * Aggregate Futu intraday capital-flow into large/medium/small in/out buckets.
 * Net > 0 → inflow; net < 0 → outflow (absolute).
 */
export async function fetchFutuCapital(
  symbol: string,
  assetType: AssetType,
): Promise<CapitalSnapshot> {
  if (assetType === "crypto") {
    throw new MarketDataError("Futu capital is equity-only", "futu");
  }
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:capital:${code}`;

  return cachedFetch(key, 300_000, async () => {
    const path = `/api/v1.0/quote/${encodeURIComponent(code)}/capital-flow`;
    // NORMAL can be empty off-session; FULL includes pre/post for US.
    let data: { flow_list?: FlowItem[]; last_valid_time?: number | null } = {};
    for (const section of ["NORMAL", "FULL"] as const) {
      const res = await futuRequest<{
        flow_list?: FlowItem[];
        last_valid_time?: number | null;
      }>("GET", path, { query: { section } });
      data = res.data ?? {};
      if ((data.flow_list ?? []).length > 0) break;
    }

    const list = data.flow_list ?? [];
    const inflow = { large: 0, medium: 0, small: 0 };
    const outflow = { large: 0, medium: 0, small: 0 };

    const acc = (
      bucket: keyof typeof inflow,
      net: number | undefined,
    ) => {
      const n = Number(net ?? 0);
      if (!Number.isFinite(n) || n === 0) return;
      if (n > 0) inflow[bucket] += n;
      else outflow[bucket] += -n;
    };

    for (const row of list) {
      acc(
        "large",
        Number(row.super_in_flow ?? 0) + Number(row.big_in_flow ?? 0),
      );
      acc("medium", row.mid_in_flow);
      acc("small", row.sml_in_flow);
    }

    const total =
      inflow.large +
      inflow.medium +
      inflow.small +
      outflow.large +
      outflow.medium +
      outflow.small;
    if (!(total > 0)) {
      throw new MarketDataError(`Futu capital empty for ${code}`, "futu");
    }

    const ts = Number(data.last_valid_time ?? 0);
    return {
      timestamp:
        ts > 1e12
          ? Math.floor(ts / 1000)
          : ts > 0
            ? ts
            : Math.floor(Date.now() / 1000),
      inflow,
      outflow,
    };
  });
}
