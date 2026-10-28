"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/format-number";
import type { CommentRow } from "@/components/symbol/tabs/symbol-tabs-panel";

type Props = {
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
  commentsEmpty: string;
  commentsDelete: string;
  tabLoading: boolean;
  loadingLabel: string;
};

function EmptyCommentsArt() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="h-14 w-auto text-[var(--brand)]"
      aria-hidden
    >
      <rect
        x="28"
        y="16"
        width="88"
        height="52"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M48 68h18l-8 14z"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <path
        d="M42 34h60M42 46h44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <rect
        x="72"
        y="36"
        width="60"
        height="40"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <path
        d="M86 52h32M86 62h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.7"
      />
    </svg>
  );
}

/** Comments dock — list scrolls; composer pinned at bottom (same as AI 问股). */
export function SymbolDockCommentsPanel({
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
  commentsEmpty,
  commentsDelete,
  tabLoading,
  loadingLabel,
}: Props) {
  const t = useTranslations("comments");

  if (!canComment) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate
          compact
          title={t("loginTitle")}
          body={t("loginBody")}
          hint={t("loginHint")}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
        {tabLoading ? (
          <ListPanelSkeleton rows={5} label={loadingLabel} />
        ) : comments.length === 0 ? (
          <div className="flex min-h-[min(42vh,16rem)] flex-col items-center justify-center gap-3 px-2 py-8 text-center">
            <EmptyCommentsArt />
            <p className="text-[13px] tracking-[-0.08px] text-[var(--muted)]">
              {commentsEmpty}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--aw-hairline,var(--border))]">
            {comments.map((c) => (
              <li key={c.id} className="py-3 first:pt-1">
                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
                  <span className="min-w-0 truncate">
                    {c.author}
                    <span className="mx-1 opacity-50">·</span>
                    {formatDateTime(c.createdAt)}
                  </span>
                  {currentUserId === c.userId ? (
                    <button
                      type="button"
                      className="aw-text-link shrink-0 text-[11px] text-[var(--down)]"
                      onClick={() => void onDeleteComment(c.id)}
                    >
                      {commentsDelete}
                    </button>
                  ) : null}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-[1.45] tracking-[-0.08px] text-[var(--aw-ink,var(--foreground))]">
                  {c.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--aw-hairline,var(--border))] px-5 py-3">
        <form onSubmit={onPostComment} className="flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder={commentsPlaceholder}
            className="qt-input h-9 min-w-0 flex-1 px-3 text-[13px] leading-none"
          />
          <SubmitButton
            type="submit"
            loading={commentBusy}
            loadingLabel={loadingLabel}
            className="aw-btn-pill h-9 shrink-0 px-4 text-[13px]"
          >
            {commentsPost}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
