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
import { StrategyLabEmpty } from "@/components/strategy/strategy-lab-empty";
import {
  StrategyLabCardGridSkeleton,
  StrategyLabHistorySkeleton,
} from "@/components/strategy/strategy-lab-skeletons";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useStrategiesLabStore,
  type StrategiesLabTab,
} from "@/stores/strategies-lab-store";
import {
  LAB_TALL_MIN,
  SM_MIN,
  XL_MIN,
  useMinHeight,
  useMinWidth,
} from "@/hooks/use-min-width";

const PAGE_HISTORY = 9;
const PAGE_SIDEBAR = 8;

/** content/items-start: cards keep natural height; pinPager fills space below, not inside cards. */
const CARD_GRID =
  "grid w-full content-start items-start gap-3 sm:grid-cols-2 xl:grid-cols-3";

/** Rows by viewport height; cols follow the card grid breakpoints. */
function useLabCardPageSize(): number {
  const wide = useMinWidth(XL_MIN);
  const sm = useMinWidth(SM_MIN);
  const tall = useMinHeight(LAB_TALL_MIN);
  const cols = wide ? 3 : sm ? 2 : 1;
  const rows = tall ? 4 : 2;
  return cols * rows;
}

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
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const tab = useStrategiesLabStore((s) => s.tab);
  const query = useStrategiesLabStore((s) => s.query);
  const setTab = useStrategiesLabStore((s) => s.setTab);
  const setQuery = useStrategiesLabStore((s) => s.setQuery);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const cardPageSize = useLabCardPageSize();

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

  function requestRemoveMine(id: string) {
    setPendingDeleteId(id);
  }

  async function confirmRemoveMine() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setError(null);
    try {
      await deleteMutation.mutateAsync(id);
      setPendingDeleteId(null);
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
    <div className="flex h-full max-lg:border-t max-lg:border-[var(--border)] lg:gap-3 lg:overflow-hidden">
      {/* Height follows the lab viewport, not the right column’s content. */}
      <aside className="hidden h-full w-[260px] shrink-0 overflow-hidden bg-[var(--panel)] lg:flex lg:flex-col lg:rounded-lg lg:border lg:border-[var(--border)]">
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
                <StrategyLabEmpty
                  art="strategy"
                  label={t("emptyMine")}
                  compact
                  action={
                    <button
                      type="button"
                      onClick={() => setTab("templates")}
                      className="aw-text-link text-[12px]"
                    >
                      {t("emptyMineAction")}
                    </button>
                  }
                />
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
                    onClick={() => requestRemoveMine(s.id)}
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
            className="qt-btn qt-btn-primary h-8 w-full shrink-0 text-[12px] disabled:opacity-60"
          >
            + {t("newStrategy")}
          </button>
          <StrategiesLabIntro />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--panel)] lg:rounded-lg lg:border lg:border-[var(--border)]">
        <div className="flex shrink-0 flex-col gap-2 border-b border-[var(--border)] px-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex flex-wrap items-center gap-0.5">
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
                className={`px-2.5 py-2.5 text-[13px] ${
                  tab === id
                    ? "border-b-2 border-[var(--brand)] font-medium text-[var(--foreground)]"
                    : "border-b-2 border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
                {id === "mine" ? (
                  <span className="ml-1 text-[11px] tabular-nums text-[var(--muted)]">
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
              className="qt-input mb-2 h-8 w-full px-2.5 text-[12px] sm:mb-0 sm:max-w-[16rem]"
            />
          ) : null}
        </div>

        <p className="shrink-0 px-3 pt-2.5 text-[11px] leading-relaxed text-[var(--muted)] sm:px-4 sm:text-[12px]">
          {t("disclaimer")}
        </p>

        {error ? (
          <p className="shrink-0 px-3 text-sm text-[var(--danger)] sm:px-4">
            {error}
          </p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
          {tab === "templates" ? (
            listLoading ? (
              <StrategyLabCardGridSkeleton count={cardPageSize} />
            ) : listError ? (
              <StrategyLabEmpty
                art="strategy"
                label={t("loadFailed")}
                action={
                  <button
                    type="button"
                    className="aw-text-link text-[12px]"
                    onClick={() => void listQuery.refetch()}
                  >
                    {t("retry")}
                  </button>
                }
              />
            ) : (
              <PaginatedList
                items={filteredTemplates}
                pageSize={cardPageSize}
                resetKey={`templates:${query.trim()}:${cardPageSize}`}
                variant="spread"
                pinPager
                listClassName={CARD_GRID}
                empty={
                  <StrategyLabEmpty
                    art="search"
                    label={t("searchEmpty")}
                    action={
                      query.trim() ? (
                        <button
                          type="button"
                          className="aw-text-link text-[12px]"
                          onClick={() => setQuery("")}
                        >
                          {t("searchClear")}
                        </button>
                      ) : null
                    }
                  />
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
              <StrategyLabCardGridSkeleton count={cardPageSize} />
            ) : !session?.user ? (
              <StrategyLabEmpty
                art="auth"
                label={t("loginHint")}
                action={
                  <Link
                    href="/login"
                    className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
                  >
                    {tNav("login")}
                  </Link>
                }
              />
            ) : (
              <PaginatedList
                items={mine}
                pageSize={cardPageSize}
                resetKey={`mine:${cardPageSize}`}
                variant="spread"
                pinPager
                listClassName={CARD_GRID}
                empty={
                  <StrategyLabEmpty
                    art="strategy"
                    label={t("emptyMine")}
                    action={
                      <button
                        type="button"
                        onClick={() => setTab("templates")}
                        className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
                      >
                        {t("emptyMineAction")}
                      </button>
                    }
                  />
                }
                renderItem={(s) => (
                  <StrategyMineCard
                    key={s.id}
                    row={s}
                    deleting={deletingId === s.id}
                    onDelete={() => requestRemoveMine(s.id)}
                  />
                )}
              />
            )
          ) : null}

          {tab === "history" ? (
            status === "loading" ? (
              <StrategyLabHistorySkeleton />
            ) : !session?.user ? (
              <StrategyLabEmpty
                art="auth"
                label={t("loginHint")}
                action={
                  <Link
                    href="/login"
                    className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
                  >
                    {tNav("login")}
                  </Link>
                }
              />
            ) : replaysQuery.isLoading ? (
              <StrategyLabHistorySkeleton />
            ) : replays.length === 0 ? (
              <StrategyLabEmpty
                art="history"
                label={t("emptyHistory")}
                action={
                  <button
                    type="button"
                    onClick={() => setTab(mine.length ? "mine" : "templates")}
                    className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
                  >
                    {mine.length
                      ? t("emptyHistoryActionMine")
                      : t("emptyMineAction")}
                  </button>
                }
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
                <div className="flex min-h-0 min-w-[44rem] flex-1 flex-col border border-[var(--border)]">
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
            )
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm")}
        cancelLabel={t("blockModalCancel")}
        confirmLabel={t("delete")}
        tone="danger"
        busy={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) setPendingDeleteId(null);
        }}
        onConfirm={() => void confirmRemoveMine()}
      />
    </div>
  );
}
