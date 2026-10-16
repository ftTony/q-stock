"use client";

import { useTranslations } from "next-intl";

export type ReplayResultView = {
  totalReturnPct?: number;
  maxDrawdownPct?: number;
  tradeCount?: number;
  winRate?: number | null;
  buyHoldReturnPct?: number;
  assumptions?: Record<string, unknown>;
  equityCurve?: Array<{ t: number; equity: number; buyHold: number }>;
  trades?: Array<{
    side: string;
    time: number;
    price: number;
    qty: number;
  }>;
};

function fmtPct(n?: number) {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = `${n.toFixed(2)}%`;
  return n > 0 ? `+${s}` : s;
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "neutral";
}) {
  const color =
    tone === "up"
      ? "text-[var(--up)]"
      : tone === "down"
        ? "text-[var(--down)]"
        : "text-[var(--foreground)]";
  return (
    <div className="border-b border-[var(--border)] px-3 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="text-[11px] text-[var(--muted)]">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}

function EquityChart({
  equity,
  buyHold,
}: {
  equity: number[];
  buyHold: number[];
}) {
  const w = 560;
  const h = 160;
  const all = [...equity, ...buyHold];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const path = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = (i / Math.max(1, arr.length - 1)) * w;
        const y = h - ((v - min) / span) * (h - 8) - 4;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full text-[var(--brand)]">
      <path
        d={path(buyHold)}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.28}
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />
      <path d={path(equity)} fill="none" stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

export function StrategyReplayPanel({
  status,
  error,
  result,
}: {
  status: string;
  error: string | null;
  result: ReplayResultView | null;
}) {
  const t = useTranslations("strategies");

  if (status === "pending" || status === "running") {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-8 text-center text-sm text-[var(--muted)]">
        {t("replayRunning")} · {status}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-lg border border-[var(--down)]/30 bg-[var(--panel)] px-4 py-6 text-sm text-[var(--down)]">
        {error || t("replayFailed")}
      </div>
    );
  }

  if (!result) return null;

  const ret = result.totalReturnPct ?? 0;
  const dd = result.maxDrawdownPct ?? 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[13px] font-medium">{t("equityCurve")}</h3>
            <span className="text-[10px] text-[var(--muted)]">
              {t("vsBuyHold")}
            </span>
          </div>
          {result.equityCurve && result.equityCurve.length > 1 ? (
            <EquityChart
              equity={result.equityCurve.map((p) => p.equity)}
              buyHold={result.equityCurve.map((p) => p.buyHold)}
            />
          ) : (
            <p className="py-8 text-center text-xs text-[var(--muted)]">—</p>
          )}
          <p className="mt-2 rounded-md bg-[var(--brand-soft)] px-2.5 py-1.5 text-[11px] text-[var(--brand-text)]">
            {t("maxDd")}: {fmtPct(dd)}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="grid grid-cols-2">
            <Metric
              label={t("return")}
              value={fmtPct(result.totalReturnPct)}
              tone={ret >= 0 ? "up" : "down"}
            />
            <Metric
              label={t("maxDd")}
              value={fmtPct(result.maxDrawdownPct)}
              tone="down"
            />
            <Metric
              label={t("winRate")}
              value={
                result.winRate != null ? `${result.winRate.toFixed(1)}%` : "—"
              }
            />
            <Metric
              label={t("trades")}
              value={String(result.tradeCount ?? 0)}
            />
          </div>
          <div className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted)]">
            {t("buyHold")}:{" "}
            <span
              className={`font-medium tabular-nums ${
                (result.buyHoldReturnPct ?? 0) >= 0
                  ? "text-[var(--up)]"
                  : "text-[var(--down)]"
              }`}
            >
              {fmtPct(result.buyHoldReturnPct)}
            </span>
          </div>
        </div>
      </div>

      {result.assumptions ? (
        <p className="text-[11px] text-[var(--muted)]">
          {t("assumptions")}: fill=
          {String(result.assumptions.fill ?? "signal_close")}, slip=
          {String(result.assumptions.slipBps ?? 5)}bps, bars=
          {String(result.assumptions.barCount ?? "—")}
        </p>
      ) : null}

      {result.trades && result.trades.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-3 py-2 text-[13px] font-medium">
            {t("tradeList")}
            <span className="ml-2 text-[11px] font-normal text-[var(--muted)]">
              {result.tradeCount ?? result.trades.length}
            </span>
          </div>
          <div className="qt-scroll max-h-56 overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 bg-[var(--panel)] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">{t("side")}</th>
                  <th className="px-3 py-2 font-medium">{t("price")}</th>
                  <th className="px-3 py-2 font-medium">{t("qty")}</th>
                  <th className="px-3 py-2 font-medium">{t("time")}</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.slice(0, 50).map((tr, i) => (
                  <tr key={i} className="border-t border-[var(--border)]/70">
                    <td className="px-3 py-1.5 tabular-nums text-[var(--muted)]">
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td className="px-3 py-1.5">{tr.side}</td>
                    <td className="px-3 py-1.5 tabular-nums">
                      {tr.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 tabular-nums">{tr.qty}</td>
                    <td className="px-3 py-1.5 tabular-nums text-[var(--muted)]">
                      {new Date(tr.time).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="rounded-md border border-[color-mix(in_srgb,#ca8a04_35%,var(--border))] bg-[color-mix(in_srgb,#ca8a04_8%,var(--panel))] px-3 py-2 text-[11px] leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}
      </p>
    </div>
  );
}
