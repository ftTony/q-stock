"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";
import {
  notifyMarketVendorsChanged,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";
import { SettingsHint } from "@/components/settings/settings-hint";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";
import { queryKeys } from "@/lib/query/keys";

type VendorValues = {
  equityVendor: EquityVendorId;
  cryptoVendor: CryptoVendorId;
};

/**
 * Preferred equity broker (LB / Futu / Tiger) and crypto exchange.
 * Optimistically updates shared creds query so the OAuth panel below
 * switches with the dropdown (same product surface).
 */
export function MarketVendorPrefs() {
  const t = useTranslations("settings");
  const qc = useQueryClient();
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

  function patchVendorCache(
    next: Partial<{ equityVendor: EquityVendorId; cryptoVendor: CryptoVendorId }>,
  ) {
    qc.setQueryData<MarketCredsStatus>(queryKeys.credentials.market, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...(next.equityVendor ? { equityVendor: next.equityVendor } : {}),
        ...(next.cryptoVendor ? { cryptoVendor: next.cryptoVendor } : {}),
      };
    });
  }

  async function saveVendors(
    next: Partial<{ equityVendor: EquityVendorId; cryptoVendor: CryptoVendorId }>,
  ) {
    clearFlash();
    const prevEquity = remote?.equityVendor ?? "longbridge";
    const prevCrypto = remote?.cryptoVendor ?? "binance";
    // Switch the broker OAuth form immediately with the preference.
    patchVendorCache(next);
    try {
      const data = await saveMut.mutateAsync(next);
      setValue("equityVendor", data.equityVendor ?? prevEquity);
      setValue("cryptoVendor", data.cryptoVendor ?? prevCrypto);
      notifyMarketVendorsChanged(data);
      flash("ok", t("vendorSaved"));
    } catch {
      patchVendorCache({
        equityVendor: prevEquity,
        cryptoVendor: prevCrypto,
      });
      setValue("equityVendor", prevEquity);
      setValue("cryptoVendor", prevCrypto);
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
                  { value: "tiger", label: t("credsTiger") },
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
