/**
 * Session bridge: strategy replay / tools → TradePanel draft.
 * Never auto-submits; TradePanel shows an undoable banner.
 */

import type { AssetType } from "@/lib/types";

export const PAPER_DRAFT_STORAGE_KEY = "q-stock.paper-draft";

export type StoredPaperDraft = {
  symbol: string;
  assetType: AssetType;
  side: "buy" | "sell";
  type: "limit" | "stop";
  price: number;
  qtyHint?: number;
  invalidationNote?: string;
  strategyId?: string | null;
  source: "replay" | "scenario" | "tool";
  nonce: number;
};

export function writePaperDraft(draft: Omit<StoredPaperDraft, "nonce">): void {
  if (typeof window === "undefined") return;
  const payload: StoredPaperDraft = {
    ...draft,
    nonce: Date.now(),
  };
  try {
    sessionStorage.setItem(PAPER_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

/** Read and optionally clear a draft matching symbol+assetType. */
export function consumePaperDraft(
  symbol: string,
  assetType: AssetType,
  opts?: { clear?: boolean },
): StoredPaperDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PAPER_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPaperDraft;
    if (
      !parsed ||
      parsed.symbol !== symbol ||
      parsed.assetType !== assetType ||
      !(parsed.price > 0) ||
      (parsed.type !== "limit" && parsed.type !== "stop") ||
      (parsed.side !== "buy" && parsed.side !== "sell")
    ) {
      return null;
    }
    if (opts?.clear !== false) {
      sessionStorage.removeItem(PAPER_DRAFT_STORAGE_KEY);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function draftFromReplayTrades(
  trades: Array<{ side: string; price: number; qty: number }>,
): Pick<
  StoredPaperDraft,
  "side" | "type" | "price" | "qtyHint" | "invalidationNote"
> | null {
  if (!trades.length) return null;
  const last = [...trades].reverse().find((t) => t.price > 0);
  if (!last) return null;
  const side = last.side.toLowerCase() === "sell" ? "sell" : "buy";
  return {
    side,
    type: "limit",
    price: last.price,
    qtyHint: last.qty > 0 ? last.qty : undefined,
    invalidationNote: "From rule replay — review before submit",
  };
}
