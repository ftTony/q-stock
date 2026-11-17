"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AccountPageLoading } from "@/components/auth/account-page-fill";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { AlertFrequencySeg } from "@/components/alerts/alert-frequency-seg";
import { AlertsList } from "@/components/alerts/alerts-list";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolSearchField } from "@/components/ui/symbol-search-field";
import {
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  usePatchAlert,
  type AlertFrequency,
} from "@/hooks/query/use-alerts";
import type { AssetType } from "@/lib/types";
import { parseAssetType } from "@/lib/types";

function AlertsContent() {
  const t = useTranslations("alerts");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [assetType, setAssetType] = useState<AssetType>(
    parseAssetType(searchParams.get("assetType")),
  );
  const [condition, setCondition] = useState<"gte" | "lte">("gte");
  const [frequency, setFrequency] = useState<AlertFrequency>("always");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const signedIn = Boolean(session?.user);
  const alertsQuery = useAlerts({ enabled: signedIn });
  const createAlert = useCreateAlert();
  const patchAlert = usePatchAlert();
  const deleteAlert = useDeleteAlert();

  const alerts = alertsQuery.data?.alerts ?? [];

  const marketLabel = useCallback(
    (type: AssetType) => {
      if (type === "hk") return tMarket("hk");
      if (type === "cn") return tMarket("cn");
      if (type === "crypto") return tMarket("crypto");
      return tMarket("stocks");
    },
    [tMarket],
  );

  useEffect(() => {
    const s = searchParams.get("symbol");
    const a = searchParams.get("assetType");
    if (s) setSymbol(s.toUpperCase());
    if (a === "crypto" || a === "stock" || a === "hk" || a === "cn") {
      setAssetType(a);
    }
  }, [searchParams]);

  if (status === "loading") {
    return <AccountPageLoading />;
  }

  if (!session?.user) {
    return (
      <AuthLoginGate
        fill
        title={t("loginTitle")}
        body={t("loginBody")}
        hint={t("loginHint")}
      />
    );
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!symbol.trim()) {
      setError(t("symbolRequired"));
      return;
    }
    try {
      await createAlert.mutateAsync({
        symbol: symbol.trim(),
        assetType,
        condition,
        triggerPrice: Number(triggerPrice),
        frequency,
      });
      setTriggerPrice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
    }
  }

  async function patchStatus(id: string, next: "active" | "disabled") {
    setActionId(id);
    try {
      await patchAlert.mutateAsync({ id, status: next });
    } finally {
      setActionId(null);
    }
  }

  async function remove(id: string) {
    setActionId(id);
    try {
      await deleteAlert.mutateAsync(id);
    } finally {
      setActionId(null);
    }
  }

  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-4 animate-[qtFade_0.45s_ease]">
      <div className="mb-0.5 flex items-center gap-2 px-3 pt-3 text-[12px] lg:px-0 lg:pt-0">
        <Link
          href="/watchlist"
          className="text-[var(--brand-text)] hover:underline"
        >
          {t("backWatchlist")}
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--muted)]">{t("title")}</span>
      </div>

      <header className="flex flex-wrap items-baseline justify-between gap-2 px-3 lg:px-0">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-[12px] text-[var(--muted)]">{t("hint")}</p>
        </div>
        {alerts.length > 0 ? (
          <p className="text-[12px] tabular-nums text-[var(--muted)]">
            <span className="text-[var(--foreground)]">{activeCount}</span>
            {t("activeShort")}
            <span className="mx-1.5 text-[var(--border)]">/</span>
            {alerts.length}
          </p>
        ) : null}
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
        <section className="qt-panel overflow-hidden">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <h2 className="text-[13px] font-semibold">{t("create")}</h2>
          </div>
          <form onSubmit={onCreate} className="space-y-2.5 p-3">
            <SymbolSearchField
              value={symbol}
              assetType={assetType}
              onChange={setSymbol}
              onSelect={(r) => {
                setSymbol(r.symbol);
                setAssetType(r.assetType);
              }}
              label={t("symbol")}
              placeholder={t("symbolPlaceholder")}
              required
            />
            <div className="space-y-1 text-[12px]">
              <span className="block text-[var(--muted)]">{t("assetType")}</span>
              <QtSelect
                value={assetType}
                onChange={(v) => setAssetType(v as AssetType)}
                options={[
                  { value: "stock", label: tMarket("stocks") },
                  { value: "hk", label: tMarket("hk") },
                  { value: "cn", label: tMarket("cn") },
                  { value: "crypto", label: tMarket("crypto") },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 text-[12px]">
                <span className="block text-[var(--muted)]">{t("condition")}</span>
                <QtSelect
                  value={condition}
                  onChange={(v) => setCondition(v as "gte" | "lte")}
                  options={[
                    { value: "gte", label: t("gte") },
                    { value: "lte", label: t("lte") },
                  ]}
                />
              </div>
              <label className="space-y-1 text-[12px]">
                <span className="block text-[var(--muted)]">
                  {t("triggerPrice")}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder={t("triggerPricePlaceholder")}
                  className="qt-input h-9 w-full px-2.5 text-[13px] tabular-nums leading-none"
                />
              </label>
            </div>

            <AlertFrequencySeg value={frequency} onChange={setFrequency} />

            {error ? (
              <p className="text-[12px] text-[var(--danger)]">{error}</p>
            ) : null}

            <SubmitButton
              loading={createAlert.isPending}
              loadingLabel={tCommon("loading")}
              className="qt-btn qt-btn-primary h-9 w-full text-[13px]"
            >
              {t("create")}
            </SubmitButton>
          </form>
        </section>

        <section className="qt-panel min-h-[240px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 sm:px-4">
            <h2 className="text-[13px] font-semibold">{t("listTitle")}</h2>
            {alerts.length > 0 ? (
              <span className="text-[12px] tabular-nums text-[var(--muted)]">
                {alerts.length}
              </span>
            ) : null}
          </div>
          <AlertsList
            alerts={alerts}
            actionId={actionId}
            marketLabel={marketLabel}
            onPatchStatus={(id, next) => void patchStatus(id, next)}
            onRemove={(id) => void remove(id)}
            loadingLabel={tCommon("loading")}
          />
        </section>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="qt-panel p-6 text-sm text-[var(--muted)]">…</div>
      }
    >
      <AlertsContent />
    </Suspense>
  );
}
