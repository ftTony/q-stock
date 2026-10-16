"use client";

import { useTranslations } from "next-intl";

type Clause = Record<string, unknown>;

function clauseLine(c: Clause, t: (k: string, v?: Record<string, string | number>) => string): string {
  const type = String(c.type ?? "");
  if (type === "ma_cross") {
    return t("ruleMaCross", {
      fast: Number(c.fast),
      slow: Number(c.slow),
      dir: c.direction === "up" ? t("ruleUp") : t("ruleDown"),
    });
  }
  if (type === "break_high") {
    return t("ruleBreakHigh", { n: Number(c.lookback) });
  }
  if (type === "stop_pct") {
    return t("ruleStopPct", { pct: Number(c.pct) });
  }
  if (type === "take_profit_pct") {
    return t("ruleTakePct", { pct: Number(c.pct) });
  }
  if (type === "hold_bars") {
    return t("ruleHoldBars", { bars: Number(c.bars) });
  }
  if (type === "price_vs_ma") {
    return t("rulePriceVsMa", {
      period: Number(c.period),
      op: c.op === "gt" ? ">" : "<",
    });
  }
  if (type === "price_level") {
    return t("rulePriceLevel", {
      op: String(c.op),
      price: Number(c.price),
    });
  }
  return type || "—";
}

export function StrategyRulesSummary({ rules }: { rules: unknown }) {
  const t = useTranslations("strategies");
  const r = (rules ?? {}) as {
    entry?: Clause[];
    exit?: Clause[];
    sizing?: { mode?: string; notional?: number; riskPercent?: number; qty?: number };
    market?: string;
  };

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          {t("entryRules")}
        </p>
        <ul className="mt-1.5 space-y-1">
          {(r.entry ?? []).map((c, i) => (
            <li
              key={i}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)]/40 px-2.5 py-1.5 text-[12px] leading-snug"
            >
              {clauseLine(c, t)}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          {t("exitRules")}
        </p>
        <ul className="mt-1.5 space-y-1">
          {(r.exit ?? []).map((c, i) => (
            <li
              key={i}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)]/40 px-2.5 py-1.5 text-[12px] leading-snug"
            >
              {clauseLine(c, t)}
            </li>
          ))}
        </ul>
      </div>
      {r.sizing ? (
        <p className="text-[12px] text-[var(--muted)]">
          {t("sizingLine", {
            mode: r.sizing.mode ?? "—",
            detail:
              r.sizing.notional != null
                ? `$${r.sizing.notional}`
                : r.sizing.riskPercent != null
                  ? `${r.sizing.riskPercent}%`
                  : r.sizing.qty != null
                    ? String(r.sizing.qty)
                    : "—",
          })}
        </p>
      ) : null}
    </div>
  );
}
