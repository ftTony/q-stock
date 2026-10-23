"use client";

import dynamic from "next/dynamic";
import { FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AiQuotaBadge } from "@/components/ai/ai-quota-badge";
import {
  AiAnalysisPanel,
  type AiTrendAnalysis,
} from "@/components/market/ai-analysis-panel";
import type {
  EarningsCalendarRow,
  EarningsMetric,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import { PaginatedList } from "@/components/ui/paginated-list";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import { formatDate, formatDateTime } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";

const SymbolDerivativesPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-derivatives-panel").then((m) => ({
      default: m.SymbolDerivativesPanel,
    })),
  { ssr: false },
);

const SymbolFundamentalsPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-fundamentals-panel").then((m) => ({
      default: m.SymbolFundamentalsPanel,
    })),
  { ssr: false },
);

export type SymbolTab =
  | "chart"
  | "overview"
  | "derivatives"
  | "funds"
  | "short"
  | "chips"
  | "news"
  | "earnings"
  | "press"
  | "profile"
  | "fundamentals"
  | "officers"
  | "comments"
  | "sentiment"
  | "ai";

export type NewsRow = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
};

export type PressRow = {
  headline?: string;
  datetime?: string;
  url?: string;
  description?: string;
  source?: string;
};

export type CommentRow = {
  id: string;
  content: string;
  author: string;
  userId: string;
  createdAt: string;
};

type Props = {
  tab: SymbolTab;
  /** Rendered when active tab is `chart` (main workbench chart). */
  chartSlot?: ReactNode;
  degraded: boolean;
  degradedLabel: string;
  tabLoading: boolean;
  loadingLabel: string;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  lastPrice?: number | null;
  news: NewsRow[];
  press: PressRow[];
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsLoading: boolean;
  earningsCryptoNa: string;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
  comments: CommentRow[];
  commentText: string;
  onCommentTextChange: (v: string) => void;
  onPostComment: (e: FormEvent) => void;
  onDeleteComment: (id: string) => void;
  commentBusy: boolean;
  canComment: boolean;
  currentUserId?: string;
  commentsPlaceholder: string;
  commentsPost: string;
  commentsLoginRequired: string;
  commentsEmpty: string;
  commentsDelete: string;
  errorLabel: string;
  sentiment: {
    news?: Record<string, unknown>;
    reddit?: Record<string, unknown>;
  } | null;
  aiAvailable: boolean | null;
  aiMessage: string | null;
  aiAnalysis: AiTrendAnalysis | null;
  aiDisclaimer: string | null;
  aiCached: boolean;
  aiLoading: boolean;
  /** True only while user clicked regenerate (not initial load). */
  aiRefreshing?: boolean;
  aiToast?: string | null;
  aiToastKey?: number;
  onClearAiToast?: () => void;
  onRegenerateAi?: () => void;
  aiRegenerateLabel?: string;
};

