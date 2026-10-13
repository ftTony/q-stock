"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  DCA_EXAMPLE,
  calcDca,
  type DcaFrequency,
  type DcaInput,
} from "@/lib/tools/dca";
import { CompoundGrowthChart } from "@/components/tools/compound-growth-chart";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function DcaCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<DcaInput>(DCA_EXAMPLE);
  const result = useMemo(() => calcDca(form), [form]);

  function set<K extends keyof DcaInput>(key: K, value: DcaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("dca.contribution")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.contribution}
            onChange={(e) => set("contribution", num(e.target.value))}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("dca.frequency")}>
            <QtSelect
              value={form.frequency}
              onChange={(v) => set("frequency", v as DcaFrequency)}
              aria-label={t("dca.frequency")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={[
                { value: "monthly", label: t("dca.freqMonthly") },
                { value: "biweekly", label: t("dca.freqBiweekly") },
                { value: "weekly", label: t("dca.freqWeekly") },
              ]}
            />
          </Field>
          <Field label={t("dca.periods")}>
            <input
              type="number"
              min={1}
              max={600}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.periods}
              onChange={(e) => set("periods", Math.floor(num(e.target.value, 1)))}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("dca.annualRate")}>
            <input
              type="number"
              step="0.1"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.annualRatePercent}
              onChange={(e) => set("annualRatePercent", num(e.target.value))}
            />
          </Field>
          <Field label={t("dca.initial")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.initialPrincipal}
              onChange={(e) => set("initialPrincipal", num(e.target.value))}
            />
          </Field>
        </div>
        <p className="text-xs text-[var(--muted)]">{t("dca.note")}</p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(DCA_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                contribution: 0,
                frequency: "monthly",
                periods: 12,
                annualRatePercent: 0,
                initialPrincipal: 0,
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
              <p className="text-xs text-[var(--muted)]">{t("dca.resultFv")}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.fv)}
              </p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("dca.resultContributed")}
                value={formatToolNumber(result.totalContributed)}
              />
              <Stat label={t("dca.resultProfit")} value={formatToolNumber(result.profit)} />
              <Stat
                label={t("dca.resultProfitPct")}
                value={`${formatToolNumber(result.profitPct)}%`}
              />
            </dl>
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                {t("dca.chartTitle")}
              </p>
              <CompoundGrowthChart
                years={result.years}
                principal={form.initialPrincipal}
                valueLabel={t("dca.colValue")}
                contributedLabel={t("dca.colContributed")}
                yearLabel={t("dca.colYear")}
              />
            </div>
            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-[var(--muted)] marker:content-none hover:text-[var(--foreground)]">
                <span className="underline-offset-2 group-open:no-underline hover:underline">
                  {t("dca.tableToggle")}
                </span>
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-xs">
                  <thead className="text-[var(--muted)]">
                    <tr>
                      <th className="py-1.5 font-medium">{t("dca.colYear")}</th>
                      <th className="py-1.5 font-medium">
                        {t("dca.colContributed")}
                      </th>
                      <th className="py-1.5 font-medium">{t("dca.colValue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.years.map((row) => (
                      <tr
                        key={row.year}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="py-1.5 tabular-nums">{row.year}</td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.contributed)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t(`dca.errors.${result.error}`)}</p>
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
