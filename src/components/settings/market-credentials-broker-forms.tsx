"use client";

import { MarketLbForm } from "@/components/settings/market-lb-form";
import { MarketFutuForm } from "@/components/settings/market-futu-form";
import { MarketTigerForm } from "@/components/settings/market-tiger-form";
import { MarketBinanceForm } from "@/components/settings/market-binance-form";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";
import type { EquityVendorId } from "@/lib/market/types";

type Props = {
  status: MarketCredsStatus | null;
  equityVendor: EquityVendorId;
  cryptoVendor: "binance" | "okx";
  onSaved: (next: MarketCredsStatus | undefined) => void;
  onError: (msg: string) => void;
  onClearProvider: (
    provider: "longbridge" | "futu" | "tiger" | "binance",
  ) => void;
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
          onClear={() => onClearProvider("longbridge")}
        />
      ) : null}
      {equityVendor === "futu" ? (
        <MarketFutuForm
          status={status}
          onClear={() => onClearProvider("futu")}
        />
      ) : null}
      {equityVendor === "tiger" ? (
        <MarketTigerForm
          status={status}
          onClear={() => onClearProvider("tiger")}
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
