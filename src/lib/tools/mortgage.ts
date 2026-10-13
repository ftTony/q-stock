export type MortgageMethod = "equal_payment" | "equal_principal";

export type MortgageInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
  method: MortgageMethod;
};

export type MortgageYearRow = {
  year: number;
  /** Cumulative principal paid by end of year. */
  principalPaid: number;
  /** Cumulative interest paid by end of year. */
  interestPaid: number;
  /** Remaining balance at end of year. */
  balance: number;
};

export type MortgageResult =
  | {
      ok: true;
      months: number;
      /** First-month payment (equal_principal) or every month (equal_payment). */
      monthlyPayment: number;
      /** Last-month payment when equal_principal; same as monthlyPayment for equal_payment. */
      lastPayment: number;
      totalPayment: number;
      totalInterest: number;
      years: MortgageYearRow[];
    }
  | { ok: false; error: "invalid" };

const MAX_YEARS = 40;

export function calcMortgage(input: MortgageInput): MortgageResult {
  const { principal, annualRatePercent, years, method } = input;

  if (
    !(principal > 0) ||
    !(years >= 1) ||
    years > MAX_YEARS ||
    !(annualRatePercent >= 0) ||
    annualRatePercent > 30
  ) {
    return { ok: false, error: "invalid" };
  }

  const months = Math.round(years * 12);
  const r = annualRatePercent / 100 / 12;

  if (method === "equal_payment") {
    return equalPayment(principal, r, months);
  }
  return equalPrincipal(principal, r, months);
}

function equalPayment(
  principal: number,
  r: number,
  months: number,
): MortgageResult {
  const monthlyPayment =
    r === 0
      ? principal / months
      : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);

  let balance = principal;
  let interestPaid = 0;
  let principalPaid = 0;
  const years: MortgageYearRow[] = [];
  const totalYears = Math.ceil(months / 12);

  for (let m = 1; m <= months; m += 1) {
    const interest = balance * r;
    const principalPart = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPart);
    interestPaid += interest;
    principalPaid += principalPart;

    if (m % 12 === 0 || m === months) {
      years.push({
        year: Math.min(totalYears, Math.ceil(m / 12)),
        principalPaid,
        interestPaid,
        balance,
      });
    }
  }

  const totalPayment = monthlyPayment * months;
  return {
    ok: true,
    months,
    monthlyPayment,
    lastPayment: monthlyPayment,
    totalPayment,
    totalInterest: totalPayment - principal,
    years,
  };
}

function equalPrincipal(
  principal: number,
  r: number,
  months: number,
): MortgageResult {
  const principalPart = principal / months;
  let balance = principal;
  let interestPaid = 0;
  let principalPaid = 0;
  let firstPayment = 0;
  let lastPayment = 0;
  const years: MortgageYearRow[] = [];
  const totalYears = Math.ceil(months / 12);

  for (let m = 1; m <= months; m += 1) {
    const interest = balance * r;
    const payment = principalPart + interest;
    if (m === 1) firstPayment = payment;
    if (m === months) lastPayment = payment;
    balance = Math.max(0, balance - principalPart);
    interestPaid += interest;
    principalPaid += principalPart;

    if (m % 12 === 0 || m === months) {
      years.push({
        year: Math.min(totalYears, Math.ceil(m / 12)),
        principalPaid,
        interestPaid,
        balance,
      });
    }
  }

  const totalInterest = interestPaid;
  return {
    ok: true,
    months,
    monthlyPayment: firstPayment,
    lastPayment,
    totalPayment: principal + totalInterest,
    totalInterest,
    years,
  };
}

export const MORTGAGE_EXAMPLE: MortgageInput = {
  principal: 1_000_000,
  annualRatePercent: 3.5,
  years: 30,
  method: "equal_payment",
};
