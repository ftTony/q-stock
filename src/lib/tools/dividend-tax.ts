/**
 * 股息红利税后测算。
 *
 * 同一个工具要同时服务两类用户，所以先问「你是谁」，再问「你买的是什么」：
 *
 * A. 中国大陆个人投资者（境内券商 / 港股通）
 *    1. A 股 —— 财税〔2015〕101 号、〔2012〕85 号
 *       持股 ≤1 个月：全额计入，实际税负 20%
 *       持股 1 个月至 1 年（含）：减按 50% 计入，实际税负 10%
 *       持股 >1 年：暂免征收个人所得税
 *       派息时暂不扣缴，转让时由中国结算按「先进先出」补扣。
 *    2. 港股通 —— 财税〔2014〕81 号、〔2016〕127 号
 *       H 股（内地注册、香港上市）：H 股公司按 20% 代扣个人所得税
 *       非 H 股（红筹等境外注册）：中国结算按 20% 代扣个人所得税
 *       港股通没有「持股满一年免税」，持股期限不影响税率。
 *       红筹的双重扣税：境外控股公司的境内子公司分配利润需缴 10% 预提所得税，
 *       余下部分再由个人承担 20%，1 − 90% × 80% = 28%（市场常用口径，取决于
 *       公司架构；若企业端按 20% 扣，综合税负可达 36%）。
 *    3. 美股 —— 中美税收协定：默认预扣 30%，申报协定待遇后 10%。
 *
 * B. 境外投资者（非中国大陆税务居民；通过沪深港通北向或海外券商）
 *    1. A 股（北向）—— 财税〔2014〕81 号及深港通对应文件：上市公司按 10%
 *       代扣所得税，不执行按持股时间差别化征税，即不论持有多久都是 10%。
 *       资本利得暂免（政策延续中，需以最新公告为准）。
 *    2. 港股 —— 香港不对股息征预扣税，H 股到手即全额；红筹的 10% 是境内
 *       子公司向境外母公司分配时的预提所得税，在派息前已被扣掉，投资者侧不再
 *       重复计税，因此综合口径按 10% 计。
 *    3. 美股 —— 非美国税务居民法定预扣 30%；提交 W-8BEN 并适用税收协定后
 *       通常为 10%（如中国、日本）或 15%（如德国、法国、英国、加拿大）。
 *
 * 只算「现金分红」到手多少，不含资本利得税、不含州税/地方附加税、不含
 * 爱尔兰注册 ETF 等基金层面的特殊口径。
 */

export type DividendMarket = "a-share" | "hk-h" | "hk-red-chip" | "us";

/** 投资者税务居民身份：中国大陆个人 / 境外投资者。 */
export type DividendResidence = "mainland" | "overseas";

export type DividendTaxInput = {
  /** 税前现金分红 */
  grossDividend: number;
  residence: DividendResidence;
  market: DividendMarket;
  /** 持股天数，仅中国大陆个人持有 A 股时使用 */
  holdingDays: number;
  /** 美股预扣率 %：30 = 未申报协定/无协定，15 或 10 = 协定税率 */
  usWithholdingPercent: number;
};

export type DividendScenario = {
  key:
    | "aShareLong"
    | "aShareMid"
    | "aShareShort"
    | "aShareConnect"
    | "hkH"
    | "hkHoverseas"
    | "hkRedChip"
    | "hkRedChipOverseas"
    | "usTreaty"
    | "usNoTreaty";
  /** 总税负率（小数） */
  rate: number;
  net: number;
};

