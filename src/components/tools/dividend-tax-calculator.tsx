"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  DIVIDEND_TAX_EXAMPLE,
  calcDividendTax,
  type DividendMarket,
  type DividendResidence,
  type DividendTaxInput,
} from "@/lib/tools/dividend-tax";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const US_RATES = [30, 15, 10] as const;

export function DividendTaxCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<DividendTaxInput>(DIVIDEND_TAX_EXAMPLE);
  const result = useMemo(() => calcDividendTax(form), [form]);

  function set<K extends keyof DividendTaxInput>(
    key: K,
    value: DividendTaxInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const mainland = form.residence === "mainland";
  const isAShare = form.market === "a-share";
  const isUs = form.market === "us";

  const activeKey = !result.ok
    ? null
    : isAShare
      ? mainland
        ? result.aShareTier === "long"
          ? "aShareLong"
          : result.aShareTier === "mid"
            ? "aShareMid"
            : "aShareShort"
        : "aShareConnect"
      : form.market === "hk-h"
        ? mainland
          ? "hkH"
          : "hkHoverseas"
        : form.market === "hk-red-chip"
          ? mainland
            ? "hkRedChip"
            : "hkRedChipOverseas"
          : form.usWithholdingPercent >= 30
            ? "usNoTreaty"
            : "usTreaty";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("dividendTax.residence")}>
          <QtSelect
            value={form.residence}
            onChange={(v) => set("residence", v as DividendResidence)}
            aria-label={t("dividendTax.residence")}
            triggerClassName="h-10 px-3 text-[14px]"
            options={[
              {
                value: "mainland",
                label: t("dividendTax.residenceMainland"),
              },
              {
                value: "overseas",
                label: t("dividendTax.residenceOverseas"),
              },
            ]}
          />
          <p className="pt-1 text-xs leading-relaxed text-[var(--muted)]">
            {t("dividendTax.residenceHint")}
          </p>
        </Field>

        <Field label={t("dividendTax.gross")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.grossDividend}
            onChange={(e) => set("grossDividend", num(e.target.value))}
          />
        </Field>

        <Field label={t("dividendTax.market")}>
          <QtSelect
            value={form.market}
            onChange={(v) => set("market", v as DividendMarket)}
            aria-label={t("dividendTax.market")}
            triggerClassName="h-10 px-3 text-[14px]"
            options={[
              {
                value: "a-share",
                label: mainland
                  ? t("dividendTax.marketAShare")
                  : t("dividendTax.marketAShareConnect"),
              },
              { value: "hk-h", label: t("dividendTax.marketHkH") },
              {
                value: "hk-red-chip",
                label: t("dividendTax.marketHkRedChip"),
              },
              { value: "us", label: t("dividendTax.marketUs") },
            ]}
          />
        </Field>

        {isAShare && mainland ? (
          <Field label={t("dividendTax.holdingDays")}>
            <input
              type="number"
              min={0}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.holdingDays}
              onChange={(e) =>
                set("holdingDays", Math.floor(num(e.target.value)))
              }
            />
            <p className="pt-1 text-xs text-[var(--muted)]">
              {t("dividendTax.holdingHint")}
            </p>
          </Field>
        ) : null}

        {isUs ? (
          <Field label={t("dividendTax.treatyRate")}>
            <QtSelect
              value={String(form.usWithholdingPercent)}
              onChange={(v) => set("usWithholdingPercent", Number(v))}
              aria-label={t("dividendTax.treatyRate")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={US_RATES.map((rate) => ({
                value: String(rate),
                label: t(`dividendTax.usRate${rate}`),
              }))}
            />
            <p className="pt-1 text-xs leading-relaxed text-[var(--muted)]">
              {t("dividendTax.treatyHint")}
            </p>
          </Field>
        ) : null}

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {mainland ? t("dividendTax.note") : t("dividendTax.noteOverseas")}
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(DIVIDEND_TAX_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                grossDividend: 10_000,
                residence: "mainland",
                market: "a-share",
                holdingDays: 400,
                usWithholdingPercent: 10,
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
                {t("dividendTax.resultNet")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatToolNumber(result.net)}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("dividendTax.resultTax")}
                value={formatToolNumber(result.totalTax)}
              />
              <Stat
                label={t("dividendTax.resultRate")}
                value={`${formatToolNumber(result.effectiveRate * 100, 1)}%`}
              />
            </dl>

            <div className="space-y-1.5 text-xs text-[var(--muted)]">
              <p className="font-medium text-[var(--fg)]">
                {t("dividendTax.breakdownTitle")}
              </p>
              {result.corporateRate > 0 ? (
                <p>
                  {t("dividendTax.breakdownCorporate")} ·{" "}
                  {formatToolNumber(result.corporateRate * 100, 0)}% ={" "}
                  {formatToolNumber(result.corporateWithholding)}
                </p>
              ) : null}
              {result.personalRate > 0 ? (
                <p>
                  {isUs
                    ? t("dividendTax.breakdownWithholding")
                    : t("dividendTax.breakdownPersonal")}{" "}
                  · {formatToolNumber(result.personalRate * 100, 0)}% ={" "}
                  {formatToolNumber(result.individualTax)}
                </p>
              ) : (
                <p>{t("dividendTax.breakdownNone")}</p>
              )}
              {result.aShareTier ? (
                <p className="pt-0.5 text-[var(--fg)]">
                  {result.aShareTier === "long"
                    ? t("dividendTax.tierLong")
                    : result.aShareTier === "mid"
                      ? t("dividendTax.tierMid")
                      : t("dividendTax.tierShort")}
                </p>
              ) : null}
              {!mainland && isAShare ? (
                <p className="pt-0.5 text-[var(--fg)]">
                  {t("dividendTax.tierConnect")}
                </p>
              ) : null}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                {t("dividendTax.compareTitle")}
              </p>
              <ul className="space-y-2">
                {result.comparison.map((row) => {
                  const active = row.key === activeKey;
                  return (
                    <li key={row.key} className="flex items-center gap-2">
                      <span
                        className={`w-[9.5rem] shrink-0 truncate text-xs ${
                          active
                            ? "font-medium text-[var(--fg)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {t(`dividendTax.scenario.${row.key}`)}
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${Math.max(4, (row.net / result.gross) * 100)}%`,
                            background: active
                              ? "var(--brand)"
                              : "color-mix(in srgb, var(--brand) 32%, transparent)",
                          }}
                        />
                      </span>
                      <span
                        className={`w-16 shrink-0 text-right text-xs tabular-nums ${
                          active
                            ? "font-medium text-[var(--fg)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {formatToolNumber(row.net)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {t("dividendTax.errors.invalid")}
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
