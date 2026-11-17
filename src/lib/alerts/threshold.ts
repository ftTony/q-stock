export type AlertCondition = "gte" | "lte";
export type AlertWatchStatus = "active" | "triggered" | "disabled";
export type AlertFrequency = "once" | "daily" | "always";
export type AlertTickAction = "fire" | "rearm" | "hold";

export function isAlertThresholdHit(
  condition: AlertCondition,
  price: number,
  trigger: number,
): boolean {
  return condition === "gte" ? price >= trigger : price <= trigger;
}

export function sameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Crossing fires; behavior after `triggered` depends on frequency:
 * - once: never re-arm / never fire again
 * - daily: fire again on a new UTC day while still breached; re-arm after recovery
 * - always: re-arm after price recovers (no spam while breach persists)
 */
export function nextPriceAlertAction(
  status: AlertWatchStatus,
  hit: boolean,
  frequency: AlertFrequency = "always",
  lastTriggeredAt?: Date | null,
  now: Date = new Date(),
): AlertTickAction {
  if (status === "disabled") return "hold";

  if (status === "triggered") {
    if (frequency === "once") return "hold";

    if (frequency === "daily") {
      if (hit) {
        if (!lastTriggeredAt || !sameUtcDay(lastTriggeredAt, now)) {
          return "fire";
        }
        return "hold";
      }
      return "rearm";
    }

    // always
    return hit ? "hold" : "rearm";
  }

  // active
  return hit ? "fire" : "hold";
}
