"use client";

import { useTranslations } from "next-intl";
import { SymbolAiFab } from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolDockDrawers } from "@/components/symbol/page/symbol-page-dynamics";
import { SymbolMobilePlanDrawer } from "@/components/symbol/mobile/symbol-mobile-plan-drawer";
import { setBoundStrategyId as persistBoundStrategyId } from "@/components/symbol/plan/symbol-plan-binding";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import type { NewsFeedTab } from "@/components/symbol/dock/symbol-dock-news-panel";
import { SymbolSeoAboutDrawer } from "@/components/symbol/quote/symbol-seo-about-drawer";
import { IconRobot } from "@/components/ui/icon-robot";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType } from "@/lib/types";
import type { FormEvent } from "react";

type Props = {
  isDesktop: boolean;
  dockReady: boolean;
  dock: Exclude<SideIconId, "ai"> | null;
  onCloseDock: () => void;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  lastPrice: number | null;
  bid: number | null;
  ask: number | null;
  boundStrategyId: string | null;
  boundRuleName: string | null;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onOpenAi: () => void;
  onOpenPlan: () => void;
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
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  loadingLabel: string;
  mobilePlanReady: boolean;
  mobilePlanOpen: boolean;
  onCloseMobilePlan: () => void;
  focusPlanToken: number;
  onRequestOrder: () => void;
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
  const t = useTranslations("symbol");
  const edge = p.isDesktop ? 44 : 0;
  const aiLabel = t("openAi");

  return (
    <>
      {p.dockReady ? (
        <SymbolDockDrawers
          dock={p.dock}
          onClose={p.onCloseDock}
          symbol={p.symbol}
          assetType={p.assetType}
          lastPrice={p.lastPrice}
          bid={p.bid}
          ask={p.ask}
          strategyId={p.boundStrategyId}
          strategyName={p.boundRuleName}
          onStrategyIdChange={(id, name) => {
            const next = id || null;
            persistBoundStrategyId(p.assetType, p.symbol, next);
            p.onBoundStrategyChange(name || null, next);
          }}
          onOpenAi={p.onOpenAi}
          onOpenPlan={p.onOpenPlan}
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
          degraded={p.degraded}
          degradedLabel={p.degradedLabel}
          errorLabel={p.errorLabel}
          loadingLabel={p.loadingLabel}
          edgeOffsetPx={edge}
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
          onBoundStrategyChange={p.onBoundStrategyChange}
          onRequestOrder={p.onRequestOrder}
          edgeOffsetPx={0}
        />
      ) : null}

      {/* Lightweight FAB until AI chunk warms — keeps chart/plan first paint clear. */}
      {!p.aiReady && !p.isDesktop ? (
        <button
          type="button"
          aria-label={aiLabel}
          title={aiLabel}
          onClick={p.onOpenAi}
          className="fixed z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md transition hover:brightness-110 active:scale-[0.97] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] lg:hidden"
        >
          <IconRobot className="h-6 w-6" />
        </button>
      ) : null}

      {p.aiReady ? (
        <SymbolAiFab
          symbol={p.symbol}
          assetType={p.assetType}
          open={p.aiOpen}
          onOpenChange={p.onAiOpenChange}
          showFab={!p.isDesktop}
          edgeOffsetPx={edge}
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
      />
    </>
  );
}
