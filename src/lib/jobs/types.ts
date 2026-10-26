/** Extensible worker job kinds (DB-backed queue; no Redis required). */
export type JobKind = "strategy_replay" | "strategy_lab";

export const JOB_KINDS = [
  "strategy_replay",
  "strategy_lab",
] as const satisfies readonly JobKind[];
