"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { SymbolOrderRail } from "@/components/symbol/symbol-order-rail";
import { SymbolQuoteBar } from "@/components/symbol/symbol-quote-bar";
import { SymbolRailQuoteHeader } from "@/components/symbol/symbol-rail-quote-header";
import { SymbolRailStats } from "@/components/symbol/symbol-rail-stats";
import {
  SymbolSideIconRail,
  type SideIconId,
} from "@/components/symbol/symbol-side-icon-rail";
import { SymbolTabsPanel } from "@/components/symbol/symbol-tabs-panel";
import { useSymbolPage } from "@/components/symbol/use-symbol-page";
import { useRailResize } from "@/components/symbol/use-rail-resize";
import { useWatchlistResize } from "@/components/symbol/use-watchlist-resize";
import { setBoundStrategyId as persistBoundStrategyId } from "@/components/symbol/symbol-plan-binding";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";
import "./apple-workbench.css";
import "./apple-quote-chrome.css";

function ChartFallback() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center text-[12px] text-[var(--muted)]">
      …
    </div>
  );
}

const SymbolChartSection = dynamic(
  () =>
    import("@/components/symbol/symbol-chart-section").then((m) => ({
      default: m.SymbolChartSection,
    })),
  { ssr: false, loading: () => <ChartFallback /> },
);

const SymbolWatchlistPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-watchlist-panel").then((m) => ({
      default: m.SymbolWatchlistPanel,
    })),
  { ssr: false },
);

const SymbolDockDrawers = dynamic(
  () =>
    import("@/components/symbol/symbol-dock-drawers").then((m) => ({
      default: m.SymbolDockDrawers,
    })),
  { ssr: false },
);

const SymbolAiFab = dynamic(
  () =>
    import("@/components/symbol/symbol-ai-fab").then((m) => ({
      default: m.SymbolAiFab,
    })),
  { ssr: false },
);

type Props = {
  symbol: string;
  assetType: AssetType;
  initialQuote?: Quote | null;
};

type DockId = Exclude<SideIconId, "ai">;

