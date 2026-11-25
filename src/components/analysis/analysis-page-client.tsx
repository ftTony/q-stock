"use client";

import { useTranslations } from "next-intl";
import { AnalysisCompareBasket } from "@/components/analysis/analysis-compare-basket";
import { AnalysisComparePanel } from "@/components/analysis/analysis-compare-panel";
import { AnalysisIndustryPicker } from "@/components/analysis/analysis-industry-picker";
import { AnalysisRankTable } from "@/components/analysis/analysis-rank-table";
import { AnalysisSearch } from "@/components/analysis/analysis-search";
import { useAnalysisPage } from "@/components/analysis/use-analysis-page";
import type {
  AnalysisEquityType,
  IndustryHeatCell,
} from "@/components/analysis/types";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { SearchResult } from "@/lib/types";

type Props = {
  initialIndustries: IndustryHeatCell[];
};

export function AnalysisPageClient({ initialIndustries }: Props) {
  const t = useTranslations("analysis");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const page = useAnalysisPage(initialIndustries);

  function addFromSearch(
    item:
      | SearchResult
      | { symbol: string; assetType: string; description?: string },
  ) {
    if (item.assetType !== page.assetType) return false;
    if (!page.industrySymbols.has(item.symbol)) return false;
    return page.addToBasket({
      symbol: item.symbol,
      assetType: page.assetType,
      name: "description" in item ? item.description : undefined,
    });
  }

  if (page.workspace === "compare") {
    return (
      <AnalysisComparePanel
        basket={page.basket}
        industryName={page.selectedIndustry?.name}
        onBack={() => page.setWorkspace("boards")}
        onRemove={page.removeFromBasket}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          value={page.assetType}
          onChange={(v) => page.setAssetType(v as AnalysisEquityType)}
          className="h-8 w-fit items-stretch rounded-none border border-[var(--border)] bg-[var(--panel)] p-0.5"
          buttonClassName="inline-flex items-center px-3 text-[13px] font-medium leading-none"
          options={[
            { value: "stock", label: tMarket("stocks") },
            { value: "hk", label: tMarket("hk") },
            { value: "cn", label: tMarket("cn") },
          ]}
        />
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:min-w-[280px] sm:max-w-md">
          <AnalysisSearch
            assetType={page.assetType}
            recent={page.recent}
            peerSymbols={page.industrySymbols}
            onAddCompare={addFromSearch}
            onRecentOpen={page.pushRecent}
          />
          {page.basket.length > 0 ? (
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-8 shrink-0 px-3 text-[13px] font-medium leading-none disabled:opacity-40"
              disabled={page.basket.length < 2}
              title={
                page.basket.length < 2 ? t("basketHint") : t("openCompare")
              }
              onClick={() => page.setWorkspace("compare")}
            >
              {t("workspaceCompare")} {page.basket.length}
            </button>
          ) : null}
        </div>
      </div>

      <div className="qt-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnalysisIndustryPicker
          industries={page.industries}
          selectedId={page.industryId}
          loading={page.loading}
          onSelect={page.setIndustryId}
          variant="strip"
        />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2">
          <div className="min-w-0 shrink">
            {page.selectedIndustry ? (
              <>
                <div className="truncate text-[13px] font-semibold tracking-tight">
                  {page.selectedIndustry.name}
                </div>
                <div className="truncate text-[12px] text-[var(--muted)]">
                  {t("industryLoaded", {
                    loaded: page.loadedCount,
                    total: page.stocksTotal,
                  })}
                  <span className="mx-1.5 text-[var(--border)]">·</span>
                  {t("industryHint")}
                  <span className="mx-1.5 hidden text-[var(--border)] sm:inline">
                    ·
                  </span>
                  <span className="hidden sm:inline">{t("columnHint")}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-[var(--muted)]">
                {t("emptyBoard")}
              </div>
            )}
          </div>
          <AnalysisCompareBasket
            basket={page.basket}
            onRemove={page.removeFromBasket}
            onClear={page.clearBasket}
            onOpenCompare={() => page.setWorkspace("compare")}
            variant="inline"
          />
        </div>

        {page.error && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2 text-sm text-[var(--down)]">
            <span>
              {page.error === "unavailable"
                ? t("industryEmpty")
                : page.error}
            </span>
            <button
              type="button"
              className="qt-btn qt-btn-ghost text-xs"
              onClick={() => void page.loadIndustries(page.assetType)}
            >
              {tCommon("retry")}
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <AnalysisRankTable
            items={page.items}
            loading={page.loading}
            loadingMore={page.loadingMore}
            hasMore={page.hasMore}
            onLoadMore={page.loadMore}
            basketKeys={page.basketKeys}
            basketCount={page.basket.length}
            watched={page.watched}
            canWatch={Boolean(page.session?.user)}
            onToggleBasket={page.toggleBasket}
            onToggleWatch={page.toggleWatch}
          />
        </div>
      </div>
    </div>
  );
}
