"use client";

import dynamic from "next/dynamic";
import { FormEvent, type ReactNode } from "react";
import type { AiTrendAnalysis } from "@/components/market/ai-analysis-panel";
import type {
  EarningsCalendarRow,
  EarningsMetric,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import { SymbolTabsScrollBody } from "@/components/symbol/symbol-tabs-scroll-body";
import type {
  CommentRow,
  NewsRow,
  PressRow,
  SymbolTab,
} from "@/components/symbol/symbol-tabs-types";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { EarningsStatement } from "@/lib/earnings/types";
import type { AssetType } from "@/lib/types";

export type {
  CommentRow,
  NewsRow,
  PressRow,
  SymbolTab,
} from "@/components/symbol/symbol-tabs-types";

const SymbolDerivativesPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-derivatives-panel").then((m) => ({
      default: m.SymbolDerivativesPanel,
    })),
  { ssr: false },
);

type Props = {
  tab: SymbolTab;
  /** Rendered when active tab is `chart` (main workbench chart). */
  chartSlot?: ReactNode;
  degraded: boolean;
  degradedLabel: string;
  tabLoading: boolean;
  loadingLabel: string;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  lastPrice?: number | null;
  news: NewsRow[];
  press: PressRow[];
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsStatement: EarningsStatement | null;
  earningsBalance: EarningsStatement | null;
  earningsCashflow: EarningsStatement | null;
  earningsLoading: boolean;
  earningsCryptoNa: string;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
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
  commentsLoginRequired: string;
  commentsEmpty: string;
  commentsDelete: string;
  errorLabel: string;
  sentiment: {
    news?: Record<string, unknown>;
    reddit?: Record<string, unknown>;
  } | null;
  aiAvailable: boolean | null;
  aiMessage: string | null;
  aiAnalysis: AiTrendAnalysis | null;
  aiDisclaimer: string | null;
  aiCached: boolean;
  aiLoading: boolean;
  /** True only while user clicked regenerate (not initial load). */
  aiRefreshing?: boolean;
  aiToast?: string | null;
  aiToastKey?: number;
  onClearAiToast?: () => void;
  onRegenerateAi?: () => void;
  aiRegenerateLabel?: string;
};

export function SymbolTabsPanel({
  tab,
  chartSlot,
  degraded,
  degradedLabel,
  tabLoading,
  loadingLabel,
  symbol,
  assetType,
  isIndex,
  lastPrice = null,
  news,
  press,
  earnings,
  earningsUpcoming,
  earningsRecent,
  earningsMetrics,
  earningsStatement,
  earningsBalance,
  earningsCashflow,
  earningsLoading,
  earningsCryptoNa,
  company,
  officers,
  comments,
  commentText,
  onCommentTextChange,
  onPostComment,
  onDeleteComment,
  commentBusy,
  canComment,
  currentUserId,
  commentsPlaceholder,
  commentsPost,
  commentsLoginRequired,
  commentsEmpty,
  commentsDelete,
  errorLabel,
  sentiment,
  aiAvailable,
  aiMessage,
  aiAnalysis,
  aiDisclaimer,
  aiCached,
  aiLoading,
  aiRefreshing = false,
  aiToast,
  aiToastKey,
  onClearAiToast,
  onRegenerateAi,
  aiRegenerateLabel,
}: Props) {
  return (
    <div className="aw-surface-flush flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--aw-canvas)]">
      {degraded && tab !== "chart" ? (
        <p className="aw-caption shrink-0 px-4 pt-3 sm:px-5">{degradedLabel}</p>
      ) : null}

      {/* Keep chart mounted across tab switches — remounting klinecharts is costly. */}
      {chartSlot ? (
        <div
          className={`aw-tab-chart min-h-0 flex-1 overflow-hidden ${
            tab === "chart" ? "" : "hidden"
          }`}
          aria-hidden={tab !== "chart"}
        >
          {chartSlot}
        </div>
      ) : null}

      {tab === "derivatives" ? (
        <div className="aw-tab-fill flex min-h-0 flex-1 flex-col overflow-hidden">
          {tabLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center text-[12px] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
              {loadingLabel}
            </div>
          ) : (
            <SymbolDerivativesPanel
              symbol={symbol}
              assetType={assetType}
              lastPrice={lastPrice}
            />
          )}
        </div>
      ) : tab !== "chart" ? (
        <SymbolTabsScrollBody
          tab={tab}
          tabLoading={tabLoading}
          loadingLabel={loadingLabel}
          degraded={degraded}
          degradedLabel={degradedLabel}
          errorLabel={errorLabel}
          assetType={assetType}
          isIndex={isIndex}
          news={news}
          press={press}
          earnings={earnings}
          earningsUpcoming={earningsUpcoming}
          earningsRecent={earningsRecent}
          earningsMetrics={earningsMetrics}
          earningsStatement={earningsStatement}
          earningsBalance={earningsBalance}
          earningsCashflow={earningsCashflow}
          earningsLoading={earningsLoading}
          earningsCryptoNa={earningsCryptoNa}
          company={company}
          officers={officers}
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
          commentsLoginRequired={commentsLoginRequired}
          commentsEmpty={commentsEmpty}
          commentsDelete={commentsDelete}
          sentiment={sentiment}
          aiAvailable={aiAvailable}
          aiMessage={aiMessage}
          aiAnalysis={aiAnalysis}
          aiDisclaimer={aiDisclaimer}
          aiCached={aiCached}
          aiLoading={aiLoading}
          aiRefreshing={aiRefreshing}
          aiToast={aiToast}
          aiToastKey={aiToastKey}
          onClearAiToast={onClearAiToast}
          onRegenerateAi={onRegenerateAi}
          aiRegenerateLabel={aiRegenerateLabel}
        />
      ) : null}
    </div>
  );
}
