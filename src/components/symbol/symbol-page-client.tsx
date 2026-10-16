"use client";

import { useCallback, useMemo, useState } from "react";
import { SymbolAiFab } from "@/components/symbol/symbol-ai-fab";
import { SymbolChartSection } from "@/components/symbol/symbol-chart-section";
import { SymbolOrderRail } from "@/components/symbol/symbol-order-rail";
import { SymbolQuoteBar } from "@/components/symbol/symbol-quote-bar";
import { SymbolRailStats } from "@/components/symbol/symbol-rail-stats";
import { SymbolTabsPanel } from "@/components/symbol/symbol-tabs-panel";
import { useSymbolPage } from "@/components/symbol/use-symbol-page";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";
import "./apple-workbench.css";
import "./apple-quote-chrome.css";

type Props = {
  symbol: string;
  assetType: AssetType;
  initialQuote?: Quote | null;
};

function metricOf(
  metrics: { metric?: string; value?: number | null }[],
  key: string,
): number | null {
  const hit = metrics.find((m) => m.metric === key);
  const v = hit?.value;
  return v != null && Number.isFinite(v) ? v : null;
}

export function SymbolPageClient({
  symbol,
  assetType,
  initialQuote = null,
}: Props) {
  const isIndex = isMarketIndexSymbol(symbol);
  const s = useSymbolPage(symbol, assetType, isIndex, initialQuote);
  const [aiOpen, setAiOpen] = useState(false);
  const [quoteBusy, setQuoteBusy] = useState(false);

  const marketCap = useMemo(() => {
    const m = metricOf(s.earningsMetrics, "marketCapitalization");
    // Finnhub marketCapitalization is in millions
    return m != null ? m * 1e6 : null;
  }, [s.earningsMetrics]);

  const resolutionLabels = {
    T: s.t("intraday"),
    "1": s.t("min1"),
    "5": s.t("min5"),
    D: s.t("day"),
    Q: s.t("quarter"),
    Y: s.t("year"),
  } satisfies Record<CandleResolution, string>;

  const refreshQuote = useCallback(async () => {
    setQuoteBusy(true);
    try {
      await s.loadQuote();
    } finally {
      setQuoteBusy(false);
    }
  }, [s.loadQuote]);

  return (
    <div className="aw aw-stack flex min-h-0 flex-1 flex-col bg-[#e6edf6] lg:overflow-hidden">
      <div className="shrink-0">
        <SymbolQuoteBar
          symbol={symbol}
          assetType={assetType}
          quote={s.quote}
          updatedAt={s.updatedAt}
          inWatchlist={s.inWatchlist}
          watchBusy={s.watchBusy}
          onToggleWatchlist={() => void s.toggleWatchlist()}
          onOpenAi={() => setAiOpen(true)}
          onRefresh={() => void refreshQuote()}
          refreshBusy={quoteBusy}
          marketCap={marketCap}
          alert={{
            condition: s.alertCondition,
            onConditionChange: s.setAlertCondition,
            price: s.alertPrice,
            onPriceChange: s.setAlertPrice,
            busy: s.alertBusy,
            message: s.alertMsg,
            onSubmit: s.createAlert,
          }}
        />
      </div>

      <div className="aw-workbench-grid min-h-0 flex-1 lg:overflow-hidden">
        <div className="aw-stack-y flex min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          <SymbolTabsPanel
            tabs={s.tabs}
            tab={s.tab}
            onTabChange={s.setTab}
            chartSlot={
              <SymbolChartSection
                resolution={s.resolution}
                onResolutionChange={s.setResolution}
                resolutionLabels={resolutionLabels}
                indicatorsLabel={s.t("indicators")}
                intradayUnavailableLabel={s.t("intradayUnavailable")}
                flags={s.flags}
                onFlagToggle={(key) =>
                  s.setFlags((f) => ({ ...f, [key]: !f[key] }))
                }
                loadingChart={s.loadingChart}
                loadingLabel={s.tCommon("loading")}
                bars={s.bars}
                assetType={assetType}
                symbol={symbol}
                onLoadMore={s.loadMoreCandles}
                loadingMore={s.loadingMoreCandles}
                hasMore={s.hasMoreCandles}
              />
            }
            degraded={s.degraded}
            degradedLabel={s.tCommon("degraded")}
            tabLoading={s.tabLoading}
            loadingLabel={s.tCommon("loading")}
            symbol={symbol}
            assetType={assetType}
            isIndex={isIndex}
            lastPrice={s.quote?.price ?? null}
            news={s.news}
            press={s.press}
            earnings={s.earnings}
            earningsUpcoming={s.earningsUpcoming}
            earningsRecent={s.earningsRecent}
            earningsMetrics={s.earningsMetrics}
            earningsLoading={s.earningsLoading}
            earningsCryptoNa={s.tEarnings("cryptoNa")}
            company={s.company}
            officers={s.officers}
            comments={s.comments}
            commentText={s.commentText}
            onCommentTextChange={s.setCommentText}
            onPostComment={s.postComment}
            onDeleteComment={s.deleteComment}
            commentBusy={s.commentBusy}
            canComment={Boolean(s.session?.user)}
            currentUserId={s.session?.user?.id}
            commentsPlaceholder={s.tComments("placeholder")}
            commentsPost={s.tComments("post")}
            commentsLoginRequired={s.tComments("loginRequired")}
            commentsEmpty={s.tComments("empty")}
            commentsDelete={s.tComments("delete")}
            errorLabel={s.tCommon("error")}
            sentiment={s.sentiment}
            aiAvailable={s.aiAvailable}
            aiMessage={s.aiMessage}
            aiAnalysis={s.aiAnalysis}
            aiDisclaimer={s.aiDisclaimer}
            aiCached={s.aiCached}
            aiLoading={s.aiLoading}
            aiRefreshing={s.aiRefreshing}
            aiToast={s.aiToast}
            aiToastKey={s.aiToastKey}
            onClearAiToast={s.clearAiToast}
            onRegenerateAi={
              s.session?.user ? () => void s.regenerateAi() : undefined
            }
            aiRegenerateLabel={s.t("aiRegenerate")}
          />
        </div>

        <aside className="aw-workbench-rail aw-region min-h-0 gap-0 overflow-hidden bg-[var(--aw-canvas)]">
          <div className="shrink-0">
            <SymbolRailStats quote={s.quote} marketCap={marketCap} />
          </div>
          <SymbolOrderRail
            symbol={symbol}
            assetType={assetType}
            lastPrice={s.quote?.price ?? null}
            bid={s.quote?.bid ?? null}
            ask={s.quote?.ask ?? null}
            onOpenAi={() => setAiOpen(true)}
            isIndex={isIndex}
          />
        </aside>
      </div>

      <SymbolAiFab
        symbol={symbol}
        assetType={assetType}
        open={aiOpen}
        onOpenChange={setAiOpen}
        showFab
      />
    </div>
  );
}
