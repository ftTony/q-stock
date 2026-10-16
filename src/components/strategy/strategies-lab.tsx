"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  StrategyMineCard,
  StrategyTemplateCard,
} from "@/components/strategy/strategy-template-card";
import { sortTemplatesBySlugOrder } from "@/lib/strategy/templates";

type StrategyRow = {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  slug: string | null;
  updatedAt?: string;
};

type ReplayRow = {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  assetType: string;
  status: string;
  createdAt: string;
  result?: { totalReturnPct?: number } | null;
};

type Tab = "templates" | "mine" | "history";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function StrategiesLab() {
  const t = useTranslations("strategies");
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<StrategyRow[]>([]);
  const [mine, setMine] = useState<StrategyRow[]>([]);
  const [replays, setReplays] = useState<ReplayRow[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/strategies");
    if (!res.ok) return;
    const data = await res.json();
    setTemplates(sortTemplatesBySlugOrder(data.templates ?? []));
    setMine(data.strategies ?? []);
  }, []);

  const loadReplays = useCallback(async () => {
    if (!session?.user) {
      setReplays([]);
      return;
    }
    const res = await fetch("/api/strategies/replays");
    if (!res.ok) return;
    const data = await res.json();
    setReplays(data.replays ?? []);
  }, [session?.user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (tab === "history") void loadReplays();
  }, [tab, loadReplays]);

  async function copyTemplate(id: string) {
    if (!session?.user) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromTemplateId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("copyFailed"));
        return;
      }
      await load();
      setTab("mine");
    } finally {
      setBusy(null);
    }
  }

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        (s.slug ?? "").toLowerCase().includes(q),
    );
  }, [templates, query]);

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] lg:flex lg:flex-col lg:min-h-[28rem]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <span className="text-[12px] font-medium">{t("mine")}</span>
          <span className="rounded-full bg-[var(--brand-soft)] px-1.5 text-[10px] tabular-nums text-[var(--brand-text)]">
            {mine.length}
          </span>
        </div>
        <div className="qt-scroll flex-1 space-y-0.5 overflow-y-auto p-1.5">
          {!session?.user ? (
            <p className="px-2 py-4 text-[11px] leading-relaxed text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : mine.length === 0 ? (
            <p className="px-2 py-4 text-[11px] text-[var(--muted)]">
              {t("emptyMine")}
            </p>
          ) : (
            mine.map((s) => (
              <Link
                key={s.id}
                href={`/strategies/${s.id}`}
                className="block rounded-md px-2 py-2 hover:bg-[var(--surface-2)]"
              >
                <div className="truncate text-[12px] font-medium">{s.name}</div>
                {s.updatedAt ? (
                  <div className="mt-0.5 text-[10px] text-[var(--muted)]">
                    {t("updatedOn", { date: formatDate(s.updatedAt) })}
                  </div>
                ) : null}
              </Link>
            ))
          )}
        </div>
        <div className="space-y-2 border-t border-[var(--border)] p-2">
          <button
            type="button"
            onClick={() => setTab("templates")}
            className="flex h-8 w-full items-center justify-center rounded-md border border-dashed border-[var(--border)] text-[12px] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-text)]"
          >
            + {t("newStrategy")}
          </button>
          <div className="rounded-md bg-[var(--surface-2)] px-2.5 py-2">
            <div className="text-[11px] font-medium">{t("introTitle")}</div>
            <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
              {t("introBody")}
            </p>
            <Link
              href="/learn/checklist-three"
              className="mt-1.5 inline-block text-[11px] text-[var(--brand-text)] hover:underline"
            >
              {t("introLink")} →
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] sm:border-0">
            {(
              [
                ["templates", t("templates")],
                ["mine", t("mine")],
                ["history", t("history")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3 py-2 text-[13px] ${
                  tab === id
                    ? "border-b-2 border-[var(--brand)] font-medium text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
                {id === "mine" ? (
                  <span className="ml-1 text-[11px] text-[var(--muted)]">
                    {mine.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {tab === "templates" ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] px-2.5 text-[12px] sm:max-w-[16rem]"
            />
          ) : null}
        </div>

        <p className="text-[12px] leading-relaxed text-[var(--muted)]">
          {t("disclaimer")}
        </p>

        {error ? (
          <p className="text-sm text-[var(--down)]">{error}</p>
        ) : null}

        {tab === "templates" ? (
          filteredTemplates.length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {templates.length === 0 ? t("loading") : t("searchEmpty")}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filteredTemplates.map((s) => (
                <StrategyTemplateCard
                  key={s.id}
                  row={s}
                  showCopy={Boolean(session?.user)}
                  copyBusy={busy === s.id}
                  onCopy={() => void copyTemplate(s.id)}
                />
              ))}
            </ul>
          )
        ) : null}

        {tab === "mine" ? (
          !session?.user ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : mine.length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("emptyMine")}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {mine.map((s) => (
                <StrategyMineCard key={s.id} row={s} />
              ))}
            </ul>
          )
        ) : null}

        {tab === "history" ? (
          !session?.user ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : replays.length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("emptyHistory")}
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
              {replays.map((r) => {
                const ret = r.result?.totalReturnPct;
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5 last:border-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/strategies/${r.strategyId}`}
                        className="text-[13px] font-medium hover:text-[var(--brand-text)]"
                      >
                        {r.strategyName}
                      </Link>
                      <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                        {r.symbol} · {r.status} · {formatDate(r.createdAt)}
                      </div>
                    </div>
                    {typeof ret === "number" ? (
                      <span
                        className={`text-[12px] tabular-nums ${
                          ret >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                        }`}
                      >
                        {ret >= 0 ? "+" : ""}
                        {ret.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--muted)]">
                        {r.status}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        ) : null}
      </div>
    </div>
  );
}
