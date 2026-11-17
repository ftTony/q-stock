import { apiFetchJson } from "@/lib/api/client";

/** Shared JSON fetch for React Query hooks (routes main-path calls to FastAPI). */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return apiFetchJson<T>(url, init);
}
