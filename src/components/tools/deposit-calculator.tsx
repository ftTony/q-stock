"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  DEPOSIT_EXAMPLE,
  DEPOSIT_RATE_REFERENCE,
  calcDeposit,
  type DepositInput,
} from "@/lib/tools/deposit";
import { DepositGrowthChart } from "@/components/tools/deposit-growth-chart";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pct(v: number, digits = 2) {
  if (!Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

const TERMS = [3, 6, 12, 24, 36, 60];

export function DepositCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<DepositInput>(DEPOSIT_EXAMPLE);
  const result = useMemo(() => calcDeposit(form), [form]);

  function set<K extends keyof DepositInput>(key: K, value: DepositInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const termOptions = TERMS.map((m) => ({
    value: String(m),
    label: t(`deposit.term${m}`),
  }));

  function changeTerm(months: number) {
    const ref = DEPOSIT_RATE_REFERENCE.find((r) => r.months === months);
    setForm((prev) => ({
      ...prev,
      termMonths: months,
      // 换存期时把利率带成该期限的挂牌参考值，避免「3 年期配 0.65%」这种错配。
      annualRatePercent: ref ? ref.rate : prev.annualRatePercent,
    }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("deposit.principal")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.principal}
            onChange={(e) => set("principal", num(e.target.value))}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("deposit.term")}>
            <QtSelect
              value={String(form.termMonths)}
              onChange={(v) => changeTerm(Number(v))}
              aria-label={t("deposit.term")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={termOptions}
            />
          </Field>
          <Field label={t("deposit.rate")}>
            <input
              type="number"
              step="0.05"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.annualRatePercent}
              onChange={(e) => set("annualRatePercent", num(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("deposit.holdYears")}>
            <input
              type="number"
              step="1"
              min={1}
              max={50}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.holdYears}
              onChange={(e) => set("holdYears", num(e.target.value))}
            />
          </Field>
          <Field label={t("deposit.inflation")}>
            <input
              type="number"
              step="0.1"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.inflationPercent}
              onChange={(e) => set("inflationPercent", num(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("deposit.earlyMonth")}>
            <input
              type="number"
              min={0}
              max={form.holdYears * 12}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.earlyWithdrawMonth}
              onChange={(e) => set("earlyWithdrawMonth", num(e.target.value))}
            />
          </Field>
          <Field label={t("deposit.demandRate")}>
            <input
              type="number"
              step="0.01"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.demandRatePercent}
              onChange={(e) => set("demandRatePercent", num(e.target.value))}
            />
          </Field>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {t("deposit.earlyHint")}
        </p>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("deposit.note")}{" "}
          <Link
            href="/tools/compound"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("deposit.compareCompound")}
          </Link>
        </p>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(DEPOSIT_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                ...DEPOSIT_EXAMPLE,
                principal: 50_000,
                termMonths: 12,
                annualRatePercent: 0.95,
                holdYears: 1,
                earlyWithdrawMonth: 0,
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
                {t("deposit.resultInterest")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.maturityInterest)}
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {t("deposit.resultValue")} {formatToolNumber(result.maturityValue)}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat label={t("deposit.resultNominal")} value={pct(result.nominalAnnual, 3)} />
              <Stat label={t("deposit.resultReal")} value={pct(result.realAnnual, 3)} />
              <Stat
                label={t("deposit.resultRealValue")}
                value={formatToolNumber(result.realValue, 0)}
              />
              <Stat
                label={t("deposit.resultRealGain")}
                value={formatToolNumber(result.realGain, 0)}
              />
            </dl>

            {result.earlyApplies ? (
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--down)_45%,var(--border))] px-3.5 py-3">
                <p className="text-xs font-medium">
                  {t("deposit.earlyTitle", { month: form.earlyWithdrawMonth })}
                </p>
                <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-[var(--muted)]">{t("deposit.earlyInterest")}</dt>
                    <dd className="tabular-nums">
                      {formatToolNumber(result.earlyInterest)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-[var(--muted)]">{t("deposit.earlyLoss")}</dt>
                    <dd className="tabular-nums text-[var(--down)]">
                      −{formatToolNumber(result.earlyLoss)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                  {t("deposit.earlyLossRatio", { ratio: pct(result.earlyLossRatio, 1) })}
                </p>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                {t("deposit.chartTitle")}
              </p>
              <DepositGrowthChart
                rows={result.years}
                principal={form.principal}
                valueLabel={t("deposit.resultValue")}
                principalLabel={t("deposit.principal")}
                yearLabel={t("deposit.unitYear")}
              />
            </div>

            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-[var(--muted)] marker:content-none hover:text-[var(--foreground)]">
                <span className="underline-offset-2 group-open:no-underline hover:underline">
                  {t("deposit.tableToggle")}
                </span>
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[260px] text-left text-xs">
                  <thead className="text-[var(--muted)]">
                    <tr>
                      <th className="py-1.5 font-medium">{t("deposit.unitYear")}</th>
                      <th className="py-1.5 font-medium">{t("deposit.resultValue")}</th>
                      <th className="py-1.5 font-medium">{t("deposit.resultInterest")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.years.map((row) => (
                      <tr key={row.year} className="border-t border-[var(--border)]">
                        <td className="py-1.5 tabular-nums">{row.year}</td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.value)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.interest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              {t("deposit.holdNote", {
                rolls: result.rollCount,
                value: formatToolNumber(result.holdValue),
                interest: formatToolNumber(result.holdInterest),
              })}
            </p>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              {t("deposit.demandNote", {
                interest: formatToolNumber(result.demandInterest),
              })}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("deposit.errors.invalid")}</p>
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
