"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { ProcessPayload } from "@/lib/review/process-summary";

export type { ProcessFill, ProcessPayload, ProcessSummary } from "@/lib/review/process-summary";
export type { DeviationFlag } from "@/lib/review/deviation";

export function useReviewProcess(
  period: "day" | "week",
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.review.process(period),
    enabled,
    queryFn: () =>
      fetchJson<ProcessPayload>(`/api/review/process?period=${period}`),
  });
}
