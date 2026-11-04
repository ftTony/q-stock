"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AccountPageLoading } from "@/components/auth/account-page-fill";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { WatchlistRows } from "@/components/watchlist/watchlist-rows";
import { QtSelect } from "@/components/ui/qt-select";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useSymbolSearch } from "@/hooks/query/use-symbol-search";
import type { AssetType } from "@/lib/types";

type WatchFilter = AssetType | "all";

function WatchlistContent() {
  const t = useTranslations("market");
  const tNav = useTranslations("nav");
  const tWatch = useTranslations("watchlist");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const list = searchParams.get("list");
  const [filter, setFilter] = useState<WatchFilter>(
    list === "crypto" || list === "stock" || list === "hk" || list === "cn"
      ? list
      : "all",
  );
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [addType, setAddType] = useState<AssetType>("stock");

  const filterOptions: { value: WatchFilter; label: string }[] = [
    { value: "all", label: tWatch("filterAll") },
    { value: "cn", label: t("cn") },
    { value: "hk", label: t("hk") },
    { value: "stock", label: t("stocks") },
    { value: "crypto", label: t("crypto") },
  ];

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
    if (filter === "stock" || filter === "hk" || filter === "cn" || filter === "crypto") {
      setAddType(filter);
    }
  }, [filter]);

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

  function marketTag(assetType: AssetType) {
    if (assetType === "hk") return tWatch("tagHk");
    if (assetType === "cn") return tWatch("tagCn");
    if (assetType === "crypto") return tWatch("tagCrypto");
    return tWatch("tagUs");
  }

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
    return <AccountPageLoading />;
  }

  if (!session?.user) {
    return (
      <AuthLoginGate
        fill
        title={tWatch("loginTitle")}
        body={tWatch("loginBody")}
        hint={tWatch("loginHint")}
      />
    );
  }

  const rowLabels = {
    name: tWatch("colName"),
    symbol: t("symbol"),
    price: t("price"),
    change: t("change"),
    last24h: t("last24h"),
    actions: t("actions"),
    buy: t("buy"),
    remove: t("remove"),
    empty: t("watchlistEmpty"),
    seedPopular: t("seedPopular"),
    loading: tCommon("loading"),
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--background)]">
      {/* Desktop title */}
      <header className="hidden shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] pb-3 lg:flex">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {tNav("watchlist")}
          </h1>
          {rows.length > 0 ? (
            <span className="text-[12px] tabular-nums text-[var(--muted)]">
              {visible.length}
              {filter !== "all" ? ` / ${rows.length}` : ""}
            </span>
          ) : null}
        </div>
        <Link
          href="/alerts"
          className="shrink-0 text-[12px] text-[var(--brand-text)] hover:underline"
        >
          {tWatch("manageAlerts")}
        </Link>
      </header>

      {/* H5: market tabs + alerts — terminal chrome */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] lg:static lg:z-auto lg:border-0 lg:bg-transparent">
        <div className="flex items-stretch lg:hidden">
          <div
            className="flex min-w-0 flex-1 gap-0 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
          >
            {filterOptions.map((opt) => {
              const active = filter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`relative shrink-0 px-3 py-2.5 text-[14px] leading-none transition-colors ${
                    active
                      ? "font-semibold text-[var(--brand)]"
                      : "font-normal text-[var(--muted)]"
                  }`}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                  {active ? (
                    <span
                      className="absolute inset-x-2 bottom-0 h-0.5 bg-[var(--brand)]"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <Link
            href="/alerts"
            className="inline-flex shrink-0 items-center gap-1 border-l border-[var(--aw-hairline,var(--border))] px-3 text-[12px] font-medium text-[var(--brand)]"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M12 3a5.5 5.5 0 0 0-5.5 5.5v2.2L5 14.5h14l-1.5-3.8V8.5A5.5 5.5 0 0 0 12 3z" />
              <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" />
            </svg>
            {tWatch("alertsShort")}
          </Link>
        </div>
        <div className="hidden overflow-x-auto py-2 lg:block">
          <SegmentedTabs
            value={filter}
            onChange={setFilter}
            options={filterOptions}
          />
        </div>
      </div>

      {/* Add symbol — desktop only */}
      <div className="relative hidden shrink-0 border-b border-[var(--aw-hairline,var(--border))] pb-2 lg:block lg:px-0">
        <div className="flex items-center gap-2">
          {filter === "all" ? (
            <QtSelect
              value={addType}
              onChange={(v) => setAddType(v as AssetType)}
              className="w-[5.5rem] shrink-0"
              options={[
                { value: "stock", label: t("stocks") },
                { value: "hk", label: t("hk") },
                { value: "cn", label: t("cn") },
                { value: "crypto", label: t("crypto") },
              ]}
            />
          ) : null}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="qt-input h-9 min-w-0 flex-1 px-3 text-[13px] leading-none"
          />
          {mutating ? (
            <span className="shrink-0 text-[11px] text-[var(--muted)]">
              {tCommon("loading")}
            </span>
          ) : null}
        </div>
        {results.length > 0 ? (
          <ul className="absolute inset-x-3 top-full z-20 mt-1 max-h-56 overflow-auto border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_12px_40px_rgba(15,23,42,0.16)] qt-scroll lg:inset-x-0">
            {results.map((r) => (
              <li key={`${r.assetType}-${r.symbol}`}>
                <button
                  type="button"
                  disabled={mutating}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-[var(--sidebar-hover)] disabled:opacity-50"
                  onClick={() => void addSymbol(r.symbol, r.assetType)}
                >
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{r.symbol}</span>
                    <span className="ml-2 text-[11px] text-[var(--muted)]">
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
        ) : null}
      </div>

      {/* List — H5 fills with panel so no empty parchment void */}
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--panel)] qt-scroll lg:mt-3 lg:border lg:border-[var(--aw-hairline,var(--border))]">
        {loading ? (
          <div className="px-4 py-10 text-center text-[13px] text-[var(--muted)]">
            {tCommon("loading")}
          </div>
        ) : null}
        {error ? (
          <div className="space-y-2 px-4 py-6 text-[13px]">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-8 px-3 text-xs"
              onClick={() => void watchlist.refetch()}
            >
              {tCommon("retry")}
            </button>
          </div>
        ) : null}
        {!loading && !error ? (
          <WatchlistRows
            rows={visible}
            onRemove={(id) => void removeItem.mutateAsync(id)}
            onSeed={() => void seedPopular()}
            seeding={addItem.isPending}
            showMarketTag={filter === "all"}
            marketTag={marketTag}
            labels={rowLabels}
          />
        ) : null}
      </section>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[13px] text-[var(--muted)]">
          …
        </div>
      }
    >
      <WatchlistContent />
    </Suspense>
  );
}
