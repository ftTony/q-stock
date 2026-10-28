"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  SymbolFeedStatus,
  type FeedStatusKind,
} from "@/components/symbol/quote/symbol-feed-status";
import { SymbolShareMenu } from "@/components/symbol/quote/symbol-share-menu";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-panel";
import { SymbolQuoteBarSearch } from "@/components/symbol/quote/symbol-quote-bar-search";
import { IconWatchlistExpand } from "@/components/symbol/watchlist/watchlist-toggle-icons";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type TabItem = { id: SymbolTab; label: string };

type Props = {
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
  boundRuleName?: string | null;
  onOpenPlan?: () => void;
  /** Open paper-trade dock (side drawer). */
  onOpenTrade?: () => void;
  /** Desktop secondary tabs in the quote strip (H5 tabs live under the chart). */
  tabs?: TabItem[];
  tab?: SymbolTab;
  onTabChange?: (id: SymbolTab) => void;
  /** Show list+heart control when left watchlist is collapsed. */
  showWatchlistExpand?: boolean;
  onExpandWatchlist?: () => void;
  /** Open SSR about / SEO copy (drawer) — keeps crawl text out of bottom chrome. */
  aboutLabel?: string;
  onOpenAbout?: () => void;
  /** Live quote feed status (WS push / delayed poll / offline). */
  feedStatus?: FeedStatusKind;
};

/** Drop noisy copy suffixes for the compact chip; full name stays in title. */
function ruleChipLabel(name: string): string {
  return name
    .replace(/\s*\(copy\)\s*$/i, "")
    .replace(/\s*（copy）\s*$/i, "")
    .replace(/\s*\(副本\)\s*$/, "")
    .replace(/\s*（副本）\s*$/, "")
    .trim();
}

