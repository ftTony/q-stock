"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AssetType, SearchResult } from "@/lib/types";

type Props = {
  value: string;
  assetType: AssetType;
  onChange: (symbol: string) => void;
  onSelect?: (result: SearchResult) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  className?: string;
};

export function SymbolSearchField({
  value,
  assetType,
  onChange,
  onSelect,
  label,
  placeholder,
  required,
  className = "",
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setQ(value);
  }, [value]);

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

  function pick(r: SearchResult) {
    onChange(r.symbol);
    setQ(r.symbol);
    setResults([]);
    setOpen(false);
    onSelect?.(r);
  }

  return (
    <div ref={wrapRef} className={`relative space-y-1 text-sm ${className}`}>
      <label className="block">
        <span className="text-[var(--muted)]">{label}</span>
        <input
          value={q}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setQ(next);
            onChange(next);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && results.length > 0}
          className="qt-input mt-1 w-full px-3 py-2.5"
        />
      </label>
      {open && (results.length > 0 || searching) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl"
        >
          {searching && results.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-[var(--muted)]">…</li>
          )}
          {results.map((r) => (
            <li key={`${r.assetType}-${r.symbol}`} role="option">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-[var(--sidebar-hover)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
              >
                <span className="min-w-0">
                  <span className="font-semibold">{r.displaySymbol || r.symbol}</span>
                  {r.description ? (
                    <span className="ml-2 text-[var(--muted)]">
                      {r.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
