/**
 * 银行存款利息与购买力测算。
 *
 * 口径依据：
 * - 整存整取到期一次还本付息，按单利计息：利息 = 本金 × 年利率 × 存期（年）
 * - 提前支取：已取消「靠档计息」，全部按支取日活期挂牌利率计息
 * - 到期自动转存不再沿用原利率，按转存日挂牌利率执行
 * - 储蓄存款利息所得自 2008-10-09 起暂免征收个人所得税，故此处不计税
 *
 * 与复利工具的差别：复利工具回答「假设年化 X%，多年后值多少」；
 * 本工具回答「这笔钱按银行产品的实际规则，到期能拿多少、提前取损失多少、
 * 扣掉通胀还剩多少购买力」。
 */

export type DepositInput = {
  principal: number;
  /** 存期（月）：3 / 6 / 12 / 24 / 36 / 60 */
  termMonths: number;
  /** 年利率 % */
  annualRatePercent: number;
  /** 计划持有年数（用于滚存对比） */
  holdYears: number;
  /** 通胀率 % */
  inflationPercent: number;
  /** 存入后第几个月提前支取；0 表示持有到期 */
  earlyWithdrawMonth: number;
  /** 活期利率 % */
  demandRatePercent: number;
};

export type DepositYearRow = {
  year: number;
  /** 年末本息合计（按期滚存，不足一期按活期） */
  value: number;
  /** 年末累计利息 */
  interest: number;
};

export type DepositResult =
  | {
      ok: true;
      termYears: number;
      /** 一期到期的利息 */
      maturityInterest: number;
      maturityValue: number;
      /** 计划持有期内的滚存次数 */
      rollCount: number;
      /** 滚存结束后的本息（含不足一期的活期利息） */
      holdValue: number;
      holdInterest: number;
      /** 持有期名义年化（几何平均） */
      nominalAnnual: number;
      /** 扣通胀后的实际年化 */
      realAnnual: number;
      /** 持有期末的购买力（按今日币值） */
      realValue: number;
      /** 购买力口径的盈亏 */
      realGain: number;
      /** 提前支取：按活期计得的利息 */
      earlyInterest: number;
      earlyValue: number;
      /** 相比到期少拿的利息 */
      earlyLoss: number;
      /** 损失占应得利息的比例 */
      earlyLossRatio: number;
      /** 提前支取是否真的发生（早于存期结束） */
      earlyApplies: boolean;
      /** 同样本金放活期的利息（对照） */
      demandInterest: number;
      years: DepositYearRow[];
    }
  | { ok: false; error: "invalid" };

const ALLOWED_TERMS = [3, 6, 12, 24, 36, 60];

export function calcDeposit(input: DepositInput): DepositResult {
  const {
    principal,
    termMonths,
    annualRatePercent,
    holdYears,
    inflationPercent,
    earlyWithdrawMonth,
    demandRatePercent,
  } = input;

  if (
    !(principal > 0) ||
    principal > 1_000_000_000 ||
    !ALLOWED_TERMS.includes(termMonths) ||
    !(annualRatePercent >= 0) ||
    annualRatePercent > 15 ||
    !(holdYears > 0) ||
    holdYears > 50 ||
    inflationPercent < -5 ||
    inflationPercent > 20 ||
    !(demandRatePercent >= 0) ||
    demandRatePercent > 5 ||
    earlyWithdrawMonth < 0 ||
    earlyWithdrawMonth > holdYears * 12
  ) {
    return { ok: false, error: "invalid" };
  }

  const rate = annualRatePercent / 100;
  const demand = demandRatePercent / 100;
  const termYears = termMonths / 12;

  const maturityInterest = principal * rate * termYears;
  const maturityValue = principal + maturityInterest;

  // 滚存：每期按「本金 + 已有利息」继续以同利率单利计息。
  const totalMonths = Math.round(holdYears * 12);
  const rollCount = Math.floor(totalMonths / termMonths);
  let value = principal;
  for (let i = 0; i < rollCount; i += 1) {
    value += value * rate * termYears;
  }
  const leftoverMonths = totalMonths - rollCount * termMonths;
  if (leftoverMonths > 0) {
    value += value * demand * (leftoverMonths / 12);
  }
  const holdValue = value;
  const holdInterest = holdValue - principal;
  const nominalAnnual = (holdValue / principal) ** (1 / holdYears) - 1;
  const inflation = inflationPercent / 100;
  const realAnnual = (1 + nominalAnnual) / (1 + inflation) - 1;
  const realValue = holdValue / (1 + inflation) ** holdYears;
  const realGain = realValue - principal;

  // 提前支取：整笔按活期计息（已取消靠档计息）。
  const earlyApplies = earlyWithdrawMonth > 0 && earlyWithdrawMonth < termMonths;
  const earlyInterest =
    principal * demand * (Math.max(1, earlyWithdrawMonth) / 12);
  const earlyValue = principal + earlyInterest;
  const earlyLoss = earlyApplies ? maturityInterest - earlyInterest : 0;
  const earlyLossRatio =
    earlyApplies && maturityInterest > 0 ? earlyLoss / maturityInterest : 0;

  const demandInterest = principal * demand * holdYears;

  // 逐年轨迹：前几期按存期滚存，末段不足一期按活期。
  const years: DepositYearRow[] = [];
  let running = principal;
  for (let y = 1; y <= Math.min(50, Math.ceil(holdYears)); y += 1) {
    const monthsToYearEnd = Math.min(y * 12, totalMonths);
    let v = principal;
    const rolls = Math.floor(monthsToYearEnd / termMonths);
    for (let i = 0; i < rolls; i += 1) v += v * rate * termYears;
    const rest = monthsToYearEnd - rolls * termMonths;
    if (rest > 0) v += v * demand * (rest / 12);
    running = v;
    years.push({ year: y, value: running, interest: running - principal });
  }

  return {
    ok: true,
    termYears,
    maturityInterest,
    maturityValue,
    rollCount,
    holdValue,
    holdInterest,
    nominalAnnual,
    realAnnual,
    realValue,
    realGain,
    earlyInterest,
    earlyValue,
    earlyLoss,
    earlyLossRatio,
    earlyApplies,
    demandInterest,
    years,
  };
}

export const DEPOSIT_EXAMPLE: DepositInput = {
  principal: 100_000,
  termMonths: 36,
  annualRatePercent: 1.25,
  holdYears: 3,
  inflationPercent: 1.5,
  earlyWithdrawMonth: 0,
  demandRatePercent: 0.05,
};

/** 国有大行 2026 年挂牌利率参考（整存整取），仅作表单默认值的锚点。 */
export const DEPOSIT_RATE_REFERENCE: { months: number; rate: number }[] = [
  { months: 3, rate: 0.65 },
  { months: 6, rate: 0.85 },
  { months: 12, rate: 0.95 },
  { months: 24, rate: 1.05 },
  { months: 36, rate: 1.25 },
  { months: 60, rate: 1.3 },
];
