/** Shared JSON fetch for React Query hooks. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    const err = new Error(
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`,
    ) as Error & { code?: string; status?: number };
    if (typeof data.code === "string" && data.code) err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}