export type DividendTaxResult =
  | {
      ok: true;
      residence: DividendResidence;
      market: DividendMarket;
      gross: number;
      /** 企业/预提层面被扣掉的金额（红筹股、美股预扣） */
      corporateWithholding: number;
      /** 个人层面个税 */
      individualTax: number;
      totalTax: number;
      net: number;
      /** 总税负率（小数） */
      effectiveRate: number;
      /** 个人适用税率（小数） */
      personalRate: number;
      /** 企业/预提适用税率（小数） */
      corporateRate: number;
      /** A 股命中的档位说明；境外投资者与「持有满一年免税」不适用时为 null */
      aShareTier: "long" | "mid" | "short" | null;
      comparison: DividendScenario[];
    }
  | { ok: false; error: "invalid" };

const MAX_GROSS = 1_000_000_000;

/** A 股按持股期限的个税税率。1 个月含当月，1 年含当年。 */
export function aSharePersonalRate(holdingDays: number): {
  rate: number;
  tier: "long" | "mid" | "short";
} {
  if (holdingDays > 365) return { rate: 0, tier: "long" };
  if (holdingDays > 30) return { rate: 0.1, tier: "mid" };
  return { rate: 0.2, tier: "short" };
}

export function calcDividendTax(input: DividendTaxInput): DividendTaxResult {
  const { grossDividend, residence, market, holdingDays } = input;

  if (
    !(grossDividend > 0) ||
    grossDividend > MAX_GROSS ||
    !Number.isFinite(holdingDays) ||
    holdingDays < 0
  ) {
    return { ok: false, error: "invalid" };
  }

  const usRateRaw = Number(input.usWithholdingPercent);
  const usRate = Number.isFinite(usRateRaw)
    ? Math.min(30, Math.max(0, usRateRaw)) / 100
    : 0.3;

  const mainland = residence === "mainland";
  let corporateRate = 0;
  let personalRate = 0;
  let aShareTier: "long" | "mid" | "short" | null = null;

  if (market === "a-share") {
    if (mainland) {
      const tier = aSharePersonalRate(holdingDays);
      personalRate = tier.rate;
      aShareTier = tier.tier;
    } else {
      // 北向资金：10% 代扣，无持股期限差别化。
      personalRate = 0.1;
    }
  } else if (market === "hk-h") {
    personalRate = mainland ? 0.2 : 0;
  } else if (market === "hk-red-chip") {
    corporateRate = 0.1;
    personalRate = mainland ? 0.2 : 0;
  } else {
    personalRate = usRate;
  }

  const corporateWithholding = grossDividend * corporateRate;
  const afterCorporate = grossDividend - corporateWithholding;
  const individualTax = afterCorporate * personalRate;
  const totalTax = corporateWithholding + individualTax;
  const net = grossDividend - totalTax;

  const scenarios: { key: DividendScenario["key"]; rate: number }[] = mainland
    ? [
        { key: "aShareLong", rate: 0 },
        { key: "aShareMid", rate: 0.1 },
        { key: "aShareShort", rate: 0.2 },
        { key: "hkH", rate: 0.2 },
        { key: "hkRedChip", rate: 1 - 0.9 * 0.8 },
        { key: "usTreaty", rate: 0.1 },
        { key: "usNoTreaty", rate: 0.3 },
      ]
    : [
        { key: "aShareConnect", rate: 0.1 },
        { key: "hkHoverseas", rate: 0 },
        { key: "hkRedChipOverseas", rate: 0.1 },
        { key: "usTreaty", rate: 0.1 },
        { key: "usNoTreaty", rate: 0.3 },
      ];

  return {
    ok: true,
    residence,
    market,
    gross: grossDividend,
    corporateWithholding,
    individualTax,
    totalTax,
    net,
    effectiveRate: totalTax / grossDividend,
    personalRate,
    corporateRate,
    aShareTier,
    comparison: scenarios.map((s) => ({
      key: s.key,
      rate: s.rate,
      net: grossDividend * (1 - s.rate),
    })),
  };
}

export const DIVIDEND_TAX_EXAMPLE: DividendTaxInput = {
  grossDividend: 10_000,
  residence: "mainland",
  market: "hk-red-chip",
  holdingDays: 400,
  usWithholdingPercent: 10,
};
