"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  SymbolWatchlistManageSidebar,
  type CustomGroup,
  type GroupKey,
} from "@/components/symbol/watchlist/symbol-watchlist-manage-sidebar";
import {
  SymbolWatchlistManagePanel,
  type WatchlistRow,
} from "@/components/symbol/watchlist/symbol-watchlist-manage-panel";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import {
  useAddWatchlistGroupItems,
  useCreateWatchlistGroup,
  useRemoveWatchlistGroupItems,
  useUpdateWatchlistGroup,
  useWatchlistGroupDetail,
  useWatchlistGroups,
} from "@/hooks/query/use-watchlist-groups";
import { useSymbolSearch } from "@/hooks/query/use-symbol-search";
import type { AssetType } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

function isCustom(key: GroupKey): key is `g:${string}` {
  return key.startsWith("g:");
}

function customId(key: `g:${string}`) {
  return key.slice(2);
}

/** Watchlist manager — market folders + custom groups (create = inline rename). */
export function SymbolWatchlistSettingsModal({
  open,
  onClose,
  onChanged,
}: Props) {
  const t = useTranslations("symbol");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState<GroupKey>("all");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [addType, setAddType] = useState<AssetType>("stock");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const customGroupId = isCustom(group) ? customId(group) : null;

  const watchlistQuery = useWatchlist({ enabled: open });
  const groupsQuery = useWatchlistGroups(open);
  const groupDetailQuery = useWatchlistGroupDetail(customGroupId, open);
  const searchQuery = useSymbolSearch(
    debouncedQ,
    addType,
    open && showAdd && Boolean(debouncedQ.trim()),
  );

  const createGroupMut = useCreateWatchlistGroup();
  const updateGroupMut = useUpdateWatchlistGroup();
  const addWatch = useAddWatchlistItem();
  const removeWatch = useRemoveWatchlistItem();
  const addGroupItems = useAddWatchlistGroupItems();
  const removeGroupItems = useRemoveWatchlistGroupItems();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(handle);
  }, [q]);

  // Only reset when the dialog opens — do not depend on unstable onClose
  // identities (parent re-renders / quote poll would snap selection back to「全部」).
  useEffect(() => {
    if (!open) return;
    setGroup("all");
    setSelected(new Set());
    setShowAdd(false);
    setEditingId(null);
    setQ("");
    setDebouncedQ("");
    void watchlistQuery.refetch();
    void groupsQuery.refetch();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-only reset
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editingId) {
        setEditingId(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, editingId, onClose]);

  useEffect(() => {
    if (!editingId) return;
    const id = window.setTimeout(() => {
      editRef.current?.focus();
      editRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [editingId]);

  const rows = (watchlistQuery.data?.items ?? []) as WatchlistRow[];
  const groups = (groupsQuery.data?.groups ?? []) as CustomGroup[];
  const groupRows = isCustom(group)
    ? ((groupDetailQuery.data?.items ?? []) as WatchlistRow[])
    : null;
  const results =
    !open || !showAdd || !q.trim()
      ? []
      : (searchQuery.data?.results ?? []);
  const loading =
    (watchlistQuery.isLoading || groupsQuery.isLoading) && rows.length === 0;

  const counts = useMemo(() => {
    const c = { all: rows.length, stock: 0, hk: 0, cn: 0, crypto: 0 };
    for (const r of rows) c[r.assetType] += 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (isCustom(group)) return groupRows ?? [];
    if (group === "all") return rows;
    return rows.filter((r) => r.assetType === group);
  }, [rows, group, groupRows]);

  const title = useMemo(() => {
    if (isCustom(group)) {
      return (
        groups.find((g) => g.id === customId(group))?.name ??
        t("watchlistNewGroupName")
      );
    }
    if (group === "all") return t("watchlistGroupAll");
    if (group === "stock") return tMarket("stocks");
    if (group === "hk") return tMarket("hk");
    if (group === "cn") return tMarket("cn");
    return tMarket("crypto");
  }, [group, groups, t, tMarket]);

  const marketLabel = (assetType: AssetType) => {
    if (assetType === "stock") return tMarket("stocks");
    if (assetType === "hk") return tMarket("hk");
    if (assetType === "cn") return tMarket("cn");
    return tMarket("crypto");
  };

  const allSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someSelected = filtered.some((r) => selected.has(r.id));

  function selectGroup(key: GroupKey) {
    setGroup(key);
    setSelected(new Set());
    setEditingId(null);
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) for (const r of filtered) next.delete(r.id);
      else for (const r of filtered) next.add(r.id);
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createGroup() {
    setBusy(true);
    try {
      const data = await createGroupMut.mutateAsync({
        name: t("watchlistNewGroupName"),
      });
      const g = data.group as CustomGroup;
      setGroup(`g:${g.id}`);
      setSelected(new Set());
      setEditingId(g.id);
      setEditName(g.name);
    } finally {
      setBusy(false);
    }
  }

  async function commitRename() {
    if (!editingId) return;
    const name = editName.trim() || t("watchlistNewGroupName");
    const id = editingId;
    setEditingId(null);
    try {
      await updateGroupMut.mutateAsync({ id, name });
    } catch {
      void groupsQuery.refetch();
    }
  }

  async function addSymbol(symbol: string, assetType: AssetType) {
    setBusy(true);
    try {
      if (isCustom(group)) {
        await addGroupItems.mutateAsync({
          groupId: customId(group),
          symbol,
          assetType,
        });
      } else {
        await addWatch.mutateAsync({ symbol, assetType });
      }
      setQ("");
      setDebouncedQ("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    try {
      if (isCustom(group)) {
        await removeGroupItems.mutateAsync({
          groupId: customId(group),
          itemIds: ids,
        });
      } else {
        await Promise.all(ids.map((id) => removeWatch.mutateAsync(id)));
      }
      setSelected(new Set());
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function addSelectedToGroup(targetGroupId: string) {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    try {
      await addGroupItems.mutateAsync({
        groupId: targetGroupId,
        itemIds: ids,
      });
      setSelected(new Set());
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("watchlistManage")}
        className="relative z-10 flex h-[min(88dvh,36rem)] w-full max-w-[44rem] flex-col overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-4 py-3">
          <h2 className="text-[15px] font-semibold tracking-tight">
            {t("watchlistManage")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--muted)] hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <SymbolWatchlistManageSidebar
            group={group}
            onSelect={selectGroup}
            counts={counts}
            groups={groups}
            busy={busy}
            onCreate={() => void createGroup()}
            editingId={editingId}
            editName={editName}
            onEditName={setEditName}
            onCommitRename={() => void commitRename()}
            onCancelRename={() => {
              setEditingId(null);
              void groupsQuery.refetch();
            }}
            onStartRename={(id, name) => {
              setEditingId(id);
              setEditName(name);
            }}
            editRef={editRef}
            labels={{
              createGroup: t("watchlistCreateGroup"),
              groupAll: t("watchlistGroupAll"),
              stocks: tMarket("stocks"),
              hk: tMarket("hk"),
              cn: tMarket("cn"),
              crypto: tMarket("crypto"),
            }}
          />

          <SymbolWatchlistManagePanel
            title={title}
            showAdd={showAdd}
            onToggleAdd={() => {
              setShowAdd((v) => !v);
              setQ("");
              setDebouncedQ("");
            }}
            addType={addType}
            onAddType={setAddType}
            q={q}
            onQ={setQ}
            results={results}
            onAddSymbol={(symbol, assetType) =>
              void addSymbol(symbol, assetType)
            }
            busy={busy}
            loading={loading && !isCustom(group)}
            filtered={filtered}
            selected={selected}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            allSelected={allSelected}
            someSelected={someSelected}
            marketLabel={marketLabel}
            groups={groups}
            showAddToGroup={!isCustom(group)}
            onAddToGroup={(gid) => void addSelectedToGroup(gid)}
            onRemoveSelected={() => void removeSelected()}
            labels={{
              addWatch: tMarket("addWatch"),
              search: tMarket("search"),
              stocks: tMarket("stocks"),
              hk: tMarket("hk"),
              cn: tMarket("cn"),
              crypto: tMarket("crypto"),
              colCode: t("watchlistColCode"),
              colName: t("watchlistColName"),
              colMarket: t("watchlistColMarket"),
              loading: tCommon("loading"),
              empty: t("watchlistGroupEmpty"),
              selectAll: t("watchlistSelectAll"),
              addTo: t("watchlistAddTo"),
              deleteSelected: t("watchlistDeleteSelected"),
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
