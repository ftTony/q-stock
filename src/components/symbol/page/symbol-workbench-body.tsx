"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  SymbolDesktopRail,
  SymbolSideIconRail,
  SymbolWatchlistPanel,
} from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolH5BelowSlot } from "@/components/symbol/page/symbol-h5-below-slot";
import { SymbolWorkbenchTopbar } from "@/components/symbol/page/symbol-workbench-topbar";
import {
  SymbolStackBottomPanel,
  type StackBottomTab,
} from "@/components/symbol/page/symbol-stack-bottom-panel";
import { SymbolPageTabs } from "@/components/symbol/page/symbol-page-tabs";
import { SymbolNavPendingOverlay } from "@/components/symbol/page/symbol-nav-pending";
import { SymbolQuoteBar } from "@/components/symbol/quote/symbol-quote-bar";
import { SymbolChartToolbarHostProvider } from "@/components/symbol/chart/symbol-chart-toolbar-host";
import type { SymbolLayoutPrefs, LayoutModuleKey, LayoutMode } from "@/components/symbol/hooks/use-symbol-layout-prefs";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import type { useSymbolPage } from "@/components/symbol/hooks/use-symbol-page";
import type { useSymbolWorkbenchPanels } from "@/components/symbol/hooks/use-symbol-workbench-panels";
import type { useRailResize } from "@/components/symbol/hooks/use-rail-resize";
import type { useWatchlistResize } from "@/components/symbol/hooks/use-watchlist-resize";
import type { FeedStatusKind } from "@/components/symbol/quote/symbol-feed-status";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";
import { markPrice } from "@/lib/market/extended-hours";
import type { AssetType } from "@/lib/types";

type SymbolPageState = ReturnType<typeof useSymbolPage>;
type Panels = ReturnType<typeof useSymbolWorkbenchPanels>;
type Rail = ReturnType<typeof useRailResize>;
type Watch = ReturnType<typeof useWatchlistResize>;

type TabItem = { id: SymbolTab; label: string };

type Props = {
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  isDesktop: boolean;
  isStack: boolean;
  layoutPrefs: SymbolLayoutPrefs;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onModuleChange: (key: LayoutModuleKey, value: boolean) => void;
  onResetLayout: () => void;
  s: SymbolPageState;
  p: Panels;
  rail: Rail;
  watch: Watch;
  setWatchOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  setRailOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  panelTab: SymbolTab;
  desktopQuoteTabs: TabItem[];
  mobileMoreTabs: TabItem[];
  chartSlot: ReactNode;
  feedStatus: FeedStatusKind;
  marketCap: number | null;
  stackTab: StackBottomTab;
  setStackTab: (tab: StackBottomTab) => void;
  stackKey: number;
  newsFeedTab: "news" | "press";
  openTrade: () => void;
  onSideSelect: (id: SideIconId) => void;
  onToggleWatchlist: () => void;
  aboutLabel: string;
  onOpenAbout: () => void;
  resizing: boolean;
};

