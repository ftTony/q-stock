"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SymbolPageChartSlot } from "@/components/symbol/chart/symbol-page-chart-slot";
import { SymbolPageOverlays } from "@/components/symbol/page/symbol-page-overlays";
import { SymbolWorkbenchBody } from "@/components/symbol/page/symbol-workbench-body";
import {
  SymbolNavPendingProvider,
} from "@/components/symbol/page/symbol-nav-pending";
import {
  candleResolutionLabels,
  panelTabFor,
} from "@/components/symbol/page/symbol-page-tab-utils";
import { useSymbolPage } from "@/components/symbol/hooks/use-symbol-page";
import { useSymbolWorkbenchPanels } from "@/components/symbol/hooks/use-symbol-workbench-panels";
import { useRailResize } from "@/components/symbol/hooks/use-rail-resize";
import { useWatchlistResize } from "@/components/symbol/hooks/use-watchlist-resize";
import {
  useSymbolLayoutPrefs,
  type LayoutModuleKey,
} from "@/components/symbol/hooks/use-symbol-layout-prefs";
import { clearStackBottomHeight } from "@/components/symbol/hooks/use-stack-bottom-resize";
import { feedStatusFromWs } from "@/components/symbol/quote/symbol-feed-status";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import { TopToast } from "@/components/ui/top-toast";
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";
import { markPrice } from "@/lib/market/extended-hours";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType, OhlcvBar, Quote } from "@/lib/types";
import type { QuoteHeaderLabels } from "@/components/charts/candle-chart";
import { useSymbolWorkbenchStore } from "@/stores/symbol-workbench-store";
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
  const tLayout = useTranslations("symbolLayout");
  const tNav = useTranslations("nav");
  const tSymbol = useTranslations("symbol");
  const layout = useSymbolLayoutPrefs();
  const isStack = isDesktop && layout.prefs.layoutMode === "stack";
  const rail = useRailResize();
  const watch = useWatchlistResize();
  const stackTab = useSymbolWorkbenchStore((state) => state.stackTab);
  const setStackTab = useSymbolWorkbenchStore((state) => state.setStackTab);
  const setAiOverlayOpen = useSymbolWorkbenchStore(
    (state) => state.onAiOpenChange,
  );
  const newsFeedTab = useSymbolWorkbenchStore((state) => state.newsFeedTab);
  const identity = useSymbolWorkbenchStore((state) => state.identity);
  const setIdentity = useSymbolWorkbenchStore((state) => state.setIdentity);
  const resetForIdentity = useSymbolWorkbenchStore(
    (state) => state.resetForIdentity,
  );
  const identityRef = useRef(identity);
  const [stackKey, setStackKey] = useState(0);

  useLayoutEffect(() => {
    const previous = identityRef.current;
    const next = { symbol, assetType };
    if (previous.symbol === "") {
      setIdentity(next);
    } else if (
      previous.symbol !== symbol ||
      previous.assetType !== assetType
    ) {
      resetForIdentity(next);
    }
    identityRef.current = next;
  }, [assetType, resetForIdentity, setIdentity, symbol]);

  useLayoutEffect(() => {
    if (!layout.ready || !isDesktop) return;
    watch.setOpen(layout.prefs.modules.watchlist);
    rail.setOpen(layout.prefs.modules.rail);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate sync only
  }, [layout.ready, isDesktop]);

  const setWatchOpen = useCallback(
    (next: boolean | ((v: boolean) => boolean)) => {
      const value = typeof next === "function" ? next(watch.open) : next;
      if (value !== watch.open) watch.setOpen(value);
      layout.setModule("watchlist", value);
    },
    [watch.open, watch.setOpen, layout.setModule],
  );

  const setRailOpen = useCallback(
    (next: boolean | ((v: boolean) => boolean)) => {
      const value = typeof next === "function" ? next(rail.open) : next;
      if (value !== rail.open) rail.setOpen(value);
      layout.setModule("rail", value);
    },
    [rail.open, rail.setOpen, layout.setModule],
  );

  const s = useSymbolPage(symbol, assetType, isIndex, initialQuote, {
    initialBars,
    // Only prefetch earnings when rail is open or user is on fundamentals stack tabs.
    prefetchEarnings:
      isDesktop &&
      (rail.open || stackTab === "earnings" || stackTab === "profile"),
    // Stack defaults to news UI without flipping page tab off chart on first paint.
    prefetchNews: isStack && stackTab === "news",
    prefetchPress: isStack && stackTab === "news",
  });

  const desktopQuoteTabs = useMemo(() => {
    if (isStack) return s.tabs.filter((x) => x.id === "chart");
    return s.tabs.filter((x) => x.id !== "news" && x.id !== "press");
  }, [s.tabs, isStack]);

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
    setRailOpen,
    mobileMoreTabs,
  });

  useEffect(() => {
    if (layout.prefs.modules.newsDock) return;
    if (p.dock === "news") p.closeDock();
  }, [layout.prefs.modules.newsDock, p.dock, p.closeDock]);

  const onModuleChange = useCallback(
    (key: LayoutModuleKey, value: boolean) => {
      layout.setModule(key, value);
      if (key === "watchlist") watch.setOpen(value);
      if (key === "rail") rail.setOpen(value);
      if (key === "newsDock" && !value && p.dock === "news") p.closeDock();
    },
    [layout.setModule, watch.setOpen, rail.setOpen, p.dock, p.closeDock],
  );

  const onResetLayout = useCallback(() => {
    layout.resetLayout();
    watch.resetWidth();
    rail.resetWidth();
    clearStackBottomHeight();
    setStackKey((k) => k + 1);
    setStackTab("news");
    watch.setOpen(false);
    if (isDesktop) rail.setOpen(true);
  }, [
    layout.resetLayout,
    watch.resetWidth,
    rail.resetWidth,
    watch.setOpen,
    rail.setOpen,
    isDesktop,
    setStackTab,
  ]);

  /** Order ticket surface (desk CTA / plan「去下单」). */
  const openOrderTicket = useCallback(() => {
    p.openOrderTicket();
  }, [p]);

  /** Plan / review always use the right rail (side + stack). */
  const openPlan = useCallback(() => {
    p.closeDock();
    p.openPlan();
  }, [p]);

  const openSymbolReview = useCallback(
    (orderId?: string | null) => {
      p.closeDock();
      p.openReview(orderId);
    },
    [p],
  );

  const onSideSelect = useCallback(
    (id: SideIconId) => {
      if (!isStack) {
        p.onSideSelect(id);
        return;
      }
      p.setAiOpen(false);
      p.closeDock();
      if (id === "trade") setStackTab("trade");
      else if (id === "news") setStackTab("news");
      else if (id === "comments") setStackTab("comments");
      else if (id === "ai") setStackTab("ai");
    },
    [isStack, p, setStackTab],
  );

  const marketCap = useMemo(() => {
    const hit = s.earningsMetrics.find((m) => m.key === "marketCapitalization");
    const v = hit?.value;
    return v != null && Number.isFinite(v) ? v * 1e6 : null;
  }, [s.earningsMetrics]);

  const panelTab = isStack ? "chart" : panelTabFor(isDesktop, s.tab);
  const resolutionLabels = useMemo(() => candleResolutionLabels(s.t), [s.t]);
  const chartEnabled = !isDesktop || layout.prefs.modules.chart;

  const onToggleWatchlist = useCallback(() => {
    void s.toggleWatchlist();
  }, [s.toggleWatchlist]);

  // Live quote ticks must not re-render the memoized chart tree. Keep the
  // latest quote in a stable ref (only the screenshot reads it on demand).
  const quoteRef = useRef<Quote | null | undefined>(s.quote);
  quoteRef.current = s.quote;

  const quoteHeaderLabels = useMemo<QuoteHeaderLabels>(
    () => ({
      sessionOpen: tNav("marketOpen"),
      sessionClosed: tNav("marketClosed"),
      open: tSymbol("open"),
      high: tSymbol("high"),
      low: tSymbol("low"),
      prevClose: tSymbol("prevClose"),
      volume: tSymbol("volume"),
      turnover: tSymbol("turnover"),
    }),
    [tNav, tSymbol],
  );

  const chartSlot = chartEnabled ? (
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
      quoteRef={quoteRef}
      quoteHeaderLabels={quoteHeaderLabels}
      onLoadMore={s.loadMoreCandles}
      loadingMore={s.loadingMoreCandles}
      hasMore={s.hasMoreCandles}
      inWatchlist={s.inWatchlist}
      watchBusy={s.watchBusy}
      onToggleWatchlist={onToggleWatchlist}
    />
  ) : (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-[13px] text-[var(--muted)]">{tLayout("chartHidden")}</p>
      <button
        type="button"
        className="qt-btn qt-btn-primary"
        onClick={() => onModuleChange("chart", true)}
      >
        {tLayout("chartHiddenAction")}
      </button>
    </div>
  );

  return (
    <SymbolNavPendingProvider
      loadedSymbol={symbol}
      loadedAssetType={assetType}
    >
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
        <SymbolWorkbenchBody
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          isDesktop={isDesktop}
          isStack={isStack}
          layoutPrefs={layout.prefs}
          onLayoutModeChange={layout.setLayoutMode}
          onModuleChange={onModuleChange}
          onResetLayout={onResetLayout}
          s={s}
          p={p}
          rail={rail}
          watch={watch}
          setWatchOpen={setWatchOpen}
          setRailOpen={setRailOpen}
          panelTab={panelTab}
          desktopQuoteTabs={desktopQuoteTabs}
          mobileMoreTabs={mobileMoreTabs}
          chartSlot={chartSlot}
          feedStatus={feedStatusFromWs({
            enabled: s.wsEnabled,
            connected: s.wsConnected,
            degraded: s.wsDegraded,
            push: s.wsPush,
          })}
          marketCap={marketCap}
          stackTab={stackTab}
          setStackTab={setStackTab}
          stackKey={stackKey}
          newsFeedTab={newsFeedTab}
          openOrderTicket={openOrderTicket}
          openPlan={openPlan}
          openSymbolReview={openSymbolReview}
          onSideSelect={onSideSelect}
          onToggleWatchlist={onToggleWatchlist}
          aboutLabel={seoCopy.aboutLabel}
          onOpenAbout={() => p.setSeoOpen(true)}
          resizing={
            rail.dragging ||
            watch.dragging ||
            rail.settling ||
            watch.settling
          }
        />
        <SymbolPageOverlays
          isDesktop={isDesktop}
          isStack={isStack}
          dockReady={p.dockReady}
          dock={
            isStack
              ? p.dock === "trade"
                ? "trade"
                : null
              : p.dock
          }
          onCloseDock={p.closeDock}
          tradeDockView={isStack ? "ticket" : p.tradeDockView}
          onTradeDockViewChange={p.setTradeDockView}
          tradeTicketOnly={isStack}
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          lastPrice={markPrice(s.quote)}
          percentChange={s.quote?.percentChange ?? null}
          quoteName={s.quote?.name ?? null}
          bid={s.quote?.bid ?? null}
          ask={s.quote?.ask ?? null}
          boundStrategyId={p.boundStrategyId}
          boundRuleName={p.boundRuleName}
          onBoundStrategyChange={p.onBoundStrategyChange}
          onOpenAi={() => {
            if (isStack) {
              setStackTab("ai");
              p.closeDock();
              return;
            }
            p.setAiOpen(true);
          }}
          onOpenPlan={() => {
            openPlan();
          }}
          onOpenSymbolReview={openSymbolReview}
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
          newsReady={s.newsReady}
          pressReady={s.pressReady}
          degraded={s.degraded}
          degradedLabel={s.tCommon("degraded")}
          errorLabel={s.tCommon("error")}
          loadingLabel={s.tCommon("loading")}
          mobilePlanReady={p.mobilePlanReady}
          mobilePlanOpen={p.mobilePlanOpen}
          onCloseMobilePlan={() => p.setMobilePlanOpen(false)}
          focusPlanToken={p.planFocusKey}
          focusReviewToken={p.reviewFocusKey}
          highlightOrderId={p.highlightOrderId}
          onRequestOrder={openOrderTicket}
          inWatchlist={s.inWatchlist}
          watchBusy={s.watchBusy}
          onToggleWatchlist={onToggleWatchlist}
          aiReady={p.aiReady}
          aiOpen={isStack ? false : p.aiOpen}
          onAiOpenChange={(open) => setAiOverlayOpen(open, isStack)}
          seoOpen={p.seoOpen}
          onSeoOpenChange={p.setSeoOpen}
          seoCopy={seoCopy}
          seoPeers={seoPeers}
        />
      </div>
    </SymbolNavPendingProvider>
  );
}
