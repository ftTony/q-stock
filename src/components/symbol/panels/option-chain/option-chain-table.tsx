import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import { formatNumber } from "@/lib/format-number";
import {
  chgLabel,
  chgTone,
  fmtBreakeven,
  fmtCount,
  fmtGreek,
  fmtIv,
  fmtMid,
  fmtPct,
  fmtPctOf,
  fmtPx,
} from "./option-chain-format";
import type { Greeks } from "./option-chain-utils";

export const TD = "px-2 py-1 text-center text-[12px] tabular-nums tracking-[-0.08px]";
export const TH =
  "min-w-[4.25rem] px-2 py-2 text-center text-[12px] font-medium text-[var(--muted)] whitespace-nowrap";

export type SideCellData = {
  bid: string;
  ask: string;
  mid: string;
  last: string;
  chg: string;
  chgCls: string;
  vol: string;
  oi: string;
  iv: string;
  delta: string;
  gamma: string;
  theta: string;
  breakeven: string;
  pop: string;
  sellerReturn: string;
  mark: string;
};

export function sideCells(
  row: OptionRow | undefined,
  greeks: Greeks | undefined,
): SideCellData {
  const chg = row?.chgPct;
  const iv = fmtIv(row?.iv);
  const mid =
    row?.bid != null && row?.ask != null && row.bid > 0 && row.ask > 0
      ? (row.bid + row.ask) / 2
      : null;
  return {
    bid: fmtPx(row?.bid),
    ask: fmtPx(row?.ask),
    mid: fmtMid(row?.bid, row?.ask),
    last: fmtPx(row?.last),
    chg: chgLabel(chg),
    chgCls: chgTone(chg),
    vol: fmtCount(row?.volume),
    oi: fmtCount(row?.oi),
    iv: iv != null ? `${iv}%` : "—",
    delta: fmtGreek(greeks?.delta ?? null),
    gamma: fmtGreek(greeks?.gamma ?? null),
    theta: fmtGreek(greeks?.theta ?? null),
    breakeven: fmtBreakeven(greeks?.breakeven ?? null),
    pop: fmtPct(greeks?.pop ?? null),
    sellerReturn: fmtPctOf(greeks?.sellerReturn ?? null),
    // Mark price: market mid when both sides are quoted, else fair value.
    mark: fmtPx(mid ?? greeks?.theo ?? row?.last),
  };
}

/**
 * Column order per side, starting at the column that sits next to the strike
 * column and walking outwards. The left (call) pane renders it reversed so its
 * edge column is the strike-adjacent one; the right (put) pane uses it as-is.
 */
const SIDE_FROM_STRIKE = [
  "bid",
  "ask",
  "mid",
  "last",
  "chg",
  "vol",
  "oi",
  "iv",
  "delta",
  "gamma",
  "theta",
  "breakeven",
  "pop",
  "sellerReturn",
  "mark",
] as const;
const CALL_ORDER = [...SIDE_FROM_STRIKE].reverse();
const PUT_ORDER = SIDE_FROM_STRIKE;

export const SIDE_COL_COUNT = CALL_ORDER.length;

export function SideGroup({
  d,
  bg,
  isCall,
}: {
  d: SideCellData;
  bg: string;
  isCall: boolean;
}) {
  const order = isCall ? CALL_ORDER : PUT_ORDER;
  return (
    <>
      {order.map((k) => (
        <td key={k} className={`${TD} ${bg} ${k === "chg" ? d.chgCls : ""}`}>
          {d[k]}
        </td>
      ))}
    </>
  );
}

export function SideHeader({
  t,
  isCall,
}: {
  t: (k: string) => string;
  isCall: boolean;
}) {
  const order = isCall ? CALL_ORDER : PUT_ORDER;
  return (
    <>
      {order.map((k) => (
        <th key={k} className={TH}>
          {t(`optCol.${k}`)}
        </th>
      ))}
    </>
  );
}

export function SpotAnchor({
  price,
  symbol,
}: {
  price: number;
  symbol?: string;
}) {
  return (
    <div className="relative flex h-0 items-center justify-center">
      <div className="absolute inset-x-0 border-t border-dashed border-[var(--aw-hairline,var(--border))]" />
      <span className="relative z-[1] rounded-full border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums tracking-[-0.08px] text-[var(--foreground)] shadow-sm">
        {symbol ? <span className="mr-1">{symbol}</span> : null}
        {formatNumber(price, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        })}
      </span>
    </div>
  );
}

/** Dashed spot line for the call/put panes (chip lives in the strike pane). */
export function SpotLine() {
  return (
    <div className="relative h-0">
      <div className="absolute inset-x-0 border-t border-dashed border-[var(--aw-hairline,var(--border))]" />
    </div>
  );
}

/** Row height used for the spot-anchor row — taller than the data rows. */
export const ANCHOR_ROW_H = "h-10";
