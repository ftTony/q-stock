"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useMounted } from "@/hooks/use-mounted";
import {
  DEFAULT_OPTION_CHAIN_PREFS,
  OPTION_CHAIN_COL_KEYS,
  OPTION_CHAIN_ROW_LIMITS,
  type OptionChainColKey,
  type OptionChainPrefs,
  type OptionChainRowLimit,
} from "./option-chain-prefs";

function GearIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

type Props = {
  prefs: OptionChainPrefs;
  onChange: (next: OptionChainPrefs) => void;
};

/**
 * Gear in the option-chain toolbar: toggle columns + ATM row window.
 */
export function OptionChainSettings({ prefs, onChange }: Props) {
  const t = useTranslations("symbol");
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function place() {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = 260;
      let left = r.right - width;
      if (left < 8) left = 8;
      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - 8 - width);
      }
      setPos({ top: r.bottom + 6, left });
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
      const n = e.target as Node;
      if (btnRef.current?.contains(n) || menuRef.current?.contains(n)) return;
      setOpen(false);
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

  function toggleCol(key: OptionChainColKey) {
    const has = prefs.cols.includes(key);
    if (has && prefs.cols.length <= 1) return;
    const cols = has
      ? prefs.cols.filter((c) => c !== key)
      : [...prefs.cols, key];
    onChange({ ...prefs, cols });
  }

  function setRows(rowLimit: OptionChainRowLimit) {
    onChange({ ...prefs, rowLimit });
  }

  const menu =
    mounted && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={t("optChainSettings")}
            style={{ top: pos.top, left: pos.left, width: 260 }}
            className="qt-portal-shell fixed z-[80] max-h-[min(70vh,28rem)] overflow-auto rounded-[var(--radius)] border border-[var(--border)] !bg-[var(--panel)] py-2 shadow-[0_12px_40px_rgba(15,23,42,0.16)] qt-scroll"
          >
            <p className="px-3 pb-1.5 text-[11px] font-medium text-[var(--muted)]">
              {t("optChainRows")}
            </p>
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {OPTION_CHAIN_ROW_LIMITS.map((n) => {
                const on = prefs.rowLimit === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRows(n)}
                    className={`rounded-none border px-2 py-1 text-[11px] transition ${
                      on
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {n === 0
                      ? t("optChainRowsAll")
                      : t("optChainRowsAround", { n })}
                  </button>
                );
              })}
            </div>

            <div className="mx-3 my-1 border-t border-[var(--border)]" />

            <p className="px-3 pb-1.5 pt-1 text-[11px] font-medium text-[var(--muted)]">
              {t("optChainCols")}
            </p>
            <ul className="px-1.5">
              {OPTION_CHAIN_COL_KEYS.map((key) => {
                const checked = prefs.cols.includes(key);
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-[12px] hover:bg-[var(--sidebar-hover)]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCol(key)}
                        className="accent-[var(--brand)]"
                      />
                      <span className="text-[var(--foreground)]">
                        {t(`optCol.${key}`)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="mx-3 my-1 border-t border-[var(--border)]" />
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_OPTION_CHAIN_PREFS })}
              className="mx-2 mb-0.5 w-[calc(100%-1rem)] rounded-none px-2 py-1.5 text-left text-[12px] text-[var(--muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
            >
              {t("optChainReset")}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={t("optChainSettings")}
        aria-expanded={open || undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] ${
          open ? "bg-[var(--brand-soft)] text-[var(--brand-text)]" : ""
        }`}
      >
        <GearIcon />
      </button>
      {menu}
    </>
  );
}
