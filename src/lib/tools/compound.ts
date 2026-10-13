export type CompoundFrequency =
  | "annual"
  | "semiannual"
  | "quarterly"
  | "monthly";

export type CompoundInput = {
  principal: number;
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
      years: CompoundYearRow[];
    }
  | { ok: false; error: "invalid" };

function nPerYearOf(frequency: CompoundFrequency) {
  if (frequency === "semiannual") return 2;
  if (frequency === "quarterly") return 4;
  if (frequency === "monthly") return 12;
  return 1;
}

function fvAt(
  principal: number,
  contribution: number,
  N: number,
  i: number,
) {
  const fvPrincipal = principal * (1 + i) ** N;
  const fvContrib =
    contribution === 0
      ? 0
      : i === 0
        ? contribution * N
        : contribution * (((1 + i) ** N - 1) / i);
  return fvPrincipal + fvContrib;
}

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
  const i = r / nPerYear;
  const N = Math.round(years * nPerYear);
  if (N < 1) return { ok: false, error: "invalid" };

  const fv = fvAt(principal, contribution, N, i);
  const totalContributed = principal + contribution * N;
  const profit = fv - totalContributed;
  const multiple = totalContributed > 0 ? fv / totalContributed : 0;
  const simpleInterestApprox =
    principal + principal * r * years + contribution * N;

  const yearRows: CompoundYearRow[] = [];
  const fullYears = Math.ceil(N / nPerYear);
  for (let y = 1; y <= fullYears; y += 1) {
    const periodsEnd = Math.min(y * nPerYear, N);
    yearRows.push({
      year: y,
      value: fvAt(principal, contribution, periodsEnd, i),
      contributed: principal + contribution * periodsEnd,
    });
  }

  return {
    ok: true,
    nPerYear,
    periods: N,
    periodRate: i,
    fv,
    totalContributed,
    profit,
    multiple,
    simpleInterestApprox,
    years: yearRows,
  };
}

export const COMPOUND_EXAMPLE: CompoundInput = {
  principal: 100_000,
  annualRatePercent: 5,
  years: 10,
  compoundFrequency: "annual",
  contribution: 0,
};
