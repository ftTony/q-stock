"use client";

import { useEffect, useRef, useState } from "react";

type ShareUi = {
  share: string;
  copy: string;
  copied: string;
  title: string;
  body: string;
  copiedHint: string;
};

function shareUi(locale: string): ShareUi {
  if (locale.startsWith("zh")) {
    return {
      share: "分享",
      copy: "复制链接",
      copied: "已复制",
      title: "分享这篇文章",
      body: "把这页转给正在做同一个计算的人。",
      copiedHint: "链接已复制，粘贴到微信或邮件里即可。",
    };
  }
  return {
    share: "Share",
    copy: "Copy link",
    copied: "Copied",
    title: "Share this article",
    body: "Forward it to someone facing the same calculation.",
    copiedHint: "Link copied — paste it into chat or mail.",
  };
}

/** Clipboard API first, `execCommand` fallback for in-app browsers. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function currentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href.split("#")[0]!;
}

const buttonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--brand)]/40 hover:text-[var(--brand-text)]";

const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] transition-colors hover:border-[var(--brand)]/40 hover:text-[var(--brand-text)]";

type Props = {
  title: string;
  locale: string;
  /** `compact` = header row pill; `bar` = end-of-article card. */
  variant?: "compact" | "bar";
};

/**
 * Client-side share control. Uses the Web Share sheet where available
 * (mostly mobile), and falls back to copying the canonical page URL.
 */
export function LearnShare({ title, locale, variant = "compact" }: Props) {
  const ui = shareUi(locale);
  const [copied, setCopied] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function markCopied() {
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }

  async function copyOnly() {
    if (await copyToClipboard(currentUrl())) markCopied();
  }

  async function handlePrimary() {
    if (nativeShare) {
      try {
        await navigator.share({ title, url: currentUrl() });
        return;
      } catch (err) {
        // User dismissed the sheet — do not copy behind their back.
        if ((err as DOMException | undefined)?.name === "AbortError") return;
      }
    }
    await copyOnly();
  }

  const primaryLabel = nativeShare ? ui.share : copied ? ui.copied : ui.copy;
  const primaryIcon =
    nativeShare && !copied ? (
      <ShareIcon />
    ) : copied ? (
      <CheckIcon />
    ) : (
      <LinkIcon />
    );

  const buttons = (
    <div className="flex shrink-0 items-center gap-1.5 print:hidden">
      <button
        type="button"
        onClick={handlePrimary}
        className={buttonClass}
        aria-label={nativeShare ? ui.share : ui.copy}
      >
        {primaryIcon}
        <span>{primaryLabel}</span>
      </button>

      {nativeShare ? (
        <button
          type="button"
          onClick={copyOnly}
          className={iconButtonClass}
          aria-label={ui.copy}
          title={ui.copy}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {copied ? ui.copied : ""}
      </span>
    </div>
  );

  if (variant === "bar") {
    return (
      <section
        className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[var(--border)] p-4 print:hidden sm:flex-row sm:items-center sm:justify-between"
        style={{
          background: "color-mix(in srgb, var(--surface-2) 55%, transparent)",
        }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold">{ui.title}</p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
            {copied ? ui.copiedHint : ui.body}
          </p>
        </div>
        {buttons}
      </section>
    );
  }

  return buttons;
}

function ShareIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5 15.4 17.5" />
      <path d="M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
