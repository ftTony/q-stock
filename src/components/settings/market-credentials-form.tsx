"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
import {
  MarketCredentialsBrokerForms,
  type FutuMode,
} from "@/components/settings/market-credentials-broker-forms";
import {
  useDeleteMarketCredentials,
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";
import { queryKeys } from "@/lib/query/keys";

type Status = MarketCredsStatus;

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

  const { data: statusData, isLoading: loading, refetch } =
    useMarketCredentials();
  const saveMut = useSaveMarketCredentials();
  const deleteMut = useDeleteMarketCredentials();
  const status = statusData ?? null;

  const [savingLb, setSavingLb] = useState(false);
  const [savingFutu, setSavingFutu] = useState(false);
  const [savingBn, setSavingBn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");

  const [lbKey, setLbKey] = useState("");
  const [lbSecret, setLbSecret] = useState("");
  const [lbToken, setLbToken] = useState("");

  const [futuMode, setFutuMode] = useState<FutuMode>("appkey");
  const [futuAppKey, setFutuAppKey] = useState("");
  const [futuPrivateKey, setFutuPrivateKey] = useState("");
  const [futuBearer, setFutuBearer] = useState("");

  const [bnApiKey, setBnApiKey] = useState("");
  const [bnApiSecret, setBnApiSecret] = useState("");

  useEffect(() => {
    if (status?.futu?.mode) setFutuMode(status.futu.mode);
  }, [status?.futu?.mode]);

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
        if (detail.futu?.mode) setFutuMode(detail.futu.mode);
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

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  function onCredsSaved(next: Status | undefined) {
    try {
      sessionStorage.removeItem(CREDS_DISMISS_KEY);
    } catch {
      /* ignore */
    }
    if (setupKeys && hasAnyBrokerCreds(next)) {
      onSetupKeysDone?.();
      if (!forceSetupKeys) router.replace("/settings");
    }
  }

  async function saveLongbridge(e: FormEvent) {
    e.preventDefault();
    setSavingLb(true);
    setMessage(null);
    try {
      const next = await saveMut.mutateAsync({
        longbridge: {
          appKey: lbKey.trim(),
          appSecret: lbSecret.trim(),
          accessToken: lbToken.trim(),
        },
      });
      setLbKey("");
      setLbSecret("");
      setLbToken("");
      onCredsSaved(next);
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("credsSaveError"));
    } finally {
      setSavingLb(false);
    }
  }

  async function saveFutu(e: FormEvent) {
    e.preventDefault();
    setSavingFutu(true);
    setMessage(null);
    try {
      const body =
        futuMode === "bearer"
          ? {
              futu: {
                mode: "bearer" as const,
                accessToken: futuBearer.trim(),
              },
            }
          : {
              futu: {
                mode: "appkey" as const,
                appKey: futuAppKey.trim(),
                privateKey: futuPrivateKey.trim(),
              },
            };
      const next = await saveMut.mutateAsync(body);
      setFutuAppKey("");
      setFutuPrivateKey("");
      setFutuBearer("");
      onCredsSaved(next);
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("credsSaveError"));
    } finally {
      setSavingFutu(false);
    }
  }

  async function saveBinance(e: FormEvent) {
    e.preventDefault();
    setSavingBn(true);
    setMessage(null);
    try {
      const next = await saveMut.mutateAsync({
        binance: {
          apiKey: bnApiKey.trim(),
          apiSecret: bnApiSecret.trim() || undefined,
        },
      });
      setBnApiKey("");
      setBnApiSecret("");
      onCredsSaved(next);
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("credsSaveError"));
    } finally {
      setSavingBn(false);
    }
  }

  async function clearProvider(provider: "longbridge" | "futu" | "binance") {
    setMessage(null);
    try {
      await deleteMut.mutateAsync(provider);
      setMessageKind("ok");
      setMessage(t("credsCleared"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
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

      {message && (
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
      )}

      <MarketCredentialsBrokerForms
        status={status}
        equityVendor={equityVendor}
        cryptoVendor={cryptoVendor}
        savingLb={savingLb}
        savingFutu={savingFutu}
        savingBn={savingBn}
        lbKey={lbKey}
        lbSecret={lbSecret}
        lbToken={lbToken}
        setLbKey={setLbKey}
        setLbSecret={setLbSecret}
        setLbToken={setLbToken}
        futuMode={futuMode}
        setFutuMode={setFutuMode}
        futuAppKey={futuAppKey}
        futuPrivateKey={futuPrivateKey}
        futuBearer={futuBearer}
        setFutuAppKey={setFutuAppKey}
        setFutuPrivateKey={setFutuPrivateKey}
        setFutuBearer={setFutuBearer}
        bnApiKey={bnApiKey}
        bnApiSecret={bnApiSecret}
        setBnApiKey={setBnApiKey}
        setBnApiSecret={setBnApiSecret}
        onSaveLongbridge={saveLongbridge}
        onSaveFutu={saveFutu}
        onSaveBinance={saveBinance}
        onClearProvider={clearProvider}
      />
    </div>
  );
}
