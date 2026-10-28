"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  SymbolDesktopRail,
  SymbolSideIconRail,
  SymbolWatchlistPanel,
} from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolPageChartSlot } from "@/components/symbol/chart/symbol-page-chart-slot";
import { SymbolH5BelowSlot } from "@/components/symbol/page/symbol-h5-below-slot";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import { SymbolPageOverlays } from "@/components/symbol/page/symbol-page-overlays";
import { SymbolQuoteBar } from "@/components/symbol/quote/symbol-quote-bar";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import { SymbolPageTabs } from "@/components/symbol/page/symbol-page-tabs";
import {
  candleResolutionLabels,
  panelTabFor,
} from "@/components/symbol/page/symbol-page-tab-utils";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";
import { useSymbolPage } from "@/components/symbol/hooks/use-symbol-page";
import { useRailResize } from "@/components/symbol/hooks/use-rail-resize";
import { useWatchlistResize } from "@/components/symbol/hooks/use-watchlist-resize";
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType, Quote } from "@/lib/types";
import "./styles/apple-workbench.css";
import "./styles/apple-quote-chrome.css";
type Props = {
  symbol: string;
  assetType: AssetType;
  initialQuote?: Quote | null;
  seoCopy: SymbolSeoCopy;
  seoPeers: string[];
};

type DockId = Exclude<SideIconId, "ai">;

