import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Cross-market cluster — the on-site advantage: one company, three listings,
 * and the data to compare them in one view. Nothing here is investment advice.
 */
export const LEARN_ARTICLES_SEO_CROSS_MARKET: LearnArticle[] = [
  {
    slug: "cross-market-premium-guide",
    category: "basics",
    ctaHref: "/multi-chart",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "One company, three prices: how A-share, HK and US premiums are actually calculated",
      "zh-CN": "同一家公司在 A 股、港股、美股：三个价格，溢价到底怎么算",
    },
    summary: {
      en: "The same business can trade 20% apart in three markets. The premium is not one number but three conventions stacked together — here are the formulas, the inputs they need, and the four ways people get it wrong.",
      "zh-CN": "同一家公司可以同时在三地挂牌，价差 20% 是常态。溢价率不是一个数，而是三个口径叠出来的结果——本文给出公式、参数，以及四种最常见的算错方式。",
    },
    paragraphs: {
      en: [
        "A company can list in Shanghai, Hong Kong and New York at the same time, and the three prices will rarely agree.",
        "The premium is a ratio, and like every ratio it depends entirely on what you put in the denominator.",
      ],
      "zh-CN": [
        "同一家公司可以同时在 A 股、港股、美股挂牌，三个价格很少一致。",
        "溢价是一个比值，而比值的结果完全取决于你往分母里放了什么。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: the premium is (price A ÷ converted price B) − 1. The hard part is 「converted」 — which exchange rate, which share ratio, which settlement price. Get any of the three wrong and the number swings by double digits.",
        },
        { type: "h2", text: "Why one company gets three prices" },
        {
          type: "p",
          text: "Each market is a separate pool of money with its own investor base, tax treatment, liquidity and convertibility. A-shares and H-shares are not freely interchangeable: crossing between them requires a quota-based channel, so arbitrage is bounded. A bounded arbitrage is not a closed one — that is why the gap persists for years instead of hours.",
        },
        { type: "h2", text: "Three conventions, three different numbers" },
        {
          type: "table",
          head: ["Convention", "Formula", "Best for", "Typical mistake"],
          rows: [
            [
              "A/H premium",
              "A close × FX ÷ H close − 1",
              "Same company, two Chinese-language markets",
              "Using the mid-rate instead of a tradable rate",
            ],
            [
              "ADR premium",
              "ADR price × ratio ÷ local price − 1",
              "Dual-listed US names",
              "Assuming 1 ADR = 1 share",
            ],
            [
              "Total-return spread",
              "Price return + dividends − FX drift",
              "Holding-period decisions",
              "Comparing unadjusted prices over years",
            ],
          ],
          caption:
            "All three use closing prices on the same trading day; mixing dates is the most common source of noise.",
        },
        { type: "h2", text: "Worked example (illustrative numbers, not live quotes)" },
        {
          type: "p",
          text: "Suppose a bank trades at 6.00 in Shanghai and 4.80 in Hong Kong, with 1 HKD = 0.92 CNY. The H-share is worth 4.416 in CNY, so the A-share carries a premium of 6.00 ÷ 4.416 − 1 ≈ 35.9%. Change the rate to 0.95 and the same pair reads 31.6% — a four-point swing from the FX assumption alone.",
        },
        {
          type: "note",
          text: "The prices above exist only to demonstrate the arithmetic. They are not the current quote of any security; use live data in the app for actual levels.",
        },
        { type: "h2", text: "A discount is not the same as cheap" },
        {
          type: "ul",
          items: [
            "Dividend tax: the withholding rate differs by channel and by holding period, and it compounds over years.",
            "Liquidity: a small-cap H-share can carry a 0.5%+ bid-ask spread, which erodes a 「cheap」 entry fast.",
            "Convertibility: quotas and channel fees mean the gap cannot be arbitraged away on your timetable.",
            "FX path: a 3% currency move over a year can swallow the entire discount you came for.",
          ],
        },
        { type: "h2", text: "Four ways this calculation goes wrong" },
        {
          type: "ul",
          items: [
            "Comparing closes from different dates, especially around holidays when one market is shut.",
            "Using the mid-rate rather than the rate you could actually transact at, spread included.",
            "Ignoring the ADR ratio: depositary receipts often represent a fraction of a share, or several.",
            "Using unadjusted prices across a multi-year window, so dividends quietly vanish from the comparison.",
          ],
        },
        { type: "h2", text: "Doing it in 30 seconds" },
        {
          type: "p",
          text: "Open the multi-chart view and place the three listings side by side, then convert with the position tool so every leg is expressed in one currency. The number you want is the one after conversion, not the one on the ticker.",
        },
        { type: "h2", text: "When the gap actually closes" },
        {
          type: "p",
          text: "It is tempting to treat an A/H premium as a mispricing that must eventually correct, and to short the expensive side against the cheap one. That trade has failed repeatedly, for a simple reason: convergence almost never comes from arbitrage. It comes from a rule change.",
        },
        {
          type: "p",
          text: "Only three triggers are observable: quota or convertibility changes that make the transfer actually possible; forced index flows that temporarily move one side; and tax or dividend rule changes that alter net holding returns. None of them run on a schedule you can forecast.",
        },
        {
          type: "p",
          text: "The more useful question is not whether the gap closes, but whether holding one side still makes sense if it never does. Dividends, FX and liquidity usually decide the outcome long before the discount does.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：溢价率 =（A 价格 ÷ 折算后的 B 价格）− 1。难的不是公式，是「折算」这两个字——用哪个汇率、什么折算比例、哪一天的收盘价。三个参数错一个，结果能差十几个百分点。",
        },
        { type: "h2", text: "为什么同一家公司会有三个价格" },
        {
          type: "p",
          text: "每个市场都是一个独立的资金池，投资者结构、税制、流动性、可兑换性都不一样。A 股与 H 股不能自由转换，跨市场要经过有额度限制的通道，所以套利是有边界的。有边界的套利不等于关闭的套利——这正是价差能存在好几年而不是几个小时的原因。",
        },
        { type: "h2", text: "三种口径，三个不同的数" },
        {
          type: "table",
          head: ["口径", "公式", "适合看什么", "常犯的错"],
          rows: [
            [
              "A/H 溢价",
              "A 收盘 × 汇率 ÷ H 收盘 − 1",
              "同一家公司在两个中文市场",
              "用中间价而不是能成交的换汇价",
            ],
            [
              "ADR 溢价",
              "ADR 价 × 折算比例 ÷ 本地价 − 1",
              "美股二次上市的标的",
              "默认 1 份 ADR = 1 股",
            ],
            [
              "总回报差",
              "价格收益 + 分红 − 汇率变动",
              "持有期决策",
              "用不复权价格做多年对比",
            ],
          ],
          caption: "三种口径都要求同一天收盘价；混用日期是噪音的第一来源。",
        },
        { type: "h2", text: "算一遍（示例数字，非实时行情）" },
        {
          type: "p",
          text: "假设某银行 A 股 6.00 元、H 股 4.80 港元，1 港元 = 0.92 元人民币。H 股折人民币 4.416 元，则 A 股相对 H 股溢价 6.00 ÷ 4.416 − 1 ≈ 35.9%。把汇率改成 0.95，同一组价格立刻变成 31.6%——四个百分点只来自汇率假设。",
        },
        {
          type: "note",
          text: "上面两个价格只用于演示算法，不代表任何标的的当前报价。真实水平请在站内用实时行情查看。",
        },
        { type: "h2", text: "折价不等于便宜" },
        {
          type: "ul",
          items: [
            "红利税：不同通道、不同持有期的税率不一样，拉长到几年会明显改变结果。",
            "流动性：小盘 H 股的买卖价差可能超过 0.5%，「便宜」的入场价很快被吃掉。",
            "可兑换性：额度和通道费决定了这个价差不会按你的时间表收敛。",
            "汇率路径：一年 3% 的汇率变动，足以吞掉你本来想赚的全部折价。",
          ],
        },
        { type: "h2", text: "四种最常见的算错方式" },
        {
          type: "ul",
          items: [
            "用不同日期的收盘价，尤其是两边假期不一致的时候。",
            "用中间价，而不是你实际能成交、含点差的换汇价。",
            "忽略 ADR 折算比例：一份存托凭证经常对应零点几股，也可能对应好几股。",
            "多年对比用不复权价格，分红悄悄从比较里消失了。",
          ],
        },
        { type: "h2", text: "30 秒算完的路径" },
        {
          type: "p",
          text: "打开多图对比，把三个代码并排放，再用持仓工具统一折算成同一种货币。你要看的是折算之后的数，不是行情列表上那个数。",
        },
        { type: "h2", text: "价差什么时候才会收敛" },
        {
          type: "p",
          text: "很多人把 AH 溢价当成一个「迟早要修好」的错误定价，于是做空贵的、做多便宜的。这个交易在过去十年里反复失败，原因很简单：收敛几乎从不来自套利，而来自制度变化。",
        },
        {
          type: "p",
          text: "可观察的触发条件只有三类：一是通道额度或可兑换性发生变化，让跨市场搬运真正可行；二是被动资金被迫按指数权重买入某一侧，短期内改变供需；三是税率或分红规则调整，改变长期持有的净收益。这三件事都不在你我能预测的时间表上。",
        },
        {
          type: "p",
          text: "所以更实用的问法不是「价差会不会收敛」，而是「在价差不收敛的情况下，我拿着这一边是否仍然划算」。分红、汇率、流动性三项加起来，往往比那 30% 的折价更早决定结果。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Does a high A/H premium mean A-shares are expensive?",
          a: "It only means they are expensive relative to the H-share. Absolute valuation still depends on earnings and the discount rate; the premium itself is a structural feature of a market that cannot be freely arbitraged.",
        },
        {
          q: "The H-share is cheaper — is buying it a free lunch?",
          a: "No. A discount can persist for years, and the dividend tax plus FX spread are real costs that arrive before any convergence does.",
        },
        {
          q: "Is one ADR always one share?",
          a: "Not always. The ratio is set in the deposit agreement and can be anything from a fraction to a multiple. Check it before doing any comparison.",
        },
        {
          q: "Which exchange rate should I use?",
          a: "The rate you could actually transact at, including the spread — not the published mid-rate.",
        },
      ],
      "zh-CN": [
        {
          q: "AH 溢价率高，说明 A 股贵吗？",
          a: "只说明它相对 H 股贵。绝对估值还要看盈利与折现率；溢价本身是资金不能自由流动的结构性结果。",
        },
        {
          q: "港股更便宜，买港股是不是稳赚？",
          a: "不是。折价可能持续多年，而红利税和汇率点差会在价差收敛之前先发生。",
        },
        {
          q: "一份 ADR 一定等于一股吗？",
          a: "不一定。折算比例由存托协议规定，可能是零点几股，也可能是好几股，做对比前必须先查清。",
        },
        {
          q: "汇率该用哪个价？",
          a: "用你实际能成交、含点差的换汇价，而不是公布的中间价。",
        },
      ],
    },
    links: {
      en: [
        { label: "Three-panel comparison", href: "/multi-chart" },
        { label: "HK access channels and their costs", href: "/learn/hk-access-channels-cost" },
        { label: "HK trading rules that cost beginners money", href: "/learn/hk-trading-rules-pitfalls" },
      ],
      "zh-CN": [
        { label: "三市场多图对比", href: "/multi-chart" },
        { label: "港股三条通道的成本", href: "/learn/hk-access-channels-cost" },
        { label: "港股规则里最容易亏钱的细节", href: "/learn/hk-trading-rules-pitfalls" },
      ],
    },
    sourceNote: {
      en: "Prices in the worked example are illustrative. Premiums move with every tick; use live data in the app. FX rates and fee schedules change — verify against your bank and exchange announcements.",
      "zh-CN":
        "文中示例价格为算法演示，溢价率随行情实时变化，请以站内数据为准。汇率与费率会调整，以银行及交易所最新公告为准。",
    },
  },
  {
    slug: "hk-access-channels-cost",
    category: "tools",
    ctaHref: "/pricing",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Stock Connect, QDII or a Hong Kong account: what each route to HK stocks really costs",
      "zh-CN": "港股通、QDII、直接开户：买港股的三条路，成本差多少",
    },
    summary: {
      en: "The commission line is not where the money goes. FX spread, dividend withholding and minimum charges decide the outcome — and the ranking flips depending on how much you invest and how often you trade.",
      "zh-CN": "差距不在佣金那一行。汇率点差、红利税和最低收费才是决定性的——而且谁更便宜，会随你的资金量和交易频率翻转。",
    },
    paragraphs: {
      en: [
        "There are three practical ways to own Hong Kong stocks from the mainland, and they are not priced the same way.",
        "Most comparisons stop at the commission line, which is the smallest line of the three.",
      ],
      "zh-CN": [
        "从内地买港股，实际可走的路只有三条，而它们的成本结构完全不同。",
        "大多数对比停在佣金那一行，而那恰好是三项成本里最小的一项。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: small amounts and infrequent trades go through Stock Connect; large amounts with active trading justify a Hong Kong account; passive allocation is usually cheapest through a QDII fund. The deciding costs are FX spread and dividend withholding, not commission.",
        },
        { type: "h2", text: "What the three routes actually are" },
        {
          type: "table",
          head: ["Route", "Who it suits", "Where FX happens", "Constraint"],
          rows: [
            ["Stock Connect", "Mainland residents, occasional trades", "Onshore, at settlement", "Eligible names only, quota system"],
            ["HK brokerage account", "Frequent traders, IPO subscribers", "Offshore, at your timing", "Account opening and funding steps"],
            ["QDII fund", "Passive, hands-off allocation", "Inside the fund", "Tracking error, fees, no single-stock control"],
          ],
        },
        { type: "h2", text: "The visible fees, side by side" },
        {
          type: "table",
          head: ["Cost item", "Stock Connect", "HK account", "QDII fund"],
          rows: [
            ["Commission", "Per broker schedule", "Per broker schedule", "Embedded in NAV"],
            ["Stamp duty", "Levied on both sides", "Levied on both sides", "Embedded in NAV"],
            ["Exchange / SFC levies", "Passed through", "Passed through", "Embedded in NAV"],
            ["FX spread", "Bank spread, onshore", "Offshore spread", "Fund-level spread"],
            ["Dividend withholding", "Varies by channel and holding period", "Generally lower", "Fund level"],
            ["Minimum charge", "Can exceed the fee itself on small tickets", "Broker dependent", "Management fee, charged regardless"],
          ],
          caption:
            "Rate levels change with regulation and with your broker. Treat this as a structure to fill in, not a quote: confirm current rates before publishing or trading.",
        },
        { type: "h2", text: "The invisible line items are the big ones" },
        {
          type: "ul",
          items: [
            "FX spread: typically a few tenths of a percent each way. Two conversions a year can cost more than all commissions combined.",
            "Dividend withholding: the difference between channels is large enough to dominate a multi-year holding.",
            "Timing of conversion: converting at the moment of the trade versus holding cash in one currency is a decision, not a detail.",
            "Minimum charges: on a small ticket, the floor fee can be a multiple of the percentage fee.",
            "Fund-level costs: management fee and tracking error are charged whether or not the market cooperates.",
          ],
        },
        { type: "h2", text: "A 100,000 HKD worked example" },
        {
          type: "p",
          text: "Buy 100,000 HKD of a stock, hold one year, collect a dividend, then sell. Total cost = commission (both sides) + levies (both sides) + two FX spreads + dividend withholding + any minimum charges. Fill in your own numbers: in most retail cases the two FX spreads plus withholding outweigh commission by a wide margin, and the gap widens the longer you hold.",
        },
        {
          type: "note",
          text: "Do the arithmetic with your own broker schedule before choosing. The ranking of the three routes flips at different account sizes — that is the whole point of running it.",
        },
        { type: "h2", text: "Choosing between them" },
        {
          type: "table",
          head: ["Your situation", "Reasonable default", "Why"],
          rows: [
            ["Under ~200k CNY, a few trades a year", "Stock Connect", "No account opening, conversion is built in"],
            ["Larger book, monthly activity", "HK account", "Tighter spreads, better dividend treatment"],
            ["Want allocation, not stock picking", "QDII fund", "One line item, no operational overhead"],
            ["Need IPO allocation or odd lots", "HK account", "Connect does not cover these"],
          ],
        },
        { type: "h2", text: "Three misunderstandings worth clearing" },
        {
          type: "ul",
          items: [
            "「Commission-free」 never means free: the spread and the levy are still there.",
            "A lower headline commission can lose to a worse FX rate on the same trade.",
            "Holding period changes the ranking, because withholding is charged per dividend, not per trade.",
          ],
        },
        { type: "h2", text: "Where the operational friction actually sits" },
        {
          type: "p",
          text: "Stock Connect needs no account, but it does need eligibility checks and a conversion inside trading hours; the constraint is the eligible list and the quota, not the clicks.",
        },
        {
          type: "p",
          text: "A Hong Kong account has three real bottlenecks: identity and address verification at opening, funding from an account in your own name, and withdrawal back to the same name. Routing money through a third party gets rejected in review, and the days it spends in limbo are a cost nobody budgets for.",
        },
        {
          type: "p",
          text: "A QDII fund is the least work, but check the confirmation and settlement dates, and watch the premium on exchange-traded QDII products — buying at a premium is a loss before any fee is charged.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：小额、低频走港股通；资金量大、交易频繁、要打新就开香港券商账户；只想被动配置，QDII 基金通常最省事。真正拉开差距的是汇率点差和红利税，不是佣金。",
        },
        { type: "h2", text: "三条通道分别是什么" },
        {
          type: "table",
          head: ["通道", "适合谁", "换汇发生在哪", "限制"],
          rows: [
            ["港股通", "内地居民、偶尔交易", "在岸，交收时换汇", "仅限标的名单，有额度机制"],
            ["香港券商账户", "频繁交易、打新", "离岸，时点自选", "开户与入金有流程"],
            ["QDII 基金", "被动配置、不想管", "基金内部完成", "有跟踪误差与费率，无法选个股"],
          ],
        },
        { type: "h2", text: "显性费用并排看" },
        {
          type: "table",
          head: ["费用项", "港股通", "香港账户", "QDII 基金"],
          rows: [
            ["佣金", "按券商费率", "按券商费率", "含在净值里"],
            ["印花税", "买卖双边征收", "买卖双边征收", "含在净值里"],
            ["交易征费/交易费", "据实代收", "据实代收", "含在净值里"],
            ["汇率点差", "在岸银行点差", "离岸点差", "基金层面点差"],
            ["红利税", "按通道与持有期不同", "通常更低", "基金层面处理"],
            ["最低收费", "小额时可能高于按比例的费用", "视券商", "管理费，无论盈亏都收"],
          ],
          caption:
            "费率水平随监管和券商调整。请把这张表当作「结构」而不是「报价」：实际下单前按最新公告填一遍。",
        },
        { type: "h2", text: "看不见的那几行才是大头" },
        {
          type: "ul",
          items: [
            "汇率点差：单边通常零点几个百分点，一年换两次，可能比全年佣金加起来还多。",
            "红利税：通道之间的差异大到足以主导多年持有的最终结果。",
            "换汇时点：下单即换，还是一直持有单一币种现金，这是一个决策而不是细节。",
            "最低收费：小额单子上，固定下限可能是按比例费用的好几倍。",
            "基金层面成本：管理费和跟踪误差不管涨跌都照收。",
          ],
        },
        { type: "h2", text: "拿 10 万港币算一遍" },
        {
          type: "p",
          text: "买入 10 万港币的股票，持有一年，收一次分红，再卖出。总成本 = 双边佣金 + 双边征费 + 两次汇率点差 + 红利税 + 最低收费。把你的费率填进去算：多数散户情形下，两次点差加红利税会明显超过佣金，而且持有越久差距越大。",
        },
        {
          type: "note",
          text: "选通道之前，先用你自己的费率表算一遍。三条通道的排名会在不同资金量上翻转——这正是要算的原因。",
        },
        { type: "h2", text: "怎么选" },
        {
          type: "table",
          head: ["你的情况", "较合理的选择", "原因"],
          rows: [
            ["20 万人民币以内、一年交易几次", "港股通", "不用开户，换汇内置"],
            ["资金较大、每月都有交易", "香港账户", "点差更紧，红利税处理更好"],
            ["只想配置、不想选股", "QDII 基金", "一个条目搞定，无操作负担"],
            ["需要打新或买卖碎股", "香港账户", "港股通不覆盖这些"],
          ],
        },
        { type: "h2", text: "三个该澄清的误解" },
        {
          type: "ul",
          items: [
            "「免佣」不等于免费：点差和征费一分不少。",
            "名义佣金更低，可能被更差的汇率在同一笔交易上全部吃掉。",
            "持有期会改变排名，因为红利税是按分红收的，不是按交易收的。",
          ],
        },
        { type: "h2", text: "开户与资金路径：三步里最容易卡住的地方" },
        {
          type: "p",
          text: "港股通不需要开户，但需要满足适当性要求并在交易时段内换汇；真正卡住人的通常是标的范围和额度，而不是操作步骤。",
        },
        {
          type: "p",
          text: "香港账户的实际卡点有三处：开户时的人脸与地址证明、入金必须来自同名账户、出金回到本人账户所需的时间。任何一环用第三方账户过账，都会在合规审查时被退回，钱卡在中间的那几天，是一笔没人计入的成本。",
        },
        {
          type: "p",
          text: "QDII 最省事，但要看申购赎回的确认日与到账日，还要看场内 QDII 的溢价——溢价买入等于在付任何费率之前先亏一截。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is Stock Connect always more expensive?",
          a: "No. For small tickets and low frequency, avoiding account opening and offshore funding often wins. The gap only opens up as size and frequency grow.",
        },
        {
          q: "Do QDII funds let me pick stocks?",
          a: "Generally no. You own a basket, with tracking error and management fees, in exchange for zero operational work.",
        },
        {
          q: "Which cost should I check first?",
          a: "The FX spread. It is charged on every conversion, it is invisible on the contract note, and it compounds with activity.",
        },
        {
          q: "Does holding period matter for costs?",
          a: "Yes, mainly through dividend withholding, which is charged per distribution. A one-year trade and a ten-year holding are different cost profiles entirely.",
        },
      ],
      "zh-CN": [
        {
          q: "港股通一定更贵吗？",
          a: "不一定。小额、低频时，省掉开户和入金流程往往更划算。差距是随资金量和频率一起放大的。",
        },
        {
          q: "QDII 基金能选个股吗？",
          a: "一般不能。你买的是一篮子，代价是跟踪误差和管理费，换来的是零操作成本。",
        },
        {
          q: "先看哪一项成本？",
          a: "汇率点差。每次换汇都收，成交单上看不见，而且会随交易频率累积。",
        },
        {
          q: "持有期会影响成本吗？",
          a: "会，主要通过红利税——按分红次数征收。持有一年和持有十年是完全不同的成本结构。",
        },
      ],
    },
    links: {
      en: [
        { label: "A/H/ADR premium calculator logic", href: "/learn/cross-market-premium-guide" },
        { label: "HK trading rules that cost beginners money", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "Plans and limits", href: "/pricing" },
      ],
      "zh-CN": [
        { label: "A/H/ADR 溢价怎么算", href: "/learn/cross-market-premium-guide" },
        { label: "港股规则里最容易亏钱的细节", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "会员方案与额度", href: "/pricing" },
      ],
    },
    sourceNote: {
      en: "Fee structures follow the exchange and SFC schedules; levels change. This article describes how to build the comparison, not what your broker will charge today.",
      "zh-CN":
        "费率结构依据交易所与证监会收费项目整理，具体水平会调整。本文讲的是怎么搭这张对比表，不构成任何券商当前费率的承诺。",
    },
  },
  {
    slug: "hk-trading-rules-pitfalls",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Seven Hong Kong trading rules that quietly cost beginners money",
      "zh-CN": "港股规则里最容易亏钱的 7 个细节：每手、碎股、暗盘、T+0",
    },
    summary: {
      en: "Board lots are not 100 shares, odd lots trade at a discount, and the grey market is thinner than it looks. Seven mechanics that decide whether your first HK trade behaves the way you expect.",
      "zh-CN": "每手不一定是 100 股，碎股要打折才卖得掉，暗盘的流动性比看上去薄得多。七个决定你第一笔港股交易是否如预期执行的机制。",
    },
    paragraphs: {
      en: [
        "Hong Kong looks like a familiar market until the first order behaves unexpectedly.",
        "Most of those surprises come from seven mechanics that never appear in a beginner guide.",
      ],
      "zh-CN": [
        "港股看起来和 A 股很像，直到你的第一笔委托没有按预期成交。",
        "这些意外大多来自七个机制，而它们很少出现在入门文章里。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: in Hong Kong the board lot is set by the issuer, odd lots sell at a discount, settlement is T+2 while intraday round trips are allowed, and there are no daily price limits — only a volatility control mechanism. Each of these changes how you size and exit a position.",
        },
        { type: "h2", text: "The board lot is not 100 shares" },
        {
          type: "p",
          text: "Each issuer sets its own lot size, commonly 100, 200, 500, 1,000 or 2,000 shares. A 「cheap」 stock at 0.8 HKD with a 2,000-share lot still requires 1,600 HKD per lot, and a 300 HKD stock with a 100-share lot requires 30,000. Screen for the lot value, not the share price.",
        },
        { type: "h2", text: "Odd lots: sellable, but at a price" },
        {
          type: "p",
          text: "Shares left over from a rights issue, a scrip dividend or a broken lot trade in a separate odd-lot market where quotes are thinner and spreads wider. You can exit, but expect to pay for the privilege — sometimes materially more than the daily spread suggests.",
        },
        { type: "h2", text: "The grey market is not the opening price" },
        {
          type: "p",
          text: "Before listing day, shares sometimes change hands in an off-exchange grey market. Volume is thin, participants are few, and the print is a weak predictor of the actual open. Treat it as sentiment, not as a price.",
        },
        { type: "h2", text: "T+0 trading, T+2 settlement" },
        {
          type: "p",
          text: "You can buy and sell the same stock on the same day, but cash and shares settle two business days later. That mismatch is why some brokers limit withdrawals against unsettled proceeds, and why 「I already sold」 does not always mean 「I can withdraw」.",
        },
        { type: "h2", text: "No daily limit, but a cooling-off mechanism" },
        {
          type: "p",
          text: "Hong Kong has no daily up/down limit. Instead, a volatility control mechanism triggers a short cooling-off period when a stock moves sharply against a reference price. It slows the tape; it does not cap the move. A stop-loss order can therefore fill far from its trigger.",
        },
        { type: "h2", text: "Stamp duty and the minimum charge" },
        {
          type: "table",
          head: ["Item", "How it is charged", "Why it matters"],
          rows: [
            ["Stamp duty", "Both sides of a trade", "Raises the round-trip cost, hurts high-frequency strategies"],
            ["Trading fee / levy", "Both sides, percentage based", "Small on its own, additive with everything else"],
            ["Settlement fee", "Percentage with a floor and a cap", "The floor dominates small tickets"],
            ["Custody / platform fee", "Often monthly or per holding", "Charged whether you trade or not"],
          ],
          caption:
            "Rate levels are set by the exchange and the regulator and do change; confirm the current schedule before you size a strategy around it.",
        },
        { type: "h2", text: "The seven-point checklist" },
        {
          type: "table",
          head: ["#", "Detail", "What to check before ordering"],
          rows: [
            ["1", "Board lot size", "Lot value in cash, not share price"],
            ["2", "Odd-lot liquidity", "Can you actually sell the remainder?"],
            ["3", "Grey market prints", "Do not treat as the open"],
            ["4", "Same-day round trip", "Allowed, but settlement is T+2"],
            ["5", "No price limit", "Stops can slip; size accordingly"],
            ["6", "Two-sided stamp duty", "Cost per round trip, not per side"],
            ["7", "Monthly custody fee", "Cost of holding, not of trading"],
          ],
        },
        {
          type: "h2",
          text: "Rights issues, scrip dividends and suspensions: three events that change your share count",
        },
        {
          type: "p",
          text: "A rights issue gives you the right to buy new shares in proportion to your holding, usually below the market price. Not taking it up is not neutral: your percentage ownership is diluted and value transfers to those who participate. The decision turns on the subscription price versus the ex-rights price, not on whether you feel like sending more money.",
        },
        {
          type: "p",
          text: "A scrip dividend replaces cash with new shares: the count rises and the cost per share falls. If your records say 「received a cash dividend」, your position no longer reconciles, and every later return calculation carries that error.",
        },
        {
          type: "p",
          text: "A trading suspension leaves you unable to act, may resume with a gap, and can last a long time. If one name is an outsized share of your book, a suspension is a period with no exit — worth more attention than any of the six points above.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：港股每手股数由发行人自己定，碎股要折价才能出手，当天可以回转但交收是 T+2，没有涨跌幅限制只有市调机制。这四点每一条都会改变你的建仓规模和退出方式。",
        },
        { type: "h2", text: "每手不是 100 股" },
        {
          type: "p",
          text: "每手股数由发行人设定，常见 100、200、500、1000、2000 股。一只 0.8 港元、每手 2000 股的「便宜股」，一手也要 1600 港元；一只 300 港元、每手 100 股的股票，一手就是 3 万。看的是每手金额，不是股价。",
        },
        { type: "h2", text: "碎股：能卖，但要付代价" },
        {
          type: "p",
          text: "供股、以股代息或拆合股之后剩下的零碎股，走的是另一个碎股市场，报价更薄、价差更宽。卖得掉，但你得为这个便利付钱——有时候比当天的正常价差贵得多。",
        },
        { type: "h2", text: "暗盘价不是开盘价" },
        {
          type: "p",
          text: "上市前一晚，部分股票会在场外暗盘成交。成交量薄、参与人少，那个价格对次日开盘的预测能力很弱。把它当情绪指标，不要当定价。",
        },
        { type: "h2", text: "T+0 交易，T+2 交收" },
        {
          type: "p",
          text: "同一只股票当天可以买卖，但股票和资金在两个工作日后才完成交收。这个错配就是为什么部分券商对未交收款项限制出金——「我已经卖了」不等于「我现在能提」。",
        },
        { type: "h2", text: "没有涨跌幅，但有市调机制" },
        {
          type: "p",
          text: "港股没有每日涨跌幅限制，取而代之的是市调机制：股价相对参考价剧烈波动时触发一段冷静期。它会让成交慢下来，但不会封住价格。所以止损单的成交价可能离触发价很远。",
        },
        { type: "h2", text: "印花税与最低收费" },
        {
          type: "table",
          head: ["项目", "怎么收", "为什么重要"],
          rows: [
            ["印花税", "买卖双边", "抬高往返成本，对高频策略伤害最大"],
            ["交易费与征费", "双边、按比例", "单项不大，但会叠加"],
            ["结算费", "按比例，有下限和上限", "小额单子上，下限就是主要成本"],
            ["托管/平台费", "按月或按持仓收", "不交易也照收"],
          ],
          caption:
            "费率由交易所与监管机构设定，会调整。按下单策略之前，请核对当期费率表。",
        },
        { type: "h2", text: "七条速查" },
        {
          type: "table",
          head: ["#", "细节", "下单前该确认什么"],
          rows: [
            ["1", "每手股数", "用金额算一手要多少钱，不是看股价"],
            ["2", "碎股流动性", "剩下的零股真的卖得掉吗"],
            ["3", "暗盘成交", "不要当成开盘价"],
            ["4", "当日回转", "可以做，但交收是 T+2"],
            ["5", "无涨跌幅", "止损会滑价，仓位要相应缩小"],
            ["6", "双边印花税", "算往返成本，不是单边"],
            ["7", "月度托管费", "这是持有成本，不是交易成本"],
          ],
        },
        { type: "h2", text: "供股、以股代息、停牌：三种改变持仓数量的公司行为" },
        {
          type: "p",
          text: "供股是按持股比例给你认购新股的权利，认购价通常低于市价。不参与不是「什么都没发生」——你的持股比例被摊薄，价值实际转移给了参与的人。要不要参与，取决于认购价与除权后价格的差，而不是「想不想再掏钱」。",
        },
        {
          type: "p",
          text: "以股代息把现金分红换成新股：股数增加、每股成本下降。如果你的记录里只写了「收到现金分红」，持仓数字从此就对不上，后面所有收益计算都会带上这个误差。",
        },
        {
          type: "p",
          text: "停牌期间无法交易，复牌可能直接跳空，而且停牌可以持续很久。如果单一标的占你仓位过重，停牌就是一段无法退出的时间——这一条比前面六条更值钱。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Can I day-trade Hong Kong stocks?",
          a: "Yes, same-day round trips are allowed. Settlement is T+2, so your buying power and your withdrawable cash are not the same number.",
        },
        {
          q: "Are there price limits?",
          a: "No daily limit. A volatility control mechanism imposes a short cooling-off period after sharp moves, which slows trading but does not cap the price.",
        },
        {
          q: "Why can't I sell my odd lot at the screen price?",
          a: "Odd lots trade in a separate, thinner market. The quoted price for a full board lot does not apply to your remainder.",
        },
        {
          q: "Is the grey market price a reliable guide to the open?",
          a: "No. Volume is low and participants are few, so it reflects sentiment far more than fair value.",
        },
      ],
      "zh-CN": [
        {
          q: "港股可以当天买卖吗？",
          a: "可以，当日回转是允许的。但交收是 T+2，所以可用购买力和可提现金不是同一个数。",
        },
        {
          q: "港股有涨跌幅限制吗？",
          a: "没有每日涨跌幅。剧烈波动时会触发市调机制的冷静期，它让成交变慢，但不封住价格。",
        },
        {
          q: "碎股为什么不能按屏幕价卖？",
          a: "碎股走独立的、更薄的市场。整手报价不适用于你手里剩下的零股。",
        },
        {
          q: "暗盘价能当开盘参考吗？",
          a: "不能。成交量小、参与人少，它反映的是情绪，离公允价格很远。",
        },
      ],
    },
    links: {
      en: [
        { label: "Three routes to HK stocks, compared", href: "/learn/hk-access-channels-cost" },
        { label: "A/H/ADR premium arithmetic", href: "/learn/cross-market-premium-guide" },
        { label: "Position cost conventions", href: "/learn/position-cost-methods" },
      ],
      "zh-CN": [
        { label: "买港股的三条通道成本对比", href: "/learn/hk-access-channels-cost" },
        { label: "A/H/ADR 溢价怎么算", href: "/learn/cross-market-premium-guide" },
        { label: "持仓成本的三种口径", href: "/learn/position-cost-methods" },
      ],
    },
    sourceNote: {
      en: "Mechanics follow HKEX rules as published; the exchange revises them from time to time. Confirm current lot sizes and fee schedules on the exchange site before trading.",
      "zh-CN":
        "机制依据港交所公开规则整理，交易所会不时修订。交易前请在交易所网站核对当期每手股数与费率表。",
    },
  },
];