export function SymbolTabsPanel({
  tab,
  chartSlot,
  degraded,
  degradedLabel,
  tabLoading,
  loadingLabel,
  symbol,
  assetType,
  isIndex,
  lastPrice = null,
  news,
  press,
  earnings,
  earningsUpcoming,
  earningsRecent,
  earningsMetrics,
  earningsLoading,
  earningsCryptoNa,
  company,
  officers,
  comments,
  commentText,
  onCommentTextChange,
  onPostComment,
  onDeleteComment,
  commentBusy,
  canComment,
  currentUserId,
  commentsPlaceholder,
  commentsPost,
  commentsLoginRequired,
  commentsEmpty,
  commentsDelete,
  errorLabel,
  sentiment,
  aiAvailable,
  aiMessage,
  aiAnalysis,
  aiDisclaimer,
  aiCached,
  aiLoading,
  aiRefreshing = false,
  aiToast,
  aiToastKey,
  onClearAiToast,
  onRegenerateAi,
  aiRegenerateLabel,
}: Props) {
  const tAi = useTranslations("ai");

  return (
    <div className="aw-surface-flush flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--aw-canvas,#fff)]">
      {degraded && tab !== "chart" ? (
        <p className="aw-caption shrink-0 px-4 pt-3 sm:px-5">{degradedLabel}</p>
      ) : null}

      {tab === "chart" && chartSlot ? (
        <div className="aw-tab-chart min-h-0 flex-1 overflow-hidden">{chartSlot}</div>
      ) : (
      <div
        className={
          tab === "news"
            ? "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:p-5 [&::-webkit-scrollbar]:hidden"
            : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 qt-scroll sm:p-5"
        }
      >
        {tabLoading ? (
          <div className="flex h-40 items-center justify-center text-[12px] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
            {loadingLabel}
          </div>
        ) : (
          <>
            {tab === "derivatives" && (
              <SymbolDerivativesPanel
                symbol={symbol}
                assetType={assetType}
                lastPrice={lastPrice}
              />
            )}
            {tab === "news" && (
              <PaginatedList
                items={news}
                pageSize={8}
                resetKey={`news-${news.length}-${news[0]?.headline ?? ""}`}
                empty={
                  <p className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                    {degraded ? degradedLabel : errorLabel}
                  </p>
                }
                renderItem={(n, i) => (
                  <li
                    key={`${n.url || n.headline}-${i}`}
                    className="space-y-1 border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-0"
                  >
                    <a
                      href={n.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[var(--aw-ink,var(--foreground))] hover:text-[var(--aw-primary,var(--brand))]"
                    >
                      {n.headline}
                    </a>
                    {n.summary && (
                      <p className="line-clamp-2 text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                        {n.summary}
                      </p>
                    )}
                    <div className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                      {n.source}
                      {n.datetime
                        ? ` · ${formatDate(
                            n.datetime > 1e12 ? n.datetime : n.datetime * 1000,
                          )}`
                        : ""}
                    </div>
                  </li>
                )}
              />
            )}

            {tab === "fundamentals" &&
              (assetType === "crypto" || isIndex ? (
                <p className="text-[12px] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                  {earningsCryptoNa}
                </p>
              ) : (
                <SymbolFundamentalsPanel
                  earnings={earnings}
                  earningsUpcoming={earningsUpcoming}
                  earningsRecent={earningsRecent}
                  earningsMetrics={earningsMetrics}
                  earningsLoading={earningsLoading}
                  degraded={degraded}
                  company={company}
                  officers={officers}
                />
              ))}

            {tab === "press" &&
              (assetType === "crypto" || isIndex ? (
                <p className="text-[12px] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                  N/A
                </p>
              ) : (
                <PaginatedList
                  items={press}
                  pageSize={8}
                  resetKey={`press-${press.length}-${press[0]?.headline ?? ""}`}
                  empty={
                    <p className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                      {degradedLabel}
                    </p>
                  }
                  renderItem={(p, i) => (
                    <li
                      key={`${p.url || p.headline}-${i}`}
                      className="space-y-1 border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-0"
                    >
                      <a
                        href={p.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[var(--aw-ink,var(--foreground))] hover:text-[var(--aw-primary,var(--brand))]"
                      >
                        {p.headline || p.description || "Press release"}
                      </a>
                      {p.description && p.headline && (
                        <p className="line-clamp-2 text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                          {p.description}
                        </p>
                      )}
                      <div className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                        {p.datetime ? formatDateTime(p.datetime) : ""}
                        {p.source ? ` · ${p.source}` : ""}
                      </div>
                    </li>
                  )}
                />
              ))}

            {tab === "comments" && (
              <div className="space-y-3">
                {canComment ? (
                  <form onSubmit={onPostComment} className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => onCommentTextChange(e.target.value)}
                      placeholder={commentsPlaceholder}
                      className="flex-1 qt-input px-3 py-2 text-sm"
                    />
                    <SubmitButton
                      type="submit"
                      loading={commentBusy}
                      loadingLabel={loadingLabel}
                      className="qt-btn-primary px-3 py-2 text-sm"
                    >
                      {commentsPost}
                    </SubmitButton>
                  </form>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    {commentsLoginRequired}
                  </p>
                )}
                <ul className="space-y-3">
                  {comments.length === 0 && (
                    <li className="text-sm text-[var(--muted)]">
                      {commentsEmpty}
                    </li>
                  )}
                  {comments.map((c) => (
                    <li key={c.id} className="border-b border-[var(--border)] pb-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                        <span>
                          {c.author} · {formatDateTime(c.createdAt)}
                        </span>
                        {currentUserId === c.userId && (
                          <button
                            type="button"
                            className="text-[var(--down)]"
                            onClick={() => void onDeleteComment(c.id)}
                          >
                            {commentsDelete}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "sentiment" && (
              <div className="grid gap-0 divide-y divide-[var(--aw-hairline,var(--border))] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {(["news", "reddit"] as const).map((key) => {
                  const s = sentiment?.[key] as
                    | {
                        available?: boolean;
                        message?: string;
                        buzz_score?: number;
                        sentiment_score?: number;
                        bullish_pct?: number;
                        bearish_pct?: number;
                        trend?: string | null;
                        source?: string;
                      }
                    | undefined;
                  if (!s) {
                    return (
                      <div
                        key={key}
                        className="py-4 text-[12px] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))] first:pt-0 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                      >
                        {key}: N/A
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="space-y-3 py-4 first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                    >
                      <div className="text-[14px] font-semibold capitalize leading-[1.29] tracking-[-0.224px] text-[var(--aw-ink,var(--foreground))]">
                        {s.source || key}
                      </div>
                      {s.available === false ? (
                        <p className="text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                          {s.message || degradedLabel}
                        </p>
                      ) : (
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="space-y-1">
                            <dt className="aw-metric-label">
                              Buzz
                            </dt>
                            <dd className="text-[13px] font-medium tabular-nums tracking-[-0.08px]">
                              {s.buzz_score?.toFixed?.(1) ?? "-"}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="aw-metric-label">
                              Score
                            </dt>
                            <dd className="text-[13px] font-medium tabular-nums tracking-[-0.08px]">
                              {s.sentiment_score?.toFixed?.(3) ?? "-"}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="aw-metric-label">
                              Bullish %
                            </dt>
                            <dd className="text-[13px] font-medium tabular-nums tracking-[-0.08px]">
                              {s.bullish_pct?.toFixed?.(1) ?? "-"}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="aw-metric-label">
                              Trend
                            </dt>
                            <dd className="text-[13px] font-medium tracking-[-0.08px]">
                              {s.trend ?? "-"}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "ai" && (
              <div className="space-y-3">
                <TopToast
                  key={aiToastKey ?? 0}
                  message={aiToast ?? null}
                  tone="error"
                  onDismiss={onClearAiToast}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <AiQuotaBadge />
                  {onRegenerateAi &&
                  aiRegenerateLabel &&
                  (aiAnalysis || !aiLoading) ? (
                    <SubmitButton
                      type="button"
                      loading={aiRefreshing}
                      showElapsed={(s) => tAi("elapsed", { seconds: s })}
                      onClick={() => onRegenerateAi()}
                      className="qt-btn-ghost border border-[var(--border)] px-3 py-1.5"
                    >
                      {aiRegenerateLabel}
                    </SubmitButton>
                  ) : null}
                </div>
                <AiAnalysisPanel
                  available={aiAvailable}
                  message={aiMessage}
                  analysis={aiAnalysis}
                  disclaimer={aiDisclaimer}
                  cached={aiCached}
                  degraded={degraded}
                  loading={aiLoading && !aiAnalysis && !aiRefreshing}
                />
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
}
