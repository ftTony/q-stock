"use client";

import {
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";
import {
  SymbolDesktopRail,
  SymbolSideIconRail,
  SymbolWatchlistPanel,
} from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolPageChartSlot } from "@/components/symbol/chart/symbol-page-chart-slot";
import { SymbolH5BelowSlot } from "@/components/symbol/page/symbol-h5-below-slot";
import { SymbolPageOverlays } from "@/components/symbol/page/symbol-page-overlays";
import { SymbolQuoteBar } from "@/components/symbol/quote/symbol-quote-bar";
import { feedStatusFromWs } from "@/components/symbol/quote/symbol-feed-status";
import { SymbolPageTabs } from "@/components/symbol/page/symbol-page-tabs";
import {
  candleResolutionLabels,
  panelTabFor,
} from "@/components/symbol/page/symbol-page-tab-utils";
import { useSymbolPage } from "@/components/symbol/hooks/use-symbol-page";
import { useSymbolWorkbenchPanels } from "@/components/symbol/hooks/use-symbol-workbench-panels";
import { useRailResize } from "@/components/symbol/hooks/use-rail-resize";
import { useWatchlistResize } from "@/components/symbol/hooks/use-watchlist-resize";
import { TopToast } from "@/components/ui/top-toast";
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType, OhlcvBar, Quote } from "@/lib/types";
import "./styles/apple-workbench.css";
import "./styles/apple-quote-chrome.css";

type Props = {
  symbol: string;
  assetType: AssetType;
  initialQuote?: Quote | null;
  initialBars?: OhlcvBar[] | null;
  seoCopy: SymbolSeoCopy;
  seoPeers: string[];
};

