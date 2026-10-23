"use client";

import { useTranslations } from "next-intl";
import { PaginatedList } from "@/components/ui/paginated-list";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
import { formatDate } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";
import type { NewsRow, PressRow } from "@/components/symbol/symbol-tabs-panel";

export type NewsFeedTab = "news" | "press";

type Props = {
  feedTab: NewsFeedTab;
  onFeedTabChange: (tab: NewsFeedTab) => void;
  assetType: AssetType;
  news: NewsRow[];
  press: PressRow[];
  tabLoading: boolean;
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  loadingLabel: string;
};

/** Combined news + press drawer body with inner tabs (no grey band). */
export function SymbolDockNewsPanel({
  feedTab,
  onFeedTabChange,
  assetType,
  news,
  press,
  tabLoading,
  degraded,
  degradedLabel,
  errorLabel,
  loadingLabel,
}: Props) {
  const t = useTranslations("symbol");
  const showPress = assetType !== "crypto";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" className="aw-dock-feed-tabs flex shrink-0 items-stretch px-2">
        <button
          type="button"
          role="tab"
          aria-selected={feedTab === "news"}
          data-active={feedTab === "news"}
          onClick={() => onFeedTabChange("news")}
          className="aw-tab"
        >
          {t("news")}
        </button>
        {showPress ? (
          <button
            type="button"
            role="tab"
            aria-selected={feedTab === "press"}
            data-active={feedTab === "press"}
            onClick={() => onFeedTabChange("press")}
            className="aw-tab"
          >
            {t("press")}
          </button>
        ) : null}
      </div>

      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-1">
        {feedTab === "news" ? (
          tabLoading ? (
            <p className="aw-caption flex min-h-[12rem] items-center justify-center">
              {loadingLabel}
            </p>
          ) : (
            <PaginatedList
              items={news}
              pageSize={8}
              resetKey={`dock-news-${news.length}-${news[0]?.headline ?? ""}`}
              empty={
                <EmptyStateBlock
                  art="news"
                  label={degraded ? degradedLabel : errorLabel}
                />
              }
              renderItem={(n, i) => (
                <li
                  key={`${n.url || n.headline}-${i}`}
                  className="space-y-1 border-b border-[var(--aw-hairline,var(--border))] py-3.5 last:border-0"
                >
                  <a
                    href={n.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[14px] font-semibold leading-[1.35] tracking-[-0.2px] text-[var(--aw-ink)] hover:text-[var(--aw-primary)]"
                  >
                    {n.headline}
                  </a>
                  {n.summary ? (
                    <p className="aw-caption line-clamp-2 leading-[1.45]">
                      {n.summary}
                    </p>
                  ) : null}
                  <div className="aw-caption pt-0.5">
                    {n.source}
                    {n.datetime
                      ? ` · ${formatDate(
                          n.datetime > 1e12 ? n.datetime : n.datetime * 1000,
                        )}`
                      : ""}
                  </div>
                </li>
              )}
            />
          )
        ) : !showPress ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            N/A
          </p>
        ) : tabLoading ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            {loadingLabel}
          </p>
        ) : (
          <PaginatedList
            items={press}
            pageSize={8}
            resetKey={`dock-press-${press.length}-${press[0]?.headline ?? ""}`}
            empty={
              <EmptyStateBlock art="news" label={degradedLabel} />
            }
            renderItem={(p, i) => (
              <li
                key={`${p.url || p.headline}-${i}`}
                className="space-y-1 border-b border-[var(--aw-hairline,var(--border))] py-3.5 last:border-0"
              >
                <a
                  href={p.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[14px] font-semibold leading-[1.35] tracking-[-0.2px] text-[var(--aw-ink)] hover:text-[var(--aw-primary)]"
                >
                  {p.headline || p.description || "Press release"}
                </a>
                {p.description && p.headline ? (
                  <p className="aw-caption line-clamp-2 leading-[1.45]">
                    {p.description}
                  </p>
                ) : null}
                <div className="aw-caption pt-0.5">
                  {p.datetime ? formatDate(p.datetime) : ""}
                  {p.source ? ` · ${p.source}` : ""}
                </div>
              </li>
            )}
          />
        )}
      </div>
    </div>
  );
}
