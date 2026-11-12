"use client";

import { useState } from "react";
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
import { InlineLoading, PanelSkeleton } from "@/components/ui/panel-skeleton";
import { useMounted } from "@/hooks/use-mounted";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
};

/** Inline AI desk for desktop stack bottom panel (no SideDrawer). */
export function SymbolStackAiPane({ symbol, assetType }: Props) {
  const t = useTranslations("symbol");
  const mounted = useMounted();
  const { status } = useSession();
  const [view, setView] = useState<"desk" | "history">("desk");
  const [loadSessionId, setLoadSessionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const chart = useAiChartRead(symbol, assetType);

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-[12rem] flex-col gap-4 p-4">
        <InlineLoading label={t("openAi")} />
        <PanelSkeleton rows={4} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <AiLoginGate className="min-h-full py-10" />;
  }

  if (view === "history") {
    return (
      <div className="aw-stack-ai aw-stack-ai-pad aw-ai-desk-body min-h-0 flex-1 overflow-y-auto py-2 qt-scroll">
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
    );
  }

  return (
    <div className="aw-stack-ai aw-ai-desk flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="aw-stack-ai-toolbar aw-stack-ai-pad flex h-9 shrink-0 items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))]">
        <AiQuotaBadge className="aw-ai-quota-inline" />
        <AiChartReadHeaderActions chart={chart} />
      </div>
      <div className="aw-ai-desk-body flex min-h-0 flex-1 flex-col overflow-hidden">
        <AiChartReadPanel
          key={`chart-${assetType}-${symbol}`}
          symbol={symbol}
          assetType={assetType}
          layout="page"
          chart={chart}
        />
        <div className="aw-stack-ai-chat-host flex min-h-0 flex-1 flex-col overflow-hidden">
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
      </div>
    </div>
  );
}
