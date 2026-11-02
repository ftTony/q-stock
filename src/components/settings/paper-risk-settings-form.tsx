"use client";

import { useEffect } from "react";
import {
  Controller,
  useForm,
  type Control,
  type Path,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SettingsHint } from "@/components/settings/settings-hint";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  usePaperRiskSettings,
  useSavePaperRiskSettings,
} from "@/hooks/query/use-trading";
import { DEFAULT_RISK_SETTINGS } from "@/lib/trading/risk-math";
import type { PaperRiskSettingsDto } from "@/lib/trading/paper-risk-settings";

function Row({
  label,
  hint,
  name,
  control,
  min,
  max,
  step = 1,
}: {
  label: string;
  hint: string;
  name: Path<PaperRiskSettingsDto>;
  control: Control<PaperRiskSettingsDto>;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = Number(field.value ?? 0);
        return (
          <div className="border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium tracking-[-0.08px]">
                  {label}
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">
                  {hint}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="h-1.5 w-28 accent-[var(--brand)] sm:w-36"
                />
                <label className="inline-flex items-baseline gap-0.5 text-[13px] tabular-nums tracking-[-0.08px]">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-10 bg-transparent text-right outline-none"
                  />
                  <span className="text-[var(--muted)]">%</span>
                </label>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

type RiskPayload = {
  settings?: PaperRiskSettingsDto;
  dayPnlPct?: number | null;
  circuitBroken?: boolean;
};

export function PaperRiskSettingsForm() {
  const t = useTranslations("paperRisk");
  const tCommon = useTranslations("common");
  const riskQuery = usePaperRiskSettings();
  const saveMut = useSavePaperRiskSettings();
  const remote = riskQuery.data as RiskPayload | undefined;
  const { message, flash, clearFlash } = useFlashMessage();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<PaperRiskSettingsDto>({
    defaultValues: DEFAULT_RISK_SETTINGS,
  });

  useEffect(() => {
    if (remote?.settings) reset(remote.settings);
  }, [remote?.settings, reset]);

  const softOnly = watch("softOnly");
  const ready = Boolean(remote?.settings);
  const dayPnlPct = remote?.dayPnlPct ?? null;
  const circuitBroken = Boolean(remote?.circuitBroken);

  async function onSubmit(values: PaperRiskSettingsDto) {
    clearFlash();
    try {
      const data = (await saveMut.mutateAsync(values)) as RiskPayload & {
        error?: string;
      };
      if (data.settings) reset(data.settings);
      flash("ok", t("saved"));
    } catch (err) {
      flash("error", err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  if (!ready) {
    return <p className="aw-caption py-2">{tCommon("loading")}</p>;
  }

  const pnlLabel =
    dayPnlPct == null
      ? t("dayPnlUnknown")
      : `${t("dayPnl")} ${dayPnlPct >= 0 ? "+" : ""}${dayPnlPct.toFixed(1)}%`;

  return (
    <section className="space-y-1">
      <div className="pb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
          {t("title")}
        </h2>
        <SettingsHint className="mt-2">{t("subtitle")}</SettingsHint>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row
          label={t("maxSymbol")}
          hint={t("maxSymbolHint")}
          name="maxPositionPctPerSymbol"
          control={control}
          min={5}
          max={100}
        />
        <Row
          label={t("maxGross")}
          hint={t("maxGrossHint")}
          name="maxGrossExposurePct"
          control={control}
          min={10}
          max={200}
        />
        <Row
          label={t("maxDailyLoss")}
          hint={t("maxDailyLossHint")}
          name="maxDailyLossPct"
          control={control}
          min={1}
          max={30}
          step={0.5}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] py-3">
          <div>
            <div className="text-[13px] font-medium tracking-[-0.08px]">
              {t("softOnly")}
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">
              {t("softOnlyHint")}
            </p>
          </div>
          <Controller
            name="softOnly"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative h-6 w-11 rounded-full transition ${
                  softOnly ? "bg-[var(--up)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    softOnly ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            )}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-[12px]">
          <span className="text-[var(--muted)]">
            {pnlLabel}
            {" · "}
            {circuitBroken ? (
              <span className="text-[var(--down)]">{t("circuitOn")}</span>
            ) : (
              <span>{t("circuitOff")}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--up)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--up)]" />
            {circuitBroken ? t("statusWarn") : t("statusOk")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--aw-hairline,var(--border))] pt-3">
          <SubmitButton
            loading={isSubmitting || saveMut.isPending}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
          >
            {t("save")}
          </SubmitButton>
          <button
            type="button"
            onClick={() => reset({ ...DEFAULT_RISK_SETTINGS })}
            className={SETTINGS_BTN_GHOST}
          >
            {t("reset")}
          </button>
          <Link
            href="/portfolio"
            className="ml-auto aw-text-link text-[12px]"
          >
            {t("toPortfolio")}
          </Link>
          {message ? (
            <span className="w-full text-[12px] text-[var(--muted)]">
              {message}
            </span>
          ) : null}
        </div>
      </form>

      <p className="border-t border-[var(--aw-hairline,var(--border))] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}
      </p>
    </section>
  );
}
