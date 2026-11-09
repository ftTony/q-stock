/**
 * Lightweight error reporting — no Sentry dependency required.
 *
 * - Always logs to console in a structured shape
 * - If `NEXT_PUBLIC_ERROR_REPORT_URL` (or server `ERROR_REPORT_URL`) is set,
 *   POSTs a small JSON payload (best-effort, never throws)
 * - Optional `window.__qstockReportError` hook for BYO agents
 */

export type ErrorReportContext = {
  source?: string;
  digest?: string;
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
};

type ReportPayload = {
  message: string;
  name?: string;
  stack?: string;
  digest?: string;
  source?: string;
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  ts: string;
  env: string;
};

function serializeError(
  error: unknown,
  context: ErrorReportContext = {},
): ReportPayload {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    message: err.message || "Unknown error",
    name: err.name,
    stack: err.stack,
    digest: context.digest,
    source: context.source,
    route: context.route,
    userId: context.userId,
    extra: context.extra,
    ts: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "unknown",
  };
}

function reportUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_ERROR_REPORT_URL?.trim() ||
    process.env.ERROR_REPORT_URL?.trim() ||
    undefined
  );
}

async function postReport(payload: ReportPayload): Promise<void> {
  const url = reportUrl();
  if (!url) return;
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // never throw from reporter
  }
}

declare global {
  interface Window {
    __qstockReportError?: (payload: ReportPayload) => void;
  }
}

/** Report an error from client or server. Safe to call in catch / error boundaries. */
export function reportError(
  error: unknown,
  context: ErrorReportContext = {},
): void {
  const payload = serializeError(error, context);
  console.error(
    `[report-error]${payload.source ? ` ${payload.source}` : ""}`,
    payload.digest ?? "",
    payload.message,
    error,
  );

  if (typeof window !== "undefined" && typeof window.__qstockReportError === "function") {
    try {
      window.__qstockReportError(payload);
    } catch {
      // ignore hook failures
    }
  }

  void postReport(payload);
}
