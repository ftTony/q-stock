import { z } from "zod";

export const ruleClauseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ma_cross"),
    fast: z.number().int().min(2).max(120),
    slow: z.number().int().min(3).max(250),
    direction: z.enum(["up", "down"]),
  }),
  z.object({
    type: z.literal("price_vs_ma"),
    period: z.number().int().min(2).max(250),
    op: z.enum(["gt", "lt"]),
  }),
  z.object({
    type: z.literal("hold_bars"),
    bars: z.number().int().min(1).max(500),
  }),
  z.object({
    type: z.literal("stop_pct"),
    pct: z.number().positive().max(50),
  }),
  z.object({
    type: z.literal("take_profit_pct"),
    pct: z.number().positive().max(200),
  }),
  z.object({
    type: z.literal("price_level"),
    op: z.enum(["lte", "gte"]),
    price: z.number().positive(),
  }),
  z.object({
    type: z.literal("break_high"),
    lookback: z.number().int().min(2).max(120),
  }),
]);

export const strategyRulesSchema = z.object({
  version: z.literal(1),
  market: z.enum(["stock", "hk", "cn", "crypto"]),
  entry: z.array(ruleClauseSchema).min(1).max(6),
  exit: z.array(ruleClauseSchema).min(1).max(6),
  sizing: z.object({
    mode: z.enum(["fixedQty", "fixedNotional", "riskPercent"]),
    qty: z.number().positive().optional(),
    notional: z.number().positive().optional(),
    riskPercent: z.number().positive().max(10).optional(),
    maxPositionPct: z.number().positive().max(100).optional(),
  }),
  constraints: z
    .object({
      maxTradesPerDay: z.number().int().positive().max(20).optional(),
      cooldownBars: z.number().int().min(0).max(60).optional(),
      allowShort: z.boolean().optional(),
    })
    .optional(),
});

export type StrategyRules = z.infer<typeof strategyRulesSchema>;
export type RuleClause = z.infer<typeof ruleClauseSchema>;

export function parseStrategyRules(raw: unknown): StrategyRules {
  return strategyRulesSchema.parse(raw);
}
