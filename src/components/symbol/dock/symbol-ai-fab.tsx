"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { AiQuotaBadge } from "@/components/ai/ai-quota-badge";
import {
  AiChartReadHeaderActions,
  AiChartReadPanel,
} from "@/components/market/ai-chart-read-panel";
import { AiChatHistoryPanel } from "@/components/market/ai-chat-history-panel";
import { AiChatPanel } from "@/components/market/ai-chat-panel";
import { useAiChartRead } from "@/components/market/use-ai-chart-read";
import { IconRobot } from "@/components/ui/icon-robot";
import { InlineLoading, PanelSkeleton } from "@/components/ui/panel-skeleton";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AssetType } from "@/lib/types";
import "../styles/apple-workbench.css";
import "../styles/apple-ai-desk.css";

type Props = {
  symbol: string;
  assetType: AssetType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Mobile secondary entry; desktop can hide when QuoteBar has AI. */
  showFab?: boolean;
  /** Leave room for desktop side dock; 0 on H5. */
  edgeOffsetPx?: number;
};

export function SymbolAiFab({
  symbol,
  assetType,
  open: openProp,
  onOpenChange,
  showFab = true,
  edgeOffsetPx = 0,
}: Props) {
  const t = useTranslations("symbol");
  const { status } = useSession();
  const [innerOpen, setInnerOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = openProp ?? innerOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (!controlled) setInnerOpen(next);
    },
    [onOpenChange, controlled],
  );
  const [view, setView] = useState<"desk" | "history">("desk");
  const [loadSessionId, setLoadSessionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const chart = useAiChartRead(symbol, assetType);
  const label = t("openAi");
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Close only when symbol/asset actually changes — not on mount.
  // (Strict Mode re-runs effects; a "skip first" boot flag would close on the
  // second run and swallow the first open after deferred AI mount.)
  const symbolKeyRef = useRef(`${assetType}:${symbol}`);
  useEffect(() => {
    const key = `${assetType}:${symbol}`;
    if (symbolKeyRef.current === key) return;
    symbolKeyRef.current = key;
    onOpenChange?.(false);
    if (!controlled) setInnerOpen(false);
    setView("desk");
    setLoadSessionId(null);
    setActiveSessionId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- symbol switch only
  }, [symbol, assetType]);

  const deskAuthed = view === "desk" && status === "authenticated";
  const deskTrailing = deskAuthed ? (
    <AiChartReadHeaderActions chart={chart} />
  ) : null;
  const deskSubtitleAside = deskAuthed ? (
    <AiQuotaBadge className="aw-ai-quota-inline" />
  ) : null;

  return (
    <>
      {showFab ? (
        <button
          type="button"
          aria-label={label}
          title={label}
          suppressHydrationWarning
          onClick={() => {
            setView("desk");
            setOpen(true);
          }}
          className={`fixed z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md transition hover:brightness-110 active:scale-[0.97] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] lg:hidden ${
            open ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
          }`}
        >
          <IconRobot className="h-6 w-6" />
        </button>
      ) : null}

      <SideDrawer
        open={open}
        onClose={close}
        className="aw aw-ai-desk"
        edgeOffsetPx={edgeOffsetPx}
        title={
          view === "history"
            ? t("aiHistoryTitle", { symbol })
            : t("aiDeskTitle", { symbol })
        }
        subtitle={
          view === "history" ? t("aiHistorySubtitle") : t("aiDeskSubtitle")
        }
        subtitleAside={deskSubtitleAside}
        headerTrailing={deskTrailing}
      >
        {status === "loading" ? (
          <div className="flex min-h-[12rem] flex-col gap-4 p-5">
            <InlineLoading label={t("openAi")} />
            <PanelSkeleton rows={4} />
          </div>
        ) : status === "unauthenticated" ? (
          <AiLoginGate className="min-h-full py-16" />
        ) : view === "history" ? (
          <div className="aw-ai-desk-body min-h-0 flex-1">
            <AiChatHistoryPanel
              symbol={symbol}
              assetType={assetType}
              activeSessionId={activeSessionId}
              onClose={() => setView("desk")}
              onSelect={(id) => {
                setActiveSessionId(id);
                setLoadSessionId(id);
                setView("desk");
              }}
              onDeleted={(id) => {
                if (activeSessionId === id) {
                  setActiveSessionId(null);
                  setLoadSessionId(null);
                }
              }}
            />
          </div>
        ) : (
          <div className="aw-ai-desk-body min-h-0 flex-1">
            <AiChartReadPanel
              key={`chart-${assetType}-${symbol}`}
              symbol={symbol}
              assetType={assetType}
              layout="page"
              chart={chart}
            />
            <AiChatPanel
              key={`chat-${assetType}-${symbol}`}
              symbol={symbol}
              assetType={assetType}
              layout="page"
              onOpenHistory={() => setView("history")}
              loadSessionId={loadSessionId}
              onLoadSessionDone={() => setLoadSessionId(null)}
            />
          </div>
        )}
      </SideDrawer>
    </>
  );
}
