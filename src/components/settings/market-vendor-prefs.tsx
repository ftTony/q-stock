"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";
import {
  notifyMarketVendorsChanged,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";

type Status = MarketCredsStatus;

/**
 * Choose preferred equity broker (Longbridge / Futu) and crypto exchange
 * (Binance / OKX). Persists via /api/user/market-credentials.
 */
export function MarketVendorPrefs() {
  const t = useTranslations("settings");
  const [equity, setEquity] = useState<EquityVendorId>("longbridge");
  const [crypto, setCrypto] = useState<CryptoVendorId>("binance");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/market-credentials");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Status;
        if (data.equityVendor) setEquity(data.equityVendor);
        if (data.cryptoVendor) setCrypto(data.cryptoVendor);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const res = await fetch("/api/user/market-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setMessage(t("credsSaveError"));
        return;
      }
      const data = (await res.json()) as Status;
      if (data.equityVendor) setEquity(data.equityVendor);
      if (data.cryptoVendor) setCrypto(data.cryptoVendor);
      notifyMarketVendorsChanged(data);
      setMessage(t("vendorSaved"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="qt-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight">
          {t("vendorTitle")}
        </h2>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("vendorHint")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 text-sm">
            <span className="block text-[var(--muted)]">{t("vendorEquity")}</span>
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
            <p className="text-[11px] text-[var(--muted)]">
              {t("vendorEquityHint")}
            </p>
          </div>
          <div className="space-y-1.5 text-sm">
            <span className="block text-[var(--muted)]">{t("vendorCrypto")}</span>
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
            <p className="text-[11px] text-[var(--muted)]">
              {t("vendorCryptoHint")}
            </p>
          </div>
        </div>
        {saving || message ? (
          <p className="text-xs text-[var(--muted)]">{saving ? "…" : message}</p>
        ) : null}
      </div>
    </section>
  );
}
