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
  useDeleteStrategy,
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
  StrategyLabHistoryHeader,
  StrategyLabHistoryRow,
} from "@/components/strategy/strategy-lab-history";
import {
  StrategyLabCardGridSkeleton,
  StrategyLabEmptyPanel,
  StrategyLabHistorySkeleton,
} from "@/components/strategy/strategy-lab-skeletons";
import {
  useStrategiesLabStore,
  type StrategiesLabTab,
} from "@/stores/strategies-lab-store";

/** 3 cols × 3 rows on desktop. */
const PAGE_TEMPLATES = 9;
const PAGE_MINE = 9;
const PAGE_HISTORY = 9;
const PAGE_SIDEBAR = 8;

/** content/items-start: cards keep natural height; pinPager fills space below, not inside cards. */
const CARD_GRID =
  "grid w-full content-start items-start gap-3 sm:grid-cols-2 xl:grid-cols-3";

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
  const deleteMutation = useDeleteStrategy(locale);

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

  async function removeMine(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteFailed"));
    }
  }

  const creating = createMutation.isPending;
  const copyingId = copyMutation.isPending
    ? (copyMutation.variables ?? null)
    : null;
  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables ?? null)
    : null;
  const listLoading = status === "loading" || listQuery.isLoading;
  const listError = listQuery.isError;

  return (
    <div className="flex h-full gap-3 lg:overflow-hidden">
      {/* Height follows the lab viewport, not the right column’s content. */}
      <aside className="hidden h-full w-[260px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] lg:flex lg:flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <span className="text-[12px] font-medium">{t("mine")}</span>
          <span className="rounded-full bg-[var(--brand-soft)] px-1.5 text-[10px] tabular-nums text-[var(--brand-text)]">
            {mine.length}
          </span>
        </div>
        <div className="max-h-[36%] min-h-0 shrink-0 overflow-y-auto p-1.5">
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
                <li
                  key={s.id}
                  className="group flex items-stretch rounded-md hover:bg-[var(--surface-2)]"
                >
                  <Link
                    href={`/strategies/${s.id}`}
                    className="min-w-0 flex-1 px-2 py-2"
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
                  <button
                    type="button"
                    disabled={deletingId === s.id}
                    title={t("delete")}
                    aria-label={t("delete")}
                    onClick={() => void removeMine(s.id)}
                    className="flex w-9 shrink-0 items-center justify-center self-stretch text-[var(--muted)] opacity-0 hover:text-[var(--down)] group-hover:opacity-100 disabled:opacity-40"
                  >
                    {deletingId === s.id ? (
                      <span className="text-[11px]">…</span>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M4 7h16" />
                        <path d="M9 7V5h6v2" />
                        <path d="M7 7l1 12h8l1-12" />
                      </svg>
                    )}
                  </button>
                </li>
              )}
            />
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden border-t border-[var(--border)] p-2">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 overflow-hidden">
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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

        <p className="shrink-0 text-[11px] leading-relaxed text-[var(--muted)] sm:text-[12px]">
          {t("disclaimer")}
        </p>

        {error ? (
          <p className="shrink-0 text-sm text-[var(--down)]">{error}</p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          {tab === "templates" ? (
            listLoading ? (
              <StrategyLabCardGridSkeleton />
            ) : listError ? (
              <StrategyLabEmptyPanel>
                <span className="block">{t("loadFailed")}</span>
                <button
                  type="button"
                  className="mt-3 text-[12px] font-medium text-[var(--brand-text)] hover:underline"
                  onClick={() => void listQuery.refetch()}
                >
                  {t("retry")}
                </button>
              </StrategyLabEmptyPanel>
            ) : (
              <PaginatedList
                items={filteredTemplates}
                pageSize={PAGE_TEMPLATES}
                resetKey={`templates:${query.trim()}`}
                variant="spread"
                pinPager
                listClassName={CARD_GRID}
                empty={
                  <StrategyLabEmptyPanel>{t("searchEmpty")}</StrategyLabEmptyPanel>
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
            )
          ) : null}

          {tab === "mine" ? (
            status === "loading" || listLoading ? (
              <StrategyLabCardGridSkeleton count={6} />
            ) : !session?.user ? (
              <StrategyLabEmptyPanel>{t("loginHint")}</StrategyLabEmptyPanel>
            ) : (
              <PaginatedList
                items={mine}
                pageSize={PAGE_MINE}
                resetKey="mine"
                variant="spread"
                pinPager
                listClassName={CARD_GRID}
                empty={
                  <StrategyLabEmptyPanel>{t("emptyMine")}</StrategyLabEmptyPanel>
                }
                renderItem={(s) => (
                  <StrategyMineCard
                    key={s.id}
                    row={s}
                    deleting={deletingId === s.id}
                    onDelete={() => void removeMine(s.id)}
                  />
                )}
              />
            )
          ) : null}

          {tab === "history" ? (
            status === "loading" ? (
              <StrategyLabHistorySkeleton />
            ) : !session?.user ? (
              <StrategyLabEmptyPanel>{t("loginHint")}</StrategyLabEmptyPanel>
            ) : replaysQuery.isLoading ? (
              <StrategyLabHistorySkeleton />
            ) : replays.length === 0 ? (
              <StrategyLabEmptyPanel>
                {t("emptyHistory")}
              </StrategyLabEmptyPanel>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
                  <div className="flex min-h-0 min-w-[44rem] flex-1 flex-col">
                    <StrategyLabHistoryHeader />
                    <PaginatedList
                      items={replays}
                      pageSize={PAGE_HISTORY}
                      resetKey="history"
                      variant="spread"
                      pinPager
                      listClassName=""
                      renderItem={(r) => (
                        <StrategyLabHistoryRow key={r.id} row={r} />
                      )}
                    />
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
