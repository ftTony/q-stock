"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChangePct } from "@/components/market/price";
import type { IndustryHeatCell } from "@/components/analysis/types";

const PAGE_SIZE = 12;

type Props = {
  industries: IndustryHeatCell[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  /** Compact select for small screens */
  variant?: "sidebar" | "select";
};

export function AnalysisIndustryPicker({
  industries,
  selectedId,
  loading,
  onSelect,
  variant = "sidebar",
}: Props) {
  const t = useTranslations("analysis");
  const tCommon = useTranslations("common");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return industries;
    return industries.filter((i) => i.name.toLowerCase().includes(needle));
  }, [industries, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [q, industries]);

  useEffect(() => {
    if (page >= pageCount) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  // Keep selected industry visible on its page when selection changes externally
  useEffect(() => {
    if (!selectedId) return;
    const idx = filtered.findIndex((i) => i.id === selectedId);
    if (idx < 0) return;
    const target = Math.floor(idx / PAGE_SIZE);
    setPage(target);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps -- only jump when selection changes

  const pageItems = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  if (!loading && industries.length === 0) {
    return (
      <div className="px-3 py-4 text-sm text-[var(--muted)]">
        {t("industryEmpty")}
      </div>
    );
  }

  if (variant === "select") {
    return (
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs">
        <span className="font-semibold text-[var(--muted)]">{t("industry")}</span>
        <select
          className="qt-input w-full px-2.5 py-2 text-sm"
          value={selectedId ?? ""}
          disabled={loading || industries.length === 0}
          onChange={(e) => {
            if (e.target.value) onSelect(e.target.value);
          }}
        >
          {industries.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.name} ({ind.percentChange >= 0 ? "+" : ""}
              {ind.percentChange.toFixed(2)}%)
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b border-[var(--border)] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[14px] leading-5">
          <span className="font-semibold text-[var(--muted)]">
            {t("industry")}
          </span>
          <span className="tabular-nums text-[var(--muted)]">
            {t("industryPage", {
              page: page + 1,
              total: pageCount,
              count: filtered.length,
            })}
          </span>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("industrySearch")}
          className="qt-input w-full px-2.5 py-1.5 text-[14px] leading-5"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto qt-scroll">
        {loading && industries.length === 0
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="mx-2 my-1.5 h-9 animate-pulse rounded-md bg-[var(--surface-2)]"
              />
            ))
          : pageItems.map((ind) => {
              const active = ind.id === selectedId;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => onSelect(ind.id)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-[var(--border)]/50 px-3 py-2 text-left transition last:border-0 ${
                    active
                      ? "bg-[var(--brand-soft)]/35 text-[var(--brand-text)]"
                      : "hover:bg-[var(--sidebar-hover)]/60"
                  }`}
                >
                  <span
                    className={`min-w-0 truncate text-[14px] leading-5 ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {ind.name}
                  </span>
                  <span className="shrink-0 text-[14px] leading-5 tabular-nums">
                    <ChangePct value={ind.percentChange} />
                  </span>
                </button>
              );
            })}
        {!loading && filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-[var(--muted)]">
            {t("searchEmpty")}
          </div>
        )}
      </div>
      {filtered.length > PAGE_SIZE && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--border)] px-2 py-2">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 flex-1 px-2 !text-[14px] leading-5 disabled:opacity-40"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            {tCommon("prevPage")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 flex-1 px-2 !text-[14px] leading-5 disabled:opacity-40"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            {tCommon("nextPage")}
          </button>
        </div>
      )}
    </aside>
  );
}
