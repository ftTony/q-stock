"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { SubmitButton } from "@/components/ui/submit-button";
import { IconHeart } from "@/components/ui/icon-heart";
import { IconRobot } from "@/components/ui/icon-robot";
import { SymbolAlertStrip } from "@/components/symbol/symbol-alert-strip";
import { SymbolShareMenu } from "@/components/symbol/symbol-share-menu";
import {
  SymbolSentimentChip,
  type SymbolSentiment,
} from "@/components/symbol/symbol-sentiment-chip";
import { formatTime } from "@/lib/format-number";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type AlertProps = {
  condition: "gte" | "lte";
  onConditionChange: (v: "gte" | "lte") => void;
  price: string;
  onPriceChange: (v: string) => void;
  busy: boolean;
  message: string | null;
  onSubmit: (e: FormEvent) => void;
};

type Props = {
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
  updatedAt: Date | null;
  inWatchlist: boolean;
  watchBusy: boolean;
  onToggleWatchlist: () => void;
  onOpenAi: () => void;
  onRefresh?: () => void;
  refreshBusy?: boolean;
  /** Kept for API compat; OHLC now lives in SymbolRailStats. */
  marketCap?: number | null;
  alert?: AlertProps;
  sentiment?: SymbolSentiment;
};

export function SymbolQuoteBar({
  symbol,
  assetType,
  quote,
  updatedAt,
  inWatchlist,
  watchBusy,
  onToggleWatchlist,
  onOpenAi,
  onRefresh,
  refreshBusy = false,
  alert,
  sentiment = null,
}: Props) {
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const [timeLabel, setTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!updatedAt) {
      setTimeLabel(null);
      return;
    }
    setTimeLabel(formatTime(updatedAt));
  }, [updatedAt]);

  const watchLabel = inWatchlist ? t("inWatchlist") : t("addWatchlist");

  return (
    <div className="bg-[var(--aw-canvas,#fff)] px-3 py-1.5 sm:px-4">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/markets"
            className="inline-flex text-[var(--muted)] lg:hidden"
            aria-label={t("back")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="aw-ticker shrink-0">{symbol}</span>
            <span className="aw-caption max-w-[8rem] truncate sm:max-w-[14rem]">
              {displayName(symbol, assetType)}
            </span>
            <div className="hidden shrink-0 self-center sm:block">
              <SymbolShareMenu
                symbol={symbol}
                price={quote?.price ?? null}
                changePct={quote?.percentChange ?? null}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="shrink-0">
            {quote ? (
              <div className="flex items-baseline gap-2">
                <div className="aw-price">
                  <PriceText value={quote.price} change={quote.change} />
                </div>
                <ChangePct value={quote.percentChange} />
                {timeLabel ? (
                  <span className="aw-caption tabular-nums" suppressHydrationWarning>
                    {timeLabel}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="aw-caption">—</span>
            )}
          </div>
          <SymbolSentimentChip sentiment={sentiment} />
        </div>

        <div className="aw-quote-actions ml-auto flex shrink-0 items-center justify-end gap-3">
          <div className="flex items-center gap-1">
            {alert ? (
              <SymbolAlertStrip
                condition={alert.condition}
                onConditionChange={alert.onConditionChange}
                price={alert.price}
                onPriceChange={alert.onPriceChange}
                busy={alert.busy}
                message={alert.message}
                onSubmit={alert.onSubmit}
              />
            ) : null}
            <SubmitButton
              type="button"
              disabled={watchBusy}
              loading={watchBusy}
              loadingLabel={<span className="sr-only">{tCommon("loading")}</span>}
              onClick={onToggleWatchlist}
              title={watchLabel}
              aria-label={watchLabel}
              aria-pressed={inWatchlist}
              className="aw-btn-icon aw-btn-icon-primary !p-0"
            >
              <IconHeart
                filled={inWatchlist}
                className="h-4 w-4 text-[var(--aw-on-primary,#fff)]"
              />
            </SubmitButton>
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshBusy}
                title={t("refresh")}
                aria-label={t("refresh")}
                className="aw-btn-icon aw-btn-icon-muted disabled:opacity-50"
              >
                <svg
                  className={`h-3.5 w-3.5 ${refreshBusy ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
          <button type="button" onClick={onOpenAi} className="aw-btn-pill">
            <IconRobot className="h-3.5 w-3.5" />
            <span>{t("openAi")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
