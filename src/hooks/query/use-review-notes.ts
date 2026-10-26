"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

export type ReviewContent = {
  whatWentWell: string[];
  whatToImprove: string[];
  emotionFlags: string[];
  nextChecklist: string[];
  summary: string;
};

export type ReviewNoteRow = {
  id: string;
  period: string;
  content: ReviewContent;
  createdAt: string;
};

export type ReviewResult = ReviewContent & {
  period: "day" | "week";
  disclaimer?: string;
  noteId?: string;
  error?: string;
};

type NotesResponse = { notes?: ReviewNoteRow[] };

export function useReviewNotes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.ai.reviewNotes,
    enabled,
    queryFn: () => fetchJson<NotesResponse>("/api/ai/review"),
  });
}

export class ReviewHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function useRunReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      period: "day" | "week";
      locale: string;
      save?: boolean;
    }) => {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as ReviewResult;
      if (!res.ok) {
        throw new ReviewHttpError(
          res.status,
          typeof data.error === "string" ? data.error : `Request failed (${res.status})`,
        );
      }
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.ai.reviewNotes });
      await qc.invalidateQueries({ queryKey: queryKeys.ai.quota });
      await qc.invalidateQueries({ queryKey: ["review", "process"] });
    },
  });
}
