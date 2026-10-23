"use client";

import type { FormEvent } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/format-number";
import type { CommentRow } from "@/components/symbol/symbol-tabs-panel";

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
  commentsLoginRequired: string;
  commentsEmpty: string;
  commentsDelete: string;
  tabLoading: boolean;
  loadingLabel: string;
};

/** Comments dock — composer on top, list / centered empty below. */
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
  commentsLoginRequired,
  commentsEmpty,
  commentsDelete,
  tabLoading,
  loadingLabel,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-5 py-3">
        {canComment ? (
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
        ) : (
          <p className="aw-caption py-1">{commentsLoginRequired}</p>
        )}
      </div>

      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
        {tabLoading ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            {loadingLabel}
          </p>
        ) : comments.length === 0 ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            {commentsEmpty}
          </p>
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
    </div>
  );
}
