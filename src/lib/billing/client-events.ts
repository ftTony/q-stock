/** Browser-side funnel clicks → `/api/billing/events`. */

export async function trackBillingClick(
  event: "click_invite" | "click_byok" | "click_upgrade",
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch("/api/billing/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta }),
    });
  } catch {
    /* ignore */
  }
}
