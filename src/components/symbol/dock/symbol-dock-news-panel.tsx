"use client";

import { useTranslations } from "next-intl";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
import { formatDate } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";
import type { NewsRow, PressRow } from "@/components/symbol/tabs/symbol-tabs-panel";

export type NewsFeedTab = "news" | "press";

type Props = {
  feedTab: NewsFeedTab;
  onFeedTabChange: (tab: NewsFeedTab) => void;
  assetType: AssetType;
  news: NewsRow[];
  press: PressRow[];
  tabLoading: boolean;
  /** First news fetch settled (false while idle/silent prefetch pending). */
  newsReady?: boolean;
  pressReady?: boolean;
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  loadingLabel: string;
  emptyLabel?: string;
  /** Stack layout: feed type is a top-level tab — hide inner chips. */
  hideFeedTabs?: boolean;
};

function NewsItem({
  href,
  title,
  summary,
  meta,
  stack,
}: {
  href: string;
  title: string;
  summary?: string | null;
  meta: string;
  stack: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={stack ? "aw-stack-feed-item" : "aw-dock-feed-item"}
    >
      <span className={stack ? "aw-stack-feed-title" : "aw-dock-feed-title"}>
        {title}
      </span>
      {summary ? (
        <p className={stack ? "aw-stack-feed-summary" : "aw-dock-feed-summary"}>
          {summary}
        </p>
      ) : null}
      {meta ? (
        <div className={stack ? "aw-stack-feed-meta" : "aw-dock-feed-meta"}>
          {meta}
        </div>
      ) : null}
    </a>
  );
}

/** Combined news + press drawer — chip tabs, scrollable list. */
export function SymbolDockNewsPanel({
  feedTab,
  onFeedTabChange,
  assetType,
  news,
  press,
  tabLoading,
  newsReady = false,
  pressReady = false,
  degraded,
  degradedLabel,
  loadingLabel,
  emptyLabel,
  hideFeedTabs = false,
}: Props) {
  const t = useTranslations("symbol");
  const showPress = assetType !== "crypto";
  const stack = hideFeedTabs;
  const newsPending = tabLoading || !newsReady;
  const pressPending = tabLoading || !pressReady;
  const newsEmptyLabel = degraded
    ? degradedLabel
    : (emptyLabel ?? t("newsEmpty"));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {stack ? null : (
        <div
          role="tablist"
          className="aw-dock-feed-tabs aw-dock-feed-tabs--nolines shrink-0"
        >
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
      )}

      <div
        className={
          stack
            ? // Stack bottom: visible thin scrollbar; height comes from flex parent.
              "qt-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1"
            : // Dock drawer: hide native thumb (drawer chrome handles scroll cue).
              "aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-0"
        }
      >
        {feedTab === "news" ? (
          newsPending ? (
            <ListPanelSkeleton rows={6} label={loadingLabel} className="pt-2" />
          ) : news.length === 0 ? (
            <EmptyStateBlock
              art="news"
              label={newsEmptyLabel}
            />
          ) : (
            <ul className={stack ? "aw-stack-feed-list" : "aw-dock-feed-list"}>
              {news.map((n, i) => (
                <li key={`${n.url || n.headline}-${i}`}>
                  <NewsItem
                    stack={stack}
                    href={n.url || "#"}
                    title={n.headline}
                    summary={n.summary}
                    meta={[
                      n.source,
                      n.datetime
                        ? formatDate(
                            n.datetime > 1e12 ? n.datetime : n.datetime * 1000,
                          )
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </li>
              ))}
            </ul>
          )
        ) : !showPress ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            N/A
          </p>
        ) : pressPending ? (
          <ListPanelSkeleton rows={6} label={loadingLabel} className="pt-2" />
        ) : press.length === 0 ? (
          <EmptyStateBlock
            art="news"
            label={degraded ? degradedLabel : (emptyLabel ?? t("pressEmpty"))}
          />
        ) : (
          <ul className={stack ? "aw-stack-feed-list" : "aw-dock-feed-list"}>
            {press.map((p, i) => (
              <li key={`${p.url || p.headline}-${i}`}>
                <NewsItem
                  stack={stack}
                  href={p.url || "#"}
                  title={p.headline || p.description || "Press release"}
                  summary={
                    p.description && p.headline ? p.description : null
                  }
                  meta={[
                    p.datetime ? formatDate(p.datetime) : "",
                    p.source ?? "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