export function SymbolQuoteBar({
  symbol,
  assetType,
  quote,
  boundRuleName = null,
  onOpenPlan,
  onOpenTrade,
  tabs,
  tab,
  onTabChange,
  showWatchlistExpand = false,
  onExpandWatchlist,
  aboutLabel,
  onOpenAbout,
  feedStatus,
}: Props) {
  const t = useTranslations("symbol");
  const tRail = useTranslations("symbolRail");
  const chipName = boundRuleName ? ruleChipLabel(boundRuleName) : null;
  const showTabs = Boolean(tabs?.length && onTabChange && tab);

  function onTabKeyDown(e: ReactKeyboardEvent, index: number) {
    if (!tabs?.length || !onTabChange) return;
    const last = tabs.length - 1;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = index >= last ? 0 : index + 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = index <= 0 ? last : index - 1;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = last;
    } else {
      return;
    }
    onTabChange(tabs[next]!.id);
    const btn = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="tab"]',
    )[next];
    btn?.focus();
  }
  const companyName = displayName(symbol, assetType, quote?.name);
  const showCompanyName =
    Boolean(companyName) &&
    companyName.toUpperCase() !== symbol.toUpperCase();

  // H5: only show when a rule is bound (chip). Unbound「计划」duplicates the
  // under-chart segment and crowds the quote row. Desktop keeps unbound affordance.
  const ruleBtn = onOpenPlan ? (
    chipName ? (
      <button
        type="button"
        onClick={onOpenPlan}
        title={tRail("ruleBadgeBound", { name: boundRuleName! })}
        className="inline-flex h-7 max-w-[4.25rem] items-center truncate rounded-full border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-1.5 text-[11px] font-medium leading-none tracking-[-0.1px] text-[var(--brand-text)] sm:max-w-[10rem] sm:px-2.5 sm:text-[12px] xl:max-w-[13rem]"
      >
        {chipName}
      </button>
    ) : (
      <button
        type="button"
        onClick={onOpenPlan}
        title={tRail("ruleBadgeUnbound")}
        className="hidden h-7 items-center text-[11px] text-[var(--muted)] hover:text-[var(--brand-text)] sm:text-[12px] lg:inline-flex"
      >
        {tRail("plan")}
      </button>
    )
  ) : null;

  return (
    <div className="aw-quote-bar flex max-w-full flex-col overflow-hidden border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] lg:flex-row lg:items-stretch">
      {/*
        H5: back · ticker/price · search · (bound-rule chip) · trade.
        Unbound plan lives only in under-chart segment.
      */}
      <div className="flex h-10 min-h-10 w-full min-w-0 max-w-full items-stretch px-1.5 sm:px-3 lg:flex-1 lg:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden sm:gap-1.5">
          {showWatchlistExpand && onExpandWatchlist ? (
            <>
              <button
                type="button"
                className="aw-watchlist-expand-btn hidden lg:inline-flex"
                aria-label={t("watchlistExpand")}
                title={t("watchlistExpand")}
                onClick={onExpandWatchlist}
              >
                <IconWatchlistExpand className="h-4 w-4" />
              </button>
              <span
                aria-hidden
                className="hidden h-5 w-px shrink-0 bg-[var(--aw-hairline,var(--border))] lg:block"
              />
            </>
          ) : null}
          <Link
            href="/markets"
            className="inline-flex h-9 w-8 shrink-0 items-center justify-center text-[var(--muted)] lg:hidden"
            aria-label={t("back")}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div className="flex min-w-0 flex-1 items-baseline gap-1 overflow-hidden sm:gap-1.5 lg:w-[20rem] lg:flex-none lg:shrink-0 lg:gap-2">
            <span className="aw-ticker shrink-0" title={symbol}>
              {symbol}
            </span>
            {showCompanyName ? (
              <span
                className="aw-caption hidden max-w-[6.5rem] truncate md:inline lg:max-w-[9rem]"
                title={companyName}
              >
                {companyName}
              </span>
            ) : null}
            {quote ? (
              <>
                <div className="aw-price shrink-0 tabular-nums">
                  <PriceText value={quote.price} change={quote.change} />
                </div>
                <div className="shrink-0 text-[12px] tabular-nums leading-none tracking-[-0.12px] sm:text-[13px]">
                  <ChangePct value={quote.percentChange} />
                </div>
              </>
            ) : (
              <span className="aw-caption">—</span>
            )}
          </div>

          {/* Desktop: search + tabs inline */}
          <div className="hidden min-w-0 flex-1 items-stretch lg:flex">
            <SymbolQuoteBarSearch
              assetType={assetType}
              currentSymbol={symbol}
            />
            {showTabs ? (
              <>
                <span
                  aria-hidden
                  className="mx-2 h-4 w-px shrink-0 self-center bg-[var(--aw-hairline,var(--border))]"
                />
                <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    role="tablist"
                    aria-label={t("chartTab")}
                    className="flex h-full w-max items-stretch"
                  >
                    {tabs!.map((item, index) => {
                      const selected = tab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          id={`symbol-quote-tab-${item.id}`}
                          aria-selected={selected}
                          aria-controls="symbol-main-panel"
                          tabIndex={selected ? 0 : -1}
                          onClick={() => onTabChange!(item.id)}
                          onKeyDown={(e) => onTabKeyDown(e, index)}
                          data-active={selected}
                          className="aw-tab aw-tab-quote"
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="aw-quote-actions relative z-10 flex shrink-0 items-center gap-0.5 pl-1 sm:gap-1 sm:pl-2 lg:gap-2 lg:pl-3">
          <div className="lg:hidden">
            <SymbolQuoteBarSearch
              assetType={assetType}
              currentSymbol={symbol}
              variant="icon"
            />
          </div>
          {feedStatus ? <SymbolFeedStatus kind={feedStatus} /> : null}
          {onOpenAbout && aboutLabel ? (
            <button
              type="button"
              onClick={onOpenAbout}
              title={aboutLabel}
              aria-label={aboutLabel}
              className="inline-flex h-7 shrink-0 items-center rounded-full px-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--brand-text)] sm:px-2 sm:text-[12px]"
            >
              {aboutLabel}
            </button>
          ) : null}
          {ruleBtn}
          {onOpenTrade ? (
            <button
              type="button"
              onClick={onOpenTrade}
              className="aw-btn-pill"
              title={t("tradeDock")}
              data-tour="rail-order"
            >
              {t("tradeDock")}
            </button>
          ) : null}
          <div className="hidden lg:contents">
            <SymbolShareMenu
              symbol={symbol}
              price={quote?.price ?? null}
              changePct={quote?.percentChange ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
