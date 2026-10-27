"use client";

import { useTranslations } from "next-intl";
import { PaginatedList } from "@/components/ui/paginated-list";

const TRADE_PAGE_SIZE = 10;

export type ReplayResultView = {
  totalReturnPct?: number;
  maxDrawdownPct?: number;
  tradeCount?: number;
  winRate?: number | null;
  buyHoldReturnPct?: number;
  sharpeRatio?: number | null;
  calmarRatio?: number | null;
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

function fmtRatio(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
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
        <div className="grid grid-cols-2 sm:grid-cols-3">
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
          <Metric label={t("sharpe")} value={fmtRatio(result.sharpeRatio)} />
          <Metric label={t("calmar")} value={fmtRatio(result.calmarRatio)} />
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
          <span className="mx-1.5 text-[var(--border)]">·</span>
          {t("riskRatioHint")}
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
          <div className="border-b border-[var(--border)] px-3 py-2.5 text-[14px] font-medium">
            {t("tradeList")}
            <span className="ml-2 text-[13px] font-normal text-[var(--muted)]">
              {result.trades.length}
            </span>
          </div>
          <div className="px-1 pb-2 pt-0 sm:px-2">
            <PaginatedList
              items={result.trades}
              pageSize={TRADE_PAGE_SIZE}
              resetKey={`${result.trades.length}-${result.trades[0]?.time ?? 0}`}
              variant="compact"
              dense
              listClassName="divide-y divide-[var(--border)]"
              renderItem={(tr, i) => {
                const isBuy = tr.side.toLowerCase() === "buy";
                return (
                  <li
                    key={`${tr.time}-${tr.side}-${i}`}
                    className="flex items-baseline justify-between gap-3 px-2 py-2.5 text-[13px] sm:px-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="w-7 shrink-0 tabular-nums text-[var(--muted)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          isBuy ? "text-[var(--up)]" : "text-[var(--down)]"
                        }
                      >
                        {isBuy ? t("sideBuy") : t("sideSell")}
                      </span>
                      <span className="tabular-nums text-[var(--muted)]">
                        {tr.qty} @ {tr.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="shrink-0 tabular-nums text-[12px] text-[var(--muted)]">
                      {new Date(tr.time).toISOString().slice(0, 10)}
                    </span>
                  </li>
                );
              }}
            />
          </div>
        </div>
      ) : null}

      <p className="rounded-md border border-[color-mix(in_srgb,#ca8a04_35%,var(--border))] bg-[color-mix(in_srgb,#ca8a04_8%,var(--panel))] px-3 py-2 text-[11px] leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}
      </p>
    </div>
  );
}
