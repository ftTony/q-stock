"use client";

import { Link } from "@/i18n/routing";
import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";
import type { AssetType } from "@/lib/types";

function formatVolume(n: number, locale: string): string {
  const abs = Math.abs(n);
  const zh = locale.startsWith("zh");
  if (zh) {
    if (abs >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`;
    if (abs >= 1e4) return `${(n / 1e4).toFixed(2)} 万`;
    return n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
  }
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(4);
}

function pctClass(pct: number): string {
  if (pct > 0.005) return "text-[var(--up)]";
  if (pct < -0.005) return "text-[var(--down)]";
  return "text-[var(--fg)]";
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function StocksSkeleton({ label }: { label: string }) {
  return (
    <div className="mt-2.5 border-t border-[var(--border)] pt-2.5">
      <div className="mb-2 text-[11px] text-[var(--muted)]">{label}</div>
      <ul className="max-h-56 space-y-2" aria-busy="true" aria-live="polite">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-3 flex-1 animate-pulse rounded bg-[var(--surface-2)]" />
            <span className="h-3 w-12 shrink-0 animate-pulse rounded bg-[var(--surface-2)]" />
            <span className="h-3 w-14 shrink-0 animate-pulse rounded bg-[var(--surface-2)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IndustryHeatmapTooltip({
  cell,
  assetType,
  x,
  y,
  labels,
  locale,
  stocksLoading = false,
  onEnter,
  onLeave,
}: {
  cell: IndustryHeatCell;
  assetType: Exclude<AssetType, "crypto">;
  x: number;
  y: number;
  labels: { change: string; volume: string; loading: string };
  locale: string;
  /** True while member stocks are still being fetched. */
  stocksLoading?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  const width = 280;
  const left = Math.min(
    Math.max(8, x + 14),
    typeof window !== "undefined" ? window.innerWidth - width - 8 : x,
  );
  const top = Math.min(
    Math.max(8, y + 14),
    typeof window !== "undefined" ? window.innerHeight - 320 : y,
  );

  return (
    <div
      className="fixed z-50 w-[280px] rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3.5 py-3 shadow-lg"
      style={{ left, top }}
      role="tooltip"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="text-sm font-semibold text-[var(--fg)]">{cell.name}</div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
        <span>
          <span className="text-[var(--muted)]">{labels.change} </span>
          <span
            className={`font-semibold tabular-nums ${pctClass(cell.percentChange)}`}
          >
            {formatPct(cell.percentChange)}
          </span>
        </span>
        {cell.volume != null && cell.volume > 0 && (
          <span>
            <span className="text-[var(--muted)]">{labels.volume} </span>
            <span className="font-medium tabular-nums text-[var(--fg)]">
              {formatVolume(cell.volume, locale)}
            </span>
          </span>
        )}
      </div>

      {stocksLoading ? (
        <StocksSkeleton label={labels.loading} />
      ) : cell.stocks.length > 0 ? (
        <ul className="mt-2.5 max-h-56 space-y-1.5 overflow-y-auto border-t border-[var(--border)] pt-2.5">
          {cell.stocks.map((s) => (
            <li
              key={s.symbol}
              className="flex items-baseline justify-between gap-2 text-xs"
            >
              <Link
                href={`/symbol/${assetType}/${s.symbol}`}
                className="min-w-0 flex-1 truncate text-[var(--fg)] hover:underline"
              >
                {s.name}
              </Link>
              <span className="shrink-0 tabular-nums text-[var(--fg)]">
                {formatPrice(s.price)}
              </span>
              <span
                className={`w-[4.25rem] shrink-0 text-right font-medium tabular-nums ${pctClass(s.percentChange)}`}
              >
                {formatPct(s.percentChange)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
