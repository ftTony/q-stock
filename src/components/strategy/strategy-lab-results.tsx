"use client";

import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";

export type CompareLeg = {
  name: string;
  metrics: {
    totalReturnPct: number;
    maxDrawdownPct: number;
    tradeCount: number;
    winRate: number | null;
    sharpeRatio?: number | null;
    calmarRatio?: number | null;
  };
  equityCurve: Array<{ equity: number; buyHold: number }>;
};

export type GridRow = {
  value: number;
  metrics: {
    totalReturnPct: number;
    maxDrawdownPct: number;
    tradeCount: number;
    winRate: number | null;
    sharpeRatio?: number | null;
    calmarRatio?: number | null;
  };
};

export type BasketRow =
  | {
      symbol: string;
      ok: true;
      metrics: {
        totalReturnPct: number;
        maxDrawdownPct: number;
        tradeCount: number;
        sharpeRatio?: number | null;
        calmarRatio?: number | null;
      };
    }
  | { symbol: string; ok: false; error: string };

function fmtPct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function fmtRatio(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

function DualEquity({
  a,
  b,
  labelA,
  labelB,
}: {
  a: number[];
  b: number[];
  labelA: string;
  labelB: string;
}) {
  const w = 320;
  const h = 120;
  const pad = 6;
  const all = [...a, ...b];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const path = (vals: number[]) =>
    vals
      .map((v, i) => {
        const x = pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / span) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full">
        <path d={path(a)} fill="none" stroke="var(--brand)" strokeWidth="1.5" />
        <path
          d={path(b)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </svg>
      <div className="flex gap-3 text-[12px] text-[var(--muted)]">
        <span>
          <span className="mr-1.5 inline-block h-1.5 w-3 rounded bg-[var(--brand)]" />
          {labelA}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-1.5 w-3 rounded border border-dashed border-[var(--muted)]" />
          {labelB}
        </span>
      </div>
    </div>
  );
}

function MetricLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[13px] leading-relaxed">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium tabular-nums text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

export function StrategyLabResults({
  compare,
  grid,
  basket,
  reportId,
  shareToken,
  busy,
  onShare,
}: {
  compare: CompareLeg[] | null;
  grid: GridRow[] | null;
  basket: BasketRow[] | null;
  reportId: string | null;
  shareToken: string | null;
  busy: boolean;
  onShare: () => void;
}) {
  const t = useTranslations("strategies");

  return (
    <>
      {compare && compare.length >= 2 ? (
        <div className="space-y-3 rounded-md border border-[var(--border)] p-3">
          <DualEquity
            a={compare[0]!.equityCurve.map((p) => p.equity)}
            b={compare[1]!.equityCurve.map((p) => p.equity)}
            labelA={compare[0]!.name}
            labelB={compare[1]!.name}
          />
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-2">
            {compare.map((leg) => (
              <div key={leg.name} className="min-w-0">
                <p className="mb-1 truncate text-[13px] font-semibold text-[var(--foreground)]">
                  {leg.name}
                </p>
                <MetricLine
                  label={t("return")}
                  value={fmtPct(leg.metrics.totalReturnPct)}
                />
                <MetricLine
                  label={t("maxDd")}
                  value={fmtPct(leg.metrics.maxDrawdownPct)}
                />
                <MetricLine
                  label={t("sharpe")}
                  value={fmtRatio(leg.metrics.sharpeRatio)}
                />
                <MetricLine
                  label={t("calmar")}
                  value={fmtRatio(leg.metrics.calmarRatio)}
                />
                <MetricLine
                  label={t("trades")}
                  value={String(leg.metrics.tradeCount)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {grid ? (
        <div className="overflow-hidden rounded-md border border-[var(--border)]">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[12px] text-[var(--muted)]">
              <tr>
                <th className="px-2.5 py-2">{t("labParamValue")}</th>
                <th className="px-2.5 py-2">{t("return")}</th>
                <th className="px-2.5 py-2">{t("maxDd")}</th>
                <th className="px-2.5 py-2">{t("sharpe")}</th>
                <th className="px-2.5 py-2">{t("calmar")}</th>
                <th className="px-2.5 py-2">{t("trades")}</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.value} className="border-t border-[var(--border)]">
                  <td className="px-2.5 py-2 tabular-nums">{row.value}</td>
                  <td className="px-2.5 py-2 tabular-nums">
                    {fmtPct(row.metrics.totalReturnPct)}
                  </td>
                  <td className="px-2.5 py-2 tabular-nums">
                    {fmtPct(row.metrics.maxDrawdownPct)}
                  </td>
                  <td className="px-2.5 py-2 tabular-nums">
                    {fmtRatio(row.metrics.sharpeRatio)}
                  </td>
                  <td className="px-2.5 py-2 tabular-nums">
                    {fmtRatio(row.metrics.calmarRatio)}
                  </td>
                  <td className="px-2.5 py-2 tabular-nums">
                    {row.metrics.tradeCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {basket ? (
        <div className="overflow-hidden rounded-md border border-[var(--border)]">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[12px] text-[var(--muted)]">
              <tr>
                <th className="px-2.5 py-2">{t("symbol")}</th>
                <th className="px-2.5 py-2">{t("return")}</th>
                <th className="px-2.5 py-2">{t("maxDd")}</th>
                <th className="px-2.5 py-2">{t("sharpe")}</th>
                <th className="px-2.5 py-2">{t("calmar")}</th>
                <th className="px-2.5 py-2">{t("trades")}</th>
              </tr>
            </thead>
            <tbody>
              {basket.map((row) => (
                <tr key={row.symbol} className="border-t border-[var(--border)]">
                  <td className="px-2.5 py-2">{row.symbol}</td>
                  {row.ok ? (
                    <>
                      <td className="px-2.5 py-2 tabular-nums">
                        {fmtPct(row.metrics.totalReturnPct)}
                      </td>
                      <td className="px-2.5 py-2 tabular-nums">
                        {fmtPct(row.metrics.maxDrawdownPct)}
                      </td>
                      <td className="px-2.5 py-2 tabular-nums">
                        {fmtRatio(row.metrics.sharpeRatio)}
                      </td>
                      <td className="px-2.5 py-2 tabular-nums">
                        {fmtRatio(row.metrics.calmarRatio)}
                      </td>
                      <td className="px-2.5 py-2 tabular-nums">
                        {row.metrics.tradeCount}
                      </td>
                    </>
                  ) : (
                    <td className="px-2.5 py-2 text-[var(--down)]" colSpan={5}>
                      {row.error}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {reportId && (compare || grid || basket) ? (
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={t("loading")}
          className="qt-btn h-9 px-3 text-[13px]"
          onClick={onShare}
        >
          {shareToken ? t("shareRevoke") : t("shareResult")}
        </SubmitButton>
      ) : null}
    </>
  );
}
