import {
  strategyRulesSchema,
  type RuleClause,
  type StrategyRules,
} from "@/lib/strategy/rules";

export type TunableParam = {
  id: string;
  section: "entry" | "exit";
  index: number;
  key: string;
  label: string;
  current: number;
  presets: number[];
};

const PRESETS: Record<string, number[]> = {
  fast: [5, 10, 20],
  slow: [20, 60, 120],
  period: [10, 20, 60],
  lookback: [10, 20, 60],
  bars: [5, 10, 20],
  pct: [5, 10, 15],
};

function clauseLabel(c: RuleClause, key: string): string {
  switch (c.type) {
    case "ma_cross":
      return key === "fast"
        ? `MA cross fast (${c.fast})`
        : `MA cross slow (${c.slow})`;
    case "price_vs_ma":
      return `MA period (${c.period})`;
    case "break_high":
      return `Break lookback (${c.lookback})`;
    case "hold_bars":
      return `Hold bars (${c.bars})`;
    case "stop_pct":
      return `Stop % (${c.pct})`;
    case "take_profit_pct":
      return `Take profit % (${c.pct})`;
    default:
      return key;
  }
}

function keysForClause(c: RuleClause): string[] {
  switch (c.type) {
    case "ma_cross":
      return ["fast", "slow"];
    case "price_vs_ma":
      return ["period"];
    case "break_high":
      return ["lookback"];
    case "hold_bars":
      return ["bars"];
    case "stop_pct":
    case "take_profit_pct":
      return ["pct"];
    default:
      return [];
  }
}

/** List numeric knobs suitable for a tiny 3–5 cell param grid. */
export function listTunableParams(rules: StrategyRules): TunableParam[] {
  const out: TunableParam[] = [];
  for (const section of ["entry", "exit"] as const) {
    rules[section].forEach((clause, index) => {
      for (const key of keysForClause(clause)) {
        const current = Number(
          (clause as unknown as Record<string, unknown>)[key],
        );
        if (!Number.isFinite(current)) continue;
        out.push({
          id: `${section}.${index}.${key}`,
          section,
          index,
          key,
          label: clauseLabel(clause, key),
          current,
          presets: PRESETS[key] ?? [current],
        });
      }
    });
  }
  return out;
}

export function applyParamValue(
  rules: StrategyRules,
  paramId: string,
  value: number,
): StrategyRules {
  const [section, indexStr, key] = paramId.split(".");
  if (section !== "entry" && section !== "exit") {
    throw new Error("Invalid param id");
  }
  const index = Number(indexStr);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Invalid param index");
  }
  const clone = structuredClone(rules) as StrategyRules;
  const clause = clone[section][index] as
    | (Record<string, unknown> & RuleClause)
    | undefined;
  if (!clause || typeof key !== "string" || !(key in clause)) {
    throw new Error("Param not found on rules");
  }
  (clause as Record<string, unknown>)[key] = value;
  return strategyRulesSchema.parse(clone);
}

export function parseParamValues(raw: unknown, max = 5): number[] {
  if (!Array.isArray(raw)) throw new Error("values must be an array");
  const nums = raw
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);
  const unique = [...new Set(nums)].slice(0, max);
  if (unique.length < 2) throw new Error("Need 2–5 distinct positive values");
  return unique;
}
