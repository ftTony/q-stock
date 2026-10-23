"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { AiQuotaBadge } from "@/components/ai/ai-quota-badge";
import { AiChartReadPanel } from "@/components/market/ai-chart-read-panel";
import { AiChatHistoryPanel } from "@/components/market/ai-chat-history-panel";
import { AiChatPanel } from "@/components/market/ai-chat-panel";
import { IconRobot } from "@/components/ui/icon-robot";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AssetType } from "@/lib/types";
import "./apple-workbench.css";
import "./apple-ai-desk.css";

type Props = {
  symbol: string;
  assetType: AssetType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Mobile secondary entry; desktop can hide when QuoteBar has AI. */
  showFab?: boolean;
};

export function SymbolAiFab({
  symbol,
  assetType,
  open: openProp,
  onOpenChange,
  showFab = true,
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
  const label = t("openAi");
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Reset only when the symbol changes (not when opening/closing).
  // Do not depend on setOpen — parent often passes an inline onOpenChange,
  // which would re-run this effect and immediately close the drawer.
  useEffect(() => {
    onOpenChange?.(false);
    if (!controlled) setInnerOpen(false);
    setView("desk");
    setLoadSessionId(null);
    setActiveSessionId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- symbol switch only
  }, [symbol, assetType]);

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
        edgeOffsetPx={0}
        title={
          view === "history"
            ? t("aiHistoryTitle", { symbol })
            : t("aiDeskTitle", { symbol })
        }
        subtitle={
          view === "history" ? t("aiHistorySubtitle") : t("aiDeskSubtitle")
        }
      >
        {status === "loading" ? (
          <p className="p-6 text-[14px] text-[var(--muted)]">…</p>
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
            <AiQuotaBadge className="aw-ai-quota shrink-0" />
            <AiChartReadPanel
              key={`chart-${assetType}-${symbol}`}
              symbol={symbol}
              assetType={assetType}
              layout="page"
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
