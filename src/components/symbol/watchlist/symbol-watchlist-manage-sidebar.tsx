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

function navClass(active: boolean) {
  return `relative flex w-full items-center gap-2 rounded-none px-2.5 py-2 text-left text-[13px] transition ${
    active
      ? "bg-[var(--panel)] font-semibold text-[var(--foreground)]"
      : "text-[var(--muted)] hover:bg-[var(--panel)]/70 hover:text-[var(--foreground)]"
  }`;
}

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
    <aside className="flex w-[9.5rem] shrink-0 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]/60 sm:w-[11rem]">
      <div className="shrink-0 border-b border-[var(--aw-hairline,var(--border))] p-2">
        <button
          type="button"
          disabled={busy}
          onClick={onCreate}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-none text-[12px] font-medium text-[var(--muted)] transition hover:bg-[var(--panel)]/80 hover:text-[var(--foreground)] disabled:opacity-50"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {labels.createGroup}
        </button>
      </div>

      <nav
        className="qt-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2"
        aria-label={labels.groupAll}
      >
        {MARKET_KEYS.map((id) => {
          const active = group === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "true" : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                if (editingId) onCommitRename();
                onSelect(id);
              }}
              className={navClass(active)}
            >
              {active ? (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-none bg-[var(--brand)]" />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{marketLabel(id)}</span>
              <span className="shrink-0 tabular-nums text-[11px] font-normal text-[var(--muted)]">
                {counts[id]}
              </span>
            </button>
          );
        })}

        {groups.length > 0 ? (
          <div
            className="my-1.5 border-t border-[var(--aw-hairline,var(--border))]"
            aria-hidden
          />
        ) : null}

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
                  className="qt-input h-8 w-full rounded-none border-[var(--brand)] px-2 text-[13px] font-semibold"
                  maxLength={40}
                />
              </div>
            );
          }
          return (
            <button
              key={g.id}
              type="button"
              aria-current={active ? "true" : undefined}
              title={active ? undefined : g.name}
              onMouseDown={(e) => {
                e.preventDefault();
                if (editingId) onCommitRename();
                if (active) onStartRename(g.id, g.name);
                else onSelect(key);
              }}
              className={navClass(active)}
            >
              {active ? (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-none bg-[var(--brand)]" />
              ) : null}
              <svg
                className="h-3.5 w-3.5 shrink-0 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 7h6l2 2h8v10H4V7z" />
              </svg>
              <span className="min-w-0 flex-1 truncate">{g.name}</span>
              <span className="shrink-0 tabular-nums text-[11px] font-normal text-[var(--muted)]">
                {g.count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
