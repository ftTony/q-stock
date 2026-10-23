/** Extensible worker job kinds (DB-backed queue; no Redis required). */
export type JobKind = "strategy_replay";

export const JOB_KINDS = ["strategy_replay"] as const satisfies readonly JobKind[];
