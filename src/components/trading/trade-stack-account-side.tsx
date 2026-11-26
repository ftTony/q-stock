"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";
import { INITIAL_CASH } from "@/lib/trading/account";

function money(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type TradeStackAccountNums = {
  cash: number;
  equity: number;
  gross: number;
  exposurePct: number;
  symbolPct: number;
  maxPct: number;
  nearCap: boolean;
  positionQty: number;
};

/**
 * Stack trade desk left rail — equity hero + cash / exposure / symbol weight.
 * Matches 图一 account column (quiet labels, one primary number).
 */
export function TradeStackAccountSide({
  nums,
}: {
  nums: TradeStackAccountNums | null;
}) {
  const t = useTranslations("paperRiskBar");
  const tTrade = useTranslations("trading");

  if (!nums) {
    return (
      <aside className="aw-trade-stack-side aw-trade-stack-pad aw-dock-scroll flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain py-3">
        <p className="text-[11px] text-[var(--muted)]">{t("equity")} · —</p>
      </aside>
    );
  }

  const delta = nums.equity - INITIAL_CASH;
  const startNote = tTrade("deskEquitySince", {
    start: `$${money(INITIAL_CASH)}`,
    pnl: `$${money(delta)}`,
    pct: ((delta / INITIAL_CASH) * 100).toFixed(2),
  });

  return (
    <aside className="aw-trade-stack-side aw-trade-stack-pad aw-dock-scroll flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain py-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] font-medium text-[var(--foreground)]">
          {tTrade("paperAccountName")}
        </span>
        <span className="inline-flex h-4 items-center bg-[color-mix(in_srgb,var(--up)_14%,transparent)] px-1 text-[10px] font-semibold leading-none text-[var(--up)]">
          {tTrade("paperBadge")}
        </span>
      </div>

      <div className="min-w-0">
        <div className="text-[11px] leading-none text-[var(--muted)]">
          {t("equity")}
        </div>
        <div className="mt-1.5 text-[20px] font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
          US${money(nums.equity)}
        </div>
        <p className="mt-1 text-[10px] leading-snug text-[var(--muted)]">
          {startNote}
        </p>
      </div>

      <div
        className="my-3 h-px w-full bg-[var(--aw-hairline,var(--border))]"
        aria-hidden
      />

      <Section label={t("cash")} value={`US$${money(nums.cash)}`} />
      <Section
        label={t("exposure")}
        value={`US$${money(nums.gross)}`}
        hint={`${nums.exposurePct.toFixed(2)}%`}
      />
      <Section
        label={t("symbolPct")}
        value={`${nums.symbolPct.toFixed(2)}%`}
        hint={`${t("maxSymbol")} ${nums.maxPct.toFixed(2)}%`}
        warn={nums.nearCap}
      />
      {nums.positionQty !== 0 ? (
        <Section
          label={t("positionQty")}
          value={formatNumber(nums.positionQty, {
            maximumFractionDigits: 4,
          })}
        />
      ) : (
        <Section label={t("positionQty")} value={tTrade("emptyPositions")} muted />
      )}
    </aside>
  );
}

function Section({
  label,
  value,
  hint,
  warn,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="mb-3 min-w-0 last:mb-0">
      <div className="text-[11px] leading-none text-[var(--muted)]">{label}</div>
      <div
        className={`mt-1 truncate text-[13px] font-medium tabular-nums tracking-tight ${
          muted
            ? "text-[var(--muted)]"
            : warn
              ? "text-[color-mix(in_srgb,#ca8a04_90%,var(--foreground))]"
              : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[10px] text-[var(--muted)]">{hint}</div>
      ) : null}
    </div>
  );
}

/**
 * Side-dock desk account strip — one hero number, then a quiet metric row.
 * Same data as the stack left rail; layout fits ~26rem drawer width.
 */
export function TradeStackAccountStrip({
  nums,
}: {
  nums: TradeStackAccountNums | null;
}) {
  const t = useTranslations("paperRiskBar");
  const tTrade = useTranslations("trading");

  if (!nums) {
    return (
      <div className="shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-3.5 py-3">
        <p className="text-[11px] text-[var(--muted)]">{t("equity")} · —</p>
      </div>
    );
  }

  const delta = nums.equity - INITIAL_CASH;
  const pct = (delta / INITIAL_CASH) * 100;
  const pnlTone =
    delta > 0
      ? "text-[var(--up)]"
      : delta < 0
        ? "text-[var(--down)]"
        : "text-[var(--muted)]";
  const pnlText = `${delta >= 0 ? "+" : ""}$${money(delta)} · ${pct.toFixed(2)}%`;

  return (
    <div className="shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-3.5 py-3.5">
      {/* Identity — one quiet line */}
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-medium tracking-tight text-[var(--foreground)]">
          {tTrade("paperAccountName")}
        </span>
        <span className="inline-flex h-4 items-center px-1 text-[10px] font-semibold leading-none text-[var(--up)] bg-[color-mix(in_srgb,var(--up)_12%,transparent)]">
          {tTrade("paperBadge")}
        </span>
      </div>

      {/* Hero — equity only */}
      <div className="mt-3.5 min-w-0">
        <div className="text-[11px] leading-none text-[var(--muted)]">
          {t("equity")}
        </div>
        <div className="mt-2 text-[22px] font-semibold leading-none tabular-nums tracking-tight text-[var(--foreground)]">
          US${money(nums.equity)}
        </div>
        <p className={`mt-1.5 text-[11px] leading-none tabular-nums ${pnlTone}`}>
          {pnlText}
        </p>
      </div>

      {/* Metrics — 2×2, room for CN labels + full money strings */}
      <div
        className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-3.5"
        role="group"
        aria-label={t("equity")}
      >
        <StripMetric label={t("cash")} value={`US$${money(nums.cash)}`} />
        <StripMetric
          label={t("exposure")}
          value={`US$${money(nums.gross)}`}
          hint={`${nums.exposurePct.toFixed(1)}%`}
        />
        <StripMetric
          label={t("symbolPct")}
          value={`${nums.symbolPct.toFixed(1)}%`}
          warn={nums.nearCap}
        />
        <StripMetric
          label={t("positionQty")}
          value={
            nums.positionQty !== 0
              ? formatNumber(nums.positionQty, {
                  maximumFractionDigits: 4,
                })
              : "—"
          }
        />
      </div>
    </div>
  );
}

function StripMetric({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] leading-none text-[var(--muted)]">{label}</div>
      <div
        className={`mt-1.5 truncate text-[13px] font-medium leading-none tabular-nums tracking-tight ${
          warn
            ? "text-[color-mix(in_srgb,#ca8a04_90%,var(--foreground))]"
            : "text-[var(--foreground)]"
        }`}
      >
        {value}
        {hint ? (
          <span className="ml-1.5 text-[11px] font-normal text-[var(--muted)]">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
