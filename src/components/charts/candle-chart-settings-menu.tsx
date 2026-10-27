"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import { usePreference } from "@/components/providers/preference-provider";
import {
  resolveCandleType,
  type ChartUiSettings,
} from "@/components/charts/candle-chart-settings";
import { ChartTypeIcon } from "@/components/charts/candle-chart-type-icons";
import {
  CHART_TYPE_LABEL_KEY,
  CHART_TYPE_OPTIONS,
} from "@/components/charts/candle-chart-type-options";

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
  /** Current period — used for smart default when chartType unset. */
  resolution?: string;
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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-2.5 text-[11px] font-medium tracking-wide text-[var(--muted)]">
      {children}
    </p>
  );
}

function SectionDivider() {
  return <div className="mx-3 my-1 border-t border-[var(--border)]" />;
}

const chipClass =
  "rounded-md border px-2 py-1.5 text-[11px] border-[var(--border)] text-[var(--muted)] data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand-soft)] data-[active=true]:text-[var(--brand-text)]";

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
  resolution = "D",
  onClearDrawings,
  fullscreen,
  onToggleFullscreen,
  toolbar = false,
  iconClassName = "h-[18px] w-[18px]",
}: Props) {
  const t = useTranslations("symbol");
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeChartType = resolveCandleType(settings, resolution);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    function place() {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      setPos({
        top: r.bottom + 6,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const node = e.target as Node;
      if (btnRef.current?.contains(node) || panelRef.current?.contains(node)) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
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

  const panel =
    mounted && open && pos
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t("chartSettings")}
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-[90] w-[15.5rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] py-1 shadow-lg"
          >
            <SectionLabel>{t("chartSettingsDisplay")}</SectionLabel>
            <ToggleRow
              label={t("chartShowTradeMarks")}
              checked={settings.showTradeMarkers}
              onChange={(v) =>
                onSettingsChange({ ...settings, showTradeMarkers: v })
              }
            />

            <SectionDivider />
            <SectionLabel>{t("chartTypeLabel")}</SectionLabel>
            <div className="flex flex-col pb-1">
              {CHART_TYPE_OPTIONS.map((type) => {
                const keys = CHART_TYPE_LABEL_KEY[type];
                const selected = activeChartType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onSettingsChange({ ...settings, chartType: type })
                    }
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--surface-2)] ${
                      selected
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    <ChartTypeIcon
                      type={type}
                      className="h-3.5 w-3.5 shrink-0 opacity-90"
                    />
                    {t(keys.full)}
                  </button>
                );
              })}
            </div>

            <SectionDivider />
            <SectionLabel>{t("chartSettingsColors")}</SectionLabel>
            <div className="flex gap-1.5 px-3 pb-2">
              <button
                type="button"
                onClick={() => setChangeColorScheme("cn")}
                data-active={changeColorScheme === "cn"}
                className={`flex-1 ${chipClass}`}
              >
                {t("chartColorCn")}
              </button>
              <button
                type="button"
                onClick={() => setChangeColorScheme("us")}
                data-active={changeColorScheme === "us"}
                className={`flex-1 ${chipClass}`}
              >
                {t("chartColorUs")}
              </button>
            </div>

            {onFlagToggle ? (
              <>
                <SectionDivider />
                <SectionLabel>{t("indicators")}</SectionLabel>
                <div className="flex flex-wrap gap-1 px-3 pb-2">
                  {INDICATOR_KEYS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onFlagToggle(key)}
                      data-active={flags[key]}
                      className={chipClass}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <SectionDivider />
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="pointer-events-auto relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={t("chartSettings")}
        title={t("chartSettings")}
        aria-expanded={open}
        className={triggerClass}
      >
        <GearIcon className={iconClassName} />
      </button>
      {panel}
    </div>
  );
}
