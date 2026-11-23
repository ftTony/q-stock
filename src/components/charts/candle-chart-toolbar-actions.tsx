"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { CandleChartSettingsMenu } from "@/components/charts/candle-chart-settings-menu";
import type { ChartUiSettings } from "@/components/charts/candle-chart-settings";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import type { ChartCaptureMode } from "@/components/charts/candle-chart-screenshot";

type Props = {
  flags: IndicatorFlags;
  onFlagToggle: (key: keyof IndicatorFlags) => void;
  settings: ChartUiSettings;
  onSettingsChange: (next: ChartUiSettings) => void;
  resolution?: string;
  onClearDrawings: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onScreenshot: (
    mode: ChartCaptureMode,
  ) => void | Promise<"ok" | "unsupported" | "failed">;
};

const ICON_SHOT = "h-[18px] w-[18px]";
/** Gear / fullscreen optical size (camera glyph reads smaller at same px). */
const ICON_TOOL = "h-[16px] w-[16px]";

function toolClass(active = false) {
  return `inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] ${
    active ? "bg-[var(--brand-soft)] text-[var(--brand-text)]" : ""
  }`;
}

type MenuPos = { top: number; left: number; minWidth: number };

/** Right cluster: screenshot · fullscreen · settings. */
export function CandleChartToolbarActions({
  flags,
  onFlagToggle,
  settings,
  onSettingsChange,
  resolution,
  onClearDrawings,
  fullscreen,
  onToggleFullscreen,
  onScreenshot,
}: Props) {
  const t = useTranslations("symbol");
  const menuId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [copyHint, setCopyHint] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const minWidth = 200;
      const left = Math.min(
        Math.max(8, r.right - minWidth),
        window.innerWidth - minWidth - 8,
      );
      setPos({ top: r.bottom + 6, left, minWidth });
    };
    place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!copyHint) return;
    const id = window.setTimeout(() => setCopyHint(null), 1800);
    return () => window.clearTimeout(id);
  }, [copyHint]);

  const run = (mode: ChartCaptureMode) => {
    setOpen(false);
    void Promise.resolve(onScreenshot(mode)).then((result) => {
      if (mode !== "copy") return;
      setCopyHint(result === "ok" ? "ok" : "fail");
    });
  };

  return (
    <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-1 lg:pl-2">
      {/* Separate indicator cluster from chrome actions (shot / FS / settings). */}
      <span
        className="mx-1 hidden h-3 w-px shrink-0 bg-[var(--border)] lg:mx-1.5 lg:block"
        aria-hidden
      />
      {/* H5: only settings (owns type / indicators). Shot + FS clutter the period strip. */}
      <div className="relative max-lg:hidden">
        <button
          ref={btnRef}
          type="button"
          className={toolClass(open)}
          title={
            copyHint === "ok"
              ? t("chartScreenshotCopied")
              : copyHint === "fail"
                ? t("chartScreenshotCopyFailed")
                : t("chartScreenshot")
          }
          aria-label={t("chartScreenshot")}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((v) => !v)}
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
        {open &&
          pos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className="z-[80] overflow-hidden border border-[var(--border)] bg-[var(--panel)] py-1 shadow-[var(--shadow-float,0_8px_24px_rgba(0,0,0,0.12))]"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                minWidth: pos.minWidth,
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
                onClick={() => run("download")}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--muted)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                {t("chartScreenshotDownload")}
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
                onClick={() => run("copy")}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--muted)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16V4a2 2 0 0 1 2-2h12" />
                </svg>
                {t("chartScreenshotCopy")}
              </button>
            </div>,
            document.body,
          )}
      </div>

      <button
        type="button"
        className={`${toolClass(fullscreen)} max-lg:hidden`}
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

      <CandleChartSettingsMenu
        flags={flags}
        onFlagToggle={onFlagToggle}
        settings={settings}
        onSettingsChange={onSettingsChange}
        resolution={resolution}
        onClearDrawings={onClearDrawings}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
        toolbar
        iconClassName={ICON_TOOL}
      />
    </div>
  );
}
