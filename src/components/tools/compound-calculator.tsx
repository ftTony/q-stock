"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  COMPOUND_EXAMPLE,
  calcCompound,
  type CompoundFrequency,
  type CompoundInput,
} from "@/lib/tools/compound";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function CompoundCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<CompoundInput>(COMPOUND_EXAMPLE);
  const result = useMemo(() => calcCompound(form), [form]);

  function set<K extends keyof CompoundInput>(key: K, value: CompoundInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("compound.principal")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.principal}
            onChange={(e) => set("principal", num(e.target.value))}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("compound.annualRate")}>
            <input
              type="number"
              step="0.1"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.annualRatePercent}
              onChange={(e) => set("annualRatePercent", num(e.target.value))}
            />
          </Field>
          <Field label={t("compound.years")}>
            <input
              type="number"
              step="0.5"
              min={0.5}
              max={50}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.years}
              onChange={(e) => set("years", num(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("compound.frequency")}>
            <select
              className="qt-input h-10 w-full px-3"
              value={form.compoundFrequency}
              onChange={(e) =>
                set("compoundFrequency", e.target.value as CompoundFrequency)
              }
            >
              <option value="annual">{t("compound.freqAnnual")}</option>
              <option value="semiannual">{t("compound.freqSemiannual")}</option>
              <option value="quarterly">{t("compound.freqQuarterly")}</option>
              <option value="monthly">{t("compound.freqMonthly")}</option>
            </select>
          </Field>
          <Field label={t("compound.contribution")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.contribution}
              onChange={(e) => set("contribution", num(e.target.value))}
            />
          </Field>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {t("compound.note")}{" "}
          <Link href="/tools/dca" className="text-[var(--brand-text)] hover:underline">
            {t("compound.compareDca")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(COMPOUND_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                principal: 0,
                annualRatePercent: 0,
                years: 1,
                compoundFrequency: "annual",
                contribution: 0,
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
              <p className="text-xs text-[var(--muted)]">{t("compound.resultFv")}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.fv)}
              </p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("compound.resultContributed")}
                value={formatToolNumber(result.totalContributed)}
              />
              <Stat label={t("compound.resultProfit")} value={formatToolNumber(result.profit)} />
              <Stat
                label={t("compound.resultMultiple")}
                value={`${formatToolNumber(result.multiple)}x`}
              />
              <Stat
                label={t("compound.resultSimple")}
                value={formatToolNumber(result.simpleInterestApprox)}
              />
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[240px] text-left text-xs">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="py-1.5 font-medium">{t("compound.colYear")}</th>
                    <th className="py-1.5 font-medium">{t("compound.colValue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.years.map((row) => (
                    <tr key={row.year} className="border-t border-[var(--border)]">
                      <td className="py-1.5 tabular-nums">{row.year}</td>
                      <td className="py-1.5 tabular-nums">
                        {formatToolNumber(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("compound.errors.invalid")}</p>
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
    <label className="block space-y-1.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </label>
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
