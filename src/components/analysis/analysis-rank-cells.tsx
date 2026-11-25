import {
  ChangeAbs,
  ChangePct,
  PriceText,
} from "@/components/market/price";
import type { AnalysisColId } from "@/components/analysis/analysis-rank-columns";
import type { AnalysisTableRow } from "@/components/analysis/types";
import { formatNumber } from "@/lib/format-number";

export function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <svg
      width="7"
      height="9"
      viewBox="0 0 7 9"
      fill="currentColor"
      className="ml-0.5 inline-block shrink-0 align-middle"
      aria-hidden
    >
      <path d="M3.5 0 7 3.4 0 3.4Z" opacity={dir === "desc" ? 0.25 : 1} />
      <path d="M3.5 9 0 5.6 7 5.6Z" opacity={dir === "asc" ? 0.25 : 1} />
    </svg>
  );
}

function fmtCompact(n: number | undefined, locale: string): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  const abs = Math.abs(n);
  if (locale.startsWith("zh")) {
    if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}万亿`;
    if (abs >= 1e8) return `${(n / 1e8).toFixed(2)}亿`;
    if (abs >= 1e4) return `${(n / 1e4).toFixed(2)}万`;
    return formatNumber(n, { maximumFractionDigits: 0 });
  }
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatNumber(n, { maximumFractionDigits: 0 });
}

function fmtNum(n: number | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(n: number | undefined): string {
  return n == null || !Number.isFinite(n) ? "—" : `${n.toFixed(2)}%`;
}

export function AnalysisRankCellValue({
  id,
  row,
  locale,
}: {
  id: AnalysisColId;
  row: AnalysisTableRow;
  locale: string;
}) {
  switch (id) {
    case "price":
      return <PriceText value={row.price} change={row.percentChange} />;
    case "change":
      return row.change === 0 && row.previousClose === row.price ? (
        <>—</>
      ) : (
        <ChangeAbs value={row.change} />
      );
    case "percentChange":
      return <ChangePct value={row.percentChange} />;
    case "marketCap":
      return <>{fmtCompact(row.marketCap, locale)}</>;
    case "volume":
      return <>{fmtCompact(row.volume, locale)}</>;
    case "turnover":
      return <>{fmtCompact(row.turnover, locale)}</>;
    case "open":
      return <>{fmtNum(row.open)}</>;
    case "previousClose":
      return <>{fmtNum(row.previousClose)}</>;
    case "high":
      return <>{fmtNum(row.high)}</>;
    case "low":
      return <>{fmtNum(row.low)}</>;
    case "turnoverRate":
      return <>{fmtPct(row.turnoverRate)}</>;
    case "changeSpeed":
      return <>{fmtPct(row.changeSpeed)}</>;
    case "amplitude":
      return <>{fmtPct(row.amplitude)}</>;
    case "volumeRatio":
      return <>{fmtNum(row.volumeRatio)}</>;
    case "orderRatio":
      return <>{fmtPct(row.orderRatio)}</>;
    case "change5d":
      return row.change5d == null ? <>—</> : <ChangePct value={row.change5d} />;
    case "change10d":
      return row.change10d == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.change10d} />
      );
    case "change20d":
      return row.change20d == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.change20d} />
      );
    case "change60d":
      return row.change60d == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.change60d} />
      );
    case "change120d":
      return row.change120d == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.change120d} />
      );
    case "change250d":
      return row.change250d == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.change250d} />
      );
    case "changeYtd":
      return row.changeYtd == null ? (
        <>—</>
      ) : (
        <ChangePct value={row.changeYtd} />
      );
    default:
      return <>—</>;
  }
}
