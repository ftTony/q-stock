import { QueryClient } from "@tanstack/react-query";

/** Browser QueryClient defaults tuned for a 1GB / 1-core host (short cache, few retries). */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
