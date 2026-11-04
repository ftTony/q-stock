"use client";

import dynamic from "next/dynamic";
import { Suspense, type FormEvent, type ReactNode } from "react";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { SymbolDockCommentsPanel } from "@/components/symbol/dock/symbol-dock-comments-panel";
import {
  SymbolDockNewsPanel,
  type NewsFeedTab,
} from "@/components/symbol/dock/symbol-dock-news-panel";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import {
  InlineLoading,
  PanelSkeleton,
} from "@/components/ui/panel-skeleton";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { EarningsStatement } from "@/lib/earnings/types";
import type {
  EarningsCalendarRow,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import type { AssetType, Quote } from "@/lib/types";
import type { StackBottomTab } from "@/components/symbol/page/symbol-stack-bottom-panel";

const TradePanel = dynamic(
  () =>
    import("@/components/trading/trade-panel").then((m) => ({
      default: m.TradePanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4">
        <PanelSkeleton rows={5} />
      </div>
    ),
  },
);

const SymbolPaperRiskBar = dynamic(
  () =>
    import("@/components/symbol/plan/symbol-paper-risk-bar").then((m) => ({
      default: m.SymbolPaperRiskBar,
    })),
  { ssr: false },
);

const SymbolDerivativesPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-derivatives-panel").then((m) => ({
      default: m.SymbolDerivativesPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4">
        <PanelSkeleton rows={6} />
      </div>
    ),
  },
);

const SymbolStackAiPane = dynamic(
  () =>
    import("@/components/symbol/page/symbol-stack-ai-pane").then((m) => ({
      default: m.SymbolStackAiPane,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4">
        <PanelSkeleton rows={5} />
      </div>
    ),
  },
);

const SymbolFundamentalsPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-fundamentals-panel").then(
      (m) => ({ default: m.SymbolFundamentalsPanel }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-3">
        <PanelSkeleton rows={6} />
      </div>
    ),
  },
);

function PaneShell({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        active
          ? "flex min-h-0 flex-1 flex-col overflow-hidden"
          : "hidden"
      }
      aria-hidden={active ? undefined : true}
    >
      {children}
    </div>
  );
}

export type StackBottomPanesProps = {
  active: StackBottomTab;
  mountNews: boolean;
  mountTrade: boolean;
  mountAi: boolean;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  quote: Quote | null;
  lastPrice: number | null;
  percentChange: number | null;
  quoteName: string | null;
  bid: number | null;
  ask: number | null;
  boundStrategyId: string | null;
  boundRuleName: string | null;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onOpenPlan: () => void;
  onOpenAi: () => void;
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
  tabLoading: boolean;
  newsReady?: boolean;
  pressReady?: boolean;
  degraded: boolean;
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsStatement: EarningsStatement | null;
  earningsBalance: EarningsStatement | null;
  earningsCashflow: EarningsStatement | null;
  earningsLoading: boolean;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
  tradeAuthed: boolean;
  authStatus: string;
  ruleFooter: ReactNode;
  loadingLabel: string;
  degradedLabel: string;
  errorLabel: string;
  cryptoNaLabel: string;
  loginTitle: string;
  loginBody: string;
  loginHint: string;
  commentsPlaceholder: string;
  commentsPost: string;
  commentsEmpty: string;
  commentsDelete: string;
};

