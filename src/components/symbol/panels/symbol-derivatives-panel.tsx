"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { OptionChainBoard } from "@/components/symbol/panels/option-chain-board";
import { WarrantBoard } from "@/components/symbol/panels/warrant-board";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import {
  useMarketOptionsChain,
  useMarketOptionsMeta,
} from "@/hooks/query/use-market-options";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";

function EmptyChainArt() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="h-14 w-auto text-[var(--brand)]"
      aria-hidden
    >
      <rect
        x="28"
        y="18"
        width="104"
        height="64"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M44 58h18M72 48h18M100 66h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M44 58V42M72 48V34M100 66V50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.7"
      />
    </svg>
  );
}

function OptionsDerivativesBody({
  symbol,
  assetType,
  lastPrice,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
}) {
  const t = useTranslations("symbol");
  const [expiry, setExpiry] = useState("");

  const metaQuery = useMarketOptionsMeta(symbol, assetType);
  const meta = metaQuery.data;
  const unavailable =
    Boolean(meta?.unavailable) ||
    !(meta?.expiries?.length) ||
    metaQuery.isError;
  const expiries = unavailable ? [] : (meta?.expiries ?? []);
  const loadingMeta = metaQuery.isLoading;

  const metaError =
    meta?.code === "LB_CONN_LIMIT"
      ? t("derivativesConnLimit")
      : meta?.code === "LB_OPTION_PACKAGE"
        ? t("derivativesNoPackage")
        : typeof meta?.detail === "string"
          ? meta.detail
          : null;

  useEffect(() => {
    setExpiry("");
  }, [symbol, assetType]);

  useEffect(() => {
    if (!expiries.length) return;
    setExpiry((prev) => prev || expiries[0]!);
  }, [expiries]);

  const chainQuery = useMarketOptionsChain({
    symbol,
    assetType,
    expiry: expiry || null,
    spot: lastPrice ?? 0,
    enabled: Boolean(expiry) && !unavailable,
  });
  const chain = chainQuery.data;
  const calls = (chain?.calls ?? []) as OptionRow[];
  const puts = (chain?.puts ?? []) as OptionRow[];
  const chainError = chain?.unavailable
    ? chain.code === "LB_CONN_LIMIT"
      ? t("derivativesConnLimit")
      : chain.code === "LB_OPTION_PACKAGE"
        ? t("derivativesNoPackage")
        : typeof chain.detail === "string"
          ? chain.detail
          : t("derivativesEmpty")
    : chainQuery.isError
      ? t("derivativesEmpty")
      : metaError;

  const toolsHref =
    lastPrice != null && lastPrice > 0
      ? `/tools/options?symbol=${encodeURIComponent(symbol)}&spot=${lastPrice}`
      : `/tools/options?symbol=${encodeURIComponent(symbol)}`;

  if (loadingMeta) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <PanelSkeleton rows={6} />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <EmptyChainArt />
        <p className="max-w-md text-[13px] font-medium tracking-[-0.08px] text-[var(--foreground)]">
          {t("derivativesEmpty")}
        </p>
        {chainError ? (
          <p className="max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">
            {chainError}
          </p>
        ) : null}
        <Link
          href="/advanced-quotes"
          className="mt-1 text-[12px] font-medium text-[var(--brand-text)] hover:underline"
        >
          {t("advancedQuotesLink")} →
        </Link>
      </div>
    );
  }

  return (
    <OptionChainBoard
      expiries={expiries}
      expiry={expiry}
      onExpiryChange={setExpiry}
      calls={calls}
      puts={puts}
      spot={lastPrice}
      loading={chainQuery.isLoading}
      empty={chainError || t("derivativesEmpty")}
      toolsHref={toolsHref}
    />
  );
}

export function SymbolDerivativesPanel({
  symbol,
  assetType,
  lastPrice,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
}) {
  const t = useTranslations("symbol");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {assetType === "hk" ? (
        <WarrantBoard
          symbol={symbol}
          assetType={assetType}
          lastPrice={lastPrice}
          emptyArt={<EmptyChainArt />}
        />
      ) : (
        <OptionsDerivativesBody
          symbol={symbol}
          assetType={assetType}
          lastPrice={lastPrice}
        />
      )}

      <p className="aw-caption shrink-0 border-t border-[var(--aw-hairline,var(--border))] px-4 py-2.5 leading-relaxed sm:px-5">
        {assetType === "hk"
          ? t("warrantsDisclaimer")
          : t("derivativesDisclaimer")}
      </p>
    </div>
  );
}
