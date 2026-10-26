"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useSymbolSearch } from "@/hooks/query/use-symbol-search";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

function WatchlistContent() {
  const t = useTranslations("market");
  const tNav = useTranslations("nav");
  const tWatch = useTranslations("watchlist");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const list = searchParams.get("list");
  const [filter, setFilter] = useState<AssetType | "all">(
    list === "crypto" || list === "stock" || list === "hk" || list === "cn"
      ? list
      : "all",
  );
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [addType, setAddType] = useState<AssetType>("stock");

  const signedIn = Boolean(session?.user);
  const watchlist = useWatchlist({
    quotes: true,
    enabled: signedIn,
    refetchInterval: signedIn ? 45_000 : false,
  });
  const addItem = useAddWatchlistItem();
  const removeItem = useRemoveWatchlistItem();
  const search = useSymbolSearch(debouncedQ, addType, signedIn);

  useEffect(() => {
    if (list === "crypto" || list === "stock" || list === "hk" || list === "cn") {
      setFilter(list);
    }
  }, [list]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(handle);
  }, [q]);

  const rows = watchlist.data?.items ?? [];
  const results = search.data?.results ?? [];
  const loading = watchlist.isLoading;
  const error =
    watchlist.error instanceof Error
      ? watchlist.error.message
      : watchlist.error
        ? tCommon("error")
        : null;
  const mutating = addItem.isPending || removeItem.isPending;

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.assetType === filter)),
    [rows, filter],
  );

  const descKey =
    filter === "hk"
      ? "descHk"
      : filter === "cn"
        ? "descCn"
        : filter === "crypto"
          ? "descCrypto"
          : "descStock";

  async function seedPopular() {
    const list =
      filter === "crypto"
        ? ["BTC", "ETH", "SOL", "BNB"]
        : filter === "hk"
          ? ["00700", "09988", "03690", "01810"]
          : filter === "cn"
            ? ["600519.SH", "000001.SZ", "300750.SZ", "000858.SZ"]
            : ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN"];
    const assetType: AssetType =
      filter === "crypto"
        ? "crypto"
        : filter === "hk"
          ? "hk"
          : filter === "cn"
            ? "cn"
            : "stock";
    await Promise.all(
      list.map((symbol) => addItem.mutateAsync({ symbol, assetType })),
    );
  }

  async function addSymbol(symbol: string, assetType: AssetType) {
    await addItem.mutateAsync({ symbol, assetType });
    setQ("");
    setDebouncedQ("");
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <AuthLoginGate
        title={tWatch("loginTitle")}
        body={tWatch("loginBody")}
        hint={tWatch("loginHint")}
      />
    );
  }

  return (
    <div className="space-y-4 animate-[qtFade_0.45s_ease]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {tNav("watchlist")}
            </h1>
            {rows.length > 0 && (
              <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-xs tabular-nums text-[var(--muted)]">
                {visible.length}
                {filter !== "all" ? ` / ${rows.length}` : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] sm:text-sm">{t(descKey)}</p>
          <Link
            href="/alerts"
            className="mt-1.5 inline-block text-[12px] text-[var(--brand-text)] hover:underline"
          >
            {tWatch("manageAlerts")} →
          </Link>
        </div>
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("popular") },
            { value: "stock", label: t("stocks") },
            { value: "hk", label: t("hk") },
            { value: "cn", label: t("cn") },
            { value: "crypto", label: t("crypto") },
          ]}
        />
      </header>

      <section className="qt-panel relative p-3">
        <div className="flex w-full max-w-2xl items-center gap-2 xl:max-w-3xl">
          <QtSelect
            value={addType}
            onChange={(v) => setAddType(v as AssetType)}
            className="w-[7.5rem] shrink-0"
            options={[
              { value: "stock", label: t("stocks") },
              { value: "hk", label: t("hk") },
              { value: "cn", label: t("cn") },
              { value: "crypto", label: t("crypto") },
            ]}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="qt-input h-9 min-w-0 flex-1 px-3 text-sm leading-none"
          />
          {mutating && (
            <span className="shrink-0 text-xs text-[var(--muted)]">
              {tCommon("loading")}
            </span>
          )}
        </div>
        {results.length > 0 && (
          <ul className="absolute left-3 top-[calc(100%-0.25rem)] z-20 max-h-56 w-[min(100%-1.5rem,36rem)] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-xl qt-scroll">
            {results.map((r) => (
              <li key={`${r.assetType}-${r.symbol}`}>
                <button
                  type="button"
                  disabled={mutating}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--sidebar-hover)] disabled:opacity-50"
                  onClick={() => void addSymbol(r.symbol, r.assetType)}
                >
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{r.symbol}</span>
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {r.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--brand-text)]">
                    + {t("addWatch")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="qt-panel overflow-hidden">
        {loading && (
          <div className="px-4 py-8 text-sm text-[var(--muted)]">
            {tCommon("loading")}
          </div>
        )}
        {error && (
          <div className="space-y-2 px-4 py-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-8 px-3 text-xs"
              onClick={() => void watchlist.refetch()}
            >
              {tCommon("retry")}
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-2.5 font-medium">{t("symbol")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("price")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("change")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("last24h")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const quote = item.quote;
                  const up = (quote?.percentChange ?? 0) >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/symbol/${item.assetType}/${item.symbol}`}
                          className="flex items-center gap-2.5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--brand-text)]">
                            {item.symbol.slice(0, 2)}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold leading-tight">
                              {item.symbol}
                            </span>
                            <span className="block truncate text-[11px] text-[var(--muted)]">
                              {displayName(item.symbol, item.assetType)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-medium tabular-nums">
                        {quote ? (
                          <>
                            $
                            <PriceText
                              value={quote.price}
                              change={quote.percentChange}
                            />
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {quote ? <ChangePct value={quote.percentChange} /> : "-"}
                      </td>
                      <td className="px-4 py-2.5">
                        {quote ? (
                          <Sparkline
                            open={quote.open}
                            high={quote.high}
                            low={quote.low}
                            close={quote.price}
                            up={up}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/symbol/${item.assetType}/${item.symbol}`}
                            className="qt-link-up text-xs font-medium hover:opacity-80"
                          >
                            {t("buy")}
                          </Link>
                          <button
                            type="button"
                            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--down)]"
                            onClick={() => void removeItem.mutateAsync(item.id)}
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
                    <td colSpan={5} className="px-4 py-8 text-center sm:py-10">
                      <p className="mb-3 text-sm text-[var(--muted)] sm:text-[15px]">
                        {t("watchlistEmpty")}
                      </p>
                      <SubmitButton
                        type="button"
                        loading={addItem.isPending}
                        loadingLabel={tCommon("loading")}
                        onClick={() => void seedPopular()}
                        className="qt-btn-primary h-10 px-4 text-sm font-medium"
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
    <Suspense
      fallback={
        <div className="qt-panel p-6 text-sm text-[var(--muted)]">…</div>
      }
    >
      <WatchlistContent />
    </Suspense>
  );
}
