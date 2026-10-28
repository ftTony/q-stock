"use client";

import dynamic from "next/dynamic";
import { Suspense, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import {
  InlineLoading,
  PanelSkeleton,
} from "@/components/ui/panel-skeleton";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AssetType } from "@/lib/types";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import { SymbolDockCommentsPanel } from "@/components/symbol/dock/symbol-dock-comments-panel";
import {
  SymbolDockNewsPanel,
  type NewsFeedTab,
} from "@/components/symbol/dock/symbol-dock-news-panel";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import "../styles/apple-workbench.css";

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
  onStrategyIdChange?: (id: string, name?: string) => void;
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
  /** Leave room for desktop side dock; 0 on H5 (no dock). */
  edgeOffsetPx?: number;
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
  onStrategyIdChange,
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
  commentsEmpty,
  commentsDelete,
  tabLoading,
  degraded,
  degradedLabel,
  errorLabel,
  loadingLabel,
  edgeOffsetPx = 44,
}: Props) {
  const t = useTranslations("symbol");
  const tRail = useTranslations("symbolRail");
  const tTrading = useTranslations("trading");
  const { data: session, status: authStatus } = useSession();
  const tradeAuthed = authStatus === "authenticated" && Boolean(session?.user);

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
      edgeOffsetPx={edgeOffsetPx}
    >
      {dock === "trade" ? (
        <div className="aw-dock-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
          {authStatus === "loading" ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
              <InlineLoading label={loadingLabel} />
            </div>
          ) : !tradeAuthed ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
              <AuthLoginGate
                compact
                title={tTrading("loginTitle")}
                body={tTrading("loginBody")}
                hint={tTrading("loginHint")}
              />
            </div>
          ) : (
            <>
              <SymbolPaperRiskBar
                symbol={symbol}
                assetType={assetType}
                lastPrice={lastPrice}
              />
              {strategyName ? (
                <div className="flex h-9 items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))] px-4">
                  <span className="min-w-0 truncate text-[12px] text-[var(--muted)]">
                    {tRail("orderRuleTag")}
                    <span className="mx-1 text-[var(--border)]">·</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {strategyName}
                    </span>
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
                <div className="flex h-9 items-center border-b border-[var(--aw-hairline,var(--border))] px-4">
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
                  <div className="p-4">
                    <PanelSkeleton rows={5} label={loadingLabel} />
                  </div>
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
                  onStrategyIdChange={onStrategyIdChange}
                />
              </Suspense>
            </>
          )}
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
          commentsEmpty={commentsEmpty}
          commentsDelete={commentsDelete}
          tabLoading={tabLoading}
          loadingLabel={loadingLabel}
        />
      ) : null}
    </SideDrawer>
  );
}
