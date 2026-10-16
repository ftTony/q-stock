"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  POSITION_EXAMPLE,
  calcPosition,
  type PositionInput,
  type PositionRiskMode,
  type PositionSide,
} from "@/lib/tools/position";
import { QtSelect } from "@/components/ui/qt-select";
import type { AssetType } from "@/lib/types";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function initialFromQuery(sp: URLSearchParams): PositionInput {
  const base = { ...POSITION_EXAMPLE };
  const equity = num(sp.get("equity") ?? "");
  const entry = num(sp.get("entry") ?? "");
  const stop = num(sp.get("stop") ?? "");
  if (equity > 0) base.equity = equity;
  if (entry > 0) base.entry = entry;
  if (stop > 0) base.stop = stop;
  return base;
}

export function PositionCalculator() {
  const t = useTranslations("tools");
  const searchParams = useSearchParams();
  const [form, setForm] = useState<PositionInput>(() =>
    initialFromQuery(searchParams),
  );
  const symbol = (searchParams.get("symbol") || "").toUpperCase();
  const assetType = (searchParams.get("assetType") || "stock") as AssetType;

  const result = useMemo(() => calcPosition(form), [form]);

  function set<K extends keyof PositionInput>(key: K, value: PositionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
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
            <QtSelect
              value={form.riskMode}
              onChange={(v) => set("riskMode", v as PositionRiskMode)}
              aria-label={t("position.riskMode")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={[
                {
                  value: "percent",
                  label: t("position.riskModePercent"),
                },
                {
                  value: "amount",
                  label: t("position.riskModeAmount"),
                },
              ]}
            />
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
            <QtSelect
              value={form.side}
              onChange={(v) => set("side", v as PositionSide)}
              aria-label={t("position.side")}
              triggerClassName="h-10 px-3 text-[14px]"
              options={[
                { value: "long", label: t("position.sideLong") },
                { value: "short", label: t("position.sideShort") },
              ]}
            />
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
            {symbol ? (
              <Link
                href={`/symbol/${assetType}/${encodeURIComponent(symbol)}?qty=${result.qty}&entry=${form.entry}&invalidation=${form.stop}`}
                className="qt-btn qt-btn-primary inline-flex h-9 items-center px-3.5 text-sm"
              >
                {t("position.applyPaper")}
              </Link>
            ) : null}
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
