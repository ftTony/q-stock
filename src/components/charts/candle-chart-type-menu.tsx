"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { ChartCandleType } from "@/components/charts/candle-chart-settings";
import { ChartTypeIcon } from "@/components/charts/candle-chart-type-icons";
import {
  CHART_TYPE_LABEL_KEY,
  CHART_TYPE_OPTIONS,
} from "@/components/charts/candle-chart-type-options";

type Props = {
  value: ChartCandleType;
  onChange: (type: ChartCandleType) => void;
};

function ChevronDown({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Toolbar dropdown for chart style (candle / area / …). */
export function CandleChartTypeMenu({ value, onChange }: Props) {
  const t = useTranslations("symbol");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const labelKeys = CHART_TYPE_LABEL_KEY[value];

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
      setPos({ top: r.bottom + 6, left: r.left });
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
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // click (not mousedown) so the opening click does not immediately close
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    mounted && open && pos
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            aria-label={t("chartTypeLabel")}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[90] min-w-[9rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] py-1 shadow-lg"
          >
            {CHART_TYPE_OPTIONS.map((type) => {
              const keys = CHART_TYPE_LABEL_KEY[type];
              const selected = type === value;
              return (
                <li key={type} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition hover:bg-[var(--surface-2)] ${
                      selected
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                        : "text-[var(--foreground)]"
                    }`}
                    onClick={() => {
                      onChange(type);
                      setOpen(false);
                    }}
                  >
                    <ChartTypeIcon
                      type={type}
                      className="h-3.5 w-3.5 shrink-0 opacity-90"
                    />
                    {t(keys.full)}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        className="aw-toolbar-btn inline-flex items-center gap-0.5"
        data-active={open || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("chartTypeLabel")}
        title={t(labelKeys.full)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <ChartTypeIcon
          type={value}
          className="h-3.5 w-3.5 shrink-0 opacity-90"
        />
        <span>{t(labelKeys.short)}</span>
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {menu}
    </div>
  );
}
