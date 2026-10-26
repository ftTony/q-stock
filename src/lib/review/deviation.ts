/** Machine keys for process-review deviation chips (neutral, not diagnosis). */
export type DeviationFlag =
  | "noTag"
  | "noInvalidation"
  | "fomo"
  | "panic"
  | "revenge"
  | "oversizing"
  | "noPlan";

export type DeviationInput = {
  strategyId?: string | null;
  invalidationNote?: string | null;
  emotionTags?: string[] | null;
};

const EMOTION_FLAGS: DeviationFlag[] = [
  "fomo",
  "panic",
  "revenge",
  "oversizing",
  "noPlan",
];

/** Shared with symbol review rail and /review process desk. */
export function deviationFlags(order: DeviationInput): DeviationFlag[] {
  const flags: DeviationFlag[] = [];
  if (!order.strategyId) flags.push("noTag");
  if (!order.invalidationNote?.trim()) flags.push("noInvalidation");
  const tags = order.emotionTags ?? [];
  for (const key of EMOTION_FLAGS) {
    if (tags.includes(key)) flags.push(key);
  }
  return flags;
}

export function hasDeviationFlags(order: DeviationInput): boolean {
  return deviationFlags(order).length > 0;
}
