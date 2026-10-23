import { tickStrategyReplays } from "@/lib/strategy/run-replay-job";
import type { JobKind } from "@/lib/jobs/types";

export type TickJobsOptions = {
  /** Max strategy replay jobs per tick (1GB host: keep small). */
  strategyReplayLimit?: number;
  /** Restrict to a subset of kinds (default: all registered). */
  kinds?: JobKind[];
};

export type TickJobsResult = {
  strategyReplay: number;
};

/**
 * Worker entry: drain a small batch of background jobs.
 * Add new kinds here as the product grows (digest, SEO, etc.).
 */
export async function tickJobs(
  options: TickJobsOptions = {},
): Promise<TickJobsResult> {
  const kinds = new Set(options.kinds ?? (["strategy_replay"] as JobKind[]));
  let strategyReplay = 0;
  if (kinds.has("strategy_replay")) {
    strategyReplay = await tickStrategyReplays(
      options.strategyReplayLimit ?? 2,
    );
  }
  return { strategyReplay };
}