function metricOf(
  metrics: { key?: string; metric?: string; value?: number | null }[],
  key: string,
): number | null {
  const hit = metrics.find((m) => m.key === key || m.metric === key);
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
  const [dock, setDock] = useState<DockId | null>(null);
  /** Keep chunk after first open so close animation / SideDrawer bodyLive still work. */
  const [dockReady, setDockReady] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [boundRuleName, setBoundRuleName] = useState<string | null>(null);
  const [boundStrategyId, setBoundStrategyId] = useState<string | null>(null);
  const [planFocusKey, setPlanFocusKey] = useState(0);
  const rail = useRailResize();
  const watch = useWatchlistResize();

  useEffect(() => {
    setBoundRuleName(null);
    setBoundStrategyId(null);
    setDock(null);
    setAiOpen(false);
  }, [symbol, assetType]);

  useEffect(() => {
    if (dock) setDockReady(true);
  }, [dock]);

  useEffect(() => {
    if (aiOpen) setAiReady(true);
  }, [aiOpen]);

  const sideIcon: SideIconId | null = aiOpen ? "ai" : dock;

  const marketCap = useMemo(() => {
    const m = metricOf(s.earningsMetrics, "marketCapitalization");
    return m != null ? m * 1e6 : null;
  }, [s.earningsMetrics]);

  const quoteTabs = useMemo(
    () => s.tabs.filter((x) => x.id !== "news" && x.id !== "press"),
    [s.tabs],
  );

  /** Dock tabs load via setTab but main surface stays on chart. */
  const panelTab =
    s.tab === "news" || s.tab === "press" || s.tab === "comments"
      ? "chart"
      : s.tab;

  const resolutionLabels = useMemo(
    () =>
      ({
        T: s.t("intraday"),
        "1": s.t("min1"),
        "5": s.t("min5"),
        D: s.t("day"),
        Q: s.t("quarter"),
        Y: s.t("year"),
      }) satisfies Record<CandleResolution, string>,
    [s.t],
  );

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
      setAiOpen(true);
      return;
    }
    if (dock === id) {
      closeDock();
      return;
    }
    setAiOpen(false);
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

  const onFlagToggle = useCallback(
    (key: keyof IndicatorFlags) => {
      s.setFlags((f) => ({ ...f, [key]: !f[key] }));
    },
    [s.setFlags],
  );

  const indicatorsLabel = s.t("indicators");
  const intradayUnavailableLabel = s.t("intradayUnavailable");
  const loadingLabel = s.tCommon("loading");

  const chartSlot = useMemo(
    () => (
      <SymbolChartSection
        resolution={s.resolution}
        onResolutionChange={s.setResolution}
        resolutionLabels={resolutionLabels}
        indicatorsLabel={indicatorsLabel}
        intradayUnavailableLabel={intradayUnavailableLabel}
        flags={s.flags}
        onFlagToggle={onFlagToggle}
        loadingChart={s.loadingChart}
        loadingLabel={loadingLabel}
        bars={s.bars}
        assetType={assetType}
        symbol={symbol}
        onLoadMore={s.loadMoreCandles}
        loadingMore={s.loadingMoreCandles}
        hasMore={s.hasMoreCandles}
      />
    ),
    [
      s.resolution,
      s.setResolution,
      resolutionLabels,
      indicatorsLabel,
      intradayUnavailableLabel,
      s.flags,
      onFlagToggle,
      s.loadingChart,
      loadingLabel,
      s.bars,
      assetType,
      symbol,
      s.loadMoreCandles,
      s.loadingMoreCandles,
      s.hasMoreCandles,
    ],
  );

  return (
    <div className="aw aw-stack flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--aw-canvas)] lg:overflow-hidden">
      {/* Watchlist is full-height left; quote bar only over main workbench */}
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
        {watch.open ? (
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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <SymbolQuoteBar
              symbol={symbol}
              assetType={assetType}
              quote={s.quote}
              boundRuleName={boundRuleName}
              onOpenPlan={() => {
                rail.setOpen(true);
                setPlanFocusKey((k) => k + 1);
              }}
              onOpenTrade={() => {
                setAiOpen(false);
                setDock("trade");
              }}
              tabs={quoteTabs}
              tab={panelTab}
              onTabChange={(id) => {
                setAiOpen(false);
                setDock(null);
                s.setTab(id);
              }}
              showWatchlistExpand={!watch.open}
              onExpandWatchlist={() => watch.setOpen(true)}
            />
          </div>

          <div
            className="aw-workbench-grid relative min-h-0 flex-1 lg:overflow-hidden"
            data-resizing={rail.dragging ? "true" : undefined}
          >
            <div className="aw-stack-y flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--aw-canvas)]">
              <SymbolTabsPanel
                tab={panelTab}
                chartSlot={chartSlot}
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

            {rail.open ? (
              <>
                <button
                  type="button"
                  className="aw-workbench-resizer"
                  aria-label="Resize side panel"
                  data-dragging={rail.dragging ? "true" : undefined}
                  onPointerDown={rail.onResizeStart}
                />

                <aside className="aw-workbench-rail min-h-0 overflow-hidden bg-[var(--aw-canvas)]">
                  <div className="shrink-0">
                    <SymbolRailQuoteHeader
                      symbol={symbol}
                      assetType={assetType}
                      quote={s.quote}
                      updatedAt={s.updatedAt}
                      inWatchlist={s.inWatchlist}
                      watchBusy={s.watchBusy}
                      onToggleWatchlist={() => void s.toggleWatchlist()}
                      onCollapse={() => rail.setOpen(false)}
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
                    <SymbolRailStats
                      quote={s.quote}
                      metrics={s.earningsMetrics}
                      assetType={assetType}
                      marketCap={marketCap}
                    />
                  </div>
                  <SymbolOrderRail
                    symbol={symbol}
                    assetType={assetType}
                    isIndex={isIndex}
                    onBoundStrategyChange={(name, id) => {
                      setBoundRuleName(name);
                      setBoundStrategyId(id ?? null);
                    }}
                    focusPlanToken={planFocusKey}
                    onRequestOrder={() => {
                      setAiOpen(false);
                      setDock("trade");
                    }}
                  />
                </aside>
              </>
            ) : null}
            <SymbolSideIconRail
              active={sideIcon}
              onSelect={onSideSelect}
              showRailExpand={!rail.open}
              onExpandRail={() => rail.setOpen(true)}
            />
          </div>
        </div>
      </div>

      {dockReady ? (
        <SymbolDockDrawers
          dock={dock}
          onClose={closeDock}
          symbol={symbol}
          assetType={assetType}
          lastPrice={s.quote?.price ?? null}
          bid={s.quote?.bid ?? null}
          ask={s.quote?.ask ?? null}
          strategyId={boundStrategyId}
          strategyName={boundRuleName}
          onStrategyIdChange={(id, name) => {
            const next = id || null;
            persistBoundStrategyId(assetType, symbol, next);
            setBoundStrategyId(next);
            setBoundRuleName(name || null);
          }}
          onOpenAi={() => {
            setDock(null);
            setAiOpen(true);
          }}
          onOpenPlan={() => {
            setDock(null);
            setPlanFocusKey((k) => k + 1);
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
        />
      ) : null}

      {aiReady ? (
        <SymbolAiFab
          symbol={symbol}
          assetType={assetType}
          open={aiOpen}
          onOpenChange={(open) => {
            setAiOpen(open);
            if (open) setDock(null);
          }}
          showFab={false}
        />
      ) : null}
    </div>
  );
}
