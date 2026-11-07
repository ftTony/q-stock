import {
  annuityFutureValue,
  buildAnnuityYearRows,
  nominalFromEffective,
  periodRateFromEffective,
} from "@/lib/tools/annuity";

export type DcaFrequency = "weekly" | "biweekly" | "monthly";

export type DcaInput = {
  contribution: number;
  frequency: DcaFrequency;
  periods: number;
  /** 有效年化（%），即真实年收益；按期开方换算每期利率 */
  annualRatePercent: number;
  initialPrincipal: number;
};

export type DcaYearRow = {
  year: number;
  periodsEnd: number;
  contributed: number;
  value: number;
};

export type DcaResult =
  | {
      ok: true;
      nPerYear: number;
      periodRate: number;
      fv: number;
      totalContributed: number;
      profit: number;
      profitPct: number;
      /** 输入的有效年化（%） */
      effectiveAnnual: number;
      /** 等价的名义年利率（%），按同频率复利 */
      nominalAnnual: number;
      years: DcaYearRow[];
    }
  | { ok: false; error: "invalid" | "rate" };

const MAX_PERIODS = 600;

function nPerYearOf(frequency: DcaFrequency) {
  if (frequency === "weekly") return 52;
  if (frequency === "biweekly") return 26;
  return 12;
}

/**
 * 口径：有效年化按频率开方（i = (1+r)^(1/n) − 1）。
 * 定投代入的通常是基金/指数年化收益，属于有效年化；
 * 直接除以 12 会低估每期收益，收益率越高差距越大。
 * 与复利工具（名义年利率 ÷ n）的换算见 annuity.ts。
 */
export function calcDca(input: DcaInput): DcaResult {
  const {
    contribution,
    frequency,
    periods,
    annualRatePercent,
    initialPrincipal,
  } = input;

  if (
    !(contribution > 0) ||
    !(periods >= 1) ||
    periods > MAX_PERIODS ||
    !(initialPrincipal >= 0) ||
    annualRatePercent < -50 ||
    annualRatePercent > 50
  ) {
    return { ok: false, error: "invalid" };
  }

  const r = annualRatePercent / 100;
  if (r <= -1) return { ok: false, error: "rate" };

  const nPerYear = nPerYearOf(frequency);
  const periodRate = periodRateFromEffective(r, nPerYear);
  const fv = annuityFutureValue({
    principal: initialPrincipal,
    contribution,
    periods,
    periodRate,
  });
  const totalContributed = initialPrincipal + contribution * periods;
  const profit = fv - totalContributed;
  const profitPct =
    totalContributed > 0 ? (profit / totalContributed) * 100 : 0;

  return {
    ok: true,
    nPerYear,
    periodRate,
    fv,
    totalContributed,
    profit,
    profitPct,
    effectiveAnnual: annualRatePercent,
    nominalAnnual: nominalFromEffective(annualRatePercent, nPerYear),
    years: buildAnnuityYearRows({
      principal: initialPrincipal,
      contribution,
      periods,
      periodRate,
      nPerYear,
    }),
  };
}

export const DCA_EXAMPLE: DcaInput = {
  contribution: 1000,
  frequency: "monthly",
  periods: 120,
  annualRatePercent: 6,
  initialPrincipal: 0,
};
