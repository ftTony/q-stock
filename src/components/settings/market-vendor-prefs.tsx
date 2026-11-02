"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";
import { notifyMarketVendorsChanged } from "@/lib/market/creds-status-client";
import { SettingsHint } from "@/components/settings/settings-hint";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";

type VendorValues = {
  equityVendor: EquityVendorId;
  cryptoVendor: CryptoVendorId;
};

/**
 * Choose preferred equity broker (Longbridge / Futu) and crypto exchange
 * (Binance / OKX). Persists via /api/user/market-credentials.
 */
export function MarketVendorPrefs() {
  const t = useTranslations("settings");
  const { data: remote } = useMarketCredentials();
  const saveMut = useSaveMarketCredentials();
  const { message, flash, clearFlash } = useFlashMessage(2500);

  const { control, reset, setValue, formState } = useForm<VendorValues>({
    defaultValues: {
      equityVendor: "longbridge",
      cryptoVendor: "binance",
    },
  });

  useEffect(() => {
    if (!remote) return;
    reset({
      equityVendor: remote.equityVendor ?? "longbridge",
      cryptoVendor: remote.cryptoVendor ?? "binance",
    });
  }, [remote, reset]);

  async function saveVendors(
    next: Partial<{ equityVendor: EquityVendorId; cryptoVendor: CryptoVendorId }>,
  ) {
    clearFlash();
    try {
      const data = await saveMut.mutateAsync(next);
      if (data.equityVendor || data.cryptoVendor) {
        setValue("equityVendor", data.equityVendor ?? "longbridge");
        setValue("cryptoVendor", data.cryptoVendor ?? "binance");
      }
      notifyMarketVendorsChanged(data);
      flash("ok", t("vendorSaved"));
    } catch {
      flash("error", t("credsSaveError"));
    }
  }

  const saving = saveMut.isPending || formState.isSubmitting;

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
          <Controller
            name="equityVendor"
            control={control}
            render={({ field }) => (
              <QtSelect
                value={field.value}
                onChange={(v) => {
                  const next = v as EquityVendorId;
                  field.onChange(next);
                  void saveVendors({ equityVendor: next });
                }}
                options={[
                  { value: "longbridge", label: t("credsLongbridge") },
                  { value: "futu", label: t("credsFutu") },
                ]}
              />
            )}
          />
          <SettingsHint>{t("vendorEquityHint")}</SettingsHint>
        </div>
        <div className="space-y-1.5">
          <span className="aw-metric-label block">{t("vendorCrypto")}</span>
          <Controller
            name="cryptoVendor"
            control={control}
            render={({ field }) => (
              <QtSelect
                value={field.value}
                onChange={(v) => {
                  const next = v as CryptoVendorId;
                  field.onChange(next);
                  void saveVendors({ cryptoVendor: next });
                }}
                options={[
                  { value: "binance", label: t("credsBinance") },
                  { value: "okx", label: t("credsOkx") },
                ]}
              />
            )}
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
