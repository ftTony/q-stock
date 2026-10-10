/** Browser event so all AI quota UIs stay in sync after consume/refresh. */
export const AI_QUOTA_CHANGED = "qstock:ai-quota-changed";

export function emitAiQuotaChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AI_QUOTA_CHANGED));
}
