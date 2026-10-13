"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import { QtSelect } from "@/components/ui/qt-select";
import { OptionsPayoffChart } from "@/components/tools/options-payoff-chart";
import {
  OPTIONS_EXAMPLE,
  OPTIONS_STRATEGIES,
  calcOptionsPayoff,
  isShortPremiumStrategy,
  type OptionsPayoffInput,
  type OptionsStrategy,
} from "@/lib/tools/options-payoff";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const STRATEGY_LABEL: Record<OptionsStrategy, string> = {
  long_call: "longCall",
  long_put: "longPut",
  short_call: "shortCall",
  short_put: "shortPut",
  covered_call: "coveredCall",
};

const STRATEGY_HINT: Record<OptionsStrategy, string> = {
  long_call: "hintCall",
  long_put: "hintPut",
  short_call: "hintShortCall",
  short_put: "hintShortPut",
  covered_call: "hintCoveredCall",
};

export function OptionsCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<OptionsPayoffInput>(OPTIONS_EXAMPLE);
  const result = useMemo(() => calcOptionsPayoff(form), [form]);

  function set<K extends keyof OptionsPayoffInput>(
    key: K,
    value: OptionsPayoffInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const shortRisk = isShortPremiumStrategy(form.strategy);
  const strategyOptions = useMemo(
    () =>
      OPTIONS_STRATEGIES.map((s) => ({
        value: s,
        label: t(`options.${STRATEGY_LABEL[s]}`),
        group:
          s === "covered_call"
            ? t("options.groupCombo")
            : t("options.groupSingle"),
      })),
    [t],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("options.strategy")}>
          <QtSelect
            value={form.strategy}
            onChange={(v) => set("strategy", v as OptionsStrategy)}
            options={strategyOptions}
            aria-label={t("options.strategy")}
            triggerClassName="h-10 px-3 text-[14px]"
          />
        </Field>
        {shortRisk ? (
          <p className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/8 px-3 py-2 text-xs text-[var(--down)]">
            {t("options.shortRisk")}
          </p>
        ) : null}
        {form.strategy === "covered_call" ? (
          <p className="text-xs text-[var(--muted)]">{t("options.coveredNote")}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("options.spot")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.spot}
              onChange={(e) => set("spot", num(e.target.value))}
            />
          </Field>
          <Field label={t("options.strike")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.strike}
              onChange={(e) => set("strike", num(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("options.premium")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.premium}
              onChange={(e) => set("premium", num(e.target.value))}
            />
          </Field>
          <Field label={t("options.multiplier")}>
            <input
              type="number"
              min={1}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.multiplier}
              onChange={(e) => set("multiplier", num(e.target.value, 1))}
            />
          </Field>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {t("options.note")}{" "}
          <Link
            href="/tools/position"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("options.linkPosition")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(OPTIONS_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                strategy: "long_call",
                spot: 0,
                strike: 0,
                premium: 0,
                multiplier: 100,
              })
            }
          >
            {t("reset")}
          </button>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
        {result.ok ? (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("options.breakeven")}
                value={formatToolNumber(result.breakeven)}
              />
              <Stat
                label={t("options.maxLoss")}
                value={
                  result.maxLoss == null
                    ? t("options.unlimited")
                    : formatToolNumber(result.maxLoss)
                }
              />
              <Stat
                label={t("options.maxGain")}
                value={
                  result.maxGain == null
                    ? t("options.unlimited")
                    : formatToolNumber(result.maxGain)
                }
              />
            </dl>
            <p className="text-xs text-[var(--muted)]">
              {t(`options.${STRATEGY_HINT[form.strategy]}`)}
            </p>
            <OptionsPayoffChart
              points={result.points}
              spot={form.spot}
              breakeven={result.breakeven}
              title={t("options.chartTitle")}
              axisUnderlying={t("options.axisUnderlying")}
              axisPnl={t("options.axisPnl")}
              legendSpot={t("options.legendSpot")}
              legendBreakeven={t("options.legendBreakeven")}
            />
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("options.errors.invalid")}</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block space-y-1.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] px-3 py-2.5">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
    </div>
  );
}
