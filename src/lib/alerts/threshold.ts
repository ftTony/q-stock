export type AlertCondition = "gte" | "lte";
export type AlertWatchStatus = "active" | "triggered" | "disabled";
export type AlertTickAction = "fire" | "rearm" | "hold";

export function isAlertThresholdHit(
  condition: AlertCondition,
  price: number,
  trigger: number,
): boolean {
  return condition === "gte" ? price >= trigger : price <= trigger;
}

/** Crossing fires once; after `triggered`, wait until price recovers, then re-arm. */
export function nextPriceAlertAction(
  status: AlertWatchStatus,
  hit: boolean,
): AlertTickAction {
  if (status === "disabled") return "hold";
  if (status === "triggered") return hit ? "hold" : "rearm";
  return hit ? "fire" : "hold";
}
