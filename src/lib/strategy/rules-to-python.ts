import type { RuleClause, StrategyRules } from "@/lib/strategy/rules";

function clauseToPy(c: RuleClause, indent = "    "): string {
  switch (c.type) {
    case "ma_cross":
      return (
        `${indent}ma_cross(fast=${c.fast}, slow=${c.slow}, ` +
        `direction="${c.direction}")`
      );
    case "price_vs_ma":
      return `${indent}price_vs_ma(period=${c.period}, op="${c.op}")`;
    case "hold_bars":
      return `${indent}hold_bars(bars=${c.bars})`;
    case "stop_pct":
      return `${indent}stop_pct(pct=${c.pct})`;
    case "take_profit_pct":
      return `${indent}take_profit_pct(pct=${c.pct})`;
    case "price_level":
      return `${indent}price_level(op="${c.op}", price=${c.price})`;
    case "break_high":
      return `${indent}break_high(lookback=${c.lookback})`;
    default:
      return `${indent}# unknown clause`;
  }
}

function sizingToPy(s: StrategyRules["sizing"]): string[] {
  const lines = [`    mode="${s.mode}",`];
  if (s.mode === "fixedQty" && s.qty != null) {
    lines.push(`    qty=${s.qty},`);
  }
  if (s.mode === "fixedNotional" && s.notional != null) {
    lines.push(`    notional=${s.notional},`);
  }
  if (s.mode === "riskPercent" && s.riskPercent != null) {
    lines.push(`    risk_percent=${s.riskPercent},`);
  }
  if (s.maxPositionPct != null) {
    lines.push(`    max_position_pct=${s.maxPositionPct},`);
  }
  return lines;
}

/**
 * Readable Python-shaped export of StrategyRules.
 * Not executed — the lab replay engine runs the structured JSON config.
 */
export function strategyRulesToPython(rules: StrategyRules): string {
  const entry = rules.entry.map((c) => clauseToPy(c)).join(",\n");
  const exit = rules.exit.map((c) => clauseToPy(c)).join(",\n");
  const sizing = sizingToPy(rules.sizing).join("\n");

  return `# Q-Stock strategy rules — readable export (not executed as a script)
# Replay uses the structured config; edit via Blocks or JSON advanced mode.

strategy = Strategy(
    version=${rules.version},
    market="${rules.market}",
    entry=[
${entry}
    ],
    exit=[
${exit}
    ],
    sizing=Sizing(
${sizing}
    ),
)
`;
}
