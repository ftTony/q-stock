"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  useAddWatchlistGroupItems,
  useWatchlistGroups,
} from "@/hooks/query/use-watchlist-groups";
import type { AssetType } from "@/lib/types";

export type ChartContextMenuState = {
  x: number;
  y: number;
} | null;

type Props = {
  open: ChartContextMenuState;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  inWatchlist: boolean;
  watchBusy?: boolean;
  onToggleWatchlist: () => void | Promise<void>;
  onSoon?: (feature: "rangeStats" | "overlay") => void;
};

function MenuItem({
  label,
  onClick,
  disabled,
  danger,
  trailing,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[13px] transition ${
        disabled
          ? "cursor-not-allowed text-[var(--muted)] opacity-60"
          : danger
            ? "text-[var(--down)] hover:bg-[var(--surface-2)]"
            : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
      }`}
    >
      <span>{label}</span>
      {trailing}
    </button>
  );
}

/** Futu-style chart right-click menu (portal). */
export function SymbolChartContextMenu({
  open,
  onClose,
  symbol,
  assetType,
  inWatchlist,
  watchBusy,
  onToggleWatchlist,
  onSoon,
}: Props) {
  const t = useTranslations("symbol");
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const [mounted, setMounted] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const groupsQuery = useWatchlistGroups(signedIn && Boolean(open));
  const addToGroup = useAddWatchlistGroupItems();
  const groups = groupsQuery.data?.groups ?? [];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setGroupsOpen(false);
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onDoc(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const pad = 8;
  const approxW = 180;
  const approxH = 160;
  const left = Math.min(
    open.x,
    Math.max(pad, window.innerWidth - approxW - pad),
  );
  const top = Math.min(
    open.y,
    Math.max(pad, window.innerHeight - approxH - pad),
  );

  async function handleToggleWatch() {
    await onToggleWatchlist();
    onClose();
  }

  async function handleAddToGroup(groupId: string) {
    if (!signedIn) {
      await onToggleWatchlist();
      onClose();
      return;
    }
    try {
      await addToGroup.mutateAsync({
        groupId,
        symbol,
        assetType,
      });
    } finally {
      onClose();
    }
  }

  return createPortal(
    <div
      ref={rootRef}
      role="menu"
      aria-label={t("chartCtxMenu")}
      style={{ top, left }}
      className="fixed z-[95] min-w-[11rem] overflow-visible rounded-md border border-[var(--border)] bg-[var(--panel)] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
      <MenuItem
        label={inWatchlist ? t("chartCtxRemoveWatch") : t("chartCtxAddWatch")}
        disabled={watchBusy}
        onClick={() => void handleToggleWatch()}
      />

      <div
        className="relative"
        onMouseEnter={() => setGroupsOpen(true)}
        onMouseLeave={() => setGroupsOpen(false)}
      >
        <MenuItem
          label={t("chartCtxAddToGroup")}
          onClick={() => setGroupsOpen((v) => !v)}
          trailing={
            <span className="text-[10px] text-[var(--muted)]" aria-hidden>
              ›
            </span>
          }
        />
        {groupsOpen ? (
          <div
            role="menu"
            className="absolute left-full top-0 z-[96] ml-0.5 min-w-[9rem] rounded-md border border-[var(--border)] bg-[var(--panel)] py-1 shadow-lg"
          >
            {!signedIn ? (
              <p className="px-3 py-2 text-[12px] text-[var(--muted)]">
                {t("chartCtxLogin")}
              </p>
            ) : groups.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[var(--muted)]">
                {t("chartCtxNoGroups")}
              </p>
            ) : (
              groups.map((g) => (
                <MenuItem
                  key={g.id}
                  label={g.name}
                  disabled={addToGroup.isPending}
                  onClick={() => void handleAddToGroup(g.id)}
                />
              ))
            )}
          </div>
        ) : null}
      </div>

      <MenuItem
        label={t("chartCtxRangeStats")}
        onClick={() => {
          onSoon?.("rangeStats");
          onClose();
        }}
      />
      <MenuItem
        label={t("chartCtxOverlay")}
        onClick={() => {
          onSoon?.("overlay");
          onClose();
        }}
      />
    </div>,
    document.body,
  );
}
