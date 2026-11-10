import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Single / covered / vertical / collar — matches drawer templates. */
export const LEARN_ARTICLES_SEO_OPTIONS_DIRECTIONAL: LearnArticle[] = [
  {
    slug: "options-strategies-directional",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Four drawer templates with a direction or a stock: single, covered, vertical, collar",
      "zh-CN": "带方向或带持股的四种模板：单腿、股票担保、垂直、领口",
    },
    summary: {
      en: "These four structures live in the symbol options drawer. For each: what it is for, when people usually reach for it, and the max profit / max loss shape — with one vertical worked out in numbers.",
      "zh-CN":
        "这四种结构就在个股期权抽屉里。每种写清：干什么用、什么情况下会想到它，以及到期假设下的最大盈亏形状——垂直价差用假设数字算一遍。",
    },
    paragraphs: {
      en: [
        "Single legs buy a story with a receipt for the premium. Covered and collar sit on shares you already own. Verticals buy a band of outcomes instead of the whole wing.",
        "Numbers below assume one contract = 100 shares, ignore commissions, and are hypothetical.",
      ],
      "zh-CN": [
        "单腿买入是用权利金买一个故事；股票担保和领口坐在已有持股上；垂直价差买的是一段价格区间，不是整条翅膀。",
        "下面的数字按 1 张 = 100 股估算，不含佣金，全部为假设。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Open a US symbol page, tap Options, and the drawer offers these four as strategy chips. The legs it generates match the skeletons below — but every table here is a shape, not a quote. Re-price with live premiums before you treat any number as your risk.",
        },
        { type: "h2", text: "Single-leg option" },
        {
          type: "p",
          text: "One call or one put. The buyer's virtue is that the worst case is printed on the ticket: premium paid is the max loss. The seller's contract is the opposite — small collected premium, potentially large obligation. A naked short call has theoretically uncapped losses, which is why the drawer defaults to the long side.",
        },
        {
          type: "table",
          head: ["Side", "Typical use", "Max profit (expiry)", "Max loss (expiry)"],
          rows: [
            ["Long call", "Bullish with limited capital", "Theoretically uncapped", "Premium paid"],
            ["Long put", "Bearish, or insurance on shares", "Strike × 100 − premium (if underlying → 0)", "Premium paid"],
            ["Short call (naked)", "Collect premium, accept upside obligation", "Premium received", "Theoretically uncapped"],
            ["Short put (naked)", "Collect premium, accept assignment below strike", "Premium received", "Strike × 100 − premium"],
          ],
          caption:
            "Break-even ≈ strike + premium for a long call, strike − premium for a long put (per share).",
        },
        { type: "h2", text: "Covered stock (covered call)" },
        {
          type: "p",
          text: "Long 100 shares + short 1 call. In plain terms: you sell everything above the strike and keep the premium as payment. It is not free income — the day the stock runs past your strike, you deliver shares at a price you once thought was low. Fine if you genuinely wanted to sell there; painful if the thesis was \u201cit has much further to go\u201d.",
        },
        {
          type: "table",
          head: ["Item", "Shape"],
          rows: [
            ["Max profit", "(Call strike − stock entry) × 100 + call premium"],
            ["Max loss", "Stock can fall toward zero; the premium only cushions it"],
            ["Break-even", "Stock entry − call premium (per share)"],
            ["When assigned", "Shares called away at the strike; upside beyond that is gone"],
          ],
          caption: "Expiry shapes, per contract, ignoring fees.",
        },
        { type: "h2", text: "Vertical spread, worked in numbers" },
        {
          type: "p",
          text: "Same expiry, same type, two strikes. Say the stock is at 100 and you expect it near 105, not through the roof. Buy the 100 call at 3.20, sell the 105 call at 1.40: net debit 1.80, or 180 dollars a contract. That is a bull call spread.",
        },
        {
          type: "table",
          head: ["Item", "Vertical (100/105)", "Lone 100 call"],
          rows: [
            ["Net debit", "1.80", "3.20"],
            ["Max profit", "(5.00 − 1.80) × 100 = 320", "Theoretically uncapped"],
            ["Max loss", "180", "320"],
            ["Break-even", "101.80", "103.20"],
          ],
          caption:
            "Hypothetical premiums. The vertical costs 44% less, cuts max loss nearly in half, and gives up everything above 105.",
        },
        {
          type: "p",
          text: "If the honest version of your thesis is \u201cup to about 105\u201d, the vertical matches it better than a lone call does. A bear put vertical mirrors the shape (buy the higher put, sell the lower). Credit verticals flip the signs: max profit is the net credit, max loss is width minus credit.",
        },
        { type: "h2", text: "Collar" },
        {
          type: "p",
          text: "Long stock + long put (floor) + short call (ceiling). Worked example: shares bought at 92, buy the 85 put for 2.40, sell the 100 call for 2.60 — net credit 0.20. Max loss lands near (92 − 85 − 0.2) × 100 ≈ 680; max profit near (100 − 92 + 0.2) × 100 ≈ 820; the stock's break-even drops from 92 to about 91.8. Pick strikes well and the net cost approaches zero, sometimes even a credit. The price is always the same: upside above the call is sold.",
        },
        { type: "h2", text: "Common ways this goes wrong" },
        {
          type: "ul",
          items: [
            "Treating a covered call as interest: the premium is the price of the upside you sold, not a dividend on being clever.",
            "Crossing the spread at market on the short leg. Options markets are wide; glance at the bid-ask in the drawer before the order, and let limit orders do the walking.",
            "Choosing collar strikes by \u201cnet cost ≈ 0\u201d alone. A floor far below spot is decoration, and a ceiling near spot gets capped within the week.",
          ],
        },
        { type: "h2", text: "Where to check these in Q-Stock" },
        {
          type: "p",
          text: "In the drawer: strategy chips build the legs, clicking a different chain row re-prices them on the spot, and the risk summary says \u201cmax loss about $X\u201d in plain words before the payoff chart gets a chance to flatter you. To stress-test a structure — different IV, American-style early exercise, expiry moving — open /tools/options and edit the inputs. After the fill, log the thesis and the break-even in /review so the position has a record that is not just P&L.",
        },
        {
          type: "note",
          text: "Educational only, not investment advice. Naked short options can lose far more than the premium collected. Re-run every structure on live premiums, multipliers and early-assignment rules before sizing.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "打开美股个股页 → 期权，抽屉里就有这四个策略芯片。生成的腿和下面的骨架一致——但这里的每张表都是形状，不是报价。任何数字当风险之前，先用实时权利金重算。",
        },
        { type: "h2", text: "单腿期权" },
        {
          type: "p",
          text: "一张 Call 或一张 Put。买方的好处是最坏情况印在成交单上：权利金就是最大亏损。卖方的合同正好相反——收的权利金很小，担的义务可以很大。裸卖看涨的亏损理论上不封顶，所以抽屉默认从买入侧开始。",
        },
        {
          type: "table",
          head: ["方向", "常见用途", "到期最大盈利", "到期最大亏损"],
          rows: [
            ["买看涨", "小资金看多", "理论上不封顶", "已付权利金"],
            ["买看跌", "看空，或给持股保险", "行权价×100 − 权利金（标的归零时）", "已付权利金"],
            ["裸卖看涨", "收权利金，承担上方义务", "收到的权利金", "理论上不封顶"],
            ["裸卖看跌", "收权利金，接受下方被指派", "收到的权利金", "行权价×100 − 权利金"],
          ],
          caption: "盈亏平衡：买看涨 ≈ 行权价 + 权利金；买看跌 ≈ 行权价 − 权利金（每股）。",
        },
        { type: "h2", text: "股票担保（备兑看涨）" },
        {
          type: "p",
          text: "持股 100 + 卖 1 张 Call。说白了：把行权价之上的上涨全部卖掉，权利金是卖价。它不是白捡的利息——股价冲过行权价那天，你要按一个当初自己嫌低的价格交货。若你本就愿意在那个位置卖，没损失什么；若论点是「后面还有一大段」，那会很疼。",
        },
        {
          type: "table",
          head: ["项目", "形状"],
          rows: [
            ["最大盈利", "(Call 行权价 − 持股成本) × 100 + Call 权利金"],
            ["最大亏损", "股价可朝零跌，权利金只是垫了一层"],
            ["盈亏平衡", "持股成本 − Call 权利金（每股）"],
            ["被行权时", "股票按行权价被叫走，之上的涨幅不再属于你"],
          ],
          caption: "到期形状，每张合约，不含费用。",
        },
        { type: "h2", text: "垂直价差，带数字走一遍" },
        {
          type: "p",
          text: "同到期、同类型、两个行权价。假设股价 100，你预期它走到 105 附近，而不是飞天：买 100 Call 付 3.20，卖 105 Call 收 1.40，净支出 1.80——一张合约 180 美元。这就是牛市看涨价差。",
        },
        {
          type: "table",
          head: ["项目", "垂直（100/105）", "单买 100 Call"],
          rows: [
            ["净支出", "1.80", "3.20"],
            ["最大盈利", "(5.00 − 1.80) × 100 = 320", "理论上不封顶"],
            ["最大亏损", "180", "320"],
            ["盈亏平衡", "101.80", "103.20"],
          ],
          caption:
            "假设权利金。垂直便宜 44%，最大亏损砍掉近一半，代价是把 105 以上的空间让给别人。",
        },
        {
          type: "p",
          text: "如果你的论点诚实的版本是「涨到 105 附近」，垂直比单买 Call 更贴切。熊市镜像用看跌价差（买高 Put、卖低 Put）。信用垂直把符号翻过来：最大盈利是净收入，最大亏损是间距减净收入。",
        },
        { type: "h2", text: "领口" },
        {
          type: "p",
          text: "持股 + 买 Put（地板）+ 卖 Call（天花板）。算例：持股成本 92，买 85 Put 付 2.40，卖 100 Call 收 2.60，净收 0.20。最大亏损约 (92 − 85 − 0.2) × 100 ≈ 680，最大盈利约 (100 − 92 + 0.2) × 100 ≈ 820，持股盈亏平衡从 92 降到约 91.8。行权价挑得好，净成本可以接近零甚至净收——代价永远是同一个：天花板以上归别人。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "把备兑当利息收：权利金是你卖出上涨的价钱，不是聪明的分红。",
            "短腿用市价单直接打穿价差。期权市场价差宽，下单前看一眼抽屉里的买卖价，让限价单去谈。",
            "领口只盯着「净成本是不是零」，不看行权价离现价多远——离太远的地板是摆设，贴太近的天花板一周内就被顶。",
          ],
        },
        { type: "h2", text: "在钱力股里核对" },
        {
          type: "p",
          text: "抽屉里：策略芯片搭腿，链上换一行行权价即时重定价，风险摘要先用白话给出「最多亏约 $X」，然后才是盈亏图。想给结构做压力测试——换 IV、看美式提前行权、挪到期日——去 /tools/options 期权计算器改参数。成交后把论点和平衡点写进 /review，让这笔仓位留下盈亏之外的记录。",
        },
        {
          type: "note",
          text: "仅供学习，不构成投资建议。裸卖期权的亏损可能远超收到的权利金。定仓前用实时权利金、合约乘数与提前行权规则重算每一个结构。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is a covered call \u201cfree income\u201d?",
          a: "No. You sold the upside above the strike, and the premium is the price of that sale. If the stock gaps past your strike, you deliver at a price you set while it was lower.",
        },
        {
          q: "Why would I pick a vertical over a lone call?",
          a: "In the worked example: 44% less debit, max loss nearly halved, break-even closer. You only give up the wing above the short strike — which you did not believe in anyway.",
        },
        {
          q: "Can a collar really cost zero?",
          a: "Sometimes the call premium fully pays for the put, occasionally more. But a zero net cost says nothing about whether the strikes are sensibly placed around your actual price and thesis.",
        },
        {
          q: "If my max loss is capped, is the position safe?",
          a: "Capped is not safe. A capped loss of 680 dollars is still 680 dollars. Size by whether you can say the max-loss number out loud without flinching.",
        },
      ],
      "zh-CN": [
        {
          q: "备兑看涨是「白捡利息」吗？",
          a: "不是。你把行权价之上的上涨卖了，权利金是这笔出售的价钱。股价跳过行权价时，你要按一个低位定的价格交货。",
        },
        {
          q: "什么情况下选垂直而不是单买 Call？",
          a: "看算例：净支出省 44%，最大亏损近乎减半，平衡点更近。你只放弃了短腿之上的翅膀——而那本来就不是你相信的部分。",
        },
        {
          q: "领口真的能做到零成本吗？",
          a: "有时 Call 的权利金恰好付清 Put，偶尔还多。但「净成本为零」说明不了行权价摆得合不合理——那才是重点。",
        },
        {
          q: "最大亏损有上限，是不是就安全了？",
          a: "有上限不等于安全。680 美元的上限亏损照样是 680 美元。定仓标准只有一个：最大亏损那个数，你能不能大声说出来不眨眼。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "Straddle, strangle, butterfly", href: "/learn/options-strategies-volatility" },
        { label: "Break-even and ±σ scenarios", href: "/learn/options-breakeven-scenarios" },
        { label: "Options calculator", href: "/tools/options" },
        { label: "Paper and review", href: "/learn/paper-review" },
      ],
      "zh-CN": [
        { label: "期权入门：作用与定价", href: "/learn/options-basics-roles-pricing" },
        { label: "期权链与抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "跨式 · 宽跨式 · 蝶式", href: "/learn/options-strategies-volatility" },
        { label: "盈亏平衡与 ±σ 情景", href: "/learn/options-breakeven-scenarios" },
        { label: "期权计算器", href: "/tools/options" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
      ],
    },
    sourceNote: {
      en: "Educational. Worked premiums are hypothetical; live markets reprice everything. Not a recommendation.",
      "zh-CN":
        "仅供学习。文中权利金为假设数字，实时市场会全部重新定价。不构成建议。",
    },
  },
];
