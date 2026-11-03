"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSymbolNavPending } from "@/components/symbol/page/symbol-nav-pending";
import { InlineLoading, Skel } from "@/components/ui/panel-skeleton";
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

type DropdownPos = { top: number; left: number; width: number };

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

function SearchSpinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 animate-spin text-[var(--muted)] ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchResultSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-0 py-1" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-2 px-3 py-2">
          <Skel className="h-3 w-12 shrink-0" />
          <Skel
            className="h-3 flex-1"
            style={{ maxWidth: i % 2 === 0 ? "70%" : "48%" }}
          />
        </li>
      ))}
    </ul>
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
  const { setPending } = useSymbolNavPending();
  const mounted = useMounted();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLLabelElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const trimmed = q.trim();
  const debounced = useDebounced(trimmed, 220);
  const search = useSymbolSearch(debounced, assetType, debounced.length > 0);
  const iconMode = variant === "icon";

  const results = useMemo(() => {
    const rows = search.data?.results ?? [];
    const cur = currentSymbol.toUpperCase();
    return rows.filter((r) => r.symbol.toUpperCase() !== cur).slice(0, 8);
  }, [search.data?.results, currentSymbol]);

  /** Typing ahead of debounce, or request in flight. */
  const awaitingDebounce = trimmed.length > 0 && trimmed !== debounced;
  const fetching = search.isFetching && debounced.length > 0;
  const busy = awaitingDebounce || fetching;
  /** First paint / empty while loading — show skeleton panel. */
  const showSkeleton = busy && results.length === 0;
  /** Keep prior hits while a new query loads. */
  const refreshing = fetching && results.length > 0;

  // Open panel as soon as there is input — don't wait for debounce.
  const showList = open && trimmed.length > 0;

  const syncPos = useCallback(() => {
    const el = fieldRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: Math.round(r.bottom + 4),
      left: Math.round(r.left),
      width: Math.round(Math.max(r.width, 220)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!showList) {
      setPos(null);
      return;
    }
    syncPos();
  }, [showList, syncPos, q, expanded]);

  useEffect(() => {
    if (!showList) return;
    const onWin = () => syncPos();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [showList, syncPos]);

  useEffect(() => {
    setActive(0);
  }, [results]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
      if (iconMode) {
        setExpanded(false);
        setQ("");
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

  const go = (nextSymbol: string, type: AssetType = assetType) => {
    setQ("");
    setOpen(false);
    setExpanded(false);
    if (
      type !== assetType ||
      nextSymbol.toUpperCase() !== currentSymbol.toUpperCase()
    ) {
      setPending({ symbol: nextSymbol, assetType: type });
    }
    router.push(`/symbol/${type}/${encodeURIComponent(nextSymbol)}`);
  };

  const placeholder =
    assetType === "hk"
      ? t("searchPlaceholderHk")
      : assetType === "cn"
        ? t("searchPlaceholderCn")
        : assetType === "crypto"
          ? t("searchPlaceholderCrypto")
          : t("searchPlaceholder");

  const field = (
    <label ref={fieldRef} className="relative flex h-7 w-full items-center">
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
            if (busy && results.length === 0) return;
            const hit = results[active] ?? results[0];
            if (hit) go(hit.symbol, hit.assetType);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-busy={busy || undefined}
        aria-controls={mounted ? listId : undefined}
        aria-expanded={showList ? true : undefined}
        className="h-7 w-full rounded-md border border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))] pl-7 pr-8 text-[12px] tracking-[-0.1px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)]/40 focus:bg-[var(--aw-canvas)]"
      />
      {busy ? (
        <span className="pointer-events-none absolute right-2 inline-flex items-center">
          <SearchSpinner />
        </span>
      ) : null}
    </label>
  );

  const list =
    mounted && showList && pos
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={t("search")}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="qt-portal-shell fixed z-[90] max-h-64 overflow-auto rounded-lg border border-[var(--border)] !bg-[var(--panel)] shadow-lg qt-scroll"
          >
            {showSkeleton ? (
              <div className="px-0 py-0.5">
                <div className="flex items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-3 py-2">
                  <InlineLoading
                    label={t("searchSearching")}
                    className="text-[11px]"
                  />
                </div>
                <SearchResultSkeleton />
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-3 text-[11px] leading-relaxed text-[var(--muted)]">
                {t("searchEmpty")}
              </div>
            ) : (
              <>
                {refreshing ? (
                  <div className="flex items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-3 py-1.5">
                    <SearchSpinner className="h-3 w-3" />
                    <span className="text-[11px] text-[var(--muted)]">
                      {t("searchUpdating")}
                    </span>
                  </div>
                ) : null}
                <ul
                  className={`py-1 ${refreshing ? "opacity-70 transition-opacity" : ""}`}
                >
                  {results.map((r, i) => (
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
                  ))}
                </ul>
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  if (iconMode) {
    return (
      <div ref={wrapRef} className="relative shrink-0">
        {expanded ? (
          <div className="absolute right-0 top-1/2 z-40 w-[min(16rem,calc(100vw-5.5rem))] -translate-y-1/2">
            {field}
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
        {list}
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
