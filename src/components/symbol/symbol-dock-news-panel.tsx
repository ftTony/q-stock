"use client";

import { useTranslations } from "next-intl";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
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

/** Combined news + press drawer — chip tabs, scrollable list, no divider lines. */
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
      <div role="tablist" className="aw-dock-feed-tabs aw-dock-feed-tabs--nolines shrink-0">
        <button
          type="button"
          role="tab"
          aria-selected={feedTab === "news"}
          data-active={feedTab === "news"}
          onClick={() => onFeedTabChange("news")}
          className="aw-dock-chip"
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
            className="aw-dock-chip"
          >
            {t("press")}
          </button>
        ) : null}
      </div>

      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-0">
        {feedTab === "news" ? (
          tabLoading ? (
            <ListPanelSkeleton rows={6} label={loadingLabel} className="pt-2" />
          ) : news.length === 0 ? (
            <EmptyStateBlock
              art="news"
              label={degraded ? degradedLabel : errorLabel}
            />
          ) : (
            <ul className="space-y-2">
              {news.map((n, i) => (
                <li key={`${n.url || n.headline}-${i}`}>
                  <a
                    href={n.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="aw-dock-feed-item space-y-1"
                  >
                    <span className="block text-[14px] font-semibold leading-[1.35] tracking-[-0.2px] text-[var(--aw-ink)]">
                      {n.headline}
                    </span>
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
                  </a>
                </li>
              ))}
            </ul>
          )
        ) : !showPress ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            N/A
          </p>
        ) : tabLoading ? (
          <ListPanelSkeleton rows={6} label={loadingLabel} className="pt-2" />
        ) : press.length === 0 ? (
          <EmptyStateBlock art="news" label={degradedLabel} />
        ) : (
          <ul className="space-y-2">
            {press.map((p, i) => (
              <li key={`${p.url || p.headline}-${i}`}>
                <a
                  href={p.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="aw-dock-feed-item space-y-1"
                >
                  <span className="block text-[14px] font-semibold leading-[1.35] tracking-[-0.2px] text-[var(--aw-ink)]">
                    {p.headline || p.description || "Press release"}
                  </span>
                  {p.description && p.headline ? (
                    <p className="aw-caption line-clamp-2 leading-[1.45]">
                      {p.description}
                    </p>
                  ) : null}
                  <div className="aw-caption pt-0.5">
                    {p.datetime ? formatDate(p.datetime) : ""}
                    {p.source ? ` · ${p.source}` : ""}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
