"use client";

import dynamic from "next/dynamic";
import { FormEvent, type ReactNode } from "react";
import type { AiTrendAnalysis } from "@/components/market/ai-analysis-panel";
import type {
  EarningsCalendarRow,
  EarningsMetric,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import { SymbolTabsScrollBody } from "@/components/symbol/tabs/symbol-tabs-scroll-body";
import type {
  CommentRow,
  NewsRow,
  PressRow,
  SymbolTab,
} from "@/components/symbol/tabs/symbol-tabs-types";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { EarningsStatement } from "@/lib/earnings/types";
import type { AssetType } from "@/lib/types";

export type {
  CommentRow,
  NewsRow,
  PressRow,
  SymbolTab,
} from "@/components/symbol/tabs/symbol-tabs-types";

const SymbolDerivativesPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-derivatives-panel").then((m) => ({
      default: m.SymbolDerivativesPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 sm:p-5">
        <PanelSkeleton rows={6} />
      </div>
    ),
  },
);

type Props = {
  tab: SymbolTab;
  /** Rendered when active tab is `chart` (main workbench chart). */
  chartSlot?: ReactNode;
  /**
   * H5: keep chart mounted above the below-chart stack (never unmount).
   * Pinned fixed height; remaining height scrolls (PRD §3.4 / Futu rhythm).
   */
  chartPinned?: boolean;
  /**
   * H5: under-chart stack. Pass a node, or a render fn to place secondary
   * (新闻/基本面/衍生品) inside the below-chart scroll.
   */
  belowChartSlot?:
    | ReactNode
    | ((ctx: { secondary: ReactNode | null }) => ReactNode);
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
  /** Dead AI tab props — optional; desk is FAB-only. */
  aiAvailable?: boolean | null;
  aiMessage?: string | null;
  aiAnalysis?: AiTrendAnalysis | null;
  aiDisclaimer?: string | null;
  aiCached?: boolean;
  aiLoading?: boolean;
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
  chartPinned = false,
  belowChartSlot,
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
  aiAvailable = null,
  aiMessage = null,
  aiAnalysis = null,
  aiDisclaimer = null,
  aiCached = false,
  aiLoading = false,
  aiRefreshing = false,
  aiToast,
  aiToastKey,
  onClearAiToast,
  onRegenerateAi,
  aiRegenerateLabel,
}: Props) {
  const showSecondary = tab !== "chart";
  // H5 pinned: fixed px via .aw-tab-chart--pinned (not vh) to avoid chrome thrash.
  const chartClass = chartPinned
    ? "aw-tab-chart aw-tab-chart--pinned shrink-0 overflow-hidden"
    : `aw-tab-chart min-h-0 flex-1 overflow-hidden ${
        showSecondary ? "hidden" : ""
      }`;

  const secondaryBody =
    tab === "derivatives" ? (
      <div className="flex min-h-0 flex-col">
        {tabLoading ? (
          <div className="overflow-y-auto p-4 sm:p-5">
            <PanelSkeleton rows={6} label={loadingLabel} />
          </div>
        ) : (
          <SymbolDerivativesPanel
            symbol={symbol}
            assetType={assetType}
            lastPrice={lastPrice}
          />
        )}
      </div>
    ) : showSecondary ? (
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
    ) : null;

  return (
    <div className="aw-surface-flush flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--aw-canvas)]">
      {degraded && showSecondary && !chartPinned ? (
        <p className="aw-caption shrink-0 px-4 pt-3 sm:px-5">{degradedLabel}</p>
      ) : null}

      {/* Keep chart mounted across tab switches — remounting klinecharts is costly. */}
      {chartSlot ? (
        <div
          className={chartClass}
          aria-hidden={!chartPinned && showSecondary}
        >
          {chartSlot}
        </div>
      ) : null}

      {chartPinned ? (
        typeof belowChartSlot === "function" ? (
          belowChartSlot({ secondary: secondaryBody })
        ) : (
          belowChartSlot
        )
      ) : (
        <>
          {typeof belowChartSlot === "function"
            ? belowChartSlot({ secondary: null })
            : belowChartSlot}
          {secondaryBody}
        </>
      )}
    </div>
  );
}
