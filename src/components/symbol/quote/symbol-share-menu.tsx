"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type Props = {
  symbol: string;
  price: number | null;
  changePct: number | null;
};

function shareText(symbol: string, price: number | null, changePct: number | null) {
  const px = price != null ? price.toFixed(2) : "—";
  const ch =
    changePct != null
      ? ` (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)`
      : "";
  return `${symbol} ${px}${ch} · Qianli Gu`;
}

const tileClass =
  "flex flex-col items-center justify-center gap-1.5 rounded-none border border-[var(--aw-hairline,var(--border))] px-1.5 py-2.5 text-[12px] font-medium tracking-[-0.08px] text-[var(--aw-ink,var(--foreground))] transition hover:bg-[var(--aw-parchment,var(--surface-2))]";

export function SymbolShareMenu({ symbol, price, changePct }: Props) {
  const t = useTranslations("symbolShare");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = shareText(symbol, price, changePct);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links: {
    id: string;
    label: string;
    href: string;
    icon: ReactNode;
  }[] = [
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.727-8.908L1.254 2.25H8.08l4.251 5.699L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      ),
    },
    {
      id: "fb",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.41c0-2.37 1.4-3.69 3.56-3.69 1.03 0 2.12.19 2.12.19v2.34h-1.2c-1.18 0-1.55.74-1.55 1.49v1.79h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
        </svg>
      ),
    },
    {
      id: "li",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      id: "wa",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.9.54 3.68 1.48 5.2L2 22l5.05-1.59a9.84 9.84 0 0 0 4.99 1.35h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.5 2 12.04 2zm0 18.06h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.11.98 1.01-3.03-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.51 3.67-8.18 8.19-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.52-3.68 8.19-8.19 8.19z" />
        </svg>
      ),
    },
    {
      id: "tg",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.94 14.54l-.56 3.12c.8 0 1.15-.34 1.57-.75l3.77-3.55c.35-.31.16-.47-.21-.35l-4.66 1.74-2-.62c-.43-.14-.44-.43.09-.64l7.63-2.94c.36-.14.68.09.55.64l-1.3 6.12c-.09.42-.35.52-.71.32l-1.96-1.45-1.02.98c-.11.11-.2.2-.41.2z" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 7.56-1.3 6.12c-.09.42-.35.52-.71.32l-1.96-1.45-1.02.98c-.11.11-.2.2-.41.2l.56-3.12 4.66-1.74c.37-.12.56.04.21.35l-3.77 3.55c-.42.41-.77.75-1.57.75l-.56-3.12 7.63-2.94c.43-.21.44.08.01.22z" />
        </svg>
      ),
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function systemShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: symbol, text, url });
      setOpen(false);
    } catch {
      /* cancelled */
    }
  }

  const canSystemShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={t("title")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.5 13.5l7-4M8.5 10.5l7 4" strokeLinecap="round" />
        </svg>
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
              <button
                type="button"
                aria-label={tCommon("close")}
                className="absolute inset-0 bg-[color-mix(in_srgb,var(--aw-ink,#0b1220)_48%,transparent)] backdrop-blur-[6px]"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label={t("title")}
                className="relative z-10 w-full max-w-[22rem] rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-5 py-3.5">
                  <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
                      {t("title")}
                    </h2>
                    <p className="mt-1 truncate text-[13px] tabular-nums tracking-[-0.08px] text-[var(--muted)]">
                      {text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
                    aria-label={tCommon("close")}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-4">
                  {links.map((l) => (
                    <a
                      key={l.id}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={tileClass}
                    >
                      {l.icon}
                      <span className="truncate">{l.label}</span>
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={() => void copyLink()}
                    className={tileClass}
                  >
                    <svg
                      className="h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="11" height="11" rx="0" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                    <span className="truncate">
                      {copied ? t("copied") : t("copy")}
                    </span>
                  </button>
                  {canSystemShare ? (
                    <button
                      type="button"
                      onClick={() => void systemShare()}
                      className={tileClass}
                    >
                      <svg
                        className="h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="18" cy="5" r="2.5" />
                        <circle cx="6" cy="12" r="2.5" />
                        <circle cx="18" cy="19" r="2.5" />
                        <path
                          d="M8.5 13.5l7-4M8.5 10.5l7 4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="truncate">{t("system")}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
