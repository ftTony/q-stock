"use client";

import { type FormEvent } from "react";
import { useSession } from "@/lib/auth/react";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { InlineLoading } from "@/components/ui/panel-skeleton";
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
import { SymbolDockTradeBody } from "@/components/symbol/dock/symbol-dock-trade-body";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import "../styles/apple-workbench.css";

type TradeDockView = "desk" | "ticket";

type Props = {
  dock: Exclude<SideIconId, "ai"> | null;
  onClose: () => void;
  tradeDockView?: TradeDockView;
  onTradeDockViewChange?: (v: TradeDockView) => void;
  /** Stack: bottom strip is the desk — dock never mounts desk again. */
  tradeTicketOnly?: boolean;
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  percentChange?: number | null;
  quoteName?: string | null;
  bid: number | null;
  ask: number | null;
  strategyId: string | null;
  strategyName: string | null;
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
  /** Leave room for desktop side dock; 0 on H5 (no dock). */
  edgeOffsetPx?: number;
  /** Align below sticky topbar with the symbol shell / side icon rail. */
  topOffsetPx?: number;
};

export function SymbolDockDrawers({
  dock,
  onClose,
  tradeDockView = "desk",
  onTradeDockViewChange,
  tradeTicketOnly = false,
  symbol,
  assetType,
  lastPrice,
  percentChange = null,
  quoteName = null,
  bid,
  ask,
  strategyId,
  strategyName,
  onOpenAi,
  onOpenPlan,
  onOpenSymbolReview,
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
  newsReady = false,
  pressReady = false,
  degraded,
  degradedLabel,
  errorLabel,
  loadingLabel,
  edgeOffsetPx = 48,
  topOffsetPx = 0,
}: Props) {
  const t = useTranslations("symbol");
  const tTrading = useTranslations("trading");
  const { data: session, status: authStatus } = useSession();
  const tradeAuthed = authStatus === "authenticated" && Boolean(session?.user);

  const tradeIsTicket = tradeTicketOnly || tradeDockView === "ticket";

  const title =
    dock === "trade"
      ? tradeIsTicket
        ? tTrading("deskTicketTitle")
        : tTrading("deskTabsLabel")
      : dock === "news"
        ? t("newsPress")
        : dock === "comments"
          ? t("comments")
          : "";

  // H5: full-bleed; desktop: compact strip (no split rail in the dock).
  const widthClassName =
    dock === "trade"
      ? "w-full max-w-none lg:max-w-[26rem]"
      : dock === "news" || dock === "comments"
        ? "w-full max-w-none lg:max-w-[28rem]"
        : undefined;

  return (
    <SideDrawer
      open={dock != null}
      onClose={onClose}
      title={title}
      className="aw aw-dock-drawer"
      widthClassName={widthClassName}
      edgeOffsetPx={edgeOffsetPx}
      topOffsetPx={topOffsetPx}
    >
      {dock === "trade" ? (
        <div className="flex min-h-0 flex-1 flex-col">
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
            <SymbolDockTradeBody
              view={tradeIsTicket ? "ticket" : "desk"}
              onViewChange={(v) => onTradeDockViewChange?.(v)}
              ticketOnly={tradeTicketOnly}
              symbol={symbol}
              assetType={assetType}
              lastPrice={lastPrice}
              percentChange={percentChange}
              quoteName={quoteName}
              bid={bid}
              ask={ask}
              strategyId={strategyId}
              strategyName={strategyName}
              onOpenAi={onOpenAi}
              onOpenPlan={() => {
                onClose();
                onOpenPlan();
              }}
              onOpenSymbolReview={
                onOpenSymbolReview
                  ? (orderId) => {
                      onClose();
                      onOpenSymbolReview(orderId);
                    }
                  : undefined
              }
              loadingLabel={loadingLabel}
            />
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
          newsReady={newsReady}
          pressReady={pressReady}
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
