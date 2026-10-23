"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  SettingsPanel,
  type SettingsSection,
} from "@/components/settings/settings-panel";

type Props = {
  open: boolean;
  onClose: () => void;
  setupKeys?: boolean;
  onSetupKeysDone?: () => void;
};

const SECTIONS: SettingsSection[] = [
  "general",
  "trading",
  "market",
  "account",
];

function NavIcon({ id }: { id: SettingsSection }) {
  const common = {
    className: "h-4 w-4 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (id === "general") {
    // Sliders / preferences (reference: 通用)
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <circle cx="8" cy="7" r="2.25" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="2.25" fill="currentColor" stroke="none" />
        <circle cx="9" cy="17" r="2.25" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === "trading") {
    return (
      <svg {...common}>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3-4 3 2 4-6" />
      </svg>
    );
  }
  if (id === "market") {
    return (
      <svg {...common}>
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.5-3.2 4-4.8 7-4.8s5.5 1.6 7 4.8" />
    </svg>
  );
}

/** Settings dialog: left category rail + right content (reference layout). */
export function SettingsModal({
  open,
  onClose,
  setupKeys = false,
  onSetupKeysDone,
}: Props) {
  const t = useTranslations("settings");
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState<SettingsSection>(
    setupKeys ? "market" : "general",
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setSection(setupKeys ? "market" : "general");
  }, [open, setupKeys]);

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

  const labels: Record<SettingsSection, string> = {
    general: t("navGeneral"),
    trading: t("navTrading"),
    market: t("navMarket"),
    account: t("navAccount"),
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="relative z-10 flex h-[min(88dvh,40rem)] w-full max-w-[52rem] flex-col overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-5 py-3">
          <h2 className="text-[16px] font-semibold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
            aria-label="Close"
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

        <div className="flex min-h-0 flex-1">
          <nav
            className="flex w-[9.5rem] shrink-0 flex-col gap-0.5 border-r border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]/60 p-2 sm:w-[11rem]"
            aria-label={t("title")}
          >
            {SECTIONS.map((id) => {
              const active = section === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`relative flex items-center gap-2 rounded-none px-2.5 py-2 text-left text-[13px] transition ${
                    active
                      ? "bg-[var(--panel)] font-semibold text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--panel)]/70 hover:text-[var(--foreground)]"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-none bg-[var(--brand)]" />
                  ) : null}
                  <NavIcon id={id} />
                  <span className="truncate">{labels[id]}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-4 qt-scroll sm:px-6">
            <SettingsPanel
              section={section}
              setupKeys={setupKeys}
              onSetupKeysDone={onSetupKeysDone}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
