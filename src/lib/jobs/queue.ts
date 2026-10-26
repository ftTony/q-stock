import { tickStrategyLabReports } from "@/lib/strategy/run-lab-report";
import { tickStrategyReplays } from "@/lib/strategy/run-replay-job";
import type { JobKind } from "@/lib/jobs/types";

export type TickJobsOptions = {
  /** Max strategy replay jobs per tick (1GB host: keep small). */
  strategyReplayLimit?: number;
  /** Max lab basket/compare jobs per tick. */
  strategyLabLimit?: number;
  /** Restrict to a subset of kinds (default: all registered). */
  kinds?: JobKind[];
};

export type TickJobsResult = {
  strategyReplay: number;
  strategyLab: number;
};

/**
 * Worker entry: drain a small batch of background jobs.
 * Add new kinds here as the product grows (digest, SEO, etc.).
 */
export async function tickJobs(
  options: TickJobsOptions = {},
): Promise<TickJobsResult> {
  const kinds = new Set(
    options.kinds ?? (["strategy_replay", "strategy_lab"] as JobKind[]),
  );
  let strategyReplay = 0;
  let strategyLab = 0;
  if (kinds.has("strategy_replay")) {
    strategyReplay = await tickStrategyReplays(
      options.strategyReplayLimit ?? 2,
    );
  }
  if (kinds.has("strategy_lab")) {
    strategyLab = await tickStrategyLabReports(options.strategyLabLimit ?? 1);
  }
  return { strategyReplay, strategyLab };
}
