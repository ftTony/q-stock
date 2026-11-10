import { formatNumber } from "@/lib/format-number";
import { fmtMoney } from "./drawer-ui";
import type { StrategyEval } from "../option-strategy-utils";

type Props = {
  eval_: StrategyEval;
  t: (k: string) => string;
};

/** Compact 2×2 / 4-col metric strip under the strategy legs table. */
export function StrategyMetricsStrip({ eval_, t }: Props) {
  const metrics = [
    {
      label: t("netPremium"),
      value:
        eval_.netPremium === 0
          ? "$0"
          : `${eval_.netPremium > 0 ? "+" : "-"}$${formatNumber(
              Math.abs(eval_.netPremium),
              { maximumFractionDigits: 0 },
            )}`,
      tone:
        eval_.netPremium > 0
          ? "text-[var(--up)]"
          : eval_.netPremium < 0
            ? "text-[var(--down)]"
            : "",
    },
    {
      label: t("maxProfit"),
      value: fmtMoney(eval_.maxProfit),
      tone: "text-[var(--up)]",
    },
    {
      label: t("maxLoss"),
      value: eval_.maxLoss == null ? "-∞" : fmtMoney(eval_.maxLoss),
      tone: "text-[var(--down)]",
    },
    {
      label: t("breakevens"),
      value:
        eval_.breakevens.length > 0
          ? eval_.breakevens
              .map((b) => formatNumber(b, { maximumFractionDigits: 2 }))
              .join(" / ")
          : "—",
      tone: "",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label}>
          <div className="text-[11px] text-[var(--muted)]">{m.label}</div>
          <div
            className={`mt-0.5 truncate text-[13px] font-semibold tabular-nums ${m.tone}`}
            title={m.value}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
