import {
  annuityFutureValue,
  buildAnnuityYearRows,
  effectiveFromNominal,
  periodRateFromNominal,
} from "@/lib/tools/annuity";

export type CompoundFrequency =
  | "annual"
  | "semiannual"
  | "quarterly"
  | "monthly";

export type CompoundInput = {
  principal: number;
  /** 名义年利率（%），按期分割到每个复利周期 */
  annualRatePercent: number;
  years: number;
  compoundFrequency: CompoundFrequency;
  contribution: number;
};

export type CompoundYearRow = {
  year: number;
  value: number;
  contributed: number;
};

export type CompoundResult =
  | {
      ok: true;
      nPerYear: number;
      periods: number;
      periodRate: number;
      fv: number;
      totalContributed: number;
      profit: number;
      multiple: number;
      simpleInterestApprox: number;
      /** 输入的名义年利率（%） */
      nominalAnnual: number;
      /** 按当前复利频率折算出的有效年化（%） */
      effectiveAnnual: number;
      years: CompoundYearRow[];
    }
  | { ok: false; error: "invalid" };

function nPerYearOf(frequency: CompoundFrequency) {
  if (frequency === "semiannual") return 2;
  if (frequency === "quarterly") return 4;
  if (frequency === "monthly") return 12;
  return 1;
}

/**
 * 口径：名义年利率按复利频率均分（i = r / n）。
 * 这是存款、贷款等「挂牌名义利率」的惯例，也正是「复利频率影响终值」的来源。
 * 若要代入投资收益（有效年化），请用定投工具；两者换算见 annuity.ts。
 */
export function calcCompound(input: CompoundInput): CompoundResult {
  const {
    principal,
    annualRatePercent,
    years,
    compoundFrequency,
    contribution,
  } = input;

  if (
    !(principal >= 0) ||
    !(years > 0) ||
    years > 50 ||
    !(contribution >= 0) ||
    annualRatePercent < -50 ||
    annualRatePercent > 50
  ) {
    return { ok: false, error: "invalid" };
  }

  const nPerYear = nPerYearOf(compoundFrequency);
  const r = annualRatePercent / 100;
  const periodRate = periodRateFromNominal(r, nPerYear);
  const periods = Math.round(years * nPerYear);
  if (periods < 1) return { ok: false, error: "invalid" };

  const fv = annuityFutureValue({
    principal,
    contribution,
    periods,
    periodRate,
  });
  const totalContributed = principal + contribution * periods;
  const profit = fv - totalContributed;
  const multiple = totalContributed > 0 ? fv / totalContributed : 0;
  const simpleInterestApprox =
    principal + principal * r * years + contribution * periods;

  return {
    ok: true,
    nPerYear,
    periods,
    periodRate,
    fv,
    totalContributed,
    profit,
    multiple,
    simpleInterestApprox,
    nominalAnnual: annualRatePercent,
    effectiveAnnual: effectiveFromNominal(annualRatePercent, nPerYear),
    years: buildAnnuityYearRows({
      principal,
      contribution,
      periods,
      periodRate,
      nPerYear,
    }),
  };
}

export const COMPOUND_EXAMPLE: CompoundInput = {
  principal: 100_000,
  annualRatePercent: 5,
  years: 10,
  compoundFrequency: "annual",
  contribution: 0,
};
