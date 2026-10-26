"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";
import { notifyMarketVendorsChanged } from "@/lib/market/creds-status-client";
import { SettingsHint } from "@/components/settings/settings-hint";
import {
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";

/**
 * Choose preferred equity broker (Longbridge / Futu) and crypto exchange
 * (Binance / OKX). Persists via /api/user/market-credentials.
 */
export function MarketVendorPrefs() {
  const t = useTranslations("settings");
  const { data: remote } = useMarketCredentials();
  const saveMut = useSaveMarketCredentials();

  const [equity, setEquity] = useState<EquityVendorId>("longbridge");
  const [crypto, setCrypto] = useState<CryptoVendorId>("binance");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (remote?.equityVendor) setEquity(remote.equityVendor);
    if (remote?.cryptoVendor) setCrypto(remote.cryptoVendor);
  }, [remote?.equityVendor, remote?.cryptoVendor]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  async function saveVendors(
    next: Partial<{ equityVendor: EquityVendorId; cryptoVendor: CryptoVendorId }>,
  ) {
    setSaving(true);
    setMessage(null);
    try {
      const data = await saveMut.mutateAsync(next);
      if (data.equityVendor) setEquity(data.equityVendor);
      if (data.cryptoVendor) setCrypto(data.cryptoVendor);
      notifyMarketVendorsChanged(data);
      setMessage(t("vendorSaved"));
    } catch {
      setMessage(t("credsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 border-b border-[var(--aw-hairline,var(--border))] pb-5">
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
          {t("vendorTitle")}
        </h2>
        <SettingsHint className="mt-2">{t("vendorHint")}</SettingsHint>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="aw-metric-label block">{t("vendorEquity")}</span>
          <QtSelect
            value={equity}
            onChange={(v) => {
              const next = v as EquityVendorId;
              setEquity(next);
              void saveVendors({ equityVendor: next });
            }}
            options={[
              { value: "longbridge", label: t("credsLongbridge") },
              { value: "futu", label: t("credsFutu") },
            ]}
          />
          <SettingsHint>{t("vendorEquityHint")}</SettingsHint>
        </div>
        <div className="space-y-1.5">
          <span className="aw-metric-label block">{t("vendorCrypto")}</span>
          <QtSelect
            value={crypto}
            onChange={(v) => {
              const next = v as CryptoVendorId;
              setCrypto(next);
              void saveVendors({ cryptoVendor: next });
            }}
            options={[
              { value: "binance", label: t("credsBinance") },
              { value: "okx", label: t("credsOkx") },
            ]}
          />
          <SettingsHint>{t("vendorCryptoHint")}</SettingsHint>
        </div>
      </div>
      {saving || message ? (
        <p className="aw-caption">{saving ? "…" : message}</p>
      ) : null}
    </section>
  );
}
