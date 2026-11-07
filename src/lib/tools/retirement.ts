/**
 * Retirement funding calculator (market-agnostic).
 *
 * Deliberately says nothing about any country's pension system, tax code or
 * contribution ceiling: it answers the two questions a self-directed investor
 * outside mainland China actually has —
 *   1. how much will I have at retirement given what I save now?
 *   2. given that pile, how much can I spend each month without running dry
 *      before I die?
 *
 * Conventions:
 * - Everything the user types about *income* is in today's money; results are
 *   reported both in today's money ("real") and in the money of that future
 *   year ("nominal"), because "€1.8m in 2060" and "€900k of today's
 *   purchasing power" are very different promises.
 * - Returns are nominal annual, compounded monthly through the geometric
 *   split (1+r)^(1/12)-1, so a 7% annual figure is also a 7% effective annual
 *   figure — the same convention as the compound and DCA tools.
 * - Contributions are end-of-month (ordinary annuity), which is what a salary
 *   deduction or a monthly transfer actually is.
 * - The drawdown phase keeps the portfolio invested at the same real return,
 *   i.e. it assumes a constant real return without sequence-of-returns risk.
 *   Real markets do not behave that way; the 4% rule line is shown alongside
 *   as a second, cruder sanity check.
 */

export type RetirementInput = {
  /** Current age in years. */
  currentAge: number;
  /** Planned retirement age; equal to currentAge means "already retired". */
  retirementAge: number;
  /** Planning horizon end (life expectancy). */
  lifeExpectancy: number;
  /** Savings already invested today. */
  currentSavings: number;
  /** Monthly contribution from now to retirement (today's money). */
  monthlyContribution: number;
  /** Expected nominal annual return, %. */
  annualReturnPercent: number;
  /** Expected inflation, %. */
  inflationPercent: number;
  /** Desired monthly spending in retirement, in today's money. */
  desiredMonthlyIncome: number;
};

export type RetirementYearRow = {
  age: number;
  /** Portfolio value in the money of that year. */
  nominal: number;
  /** Portfolio value in today's money. */
  real: number;
  /** True once drawdown has started. */
  drawing: boolean;
};

export type RetirementResult =
  | {
      ok: true;
      yearsToRetire: number;
      yearsInRetirement: number;
      /** Portfolio at retirement, money of that year. */
      corpusNominal: number;
      /** Portfolio at retirement, today's purchasing power. */
      corpusReal: number;
      /** Total paid in (savings + contributions), nominal. */
      contributed: number;
      /** corpusNominal − contributed. */
      growth: number;
      /** Real annual return used (decimal). */
      realReturn: number;
      /** Monthly sustainable spend to life expectancy, today's money. */
      sustainableMonthly: number;
      /** Target spend the user asked for, today's money. */
      desiredMonthly: number;
      /** Corpus needed to fund the desired spend, today's money. */
      requiredCorpusReal: number;
      /** requiredCorpusReal − corpusReal; positive means short. */
      gapReal: number;
      /** Extra monthly saving (today's money) that would close the gap. */
      extraMonthlyNeeded: number;
      /** 4% rule reference: corpusReal × 4% / 12. */
      fourPercentMonthly: number;
      /** Age at which the money runs out if spending the desired amount. */
      depletionAge: number | null;
      /** True when the desired spend survives to life expectancy. */
      onTrack: boolean;
      rows: RetirementYearRow[];
    }
  | { ok: false; error: "invalid" };

const MAX_AGE = 110;

function monthsBetween(from: number, to: number): number {
  return Math.max(0, Math.round((to - from) * 12));
}

/** Future value of a monthly ordinary annuity. */
function fvAnnuity(monthlyRate: number, months: number, payment: number): number {
  if (months <= 0) return 0;
  if (Math.abs(monthlyRate) < 1e-12) return payment * months;
  return (payment * (Math.pow(1 + monthlyRate, months) - 1)) / monthlyRate;
}

