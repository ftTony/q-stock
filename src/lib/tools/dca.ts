export type DcaFrequency = "weekly" | "biweekly" | "monthly";

export type DcaInput = {
  contribution: number;
  frequency: DcaFrequency;
  periods: number;
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
      years: DcaYearRow[];
    }
  | { ok: false; error: "invalid" | "rate" };

const MAX_PERIODS = 600;

function nPerYearOf(frequency: DcaFrequency) {
  if (frequency === "weekly") return 52;
  if (frequency === "biweekly") return 26;
  return 12;
}

function fvAt(
  initialPrincipal: number,
  contribution: number,
  periods: number,
  i: number,
) {
  const fvInitial = initialPrincipal * (1 + i) ** periods;
  const fvAnnuity =
    i === 0
      ? contribution * periods
      : contribution * (((1 + i) ** periods - 1) / i);
  return fvInitial + fvAnnuity;
}

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
  const i = (1 + r) ** (1 / nPerYear) - 1;
  const fv = fvAt(initialPrincipal, contribution, periods, i);
  const totalContributed = initialPrincipal + contribution * periods;
  const profit = fv - totalContributed;
  const profitPct =
    totalContributed > 0 ? (profit / totalContributed) * 100 : 0;

  const years: DcaYearRow[] = [];
  const fullYears = Math.ceil(periods / nPerYear);
  for (let y = 1; y <= fullYears; y += 1) {
    const periodsEnd = Math.min(y * nPerYear, periods);
    years.push({
      year: y,
      periodsEnd,
      contributed: initialPrincipal + contribution * periodsEnd,
      value: fvAt(initialPrincipal, contribution, periodsEnd, i),
    });
  }

  return {
    ok: true,
    nPerYear,
    periodRate: i,
    fv,
    totalContributed,
    profit,
    profitPct,
    years,
  };
}

export const DCA_EXAMPLE: DcaInput = {
  contribution: 1000,
  frequency: "monthly",
  periods: 120,
  annualRatePercent: 6,
  initialPrincipal: 0,
};
