"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { SymbolShareMenu } from "@/components/symbol/symbol-share-menu";
import type { SymbolTab } from "@/components/symbol/symbol-tabs-panel";
import { SymbolQuoteBarSearch } from "@/components/symbol/symbol-quote-bar-search";
import { IconWatchlistExpand } from "@/components/symbol/watchlist-toggle-icons";
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
  /** Secondary tabs after price (chart / derivatives / …; not news/press — those are side dock). */
  tabs?: TabItem[];
  tab?: SymbolTab;
  onTabChange?: (id: SymbolTab) => void;
  /** Show list+heart control when left watchlist is collapsed. */
  showWatchlistExpand?: boolean;
  onExpandWatchlist?: () => void;
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
}: Props) {
  const t = useTranslations("symbol");
  const tRail = useTranslations("symbolRail");
  const chipName = boundRuleName ? ruleChipLabel(boundRuleName) : null;
  const showTabs = Boolean(tabs?.length && onTabChange && tab);
  const companyName = displayName(symbol, assetType, quote?.name);
  const showCompanyName =
    Boolean(companyName) &&
    companyName.toUpperCase() !== symbol.toUpperCase();

  return (
    <div className="aw-quote-bar flex h-10 min-h-10 items-stretch border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-stretch gap-0">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
            className="inline-flex shrink-0 text-[var(--muted)] lg:hidden"
            aria-label={t("back")}
          >
            <svg
              className="h-4 w-4"
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

          {/* Fixed outer slot keeps tabs steady; inner group packs left. */}
          <div className="flex w-[14rem] shrink-0 items-center sm:w-[17rem] lg:w-[20rem]">
            <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
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
                  <div className="shrink-0 text-[13px] tabular-nums leading-none tracking-[-0.12px]">
                    <ChangePct value={quote.percentChange} />
                  </div>
                </>
              ) : (
                <span className="aw-caption">—</span>
              )}
            </div>
          </div>
        </div>

        <SymbolQuoteBarSearch assetType={assetType} currentSymbol={symbol} />

        {showTabs ? (
          <>
            <span
              aria-hidden
              className="mx-1 h-4 w-px shrink-0 self-center bg-[var(--aw-hairline,var(--border))] sm:mx-2"
            />
            <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div role="tablist" className="flex h-full w-max items-stretch">
                {tabs!.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.id}
                    onClick={() => onTabChange!(item.id)}
                    data-active={tab === item.id}
                    className="aw-tab aw-tab-quote"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="aw-quote-actions flex shrink-0 items-center gap-1.5 pl-2 sm:gap-2 sm:pl-3">
        {onOpenPlan ? (
          <button
            type="button"
            onClick={onOpenPlan}
            title={
              boundRuleName
                ? tRail("ruleBadgeBound", { name: boundRuleName })
                : tRail("ruleBadgeUnbound")
            }
            className={
              chipName
                ? "inline-flex h-7 max-w-[10rem] items-center truncate rounded-full border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-2.5 text-[12px] font-medium leading-none tracking-[-0.1px] text-[var(--brand-text)] xl:max-w-[13rem]"
                : "hidden h-7 items-center text-[12px] text-[var(--muted)] hover:text-[var(--brand-text)] sm:inline-flex"
            }
          >
            {chipName ?? tRail("ruleBadgeUnbound")}
          </button>
        ) : null}
        {onOpenTrade ? (
          <button
            type="button"
            onClick={onOpenTrade}
            className="aw-btn-pill"
            title={t("tradeDock")}
          >
            {t("tradeDock")}
          </button>
        ) : null}
        <SymbolShareMenu
          symbol={symbol}
          price={quote?.price ?? null}
          changePct={quote?.percentChange ?? null}
        />
      </div>
    </div>
  );
}
