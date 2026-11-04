"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { SymbolDockCommentsPanel } from "@/components/symbol/dock/symbol-dock-comments-panel";
import {
  SymbolDockNewsPanel,
  type NewsFeedTab,
} from "@/components/symbol/dock/symbol-dock-news-panel";
import { SymbolFundamentalsPanel } from "@/components/symbol/panels/symbol-fundamentals-panel";
import { SymbolStackAiPane } from "@/components/symbol/page/symbol-stack-ai-pane";
import { useStackBottomResize } from "@/components/symbol/hooks/use-stack-bottom-resize";
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

export type StackBottomTab =
  | "news"
  | "press"
  | "trade"
  | "ai"
  | "comments"
  | "derivatives"
  | "earnings"
  | "profile";

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
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onOpenPlan: () => void;
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
  onBoundStrategyChange,
  onOpenPlan,
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
    >
      <button
        type="button"
        className="aw-stack-bottom-resizer"
        aria-label={t("resizeBottom")}
        data-dragging={bottom.dragging ? "true" : undefined}
        onPointerDown={bottom.onResizeStart}
      />

      <div
        className="aw-stack-tablist shrink-0 border-b border-[var(--aw-hairline,var(--border))]"
        role="tablist"
        aria-label={t("presetStack")}
      >
        <div className="flex h-9 items-stretch overflow-x-auto qt-scroll">
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
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {active === "news" || active === "press" ? (
          <div className="min-h-0 flex-1 overflow-y-auto qt-scroll">
            <SymbolDockNewsPanel
              feedTab={active === "press" ? "press" : "news"}
              onFeedTabChange={onNewsFeedTabChange}
              assetType={assetType}
              news={news}
              press={press}
              tabLoading={tabLoading}
              degraded={degraded}
              degradedLabel={tCommon("degraded")}
              errorLabel={tCommon("error")}
              loadingLabel={tCommon("loading")}
              hideFeedTabs
            />
          </div>
        ) : null}

        {active === "trade" ? (
          <div className="aw-stack-pane-trade flex min-h-0 flex-1 flex-col overflow-hidden">
            {authStatus === "loading" ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <InlineLoading label={tCommon("loading")} />
              </div>
            ) : !tradeAuthed ? (
              <div className="flex flex-1 items-center justify-center p-4">
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
                  footer={ruleFooter}
                  dense
                />
                <Suspense
                  fallback={
                    <div className="min-h-0 flex-1 p-4">
                      <PanelSkeleton rows={5} label={tCommon("loading")} />
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
        ) : null}

        {active === "ai" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SymbolStackAiPane symbol={symbol} assetType={assetType} />
          </div>
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
              commentsPlaceholder={tComments("placeholder")}
              commentsPost={tComments("post")}
              commentsEmpty={tComments("empty")}
              commentsDelete={tComments("delete")}
              tabLoading={tabLoading}
              loadingLabel={tCommon("loading")}
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
              <p className="text-[12px] text-[var(--muted)]">
                {tEarn("cryptoNa")}
              </p>
            ) : (
              <SymbolFundamentalsPanel
                key={active}
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
    </div>
  );
}
