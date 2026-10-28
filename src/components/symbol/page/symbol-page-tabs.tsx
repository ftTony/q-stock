"use client";

import type { ReactNode } from "react";
import { SymbolTabsPanel } from "@/components/symbol/tabs/symbol-tabs-panel";
import type { useSymbolPage } from "@/components/symbol/hooks/use-symbol-page";
import type { AssetType } from "@/lib/types";

type SymbolPageState = ReturnType<typeof useSymbolPage>;

type Props = {
  s: SymbolPageState;
  tab: SymbolPageState["tab"];
  chartSlot: ReactNode;
  chartPinned: boolean;
  belowChartSlot:
    | ReactNode
    | ((ctx: { secondary: ReactNode | null }) => ReactNode)
    | null;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  lastPrice: number | null;
};

/** Pass page state into tabs panel — keeps page-client under 500 lines. */
export function SymbolPageTabs({
  s,
  tab,
  chartSlot,
  chartPinned,
  belowChartSlot,
  symbol,
  assetType,
  isIndex,
  lastPrice,
}: Props) {
  return (
    <SymbolTabsPanel
      tab={tab}
      chartSlot={chartSlot}
      chartPinned={chartPinned}
      belowChartSlot={belowChartSlot ?? undefined}
      degraded={s.degraded}
      degradedLabel={s.tCommon("degraded")}
      tabLoading={s.tabLoading}
      loadingLabel={s.tCommon("loading")}
      symbol={symbol}
      assetType={assetType}
      isIndex={isIndex}
      lastPrice={lastPrice}
      news={s.news}
      press={s.press}
      earnings={s.earnings}
      earningsUpcoming={s.earningsUpcoming}
      earningsRecent={s.earningsRecent}
      earningsMetrics={s.earningsMetrics}
      earningsStatement={s.earningsStatement}
      earningsBalance={s.earningsBalance}
      earningsCashflow={s.earningsCashflow}
      earningsLoading={s.earningsLoading}
      earningsCryptoNa={s.tEarnings("cryptoNa")}
      company={s.company}
      officers={s.officers}
      comments={s.comments}
      commentText={s.commentText}
      onCommentTextChange={s.setCommentText}
      onPostComment={s.postComment}
      onDeleteComment={s.deleteComment}
      commentBusy={s.commentBusy}
      canComment={Boolean(s.session?.user)}
      currentUserId={s.session?.user?.id}
      commentsPlaceholder={s.tComments("placeholder")}
      commentsPost={s.tComments("post")}
      commentsLoginRequired={s.tComments("loginRequired")}
      commentsEmpty={s.tComments("empty")}
      commentsDelete={s.tComments("delete")}
      errorLabel={s.tCommon("error")}
      sentiment={s.sentiment}
    />
  );
}
