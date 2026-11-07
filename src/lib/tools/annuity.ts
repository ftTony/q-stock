/**
 * 年金核心 —— 复利计算器与定投计算器共用。
 *
 * 两个工具在代数上是同一个问题：
 *
 *   终值 = 本金 ×(1+i)^N + 每期投入 × ((1+i)^N − 1) / i
 *
 * 唯一的实质差异是 i 从年化怎么换算到每期，也就是「利率口径」：
 *
 * - 名义年利率 r，每年复利 n 次：i = r / n
 *   用于复利工具。这一支的存在意义是演示「复利频率」本身：
 *   10% 名义按月复利，实际有效年化是 10.47%，频率越高有效收益越高。
 * - 有效年化 r（真实年收益）：i = (1+r)^(1/n) − 1
 *   用于定投工具。基金/指数的历史年化、预期收益都是有效年化口径，
 *   直接除以 12 会低估每期收益。
 *
 * 两者互为换算：(1 + r/n)^n − 1 = 有效年化。
 * 因此同参数下两个工具的结果差异，可以完全由这一项解释（残差为 0）。
 */

export type AnnuityParams = {
  /** 期初已有本金 */
  principal: number;
  /** 每期期末追加投入 */
  contribution: number;
  /** 总期数 */
  periods: number;
  /** 每期利率（小数） */
  periodRate: number;
};

export type AnnuityYearRow = {
  year: number;
  /** 该年末对应的期数 */
  periodsEnd: number;
  /** 累计投入（本金 + 各期投入） */
  contributed: number;
  /** 该年末估值 */
  value: number;
};

/** 名义年利率 → 每期利率。 */
export function periodRateFromNominal(
  nominalRate: number,
  nPerYear: number,
): number {
  return nominalRate / nPerYear;
}

/** 有效年化 → 每期利率。 */
export function periodRateFromEffective(
  effectiveRate: number,
  nPerYear: number,
): number {
  return (1 + effectiveRate) ** (1 / nPerYear) - 1;
}

/** 名义年利率 → 有效年化（百分比输入输出）。 */
export function effectiveFromNominal(
  nominalPercent: number,
  nPerYear: number,
): number {
  const r = nominalPercent / 100;
  return ((1 + r / nPerYear) ** nPerYear - 1) * 100;
}

/** 有效年化 → 等价的名义年利率（百分比输入输出）。 */
export function nominalFromEffective(
  effectivePercent: number,
  nPerYear: number,
): number {
  const r = effectivePercent / 100;
  return ((1 + r) ** (1 / nPerYear) - 1) * nPerYear * 100;
}

/** 年金终值。contribution 为每期期末投入。 */
export function annuityFutureValue({
  principal,
  contribution,
  periods,
  periodRate,
}: AnnuityParams): number {
  const growth = (1 + periodRate) ** periods;
  const fvPrincipal = principal * growth;
  const fvContribution =
    contribution === 0
      ? 0
      : periodRate === 0
        ? contribution * periods
        : contribution * ((growth - 1) / periodRate);
  return fvPrincipal + fvContribution;
}

/** 逐年明细（不足一年的尾期并入最后一行）。 */
export function buildAnnuityYearRows(
  params: AnnuityParams & { nPerYear: number },
): AnnuityYearRow[] {
  const { principal, contribution, periods, periodRate, nPerYear } = params;
  const rows: AnnuityYearRow[] = [];
  const fullYears = Math.ceil(periods / nPerYear);
  for (let year = 1; year <= fullYears; year += 1) {
    const periodsEnd = Math.min(year * nPerYear, periods);
    rows.push({
      year,
      periodsEnd,
      contributed: principal + contribution * periodsEnd,
      value: annuityFutureValue({
        principal,
        contribution,
        periods: periodsEnd,
        periodRate,
      }),
    });
  }
  return rows;
}
