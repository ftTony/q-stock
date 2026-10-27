"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import { usePreference } from "@/components/providers/preference-provider";
import type { ChartUiSettings } from "@/components/charts/candle-chart-settings";

const INDICATOR_KEYS = [
  ["ma", "MA"],
  ["ema", "EMA"],
  ["boll", "BOLL"],
  ["rsi", "RSI"],
  ["macd", "MACD"],
] as const;

type Props = {
  flags: IndicatorFlags;
  onFlagToggle?: (key: keyof IndicatorFlags) => void;
  settings: ChartUiSettings;
  onSettingsChange: (next: ChartUiSettings) => void;
  onClearDrawings: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  /** Flat toolbar trigger (Webull-style) instead of floating chip. */
  toolbar?: boolean;
  /** Keep in sync with sibling toolbar icons. */
  iconClassName?: string;
};

function GearIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-[var(--surface-2)]">
      <span className="text-[12px] text-[var(--foreground)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--brand)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-[var(--on-brand,#fff)] shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/** Chart settings gear + dropdown (markers, colors, indicators, tools). */
export function CandleChartSettingsMenu({
  flags,
  onFlagToggle,
  settings,
  onSettingsChange,
  onClearDrawings,
  fullscreen,
  onToggleFullscreen,
  toolbar = false,
  iconClassName = "h-[18px] w-[18px]",
}: Props) {
  const t = useTranslations("symbol");
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass = toolbar
    ? `inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[var(--surface-2)] ${
        open
          ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`
    : `flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm ${
        open
          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
          : "border-[var(--border)]/80 bg-[var(--panel)]/90 text-[var(--muted)] hover:text-[var(--foreground)]"
      }`;

  return (
    <div ref={rootRef} className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chartSettings")}
        title={t("chartSettings")}
        aria-expanded={open}
        className={triggerClass}
      >
        <GearIcon className={iconClassName} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("chartSettings")}
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-[15.5rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] py-1 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
            {t("chartSettingsDisplay")}
          </p>
          <ToggleRow
            label={t("chartShowTradeMarks")}
            checked={settings.showTradeMarkers}
            onChange={(v) =>
              onSettingsChange({ ...settings, showTradeMarkers: v })
            }
          />

          <div className="my-1 border-t border-[var(--border)]" />
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
            {t("chartSettingsColors")}
          </p>
          <div className="flex gap-1.5 px-3 pb-2">
            <button
              type="button"
              onClick={() => setChangeColorScheme("cn")}
              data-active={changeColorScheme === "cn"}
              className="flex-1 rounded-md border px-2 py-1.5 text-[11px] data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand-soft)] data-[active=true]:text-[var(--brand-text)] border-[var(--border)] text-[var(--muted)]"
            >
              {t("chartColorCn")}
            </button>
            <button
              type="button"
              onClick={() => setChangeColorScheme("us")}
              data-active={changeColorScheme === "us"}
              className="flex-1 rounded-md border px-2 py-1.5 text-[11px] data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand-soft)] data-[active=true]:text-[var(--brand-text)] border-[var(--border)] text-[var(--muted)]"
            >
              {t("chartColorUs")}
            </button>
          </div>

          {onFlagToggle ? (
            <>
              <div className="my-1 border-t border-[var(--border)]" />
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {t("indicators")}
              </p>
              <div className="flex flex-wrap gap-1 px-3 pb-2">
                {INDICATOR_KEYS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onFlagToggle(key)}
                    data-active={flags[key]}
                    className="rounded-md border px-2 py-1 text-[11px] data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand-soft)] data-[active=true]:text-[var(--brand-text)] border-[var(--border)] text-[var(--muted)]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="my-1 border-t border-[var(--border)]" />
          <button
            type="button"
            onClick={() => {
              onClearDrawings();
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          >
            {t("drawClear")}
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleFullscreen();
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          >
            {fullscreen ? t("exitFullscreen") : t("fullscreen")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
