"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolSearchField } from "@/components/ui/symbol-search-field";
import type { AssetType } from "@/lib/types";
import { parseAssetType } from "@/lib/types";

type AlertRow = {
  id: string;
  symbol: string;
  assetType: AssetType;
  condition: "gte" | "lte";
  triggerPrice: number;
  status: "active" | "triggered" | "disabled";
};

function statusTone(status: AlertRow["status"]) {
  if (status === "active") {
    return "bg-[color-mix(in_srgb,var(--up)_14%,transparent)] text-[var(--up)]";
  }
  if (status === "triggered") {
    return "bg-[color-mix(in_srgb,var(--brand)_16%,transparent)] text-[var(--brand-text)]";
  }
  return "bg-[var(--surface-2)] text-[var(--muted)]";
}

function AlertsContent() {
  const t = useTranslations("alerts");
  const tNav = useTranslations("nav");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [assetType, setAssetType] = useState<AssetType>(
    parseAssetType(searchParams.get("assetType")),
  );
  const [condition, setCondition] = useState<"gte" | "lte">("gte");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const marketLabel = useCallback(
    (type: AssetType) => {
      if (type === "hk") return tMarket("hk");
      if (type === "cn") return tMarket("cn");
      if (type === "crypto") return tMarket("crypto");
      return tMarket("stocks");
    },
    [tMarket],
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/alerts");
    if (!res.ok) return;
    const data = await res.json();
    setAlerts(data.alerts ?? []);
  }, []);

  useEffect(() => {
    if (session?.user) void load();
  }, [session, load]);

  useEffect(() => {
    const s = searchParams.get("symbol");
    const a = searchParams.get("assetType");
    if (s) setSymbol(s.toUpperCase());
    if (a === "crypto" || a === "stock" || a === "hk" || a === "cn") {
      setAssetType(a);
    }
  }, [searchParams]);

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md qt-panel p-6 text-sm">
        <p>{t("loginRequired")}</p>
        <Link
          href="/login"
          className="qt-btn qt-btn-primary mt-3 inline-flex h-9 px-3 text-sm"
        >
          {tNav("login")}
        </Link>
      </div>
    );
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!symbol.trim()) {
      setError(t("symbolRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim(),
          assetType,
          condition,
          triggerPrice: Number(triggerPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tCommon("error"));
        return;
      }
      setTriggerPrice("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function patchStatus(id: string, next: "active" | "disabled") {
    setActionId(id);
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      await load();
    } finally {
      setActionId(null);
    }
  }

  async function remove(id: string) {
    setActionId(id);
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setActionId(null);
    }
  }

  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 animate-[qtFade_0.45s_ease]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("title")}
          </h1>
          <p className="max-w-lg text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
            {t("hint")}
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-xs tabular-nums text-[var(--muted)]">
            <span className="rounded-md bg-[color-mix(in_srgb,var(--up)_12%,transparent)] px-2 py-1 font-medium text-[var(--up)]">
              {activeCount} {t("active")}
            </span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">
              {alerts.length}
            </span>
          </div>
        )}
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <section className="qt-panel overflow-hidden">
          <div className="border-b border-[var(--border)] px-4 py-2.5">
            <h2 className="text-sm font-semibold">{t("create")}</h2>
          </div>
          <form onSubmit={onCreate} className="space-y-3 p-4">
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
            <div className="space-y-1.5 text-sm">
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
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5 text-sm">
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
              <label className="space-y-1.5 text-sm">
                <span className="block text-[var(--muted)]">{t("triggerPrice")}</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder={t("triggerPricePlaceholder")}
                  className="qt-input h-9 w-full px-3 text-sm leading-none"
                />
              </label>
            </div>

            {error && <p className="text-xs text-[var(--down)]">{error}</p>}

            <SubmitButton
              loading={submitting}
              loadingLabel={tCommon("loading")}
              className="qt-btn qt-btn-primary h-9 w-full text-sm"
            >
              {t("create")}
            </SubmitButton>
          </form>
        </section>

        <section className="qt-panel min-h-[280px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <h2 className="text-sm font-semibold">{t("listTitle")}</h2>
            {alerts.length > 0 && (
              <span className="text-xs tabular-nums text-[var(--muted)]">
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {t("empty")}
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-[var(--muted)]">
                {t("emptyHint")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/symbol/${a.assetType}/${a.symbol}`}
                        className="text-sm font-semibold tracking-tight hover:text-[var(--brand-text)]"
                      >
                        {a.symbol}
                      </Link>
                      <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        {marketLabel(a.assetType)}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusTone(a.status)}`}
                      >
                        {t(a.status)}
                      </span>
                    </div>
                    <p className="text-xs tabular-nums text-[var(--muted)] sm:text-sm">
                      {a.condition === "gte" ? t("gte") : t("lte")}{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {a.triggerPrice}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {a.status === "active" ? (
                      <SubmitButton
                        type="button"
                        loading={actionId === a.id}
                        loadingLabel={tCommon("loading")}
                        className="qt-btn qt-btn-ghost h-8 px-2.5 text-xs"
                        onClick={() => void patchStatus(a.id, "disabled")}
                      >
                        {t("disable")}
                      </SubmitButton>
                    ) : (
                      <SubmitButton
                        type="button"
                        loading={actionId === a.id}
                        loadingLabel={tCommon("loading")}
                        className="qt-btn qt-btn-ghost h-8 px-2.5 text-xs"
                        onClick={() => void patchStatus(a.id, "active")}
                      >
                        {t("reactivate")}
                      </SubmitButton>
                    )}
                    <SubmitButton
                      type="button"
                      loading={actionId === a.id}
                      loadingLabel={tCommon("loading")}
                      className="qt-btn qt-btn-ghost h-8 px-2.5 text-xs text-[var(--down)]"
                      onClick={() => void remove(a.id)}
                    >
                      {t("delete")}
                    </SubmitButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl qt-panel p-6 text-sm text-[var(--muted)]">
          …
        </div>
      }
    >
      <AlertsContent />
    </Suspense>
  );
}
