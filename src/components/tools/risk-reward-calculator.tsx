"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  RISK_REWARD_EXAMPLE,
  calcRiskReward,
  type RiskRewardInput,
  type RiskRewardSide,
} from "@/lib/tools/risk-reward";
import { QtSelect } from "@/components/ui/qt-select";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function RiskRewardCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<RiskRewardInput>(RISK_REWARD_EXAMPLE);
  const result = useMemo(() => calcRiskReward(form), [form]);

  function set<K extends keyof RiskRewardInput>(
    key: K,
    value: RiskRewardInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="relative z-0 space-y-4 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("riskReward.side")}>
          <QtSelect
            value={form.side}
            onChange={(v) => set("side", v as RiskRewardSide)}
            aria-label={t("riskReward.side")}
            triggerClassName="h-10 px-3 text-[14px]"
            options={[
              { value: "long", label: t("riskReward.sideLong") },
              { value: "short", label: t("riskReward.sideShort") },
            ]}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t("riskReward.entry")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.entry}
              onChange={(e) => set("entry", num(e.target.value))}
            />
          </Field>
          <Field label={t("riskReward.stop")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.stop}
              onChange={(e) => set("stop", num(e.target.value))}
            />
          </Field>
          <Field label={t("riskReward.target")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.target}
              onChange={(e) => set("target", num(e.target.value))}
            />
          </Field>
        </div>
        <Field label={t("riskReward.winRate")}>
          <input
            type="number"
            step="1"
            min={0}
            max={100}
            className="qt-input h-10 w-full px-3 tabular-nums"
            value={form.winRatePercent}
            onChange={(e) => set("winRatePercent", num(e.target.value))}
          />
        </Field>
        <p className="text-xs text-[var(--muted)]">
          {t("riskReward.note")}{" "}
          <Link
            href="/tools/position"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("riskReward.linkPosition")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(RISK_REWARD_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                side: "long",
                entry: 0,
                stop: 0,
                target: 0,
                winRatePercent: 50,
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
                {t("riskReward.resultRatio")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                1 : {formatToolNumber(result.ratio)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {t("riskReward.resultRatioAlt", {
                  n: formatToolNumber(result.ratio),
                })}
              </p>
            </div>
            <RatioBar
              riskLabel={t("riskReward.barRisk")}
              rewardLabel={t("riskReward.barReward")}
              ratio={result.ratio}
            />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("riskReward.resultRisk")}
                value={`${formatToolNumber(result.riskPerUnit)} (${formatToolNumber(result.riskPct)}%)`}
              />
              <Stat
                label={t("riskReward.resultReward")}
                value={`${formatToolNumber(result.rewardPerUnit)} (${formatToolNumber(result.rewardPct)}%)`}
              />
              <Stat
                label={t("riskReward.resultBreakeven")}
                value={`${formatToolNumber(result.breakevenWinRate)}%`}
              />
              <Stat
                label={t("riskReward.resultExpectancy")}
                value={
                  result.expectancy == null
                    ? "—"
                    : formatToolNumber(result.expectancy)
                }
              />
            </dl>
            <p className="text-xs text-[var(--muted)]">
              {form.side === "long"
                ? t("riskReward.hintLong")
                : t("riskReward.hintShort")}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {t(`riskReward.errors.${result.error}`)}
          </p>
        )}
      </div>
    </div>
  );
}

function RatioBar({
  riskLabel,
  rewardLabel,
  ratio,
}: {
  riskLabel: string;
  rewardLabel: string;
  ratio: number;
}) {
  const riskShare = 1 / (1 + ratio);
  const rewardShare = ratio / (1 + ratio);
  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="bg-[color-mix(in_srgb,var(--muted)_55%,transparent)]"
          style={{ width: `${riskShare * 100}%` }}
        />
        <div
          className="bg-[var(--brand)]"
          style={{ width: `${rewardShare * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[color-mix(in_srgb,var(--muted)_55%,transparent)]" />
          {riskLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--brand)]" />
          {rewardLabel}
        </span>
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
