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
  const router = useRouter();

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {tab === "crypto"
            ? t("titleCrypto")
            : tab === "hk"
              ? t("titleHk")
              : tab === "cn"
                ? t("titleCn")
                : t("titleStock")}
        </h1>
        <p className="text-xs text-[var(--muted)] sm:text-sm">
          {tab === "crypto"
            ? t("descCrypto")
            : tab === "hk"
              ? t("descHk")
              : tab === "cn"
                ? t("descCn")
                : t("descStock")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          value={tab}
          onChange={(key) => {
            onTabChange(key);
            onQueryChange("");
            router.replace(key === "stock" ? "/" : `/?list=${key}`);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1"
          buttonClassName="px-2.5 py-1 text-[11px] font-medium sm:text-xs"
          options={[
            { value: "stock", label: t("stocks") },
            { value: "hk", label: t("hk") },
            { value: "cn", label: t("cn") },
            { value: "crypto", label: t("crypto") },
          ]}
        />

        <div className="relative min-w-[220px] flex-1 sm:flex-none">
          <input
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("search")}
            className="qt-input w-full px-3 py-2 text-xs sm:text-sm"
          />
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
              {results.map((r) => (
                <li key={`${r.assetType}-${r.symbol}`}>
                  <Link
                    href={`/symbol/${r.assetType}/${r.symbol}`}
                    className="block px-3 py-2.5 text-sm hover:bg-[var(--sidebar-hover)]"
                    onClick={() => onQueryChange("")}
                  >
                    <span className="font-semibold">{r.symbol}</span>
                    <span className="ml-2 text-[var(--muted)]">{r.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/watchlist" className="qt-btn qt-btn-primary h-9 px-3 text-xs">
          + {t("addWatch")}
        </Link>
      </div>
    </section>
  );
}
