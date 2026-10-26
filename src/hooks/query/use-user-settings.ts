"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";

export function useSaveUserSettings() {
  return useMutation({
    mutationFn: (body: {
      name?: string;
      locale?: string;
      theme?: string;
      changeColorScheme?: string;
    }) =>
      fetchJson<{ user?: { name?: string | null } }>("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });
}
