/** Map strategy replay API error payloads to i18n message keys / values. */

export type ReplayApiError = {
  code?: string;
  error?: string;
  used?: number;
  limit?: number;
};

type TranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function replayErrorMessage(
  data: ReplayApiError | null | undefined,
  t: TranslateFn,
  fallbackKey = "replayFailed",
): string {
  if (data?.code === "daily_limit") {
    return t("replayDailyLimit", {
      used: data.used ?? 0,
      limit: data.limit ?? 20,
    });
  }
  if (data?.code === "queued") {
    return t("replayQueued");
  }
  return data?.error || t(fallbackKey);
}
