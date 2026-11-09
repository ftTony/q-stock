"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type FillLike = {
  symbol: string;
  assetType: string;
  side: string;
  strategyId?: string | null;
  strategyName?: string | null;
  emotionTags?: string[] | null;
};

/**
 * P2 foundation: surface candidate "if…then…" rule drafts from tagged fills.
 * User must confirm in the lab — nothing is auto-saved.
 */
export function ReviewCandidateRules({ fills }: { fills: FillLike[] }) {
  const t = useTranslations("review");

  const candidates = useMemo(() => {
    const tagged = fills.filter((f) => f.strategyId && f.strategyName);
    if (tagged.length < 2) return [];

    const byStrategy = new Map<
      string,
      { name: string; id: string; count: number; symbols: Set<string> }
    >();
    for (const f of tagged) {
      const id = f.strategyId!;
      const row = byStrategy.get(id) ?? {
        name: f.strategyName!,
        id,
        count: 0,
        symbols: new Set<string>(),
      };
      row.count += 1;
      row.symbols.add(`${f.assetType}:${f.symbol}`);
      byStrategy.set(id, row);
    }

    return [...byStrategy.values()]
      .filter((r) => r.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        name: r.name,
        count: r.count,
        symbolCount: r.symbols.size,
      }));
  }, [fills]);

  if (candidates.length === 0) return null;

  return (
    <section className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-3">
      <h3 className="text-[13px] font-medium text-[var(--foreground)]">
        {t("candidateRulesTitle")}
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
        {t("candidateRulesHint")}
      </p>
      <ul className="mt-2 space-y-2">
        {candidates.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-baseline justify-between gap-2 text-[12px]"
          >
            <span className="min-w-0">
              <span className="font-medium text-[var(--foreground)]">
                {c.name}
              </span>
              <span className="ml-2 text-[var(--muted)]">
                {t("candidateRulesMeta", {
                  fills: c.count,
                  symbols: c.symbolCount,
                })}
              </span>
            </span>
            <Link
              href={`/strategies/${c.id}`}
              className="shrink-0 text-[var(--brand-text)] underline-offset-2 hover:underline"
            >
              {t("candidateRulesOpen")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
