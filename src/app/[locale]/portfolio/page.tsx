"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type Row = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
};

type NewsItem = {
  headline: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

export default function PortfolioPage() {
  const t = useTranslations("portfolio");
  const tMarket = useTranslations("market");
  const tAlerts = useTranslations("alerts");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();

  const [rows, setRows] = useState<Row[]>([]);
  const [alertActive, setAlertActive] = useState(0);
  const [alertTriggered, setAlertTriggered] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [sentiment, setSentiment] = useState<{
    bullish_pct?: number;
    bearish_pct?: number;
    available?: boolean;
    message?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, a, s, n] = await Promise.all([
        fetch("/api/watchlist?quotes=1"),
        fetch("/api/alerts"),
        fetch("/api/sentiment?assetType=stock"),
        fetch("/api/news?assetType=stock"),
      ]);
      if (w.ok) {
        const wj = await w.json();
        setRows(wj.items ?? []);
      }
      if (a.ok) {
        const aj = await a.json();
        const alerts = aj.alerts ?? [];
        setAlertActive(alerts.filter((x: { status: string }) => x.status === "active").length);
        setAlertTriggered(
          alerts.filter((x: { status: string }) => x.status === "triggered").length,
        );
      }
      if (s.ok) {
        const sj = await s.json();
        setSentiment(sj.market ?? null);
      }
      if (n.ok) {
        const nj = await n.json();
        setNews((nj.news ?? []).slice(0, 3));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => clearInterval(timer);
  }, [session, load]);

  const quotes = useMemo(
    () => rows.map((r) => r.quote).filter((q): q is Quote => Boolean(q)),
    [rows],
  );

  const avgChange = useMemo(() => {
    if (!quotes.length) return 0;
    return quotes.reduce((s, q) => s + q.percentChange, 0) / quotes.length;
  }, [quotes]);

  const top = useMemo(() => {
    if (!quotes.length) return null;
    return [...quotes].sort((a, b) => b.percentChange - a.percentChange)[0];
  }, [quotes]);

  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  async function seedPopular() {
    setSeeding(true);
    try {
      const popular = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN"];
      await Promise.all(
        popular.map((symbol) =>
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, assetType: "stock" }),
          }),
        ),
      );
      await load();
    } finally {
      setSeeding(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{tAlerts("loginRequired")}</p>
        <Link href="/login" className="mt-3 inline-block text-[var(--brand-text)]">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("desc")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/watchlist" className="qt-btn qt-btn-ghost h-10 px-3 text-sm">
            {t("openWatchlist")}
          </Link>
          <Link href="/alerts" className="qt-btn qt-btn-primary h-10 px-3 text-sm">
            + {tMarket("create")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{t("watchlist")}</div>
          <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{tMarket("kpiAvgChange")}</div>
          <div
            className={`mt-2 text-2xl font-semibold ${
              avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
            }`}
          >
            {avgChange >= 0 ? "+" : ""}
            {avgChange.toFixed(2)}%
          </div>
        </div>
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{tMarket("kpiTop")}</div>
          <div className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
            {top
              ? `${top.symbol} ${top.percentChange >= 0 ? "+" : ""}${top.percentChange.toFixed(1)}%`
              : "-"}
          </div>
        </div>
        <div className="qt-card p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>{t("activeAlerts")}</span>
            {alertActive > 0 && (
              <span className="h-2 w-2 rounded-full bg-[var(--down)] shadow-[0_0_8px_var(--down)]" />
            )}
          </div>
          <div className="text-2xl font-semibold">
            {alertActive}
            <span className="ml-2 text-sm font-normal text-[var(--muted)]">
              / {alertTriggered} {t("triggeredAlerts")}
            </span>
          </div>
        </div>
      </section>

      <section className="qt-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="font-medium">{t("holdings")}</span>
          {loading && <span className="text-xs text-[var(--muted)]">{tCommon("loading")}</span>}
        </div>
        {rows.length === 0 ? (
          <div className="space-y-3 p-6 text-center">
            <p className="text-sm text-[var(--muted)]">{tMarket("watchlistEmpty")}</p>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void seedPopular()}
              className="qt-btn qt-btn-primary px-4 py-2 text-sm disabled:opacity-60"
            >
              {seeding ? tCommon("loading") : t("seedPopular")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
                  <th className="px-4 py-3 font-semibold">{tMarket("symbol")}</th>
                  <th className="px-4 py-3 font-semibold">{tMarket("price")}</th>
                  <th className="px-4 py-3 font-semibold">{tMarket("change")}</th>
                  <th className="px-4 py-3 font-semibold">{tMarket("last24h")}</th>
                  <th className="px-4 py-3 font-semibold">{tMarket("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
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
                            <PriceText value={q.price} />
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {q ? (
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>{up ? "▲" : "▼"}</span>
                            <ChangePct value={q.percentChange} />
                          </span>
                        ) : (
                          "-"
                        )}
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
                        <div className="flex gap-3">
                          <Link
                            href={`/symbol/${item.assetType}/${item.symbol}`}
                            className="text-xs font-bold text-[var(--up)]"
                          >
                            {tMarket("buy")}
                          </Link>
                          <Link
                            href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                            className="text-xs font-bold text-[var(--down)]"
                          >
                            {tMarket("sell")}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="qt-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{tMarket("narrative")}</h2>
            <Link href="/" className="text-xs text-[var(--brand-text)]">
              {tMarket("viewAll")}
            </Link>
          </div>
          <ul className="space-y-3">
            {news.length === 0 && (
              <li className="text-sm text-[var(--muted)]">{tMarket("unavailable")}</li>
            )}
            {news.map((n, i) => (
              <li key={i} className="flex gap-3 border-b border-[var(--border)] pb-3 last:border-0">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
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
                  <div className="mb-1 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                    {n.category || n.source || "MARKET"}
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
          <h2 className="mb-4 font-semibold">{tMarket("sentiment")}</h2>
          {sentiment?.available === false ? (
            <p className="text-sm text-[var(--muted)]">
              {sentiment.message || tMarket("unavailable")}
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
                  <div className="text-xl font-semibold text-[var(--up)]">{bullish.toFixed(0)}%</div>
                  <div className="text-xs uppercase text-[var(--muted)]">{tMarket("bullish")}</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--muted)]">{neutral.toFixed(0)}%</div>
                  <div className="text-xs uppercase text-[var(--muted)]">{tMarket("neutral")}</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-[var(--down)]">{bearish.toFixed(0)}%</div>
                  <div className="text-xs uppercase text-[var(--muted)]">{tMarket("bearish")}</div>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">{tMarket("sentimentHint")}</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
