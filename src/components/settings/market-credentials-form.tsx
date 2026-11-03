"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import {
  CREDS_DISMISS_KEY,
  hasAnyBrokerCreds,
  MARKET_VENDORS_CHANGED,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";
import { SettingsHint } from "@/components/settings/settings-hint";
import { MarketCredentialsBrokerForms } from "@/components/settings/market-credentials-broker-forms";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  useDeleteMarketCredentials,
  useMarketCredentials,
} from "@/hooks/query/use-credentials";
import { queryKeys } from "@/lib/query/keys";

type Status = MarketCredsStatus;

const FUTU_OAUTH_FLASH_KEY = "q-stock.futu-oauth";

function mapFutuOAuthError(code: string, t: (key: string) => string): string {
  if (code === "denied") return t("credsFutuOAuthDenied");
  if (code === "need_login") return t("credsFutuOAuthNeedLogin");
  if (code === "oauth_unavailable") return t("credsFutuOAuthUnavailable");
  return t("credsFutuOAuthError");
}

export function MarketCredentialsForm({
  forceSetupKeys = false,
  onSetupKeysDone,
}: {
  forceSetupKeys?: boolean;
  onSetupKeysDone?: () => void;
} = {}) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const setupKeys =
    forceSetupKeys || searchParams.get("setupKeys") === "1";
  const panelRef = useRef<HTMLDivElement>(null);
  const futuFlashHandled = useRef(false);
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const { data: statusData, isLoading: loading, refetch } =
    useMarketCredentials();
  const deleteMut = useDeleteMarketCredentials();
  const status = statusData ?? null;

  useEffect(() => {
    function onVendorsChanged(ev: Event) {
      const detail = (ev as CustomEvent<MarketCredsStatus>).detail;
      if (detail) {
        qc.setQueryData<Status>(queryKeys.credentials.market, (prev) =>
          prev
            ? {
                ...prev,
                ...detail,
                longbridge: detail.longbridge ?? prev.longbridge,
                futu: detail.futu ?? prev.futu,
                binance: detail.binance ?? prev.binance,
                okx: detail.okx ?? prev.okx,
                fuyao: detail.fuyao ?? prev.fuyao,
              }
            : detail,
        );
      } else {
        void refetch();
      }
    }
    window.addEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    return () => {
      window.removeEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    };
  }, [qc, refetch]);

  useEffect(() => {
    if (!setupKeys || loading) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setupKeys, loading]);

  /** OAuth callback lands on /settings?futu=… then modal via sessionStorage. */
  useEffect(() => {
    if (loading || futuFlashHandled.current) return;
    let raw = searchParams.get("futu");
    if (!raw) {
      try {
        raw = sessionStorage.getItem(FUTU_OAUTH_FLASH_KEY);
        if (raw) sessionStorage.removeItem(FUTU_OAUTH_FLASH_KEY);
      } catch {
        raw = null;
      }
    }
    if (!raw) return;
    futuFlashHandled.current = true;

    if (raw === "connected") {
      void refetch().then((res) => {
        try {
          sessionStorage.removeItem(CREDS_DISMISS_KEY);
        } catch {
          /* ignore */
        }
        flash("ok", t("credsFutuConnected"));
        if (setupKeys && hasAnyBrokerCreds(res.data)) {
          onSetupKeysDone?.();
          if (!forceSetupKeys) router.replace("/settings");
        }
      });
    } else if (raw !== "need_login") {
      flash("error", mapFutuOAuthError(raw, t));
    }

    if (searchParams.get("futu")) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("futu");
      const qs = next.toString();
      router.replace(qs ? `/settings?${qs}` : "/settings");
    }
  }, [
    loading,
    searchParams,
    refetch,
    flash,
    t,
    setupKeys,
    forceSetupKeys,
    onSetupKeysDone,
    router,
  ]);

  function onCredsSaved(next: Status | undefined) {
    try {
      sessionStorage.removeItem(CREDS_DISMISS_KEY);
    } catch {
      /* ignore */
    }
    flash("ok", t("credsSaved"));
    if (setupKeys && hasAnyBrokerCreds(next)) {
      onSetupKeysDone?.();
      if (!forceSetupKeys) router.replace("/settings");
    }
  }

  function onCredsError(msg: string) {
    flash("error", msg);
  }

  async function clearProvider(provider: "longbridge" | "futu" | "binance") {
    clearFlash();
    try {
      await deleteMut.mutateAsync(provider);
      flash("ok", t("credsCleared"));
    } catch {
      flash("error", t("credsSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={4} label={tCommon("loading")} />;
  }

  const equityVendor = status?.equityVendor ?? "longbridge";
  const cryptoVendor = status?.cryptoVendor ?? "binance";

  return (
    <div ref={panelRef} id="market-credentials" className="w-full space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
          {t("credsTitle")}
        </h2>
        <SettingsHint tone="trust" className="mt-2">
          {t("credsTrustNote")}
        </SettingsHint>
      </div>

      {message ? (
        <p
          role="status"
          className="animate-[qtFade_0.25s_ease] rounded-lg px-3 py-1.5 text-xs"
          style={
            messageKind === "ok"
              ? {
                  background:
                    "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                }
              : {
                  background:
                    "color-mix(in srgb, var(--danger) 12%, transparent)",
                  color: "var(--danger)",
                }
          }
        >
          {messageKind === "ok" ? "✓ " : ""}
          {message}
        </p>
      ) : null}

      <MarketCredentialsBrokerForms
        status={status}
        equityVendor={equityVendor}
        cryptoVendor={cryptoVendor}
        onSaved={onCredsSaved}
        onError={onCredsError}
        onClearProvider={(p) => void clearProvider(p)}
      />
    </div>
  );
}
