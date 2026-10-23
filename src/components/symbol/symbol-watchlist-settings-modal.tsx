"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

type Row = {
  id: string;
  symbol: string;
  assetType: AssetType;
};

type SearchHit = {
  symbol: string;
  description: string;
  assetType: AssetType;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called after add/remove so the dock list can refresh. */
  onChanged: () => void;
};

/** Centered dialog: search-add + remove for the symbol-page watchlist dock. */
export function SymbolWatchlistSettingsModal({
  open,
  onClose,
  onChanged,
}: Props) {
  const t = useTranslations("symbol");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [addType, setAddType] = useState<AssetType>("stock");
  const [results, setResults] = useState<SearchHit[]>([]);

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (res.ok) setRows(data.items ?? []);
      else setRows([]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
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
  }, [open, load, onClose]);

  useEffect(() => {
    if (!open || !q.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&assetType=${addType}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [open, q, addType]);

  async function addSymbol(symbol: string, assetType: AssetType) {
    setBusy(true);
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType }),
      });
      setQ("");
      setResults([]);
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("watchlistSettings")}
        className="relative z-10 flex max-h-[min(90vh,32rem)] w-full max-w-[24rem] flex-col overflow-hidden rounded-2xl border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-4 py-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            {t("watchlistSettings")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
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

        <div className="relative shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-4 py-3">
          <div className="flex items-center gap-2">
            <QtSelect
              value={addType}
              onChange={(v) => setAddType(v as AssetType)}
              className="w-[6.5rem] shrink-0"
              triggerClassName="h-9"
              options={[
                { value: "stock", label: tMarket("stocks") },
                { value: "hk", label: tMarket("hk") },
                { value: "cn", label: tMarket("cn") },
                { value: "crypto", label: tMarket("crypto") },
              ]}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tMarket("search")}
              className="qt-input h-9 min-w-0 flex-1 px-3 text-sm leading-none"
              disabled={busy}
            />
          </div>
          {results.length > 0 ? (
            <ul className="absolute left-4 right-4 top-[calc(100%-0.25rem)] z-20 max-h-44 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-xl qt-scroll">
              {results.map((r) => (
                <li key={`${r.assetType}-${r.symbol}`}>
                  <button
                    type="button"
                    disabled={busy}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--sidebar-hover)] disabled:opacity-50"
                    onClick={() => void addSymbol(r.symbol, r.assetType)}
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{r.symbol}</span>
                      <span className="ml-2 text-xs text-[var(--muted)]">
                        {r.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--brand-text)]">
                      + {tMarket("addWatch")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto qt-scroll">
          {loading && rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              {tCommon("loading")}
            </p>
          ) : rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              {tMarket("watchlistEmpty")}
            </p>
          ) : (
            <ul>
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))]/70 px-4 py-2.5 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold leading-tight">
                      {row.symbol}
                    </div>
                    <div className="truncate text-[11px] text-[var(--muted)]">
                      {displayName(row.symbol, row.assetType)}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    className="shrink-0 text-xs font-medium text-[var(--muted)] hover:text-[var(--down)] disabled:opacity-50"
                    onClick={() => void remove(row.id)}
                  >
                    {tMarket("remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
