"use client";

import { useEffect, useRef, useState } from "react";
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

export function SymbolShareMenu({ symbol, price, changePct }: Props) {
  const t = useTranslations("symbolShare");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = shareText(symbol, price, changePct);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links = [
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      id: "fb",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "li",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: "wa",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      id: "tg",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ] as const;

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t("title")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.5 13.5l7-4M8.5 10.5l7 4" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 min-w-[10rem] rounded-lg border border-[var(--border)] bg-[var(--panel)] py-1 text-xs shadow-lg"
        >
          {links.map((l) => (
            <a
              key={l.id}
              role="menuitem"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-1.5 hover:bg-[var(--surface-2)]"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-1.5 text-left hover:bg-[var(--surface-2)]"
            onClick={() => void copyLink()}
          >
            {copied ? t("copied") : t("copy")}
          </button>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--surface-2)]"
              onClick={() => void systemShare()}
            >
              {t("system")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
