"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  POSITION_EXAMPLE,
  calcPosition,
  type PositionInput,
  type PositionRiskMode,
  type PositionSide,
} from "@/lib/tools/position";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function PositionCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<PositionInput>(POSITION_EXAMPLE);

  const result = useMemo(() => calcPosition(form), [form]);

  function set<K extends keyof PositionInput>(key: K, value: PositionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("position.equity")}>
          <input
            type="number"
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.equity}
            onChange={(e) => set("equity", num(e.target.value))}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("position.riskMode")}>
            <select
              className="qt-input h-10 w-full px-3"
              value={form.riskMode}
              onChange={(e) => set("riskMode", e.target.value as PositionRiskMode)}
            >
              <option value="percent">{t("position.riskModePercent")}</option>
              <option value="amount">{t("position.riskModeAmount")}</option>
            </select>
          </Field>
          {form.riskMode === "percent" ? (
            <Field label={t("position.riskPercent")}>
              <input
                type="number"
                step="0.1"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.riskPercent}
                onChange={(e) => set("riskPercent", num(e.target.value))}
              />
            </Field>
          ) : (
            <Field label={t("position.riskAmount")}>
              <input
                type="number"
                className="qt-input h-10 w-full px-3 tabular-nums"
                value={form.riskAmount}
                onChange={(e) => set("riskAmount", num(e.target.value))}
              />
            </Field>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("position.entry")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.entry}
              onChange={(e) => set("entry", num(e.target.value))}
            />
          </Field>
          <Field label={t("position.stop")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.stop}
              onChange={(e) => set("stop", num(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("position.side")}>
            <select
              className="qt-input h-10 w-full px-3"
              value={form.side}
              onChange={(e) => set("side", e.target.value as PositionSide)}
            >
              <option value="long">{t("position.sideLong")}</option>
              <option value="short">{t("position.sideShort")}</option>
            </select>
          </Field>
          <Field label={t("position.multiplier")}>
            <input
              type="number"
              min={1}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.multiplier}
              onChange={(e) => set("multiplier", num(e.target.value, 1))}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(POSITION_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                equity: 0,
                riskMode: "percent",
                riskPercent: 1,
                riskAmount: 0,
                entry: 0,
                stop: 0,
                side: "long",
                multiplier: 1,
              })
            }
          >
            {t("reset")}
          </button>
        </div>
      </form>

      <div
        className={`rounded-2xl border border-[var(--border)] p-5 sm:p-6 ${
          result.ok ? "bg-[var(--panel)]" : "bg-[var(--surface-2)] opacity-90"
        }`}
      >
        {result.ok ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--muted)]">{t("position.resultQty")}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatToolNumber(result.qty, 0)}
              </p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat label={t("position.resultRiskUsed")} value={formatToolNumber(result.riskUsed)} />
              <Stat
                label={t("position.resultRiskPct")}
                value={`${formatToolNumber(result.riskPctOfEquity)}%`}
              />
              <Stat label={t("position.resultNotional")} value={formatToolNumber(result.notional)} />
              <Stat
                label={t("position.resultPosPct")}
                value={`${formatToolNumber(result.positionPctOfEquity)}%`}
              />
              <Stat
                label={t("position.resultPerUnit")}
                value={formatToolNumber(result.perUnitRisk)}
              />
            </dl>
            <p className="text-xs text-[var(--muted)]">
              {form.side === "long" ? t("position.hintLong") : t("position.hintShort")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {t(`position.errors.${result.error}`)}
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
