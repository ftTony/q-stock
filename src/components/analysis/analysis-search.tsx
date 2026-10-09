"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { AssetType, SearchResult } from "@/lib/types";
import type { AnalysisRecentItem } from "@/components/analysis/types";

type Props = {
  assetType: AssetType;
  recent: AnalysisRecentItem[];
  /** Symbols in the selected industry — compare only allowed for these. */
  peerSymbols?: Set<string>;
  onAddCompare: (item: SearchResult | AnalysisRecentItem) => boolean;
  onRecentOpen: (item: AnalysisRecentItem) => void;
};

export function AnalysisSearch({
  assetType,
  recent,
  peerSymbols,
  onAddCompare,
  onRecentOpen,
}: Props) {
  const t = useTranslations("analysis");
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&assetType=${assetType}`,
        );
        const data = (await res.json()) as { results?: SearchResult[] };
        if (!cancelled) {
          setResults(data.results ?? []);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [q, assetType]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function openSymbol(r: { symbol: string; assetType: AssetType }) {
    onRecentOpen({ symbol: r.symbol, assetType: r.assetType });
    setQ("");
    setResults([]);
    setOpen(false);
    router.push(`/symbol/${r.assetType}/${r.symbol}`);
  }

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length || recent.length) setOpen(true);
        }}
        placeholder={t("searchPlaceholder")}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        className="qt-input w-full px-3 py-2 text-sm"
      />
      {open && (q.trim().length > 0 || recent.length > 0) && (
        <div
          id={listId}
          className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl"
        >
          {q.trim().length === 0 && recent.length > 0 && (
            <div className="border-b border-[var(--border)] px-3 py-2">
              <div className="mb-1.5 text-[10px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                {t("recent")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((r) => {
                  const canCompare =
                    r.assetType === assetType &&
                    (!peerSymbols || peerSymbols.has(r.symbol));
                  return (
                    <div
                      key={`${r.assetType}:${r.symbol}`}
                      className="inline-flex items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-xs"
                    >
                      <button
                        type="button"
                        className="px-2 py-1 font-semibold hover:bg-[var(--sidebar-hover)]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => openSymbol(r)}
                      >
                        {r.symbol}
                      </button>
                      {canCompare && (
                        <button
                          type="button"
                          className="border-l border-[var(--border)] px-1.5 py-1 text-[var(--brand-text)] hover:bg-[var(--sidebar-hover)]"
                          title={t("addToCompare")}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            onAddCompare(r);
                            setOpen(false);
                          }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {q.trim().length > 0 && (
            <ul role="listbox" className="max-h-56 overflow-auto">
              {searching && results.length === 0 && (
                <li className="px-3 py-2.5 text-xs text-[var(--muted)]">…</li>
              )}
              {!searching && results.length === 0 && (
                <li className="px-3 py-2.5 text-xs text-[var(--muted)]">
                  {t("searchEmpty")}
                </li>
              )}
              {results.map((r) => {
                const canCompare =
                  r.assetType === assetType &&
                  (!peerSymbols || peerSymbols.has(r.symbol));
                return (
                  <li
                    key={`${r.assetType}-${r.symbol}`}
                    role="option"
                    className="flex items-stretch border-b border-[var(--border)]/60 last:border-0"
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 px-3 py-2 text-left text-sm hover:bg-[var(--sidebar-hover)]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => openSymbol(r)}
                    >
                      <span className="font-semibold">
                        {r.displaySymbol || r.symbol}
                      </span>
                      {r.description ? (
                        <span className="ml-2 text-[var(--muted)]">
                          {r.description}
                        </span>
                      ) : null}
                    </button>
                    {canCompare ? (
                      <button
                        type="button"
                        className="shrink-0 border-l border-[var(--border)]/60 px-3 text-xs font-semibold text-[var(--brand-text)] hover:bg-[var(--sidebar-hover)]"
                        title={t("addToCompare")}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onAddCompare(r);
                          setQ("");
                          setResults([]);
                          setOpen(false);
                        }}
                      >
                        {t("addShort")}
                      </button>
                    ) : (
                      <span
                        className="flex shrink-0 items-center border-l border-[var(--border)]/60 px-2 text-[10px] text-[var(--muted)]"
                        title={t("industryHint")}
                      >
                        {t("peerOnly")}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
