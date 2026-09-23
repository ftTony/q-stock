"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type Tab = AssetType;

type NewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

export default function MarketsDashboard() {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list");
  const initialTab: Tab =
    listParam === "crypto" ? "crypto" : listParam === "hk" ? "hk" : "stock";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<
    { symbol: string; description: string; assetType: AssetType }[]
  >([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [sortMode, setSortMode] = useState<"all" | "gainers" | "losers">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [sentiment, setSentiment] = useState<{
    buzz_score?: number;
    sentiment_score?: number;
    bullish_pct?: number;
    bearish_pct?: number;
    trend?: string | null;
    available?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!session?.user) {
      setWatched(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setWatched(
        new Set(
          (data.items ?? []).map(
            (i: { symbol: string; assetType: string }) =>
              `${i.assetType}:${i.symbol}`,
          ),
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function toggleWatch(symbol: string, assetType: AssetType) {
    if (!session?.user) return;
    const key = `${assetType}:${symbol}`;
    const isOn = watched.has(key);
    if (isOn) {
      await fetch(`/api/watchlist?symbol=${symbol}&assetType=${assetType}`, {
        method: "DELETE",
      });
      setWatched((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType }),
      });
      if (res.ok) {
        setWatched((prev) => new Set(prev).add(key));
      }
    }
  }

  const loadPopular = useCallback(
    async (assetType: Tab, silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
        setQuotes([]);
      }
      try {
        const [qr, sr, nr, ar] = await Promise.all([
          fetch(`/api/quotes?popular=1&assetType=${assetType}`),
          fetch(`/api/sentiment?assetType=${assetType}`),
          fetch(`/api/news?assetType=${assetType}`),
          fetch("/api/alerts").catch(() => null),
        ]);
        const qj = await qr.json();
        const sj = await sr.json();
        const nj = await nr.json();
        if (!qr.ok) throw new Error(qj.error || "quotes failed");
        setQuotes(qj.quotes ?? []);
        setSentiment(sj.market ?? null);
        setNews((nj.news ?? []).slice(0, 4));
        setUpdatedAt(new Date());
        if (ar && ar.ok) {
          const aj = await ar.json();
          setAlertCount(
            (aj.alerts ?? []).filter(
              (a: { status: string }) => a.status === "active",
            ).length,
          );
        }
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : tCommon("error"));
          setQuotes([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tCommon],
  );

  useEffect(() => {
    void loadPopular(tab);
    const timer = setInterval(() => void loadPopular(tab, true), 45000);
    return () => clearInterval(timer);
  }, [tab, loadPopular]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&assetType=${tab}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, tab]);

  const list = useMemo(() => {
    const sorted = [...quotes];
    if (sortMode === "gainers") {
      sorted.sort((a, b) => b.percentChange - a.percentChange);
    } else if (sortMode === "losers") {
      sorted.sort((a, b) => a.percentChange - b.percentChange);
    }
    return sorted;
  }, [quotes, sortMode]);

  const avgChange = useMemo(() => {
    if (!quotes.length) return 0;
    return quotes.reduce((s, item) => s + (item.percentChange || 0), 0) / quotes.length;
  }, [quotes]);

  const topPerformer = useMemo(() => {
    if (!quotes.length) return null;
    return [...quotes].sort((a, b) => b.percentChange - a.percentChange)[0];
  }, [quotes]);

  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {tab === "crypto"
              ? t("titleCrypto")
              : tab === "hk"
                ? t("titleHk")
                : t("titleStock")}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {tab === "crypto"
              ? t("descCrypto")
              : tab === "hk"
                ? t("descHk")
                : t("descStock")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
            {(["stock", "hk", "crypto"] as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setQ("");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  tab === key
                    ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {key === "stock"
                  ? t("stocks")
                  : key === "hk"
                    ? t("hk")
                    : t("crypto")}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="qt-input w-full px-3 py-2.5 text-sm"
            />
            {results.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
                {results.map((r) => (
                  <li key={`${r.assetType}-${r.symbol}`}>
                    <Link
                      href={`/symbol/${r.assetType}/${r.symbol}`}
                      className="block px-3 py-2.5 text-sm hover:bg-[var(--sidebar-hover)]"
                      onClick={() => setQ("")}
                    >
                      <span className="font-semibold">{r.symbol}</span>
                      <span className="ml-2 text-[var(--muted)]">
                        {r.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-10 px-3 text-sm"
              onClick={() => setFilterOpen((v) => !v)}
            >
              {t("filter")}
              {sortMode !== "all" ? ` · ${t(sortMode)}` : ""}
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
                {(
                  [
                    ["all", t("filterAll")],
                    ["gainers", t("gainers")],
                    ["losers", t("losers")],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-[var(--sidebar-hover)] ${
                      sortMode === key ? "text-[var(--brand-text)]" : ""
                    }`}
                    onClick={() => {
                      setSortMode(key);
                      setFilterOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/alerts" className="qt-btn qt-btn-primary h-10 px-3 text-sm">
            + {t("create")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("kpiTickers")}
          value={String(quotes.length || 0)}
          hint={`${quotes.length ? `+${Math.min(3, quotes.length)}` : "0"} ${t("today")}`}
          hintClass="text-[var(--up)]"
        />
        <KpiCard
          label={t("kpiAvgChange")}
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          valueClass={avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}
        />
        <KpiCard
          label={t("kpiTop")}
          value={
            topPerformer
              ? `${topPerformer.symbol} ${topPerformer.percentChange >= 0 ? "+" : ""}${topPerformer.percentChange.toFixed(1)}%`
              : "-"
          }
          valueClass="text-[var(--brand-text)]"
        />
        <KpiCard
          label={t("kpiAlerts")}
          value={`${alertCount} ${t("kpiAlertsValue")}`}
          hintDot={alertCount > 0}
        />
      </section>

      <section className="qt-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">{t("popular")}</span>
          <span className="text-xs">
            {loading
              ? tCommon("loading")
              : updatedAt
                ? `${t("updated")} ${updatedAt.toLocaleTimeString()}`
                : ""}
          </span>
        </div>

        {error && (
          <div className="space-y-2 p-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost px-3 py-1.5"
              onClick={() => void loadPopular(tab)}
            >
              {tCommon("retry")}
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
                  <th className="px-4 py-3 font-semibold">{t("symbol")}</th>
                  <th className="px-4 py-3 font-semibold">{t("price")}</th>
                  <th className="px-4 py-3 font-semibold">{t("change")}</th>
                  <th className="px-4 py-3 font-semibold">{t("volume")}</th>
                  <th className="px-4 py-3 font-semibold">{t("last24h")}</th>
                  <th className="px-4 py-3 font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading && list.length === 0 && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <tr
                        key={`sk-${i}`}
                        className="border-b border-[var(--border)]/70 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-9 w-9 animate-pulse rounded-lg bg-[var(--surface-2)]" />
                            <span className="space-y-1.5">
                              <span className="block h-3.5 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
                              <span className="block h-3 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-4 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-4 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-4 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-8 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block h-4 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                {list.map((item) => {
                  const up = item.percentChange >= 0;
                  const range =
                    item.high && item.low
                      ? `${item.low.toFixed(2)} – ${item.high.toFixed(2)}`
                      : "-";
                  return (
                    <tr
                      key={item.symbol}
                      className={`border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60 ${
                        loading ? "opacity-60" : ""
                      }`}
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
                            <span className="block font-semibold tracking-wide">
                              {item.symbol}
                            </span>
                            <span className="block text-xs text-[var(--muted)]">
                              {displayName(item.symbol, item.assetType)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        $
                        <PriceText
                          value={item.price}
                          change={item.percentChange}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <span aria-hidden>{up ? "▲" : "▼"}</span>
                          <ChangePct value={item.percentChange} />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] tabular-nums">
                        {range}
                      </td>
                      <td className="px-4 py-3">
                        <Sparkline
                          open={item.open}
                          high={item.high}
                          low={item.low}
                          close={item.price}
                          up={up}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={`text-sm ${
                              watched.has(`${item.assetType}:${item.symbol}`)
                                ? "text-[var(--brand-text)]"
                                : "text-[var(--muted)] hover:text-[var(--brand-text)]"
                            }`}
                            title={
                              watched.has(`${item.assetType}:${item.symbol}`)
                                ? t("remove")
                                : t("addWatch")
                            }
                            onClick={() =>
                              void toggleWatch(item.symbol, item.assetType)
                            }
                          >
                            {watched.has(`${item.assetType}:${item.symbol}`)
                              ? "★"
                              : "☆"}
                          </button>
                          <Link
                            href={`/symbol/${item.assetType}/${item.symbol}`}
                            className="text-xs font-bold tracking-wide text-[var(--up)] hover:opacity-80"
                          >
                            {t("buy")}
                          </Link>
                          <Link
                            href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                            className="text-xs font-bold tracking-wide text-[var(--down)] hover:opacity-80"
                          >
                            {t("sell")}
                          </Link>
                          <Link
                            href={`/symbol/${item.assetType}/${item.symbol}`}
                            className="text-[var(--muted)] hover:text-[var(--foreground)]"
                            aria-label="More"
                          >
                            ⋮
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && list.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[var(--muted)]"
                    >
                      {t("unavailable")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="qt-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t("narrative")}</h2>
            <span className="text-xs text-[var(--brand-text)]">{t("viewAll")}</span>
          </div>
          <ul className="space-y-3">
            {news.length === 0 && (
              <li className="text-sm text-[var(--muted)]">{t("unavailable")}</li>
            )}
            {news.map((n, i) => (
              <li
                key={i}
                className="flex gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                  {n.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                      NEWS
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                    <span>{n.category || n.source || "MARKET"}</span>
                    {n.datetime ? (
                      <span>
                        {Math.max(
                          1,
                          Math.round((Date.now() / 1000 - n.datetime) / 60),
                        )}
                        m
                      </span>
                    ) : null}
                  </div>
                  <a
                    href={n.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 text-sm font-medium hover:text-[var(--brand-text)]"
                  >
                    {n.headline}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="qt-panel p-4">
          <h2 className="mb-4 font-semibold">{t("sentiment")}</h2>
          {sentiment?.available === false ? (
            <p className="text-sm text-[var(--muted)]">
              {sentiment.message || t("unavailable")}
            </p>
          ) : (
            <>
              <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="bg-[var(--up)]" style={{ width: `${bullish}%` }} />
                <div className="bg-[var(--muted)]" style={{ width: `${neutral}%` }} />
                <div className="bg-[var(--down)]" style={{ width: `${bearish}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-semibold text-[var(--up)]">
                    {bullish.toFixed(0)}%
                  </div>
                  <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    {t("bullish")}
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--muted)]">
                    {neutral.toFixed(0)}%
                  </div>
                  <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    {t("neutral")}
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--down)]">
                    {bearish.toFixed(0)}%
                  </div>
                  <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    {t("bearish")}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
                {t("sentimentHint")}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  hintClass,
  valueClass,
  hintDot,
}: {
  label: string;
  value: string;
  hint?: string;
  hintClass?: string;
  valueClass?: string;
  hintDot?: boolean;
}) {
  return (
    <div className="qt-card p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        {hintDot && (
          <span className="h-2 w-2 rounded-full bg-[var(--down)] shadow-[0_0_8px_var(--down)]" />
        )}
      </div>
      <div className={`text-xl font-semibold tracking-tight sm:text-2xl ${valueClass || ""}`}>
        {value}
      </div>
      {hint && (
        <div className={`mt-1 text-xs ${hintClass || "text-[var(--muted)]"}`}>{hint}</div>
      )}
    </div>
  );
}
