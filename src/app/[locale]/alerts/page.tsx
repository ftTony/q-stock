"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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

function AlertsContent() {
  const t = useTranslations("alerts");
  const tMarket = useTranslations("market");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "AAPL");
  const [assetType, setAssetType] = useState<AssetType>(
    parseAssetType(searchParams.get("assetType")),
  );
  const [condition, setCondition] = useState<"gte" | "lte">("gte");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    if (a === "crypto" || a === "stock" || a === "hk") setAssetType(a);
  }, [searchParams]);

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{t("loginRequired")}</p>
        <Link href="/login" className="mt-3 inline-block text-[var(--brand-text)]">
          Login
        </Link>
      </div>
    );
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        assetType,
        condition,
        triggerPrice: Number(triggerPrice),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error");
      return;
    }
    setTriggerPrice("");
    await load();
  }

  async function patchStatus(id: string, next: "active" | "disabled") {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <form onSubmit={onCreate} className="qt-panel grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Symbol</span>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="qt-input w-full px-3 py-2.5"
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Type</span>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            className="qt-input w-full px-3 py-2.5"
          >
            <option value="stock">{tMarket("stocks")}</option>
            <option value="hk">{tMarket("hk")}</option>
            <option value="crypto">{tMarket("crypto")}</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("condition")}</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as "gte" | "lte")}
            className="qt-input w-full px-3 py-2.5"
          >
            <option value="gte">{t("gte")}</option>
            <option value="lte">{t("lte")}</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("triggerPrice")}</span>
          <input
            type="number"
            step="any"
            min="0"
            required
            value={triggerPrice}
            onChange={(e) => setTriggerPrice(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
          />
        </label>
        {error && <p className="text-sm text-[var(--down)] sm:col-span-2">{error}</p>}
        <button type="submit" className="qt-btn qt-btn-primary px-4 py-2.5 text-sm sm:col-span-2">
          {t("create")}
        </button>
      </form>

      <ul className="qt-panel divide-y divide-[var(--border)] overflow-hidden">
        {alerts.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">{t("empty")}</li>
        )}
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm">
              <div className="font-semibold">
                {a.symbol}{" "}
                <span className="font-normal text-[var(--muted)]">({a.assetType})</span>
              </div>
              <div className="text-[var(--muted)]">
                {a.condition === "gte" ? t("gte") : t("lte")} {a.triggerPrice} · {t(a.status)}
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              {a.status === "active" ? (
                <button
                  type="button"
                  className="qt-btn qt-btn-ghost px-2.5 py-1.5"
                  onClick={() => void patchStatus(a.id, "disabled")}
                >
                  {t("disable")}
                </button>
              ) : (
                <button
                  type="button"
                  className="qt-btn qt-btn-ghost px-2.5 py-1.5"
                  onClick={() => void patchStatus(a.id, "active")}
                >
                  {t("reactivate")}
                </button>
              )}
              <button
                type="button"
                className="qt-btn qt-btn-ghost px-2.5 py-1.5 text-[var(--down)]"
                onClick={() => void remove(a.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="qt-panel p-6 text-sm text-[var(--muted)]">…</div>}>
      <AlertsContent />
    </Suspense>
  );
}
