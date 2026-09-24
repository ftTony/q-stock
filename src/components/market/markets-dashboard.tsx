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
type Board = "hot" | "gainers" | "losers";
type RankQuote = Quote & { name?: string };

type NewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

type Boards = Record<Board, RankQuote[]>;

type IndexQuote = {
  id: string;
  symbol: string;
  nameKey: string;
  assetType: AssetType;
  price: number | null;
  change: number | null;
  percentChange: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
};

const EMPTY_BOARDS: Boards = { hot: [], gainers: [], losers: [] };

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
  const [boards, setBoards] = useState<Boards>(EMPTY_BOARDS);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<
    { symbol: string; description: string; assetType: AssetType }[]
  >([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(0);
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

  const loadBoards = useCallback(
    async (assetType: Tab, silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
        setBoards(EMPTY_BOARDS);
        if (assetType !== "crypto") setIndices([]);
      }
      try {
        const indexPromise =
          assetType === "crypto"
            ? Promise.resolve(null)
            : fetch(`/api/indices?assetType=${assetType}`).catch(() => null);
        const [qr, sr, nr, ar, ir] = await Promise.all([
          fetch(`/api/ranks?assetType=${assetType}&board=all&limit=7`),
          fetch(`/api/sentiment?assetType=${assetType}`),
          fetch(`/api/news?assetType=${assetType}`),
          fetch("/api/alerts").catch(() => null),
          indexPromise,
        ]);
        const qj = await qr.json();
        const sj = await sr.json();
        const nj = await nr.json();
        if (!qr.ok) throw new Error(qj.error || "quotes failed");
        setBoards({
          hot: qj.boards?.hot ?? [],
          gainers: qj.boards?.gainers ?? [],
          losers: qj.boards?.losers ?? [],
        });
        if (assetType === "crypto") {
          setIndices([]);
        } else if (ir && ir.ok) {
          const ij = await ir.json();
          setIndices(ij.indices ?? []);
        }
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
          setBoards(EMPTY_BOARDS);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tCommon],
  );

  useEffect(() => {
    void loadBoards(tab);
    const timer = setInterval(() => void loadBoards(tab, true), 45000);
    return () => clearInterval(timer);
  }, [tab, loadBoards]);

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

  const kpiQuotes = boards.hot;
  const avgChange = useMemo(() => {
    if (!kpiQuotes.length) return 0;
    return (
      kpiQuotes.reduce((s, item) => s + (item.percentChange || 0), 0) /
      kpiQuotes.length
    );
  }, [kpiQuotes]);

  const topPerformer = useMemo(() => {
    if (!boards.gainers.length) return null;
    return boards.gainers[0];
  }, [boards.gainers]);

  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  const boardMeta: { key: Board; title: string }[] = [
    {
      key: "hot",
      title: tab === "crypto" ? t("popular") : t("rankHot"),
    },
    { key: "gainers", title: t("gainers") },
    { key: "losers", title: t("losers") },
  ];

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

          <Link href="/alerts" className="qt-btn qt-btn-primary h-10 px-3 text-sm">
            + {t("create")}
          </Link>
        </div>
      </section>

      {tab !== "crypto" && (
        <IndexStrip indices={indices} loading={loading} t={t} />
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("kpiTickers")}
          value={String(kpiQuotes.length || 0)}
          hint={`${kpiQuotes.length ? `+${Math.min(3, kpiQuotes.length)}` : "0"} ${t("today")}`}
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

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{t("rankBoards")}</h2>
          <span className="text-xs text-[var(--muted)]">
            {loading
              ? tCommon("loading")
              : updatedAt
                ? `${t("updated")} ${updatedAt.toLocaleTimeString()}`
                : ""}
          </span>
        </div>

        {error && (
          <div className="qt-panel space-y-2 p-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost px-3 py-1.5"
              onClick={() => void loadBoards(tab)}
            >
              {tCommon("retry")}
            </button>
          </div>
        )}

        {!error && (
          <div className="grid gap-3 xl:grid-cols-3">
            {boardMeta.map(({ key, title }) => (
              <RankBoardPanel
                key={key}
                title={title}
                items={boards[key]}
                loading={loading}
                watched={watched}
                onToggleWatch={toggleWatch}
                t={t}
              />
            ))}
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

function IndexStrip({
  indices,
  loading,
  t,
}: {
  indices: IndexQuote[];
  loading: boolean;
  t: ReturnType<typeof useTranslations<"market">>;
}) {
  const slots =
    indices.length > 0
      ? indices
      : loading
        ? Array.from({ length: 3 }).map((_, i) => ({
            id: `sk-${i}`,
            symbol: "",
            nameKey: "",
            assetType: "stock" as AssetType,
            price: null,
            change: null,
            percentChange: null,
          }))
        : [];

  if (!slots.length) return null;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {slots.map((item) => {
        const pct = item.percentChange;
        const up = pct != null && pct >= 0;
        let name = item.symbol;
        if (item.nameKey) {
          try {
            name = t(item.nameKey as "indexSpx");
          } catch {
            name = item.symbol;
          }
        }

        const body = (
          <>
            <div className="min-w-0 flex-1 basis-[30%]">
              {item.symbol ? (
                <>
                  <div className="truncate text-sm font-semibold">{name}</div>
                  <div className="text-[11px] tracking-wide text-[var(--muted)]">
                    {item.symbol}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                  <div className="h-2.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                </div>
              )}
            </div>

            <div className="flex flex-1 basis-[40%] items-center justify-center">
              {item.price != null ? (
                <Sparkline
                  open={item.open ?? item.previousClose ?? item.price}
                  high={item.high ?? item.price}
                  low={item.low ?? item.price}
                  close={item.price}
                  up={up}
                />
              ) : (
                <div className="h-7 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
              )}
            </div>

            <div className="min-w-[5.5rem] shrink-0 flex-1 basis-[30%] text-right">
              {item.price != null ? (
                <>
                  <div className="text-sm font-semibold tabular-nums">
                    {item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-xs font-medium tabular-nums ${
                      up ? "text-[var(--up)]" : "text-[var(--down)]"
                    }`}
                  >
                    {pct != null
                      ? `${up ? "▲" : "▼"} ${up ? "+" : ""}${pct.toFixed(2)}%`
                      : "—"}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                </div>
              )}
            </div>
          </>
        );

        if (!item.symbol) {
          return (
            <div
              key={item.id}
              className="qt-panel flex items-center gap-3 px-4 py-3"
            >
              {body}
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={`/symbol/${item.assetType}/${item.symbol}`}
            className="qt-panel flex items-center gap-3 px-4 py-3 transition hover:border-[var(--brand)]/40 hover:bg-[var(--sidebar-hover)]/40"
          >
            {body}
          </Link>
        );
      })}
    </section>
  );
}

function RankBoardPanel({
  title,
  items,
  loading,
  watched,
  onToggleWatch,
  t,
}: {
  title: string;
  items: RankQuote[];
  loading: boolean;
  watched: Set<string>;
  onToggleWatch: (symbol: string, assetType: AssetType) => void;
  t: ReturnType<typeof useTranslations<"market">>;
}) {
  return (
    <div className="qt-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-3 py-2.5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      </div>
      <div className="overflow-x-auto qt-scroll">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[10px] tracking-wider text-[var(--muted)] uppercase">
              <th className="px-3 py-2 font-semibold">{t("symbol")}</th>
              <th className="px-2 py-2 font-semibold">{t("price")}</th>
              <th className="px-2 py-2 font-semibold">{t("change")}</th>
              <th className="px-3 py-2 text-right font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 &&
              Array.from({ length: 7 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-b border-[var(--border)]/70 last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 animate-pulse rounded-md bg-[var(--surface-2)]" />
                      <span className="space-y-1">
                        <span className="block h-3 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                        <span className="block h-2.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="inline-block h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                </tr>
              ))}
            {items.map((item) => {
              const up = item.percentChange >= 0;
              const watchKey = `${item.assetType}:${item.symbol}`;
              const isWatched = watched.has(watchKey);
              return (
                <tr
                  key={`${title}-${item.symbol}`}
                  className={`border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60 ${
                    loading ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--brand-text)]">
                        {item.symbol.slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold tracking-wide">
                          {item.symbol}
                        </span>
                        <span className="block truncate text-[11px] text-[var(--muted)]">
                          {item.name || displayName(item.symbol, item.assetType)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-medium tabular-nums text-[13px]">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="block"
                    >
                      {item.assetType === "hk" ? "HK$" : "$"}
                      <PriceText value={item.price} change={item.percentChange} />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-[13px]">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="inline-flex items-center gap-0.5 font-medium"
                    >
                      <span aria-hidden className="text-[10px]">
                        {up ? "▲" : "▼"}
                      </span>
                      <ChangePct value={item.percentChange} />
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        className={`text-sm ${
                          isWatched
                            ? "text-[var(--brand-text)]"
                            : "text-[var(--muted)] hover:text-[var(--brand-text)]"
                        }`}
                        title={isWatched ? t("remove") : t("addWatch")}
                        onClick={() =>
                          void onToggleWatch(item.symbol, item.assetType)
                        }
                      >
                        {isWatched ? "★" : "☆"}
                      </button>
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="qt-link-up text-[11px] font-bold tracking-wide hover:opacity-80"
                      >
                        {t("buy")}
                      </Link>
                      <Link
                        href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                        className="qt-link-down text-[11px] font-bold tracking-wide hover:opacity-80"
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
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  {t("unavailable")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
