"use client";

import { QtSelect } from "@/components/ui/qt-select";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";
import type { CustomGroup } from "@/components/symbol/watchlist/symbol-watchlist-manage-sidebar";

export type WatchlistRow = {
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
  title: string;
  showAdd: boolean;
  onToggleAdd: () => void;
  addType: AssetType;
  onAddType: (v: AssetType) => void;
  q: string;
  onQ: (v: string) => void;
  results: SearchHit[];
  onAddSymbol: (symbol: string, assetType: AssetType) => void;
  busy: boolean;
  loading: boolean;
  filtered: WatchlistRow[];
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  marketLabel: (assetType: AssetType) => string;
  groups: CustomGroup[];
  showAddToGroup: boolean;
  onAddToGroup: (groupId: string) => void;
  onRemoveSelected: () => void;
  labels: {
    addWatch: string;
    search: string;
    stocks: string;
    hk: string;
    cn: string;
    crypto: string;
    colCode: string;
    colName: string;
    colMarket: string;
    loading: string;
    empty: string;
    selectAll: string;
    addTo: string;
    deleteSelected: string;
  };
};

const COL =
  "grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1.35fr)_4.25rem] items-center gap-2.5 px-4";

export function SymbolWatchlistManagePanel({
  title,
  showAdd,
  onToggleAdd,
  addType,
  onAddType,
  q,
  onQ,
  results,
  onAddSymbol,
  busy,
  loading,
  filtered,
  selected,
  onToggleRow,
  onToggleAll,
  allSelected,
  someSelected,
  marketLabel,
  groups,
  showAddToGroup,
  onAddToGroup,
  onRemoveSelected,
  labels,
}: Props) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--panel)]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))] px-4 py-2.5">
        <h3 className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h3>
        <button
          type="button"
          onClick={onToggleAdd}
          className="inline-flex h-8 w-8 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
          aria-label={labels.addWatch}
          aria-pressed={showAdd}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {showAdd ? (
        <div className="relative shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <QtSelect
              value={addType}
              onChange={(v) => onAddType(v as AssetType)}
              className="w-[6.5rem] shrink-0"
              triggerClassName="h-8"
              options={[
                { value: "stock", label: labels.stocks },
                { value: "hk", label: labels.hk },
                { value: "cn", label: labels.cn },
                { value: "crypto", label: labels.crypto },
              ]}
            />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder={labels.search}
              className="qt-input h-8 min-w-0 flex-1 px-2.5 text-[13px]"
              disabled={busy}
              autoFocus
            />
          </div>
          {results.length > 0 ? (
            <ul className="absolute left-4 right-4 top-full z-20 max-h-40 overflow-auto border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_12px_40px_rgba(15,23,42,0.18)] qt-scroll">
              {results.map((r) => (
                <li key={`${r.assetType}-${r.symbol}`}>
                  <button
                    type="button"
                    disabled={busy}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-[var(--sidebar-hover)] disabled:opacity-50"
                    onClick={() => onAddSymbol(r.symbol, r.assetType)}
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-semibold tabular-nums">
                        {r.symbol}
                      </span>
                      <span className="ml-2 text-[12px] text-[var(--muted)]">
                        {r.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--brand-text)]">
                      +
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div
        className={`${COL} shrink-0 border-b border-[var(--aw-hairline,var(--border))] py-2 text-[11px] text-[var(--muted)]`}
      >
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
          }}
          onChange={onToggleAll}
          disabled={filtered.length === 0}
          className="h-3.5 w-3.5 accent-[var(--brand)]"
          aria-label={labels.selectAll}
        />
        <span>{labels.colCode}</span>
        <span>{labels.colName}</span>
        <span className="text-right">{labels.colMarket}</span>
      </div>

      <div className="qt-scroll min-h-0 flex-1 overflow-y-auto">
        {loading && filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-[var(--muted)]">
            {labels.loading}
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-1.5 px-4 text-[var(--muted)]">
            <p className="text-[13px]">{labels.empty}</p>
          </div>
        ) : (
          <ul>
            {filtered.map((row) => {
              const on = selected.has(row.id);
              return (
                <li key={row.id}>
                  <label
                    className={`${COL} cursor-pointer border-b border-[var(--aw-hairline,var(--border))]/50 py-2.5 transition last:border-0 hover:bg-[var(--aw-parchment,var(--surface-2))]/50 ${
                      on ? "bg-[var(--aw-parchment,var(--surface-2))]/35" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onToggleRow(row.id)}
                      className="h-3.5 w-3.5 accent-[var(--brand)]"
                    />
                    <span className="truncate text-[13px] font-semibold tabular-nums text-[var(--foreground)]">
                      {row.symbol}
                    </span>
                    <span className="truncate text-[12px] text-[var(--muted)]">
                      {displayName(row.symbol, row.assetType)}
                    </span>
                    <span className="truncate text-right text-[11px] text-[var(--muted)]">
                      {marketLabel(row.assetType)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--aw-hairline,var(--border))] px-4 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[var(--muted)]">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={onToggleAll}
            disabled={filtered.length === 0}
            className="h-3.5 w-3.5 accent-[var(--brand)]"
          />
          {labels.selectAll}
          {selected.size > 0 ? (
            <span className="tabular-nums text-[var(--foreground)]">
              ({selected.size})
            </span>
          ) : null}
        </label>
        <div className="flex items-center gap-1.5">
          {showAddToGroup && groups.length > 0 ? (
            <select
              className="h-8 max-w-[8.5rem] rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-2 text-[12px] text-[var(--foreground)] disabled:opacity-40"
              disabled={busy || selected.size === 0}
              defaultValue=""
              onChange={(e) => {
                const gid = e.target.value;
                e.target.value = "";
                if (gid) onAddToGroup(gid);
              }}
            >
              <option value="" disabled>
                {labels.addTo}
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            disabled={busy || selected.size === 0}
            onClick={onRemoveSelected}
            className="h-8 rounded-none px-3 text-[12px] font-medium text-[var(--danger)] transition hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] disabled:opacity-40"
          >
            {labels.deleteSelected}
          </button>
        </div>
      </div>
    </div>
  );
}
