/**
 * 城镇职工基本养老保险待遇测算。
 *
 * 口径依据：
 * - 基础养老金 =（退休时上年度全省全口径城镇单位就业人员月平均工资
 *   + 本人指数化月平均缴费工资）÷ 2 × 缴费年限 × 1%
 * - 个人账户养老金 = 个人账户累计储存额 ÷ 退休年龄对应计发月数
 * - 计发月数取《个人账户养老金计发月数表》（40–70 岁）
 * - 法定退休年龄按《国务院关于渐进式延迟法定退休年龄的办法》近似推算
 *
 * 未纳入：过渡性养老金（1996 年前参加工作的「中人」）、视同缴费年限、
 * 地方性调节金、缴费基数 300% 封顶的逐年重算。结果用于理解结构，
 * 实际金额以社保经办机构核定为准。
 */

export type PensionSex = "male" | "femaleCadre" | "femaleWorker";

export type PensionInput = {
  /** 当前年龄（周岁） */
  age: number;
  /** 计划退休年龄；null 表示按法定退休年龄 */
  retirementAge: number | null;
  sex: PensionSex;
  /** 当前月缴费基数（一般等于上年度月均工资，含奖金） */
  monthlyBase: number;
  /** 本人平均缴费工资指数：1.0 = 恰好按社平工资缴 */
  contributionIndex: number;
  /** 已累计缴费年限 */
  contributedYears: number;
  /** 个人账户当前余额 */
  accountBalance: number;
  /** 参保地上年度全口径月社平工资 */
  socialAverageWage: number;
  /** 社平工资年增速 % */
  socialWageGrowth: number;
  /** 个人工资年增速 % */
  wageGrowth: number;
  /** 个人账户记账利率 % */
  accountRate: number;
  /** 预期寿命 */
  lifeExpectancy: number;
  /** 退休后养老金年调整幅度 % */
  pensionIndexation: number;
};

/** 个人账户养老金计发月数（40–70 岁），人社部统一表。 */
export const PAYOUT_MONTHS: Record<number, number> = {
  40: 233,
  41: 230,
  42: 226,
  43: 223,
  44: 220,
  45: 216,
  46: 212,
  47: 208,
  48: 204,
  49: 199,
  50: 195,
  51: 190,
  52: 185,
  53: 180,
  54: 175,
  55: 170,
  56: 164,
  57: 158,
  58: 152,
  59: 145,
  60: 139,
  61: 132,
  62: 125,
  63: 117,
  64: 109,
  65: 101,
  66: 93,
  67: 84,
  68: 75,
  69: 65,
  70: 56,
};

export function payoutMonthsAt(age: number): number {
  const key = Math.round(age);
  if (key <= 40) return PAYOUT_MONTHS[40]!;
  if (key >= 70) return PAYOUT_MONTHS[70]!;
  return PAYOUT_MONTHS[key] ?? 139;
}

/**
 * 改革后法定退休年龄（近似）。
 *
 * 规则：男职工与原 55 岁女职工，自 1965.1 / 1970.1 起每 4 个月延迟 1 个月，
 * 分别延至 63 / 58 岁；原 50 岁女职工自 1975.1 起每 2 个月延迟 1 个月，延至 55 岁。
 * 这里只按出生年份折算（每年 +3 或 +6 个月），未细分出生月份，
 * 因此边界年份可能与官方查询结果相差 1 个月。
 */
export function statutoryRetirementAge(
  birthYear: number,
  sex: PensionSex,
): number {
  const base = sex === "male" ? 60 : sex === "femaleCadre" ? 55 : 50;
  const startYear = sex === "male" ? 1965 : sex === "femaleCadre" ? 1970 : 1975;
  const stepMonths = sex === "femaleWorker" ? 6 : 3;
  const cap = sex === "male" ? 63 : sex === "femaleCadre" ? 58 : 55;
  const elapsed = Math.max(0, birthYear - startYear);
  const delayMonths = Math.min((cap - base) * 12, elapsed * stepMonths);
  return base + delayMonths / 12;
}

export type PensionYearRow = {
  /** 距离现在的第几年 */
  year: number;
  age: number;
  accountBalance: number;
  /** 当年计入个人账户的金额 */
  contributed: number;
};

