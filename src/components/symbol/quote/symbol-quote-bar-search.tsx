"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { InlineLoading } from "@/components/ui/panel-skeleton";
import { useSymbolSearch } from "@/hooks/query/use-symbol-search";
import { useMounted } from "@/hooks/use-mounted";
import type { AssetType } from "@/lib/types";

type Props = {
  assetType: AssetType;
  /** Current symbol — skip navigating to self. */
  currentSymbol: string;
  /**
   * `icon` — H5 ghost button; expands to a floating field (saves quote-bar width).
   * `field` — always-visible input (desktop).
   */
  variant?: "field" | "icon";
};

function useDebounced(value: string, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Compact same-market symbol search for the quote bar. */
export function SymbolQuoteBarSearch({
  assetType,
  currentSymbol,
  variant = "field",
}: Props) {
  const t = useTranslations("symbol");
  const router = useRouter();
  const mounted = useMounted();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const debounced = useDebounced(q.trim(), 220);
  const search = useSymbolSearch(debounced, assetType, debounced.length > 0);
  const iconMode = variant === "icon";

  const results = useMemo(() => {
    const rows = search.data?.results ?? [];
    const cur = currentSymbol.toUpperCase();
    return rows.filter((r) => r.symbol.toUpperCase() !== cur).slice(0, 8);
  }, [search.data?.results, currentSymbol]);

  useEffect(() => {
    setActive(0);
  }, [results]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        if (iconMode) {
          setExpanded(false);
          setQ("");
        }
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [iconMode]);

  useEffect(() => {
    if (expanded && iconMode) {
      inputRef.current?.focus();
    }
  }, [expanded, iconMode]);

  const go = (symbol: string, type: AssetType = assetType) => {
    setQ("");
    setOpen(false);
    setExpanded(false);
    router.push(`/symbol/${type}/${encodeURIComponent(symbol)}`);
  };

  const showList = open && debounced.length > 0;
  const placeholder =
    assetType === "hk"
      ? t("searchPlaceholderHk")
      : assetType === "cn"
        ? t("searchPlaceholderCn")
        : assetType === "crypto"
          ? t("searchPlaceholderCrypto")
          : t("searchPlaceholder");

  const field = (
    <label className="relative flex h-7 w-full items-center">
      <span className="sr-only">{t("search")}</span>
      <SearchGlyph className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[var(--muted)]" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            if (iconMode) {
              setExpanded(false);
              setQ("");
            } else {
              (e.target as HTMLInputElement).blur();
            }
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(0, i - 1));
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const hit = results[active] ?? results[0];
            if (hit) go(hit.symbol, hit.assetType);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-controls={mounted ? listId : undefined}
        aria-expanded={showList && results.length > 0 ? true : undefined}
        className="h-7 w-full rounded-md border border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))] pl-7 pr-2 text-[12px] tracking-[-0.1px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)]/40 focus:bg-[var(--aw-canvas)]"
      />
    </label>
  );

  const list =
    showList ? (
      <ul
        id={mounted ? listId : undefined}
        role="listbox"
        className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] py-1 shadow-lg"
      >
        {search.isFetching && results.length === 0 ? (
          <li className="flex items-center px-3 py-2.5">
            <InlineLoading />
          </li>
        ) : results.length === 0 ? (
          <li className="px-3 py-2 text-[11px] text-[var(--muted)]">
            {t("searchEmpty")}
          </li>
        ) : (
          results.map((r, i) => (
            <li key={`${r.assetType}-${r.symbol}`} role="option">
              <button
                type="button"
                aria-selected={i === active}
                data-active={i === active}
                className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--surface-2)] data-[active=true]:bg-[var(--brand-soft)]"
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.symbol, r.assetType)}
              >
                <span className="shrink-0 font-semibold tabular-nums">
                  {r.symbol}
                </span>
                {r.description ? (
                  <span className="min-w-0 truncate text-[var(--muted)]">
                    {r.description}
                  </span>
                ) : null}
              </button>
            </li>
          ))
        )}
      </ul>
    ) : null;

  if (iconMode) {
    return (
      <div ref={wrapRef} className="relative shrink-0">
        {expanded ? (
          <div className="absolute right-0 top-1/2 z-40 w-[min(16rem,calc(100vw-5.5rem))] -translate-y-1/2">
            {field}
            {list}
          </div>
        ) : (
          <button
            type="button"
            aria-label={t("search")}
            title={t("search")}
            onClick={() => setExpanded(true)}
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <SearchGlyph className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-0 flex min-w-0 w-full max-w-full flex-1 items-center lg:mx-3 lg:max-w-[18rem]"
    >
      {field}
      {list}
    </div>
  );
}
