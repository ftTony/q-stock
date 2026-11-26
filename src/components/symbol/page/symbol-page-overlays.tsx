"use client";

import {
  SymbolAiFab,
  SymbolDockDrawers,
  SymbolMobilePlanDrawer,
} from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolMobileTradeBar } from "@/components/symbol/mobile/symbol-mobile-trade-bar";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import type { NewsFeedTab } from "@/components/symbol/dock/symbol-dock-news-panel";
import { SymbolSeoAboutDrawer } from "@/components/symbol/quote/symbol-seo-about-drawer";
import { useElementTop } from "@/hooks/use-element-top";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType } from "@/lib/types";
import type { FormEvent } from "react";

type Props = {
  isDesktop: boolean;
  /** Desktop stack layout has no side icon rail — drawers flush to the edge. */
  isStack?: boolean;
  dockReady: boolean;
  dock: Exclude<SideIconId, "ai"> | null;
  onCloseDock: () => void;
  tradeDockView?: "desk" | "ticket";
  onTradeDockViewChange?: (v: "desk" | "ticket") => void;
  /** Stack bottom is already the desk — trade dock is ticket-only. */
  tradeTicketOnly?: boolean;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  lastPrice: number | null;
  percentChange?: number | null;
  quoteName?: string | null;
  bid: number | null;
  ask: number | null;
  boundStrategyId: string | null;
  boundRuleName: string | null;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onOpenAi: () => void;
  onOpenPlan: () => void;
  onOpenSymbolReview?: (orderId?: string | null) => void;
  newsFeedTab: NewsFeedTab;
  onNewsFeedTabChange: (tab: NewsFeedTab) => void;
  news: NewsRow[];
  press: PressRow[];
  comments: CommentRow[];
  commentText: string;
  onCommentTextChange: (v: string) => void;
  onPostComment: (e: FormEvent) => void;
  onDeleteComment: (id: string) => void;
  commentBusy: boolean;
  canComment: boolean;
  currentUserId?: string;
  commentsPlaceholder: string;
  commentsPost: string;
  commentsEmpty: string;
  commentsDelete: string;
  tabLoading: boolean;
  newsReady?: boolean;
  pressReady?: boolean;
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  loadingLabel: string;
  mobilePlanReady: boolean;
  mobilePlanOpen: boolean;
  onCloseMobilePlan: () => void;
  focusPlanToken: number;
  focusReviewToken?: number;
  highlightOrderId?: string | null;
  onRequestOrder: () => void;
  inWatchlist?: boolean;
  watchBusy?: boolean;
  onToggleWatchlist?: () => void;
  aiReady: boolean;
  aiOpen: boolean;
  onAiOpenChange: (open: boolean) => void;
  seoOpen: boolean;
  onSeoOpenChange: (open: boolean) => void;
  seoCopy: SymbolSeoCopy;
  seoPeers: string[];
};

/** Dock / plan drawer / AI — kept out of page-client for file-size. */
export function SymbolPageOverlays(p: Props) {
  // Side layout reserves the icon rail; stack has no rail — edge 0.
  // Stack still opens the trade ticket dock (account desk is the bottom tab).
  const edge = p.isDesktop && !p.isStack ? 48 : 0;
  // Desktop: drawer top = chart grid (below quote bar), same row as icon rail.
  // H5: topOffset 0 — full-screen sheet unchanged.
  const gridTop = useElementTop(p.isDesktop ? ".aw-workbench-grid" : null);
  const topOffset = p.isDesktop ? gridTop || 40 : 0;

  return (
    <>
      {p.dockReady ? (
        <SymbolDockDrawers
          dock={p.dock}
          onClose={p.onCloseDock}
          tradeDockView={p.tradeDockView}
          onTradeDockViewChange={p.onTradeDockViewChange}
          tradeTicketOnly={p.tradeTicketOnly}
          symbol={p.symbol}
          assetType={p.assetType}
          lastPrice={p.lastPrice}
          percentChange={p.percentChange ?? null}
          quoteName={p.quoteName ?? null}
          bid={p.bid}
          ask={p.ask}
          strategyId={p.boundStrategyId}
          strategyName={p.boundRuleName}
          onOpenAi={p.onOpenAi}
          onOpenPlan={p.onOpenPlan}
          onOpenSymbolReview={p.onOpenSymbolReview}
          newsFeedTab={p.newsFeedTab}
          onNewsFeedTabChange={p.onNewsFeedTabChange}
          news={p.news}
          press={p.press}
          comments={p.comments}
          commentText={p.commentText}
          onCommentTextChange={p.onCommentTextChange}
          onPostComment={p.onPostComment}
          onDeleteComment={p.onDeleteComment}
          commentBusy={p.commentBusy}
          canComment={p.canComment}
          currentUserId={p.currentUserId}
          commentsPlaceholder={p.commentsPlaceholder}
          commentsPost={p.commentsPost}
          commentsEmpty={p.commentsEmpty}
          commentsDelete={p.commentsDelete}
          tabLoading={p.tabLoading}
          newsReady={p.newsReady}
          pressReady={p.pressReady}
          degraded={p.degraded}
          degradedLabel={p.degradedLabel}
          errorLabel={p.errorLabel}
          loadingLabel={p.loadingLabel}
          edgeOffsetPx={edge}
          topOffsetPx={topOffset}
        />
      ) : null}

      {p.mobilePlanReady ? (
        <SymbolMobilePlanDrawer
          open={p.mobilePlanOpen}
          onClose={p.onCloseMobilePlan}
          symbol={p.symbol}
          assetType={p.assetType}
          isIndex={p.isIndex}
          focusPlanToken={p.focusPlanToken}
          focusReviewToken={p.focusReviewToken}
          highlightOrderId={p.highlightOrderId}
          onBoundStrategyChange={p.onBoundStrategyChange}
          onRequestOrder={p.onRequestOrder}
          edgeOffsetPx={0}
        />
      ) : null}

      {/* H5: trade + 自选/AI/提醒; quote bar keeps「交易」on desktop only. */}
      {!p.isDesktop ? (
        <SymbolMobileTradeBar
          onOpenTrade={p.onRequestOrder}
          onOpenAi={p.onOpenAi}
          onToggleWatchlist={p.onToggleWatchlist ?? (() => {})}
          inWatchlist={p.inWatchlist ?? false}
          watchBusy={p.watchBusy}
        />
      ) : null}

      {/* AI drawer host — H5 entry is the bottom bar (no floating FAB). */}
      {p.aiReady || p.isDesktop || p.aiOpen ? (
        <SymbolAiFab
          symbol={p.symbol}
          assetType={p.assetType}
          open={p.aiOpen}
          onOpenChange={p.onAiOpenChange}
          showFab={false}
          edgeOffsetPx={edge}
          topOffsetPx={topOffset}
        />
      ) : null}

      <SymbolSeoAboutDrawer
        open={p.seoOpen}
        onClose={() => p.onSeoOpenChange(false)}
        symbol={p.symbol}
        assetType={p.assetType}
        copy={p.seoCopy}
        peers={p.seoPeers}
        edgeOffsetPx={edge}
        topOffsetPx={topOffset}
      />
    </>
  );
}
