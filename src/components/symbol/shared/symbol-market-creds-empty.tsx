"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import {
  fetchMarketCredsStatus,
  hasAnyBrokerCreds,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";
import type { AssetType } from "@/lib/types";

function needsCredsForAsset(
  assetType: AssetType,
  status: MarketCredsStatus | null,
): boolean {
  if (assetType === "crypto") {
    return !status?.binance?.configured && !status?.okx?.configured;
  }
  // US equities may still come from platform Finnhub without BYOK.
  if (assetType === "stock") return false;
  // HK / CN usually need Longbridge or Futu OpenAPI.
  return !hasAnyBrokerCreds(status);
}

type Props = {
  assetType: AssetType;
  /** Shown when credentials look fine but data is still empty. */
  fallbackLabel: string;
  compact?: boolean;
};

/**
 * Replaces endless skeletons when market BYOK / vendor keys are missing.
 * Falls back to a plain empty label if keys exist but data is still empty.
 */
export function SymbolMarketCredsEmpty({
  assetType,
  fallbackLabel,
  compact,
}: Props) {
  const t = useTranslations("settings");
  const { status: sessionStatus } = useSession();
  const settingsModal = useSettingsModalOptional();
  const [needed, setNeeded] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let cancelled = false;
    (async () => {
      const status = await fetchMarketCredsStatus();
      if (!cancelled) setNeeded(needsCredsForAsset(assetType, status));
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, assetType]);

  if (needed !== true) {
    return (
      <EmptyStateBlock art="chart" label={fallbackLabel} compact={compact} />
    );
  }

  const authed = sessionStatus === "authenticated";
  const actionClass =
    "qt-btn qt-btn-primary inline-flex h-8 items-center justify-center px-3.5 text-[12px] font-semibold no-underline";

  return (
    <EmptyStateBlock
      art="chart"
      label={t("credsPromptTitle")}
      compact={compact}
    >
      <p className="max-w-sm text-[12px] leading-relaxed text-[var(--muted)]">
        {t("credsPromptBody")}
      </p>
      {authed && settingsModal ? (
        <button
          type="button"
          className={actionClass}
          onClick={() => settingsModal.openSettings({ setupKeys: true })}
        >
          {t("credsPromptAction")}
        </button>
      ) : (
        <Link
          href={
            authed
              ? "/settings?setupKeys=1"
              : "/login?next=/settings%3FsetupKeys%3D1"
          }
          className={actionClass}
        >
          {t("credsPromptAction")}
        </Link>
      )}
    </EmptyStateBlock>
  );
}
