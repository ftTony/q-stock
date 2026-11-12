"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_BTN_PRIMARY,
} from "@/components/settings/settings-btn";
import { SettingsHint } from "@/components/settings/settings-hint";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";

type Props = {
  status: MarketCredsStatus | null;
  onClear: () => void;
};

/** Longbridge BYOK: OAuth 2.0 + PKCE only (no AppKey paste). */
export function MarketLbForm({ status, onClear }: Props) {
  const t = useTranslations("settings");
  const locale = useLocale();

  const oauthAvailable = status?.longbridge.oauthAvailable !== false;
  const configured = Boolean(status?.longbridge.configured);

  return (
    <div className="space-y-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("credsLongbridge")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {configured ? t("credsLongbridgeConnected") : t("credsNotConfigured")}
        </span>
      </div>

      <SettingsHint tone="trust">
        {oauthAvailable
          ? t("credsLongbridgeOAuthHint")
          : t("credsLongbridgeOAuthUnavailable")}
      </SettingsHint>

      <div className="flex flex-wrap gap-2">
        {oauthAvailable ? (
          <a
            href={`/api/oauth/longbridge/start?locale=${encodeURIComponent(locale)}`}
            className={`${SETTINGS_BTN_PRIMARY} inline-flex items-center`}
          >
            {configured
              ? t("credsLongbridgeOAuthReconnect")
              : t("credsLongbridgeOAuthConnect")}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className={`${SETTINGS_BTN_PRIMARY} opacity-50`}
          >
            {t("credsLongbridgeOAuthConnect")}
          </button>
        )}
        {configured ? (
          <button type="button" onClick={onClear} className={SETTINGS_BTN_GHOST}>
            {t("credsClear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
