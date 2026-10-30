"use client";

import type { RefObject } from "react";
import type { AssetType } from "@/lib/types";

export type CustomGroup = {
  id: string;
  name: string;
  count: number;
};

export type GroupKey = "all" | AssetType | `g:${string}`;

const MARKET_KEYS: Array<"all" | AssetType> = [
  "all",
  "stock",
  "hk",
  "cn",
  "crypto",
];

type Props = {
  group: GroupKey;
  onSelect: (key: GroupKey) => void;
  counts: Record<"all" | AssetType, number>;
  groups: CustomGroup[];
  busy: boolean;
  onCreate: () => void;
  editingId: string | null;
  editName: string;
  onEditName: (v: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onStartRename: (id: string, name: string) => void;
  editRef: RefObject<HTMLInputElement | null>;
  labels: {
    createGroup: string;
    groupAll: string;
    stocks: string;
    hk: string;
    cn: string;
    crypto: string;
  };
};

export function SymbolWatchlistManageSidebar({
  group,
  onSelect,
  counts,
  groups,
  busy,
  onCreate,
  editingId,
  editName,
  onEditName,
  onCommitRename,
  onCancelRename,
  onStartRename,
  editRef,
  labels,
}: Props) {
  const marketLabel = (id: "all" | AssetType) => {
    if (id === "all") return labels.groupAll;
    if (id === "stock") return labels.stocks;
    if (id === "hk") return labels.hk;
    if (id === "cn") return labels.cn;
    return labels.crypto;
  };

  return (
    <aside className="flex w-[9.5rem] shrink-0 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]/40 sm:w-[11rem]">
      <div className="shrink-0 p-2">
        <button
          type="button"
          disabled={busy}
          onClick={onCreate}
          className="flex h-8 w-full items-center justify-center gap-1 rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
        >
          <span aria-hidden>+</span>
          {labels.createGroup}
        </button>
      </div>
      <nav className="qt-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {MARKET_KEYS.map((id) => {
          const active = group === id;
          return (
            <button
              key={id}
              type="button"
              // mousedown + preventDefault: click is not lost when rename input would blur first
              onMouseDown={(e) => {
                e.preventDefault();
                if (editingId) onCommitRename();
                onSelect(id);
              }}
              className={`flex w-full items-center justify-between gap-1 rounded-md px-2.5 py-2 text-left text-[13px] ${
                active
                  ? "bg-[var(--panel)] font-semibold text-[var(--foreground)] ring-1 ring-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel)]/80 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="truncate">
                {marketLabel(id)}
                <span className="ml-0.5 tabular-nums text-[11px] font-normal text-[var(--muted)]">
                  ({counts[id]})
                </span>
              </span>
            </button>
          );
        })}

        {groups.map((g) => {
          const key = `g:${g.id}` as const;
          const active = group === key;
          if (editingId === g.id) {
            return (
              <div key={g.id} className="px-0.5 py-0.5">
                <input
                  ref={editRef}
                  value={editName}
                  onChange={(e) => onEditName(e.target.value)}
                  onBlur={onCommitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancelRename();
                    }
                  }}
                  className="qt-input h-9 w-full border-[var(--foreground)] px-2 text-[13px] font-semibold"
                  maxLength={40}
                />
              </div>
            );
          }
          return (
            <button
              key={g.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (editingId) onCommitRename();
                if (active) onStartRename(g.id, g.name);
                else onSelect(key);
              }}
              className={`flex w-full items-center justify-between gap-1 rounded-md px-2.5 py-2 text-left text-[13px] ${
                active
                  ? "bg-[var(--panel)] font-semibold text-[var(--foreground)] ring-1 ring-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel)]/80 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="min-w-0 truncate">
                {g.name}
                <span className="ml-0.5 tabular-nums text-[11px] font-normal text-[var(--muted)]">
                  ({g.count})
                </span>
              </span>
              <span className="shrink-0 text-[12px] text-amber-500" aria-hidden>
                ★
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
