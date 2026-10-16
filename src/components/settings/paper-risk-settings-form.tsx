"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEFAULT_RISK_SETTINGS } from "@/lib/trading/risk-math";
import type { PaperRiskSettingsDto } from "@/lib/trading/paper-risk-settings";

function Row({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="border-b border-[var(--border)] px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
            {hint}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-1.5 w-28 accent-[var(--brand)] sm:w-36"
          />
          <label className="inline-flex h-8 w-16 items-center justify-end gap-0.5 rounded-md border border-[var(--border)] px-1.5 text-[12px] tabular-nums">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full bg-transparent text-right outline-none"
            />
            <span className="text-[var(--muted)]">%</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function PaperRiskSettingsForm() {
  const t = useTranslations("paperRisk");
  const tCommon = useTranslations("common");
  const [settings, setSettings] = useState<PaperRiskSettingsDto | null>(null);
  const [dayPnlPct, setDayPnlPct] = useState<number | null>(null);
  const [circuitBroken, setCircuitBroken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/trading/risk-settings");
    if (!res.ok) return;
    const data = await res.json();
    setSettings(data.settings);
    setDayPnlPct(data.dayPnlPct ?? null);
    setCircuitBroken(Boolean(data.circuitBroken));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/trading/risk-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || t("saveFailed"));
        return;
      }
      setSettings(data.settings);
      setMsg(t("saved"));
    } finally {
      setBusy(false);
    }
  }

  function resetDefaults() {
    setSettings({ ...DEFAULT_RISK_SETTINGS });
  }

  if (!settings) {
    return (
      <section className="qt-panel p-4 text-sm text-[var(--muted)]">
        {tCommon("loading")}
      </section>
    );
  }

  const pnlLabel =
    dayPnlPct == null
      ? t("dayPnlUnknown")
      : `${t("dayPnl")} ${dayPnlPct >= 0 ? "+" : ""}${dayPnlPct.toFixed(1)}%`;

  return (
    <section className="qt-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-[15px] font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">{t("subtitle")}</p>
      </div>

      <form onSubmit={(e) => void save(e)}>
        <Row
          label={t("maxSymbol")}
          hint={t("maxSymbolHint")}
          value={settings.maxPositionPctPerSymbol}
          onChange={(n) =>
            setSettings((s) =>
              s ? { ...s, maxPositionPctPerSymbol: n } : s,
            )
          }
          min={5}
          max={100}
        />
        <Row
          label={t("maxGross")}
          hint={t("maxGrossHint")}
          value={settings.maxGrossExposurePct}
          onChange={(n) =>
            setSettings((s) => (s ? { ...s, maxGrossExposurePct: n } : s))
          }
          min={10}
          max={200}
        />
        <Row
          label={t("maxDailyLoss")}
          hint={t("maxDailyLossHint")}
          value={settings.maxDailyLossPct}
          onChange={(n) =>
            setSettings((s) => (s ? { ...s, maxDailyLossPct: n } : s))
          }
          min={1}
          max={30}
          step={0.5}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            <div className="text-[13px] font-medium">{t("softOnly")}</div>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              {t("softOnlyHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.softOnly}
            onClick={() =>
              setSettings((s) => (s ? { ...s, softOnly: !s.softOnly } : s))
            }
            className={`relative h-6 w-11 rounded-full transition ${
              settings.softOnly
                ? "bg-[var(--up)]"
                : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                settings.softOnly ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[12px]">
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

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-4 py-3">
          <SubmitButton
            loading={busy}
            loadingLabel={tCommon("loading")}
            className="qt-btn qt-btn-primary h-8 px-3 text-[12px]"
          >
            {t("save")}
          </SubmitButton>
          <button
            type="button"
            onClick={resetDefaults}
            className="qt-btn qt-btn-ghost h-8 px-3 text-[12px]"
          >
            {t("reset")}
          </button>
          <Link
            href="/portfolio"
            className="ml-auto text-[12px] text-[var(--brand-text)] hover:underline"
          >
            {t("toPortfolio")}
          </Link>
          {msg ? (
            <span className="w-full text-[12px] text-[var(--muted)]">{msg}</span>
          ) : null}
        </div>
      </form>

      <p className="border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[11px] text-[var(--muted)]">
        {t("disclaimer")}
      </p>
    </section>
  );
}
