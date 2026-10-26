"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import { defaultClause } from "@/components/strategy/strategy-rules-clause-card";
import type { RuleClause, StrategyRules } from "@/lib/strategy/rules";

function Num({
  value,
  disabled,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      className="qt-input h-8 w-20 px-1.5 text-[12px] tabular-nums"
      value={value}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}

const selectTrigger = "h-8 px-2 text-[12px]";

export function StrategyRulesBlockEditModal({
  open,
  title,
  clause,
  typeOptions,
  sizing,
  disabled,
  onClose,
  onClauseChange,
  onSizingChange,
  onRemove,
}: {
  open: boolean;
  title: string;
  clause?: RuleClause | null;
  typeOptions?: RuleClause["type"][];
  sizing?: StrategyRules["sizing"] | null;
  disabled?: boolean;
  onClose: () => void;
  onClauseChange?: (c: RuleClause) => void;
  onSizingChange?: (s: StrategyRules["sizing"]) => void;
  onRemove?: () => void;
}) {
  const t = useTranslations("strategies");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t("blockModalClose")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl"
      >
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-[12px] text-[var(--muted)]">
          {t("blockEditHint")}
        </p>

        <div className="mt-4 space-y-3">
          {clause && typeOptions && onClauseChange ? (
            <ClauseFields
              clause={clause}
              typeOptions={typeOptions}
              disabled={disabled}
              onChange={onClauseChange}
            />
          ) : null}
          {sizing && onSizingChange ? (
            <SizingFields
              sizing={sizing}
              disabled={disabled}
              onChange={onSizingChange}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {onRemove && !disabled ? (
            <button
              type="button"
              className="text-[12px] text-[var(--down)] hover:underline"
              onClick={() => {
                onRemove();
                onClose();
              }}
            >
              {t("rulesRemove")}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
            onClick={onClose}
          >
            {t("blockModalDone")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClauseFields({
  clause,
  typeOptions,
  disabled,
  onChange,
}: {
  clause: RuleClause;
  typeOptions: RuleClause["type"][];
  disabled?: boolean;
  onChange: (c: RuleClause) => void;
}) {
  const t = useTranslations("strategies");
  const typeOpts = typeOptions.map((ty) => ({
    value: ty,
    label: t(`clauseType_${ty}` as "clauseType_ma_cross"),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <QtSelect
        value={clause.type}
        disabled={disabled}
        className="w-[9rem] shrink-0"
        triggerClassName={selectTrigger}
        options={typeOpts}
        onChange={(v) => onChange(defaultClause(v as RuleClause["type"]))}
      />
      {clause.type === "ma_cross" ? (
        <>
          <Num
            value={clause.fast}
            disabled={disabled}
            min={2}
            max={120}
            onChange={(fast) => onChange({ ...clause, fast })}
          />
          <QtSelect
            value={clause.direction}
            disabled={disabled}
            className="w-[5.5rem] shrink-0"
            triggerClassName={selectTrigger}
            options={[
              { value: "up", label: t("ruleUp") },
              { value: "down", label: t("ruleDown") },
            ]}
            onChange={(v) =>
              onChange({ ...clause, direction: v as "up" | "down" })
            }
          />
          <Num
            value={clause.slow}
            disabled={disabled}
            min={3}
            max={250}
            onChange={(slow) => onChange({ ...clause, slow })}
          />
        </>
      ) : null}
      {clause.type === "break_high" ? (
        <Num
          value={clause.lookback}
          disabled={disabled}
          min={2}
          max={120}
          onChange={(lookback) => onChange({ ...clause, lookback })}
        />
      ) : null}
      {clause.type === "price_vs_ma" ? (
        <>
          <QtSelect
            value={clause.op}
            disabled={disabled}
            className="w-[3.75rem] shrink-0"
            triggerClassName={selectTrigger}
            options={[
              { value: "gt", label: ">" },
              { value: "lt", label: "<" },
            ]}
            onChange={(v) => onChange({ ...clause, op: v as "gt" | "lt" })}
          />
          <Num
            value={clause.period}
            disabled={disabled}
            min={2}
            max={250}
            onChange={(period) => onChange({ ...clause, period })}
          />
        </>
      ) : null}
      {clause.type === "hold_bars" ? (
        <Num
          value={clause.bars}
          disabled={disabled}
          min={1}
          max={500}
          onChange={(bars) => onChange({ ...clause, bars })}
        />
      ) : null}
      {clause.type === "stop_pct" || clause.type === "take_profit_pct" ? (
        <>
          <Num
            value={clause.pct}
            disabled={disabled}
            min={0.1}
            max={clause.type === "stop_pct" ? 50 : 200}
            step={0.1}
            onChange={(pct) => onChange({ ...clause, pct })}
          />
          <span className="text-[11px] text-[var(--muted)]">%</span>
        </>
      ) : null}
      {clause.type === "price_level" ? (
        <>
          <QtSelect
            value={clause.op}
            disabled={disabled}
            className="w-[3.75rem] shrink-0"
            triggerClassName={selectTrigger}
            options={[
              { value: "lte", label: "≤" },
              { value: "gte", label: "≥" },
            ]}
            onChange={(v) => onChange({ ...clause, op: v as "lte" | "gte" })}
          />
          <Num
            value={clause.price}
            disabled={disabled}
            min={0.01}
            step={0.01}
            onChange={(price) => onChange({ ...clause, price })}
          />
        </>
      ) : null}
    </div>
  );
}

function SizingFields({
  sizing,
  disabled,
  onChange,
}: {
  sizing: StrategyRules["sizing"];
  disabled?: boolean;
  onChange: (s: StrategyRules["sizing"]) => void;
}) {
  const t = useTranslations("strategies");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <QtSelect
        value={sizing.mode}
        disabled={disabled}
        className="w-[8rem] shrink-0"
        triggerClassName={selectTrigger}
        options={[
          { value: "fixedNotional", label: t("sizingFixedNotional") },
          { value: "riskPercent", label: t("sizingRiskPercent") },
          { value: "fixedQty", label: t("sizingFixedQty") },
        ]}
        onChange={(v) => {
          const mode = v as StrategyRules["sizing"]["mode"];
          if (mode === "fixedNotional") {
            onChange({
              mode,
              notional: sizing.notional ?? 5000,
              maxPositionPct: sizing.maxPositionPct ?? 20,
            });
          } else if (mode === "riskPercent") {
            onChange({
              mode,
              riskPercent: sizing.riskPercent ?? 1,
              maxPositionPct: sizing.maxPositionPct ?? 20,
            });
          } else {
            onChange({
              mode,
              qty: sizing.qty ?? 10,
              maxPositionPct: sizing.maxPositionPct ?? 20,
            });
          }
        }}
      />
      {sizing.mode === "fixedNotional" ? (
        <Num
          value={sizing.notional ?? 5000}
          disabled={disabled}
          min={1}
          onChange={(notional) => onChange({ ...sizing, notional })}
        />
      ) : null}
      {sizing.mode === "riskPercent" ? (
        <>
          <Num
            value={sizing.riskPercent ?? 1}
            disabled={disabled}
            min={0.1}
            max={10}
            step={0.1}
            onChange={(riskPercent) => onChange({ ...sizing, riskPercent })}
          />
          <span className="text-[11px] text-[var(--muted)]">%</span>
        </>
      ) : null}
      {sizing.mode === "fixedQty" ? (
        <Num
          value={sizing.qty ?? 10}
          disabled={disabled}
          min={1}
          onChange={(qty) => onChange({ ...sizing, qty })}
        />
      ) : null}
      <span className="text-[11px] text-[var(--muted)]">{t("rulesMaxPos")}</span>
      <Num
        value={sizing.maxPositionPct ?? 20}
        disabled={disabled}
        min={1}
        max={100}
        onChange={(maxPositionPct) => onChange({ ...sizing, maxPositionPct })}
      />
      <span className="text-[11px] text-[var(--muted)]">%</span>
    </div>
  );
}