export function SymbolPageClient({
  symbol,
  assetType,
  initialQuote = null,
  seoCopy,
  seoPeers,
}: Props) {
  const isIndex = isMarketIndexSymbol(symbol);
  const [aiOpen, setAiOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [dock, setDock] = useState<DockId | null>(null);
  const [dockReady, setDockReady] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [boundRuleName, setBoundRuleName] = useState<string | null>(null);
  const [boundStrategyId, setBoundStrategyId] = useState<string | null>(null);
  const [planFocusKey, setPlanFocusKey] = useState(0);
  const [mobileSegment, setMobileSegment] = useState<MobileSegment>("plan");
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const [mobilePlanReady, setMobilePlanReady] = useState(false);
  const isDesktop = useMinWidth(LG_MIN);
  const rail = useRailResize();
  const watch = useWatchlistResize();
  const s = useSymbolPage(symbol, assetType, isIndex, initialQuote, {
    // H5 default segment is plan — don't compete with quote/candles for earnings.
    prefetchEarnings: isDesktop
      ? rail.open
      : mobileSegment === "market",
  });

  useEffect(() => {
    setBoundRuleName(null);
    setBoundStrategyId(null);
    setDock(null);
    setAiOpen(false);
    setMobilePlanOpen(false);
    setMobileSegment("plan");
  }, [symbol, assetType]);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const v = q.get("guide") ?? q.get("onboarding");
      if (v === "1" || v === "true") {
        if (isDesktop) rail.setOpen(true);
        else {
          setMobileSegment("plan");
          setPlanFocusKey((k) => k + 1);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount / symbol
  }, [symbol, assetType, isDesktop]);

  useEffect(() => {
    if (mobilePlanOpen) setMobilePlanReady(true);
  }, [mobilePlanOpen]);

  const openPlan = useCallback(() => {
    setAiOpen(false);
    setDock(null);
    setPlanFocusKey((k) => k + 1);
    if (isDesktop) rail.setOpen(true);
    else {
      setMobileSegment("plan");
      s.setTab("chart");
    }
  }, [isDesktop, rail, s.setTab]);

  useEffect(() => {
    if (dock) setDockReady(true);
  }, [dock]);

  useEffect(() => {
    if (aiOpen) setAiReady(true);
  }, [aiOpen]);

  // H5: idle-warm AI chunk after first paint; stub FAB handles early taps.
  useEffect(() => {
    if (isDesktop || aiReady) return;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => setAiReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(warm, 2500);
    }
    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [isDesktop, aiReady]);

  const sideIcon: SideIconId | null = aiOpen ? "ai" : dock;

  const marketCap = useMemo(() => {
    const hit = s.earningsMetrics.find((m) => m.key === "marketCapitalization");
    const v = hit?.value;
    return v != null && Number.isFinite(v) ? v * 1e6 : null;
  }, [s.earningsMetrics]);

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

  const openTrade = useCallback(() => {
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setDock("trade");
  }, []);

  const onMobileSegment = useCallback(
    (segment: MobileSegment) => {
      setAiOpen(false);
      setMobilePlanOpen(false);
      setDock(null);
      setMobileSegment(segment);
      if (segment === "more") {
        const first = mobileMoreTabs[0]?.id;
        if (first) s.setTab(first);
      } else {
        s.setTab("chart");
      }
    },
    [mobileMoreTabs, s.setTab],
  );

  const onMoreTabChange = useCallback(
    (id: SymbolTab) => {
      setAiOpen(false);
      setMobilePlanOpen(false);
      setDock(null);
      if (id === "chart") {
        setMobileSegment("plan");
        s.setTab("chart");
        return;
      }
      setMobileSegment("more");
      s.setTab(id);
    },
    [s.setTab],
  );

  const onBoundStrategyChange = useCallback(
    (name: string | null, id?: string | null) => {
      setBoundRuleName(name);
      setBoundStrategyId(id ?? null);
    },
    [],
  );

  const panelTab = panelTabFor(isDesktop, s.tab);
  const resolutionLabels = useMemo(() => candleResolutionLabels(s.t), [s.t]);

  function closeDock() {
    setDock(null);
    if (s.tab === "news" || s.tab === "press" || s.tab === "comments") {
      s.setTab("chart");
    }
  }

  function onSideSelect(id: SideIconId) {
    if (id === "ai") {
      if (aiOpen) {
        setAiOpen(false);
        return;
      }
      setDock(null);
      setMobilePlanOpen(false);
      setSeoOpen(false);
      setAiOpen(true);
      return;
    }
    if (dock === id) {
      closeDock();
      return;
    }
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setDock(id);
    if (id === "news") s.setTab("news");
    else if (id === "comments") s.setTab("comments");
    else if (
      s.tab === "news" ||
      s.tab === "press" ||
      s.tab === "comments"
    ) {
      s.setTab("chart");
    }
  }

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
              aria-label="Resize watchlist"
              data-dragging={watch.dragging ? "true" : undefined}
              onPointerDown={watch.onResizeStart}
            />
          </>
        ) : null}

        <div className="aw-workbench-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <SymbolQuoteBar
              symbol={symbol}
              assetType={assetType}
              quote={s.quote}
              boundRuleName={boundRuleName}
              onOpenPlan={openPlan}
              onOpenTrade={openTrade}
              tabs={isDesktop ? desktopQuoteTabs : undefined}
              tab={isDesktop ? panelTab : undefined}
              onTabChange={
                isDesktop
                  ? (id) => {
                      setAiOpen(false);
                      setMobilePlanOpen(false);
                      if (id === "news" || id === "press") setDock("news");
                      else setDock(null);
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
                setAiOpen(false);
                setDock(null);
                setMobilePlanOpen(false);
                setSeoOpen(true);
              }}
            />
          </div>

          <div
            className="aw-workbench-grid relative min-h-0 flex-1 lg:overflow-hidden"
            data-resizing={rail.dragging ? "true" : undefined}
          >
            <div className="aw-stack-y flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--aw-canvas)]">
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
                          segment={mobileSegment}
                          onSegmentChange={onMobileSegment}
                          onOpenTrade={openTrade}
                          focusPlanToken={planFocusKey}
                          onBoundStrategyChange={onBoundStrategyChange}
                          panelTab={panelTab}
                          moreTabs={mobileMoreTabs}
                          onMoreTabChange={onMoreTabChange}
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
                focusPlanToken={planFocusKey}
                onBoundStrategyChange={onBoundStrategyChange}
                onRequestOrder={openTrade}
                dragging={rail.dragging}
                onResizeStart={rail.onResizeStart}
              />
            ) : null}
            {isDesktop ? (
              <SymbolSideIconRail
                active={sideIcon}
                onSelect={onSideSelect}
                railOpen={rail.open}
                onToggleRail={() => rail.setOpen((v) => !v)}
              />
            ) : null}
          </div>
        </div>
      </div>

      <SymbolPageOverlays
        isDesktop={isDesktop}
        dockReady={dockReady}
        dock={dock}
        onCloseDock={closeDock}
        symbol={symbol}
        assetType={assetType}
        isIndex={isIndex}
        lastPrice={s.quote?.price ?? null}
        bid={s.quote?.bid ?? null}
        ask={s.quote?.ask ?? null}
        boundStrategyId={boundStrategyId}
        boundRuleName={boundRuleName}
        onBoundStrategyChange={onBoundStrategyChange}
        onOpenAi={() => {
          setAiReady(true);
          setDock(null);
          setMobilePlanOpen(false);
          setAiOpen(true);
        }}
        onOpenPlan={() => {
          setDock(null);
          openPlan();
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
        mobilePlanReady={mobilePlanReady}
        mobilePlanOpen={mobilePlanOpen}
        onCloseMobilePlan={() => setMobilePlanOpen(false)}
        focusPlanToken={planFocusKey}
        onRequestOrder={openTrade}
        aiReady={aiReady}
        aiOpen={aiOpen}
        onAiOpenChange={(open) => {
          setAiOpen(open);
          if (open) {
            setDock(null);
            setMobilePlanOpen(false);
            setSeoOpen(false);
          }
        }}
        seoOpen={seoOpen}
        onSeoOpenChange={setSeoOpen}
        seoCopy={seoCopy}
        seoPeers={seoPeers}
      />
    </div>
  );
}
