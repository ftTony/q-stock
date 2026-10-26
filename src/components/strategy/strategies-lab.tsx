"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  StrategyMineCard,
  StrategyTemplateCard,
} from "@/components/strategy/strategy-template-card";
import { PaginatedList } from "@/components/ui/paginated-list";
import {
  useCopyStrategyTemplate,
  useCreateBlankStrategy,
  useStrategiesList,
  useStrategyReplays,
} from "@/hooks/query/use-strategies";
import { DEFAULT_STRATEGY_RULES } from "@/lib/strategy/default-rules";
import {
  localizedTemplateCopy,
  sortTemplatesBySlugOrder,
} from "@/lib/strategy/templates";
import { StrategiesLabIntro } from "@/components/strategy/strategies-lab-intro";
import {
  useStrategiesLabStore,
  type StrategiesLabTab,
} from "@/stores/strategies-lab-store";

const PAGE_TEMPLATES = 8;
const PAGE_MINE = 8;
const PAGE_HISTORY = 8;
const PAGE_SIDEBAR = 8;

const CARD_GRID =
  "grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

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
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const tab = useStrategiesLabStore((s) => s.tab);
  const query = useStrategiesLabStore((s) => s.query);
  const setTab = useStrategiesLabStore((s) => s.setTab);
  const setQuery = useStrategiesLabStore((s) => s.setQuery);
  const [error, setError] = useState<string | null>(null);

  const listQuery = useStrategiesList(locale);
  const replaysQuery = useStrategyReplays(
    Boolean(session?.user) && tab === "history",
  );
  const copyMutation = useCopyStrategyTemplate(locale);
  const createMutation = useCreateBlankStrategy(locale);

  const templates = useMemo(
    () => sortTemplatesBySlugOrder(listQuery.data?.templates ?? []),
    [listQuery.data?.templates],
  );
  const mine = listQuery.data?.strategies ?? [];
  const replays = replaysQuery.data?.replays ?? [];

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((s) => {
      const loc = localizedTemplateCopy(s.slug, locale);
      const name = (loc?.name ?? s.name).toLowerCase();
      const desc = (loc?.description ?? s.description ?? "").toLowerCase();
      return (
        name.includes(q) ||
        desc.includes(q) ||
        (s.slug ?? "").toLowerCase().includes(q)
      );
    });
  }, [templates, query, locale]);

  async function copyTemplate(id: string) {
    if (!session?.user) return;
    setError(null);
    try {
      const data = await copyMutation.mutateAsync(id);
      setTab("mine");
      if (data.strategy?.id) {
        router.push(`/strategies/${data.strategy.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("copyFailed"));
    }
  }

  async function createBlank() {
    if (!session?.user) {
      setError(t("loginHint"));
      setTab("templates");
      return;
    }
    setError(null);
    try {
      const data = await createMutation.mutateAsync({
        name: t("blankStrategyName"),
        description: t("blankStrategyDesc"),
        rules: DEFAULT_STRATEGY_RULES,
      });
      if (data.strategy?.id) {
        router.push(`/strategies/${data.strategy.id}`);
      } else {
        setTab("mine");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createFailed"));
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }

  const creating = createMutation.isPending;
  const copyingId = copyMutation.isPending
    ? (copyMutation.variables ?? null)
    : null;

  return (
    <div className="grid gap-3 lg:min-h-[calc(100dvh-8.5rem)] lg:grid-cols-[260px_minmax(0,1fr)] lg:items-stretch">
      <aside className="hidden min-h-0 rounded-lg border border-[var(--border)] bg-[var(--panel)] lg:flex lg:h-full lg:flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <span className="text-[12px] font-medium">{t("mine")}</span>
          <span className="rounded-full bg-[var(--brand-soft)] px-1.5 text-[10px] tabular-nums text-[var(--brand-text)]">
            {mine.length}
          </span>
        </div>
        <div className="max-h-[40%] min-h-0 shrink-0 overflow-y-auto p-1.5">
          {!session?.user ? (
            <p className="px-2 py-4 text-[11px] leading-relaxed text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : (
            <PaginatedList
              items={mine}
              pageSize={PAGE_SIDEBAR}
              resetKey="sidebar-mine"
              variant="spread"
              listClassName="space-y-0.5"
              empty={
                <p className="px-2 py-4 text-[11px] text-[var(--muted)]">
                  {t("emptyMine")}
                </p>
              }
              renderItem={(s) => (
                <li key={s.id}>
                  <Link
                    href={`/strategies/${s.id}`}
                    className="block rounded-md px-2 py-2 hover:bg-[var(--surface-2)]"
                  >
                    <div className="truncate text-[12px] font-medium">
                      {s.name}
                    </div>
                    {s.updatedAt ? (
                      <div className="mt-0.5 text-[10px] text-[var(--muted)]">
                        {t("updatedOn", { date: formatDate(s.updatedAt) })}
                      </div>
                    ) : null}
                  </Link>
                </li>
              )}
            />
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-[var(--border)] p-2">
          <button
            type="button"
            disabled={creating}
            onClick={() => void createBlank()}
            className="flex h-8 w-full shrink-0 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-[12px] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60"
          >
            + {t("newStrategy")}
          </button>
          <StrategiesLabIntro />
        </div>
      </aside>

      <div className="min-w-0 space-y-2.5 self-start">
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
                onClick={() => setTab(id as StrategiesLabTab)}
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

        <p className="text-[11px] leading-relaxed text-[var(--muted)] sm:text-[12px]">
          {t("disclaimer")}
        </p>

        {error ? (
          <p className="text-sm text-[var(--down)]">{error}</p>
        ) : null}

        {tab === "templates" ? (
          <PaginatedList
            items={filteredTemplates}
            pageSize={PAGE_TEMPLATES}
            resetKey={`templates:${query.trim()}`}
            variant="spread"
            listClassName={CARD_GRID}
            empty={
              <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                {listQuery.isLoading ? t("loading") : t("searchEmpty")}
              </p>
            }
            renderItem={(s) => (
              <StrategyTemplateCard
                key={s.id}
                row={s}
                showCopy={Boolean(session?.user)}
                copyBusy={copyingId === s.id}
                onCopy={() => void copyTemplate(s.id)}
              />
            )}
          />
        ) : null}

        {tab === "mine" ? (
          !session?.user ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : (
            <PaginatedList
              items={mine}
              pageSize={PAGE_MINE}
              resetKey="mine"
              variant="spread"
              listClassName={CARD_GRID}
              empty={
                <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                  {t("emptyMine")}
                </p>
              }
              renderItem={(s) => <StrategyMineCard key={s.id} row={s} />}
            />
          )
        ) : null}

        {tab === "history" ? (
          !session?.user ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
              {t("loginHint")}
            </p>
          ) : (
            <PaginatedList
              items={replays}
              pageSize={PAGE_HISTORY}
              resetKey="history"
              variant="spread"
              listClassName="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]"
              empty={
                <p className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                  {replaysQuery.isLoading ? t("loading") : t("emptyHistory")}
                </p>
              }
              renderItem={(r) => {
                const ret = r.result?.totalReturnPct;
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5 last:border-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/strategies/${r.strategyId}?replayId=${r.id}`}
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
              }}
            />
          )
        ) : null}
      </div>
    </div>
  );
}
