"use client";

import { FormEvent } from "react";
import {
  AiAnalysisPanel,
  type AiTrendAnalysis,
} from "@/components/market/ai-analysis-panel";
import {
  EarningsPanel,
  type EarningsCalendarRow,
  type EarningsMetric,
  type EarningsSurprise,
} from "@/components/market/earnings-panel";
import {
  CompanyProfilePanel,
  OfficersPanel,
} from "@/components/market/company-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { AssetType } from "@/lib/types";

export type SymbolTab =
  | "news"
  | "earnings"
  | "press"
  | "profile"
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

type TabItem = { id: SymbolTab; label: string };

type Props = {
  tabs: TabItem[];
  tab: SymbolTab;
  onTabChange: (id: SymbolTab) => void;
  degraded: boolean;
  degradedLabel: string;
  tabLoading: boolean;
  loadingLabel: string;
  assetType: AssetType;
  isIndex: boolean;
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
};

export function SymbolTabsPanel({
  tabs,
  tab,
  onTabChange,
  degraded,
  degradedLabel,
  tabLoading,
  loadingLabel,
  assetType,
  isIndex,
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
}: Props) {
  return (
    <div className="space-y-4 min-w-0">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 border-b border-[var(--border)]">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-2 text-sm ${
                tab === item.id
                  ? "border-b-2 border-[var(--brand)] font-medium text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {degraded && (
        <p className="text-xs text-[var(--muted)]">{degradedLabel}</p>
      )}

      <div className="qt-panel p-4">
        {tabLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-[var(--muted)]">
            {loadingLabel}
          </div>
        ) : (
          <>
            {tab === "news" && (
              <ul className="space-y-3">
                {news.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">
                    {degraded ? degradedLabel : errorLabel}
                  </li>
                )}
                {news.map((n, i) => (
                  <li key={i} className="border-b border-[var(--border)] pb-3 last:border-0">
                    <a
                      href={n.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-[var(--brand)]"
                    >
                      {n.headline}
                    </a>
                    {n.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {n.summary}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {n.source}
                      {n.datetime
                        ? ` · ${new Date(
                            n.datetime > 1e12 ? n.datetime : n.datetime * 1000,
                          ).toLocaleDateString()}`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "earnings" &&
              (assetType === "crypto" || isIndex ? (
                <p className="text-sm text-[var(--muted)]">{earningsCryptoNa}</p>
              ) : (
                <EarningsPanel
                  surprises={earnings}
                  upcoming={earningsUpcoming}
                  recent={earningsRecent}
                  metrics={earningsMetrics}
                  degraded={degraded}
                  loading={earningsLoading}
                />
              ))}

            {tab === "press" && (
              <ul className="space-y-3">
                {(assetType === "crypto" || isIndex) && (
                  <li className="text-sm text-[var(--muted)]">N/A</li>
                )}
                {press.map((p, i) => (
                  <li key={i} className="border-b border-[var(--border)] pb-3 last:border-0">
                    <a
                      href={p.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-[var(--brand)]"
                    >
                      {p.headline || p.description || "Press release"}
                    </a>
                    {p.description && p.headline && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {p.datetime
                        ? new Date(p.datetime).toLocaleString()
                        : ""}
                      {p.source ? ` · ${p.source}` : ""}
                    </div>
                  </li>
                ))}
                {assetType !== "crypto" && !isIndex && press.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">{degradedLabel}</li>
                )}
              </ul>
            )}

            {tab === "profile" && <CompanyProfilePanel profile={company} />}

            {tab === "officers" && <OfficersPanel officers={officers} />}

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
                          {c.author} · {new Date(c.createdAt).toLocaleString()}
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
              <div className="grid gap-3 sm:grid-cols-2">
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
                        className="rounded-md border border-[var(--border)] p-3 text-sm text-[var(--muted)]"
                      >
                        {key}: N/A
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="rounded-md border border-[var(--border)] p-3 text-sm"
                    >
                      <div className="mb-2 font-medium capitalize">
                        {s.source || key}
                      </div>
                      {s.available === false ? (
                        <p className="text-[var(--muted)]">
                          {s.message || degradedLabel}
                        </p>
                      ) : (
                        <dl className="grid grid-cols-2 gap-2">
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Buzz</dt>
                            <dd>{s.buzz_score?.toFixed?.(1) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Score</dt>
                            <dd>{s.sentiment_score?.toFixed?.(3) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Bullish %</dt>
                            <dd>{s.bullish_pct?.toFixed?.(1) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Trend</dt>
                            <dd>{s.trend ?? "-"}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "ai" && (
              <AiAnalysisPanel
                available={aiAvailable}
                message={aiMessage}
                analysis={aiAnalysis}
                disclaimer={aiDisclaimer}
                cached={aiCached}
                degraded={degraded}
                loading={aiLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
