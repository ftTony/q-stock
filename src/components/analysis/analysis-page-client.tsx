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
  const tNav = useTranslations("nav");
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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {tNav("analysis")}
            </h1>
            <p className="text-xs text-[var(--muted)] sm:text-sm">
              {t("subtitle")}
            </p>
          </div>
          <SegmentedControl
            value={page.assetType}
            onChange={(v) => page.setAssetType(v as AnalysisEquityType)}
            className="w-fit rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5"
            buttonClassName="px-2.5 py-1 text-[14px] font-medium leading-5"
            options={[
              { value: "stock", label: tMarket("stocks") },
              { value: "hk", label: tMarket("hk") },
              { value: "cn", label: tMarket("cn") },
            ]}
          />
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto lg:min-w-[320px] lg:max-w-md">
          <AnalysisSearch
            assetType={page.assetType}
            recent={page.recent}
            peerSymbols={page.industrySymbols}
            onAddCompare={addFromSearch}
            onRecentOpen={page.pushRecent}
          />
          <button
            type="button"
            className="qt-btn qt-btn-primary h-9 shrink-0 px-3 !text-[14px] leading-5 disabled:opacity-40"
            disabled={page.basket.length < 2}
            title={
              page.basket.length < 2 ? t("basketHint") : t("openCompare")
            }
            onClick={() => page.setWorkspace("compare")}
          >
            {t("workspaceCompare")}
            {page.basket.length > 0 ? ` ${page.basket.length}` : ""}
          </button>
        </div>
      </div>

      <div className="qt-panel overflow-hidden lg:grid lg:min-h-[520px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden h-full max-h-[70vh] border-r border-[var(--border)] lg:block lg:max-h-none">
          <AnalysisIndustryPicker
            industries={page.industries}
            selectedId={page.industryId}
            loading={page.loading}
            onSelect={page.setIndustryId}
            variant="sidebar"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col gap-2 border-b border-[var(--border)] px-3 py-2 sm:flex-row sm:items-end sm:justify-between lg:hidden">
            <AnalysisIndustryPicker
              industries={page.industries}
              selectedId={page.industryId}
              loading={page.loading}
              onSelect={page.setIndustryId}
              variant="select"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
            <div className="min-w-0">
              {page.selectedIndustry ? (
                <>
                  <div className="truncate text-[14px] font-semibold leading-5">
                    {page.selectedIndustry.name}
                  </div>
                  <div className="text-[14px] leading-5 text-[var(--muted)]">
                    {t("industryStockCount", {
                      count: page.selectedIndustry.stocks.length,
                    })}
                    <span className="mx-1.5 text-[var(--border)]">·</span>
                    {t("industryHint")}
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--muted)]">
                  {t("emptyBoard")}
                </div>
              )}
            </div>
            <SegmentedControl
              value={page.sort}
              onChange={page.setSort}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5"
              buttonClassName="px-2.5 py-1 text-[14px] font-medium leading-5"
              options={[
                { value: "changeDesc", label: tMarket("gainers") },
                { value: "changeAsc", label: tMarket("losers") },
              ]}
            />
          </div>

          <AnalysisCompareBasket
            basket={page.basket}
            onRemove={page.removeFromBasket}
            onClear={page.clearBasket}
            onOpenCompare={() => page.setWorkspace("compare")}
          />

          {page.error && (
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2 text-sm text-[var(--down)]">
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

          <div className="min-h-0 flex-1">
            <AnalysisRankTable
              items={page.items}
              loading={page.loading}
              showRange={false}
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
    </div>
  );
}
