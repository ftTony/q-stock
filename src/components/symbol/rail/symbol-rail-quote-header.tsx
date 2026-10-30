"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SymbolAlertStrip } from "@/components/symbol/quote/symbol-alert-strip";
import { IconHeart } from "@/components/ui/icon-heart";
import { formatPrice, formatTime } from "@/lib/format-number";
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
  alert?: AlertProps;
};

function marketBadge(assetType: AssetType): string {
  if (assetType === "hk") return "HK";
  if (assetType === "cn") return "CN";
  if (assetType === "crypto") return "CRYPTO";
  return "US";
}

/**
 * Futu-style rail header: name + watch/alert, large last, change row, status line.
 */
export function SymbolRailQuoteHeader({
  symbol,
  assetType,
  quote,
  updatedAt,
  inWatchlist,
  watchBusy,
  onToggleWatchlist,
  alert,
}: Props) {
  const t = useTranslations("symbol");
  const [timeLabel, setTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!updatedAt && !(quote?.timestamp)) {
      setTimeLabel(null);
      return;
    }
    const d = updatedAt ?? new Date((quote?.timestamp ?? 0) * 1000);
    setTimeLabel(formatTime(d));
  }, [updatedAt, quote?.timestamp]);

  const name = displayName(symbol, assetType, quote?.name);
  const up = quote != null ? quote.change >= 0 : true;
  const tone = up ? "text-[var(--up)]" : "text-[var(--down)]";
  const watchLabel = inWatchlist ? t("inWatchlist") : t("addWatchlist");

  return (
    <div className="bg-[var(--aw-canvas)] px-3 pt-3 pb-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="aw-ticker shrink-0">{symbol}</span>
          {name && name !== symbol ? (
            <span className="min-w-0 truncate text-[14px] font-medium leading-snug tracking-[-0.16px] text-[var(--aw-ink-muted-80,var(--muted))]">
              {name}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {alert ? (
            <SymbolAlertStrip
              condition={alert.condition}
              onConditionChange={alert.onConditionChange}
              price={alert.price}
              onPriceChange={alert.onPriceChange}
              busy={alert.busy}
              message={alert.message}
              onSubmit={alert.onSubmit}
              compact
            />
          ) : null}
          <button
            type="button"
            disabled={watchBusy}
            onClick={onToggleWatchlist}
            title={watchLabel}
            aria-label={watchLabel}
            aria-pressed={inWatchlist}
            className="inline-flex h-9 w-9 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment)] hover:text-[var(--aw-ink)] disabled:opacity-50"
          >
            <IconHeart
              filled={inWatchlist}
              className={`h-5 w-5 ${
                inWatchlist ? "text-[#e11d48]" : "currentColor"
              }`}
            />
          </button>
        </div>
      </div>

      {quote ? (
        <div className="mt-2.5">
          <div className={`flex flex-wrap items-end gap-x-2.5 gap-y-1 ${tone}`}>
            <span className="text-[30px] font-semibold leading-none tracking-[-0.45px] tabular-nums">
              {formatPrice(quote.price, 3)}
            </span>
            <div className="mb-0.5 flex items-baseline gap-1.5 text-[14px] font-medium tabular-nums leading-none">
              <span aria-hidden>{up ? "▲" : "▼"}</span>
              <span>
                {up ? "+" : ""}
                {formatPrice(quote.change, 3)}
              </span>
              <span>
                {up ? "+" : ""}
                {quote.percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="aw-caption leading-none">
              {t("railLastLabel")}
              {timeLabel ? (
                <span className="tabular-nums" suppressHydrationWarning>
                  {" "}
                  {timeLabel}
                </span>
              ) : null}
            </span>
            <span className="inline-flex h-5 items-center rounded border border-[var(--border)] px-1.5 text-[12px] font-medium text-[var(--muted)]">
              {marketBadge(assetType)}
            </span>
            {quote.bid != null && quote.ask != null ? (
              <span className="inline-flex h-5 items-center rounded border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-1.5 text-[12px] font-medium text-[var(--brand-text)]">
                L1
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-2 aw-caption">—</p>
      )}
    </div>
  );
}
