"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { SubmitButton } from "@/components/ui/submit-button";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";
import { Suspense } from "react";

type Row = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
};

function WatchlistContent() {
  const t = useTranslations("market");
  const tNav = useTranslations("nav");
  const tAlerts = useTranslations("alerts");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const list = searchParams.get("list");
  const [filter, setFilter] = useState<AssetType | "all">(
    list === "crypto" || list === "stock" || list === "hk" ? list : "all",
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [addType, setAddType] = useState<AssetType>("stock");
  const [results, setResults] = useState<
    { symbol: string; description: string; assetType: AssetType }[]
  >([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (list === "crypto" || list === "stock" || list === "hk") setFilter(list);
  }, [list]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist?quotes=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tCommon("error"));
      setRows(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (session?.user) {
      void load();
      const timer = setInterval(() => void load(), 45000);
      return () => clearInterval(timer);
    }
    setLoading(false);
  }, [session, load]);

  async function seedPopular() {
    setAdding(true);
    try {
      const list =
        filter === "crypto"
          ? ["BTC", "ETH", "SOL", "BNB"]
          : filter === "hk"
            ? ["00700", "09988", "03690", "01810"]
            : ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN"];
      const assetType: AssetType =
        filter === "crypto" ? "crypto" : filter === "hk" ? "hk" : "stock";
      await Promise.all(
        list.map((symbol) =>
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, assetType }),
          }),
        ),
      );
      await load();
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&assetType=${addType}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, addType]);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.assetType === filter)),
    [rows, filter],
  );

  async function remove(id: string) {
    await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function addSymbol(symbol: string, assetType: AssetType) {
    setAdding(true);
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType }),
      });
      setQ("");
      setResults([]);
      await load();
    } finally {
      setAdding(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{tAlerts("loginRequired")}</p>
        <Link href="/login" className="qt-btn qt-btn-primary mt-3 inline-flex px-3 py-1.5 text-sm">
          {tNav("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tNav("watchlist")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("descStock")}</p>
        </div>
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
          {(
            [
              ["all", t("popular")],
              ["stock", t("stocks")],
              ["hk", t("hk")],
              ["crypto", t("crypto")],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                filter === key
                  ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="qt-panel relative p-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value as AssetType)}
            className="qt-input px-3 py-2.5 text-sm"
          >
            <option value="stock">{t("stocks")}</option>
            <option value="hk">{t("hk")}</option>
            <option value="crypto">{t("crypto")}</option>
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="qt-input min-w-[220px] flex-1 px-3 py-2.5 text-sm"
          />
          {adding && (
            <span className="self-center text-xs text-[var(--muted)]">
              {tCommon("loading")}
            </span>
          )}
        </div>
        {results.length > 0 && (
          <ul className="absolute left-4 right-4 z-20 mt-2 max-h-56 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
            {results.map((r) => (
              <li key={`${r.assetType}-${r.symbol}`}>
                <button
                  type="button"
                  disabled={adding}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[var(--sidebar-hover)] disabled:opacity-50"
                  onClick={() => void addSymbol(r.symbol, r.assetType)}
                >
                  <span>
                    <span className="font-semibold">{r.symbol}</span>
                    <span className="ml-2 text-[var(--muted)]">{r.description}</span>
                  </span>
                  <span className="text-xs text-[var(--brand-text)]">+ {t("addWatch")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="qt-panel overflow-hidden">
        {loading && (
          <div className="p-6 text-sm text-[var(--muted)]">{tCommon("loading")}</div>
        )}
        {error && (
          <div className="space-y-2 p-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button type="button" className="qt-btn qt-btn-ghost px-3 py-1.5" onClick={() => void load()}>
              {tCommon("retry")}
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
                  <th className="px-4 py-3 font-semibold">{t("symbol")}</th>
                  <th className="px-4 py-3 font-semibold">{t("price")}</th>
                  <th className="px-4 py-3 font-semibold">{t("change")}</th>
                  <th className="px-4 py-3 font-semibold">{t("last24h")}</th>
                  <th className="px-4 py-3 font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const q = item.quote;
                  const up = (q?.percentChange ?? 0) >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/symbol/${item.assetType}/${item.symbol}`}
                          className="flex items-center gap-3"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--brand-text)]">
                            {item.symbol.slice(0, 2)}
                          </span>
                          <span>
                            <span className="block font-semibold">{item.symbol}</span>
                            <span className="block text-xs text-[var(--muted)]">
                              {displayName(item.symbol, item.assetType)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {q ? (
                          <>
                            $
                            <PriceText
                              value={q.price}
                              change={q.percentChange}
                            />
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {q ? <ChangePct value={q.percentChange} /> : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {q ? (
                          <Sparkline
                            open={q.open}
                            high={q.high}
                            low={q.low}
                            close={q.price}
                            up={up}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/symbol/${item.assetType}/${item.symbol}`}
                            className="qt-link-up text-xs font-bold hover:opacity-80"
                          >
                            {t("buy")}
                          </Link>
                          <button
                            type="button"
                            className="qt-link-down text-xs font-bold hover:opacity-80"
                            onClick={() => void remove(item.id)}
                          >
                            {t("remove")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <p className="mb-3 text-[var(--muted)]">{t("watchlistEmpty")}</p>
                      <SubmitButton
                        type="button"
                        loading={adding}
                        loadingLabel={tCommon("loading")}
                        onClick={() => void seedPopular()}
                        className="qt-btn-primary px-4 py-2 text-sm"
                      >
                        {t("seedPopular")}
                      </SubmitButton>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<div className="qt-panel p-6 text-sm text-[var(--muted)]">…</div>}>
      <WatchlistContent />
    </Suspense>
  );
}
