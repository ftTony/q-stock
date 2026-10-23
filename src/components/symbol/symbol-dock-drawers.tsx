"use client";

import dynamic from "next/dynamic";
import { Suspense, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AssetType } from "@/lib/types";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/symbol-tabs-panel";
import { SymbolDockCommentsPanel } from "@/components/symbol/symbol-dock-comments-panel";
import {
  SymbolDockNewsPanel,
  type NewsFeedTab,
} from "@/components/symbol/symbol-dock-news-panel";
import type { SideIconId } from "@/components/symbol/symbol-side-icon-rail";
import "./apple-workbench.css";

const TradePanel = dynamic(
  () =>
    import("@/components/trading/trade-panel").then((m) => ({
      default: m.TradePanel,
    })),
  { ssr: false },
);

const SymbolPaperRiskBar = dynamic(
  () =>
    import("@/components/symbol/symbol-paper-risk-bar").then((m) => ({
      default: m.SymbolPaperRiskBar,
    })),
  { ssr: false },
);

type Props = {
  dock: Exclude<SideIconId, "ai"> | null;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  bid: number | null;
  ask: number | null;
  strategyId: string | null;
  strategyName: string | null;
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
  commentsLoginRequired: string;
  commentsEmpty: string;
  commentsDelete: string;
  tabLoading: boolean;
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  loadingLabel: string;
};

export function SymbolDockDrawers({
  dock,
  onClose,
  symbol,
  assetType,
  lastPrice,
  bid,
  ask,
  strategyId,
  strategyName,
  onOpenAi,
  onOpenPlan,
  newsFeedTab,
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
  commentsPlaceholder,
  commentsPost,
  commentsLoginRequired,
  commentsEmpty,
  commentsDelete,
  tabLoading,
  degraded,
  degradedLabel,
  errorLabel,
  loadingLabel,
}: Props) {
  const t = useTranslations("symbol");
  const tRail = useTranslations("symbolRail");

  const title =
    dock === "trade"
      ? t("tradeDock")
      : dock === "news"
        ? t("newsPress")
        : dock === "comments"
          ? t("comments")
          : "";

  return (
    <SideDrawer
      open={dock != null}
      onClose={onClose}
      title={title}
      className="aw aw-dock-drawer"
      edgeOffsetPx={0}
    >
      {dock === "trade" ? (
        <div className="aw-dock-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SymbolPaperRiskBar
            symbol={symbol}
            assetType={assetType}
            lastPrice={lastPrice}
          />
          {strategyName ? (
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
              <span className="aw-caption truncate">
                {tRail("orderRuleTag")}:{" "}
                <span className="text-[var(--foreground)]">{strategyName}</span>
              </span>
              <button
                type="button"
                className="aw-text-link shrink-0 text-[12px]"
                onClick={() => {
                  onClose();
                  onOpenPlan();
                }}
              >
                {tRail("orderChangeRule")}
              </button>
            </div>
          ) : (
            <div className="border-b border-[var(--border)] px-4 py-2">
              <button
                type="button"
                className="aw-text-link text-[12px]"
                onClick={() => {
                  onClose();
                  onOpenPlan();
                }}
              >
                {tRail("orderSuggestRule")}
              </button>
            </div>
          )}
          <Suspense
            fallback={
              <p className="aw-caption p-4">{loadingLabel}</p>
            }
          >
            <TradePanel
              symbol={symbol}
              assetType={assetType}
              lastPrice={lastPrice}
              bid={bid}
              ask={ask}
              onOpenAi={onOpenAi}
              strategyId={strategyId ?? ""}
            />
          </Suspense>
        </div>
      ) : null}

      {dock === "news" ? (
        <SymbolDockNewsPanel
          feedTab={newsFeedTab}
          onFeedTabChange={onNewsFeedTabChange}
          assetType={assetType}
          news={news}
          press={press}
          tabLoading={tabLoading}
          degraded={degraded}
          degradedLabel={degradedLabel}
          errorLabel={errorLabel}
          loadingLabel={loadingLabel}
        />
      ) : null}

      {dock === "comments" ? (
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
          commentsLoginRequired={commentsLoginRequired}
          commentsEmpty={commentsEmpty}
          commentsDelete={commentsDelete}
          tabLoading={tabLoading}
          loadingLabel={loadingLabel}
        />
      ) : null}
    </SideDrawer>
  );
}
