"use client";

import { FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";

export type FutuMode = "appkey" | "bearer";

type Props = {
  status: MarketCredsStatus | null;
  equityVendor: "longbridge" | "futu";
  cryptoVendor: "binance" | "okx";
  savingLb: boolean;
  savingFutu: boolean;
  savingBn: boolean;
  lbKey: string;
  lbSecret: string;
  lbToken: string;
  setLbKey: (v: string) => void;
  setLbSecret: (v: string) => void;
  setLbToken: (v: string) => void;
  futuMode: FutuMode;
  setFutuMode: (v: FutuMode) => void;
  futuAppKey: string;
  futuPrivateKey: string;
  futuBearer: string;
  setFutuAppKey: (v: string) => void;
  setFutuPrivateKey: (v: string) => void;
  setFutuBearer: (v: string) => void;
  bnApiKey: string;
  bnApiSecret: string;
  setBnApiKey: (v: string) => void;
  setBnApiSecret: (v: string) => void;
  onSaveLongbridge: (e: FormEvent) => void;
  onSaveFutu: (e: FormEvent) => void;
  onSaveBinance: (e: FormEvent) => void;
  onClearProvider: (provider: "longbridge" | "futu" | "binance") => void;
};

export function MarketCredentialsBrokerForms(props: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const {
    status,
    equityVendor,
    cryptoVendor,
    savingLb,
    savingFutu,
    savingBn,
    lbKey,
    lbSecret,
    lbToken,
    setLbKey,
    setLbSecret,
    setLbToken,
    futuMode,
    setFutuMode,
    futuAppKey,
    futuPrivateKey,
    futuBearer,
    setFutuAppKey,
    setFutuPrivateKey,
    setFutuBearer,
    bnApiKey,
    bnApiSecret,
    setBnApiKey,
    setBnApiSecret,
    onSaveLongbridge,
    onSaveFutu,
    onSaveBinance,
    onClearProvider,
  } = props;

  return (
    <>
      {equityVendor === "longbridge" ? (
        <form
          onSubmit={onSaveLongbridge}
          className="space-y-3 border-t border-[var(--border)] pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{t("credsLongbridge")}</h3>
            <span className="text-[11px] text-[var(--muted)]">
              {status?.longbridge.configured
                ? t("credsConfigured")
                : t("credsNotConfigured")}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsAppKey")}
              </span>
              <input
                value={lbKey}
                onChange={(e) => setLbKey(e.target.value)}
                autoComplete="off"
                className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                placeholder={
                  status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsAppSecret")}
              </span>
              <input
                type="password"
                value={lbSecret}
                onChange={(e) => setLbSecret(e.target.value)}
                autoComplete="off"
                className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                placeholder={
                  status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
                }
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsAccessToken")}
              </span>
              <input
                type="password"
                value={lbToken}
                onChange={(e) => setLbToken(e.target.value)}
                autoComplete="off"
                className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                placeholder={
                  status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
                }
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <SubmitButton
              loading={savingLb}
              loadingLabel={tCommon("loading")}
              className={SETTINGS_SUBMIT_PRIMARY}
              disabled={!lbKey.trim() || !lbSecret.trim() || !lbToken.trim()}
            >
              {t("credsSaveLongbridge")}
            </SubmitButton>
            {status?.longbridge.configured ? (
              <button
                type="button"
                onClick={() => onClearProvider("longbridge")}
                className={SETTINGS_BTN_GHOST}
              >
                {t("credsClear")}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {equityVendor === "futu" ? (
        <form
          onSubmit={onSaveFutu}
          className="space-y-3 border-t border-[var(--border)] pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{t("credsFutu")}</h3>
            <span className="text-[11px] text-[var(--muted)]">
              {status?.futu.configured
                ? t("credsConfigured")
                : t("credsNotConfigured")}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsFutuMode")}
              </span>
              <QtSelect
                value={futuMode}
                onChange={(v) => setFutuMode(v as FutuMode)}
                options={[
                  { value: "appkey", label: t("credsFutuModeAppKey") },
                  { value: "bearer", label: t("credsFutuModeBearer") },
                ]}
              />
            </div>
            {futuMode === "appkey" ? (
              <label className="block space-y-1.5">
                <span className="block text-xs text-[var(--muted)]">
                  {t("credsAppKey")}
                </span>
                <input
                  value={futuAppKey}
                  onChange={(e) => setFutuAppKey(e.target.value)}
                  autoComplete="off"
                  className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                  placeholder={
                    status?.futu.configured ? t("credsKeepPlaceholder") : ""
                  }
                />
              </label>
            ) : (
              <label className="block space-y-1.5">
                <span className="block text-xs text-[var(--muted)]">
                  {t("credsAccessToken")}
                </span>
                <input
                  type="password"
                  value={futuBearer}
                  onChange={(e) => setFutuBearer(e.target.value)}
                  autoComplete="off"
                  className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                  placeholder={
                    status?.futu.configured ? t("credsKeepPlaceholder") : ""
                  }
                />
              </label>
            )}
            {futuMode === "appkey" ? (
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="block text-xs text-[var(--muted)]">
                  {t("credsPrivateKey")}
                </span>
                <textarea
                  value={futuPrivateKey}
                  onChange={(e) => setFutuPrivateKey(e.target.value)}
                  rows={3}
                  autoComplete="off"
                  className="qt-input w-full px-3 py-2 font-mono text-[14px] leading-relaxed"
                  placeholder={
                    status?.futu.configured
                      ? t("credsKeepPlaceholder")
                      : t("credsPrivateKeyHint")
                  }
                />
              </label>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <SubmitButton
              loading={savingFutu}
              loadingLabel={tCommon("loading")}
              className={SETTINGS_SUBMIT_PRIMARY}
              disabled={
                futuMode === "bearer"
                  ? !futuBearer.trim()
                  : !futuAppKey.trim() || !futuPrivateKey.trim()
              }
            >
              {t("credsSaveFutu")}
            </SubmitButton>
            {status?.futu.configured ? (
              <button
                type="button"
                onClick={() => onClearProvider("futu")}
                className={SETTINGS_BTN_GHOST}
              >
                {t("credsClear")}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {cryptoVendor === "binance" ? (
        <form
          onSubmit={onSaveBinance}
          className="space-y-3 border-t border-[var(--border)] pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{t("credsBinance")}</h3>
            <span className="text-[11px] text-[var(--muted)]">
              {status?.binance?.configured
                ? t("credsConfigured")
                : t("credsNotConfigured")}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">{t("credsBinanceHint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsBinanceApiKey")}
              </span>
              <input
                value={bnApiKey}
                onChange={(e) => setBnApiKey(e.target.value)}
                autoComplete="off"
                className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                placeholder={
                  status?.binance?.configured ? t("credsKeepPlaceholder") : ""
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("credsBinanceApiSecret")}
              </span>
              <input
                type="password"
                value={bnApiSecret}
                onChange={(e) => setBnApiSecret(e.target.value)}
                autoComplete="off"
                className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
                placeholder={t("credsBinanceSecretOptional")}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <SubmitButton
              loading={savingBn}
              loadingLabel={tCommon("loading")}
              className={SETTINGS_SUBMIT_PRIMARY}
              disabled={!bnApiKey.trim()}
            >
              {t("credsSaveBinance")}
            </SubmitButton>
            {status?.binance?.configured ? (
              <button
                type="button"
                onClick={() => onClearProvider("binance")}
                className={SETTINGS_BTN_GHOST}
              >
                {t("credsClear")}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </>
  );
}
