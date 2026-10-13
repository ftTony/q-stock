"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  MORTGAGE_EXAMPLE,
  calcMortgage,
  type MortgageInput,
  type MortgageMethod,
} from "@/lib/tools/mortgage";
import { MortgageBalanceChart } from "@/components/tools/mortgage-balance-chart";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function MortgageCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<MortgageInput>(MORTGAGE_EXAMPLE);
  const result = useMemo(() => calcMortgage(form), [form]);

  function set<K extends keyof MortgageInput>(
    key: K,
    value: MortgageInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("mortgage.principal")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.principal}
            onChange={(e) => set("principal", num(e.target.value))}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("mortgage.annualRate")}>
            <input
              type="number"
              step="0.01"
              min={0}
              max={30}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.annualRatePercent}
              onChange={(e) => set("annualRatePercent", num(e.target.value))}
            />
          </Field>
          <Field label={t("mortgage.years")}>
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.years}
              onChange={(e) => set("years", Math.floor(num(e.target.value, 1)))}
            />
          </Field>
        </div>
        <Field label={t("mortgage.method")}>
          <QtSelect
            value={form.method}
            onChange={(v) => set("method", v as MortgageMethod)}
            aria-label={t("mortgage.method")}
            triggerClassName="h-10 px-3 text-[14px]"
            options={[
              {
                value: "equal_payment",
                label: t("mortgage.methodEqualPayment"),
              },
              {
                value: "equal_principal",
                label: t("mortgage.methodEqualPrincipal"),
              },
            ]}
          />
        </Field>
        <p className="text-xs text-[var(--muted)]">
          {t("mortgage.note")}{" "}
          <Link
            href="/tools/compound"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("mortgage.linkCompound")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(MORTGAGE_EXAMPLE)}
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
                method: "equal_payment",
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
                {form.method === "equal_payment"
                  ? t("mortgage.resultMonthly")
                  : t("mortgage.resultFirstMonthly")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.monthlyPayment)}
              </p>
              {form.method === "equal_principal" ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {t("mortgage.resultLastMonthly")}:{" "}
                  <span className="tabular-nums text-[var(--foreground)]">
                    {formatToolNumber(result.lastPayment)}
                  </span>
                </p>
              ) : null}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("mortgage.resultInterest")}
                value={formatToolNumber(result.totalInterest)}
              />
              <Stat
                label={t("mortgage.resultTotal")}
                value={formatToolNumber(result.totalPayment)}
              />
              <Stat
                label={t("mortgage.resultMonths")}
                value={String(result.months)}
              />
              <Stat
                label={t("mortgage.resultPrincipal")}
                value={formatToolNumber(form.principal)}
              />
            </dl>
            <p className="text-xs text-[var(--muted)]">
              {form.method === "equal_payment"
                ? t("mortgage.hintEqualPayment")
                : t("mortgage.hintEqualPrincipal")}
            </p>
            <MortgageBalanceChart
              years={result.years}
              principal={form.principal}
              balanceLabel={t("mortgage.colBalance")}
              yearLabel={t("mortgage.colYear")}
              chartTitle={t("mortgage.chartTitle")}
            />
            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-[var(--muted)] marker:content-none hover:text-[var(--foreground)]">
                <span className="underline-offset-2 group-open:no-underline hover:underline">
                  {t("mortgage.tableToggle")}
                </span>
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-xs">
                  <thead className="text-[var(--muted)]">
                    <tr>
                      <th className="py-1.5 font-medium">
                        {t("mortgage.colYear")}
                      </th>
                      <th className="py-1.5 font-medium">
                        {t("mortgage.colPrincipalPaid")}
                      </th>
                      <th className="py-1.5 font-medium">
                        {t("mortgage.colInterestPaid")}
                      </th>
                      <th className="py-1.5 font-medium">
                        {t("mortgage.colBalance")}
                      </th>
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
                          {formatToolNumber(row.principalPaid)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.interestPaid)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {t("mortgage.errors.invalid")}
          </p>
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
