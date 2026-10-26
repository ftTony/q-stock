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
      };
    }
  | { symbol: string; ok: false; error: string };

function fmtPct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
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
      <div className="flex gap-3 text-[10px] text-[var(--muted)]">
        <span>
          <span className="mr-1 inline-block h-1.5 w-3 rounded bg-[var(--brand)]" />
          {labelA}
        </span>
        <span>
          <span className="mr-1 inline-block h-1.5 w-3 rounded border border-dashed border-[var(--muted)]" />
          {labelB}
        </span>
      </div>
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
        <div className="space-y-2 rounded-md border border-[var(--border)] p-2">
          <DualEquity
            a={compare[0]!.equityCurve.map((p) => p.equity)}
            b={compare[1]!.equityCurve.map((p) => p.equity)}
            labelA={compare[0]!.name}
            labelB={compare[1]!.name}
          />
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {compare.map((leg) => (
              <div key={leg.name}>
                <div className="font-medium">{leg.name}</div>
                <div>
                  {t("return")}: {fmtPct(leg.metrics.totalReturnPct)}
                </div>
                <div>
                  {t("maxDd")}: {fmtPct(leg.metrics.maxDrawdownPct)}
                </div>
                <div>
                  {t("trades")}: {leg.metrics.tradeCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {grid ? (
        <div className="overflow-hidden rounded-md border border-[var(--border)]">
          <table className="w-full text-left text-[11px]">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="px-2 py-1.5">{t("labParamValue")}</th>
                <th className="px-2 py-1.5">{t("return")}</th>
                <th className="px-2 py-1.5">{t("maxDd")}</th>
                <th className="px-2 py-1.5">{t("trades")}</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.value} className="border-t border-[var(--border)]">
                  <td className="px-2 py-1.5 tabular-nums">{row.value}</td>
                  <td className="px-2 py-1.5 tabular-nums">
                    {fmtPct(row.metrics.totalReturnPct)}
                  </td>
                  <td className="px-2 py-1.5 tabular-nums">
                    {fmtPct(row.metrics.maxDrawdownPct)}
                  </td>
                  <td className="px-2 py-1.5 tabular-nums">
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
          <table className="w-full text-left text-[11px]">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="px-2 py-1.5">{t("symbol")}</th>
                <th className="px-2 py-1.5">{t("return")}</th>
                <th className="px-2 py-1.5">{t("maxDd")}</th>
                <th className="px-2 py-1.5">{t("trades")}</th>
              </tr>
            </thead>
            <tbody>
              {basket.map((row) => (
                <tr key={row.symbol} className="border-t border-[var(--border)]">
                  <td className="px-2 py-1.5">{row.symbol}</td>
                  {row.ok ? (
                    <>
                      <td className="px-2 py-1.5 tabular-nums">
                        {fmtPct(row.metrics.totalReturnPct)}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {fmtPct(row.metrics.maxDrawdownPct)}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {row.metrics.tradeCount}
                      </td>
                    </>
                  ) : (
                    <td className="px-2 py-1.5 text-[var(--down)]" colSpan={3}>
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
          className="qt-btn h-8 px-3 text-xs"
          onClick={onShare}
        >
          {shareToken ? t("shareRevoke") : t("shareResult")}
        </SubmitButton>
      ) : null}
    </>
  );
}
