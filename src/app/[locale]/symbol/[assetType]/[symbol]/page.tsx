"use client";

import { useParams } from "next/navigation";
import { TradePanel } from "@/components/trading/trade-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolHeader } from "@/components/symbol/symbol-header";
import { SymbolChartSection } from "@/components/symbol/symbol-chart-section";
import { SymbolTabsPanel } from "@/components/symbol/symbol-tabs-panel";
import { useSymbolPage } from "@/components/symbol/use-symbol-page";
import { isMarketIndexSymbol } from "@/lib/market/indices";
import { parseAssetType } from "@/lib/types";

export default function SymbolPage() {
  const params = useParams<{ assetType: string; symbol: string }>();
  const assetType = parseAssetType(params.assetType);
  const symbol = String(params.symbol || "").toUpperCase();
  const isIndex = isMarketIndexSymbol(symbol);
  const s = useSymbolPage(symbol, assetType, isIndex);

  return (
    <div className="space-y-4 animate-[qtFade_0.45s_ease]">
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
        onToggleWatchlist={() => void s.toggleWatchlist()}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
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
            className="qt-panel flex flex-wrap items-center gap-2 p-4"
          >
            <div className="text-sm font-medium leading-none">
              {s.t("setAlert")}
            </div>
            <QtSelect
              value={s.alertCondition}
              onChange={(v) => s.setAlertCondition(v as "gte" | "lte")}
              className="w-36"
              triggerClassName="h-9 px-2.5 text-sm"
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
              className="qt-input h-9 w-32 px-2 text-sm"
            />
            <SubmitButton
              type="submit"
              loading={s.alertBusy}
              loadingLabel={s.tCommon("loading")}
              className="qt-btn-primary h-9 px-3 text-sm"
            >
              {s.tAlerts("create")}
            </SubmitButton>
            {s.alertMsg && (
              <span className="text-xs text-[var(--muted)]">{s.alertMsg}</span>
            )}
          </form>

          <SymbolTabsPanel
            tabs={s.tabs}
            tab={s.tab}
            onTabChange={s.setTab}
            degraded={s.degraded}
            degradedLabel={s.tCommon("degraded")}
            tabLoading={s.tabLoading}
            loadingLabel={s.tCommon("loading")}
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
          />
        </div>
      </div>
    </div>
  );
}
