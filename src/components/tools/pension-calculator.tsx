"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  CONTRIBUTION_INDEX_PRESETS,
  PENSION_EXAMPLE,
  calcPension,
  statutoryRetirementAge,
  type PensionInput,
  type PensionSex,
} from "@/lib/tools/pension";
import { PensionAgeChart } from "@/components/tools/pension-age-chart";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pct(v: number, digits = 1) {
  if (!Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function PensionCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<PensionInput>(PENSION_EXAMPLE);
  const result = useMemo(() => calcPension(form), [form]);

  const statutory = statutoryRetirementAge(
    new Date().getFullYear() - form.age,
    form.sex,
  );
  const effectiveAge = form.retirementAge ?? statutory;

  function set<K extends keyof PensionInput>(key: K, value: PensionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // 退休年龄选项：只给「比当前年龄大」的年龄，避免算出负数年限。
  const ageOptions = useMemo(() => {
    const min = Math.ceil(form.age) + 1;
    const list: { value: string; label: string }[] = [
      { value: "auto", label: t("pension.retireAuto", { age: Math.round(statutory) }) },
    ];
    for (let a = Math.max(50, min); a <= 70; a += 1) {
      list.push({ value: String(a), label: `${a}` });
    }
    return list;
  }, [form.age, statutory, t]);

  const indexOptions = useMemo(
    () =>
      CONTRIBUTION_INDEX_PRESETS.map((v) => ({
        value: String(v),
        label: `${v.toFixed(1)}×`,
      })),
    [],
  );

  const sexOptions = [
    { value: "male", label: t("pension.sexMale") },
    { value: "femaleCadre", label: t("pension.sexFemaleCadre") },
    { value: "femaleWorker", label: t("pension.sexFemaleWorker") },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-5 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Group title={t("pension.groupProfile")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.age")}>
              <input
                type="number"
                min={18}
                max={69}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.age}
                onChange={(e) => set("age", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.sex")}>
              <QtSelect
                value={form.sex}
                onChange={(v) => set("sex", v as PensionSex)}
                aria-label={t("pension.sex")}
                triggerClassName="h-10 px-3 text-[14px]"
                options={sexOptions}
              />
            </Field>
          </div>
          <Field label={t("pension.retirementAge")}>
            <QtSelect
              value={form.retirementAge === null ? "auto" : String(form.retirementAge)}
              onChange={(v) =>
                set("retirementAge", v === "auto" ? null : Number(v))
              }
              aria-label={t("pension.retirementAge")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={ageOptions}
            />
          </Field>
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            {t("pension.statutoryHint")}
          </p>
        </Group>

        <Group title={t("pension.groupRecord")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.monthlyBase")}>
              <input
                type="number"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.monthlyBase}
                onChange={(e) => set("monthlyBase", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.index")}>
              <QtSelect
                value={String(form.contributionIndex)}
                onChange={(v) => set("contributionIndex", Number(v))}
                aria-label={t("pension.index")}
                triggerClassName="h-10 px-3 text-[14px]"
                options={indexOptions}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.contributedYears")}>
              <input
                type="number"
                min={0}
                max={45}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.contributedYears}
                onChange={(e) => set("contributedYears", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.accountBalance")}>
              <input
                type="number"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.accountBalance}
                onChange={(e) => set("accountBalance", num(e.target.value))}
              />
            </Field>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            {t("pension.recordHint")}
          </p>
        </Group>

        <Group title={t("pension.groupAssumption")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.socialWage")}>
              <input
                type="number"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.socialAverageWage}
                onChange={(e) => set("socialAverageWage", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.socialGrowth")}>
              <input
                type="number"
                step="0.1"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.socialWageGrowth}
                onChange={(e) => set("socialWageGrowth", num(e.target.value))}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.wageGrowth")}>
              <input
                type="number"
                step="0.1"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.wageGrowth}
                onChange={(e) => set("wageGrowth", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.accountRate")}>
              <input
                type="number"
                step="0.1"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.accountRate}
                onChange={(e) => set("accountRate", num(e.target.value))}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("pension.lifeExpectancy")}>
              <input
                type="number"
                min={Math.ceil(form.age) + 1}
                max={110}
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.lifeExpectancy}
                onChange={(e) => set("lifeExpectancy", num(e.target.value))}
              />
            </Field>
            <Field label={t("pension.indexation")}>
              <input
                type="number"
                step="0.1"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.pensionIndexation}
                onChange={(e) => set("pensionIndexation", num(e.target.value))}
              />
            </Field>
          </div>
        </Group>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("pension.note")}{" "}
          <Link
            href="/tools/compound"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("pension.compareCompound")}
          </Link>
        </p>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(PENSION_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                ...PENSION_EXAMPLE,
                age: 30,
                contributedYears: 0,
                accountBalance: 0,
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
                {t("pension.resultMonthly", { age: Math.round(result.retirementAge) })}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.monthlyTotal)}
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {t("pension.resultReplacement")} {pct(result.replacementRate)}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat label={t("pension.resultBase")} value={formatToolNumber(result.basePension)} />
              <Stat
                label={t("pension.resultAccount")}
                value={formatToolNumber(result.accountPension)}
              />
              <Stat
                label={t("pension.resultAccountBalance")}
                value={formatToolNumber(result.accountBalanceAtRetirement, 0)}
              />
              <Stat
                label={t("pension.resultYears")}
                value={`${formatToolNumber(result.totalContribYears, 1)} ${t("pension.unitYears")}`}
              />
              <Stat
                label={t("pension.resultPayoutMonths")}
                value={`${result.payoutMonths} ${t("pension.unitMonths")}`}
              />
              <Stat
                label={t("pension.resultPaybackAge")}
                value={`${formatToolNumber(result.paybackAge, 1)} ${t("pension.unitAge")}`}
              />
            </dl>

            <div>
              <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                {t("pension.chartTitle")}
              </p>
              <PensionAgeChart
                rows={result.byRetirementAge}
                selectedAge={result.retirementAge}
                monthlyLabel={t("pension.resultMonthlyShort")}
                ageLabel={t("pension.unitAge")}
              />
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                {t("pension.chartHint")}
              </p>
            </div>

            {(result.baseAboveCap || result.belowMinimumYears) && (
              <ul className="space-y-1.5 rounded-xl border border-[var(--border)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--muted)]">
                {result.baseAboveCap ? <li>· {t("pension.warnCap")}</li> : null}
                {result.belowMinimumYears ? (
                  <li>· {t("pension.warnMinYears")}</li>
                ) : null}
              </ul>
            )}

            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-[var(--muted)] marker:content-none hover:text-[var(--foreground)]">
                <span className="underline-offset-2 group-open:no-underline hover:underline">
                  {t("pension.tableToggle")}
                </span>
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[260px] text-left text-xs">
                  <thead className="text-[var(--muted)]">
                    <tr>
                      <th className="py-1.5 font-medium">{t("pension.unitAge")}</th>
                      <th className="py-1.5 font-medium">{t("pension.resultMonthlyShort")}</th>
                      <th className="py-1.5 font-medium">{t("pension.resultReplacement")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.byRetirementAge.map((row) => (
                      <tr key={row.age} className="border-t border-[var(--border)]">
                        <td className="py-1.5 tabular-nums">{row.age}</td>
                        <td className="py-1.5 tabular-nums">
                          {formatToolNumber(row.monthly)}
                        </td>
                        <td className="py-1.5 tabular-nums">{pct(row.replacement)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              {t("pension.lifetimeNote", {
                total: formatToolNumber(result.lifetimePayout, 0),
                months: result.payoutTotalMonths,
                age: Math.round(result.retirementAge),
                end: Math.round(result.retirementAge + result.payoutTotalMonths / 12),
              })}
            </p>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              {t("pension.contributionNote", {
                personal: formatToolNumber(result.personalContributed, 0),
                employer: formatToolNumber(result.employerContributed, 0),
              })}
            </p>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              {t("pension.effectiveAgeNote", {
                age: formatToolNumber(effectiveAge, 1),
              })}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("pension.errors.invalid")}</p>
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
    <fieldset className="space-y-3">
      <legend className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {title}
      </legend>
      {children}
    </fieldset>
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
