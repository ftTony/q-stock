"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import type { AssetType } from "@/lib/types";

export function useCreateComment(onDone?: () => void) {
  return useMutation({
    mutationFn: (body: {
      symbol: string;
      assetType: AssetType;
      content: string;
    }) =>
      fetchJson("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      onDone?.();
    },
  });
}

export function useDeleteComment(onDone?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/comments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void qc;
      onDone?.();
    },
  });
}