/** Stack bottom content panes (soft keep-alive for news/trade/ai). */
export function SymbolStackBottomPanes({
  active,
  mountNews,
  mountTrade,
  mountAi,
  symbol,
  assetType,
  isIndex,
  quote,
  lastPrice,
  percentChange,
  quoteName,
  bid,
  ask,
  boundStrategyId,
  boundRuleName,
  onBoundStrategyChange,
  onOpenPlan,
  onOpenAi,
  onNewsFeedTabChange,
  news,
  press,
  comments,
  commentText,
  onCommentTextChange,
  onPostComment,
  onDeleteComment,
  commentBusy,
  canComment,
  currentUserId,
  tabLoading,
  newsReady = false,
  pressReady = false,
  degraded,
  earnings,
  earningsUpcoming,
  earningsRecent,
  earningsMetrics,
  earningsStatement,
  earningsBalance,
  earningsCashflow,
  earningsLoading,
  company,
  officers,
  tradeAuthed,
  authStatus,
  ruleFooter,
  loadingLabel,
  degradedLabel,
  errorLabel,
  cryptoNaLabel,
  loginTitle,
  loginBody,
  loginHint,
  commentsPlaceholder,
  commentsPost,
  commentsEmpty,
  commentsDelete,
}: StackBottomPanesProps) {
  const newsActive = active === "news" || active === "press";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {mountNews ? (
        <PaneShell active={newsActive}>
          {/*
            Flex shell only — do NOT put overflow-y-auto here.
            Nested with SymbolDockNewsPanel's overscroll-contain traps the wheel
            when the inner pane isn't the constrained scroller.
          */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SymbolDockNewsPanel
              feedTab={active === "press" ? "press" : "news"}
              onFeedTabChange={onNewsFeedTabChange}
              assetType={assetType}
              news={news}
              press={press}
              tabLoading={tabLoading}
              newsReady={newsReady}
              pressReady={pressReady}
              degraded={degraded}
              degradedLabel={degradedLabel}
              errorLabel={errorLabel}
              loadingLabel={loadingLabel}
              hideFeedTabs
            />
          </div>
        </PaneShell>
      ) : null}

      {mountTrade ? (
        <PaneShell active={active === "trade"}>
          <div className="aw-stack-pane-trade flex min-h-0 flex-1 flex-col overflow-hidden">
            {authStatus === "loading" ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <InlineLoading label={loadingLabel} />
              </div>
            ) : !tradeAuthed ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <AuthLoginGate
                  compact
                  title={loginTitle}
                  body={loginBody}
                  hint={loginHint}
                />
              </div>
            ) : (
              <>
                <SymbolPaperRiskBar
                  symbol={symbol}
                  assetType={assetType}
                  lastPrice={lastPrice}
                  footer={ruleFooter}
                  dense
                />
                <Suspense
                  fallback={
                    <div className="min-h-0 flex-1 p-4">
                      <PanelSkeleton rows={5} label={loadingLabel} />
                    </div>
                  }
                >
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <TradePanel
                      symbol={symbol}
                      assetType={assetType}
                      lastPrice={lastPrice}
                      percentChange={percentChange}
                      quoteName={quoteName}
                      bid={bid}
                      ask={ask}
                      onOpenAi={onOpenAi}
                      onOpenPlan={onOpenPlan}
                      strategyId={boundStrategyId ?? ""}
                      strategyName={boundRuleName}
                      onStrategyIdChange={(id, name) =>
                        onBoundStrategyChange(name ?? null, id)
                      }
                      density="stack"
                    />
                  </div>
                </Suspense>
              </>
            )}
          </div>
        </PaneShell>
      ) : null}

      {mountAi ? (
        <PaneShell active={active === "ai"}>
          <SymbolStackAiPane symbol={symbol} assetType={assetType} />
        </PaneShell>
      ) : null}

      {active === "comments" ? (
        <div className="aw-stack-pane-comments flex min-h-0 flex-1 flex-col overflow-hidden">
          <SymbolDockCommentsPanel
            comments={comments}
            commentText={commentText}
            onCommentTextChange={onCommentTextChange}
            onPostComment={onPostComment}
            onDeleteComment={onDeleteComment}
            commentBusy={commentBusy}
            canComment={canComment}
            currentUserId={currentUserId}
            commentsPlaceholder={commentsPlaceholder}
            commentsPost={commentsPost}
            commentsEmpty={commentsEmpty}
            commentsDelete={commentsDelete}
            tabLoading={tabLoading}
            loadingLabel={loadingLabel}
            density="stack"
          />
        </div>
      ) : null}

      {active === "derivatives" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <SymbolDerivativesPanel
            symbol={symbol}
            assetType={assetType}
            lastPrice={lastPrice ?? quote?.price ?? null}
          />
        </div>
      ) : null}

      {active === "earnings" || active === "profile" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-3 qt-scroll">
          {assetType === "crypto" || isIndex ? (
            <p className="text-[12px] text-[var(--muted)]">{cryptoNaLabel}</p>
          ) : (
            <SymbolFundamentalsPanel
              earnings={earnings}
              earningsUpcoming={earningsUpcoming}
              earningsRecent={earningsRecent}
              earningsMetrics={earningsMetrics}
              earningsStatement={earningsStatement}
              earningsBalance={earningsBalance}
              earningsCashflow={earningsCashflow}
              earningsLoading={earningsLoading}
              degraded={degraded}
              company={company}
              officers={officers}
              initialSection={active === "profile" ? "profile" : "income"}
              density="stack"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