export type PensionResult =
  | {
      ok: true;
      /** 距退休年数（不足一年按一年计） */
      yearsToRetirement: number;
      retirementAge: number;
      payoutMonths: number;
      /** 退休时缴费总年限 */
      totalContribYears: number;
      /** 退休时上年度月社平工资 */
      socialAtRetirement: number;
      /** 退休前月薪（替代率分母） */
      wageAtRetirement: number;
      accountBalanceAtRetirement: number;
      basePension: number;
      accountPension: number;
      monthlyTotal: number;
      /** 替代率：月养老金 / 退休前月薪 */
      replacementRate: number;
      /** 个人累计缴费（仅个人账户部分） */
      personalContributed: number;
      /** 单位累计缴费（进入统筹） */
      employerContributed: number;
      /** 预期寿命内的累计领取（含年调整） */
      lifetimePayout: number;
      /** 领取总月数 */
      payoutTotalMonths: number;
      /** 个人账户「回本」年龄 */
      paybackAge: number;
      /** 分年龄对照 */
      byRetirementAge: { age: number; monthly: number; replacement: number }[];
      years: PensionYearRow[];
      /** 缴费基数是否超过社平 300% */
      baseAboveCap: boolean;
      /** 是否低于最低缴费年限（15 年，2030 起逐步提至 20 年） */
      belowMinimumYears: boolean;
    }
  | { ok: false; error: "invalid" };

const MAX_YEARS = 50;

type Core = {
  retirementAge: number;
  months: number;
  totalContribYears: number;
  socialAtRetirement: number;
  wageAtRetirement: number;
  accountBalanceAtRetirement: number;
  basePension: number;
  accountPension: number;
  monthlyTotal: number;
};

function computeCore(
  input: PensionInput,
  retirementAge: number,
): Core {
  const {
    age,
    monthlyBase,
    contributionIndex,
    contributedYears,
    accountBalance,
    socialAverageWage,
    socialWageGrowth,
    wageGrowth,
    accountRate,
  } = input;

  const n = Math.max(0, retirementAge - age);
  const g = socialWageGrowth / 100;
  const w = wageGrowth / 100;
  const r = accountRate / 100;

  const socialAtRetirement = socialAverageWage * (1 + g) ** n;
  const wageAtRetirement = monthlyBase * (1 + w) ** n;

  // 个人账户：存量按记账利率滚存；未来每年缴费（基数 8%）按当年基数计入，
  // 并按「年中计入」折算到退休时点。
  let futureBalance = accountBalance * (1 + r) ** n;
  for (let t = 1; t <= n; t += 1) {
    const yearBase = monthlyBase * (1 + w) ** (t - 1);
    const yearContribution = yearBase * 0.08 * 12;
    futureBalance += yearContribution * (1 + r) ** Math.max(0, n - t + 0.5);
  }

  const totalContribYears = contributedYears + n;
  const basePension =
    ((socialAtRetirement + socialAtRetirement * contributionIndex) / 2) *
    totalContribYears *
    0.01;
  const months = payoutMonthsAt(retirementAge);
  const accountPension = futureBalance / months;

  return {
    retirementAge,
    months,
    totalContribYears,
    socialAtRetirement,
    wageAtRetirement,
    accountBalanceAtRetirement: futureBalance,
    basePension,
    accountPension,
    monthlyTotal: basePension + accountPension,
  };
}