/** Desktop/H5 workbench chrome: watchlist + quote + chart/stack + rail. */
export function SymbolWorkbenchBody({
  symbol,
  assetType,
  isIndex,
  isDesktop,
  isStack,
  layoutPrefs,
  onLayoutModeChange,
  onModuleChange,
  onResetLayout,
  s,
  p,
  rail,
  watch,
  setWatchOpen,
  setRailOpen,
  panelTab,
  desktopQuoteTabs,
  mobileMoreTabs,
  chartSlot,
  feedStatus,
  marketCap,
  stackTab,
  setStackTab,
  stackKey,
  newsFeedTab,
  openTrade,
  onSideSelect,
  onToggleWatchlist,
  aboutLabel,
  onOpenAbout,
  resizing,
}: Props) {
  const stackBelow = isStack ? (
    <SymbolStackBottomPanel
      key={stackKey}
      symbol={symbol}
      assetType={assetType}
      isIndex={isIndex}
      quote={s.quote}
      lastPrice={markPrice(s.quote)}
      percentChange={s.quote?.percentChange ?? null}
      quoteName={s.quote?.name ?? null}
      bid={s.quote?.bid ?? null}
      ask={s.quote?.ask ?? null}
      boundStrategyId={p.boundStrategyId}
      boundRuleName={p.boundRuleName}
      onBoundStrategyChange={p.onBoundStrategyChange}
      onOpenPlan={p.openPlan}
      onOpenAi={() => {
        p.setAiOpen(true);
        p.closeDock();
      }}
      tab={stackTab}
      onTabChange={setStackTab}
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
      tabLoading={s.tabLoading}
      newsReady={s.newsReady}
      pressReady={s.pressReady}
      degraded={s.degraded}
      earnings={s.earnings}
      earningsUpcoming={s.earningsUpcoming}
      earningsRecent={s.earningsRecent}
      earningsMetrics={s.earningsMetrics}
      earningsStatement={s.earningsStatement}
      earningsBalance={s.earningsBalance}
      earningsCashflow={s.earningsCashflow}
      earningsLoading={s.earningsLoading}
      company={s.company}
      officers={s.officers}
    />
  ) : null;

  return (
    <div
      className="aw-symbol-shell relative flex min-h-0 flex-1 overflow-hidden"
      data-resizing={resizing ? "true" : undefined}
      data-layout-mode={isDesktop ? layoutPrefs.layoutMode : undefined}
      style={
        {
          ["--aw-rail-width"]: `${rail.width}px`,
          ["--aw-watchlist-width"]: `${watch.width}px`,
        } as CSSProperties
      }
    >
      {/* CSS (.aw-watchlist-pane) hides below lg — do not gate on isDesktop or
          hydration keeps the column empty until useMinWidth flips after paint. */}
      {watch.open ? (
        <>
          <SymbolWatchlistPanel
            currentSymbol={symbol}
            currentAssetType={assetType}
            onCollapse={() => setWatchOpen(false)}
            quotesEnabled={isDesktop}
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

      <div className="aw-workbench-main relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SymbolNavPendingOverlay label={s.tCommon("loading")} />
        <SymbolWorkbenchTopbar
          layoutPrefs={layoutPrefs}
          onLayoutModeChange={onLayoutModeChange}
          onModuleChange={onModuleChange}
          onResetLayout={onResetLayout}
        />
        {/* Always mount HostProvider + single MainGrid so side↔stack does not remount CandleChart. */}
        <SymbolChartToolbarHostProvider>
          <SymbolWorkbenchMainGrid
            symbol={symbol}
            assetType={assetType}
            isIndex={isIndex}
            isDesktop={isDesktop}
            isStack={isStack}
            layoutPrefs={layoutPrefs}
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
            feedStatus={feedStatus}
            marketCap={marketCap}
            stackTab={stackTab}
            setStackTab={setStackTab}
            stackKey={stackKey}
            newsFeedTab={newsFeedTab}
            openTrade={openTrade}
            onSideSelect={onSideSelect}
            onToggleWatchlist={onToggleWatchlist}
            aboutLabel={aboutLabel}
            onOpenAbout={onOpenAbout}
            stackBelow={stackBelow}
            embedChartToolbar={isStack}
          />
        </SymbolChartToolbarHostProvider>
      </div>
    </div>
  );
}

type MainGridProps = {
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  isDesktop: boolean;
  isStack: boolean;
  layoutPrefs: SymbolLayoutPrefs;
  s: SymbolPageState;
  p: Panels;
  rail: Rail;
  watch: Watch;
  setWatchOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  setRailOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  panelTab: SymbolTab;
  desktopQuoteTabs: TabItem[];
  mobileMoreTabs: TabItem[];
  chartSlot: ReactNode;
  feedStatus: FeedStatusKind;
  marketCap: number | null;
  stackTab: StackBottomTab;
  setStackTab: (tab: StackBottomTab) => void;
  stackKey: number;
  newsFeedTab: "news" | "press";
  openTrade: () => void;
  onSideSelect: (id: SideIconId) => void;
  onToggleWatchlist: () => void;
  aboutLabel: string;
  onOpenAbout: () => void;
  stackBelow: ReactNode;
  embedChartToolbar: boolean;
};

function SymbolWorkbenchMainGrid({
  symbol,
  assetType,
  isIndex,
  isDesktop,
  isStack,
  layoutPrefs,
  s,
  p,
  rail,
  watch,
  setWatchOpen,
  setRailOpen,
  panelTab,
  desktopQuoteTabs,
  mobileMoreTabs,
  chartSlot,
  feedStatus,
  marketCap,
  setStackTab,
  openTrade,
  onSideSelect,
  onToggleWatchlist,
  aboutLabel,
  onOpenAbout,
  stackBelow,
  embedChartToolbar,
}: MainGridProps) {
  return (
    <>
        <div className="shrink-0">
          <SymbolQuoteBar
            symbol={symbol}
            assetType={assetType}
            quote={s.quote}
            boundRuleName={p.boundRuleName}
            onOpenPlan={p.openPlan}
            onOpenTrade={openTrade}
            feedStatus={feedStatus}
            tabs={isDesktop && !embedChartToolbar ? desktopQuoteTabs : undefined}
            tab={isDesktop && !embedChartToolbar ? panelTab : undefined}
            onTabChange={
              isDesktop && !embedChartToolbar
                ? (id) => {
                    p.setAiOpen(false);
                    p.setMobilePlanOpen(false);
                    if (id === "news" || id === "press") {
                      if (layoutPrefs.modules.newsDock) {
                        p.setDock("news");
                      }
                    } else p.setDock(null);
                    s.setTab(id);
                  }
                : undefined
            }
            showWatchlistExpand={isDesktop && !watch.open}
            onExpandWatchlist={
              isDesktop ? () => setWatchOpen(true) : undefined
            }
            aboutLabel={aboutLabel}
            onOpenAbout={onOpenAbout}
            embedChartToolbar={embedChartToolbar}
          />
        </div>

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
              chartPinned={!isDesktop || isStack}
              belowChartSlot={
                isStack
                  ? stackBelow
                  : isDesktop
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
                          onOpenTrade={openTrade}
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
              lastPrice={markPrice(s.quote)}
            />
          </div>

          {/* Stack mode uses the bottom panel — keep the side rail off so drawers
              (说明 / news / …) are not flanked by a leftover metrics strip. */}
          {isDesktop && !isStack && rail.open ? (
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
              onAlertSubmit={s.createAlert as (e: FormEvent) => void}
              metrics={s.earningsMetrics}
              marketCap={marketCap}
              focusPlanToken={p.planFocusKey}
              onBoundStrategyChange={p.onBoundStrategyChange}
              onRequestOrder={openTrade}
              dragging={rail.dragging}
              onResizeStart={rail.onResizeStart}
              onResizeKeyNudge={rail.nudgeWidth}
            />
          ) : null}

          {isDesktop && !isStack ? (
            <SymbolSideIconRail
              active={p.sideIcon}
              onSelect={onSideSelect}
              railOpen={rail.open}
              onToggleRail={() => setRailOpen((v) => !v)}
              showNews={layoutPrefs.modules.newsDock}
            />
          ) : null}
        </div>
    </>
  );
}