export function SymbolPageClient({
  symbol,
  assetType,
  initialQuote = null,
  initialBars = null,
  seoCopy,
  seoPeers,
}: Props) {
  const isIndex = isMarketIndexSymbol(symbol);
  const isDesktop = useMinWidth(LG_MIN);
  const rail = useRailResize();
  const watch = useWatchlistResize();
  const s = useSymbolPage(symbol, assetType, isIndex, initialQuote, {
    initialBars,
    // Desktop: earnings when plan rail open. H5 plan-first — skip competing fetch.
    prefetchEarnings: isDesktop ? rail.open : false,
  });

  const desktopQuoteTabs = useMemo(
    () => s.tabs.filter((x) => x.id !== "news" && x.id !== "press"),
    [s.tabs],
  );
  const mobileMoreTabs = useMemo(
    () =>
      s.tabs.filter(
        (x) => x.id !== "chart" && x.id !== "press" && x.id !== "comments",
      ),
    [s.tabs],
  );

  const p = useSymbolWorkbenchPanels({
    symbol,
    assetType,
    isDesktop,
    setRailOpen: rail.setOpen,
    setTab: s.setTab,
    tab: s.tab,
    mobileMoreTabs,
  });

  const marketCap = useMemo(() => {
    const hit = s.earningsMetrics.find((m) => m.key === "marketCapitalization");
    const v = hit?.value;
    return v != null && Number.isFinite(v) ? v * 1e6 : null;
  }, [s.earningsMetrics]);

  const panelTab = panelTabFor(isDesktop, s.tab);
  const resolutionLabels = useMemo(() => candleResolutionLabels(s.t), [s.t]);
  const newsFeedTab = s.tab === "press" ? "press" : "news";
  const resizing = rail.dragging || watch.dragging;

  const onToggleWatchlist = useCallback(() => {
    void s.toggleWatchlist();
  }, [s.toggleWatchlist]);

  const chartSlot = (
    <SymbolPageChartSlot
      resolution={s.resolution}
      onResolutionChange={s.setResolution}
      resolutionLabels={resolutionLabels}
      indicatorsLabel={s.t("indicators")}
      intradayUnavailableLabel={s.t("intradayUnavailable")}
      flags={s.flags}
      onFlagsChange={s.setFlags}
      loadingChart={s.loadingChart}
      loadingLabel={s.tCommon("loading")}
      bars={s.bars}
      assetType={assetType}
      symbol={symbol}
      onLoadMore={s.loadMoreCandles}
      loadingMore={s.loadingMoreCandles}
      hasMore={s.hasMoreCandles}
      inWatchlist={s.inWatchlist}
      watchBusy={s.watchBusy}
      onToggleWatchlist={onToggleWatchlist}
    />
  );

  return (
    <div
      className="aw aw-stack flex h-full min-h-0 max-w-full flex-1 flex-col overflow-hidden bg-[var(--aw-canvas)]"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <TopToast
        key={s.toastKey}
        message={s.toastMsg}
        tone={s.toastTone}
        onDismiss={s.clearToast}
      />
      <div
        className="aw-symbol-shell relative flex min-h-0 flex-1 overflow-hidden"
        data-resizing={resizing ? "true" : undefined}
        style={
          {
            ["--aw-rail-width"]: `${rail.width}px`,
            ["--aw-watchlist-width"]: `${watch.width}px`,
          } as CSSProperties
        }
      >
        {isDesktop && watch.open ? (
          <>
            <SymbolWatchlistPanel
              currentSymbol={symbol}
              currentAssetType={assetType}
              onCollapse={() => watch.setOpen(false)}
            />
            <button
              type="button"
              className="aw-watchlist-resizer"
              aria-label={s.t("resizeWatchlist")}
              data-dragging={watch.dragging ? "true" : undefined}
              onPointerDown={watch.onResizeStart}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  watch.nudgeWidth(12);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  watch.nudgeWidth(-12);
                }
              }}
            />
          </>
        ) : null}

        <div className="aw-workbench-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <SymbolQuoteBar
              symbol={symbol}
              assetType={assetType}
              quote={s.quote}
              boundRuleName={p.boundRuleName}
              onOpenPlan={p.openPlan}
              onOpenTrade={p.openTrade}
              feedStatus={feedStatusFromWs({
                enabled: s.wsEnabled,
                connected: s.wsConnected,
                degraded: s.wsDegraded,
                push: s.wsPush,
              })}
              tabs={isDesktop ? desktopQuoteTabs : undefined}
              tab={isDesktop ? panelTab : undefined}
              onTabChange={
                isDesktop
                  ? (id) => {
                      p.setAiOpen(false);
                      p.setMobilePlanOpen(false);
                      if (id === "news" || id === "press") p.setDock("news");
                      else p.setDock(null);
                      s.setTab(id);
                    }
                  : undefined
              }
              showWatchlistExpand={isDesktop && !watch.open}
              onExpandWatchlist={
                isDesktop ? () => watch.setOpen(true) : undefined
              }
              aboutLabel={seoCopy.aboutLabel}
              onOpenAbout={() => {
                p.setAiOpen(false);
                p.setDock(null);
                p.setMobilePlanOpen(false);
                p.setSeoOpen(true);
              }}
            />
          </div>

          {/*
            Icon dock stays in the grid (aligned with chart toolbar), not
            stretched beside the quote bar. Quote bar uses pr dock-width so
            actions do not peek into the drawer edgeOffset strip.
          */}
          <div
            className="aw-workbench-grid relative min-h-0 flex-1 lg:overflow-hidden"
            data-resizing={rail.dragging ? "true" : undefined}
          >
            <div
              id="symbol-main-panel"
              role="tabpanel"
              aria-labelledby={
                isDesktop ? `symbol-quote-tab-${panelTab}` : undefined
              }
              className="aw-stack-y flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--aw-canvas)]"
            >
              <SymbolPageTabs
                s={s}
                tab={panelTab}
                chartSlot={chartSlot}
                chartPinned={!isDesktop}
                belowChartSlot={
                  isDesktop
                    ? null
                    : ({ secondary }) => (
                        <SymbolH5BelowSlot
                          secondary={secondary}
                          symbol={symbol}
                          assetType={assetType}
                          isIndex={isIndex}
                          quote={s.quote}
                          metrics={s.earningsMetrics}
                          marketCap={marketCap}
                          segment={p.mobileSegment}
                          onSegmentChange={p.onMobileSegment}
                          onOpenTrade={p.openTrade}
                          focusPlanToken={p.planFocusKey}
                          onBoundStrategyChange={p.onBoundStrategyChange}
                          panelTab={panelTab}
                          moreTabs={mobileMoreTabs}
                          onMoreTabChange={p.onMoreTabChange}
                        />
                      )
                }
                symbol={symbol}
                assetType={assetType}
                isIndex={isIndex}
                lastPrice={s.quote?.price ?? null}
              />
            </div>

            {isDesktop && rail.open ? (
              <SymbolDesktopRail
                symbol={symbol}
                assetType={assetType}
                isIndex={isIndex}
                quote={s.quote}
                updatedAt={s.updatedAt}
                inWatchlist={s.inWatchlist}
                watchBusy={s.watchBusy}
                onToggleWatchlist={onToggleWatchlist}
                alertCondition={s.alertCondition}
                onAlertConditionChange={s.setAlertCondition}
                alertPrice={s.alertPrice}
                onAlertPriceChange={s.setAlertPrice}
                alertBusy={s.alertBusy}
                alertMessage={s.alertMsg}
                onAlertSubmit={s.createAlert}
                metrics={s.earningsMetrics}
                marketCap={marketCap}
                focusPlanToken={p.planFocusKey}
                onBoundStrategyChange={p.onBoundStrategyChange}
                onRequestOrder={p.openTrade}
                dragging={rail.dragging}
                onResizeStart={rail.onResizeStart}
                onResizeKeyNudge={rail.nudgeWidth}
              />
            ) : null}

            {isDesktop ? (
              <SymbolSideIconRail
                active={p.sideIcon}
                onSelect={p.onSideSelect}
                railOpen={rail.open}
                onToggleRail={() => rail.setOpen((v) => !v)}
              />
            ) : null}
          </div>
        </div>
      </div>

      <SymbolPageOverlays
        isDesktop={isDesktop}
        dockReady={p.dockReady}
        dock={p.dock}
        onCloseDock={p.closeDock}
        symbol={symbol}
        assetType={assetType}
        isIndex={isIndex}
        lastPrice={s.quote?.price ?? null}
        percentChange={s.quote?.percentChange ?? null}
        quoteName={s.quote?.name ?? null}
        bid={s.quote?.bid ?? null}
        ask={s.quote?.ask ?? null}
        boundStrategyId={p.boundStrategyId}
        boundRuleName={p.boundRuleName}
        onBoundStrategyChange={p.onBoundStrategyChange}
        onOpenAi={() => {
          p.setAiOpen(true);
          p.setDock(null);
          p.setMobilePlanOpen(false);
        }}
        onOpenPlan={() => {
          p.setDock(null);
          p.openPlan();
        }}
        newsFeedTab={newsFeedTab}
        onNewsFeedTabChange={(tab) => s.setTab(tab)}
        news={s.news}
        press={s.press}
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
        commentsEmpty={s.tComments("empty")}
        commentsDelete={s.tComments("delete")}
        tabLoading={s.tabLoading}
        degraded={s.degraded}
        degradedLabel={s.tCommon("degraded")}
        errorLabel={s.tCommon("error")}
        loadingLabel={s.tCommon("loading")}
        mobilePlanReady={p.mobilePlanReady}
        mobilePlanOpen={p.mobilePlanOpen}
        onCloseMobilePlan={() => p.setMobilePlanOpen(false)}
        focusPlanToken={p.planFocusKey}
        onRequestOrder={p.openTrade}
        aiReady={p.aiReady}
        aiOpen={p.aiOpen}
        onAiOpenChange={(open) => {
          p.setAiOpen(open);
          if (open) {
            p.setDock(null);
            p.setMobilePlanOpen(false);
            p.setSeoOpen(false);
          }
        }}
        seoOpen={p.seoOpen}
        onSeoOpenChange={p.setSeoOpen}
        seoCopy={seoCopy}
        seoPeers={seoPeers}
      />
    </div>
  );
}