export function calcPension(input: PensionInput): PensionResult {
  const {
    age,
    retirementAge,
    monthlyBase,
    contributionIndex,
    contributedYears,
    accountBalance,
    socialAverageWage,
    socialWageGrowth,
    wageGrowth,
    accountRate,
    lifeExpectancy,
    pensionIndexation,
  } = input;

  const resolvedAge =
    retirementAge ?? statutoryRetirementAge(new Date().getFullYear() - age, input.sex);

  const invalid =
    !(age >= 18) ||
    age > 70 ||
    !(resolvedAge > age) ||
    resolvedAge > 70 ||
    !(monthlyBase > 0) ||
    monthlyBase > 1_000_000 ||
    !(contributionIndex >= 0.4) ||
    contributionIndex > 3 ||
    !(contributedYears >= 0) ||
    contributedYears > 45 ||
    !(accountBalance >= 0) ||
    !(socialAverageWage > 0) ||
    socialAverageWage > 100_000 ||
    socialWageGrowth < -5 ||
    socialWageGrowth > 15 ||
    wageGrowth < -5 ||
    wageGrowth > 20 ||
    accountRate < 0 ||
    accountRate > 10 ||
    !(lifeExpectancy > resolvedAge) ||
    lifeExpectancy > 110 ||
    pensionIndexation < 0 ||
    pensionIndexation > 10;

  if (invalid) return { ok: false, error: "invalid" };

  const n = resolvedAge - age;
  if (n > MAX_YEARS) return { ok: false, error: "invalid" };

  const core = computeCore(input, resolvedAge);

  const personalContributed =
    accountBalance +
    sumContributions(monthlyBase, wageGrowth / 100, n, 0.08);
  const employerContributed = sumContributions(
    monthlyBase,
    wageGrowth / 100,
    n,
    0.16,
  );

  // 领取期：从退休到预期寿命，按年调整后累加。
  const payoutYears = Math.ceil(lifeExpectancy - core.retirementAge);
  const idxRate = pensionIndexation / 100;
  let lifetimePayout = 0;
  for (let y = 0; y < payoutYears; y += 1) {
    lifetimePayout += core.monthlyTotal * 12 * (1 + idxRate) ** y;
  }
  const payoutTotalMonths = Math.round(
    (lifeExpectancy - core.retirementAge) * 12,
  );

  // 分年龄对照：从「不早于当前年龄 + 1」到 70，每 1 岁算一次。
  const comparison: { age: number; monthly: number; replacement: number }[] = [];
  const startAge = Math.max(Math.ceil(age) + 1, 50);
  for (let a = startAge; a <= 70; a += 1) {
    const c = computeCore(input, a);
    comparison.push({
      age: a,
      monthly: c.monthlyTotal,
      replacement:
        c.wageAtRetirement > 0 ? c.monthlyTotal / c.wageAtRetirement : 0,
    });
  }

  // 逐年账户余额轨迹（用于明细表）
  const years: PensionYearRow[] = [];
  let running = accountBalance;
  const w = wageGrowth / 100;
  const r = accountRate / 100;
  for (let y = 1; y <= Math.min(40, Math.ceil(n)); y += 1) {
    const contrib = monthlyBase * (1 + w) ** (y - 1) * 0.08 * 12;
    running = running * (1 + r) + contrib * (1 + r) ** 0.5;
    years.push({
      year: y,
      age: age + y,
      accountBalance: running,
      contributed: contrib,
    });
  }

  return {
    ok: true,
    yearsToRetirement: n,
    retirementAge: resolvedAge,
    payoutMonths: core.months,
    totalContribYears: core.totalContribYears,
    socialAtRetirement: core.socialAtRetirement,
    wageAtRetirement: core.wageAtRetirement,
    accountBalanceAtRetirement: core.accountBalanceAtRetirement,
    basePension: core.basePension,
    accountPension: core.accountPension,
    monthlyTotal: core.monthlyTotal,
    replacementRate:
      core.wageAtRetirement > 0
        ? core.monthlyTotal / core.wageAtRetirement
        : 0,
    personalContributed,
    employerContributed,
    lifetimePayout,
    payoutTotalMonths,
    paybackAge: core.retirementAge + core.months / 12,
    byRetirementAge: comparison,
    years,
    baseAboveCap: monthlyBase > socialAverageWage * 3,
    belowMinimumYears: core.totalContribYears < 15,
  };
}

function sumContributions(
  monthlyBase: number,
  growth: number,
  years: number,
  rate: number,
) {
  let total = 0;
  for (let t = 1; t <= years; t += 1) {
    total += monthlyBase * (1 + growth) ** (t - 1) * rate * 12;
  }
  return total;
}

export const PENSION_EXAMPLE: PensionInput = {
  age: 32,
  retirementAge: null,
  sex: "male",
  monthlyBase: 12_000,
  /** 基数 12000 ÷ 社平 8000 = 1.5，示例保持自洽 */
  contributionIndex: 1.5,
  contributedYears: 6,
  accountBalance: 60_000,
  socialAverageWage: 8_000,
  socialWageGrowth: 2,
  wageGrowth: 3,
  accountRate: 2,
  lifeExpectancy: 85,
  pensionIndexation: 2,
};

/** 缴费指数低档 / 中档 / 高档的常见取值，供选择器使用。 */
export const CONTRIBUTION_INDEX_PRESETS = [0.6, 0.8, 1, 1.5, 2, 3];
