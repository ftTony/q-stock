"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type {
  LayoutMode,
  LayoutModuleKey,
  SymbolLayoutPrefs,
} from "@/components/symbol/hooks/use-symbol-layout-prefs";

type Props = {
  open: boolean;
  onClose: () => void;
  prefs: SymbolLayoutPrefs;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onModuleChange: (key: LayoutModuleKey, value: boolean) => void;
  onReset: () => void;
};

const MODULE_ROWS: { key: LayoutModuleKey; labelKey: string }[] = [
  { key: "watchlist", labelKey: "moduleWatchlist" },
  { key: "rail", labelKey: "moduleRail" },
  { key: "chart", labelKey: "moduleChart" },
  { key: "newsDock", labelKey: "moduleNewsDock" },
];

function LayoutThumb({ mode }: { mode: LayoutMode }) {
  if (mode === "stack") {
    // Chart on top + tabbed feed below — must contrast so it doesn't read as a lone mid bar.
    return (
      <div
        className="flex h-16 w-full flex-col overflow-hidden border border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]"
        aria-hidden
      >
        <div className="min-h-0 flex-[5] bg-[color-mix(in_srgb,var(--muted)_14%,var(--panel))]" />
        <div className="flex min-h-0 flex-[3] flex-col border-t-2 border-[var(--aw-hairline,var(--border))]">
          <div className="flex h-2.5 shrink-0 gap-0.5 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--muted)]/15 px-0.5">
            <span className="flex-1 bg-[var(--brand)]/50" />
            <span className="flex-1 bg-[var(--muted)]/35" />
            <span className="flex-1 bg-[var(--muted)]/35" />
            <span className="flex-1 bg-[var(--muted)]/35" />
          </div>
          <div className="min-h-0 flex-1 bg-[color-mix(in_srgb,var(--brand)_8%,var(--panel))]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-16 w-full overflow-hidden border border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]"
      aria-hidden
    >
      <div className="w-[18%] border-r border-[var(--aw-hairline,var(--border))] bg-[var(--muted)]/15" />
      <div className="min-w-0 flex-1 bg-[color-mix(in_srgb,var(--muted)_10%,var(--panel))]" />
      <div className="flex w-[28%] flex-col border-l border-[var(--aw-hairline,var(--border))]">
        <div className="h-1/2 bg-[var(--up)]/35" />
        <div className="h-1/2 bg-[var(--down)]/35" />
      </div>
    </div>
  );
}

function ModuleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-b-0">
      <span className="text-[13px] text-[var(--foreground)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--brand)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/** Workbench-local layout settings: side vs stack + module visibility. */
export function SymbolLayoutSettingsModal({
  open,
  onClose,
  prefs,
  onLayoutModeChange,
  onModuleChange,
  onReset,
}: Props) {
  const t = useTranslations("symbolLayout");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="relative z-10 flex w-full max-w-[26rem] flex-col overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-5 py-3">
          <h2 className="text-[16px] font-semibold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
            aria-label={t("close")}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-4 qt-scroll">
          <section>
            <h3 className="mb-3 text-[13px] font-medium text-[var(--foreground)]">
              {t("tradingPanel")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { mode: "side" as const, labelKey: "presetSide" },
                  { mode: "stack" as const, labelKey: "presetStack" },
                ] as const
              ).map((opt) => {
                const selected = prefs.layoutMode === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => onLayoutModeChange(opt.mode)}
                    className={`flex flex-col gap-2 rounded-none p-2 text-left transition ${
                      selected
                        ? "ring-2 ring-[var(--brand)] ring-offset-0"
                        : "ring-1 ring-[var(--aw-hairline,var(--border))] hover:ring-[var(--muted)]"
                    }`}
                    aria-pressed={selected}
                  >
                    <LayoutThumb mode={opt.mode} />
                    <span className="text-center text-[12px] text-[var(--foreground)]">
                      {t(opt.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            {MODULE_ROWS.map((row) => (
              <ModuleSwitch
                key={row.key}
                label={t(row.labelKey)}
                checked={prefs.modules[row.key]}
                onChange={(next) => onModuleChange(row.key, next)}
              />
            ))}
          </section>
        </div>

        <div className="shrink-0 border-t border-[var(--aw-hairline,var(--border))] p-4">
          <button
            type="button"
            onClick={onReset}
            className="qt-btn flex w-full items-center justify-center gap-2"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 12a9 9 0 0 1 15.5-6.4M21 12a9 9 0 0 1-15.5 6.4" />
              <path d="M3 5v5h5M21 19v-5h-5" />
            </svg>
            {t("reset")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
