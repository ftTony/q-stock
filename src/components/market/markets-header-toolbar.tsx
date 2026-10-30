"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { AssetType } from "@/lib/types";

type Tab = AssetType;

type SearchResult = {
  symbol: string;
  description: string;
  assetType: AssetType;
};

type Props = {
  tab: Tab;
  q: string;
  results: SearchResult[];
  onTabChange: (tab: Tab) => void;
  onQueryChange: (q: string) => void;
};

export function MarketsHeaderToolbar({
  tab,
  q,
  results,
  onTabChange,
  onQueryChange,
}: Props) {
  const t = useTranslations("market");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const title =
    tab === "crypto"
      ? t("titleCrypto")
      : tab === "hk"
        ? t("titleHk")
        : tab === "cn"
          ? t("titleCn")
          : t("titleStock");
  const desc =
    tab === "crypto"
      ? t("descCrypto")
      : tab === "hk"
        ? t("descHk")
        : tab === "cn"
          ? t("descCn")
          : t("descStock");

  const headerBtn =
    "qt-btn inline-flex h-8 items-center justify-center px-3 text-[13px] font-medium leading-none";

  return (
    <section className="flex flex-col gap-3 px-3 pt-3 sm:flex-row sm:items-center sm:justify-between lg:px-0 lg:pt-0">
      <div className="min-w-0 space-y-1">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h1>
        <p className="max-w-2xl text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
          {desc}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          value={tab}
          onChange={(key) => {
            onTabChange(key);
            onQueryChange("");
            router.replace(
              key === "stock" ? "/markets" : `/markets?list=${key}`,
            );
          }}
          className="rounded-none border border-[var(--border)] bg-[var(--panel)] p-0.5"
          indicatorClassName="bg-[var(--brand-soft)]"
          activeTextClassName="text-[var(--brand-text)]"
          buttonClassName="px-2.5 py-1.5 text-[11px] font-medium sm:text-xs"
          options={[
            { value: "stock", label: t("stocks") },
            { value: "hk", label: t("hk") },
            { value: "cn", label: t("cn") },
            { value: "crypto", label: t("crypto") },
          ]}
        />

        <div className="relative min-w-[200px] flex-1 sm:flex-none sm:w-56">
          <input
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("search")}
            className="qt-input h-8 w-full px-3 text-xs sm:text-[13px]"
          />
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-xl qt-scroll">
              {results.map((r) => (
                <li key={`${r.assetType}-${r.symbol}`}>
                  <Link
                    href={`/symbol/${r.assetType}/${r.symbol}`}
                    className="block px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]"
                    onClick={() => onQueryChange("")}
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

        <Link href="/watchlist" className={`${headerBtn} qt-btn-ghost`}>
          {tNav("watchlist")}
        </Link>
      </div>
    </section>
  );
}
