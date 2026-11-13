"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import type { NewsFeedTab } from "@/components/symbol/dock/symbol-dock-news-panel";
import { useStackBottomResize } from "@/components/symbol/hooks/use-stack-bottom-resize";
import { SymbolStackBottomPanes } from "@/components/symbol/page/symbol-stack-bottom-panes";
import type {
  CommentRow,
  NewsRow,
  PressRow,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { EarningsStatement } from "@/lib/earnings/types";
import type {
  EarningsCalendarRow,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import type { AssetType, Quote } from "@/lib/types";

export type StackBottomTab =
  | "news"
  | "press"
  | "trade"
  | "ai"
  | "comments"
  | "derivatives"
  | "earnings"
  | "profile";

/** Soft keep-alive candidates (heavy remount cost). Cap via LRU. */
const SOFT_KEEP: ReadonlySet<StackBottomTab> = new Set([
  "news",
  "trade",
  "ai",
]);
const SOFT_KEEP_MAX = 3;

type Props = {
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
  onOpenPlan: () => void;
  onOpenSymbolReview?: (orderId?: string | null) => void;
  onOpenAi: () => void;
  tab: StackBottomTab;
  onTabChange: (tab: StackBottomTab) => void;
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
};

const ALL_TABS: {
  id: StackBottomTab;
  labelKey:
    | "tabNews"
    | "tabPress"
    | "tabTrade"
    | "tabAi"
    | "tabComments"
    | "tabDerivatives"
    | "tabEarnings"
    | "tabProfile";
}[] = [
  { id: "news", labelKey: "tabNews" },
  { id: "press", labelKey: "tabPress" },
  { id: "trade", labelKey: "tabTrade" },
  { id: "ai", labelKey: "tabAi" },
  { id: "comments", labelKey: "tabComments" },
  { id: "derivatives", labelKey: "tabDerivatives" },
  { id: "earnings", labelKey: "tabEarnings" },
  { id: "profile", labelKey: "tabProfile" },
];

function tabsForAsset(
  assetType: AssetType,
  isIndex: boolean,
): typeof ALL_TABS {
  if (assetType === "crypto" || isIndex) {
    return ALL_TABS.filter(
      (x) =>
        x.id === "news" ||
        x.id === "trade" ||
        x.id === "ai" ||
        x.id === "comments",
    );
  }
  if (assetType === "cn") {
    return ALL_TABS.filter((x) => x.id !== "derivatives");
  }
  if (assetType === "hk") {
    return ALL_TABS.filter((x) => x.id !== "press");
  }
  return ALL_TABS;
}

function softKeepId(tab: StackBottomTab): StackBottomTab | null {
  if (tab === "press") return "news";
  if (SOFT_KEEP.has(tab)) return tab;
  return null;
}

/** Desktop stack layout: resizable bottom tab strip + content. */
export function SymbolStackBottomPanel({
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
  onOpenPlan,
  onOpenSymbolReview,
  onOpenAi,
  tab,
  onTabChange,
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
}: Props) {
  const t = useTranslations("symbolLayout");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tTrading = useTranslations("trading");
  const tRail = useTranslations("symbolRail");
  const tEarn = useTranslations("earnings");
  const { data: session, status: authStatus } = useSession();
  const tradeAuthed = authStatus === "authenticated" && Boolean(session?.user);
  const bottom = useStackBottomResize();

  const items = useMemo(
    () => tabsForAsset(assetType, isIndex),
    [assetType, isIndex],
  );
  const active = items.some((x) => x.id === tab) ? tab : items[0]?.id ?? "news";

  const [kept, setKept] = useState<StackBottomTab[]>(["news"]);

  useEffect(() => {
    setKept(["news"]);
  }, [symbol, assetType]);

  useEffect(() => {
    const id = softKeepId(active);
    if (!id) return;
    setKept((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)];
      return next.slice(0, SOFT_KEEP_MAX);
    });
  }, [active]);

  /** External openPlan / openTrade / review while collapsed → show content. */
  useEffect(() => {
    if (bottom.collapsed) bottom.expand();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- expand on tab change only
  }, [active]);

  const mountNews =
    active === "news" || active === "press" || kept.includes("news");
  const mountTrade = active === "trade" || kept.includes("trade");
  const mountAi = active === "ai" || kept.includes("ai");

  const ruleFooter = boundRuleName ? (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-[12px] leading-snug text-[var(--muted)]">
        {tRail("orderRuleTag")}
        <span className="mx-1 text-[var(--border)]">·</span>
        <span className="font-medium text-[var(--foreground)]">
          {boundRuleName}
        </span>
      </span>
      <button
        type="button"
        className="aw-text-link shrink-0 text-[12px] leading-none"
        onClick={onOpenPlan}
      >
        {tRail("orderChangeRule")}
      </button>
    </div>
  ) : (
    <button
      type="button"
      className="text-left text-[12px] leading-snug text-[var(--aw-primary)] hover:underline"
      onClick={onOpenPlan}
    >
      {tRail("orderSuggestRule")}
    </button>
  );

  return (
    <div
      className="aw-stack-bottom flex shrink-0 flex-col overflow-hidden bg-[var(--aw-canvas)]"
      style={{ height: bottom.height }}
      data-resizing={bottom.dragging ? "true" : undefined}
      data-collapsed={bottom.collapsed ? "true" : undefined}
    >
      <button
        type="button"
        className="aw-stack-bottom-resizer"
        aria-label={t("resizeBottom")}
        data-dragging={bottom.dragging ? "true" : undefined}
        onPointerDown={bottom.onResizeStart}
      />

      <div
        className="aw-stack-tablist flex shrink-0 items-stretch border-b border-[var(--aw-hairline,var(--border))]"
        role="tablist"
        aria-label={t("presetStack")}
      >
        <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto qt-scroll">
          {items.map((item) => {
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                data-active={selected ? "true" : undefined}
                onClick={() => {
                  if (bottom.collapsed) bottom.expand();
                  onTabChange(item.id);
                  if (item.id === "news" || item.id === "press") {
                    onNewsFeedTabChange(item.id);
                  }
                }}
                className="aw-tab aw-stack-tab shrink-0"
              >
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="aw-stack-collapse-btn"
          aria-expanded={!bottom.collapsed}
          aria-label={
            bottom.collapsed ? t("expandBottom") : t("collapseBottom")
          }
          title={bottom.collapsed ? t("expandBottom") : t("collapseBottom")}
          onClick={bottom.toggleCollapsed}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            {bottom.collapsed ? (
              <path
                d="M6 14.5L12 8.5l6 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M6 9.5L12 15.5l6-6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Keep panes mounted while collapsed — avoid trade/AI remount cost. */}
      <div
        className={
          bottom.collapsed
            ? "hidden"
            : "flex min-h-0 flex-1 flex-col overflow-hidden"
        }
        aria-hidden={bottom.collapsed || undefined}
      >
        <SymbolStackBottomPanes
          active={active}
          mountNews={mountNews}
          mountTrade={mountTrade}
          mountAi={mountAi}
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          quote={quote}
          lastPrice={lastPrice}
          percentChange={percentChange}
          quoteName={quoteName}
          bid={bid}
          ask={ask}
          boundStrategyId={boundStrategyId}
          boundRuleName={boundRuleName}
          onOpenPlan={onOpenPlan}
          onOpenSymbolReview={onOpenSymbolReview}
          onOpenAi={onOpenAi}
          onNewsFeedTabChange={onNewsFeedTabChange}
          news={news}
          press={press}
          comments={comments}
          commentText={commentText}
          onCommentTextChange={onCommentTextChange}
          onPostComment={onPostComment}
          onDeleteComment={onDeleteComment}
          commentBusy={commentBusy}
          canComment={canComment}
          currentUserId={currentUserId}
          tabLoading={tabLoading}
          newsReady={newsReady}
          pressReady={pressReady}
          degraded={degraded}
          earnings={earnings}
          earningsUpcoming={earningsUpcoming}
          earningsRecent={earningsRecent}
          earningsMetrics={earningsMetrics}
          earningsStatement={earningsStatement}
          earningsBalance={earningsBalance}
          earningsCashflow={earningsCashflow}
          earningsLoading={earningsLoading}
          company={company}
          officers={officers}
          tradeAuthed={tradeAuthed}
          authStatus={authStatus}
          ruleFooter={ruleFooter}
          loadingLabel={tCommon("loading")}
          degradedLabel={tCommon("degraded")}
          errorLabel={tCommon("error")}
          cryptoNaLabel={tEarn("cryptoNa")}
          loginTitle={tTrading("loginTitle")}
          loginBody={tTrading("loginBody")}
          loginHint={tTrading("loginHint")}
          commentsPlaceholder={tComments("placeholder")}
          commentsPost={tComments("post")}
          commentsEmpty={tComments("empty")}
          commentsDelete={tComments("delete")}
        />
      </div>
    </div>
  );
}
