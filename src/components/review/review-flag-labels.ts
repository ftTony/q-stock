import type { DeviationFlag } from "@/lib/review/deviation";

/** i18n keys under `review.flag*` */
export const FLAG_I18N: Record<DeviationFlag, string> = {
  noTag: "flagNoTag",
  noInvalidation: "flagNoInvalidation",
  fomo: "flagFomo",
  panic: "flagPanic",
  revenge: "flagRevenge",
  oversizing: "flagOversizing",
  noPlan: "flagNoPlan",
};
