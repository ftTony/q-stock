"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

export function useInvites(enabled = true) {
  return useQuery({
    queryKey: queryKeys.invites.list,
    enabled,
    queryFn: () => fetchJson("/api/user/invites"),
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: unknown) =>
      fetchJson("/api/user/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.invites.list });
    },
  });
}
