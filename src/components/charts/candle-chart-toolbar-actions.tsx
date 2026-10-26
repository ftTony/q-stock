"use client";

import { useTranslations } from "next-intl";
import { CandleChartSettingsMenu } from "@/components/charts/candle-chart-settings-menu";
import type { ChartUiSettings } from "@/components/charts/candle-chart-settings";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";

type Props = {
  flags: IndicatorFlags;
  onFlagToggle: (key: keyof IndicatorFlags) => void;
  settings: ChartUiSettings;
  onSettingsChange: (next: ChartUiSettings) => void;
  onClearDrawings: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onScreenshot: () => void;
};

const ICON_SHOT = "h-[18px] w-[18px]";
/** Gear / fullscreen optical size (camera glyph reads smaller at same px). */
const ICON_TOOL = "h-[16px] w-[16px]";

function toolClass(active = false) {
  return `inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] ${
    active ? "bg-[var(--brand-soft)] text-[var(--brand-text)]" : ""
  }`;
}

/** Webull-style right cluster: screenshot · settings · fullscreen. */
export function CandleChartToolbarActions({
  flags,
  onFlagToggle,
  settings,
  onSettingsChange,
  onClearDrawings,
  fullscreen,
  onToggleFullscreen,
  onScreenshot,
}: Props) {
  const t = useTranslations("symbol");

  return (
    <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
      <button
        type="button"
        className={toolClass()}
        title={t("chartScreenshot")}
        aria-label={t("chartScreenshot")}
        onClick={onScreenshot}
      >
        <svg
          className={ICON_SHOT}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </button>

      <CandleChartSettingsMenu
        flags={flags}
        onFlagToggle={onFlagToggle}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onClearDrawings={onClearDrawings}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
        toolbar
        iconClassName={ICON_TOOL}
      />

      <button
        type="button"
        className={toolClass(fullscreen)}
        title={fullscreen ? t("exitFullscreen") : t("fullscreen")}
        aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}
        onClick={onToggleFullscreen}
      >
        {fullscreen ? (
          <svg
            className={ICON_TOOL}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg
            className={ICON_TOOL}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>
    </div>
  );
}