/** Present value of a monthly ordinary annuity. */
function pvAnnuity(monthlyRate: number, months: number, payment: number): number {
  if (months <= 0) return 0;
  if (Math.abs(monthlyRate) < 1e-12) return payment * months;
  return (payment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

/** Monthly payment that exactly exhausts `present` over `months`. */
function pmtFromPv(monthlyRate: number, months: number, present: number): number {
  if (months <= 0 || present <= 0) return 0;
  if (Math.abs(monthlyRate) < 1e-12) return present / months;
  return (present * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function calcRetirement(input: RetirementInput): RetirementResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyContribution,
    annualReturnPercent,
    inflationPercent,
    desiredMonthlyIncome,
  } = input;

  const valid =
    Number.isFinite(currentAge) &&
    Number.isFinite(retirementAge) &&
    Number.isFinite(lifeExpectancy) &&
    currentAge >= 16 &&
    currentAge <= MAX_AGE - 1 &&
    retirementAge >= currentAge &&
    retirementAge <= MAX_AGE - 1 &&
    lifeExpectancy > retirementAge &&
    lifeExpectancy <= MAX_AGE &&
    currentSavings >= 0 &&
    monthlyContribution >= 0 &&
    annualReturnPercent >= -20 &&
    annualReturnPercent <= 30 &&
    inflationPercent >= -5 &&
    inflationPercent <= 20 &&
    desiredMonthlyIncome >= 0;

  if (!valid) return { ok: false, error: "invalid" };

  const r = annualReturnPercent / 100;
  const infl = inflationPercent / 100;
  const realReturn = (1 + r) / (1 + infl) - 1;

  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const monthsAccum = monthsBetween(currentAge, retirementAge);
  const monthsDraw = monthsBetween(retirementAge, lifeExpectancy);

  const mNominal = Math.pow(1 + r, 1 / 12) - 1;
  const mReal = Math.pow(1 + realReturn, 1 / 12) - 1;

  const corpusNominal =
    currentSavings * Math.pow(1 + r, yearsToRetire) +
    fvAnnuity(mNominal, monthsAccum, monthlyContribution);
  const deflator = Math.pow(1 + infl, yearsToRetire);
  const corpusReal = corpusNominal / deflator;

  const contributed = currentSavings + monthlyContribution * monthsAccum;
  const growth = corpusNominal - contributed;

  const sustainableMonthly = pmtFromPv(mReal, monthsDraw, corpusReal);
  const requiredCorpusReal = pvAnnuity(
    mReal,
    monthsDraw,
    desiredMonthlyIncome,
  );
  const gapReal = requiredCorpusReal - corpusReal;

  // Extra monthly saving, in today's money, that would close the gap.
  const mRealAccum = Math.pow(1 + realReturn, 1 / 12) - 1;
  const accumFactor = fvAnnuity(mRealAccum, monthsAccum, 1);
  const extraMonthlyNeeded =
    gapReal > 0 && accumFactor > 0 ? gapReal / accumFactor : 0;

  const fourPercentMonthly = (corpusReal * 0.04) / 12;

  // Year-by-year path, accumulation then drawdown at the desired spend.
  const rows: RetirementYearRow[] = [];
  let nominal = currentSavings;
  for (let age = currentAge; age < retirementAge; age += 1) {
    rows.push({
      age,
      nominal,
      real: nominal / Math.pow(1 + infl, age - currentAge),
      drawing: false,
    });
    // Grow one year, adding twelve end-of-month contributions.
    for (let m = 0; m < 12; m += 1) {
      nominal = nominal * (1 + mNominal) + monthlyContribution;
    }
  }

  // Drawdown: withdrawals are fixed in today's money, so inflate them yearly.
  let depletionAge: number | null = null;
  if (monthsDraw > 0) {
    rows.push({ age: retirementAge, nominal, real: corpusReal, drawing: true });
    let balanceReal = corpusReal;
    for (let age = retirementAge; age < lifeExpectancy; age += 1) {
      for (let m = 0; m < 12; m += 1) {
        balanceReal = balanceReal * (1 + mReal) - desiredMonthlyIncome;
        if (balanceReal <= 0) {
          balanceReal = 0;
          if (depletionAge === null) {
            depletionAge = age + (m + 1) / 12;
          }
          break;
        }
      }
      const nextAge = age + 1;
      rows.push({
        age: nextAge,
        nominal: balanceReal * Math.pow(1 + infl, nextAge - currentAge),
        real: balanceReal,
        drawing: true,
      });
      if (depletionAge !== null) break;
    }
  }

  const onTrack = depletionAge === null;

  return {
    ok: true,
    yearsToRetire,
    yearsInRetirement,
    corpusNominal,
    corpusReal,
    contributed,
    growth,
    realReturn,
    sustainableMonthly,
    desiredMonthly: desiredMonthlyIncome,
    requiredCorpusReal,
    gapReal,
    extraMonthlyNeeded,
    fourPercentMonthly,
    depletionAge,
    onTrack,
    rows,
  };
}

export const RETIREMENT_EXAMPLE: RetirementInput = {
  currentAge: 32,
  retirementAge: 65,
  lifeExpectancy: 88,
  currentSavings: 40_000,
  monthlyContribution: 800,
  annualReturnPercent: 7,
  inflationPercent: 2.5,
  desiredMonthlyIncome: 3_500,
};
