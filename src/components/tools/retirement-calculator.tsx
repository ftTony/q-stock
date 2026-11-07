"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  RETIREMENT_EXAMPLE,
  calcRetirement,
  type RetirementInput,
} from "@/lib/tools/retirement";
import { RetirementChart } from "@/components/tools/retirement-chart";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function RetirementCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<RetirementInput>(RETIREMENT_EXAMPLE);
  const result = useMemo(() => calcRetirement(form), [form]);

  function set<K extends keyof RetirementInput>(
    key: K,
    value: RetirementInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const short = result.ok && result.gapReal > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-5 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Group title={t("retirement.groupTimeline")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("retirement.currentAge")}>
              <input
                type="number"
                min={16}
                max={100}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.currentAge}
                onChange={(e) =>
                  set("currentAge", Math.floor(num(e.target.value)))
                }
              />
            </Field>
            <Field label={t("retirement.retirementAge")}>
              <input
                type="number"
                min={form.currentAge}
                max={105}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.retirementAge}
                onChange={(e) =>
                  set("retirementAge", Math.floor(num(e.target.value)))
                }
              />
            </Field>
            <Field label={t("retirement.lifeExpectancy")}>
              <input
                type="number"
                min={form.retirementAge + 1}
                max={110}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.lifeExpectancy}
                onChange={(e) =>
                  set("lifeExpectancy", Math.floor(num(e.target.value)))
                }
              />
            </Field>
          </div>
        </Group>

        <Group title={t("retirement.groupSaving")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("retirement.currentSavings")}>
              <input
                type="number"
                min={0}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.currentSavings}
                onChange={(e) => set("currentSavings", num(e.target.value))}
              />
            </Field>
            <Field label={t("retirement.monthlyContribution")}>
              <input
                type="number"
                min={0}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.monthlyContribution}
                onChange={(e) =>
                  set("monthlyContribution", num(e.target.value))
                }
              />
            </Field>
          </div>
        </Group>

        <Group title={t("retirement.groupAssumption")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("retirement.annualReturn")}>
              <input
                type="number"
                step={0.1}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.annualReturnPercent}
                onChange={(e) =>
                  set("annualReturnPercent", num(e.target.value))
                }
              />
            </Field>
            <Field label={t("retirement.inflation")}>
              <input
                type="number"
                step={0.1}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.inflationPercent}
                onChange={(e) => set("inflationPercent", num(e.target.value))}
              />
            </Field>
          </div>
          <Field label={t("retirement.desiredIncome")}>
            <input
              type="number"
              min={0}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.desiredMonthlyIncome}
              onChange={(e) =>
                set("desiredMonthlyIncome", num(e.target.value))
              }
            />
            <p className="pt-1 text-xs leading-relaxed text-[var(--muted)]">
              {t("retirement.desiredHint")}
            </p>
          </Field>
        </Group>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("retirement.note")}{" "}
          <Link
            href="/tools/compound"
            className="underline-offset-2 hover:underline"
          >
            {t("retirement.compareCompound")}
          </Link>
        </p>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(RETIREMENT_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                ...RETIREMENT_EXAMPLE,
                currentSavings: 0,
                monthlyContribution: 0,
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
            <div>
              <p className="text-xs text-[var(--muted)]">
                {t("retirement.resultSustainable")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.sustainableMonthly, 0)}
                <span className="ml-1 text-sm font-normal text-[var(--muted)]">
                  {t("retirement.perMonth")}
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {t("retirement.resultWindow", {
                  retire: form.retirementAge,
                  life: form.lifeExpectancy,
                })}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("retirement.resultCorpus", {
                  age: form.retirementAge,
                })}
                value={formatToolNumber(result.corpusReal, 0)}
                hint={t("retirement.resultCorpusHint")}
              />
              <Stat
                label={t("retirement.resultCorpusNominal")}
                value={formatToolNumber(result.corpusNominal, 0)}
                hint={t("retirement.resultCorpusNominalHint")}
              />
              <Stat
                label={t("retirement.resultContributed")}
                value={formatToolNumber(result.contributed, 0)}
              />
              <Stat
                label={t("retirement.resultGrowth")}
                value={formatToolNumber(result.growth, 0)}
              />
            </dl>

            <div
              className="rounded-xl border px-3.5 py-3"
              style={{
                borderColor: short
                  ? "color-mix(in srgb, var(--danger, #d9534f) 45%, var(--border))"
                  : "color-mix(in srgb, var(--brand) 45%, var(--border))",
                background: short
                  ? "color-mix(in srgb, var(--danger, #d9534f) 8%, transparent)"
                  : "color-mix(in srgb, var(--brand) 8%, transparent)",
              }}
            >
              <p className="text-sm font-medium">
                {short
                  ? t("retirement.gapTitle", {
                      amount: formatToolNumber(result.gapReal, 0),
                    })
                  : t("retirement.surplusTitle", {
                      amount: formatToolNumber(-result.gapReal, 0),
                    })}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                {short
                  ? t("retirement.gapBody", {
                      amount: formatToolNumber(result.extraMonthlyNeeded, 0),
                    })
                  : result.depletionAge === null
                    ? t("retirement.surplusBodyOnTrack", {
                        age: form.lifeExpectancy,
                      })
                    : t("retirement.surplusBodyDepletes", {
                        age: Math.floor(result.depletionAge),
                      })}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-[var(--muted)]">
              <p className="font-medium text-[var(--fg)]">
                {t("retirement.compareTitle")}
              </p>
              <p>
                {t("retirement.compareFourPercent", {
                  amount: formatToolNumber(result.fourPercentMonthly, 0),
                })}
              </p>
              <p>
                {t("retirement.compareRealReturn", {
                  rate: (result.realReturn * 100).toFixed(1),
                })}
              </p>
            </div>

            <RetirementChart
              rows={result.rows}
              retirementAge={form.retirementAge}
              realLabel={t("retirement.chartReal")}
              nominalLabel={t("retirement.chartNominal")}
              retireLabel={t("retirement.chartRetire", {
                age: form.retirementAge,
              })}
              ageLabel={t("retirement.chartAgeUnit")}
            />
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {t("retirement.errors.invalid")}
          </p>
        )}
      </div>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-wide text-[var(--muted)]">
        {title}
      </p>
      {children}
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

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] px-3 py-2.5">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
