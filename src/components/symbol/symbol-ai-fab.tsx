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

export function SymbolAiFab(props: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"desk" | "history">("desk");
  const [loadSessionId, setLoadSessionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const label = t("openAi");
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
    setView("desk");
    setLoadSessionId(null);
    setActiveSessionId(null);
  }, [props.symbol, props.assetType]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={() => {
          setView("desk");
          setOpen(true);
        }}
        className={`fixed z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md transition hover:brightness-110 active:scale-[0.97] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] lg:bottom-6 lg:right-6 ${
          open
            ? "pointer-events-none scale-95 opacity-0"
            : "opacity-100"
        }`}
      >
        <IconRobot className="h-6 w-6" />
      </button>

      <SideDrawer
        open={open}
        onClose={close}
        title={
          view === "history"
            ? t("aiHistoryTitle", { symbol: props.symbol })
            : t("aiDeskTitle", { symbol: props.symbol })
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
          <div className="p-5 pb-8">
            <AiChatHistoryPanel
              symbol={props.symbol}
              assetType={props.assetType}
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
          <div className="space-y-2 p-5 pb-8 text-[15px]">
            <AiQuotaBadge className="mb-2 text-sm" />
            <AiChartReadPanel
              key={`chart-${props.assetType}-${props.symbol}`}
              symbol={props.symbol}
              assetType={props.assetType}
              layout="page"
            />
            <AiChatPanel
              key={`chat-${props.assetType}-${props.symbol}`}
              symbol={props.symbol}
              assetType={props.assetType}
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
