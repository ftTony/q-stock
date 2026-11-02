"use client";

import { MarketLbForm } from "@/components/settings/market-lb-form";
import { MarketFutuForm } from "@/components/settings/market-futu-form";
import { MarketBinanceForm } from "@/components/settings/market-binance-form";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";

export type { FutuMode } from "@/components/settings/market-futu-form";

type Props = {
  status: MarketCredsStatus | null;
  equityVendor: "longbridge" | "futu";
  cryptoVendor: "binance" | "okx";
  onSaved: (next: MarketCredsStatus | undefined) => void;
  onError: (msg: string) => void;
  onClearProvider: (provider: "longbridge" | "futu" | "binance") => void;
};

export function MarketCredentialsBrokerForms({
  status,
  equityVendor,
  cryptoVendor,
  onSaved,
  onError,
  onClearProvider,
}: Props) {
  return (
    <>
      {equityVendor === "longbridge" ? (
        <MarketLbForm
          status={status}
          onSaved={onSaved}
          onError={onError}
          onClear={() => onClearProvider("longbridge")}
        />
      ) : null}
      {equityVendor === "futu" ? (
        <MarketFutuForm
          status={status}
          onSaved={onSaved}
          onError={onError}
          onClear={() => onClearProvider("futu")}
        />
      ) : null}
      {cryptoVendor === "binance" ? (
        <MarketBinanceForm
          status={status}
          onSaved={onSaved}
          onError={onError}
          onClear={() => onClearProvider("binance")}
        />
      ) : null}
    </>
  );
}
