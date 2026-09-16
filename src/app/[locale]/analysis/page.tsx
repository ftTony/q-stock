"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

export default function AnalysisPage() {
  const t = useTranslations("market");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState<AssetType>("stock");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/quotes?popular=1&assetType=${tab}`);
      const data = await res.json();
      if (!cancelled) {
        setQuotes(data.quotes ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {tNav("analysis")}
        </h1>
        <p className="text-sm text-[var(--muted)]">{t("descStock")}</p>
      </section>

      <div className="flex rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 w-fit">
        {(["stock", "crypto"] as AssetType[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === key
                ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                : "text-[var(--muted)]"
            }`}
          >
            {key === "stock" ? t("stocks") : t("crypto")}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading && (
          <div className="qt-panel col-span-full p-8 text-sm text-[var(--muted)]">
            {tCommon("loading")}
          </div>
        )}
        {!loading &&
          quotes.map((q) => (
            <Link
              key={q.symbol}
              href={`/symbol/${q.assetType}/${q.symbol}`}
              className="qt-card group p-4 transition hover:border-[var(--brand)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-bold text-[var(--brand-text)]">
                  {q.symbol.slice(0, 2)}
                </span>
                <div>
                  <div className="font-semibold">{q.symbol}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {displayName(q.symbol, q.assetType)}
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-semibold tabular-nums">
                  $<PriceText value={q.price} />
                </div>
                <ChangePct value={q.percentChange} />
              </div>
              <div className="mt-3 text-xs font-semibold text-[var(--brand-text)] opacity-0 transition group-hover:opacity-100">
                {t("view")} →
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
