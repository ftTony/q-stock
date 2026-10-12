"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import type { LearnCategory } from "@/lib/learn/types";

export type LearnArticleCard = {
  slug: string;
  category: LearnCategory;
  categoryLabel: string;
  title: string;
  summary: string;
};

export type LearnListLabels = {
  filterAll: string;
  emptyFilter: string;
  categories: Record<LearnCategory, string>;
};

const FILTERS: Array<LearnCategory | "all"> = [
  "all",
  "basics",
  "tools",
  "mindset",
  "reading",
];

export function LearnArticleList({
  articles,
  labels,
}: {
  articles: LearnArticleCard[];
  labels: LearnListLabels;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const visible = useMemo(() => {
    if (filter === "all") return articles;
    return articles.filter((a) => a.category === filter);
  }, [articles, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((key) => {
          const active = filter === key;
          const label =
            key === "all" ? labels.filterAll : labels.categories[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-[var(--brand)] text-white"
                  : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="qt-panel block h-full p-4 transition-colors hover:border-[var(--brand)]/40"
            >
              <p className="text-[11px] font-medium tracking-wide text-[var(--muted)]">
                {article.categoryLabel}
              </p>
              <h2 className="mt-1.5 text-sm font-semibold tracking-tight sm:text-base">
                {article.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
                {article.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{labels.emptyFilter}</p>
      ) : null}
    </div>
  );
}
