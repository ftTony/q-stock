"use client";

import { TradePanel } from "@/components/trading/trade-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolAiFab } from "@/components/symbol/symbol-ai-fab";
import { SymbolHeader } from "@/components/symbol/symbol-header";
import { SymbolChartSection } from "@/components/symbol/symbol-chart-section";
import { SymbolTabsPanel } from "@/components/symbol/symbol-tabs-panel";
import { useSymbolPage } from "@/components/symbol/use-symbol-page";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  initialQuote?: Quote | null;
};

export function SymbolPageClient({
  symbol,
  assetType,
  initialQuote = null,
}: Props) {
  const isIndex = isMarketIndexSymbol(symbol);
  const s = useSymbolPage(symbol, assetType, isIndex, initialQuote);

  return (
    <div className="space-y-4">
      <SymbolHeader
        symbol={symbol}
        assetType={assetType}
        quote={s.quote}
        metrics={s.earningsMetrics}
        updatedAt={s.updatedAt}
        inWatchlist={s.inWatchlist}
        watchBusy={s.watchBusy}
        watchLabel={s.t("addWatchlist")}
        watchLabelActive={s.t("inWatchlist")}
        loadingLabel={s.tCommon("loading")}
        backLabel={s.t("back")}
        onToggleWatchlist={() => void s.toggleWatchlist()}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start animate-[qtFade_0.45s_ease]">
        <div className="lg:col-start-1 min-w-0">
          <SymbolChartSection
            resolution={s.resolution}
            onResolutionChange={s.setResolution}
            resolutionLabels={{
              D: s.t("day"),
              Q: s.t("quarter"),
              Y: s.t("year"),
            }}
            indicatorsLabel={s.t("indicators")}
            flags={s.flags}
            onFlagToggle={(key) =>
              s.setFlags((f) => ({ ...f, [key]: !f[key] }))
            }
            loadingChart={s.loadingChart}
            loadingLabel={s.tCommon("loading")}
            bars={s.bars}
            assetType={assetType}
            symbol={symbol}
            onLoadMore={s.loadMoreCandles}
            loadingMore={s.loadingMoreCandles}
            hasMore={s.hasMoreCandles}
          />
        </div>

        <aside className="flex flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:overscroll-contain qt-scroll">
          <TradePanel
            symbol={symbol}
            assetType={assetType}
            lastPrice={s.quote?.price ?? null}
            bid={s.quote?.bid ?? null}
            ask={s.quote?.ask ?? null}
          />
        </aside>

        <div className="space-y-4 min-w-0 lg:col-start-1">
          <form
            onSubmit={s.createAlert}
            aria-label={s.t("setAlert")}
            className="flex flex-wrap items-center gap-1.5 border-y border-[var(--border)] bg-[var(--panel)] px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-2.5"
          >
            {/* Title needs width — hide on narrow so condition + price + CTA stay one row. */}
            <div className="hidden shrink-0 text-[14px] font-medium leading-none md:block">
              {s.t("setAlert")}
            </div>
            <QtSelect
              value={s.alertCondition}
              onChange={(v) => s.setAlertCondition(v as "gte" | "lte")}
              aria-label={s.tAlerts("condition")}
              className="w-[6.25rem] shrink-0 sm:w-32"
              triggerClassName="h-9 px-2 text-[13px] sm:px-2.5 sm:text-[14px]"
              options={[
                { value: "gte", label: s.tAlerts("gte") },
                { value: "lte", label: s.tAlerts("lte") },
              ]}
            />
            <input
              type="number"
              step="any"
              required
              value={s.alertPrice}
              onChange={(e) => s.setAlertPrice(e.target.value)}
              placeholder={s.tAlerts("triggerPrice")}
              aria-label={s.tAlerts("triggerPrice")}
              className="qt-input h-9 min-w-0 flex-1 px-2 text-[13px] tabular-nums sm:w-28 sm:flex-none sm:px-2.5 sm:text-[14px]"
            />
            <SubmitButton
              type="submit"
              loading={s.alertBusy}
              loadingLabel={s.tCommon("loading")}
              className="qt-btn-primary h-9 max-w-[4.5rem] shrink-0 truncate rounded-md px-2.5 text-[13px] font-medium leading-none sm:max-w-none sm:px-3 sm:text-[14px]"
            >
              {s.tAlerts("create")}
            </SubmitButton>
            {s.alertMsg ? (
              <span className="w-full text-[12px] text-[var(--muted)] sm:w-auto sm:text-[14px]">
                {s.alertMsg}
              </span>
            ) : null}
          </form>

          <SymbolTabsPanel
            tabs={s.tabs}
            tab={s.tab}
            onTabChange={s.setTab}
            degraded={s.degraded}
            degradedLabel={s.tCommon("degraded")}
            tabLoading={s.tabLoading}
            loadingLabel={s.tCommon("loading")}
            symbol={symbol}
            assetType={assetType}
            isIndex={isIndex}
            news={s.news}
            press={s.press}
            earnings={s.earnings}
            earningsUpcoming={s.earningsUpcoming}
            earningsRecent={s.earningsRecent}
            earningsMetrics={s.earningsMetrics}
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
            aiAvailable={s.aiAvailable}
            aiMessage={s.aiMessage}
            aiAnalysis={s.aiAnalysis}
            aiDisclaimer={s.aiDisclaimer}
            aiCached={s.aiCached}
            aiLoading={s.aiLoading}
            aiRefreshing={s.aiRefreshing}
            aiToast={s.aiToast}
            aiToastKey={s.aiToastKey}
            onClearAiToast={s.clearAiToast}
            onRegenerateAi={
              s.session?.user ? () => void s.regenerateAi() : undefined
            }
            aiRegenerateLabel={s.t("aiRegenerate")}
          />
        </div>
      </div>

      <SymbolAiFab symbol={symbol} assetType={assetType} />
    </div>
  );
}
