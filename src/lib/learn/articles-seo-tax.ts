import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * 税务簇：股息红利的两层结构。
 *
 * 这两篇只讲一件事——「税前股息率」和「到手股息率」之间隔着什么。
 * 第一层是持有期限（A 股的三个档），第二层是市场结构（港股通 H 股 / 红筹 / 美股的预扣）。
 * 市面上讲税的文章多停在「20%」这个数字上，而 20% 既不是上限也不是全部。
 */
export const LEARN_ARTICLES_SEO_TAX: LearnArticle[] = [
  {
    slug: "dividend-tax-holding-period",
    category: "tools",
    ctaHref: "/tools/dividend-tax",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      "zh-CN": "持有多久才免税：股息红利的三个档，和一条没人提醒你的补扣",
      en: "How long to hold for a tax-free dividend: three tiers, and the clawback nobody mentions",
    },
    summary: {
      "zh-CN": "分红到账时一分税都没扣，很多人因此以为分红免税。真相是税在卖出那天才结算，而且按「产生这笔分红的那批股份」算了多久。三个档位、一条补扣规则，决定了现金分红到底是收入还是变现。",
      en: "Nothing is withheld on the day the dividend lands, which is why many people assume dividends are tax-free. The tax is settled when you sell, and it depends on how long you held the specific shares that earned it. Three tiers and one clawback rule decide whether a dividend is income or just a forced sale.",
    },
    paragraphs: {
      "zh-CN": [
        "A 股的股息红利税不是「扣多少」的问题，是「什么时候扣」的问题。搞错这一点的代价，是拿到手的钱被当成收益花掉，卖出时才发现本金少了。",
        "这篇把三个档位、补扣时点和除权的关系拆开算一遍，最后给一个判断：这笔分红到底该不该当成收入。",
      ],
      en: [
        "The dividend tax on A-shares is less about how much is withheld and more about when. Get the timing wrong and you spend the cash as income, only to find your principal short on the day you sell.",
        "This piece separates the three tiers, the clawback timing and the ex-dividend mechanics, then answers one question: should this dividend count as income at all?",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "先说结论：持有一个月内 20%，一个月到一年 10%，超过一年免征。这个表很多人见过。真正决定你到手多少的，是后面两条规则——派息时不扣、卖出时才按先进先出结算。",
        },
        { type: "h2", text: "三个档，看的是「那一批股份」" },
        {
          type: "p",
          text: "税率按持股期限分档，依据是财税〔2015〕101 号和〔2012〕85 号。关键在「持股期限」的计算对象：不是你的账户持有了多久，而是产生这笔分红的那部分股份，各自被持有了多久。",
        },
        {
          type: "table",
          head: ["持股期限", "计入应纳税所得额", "实际税率"],
          rows: [
            ["1 个月以内（含 1 个月）", "全额", "20%"],
            ["1 个月以上至 1 年（含 1 年）", "减按 50%", "10%"],
            ["超过 1 年", "0", "免征"],
          ],
        },
        {
          type: "p",
          text: "如果分红是按 2,000 股派发的，而你其中 1,000 股是两年前买的、另外 1,000 股是上个月买的，那么这 2,000 股的分红会分别按 0% 和 20% 处理。账户层面的「平均持有时间」在这里没有意义。",
        },
        { type: "h2", text: "分红到账那天，税还没结" },
        {
          type: "p",
          text: "上市公司派息时，对持股一年以内的股东暂不扣缴个税，全额派发。所以你会看到账户里进了完整的一笔现金，容易误以为免税。",
        },
        {
          type: "p",
          text: "这笔税在你卖出股票时才结算：中国结算按先进先出原则计算持股期限，算出应纳多少税，再由券商从资金账户里扣收。也就是说，只要你不卖，这笔负债就一直挂着。",
        },
        {
          type: "p",
          text: "这解释了一个常见困惑：分红后账户市值没怎么变，卖出时却少了一笔钱。少的不是手续费，是那笔一直没结的税。",
        },
        { type: "h2", text: "现金分红对短线持有人，是强制变现加收税" },
        {
          type: "p",
          text: "除权是机械的：每股派 1 元，股价就下调 1 元。分红当天你的总资产一分没变，只是市值换成了现金。如果你本来就打算卖，这只是把卖出的动作提前了；如果你不打算卖，这笔现金也不是天上掉的。",
        },
        {
          type: "p",
          text: "加上税之后，短期持有的分红就变成了负和。拿 10 万元持仓、每股派 1 元（即 1 万元分红）来算，假设除权后股价没有填权：",
        },
        {
          type: "table",
          head: ["持股期限", "补扣税额", "分红后总资产", "相对分红前"],
          rows: [
            ["超过 1 年", "0", "100,000", "不变"],
            ["6 个月", "1,000", "99,000", "−1,000"],
            ["20 天", "2,000", "98,000", "−2,000"],
          ],
        },
        {
          type: "p",
          text: "只有超过一年那一档，分红才是「额外」的现金流。其余两档，你只是把一部分市值换成了现金，并且为此付了 10% 或 20%。这个结论和很多人的直觉相反，但它就是除权加补扣的算术结果。",
        },
        { type: "h2", text: "先进先出改变的是「哪批股份被卖掉」" },
        {
          type: "p",
          text: "既然按先进先出算，卖出时被认定卖出的是最早买入的那批。这意味着分批建仓的人有一个容易忽略的后果：你在分红后追加买入，再卖出时卖掉的是老股，老股对应的那部分分红可能已经满一年、本该免税，结果没有被提前结算成应税。",
        },
        {
          type: "p",
          text: "反过来，如果你在分红后一个月内把新买的那批卖掉，而那批又是产生分红的主力，补扣就会落到 20% 这一档。判断标准始终是「产生分红的那批股份持有了多久」，而不是「账户开了多久」。",
        },
        { type: "h2", text: "港股通没有这一档" },
        {
          type: "p",
          text: "同样的逻辑搬到港股通就不成立：港股通股息红利统一按 20% 代扣，没有持股满一年免税的优惠，持有十年和持有十天一样。这一点在跨境配置里影响很大，下一篇会单独算。",
        },
        { type: "h2", text: "怎么用这个工具验证自己的情况" },
        {
          type: "p",
          text: "把分红金额、市场、持股天数填进股息红利工具，它会直接给出到手金额、补扣税额，以及同一笔钱在 A 股不同档位、港股通、美股下的到手对照。数字比记忆可靠——尤其在你打算「为了分红而买入」之前。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Start with the table everyone has seen: 20% if you hold less than a month, 10% up to a year, exempt beyond that. What actually decides your take-home is the two rules underneath it — nothing is withheld on the payment date, and everything is settled when you sell, on a first-in-first-out basis.",
        },
        { type: "h2", text: "Three tiers, applied to the specific shares" },
        {
          type: "p",
          text: "The tiers come from Caishui [2015] No. 101 and [2012] No. 85. The important part is what the holding period is measured on: not how long your account has held the stock, but how long each block of shares that earned the dividend has been held.",
        },
        {
          type: "table",
          head: ["Holding period", "Counted as taxable income", "Effective rate"],
          rows: [
            ["Up to 1 month (inclusive)", "Full amount", "20%"],
            ["Over 1 month to 1 year", "50% of the amount", "10%"],
            ["Over 1 year", "Zero", "Exempt"],
          ],
        },
        {
          type: "p",
          text: "If the dividend is paid on 2,000 shares, of which 1,000 were bought two years ago and 1,000 last month, the dividend splits into a 0% portion and a 20% portion. An account-level average holding time means nothing here.",
        },
        { type: "h2", text: "The tax is still open on payment day" },
        {
          type: "p",
          text: "When a company pays a dividend, it withholds nothing from shareholders who have held under a year — the full amount arrives. That is why the cash looks tax-free.",
        },
        {
          type: "p",
          text: "The tax is settled when you sell. ChinaClear computes the holding period first-in-first-out, determines the liability, and the broker deducts it from your cash account. Until you sell, that liability just sits there.",
        },
        {
          type: "p",
          text: "This explains a common confusion: the position barely moves on the ex-dividend date, yet selling later leaves you short. What disappeared is not commission — it is the tax that was never settled.",
        },
        { type: "h2", text: "For short holders, a dividend is a forced sale plus tax" },
        {
          type: "p",
          text: "The ex-dividend adjustment is mechanical: pay 1 per share, the price drops by 1. Total assets do not change on the day — market value simply becomes cash. If you were going to sell anyway, the sale just happened earlier. If you were not, the cash is not a gift.",
        },
        {
          type: "p",
          text: "Add the tax and the short-hold case turns negative. Take a 100,000 position paying 10,000, assuming the price does not recover after the adjustment:",
        },
        {
          type: "table",
          head: ["Holding period", "Tax clawed back", "Total assets after", "Versus before"],
          rows: [
            ["Over 1 year", "0", "100,000", "Unchanged"],
            ["6 months", "1,000", "99,000", "−1,000"],
            ["20 days", "2,000", "98,000", "−2,000"],
          ],
        },
        {
          type: "p",
          text: "Only the over-one-year row turns a dividend into extra cash flow. In the other two, you converted market value into cash and paid 10% or 20% for the privilege. That contradicts intuition, but it is simply the arithmetic of ex-dividend plus clawback.",
        },
        { type: "h2", text: "FIFO decides which shares were sold" },
        {
          type: "p",
          text: "Because the holding period runs first-in-first-out, a sale is deemed to dispose of your oldest shares. For anyone building a position in tranches, that has a consequence worth knowing: buy more after the dividend, then sell, and the shares disposed of are the old ones — the portion of the dividend attached to them may already be past a year and should have been settled as exempt.",
        },
        {
          type: "p",
          text: "Conversely, sell the newly bought block within a month and the clawback lands in the 20% tier. The test is always how long the shares behind that dividend were held, never how long the account has existed.",
        },
        { type: "h2", text: "Stock Connect has no such tier" },
        {
          type: "p",
          text: "None of this carries over to Stock Connect. Dividends are withheld at a flat 20%, with no one-year exemption — ten years and ten days are treated the same. That matters a great deal for cross-border income, and the next piece does the arithmetic.",
        },
        { type: "h2", text: "Check your own case against the tool" },
        {
          type: "p",
          text: "Enter the dividend, the market and the holding days into the dividend tax calculator and it returns the net amount, the clawback, and a side-by-side take-home comparison across A-share tiers, Stock Connect and US holdings. Numbers beat memory — especially before you buy a stock for its dividend.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "分红当天就卖出，持股期限怎么算？",
          a: "按你买入到卖出的实际持有天数，先进先出。当天卖出基本落在「一个月以内」这一档，全额计入，实际税负 20%。除权当天卖出，等于把分红全额换回现金还要交 20%，通常是最差的一种组合。",
        },
        {
          q: "分红后马上买回来，会破坏免税吗？",
          a: "不会。免税看的是产生这笔分红的那批股份持有了多久，新买入的股份是另一笔。但要注意先进先出：将来卖出时被认定卖出的是最早那批，这会影响届时补扣落在哪个档位。",
        },
        {
          q: "送股、转增股本也按这个税率吗？",
          a: "规则不完全一样。送红股（股票股利）通常按股票面值计算应纳税所得额，而不是按市值；资本公积转增股本一般不属于股息红利分配，不征个税，而用未分配利润或盈余公积转增则视同分红。这类情况建议以公司公告的扣税说明为准，每家公司都会写清楚。",
        },
        {
          q: "亏钱的时候也要交红利税吗？",
          a: "要。红利税针对的是分红这一笔所得，和你的持仓盈亏无关。股价跌了，分红该交的税一分不少，这也是「为了分红买入」在下跌市里格外难受的原因。",
        },
        {
          q: "基金分红适用同样的规则吗？",
          a: "证券投资基金从上市公司取得的股息红利，同样按持股期限差别化计征，持股期限由基金管理人计算。你看到的基金分红金额，通常已经是基金层面扣完税之后的结果，个人不再重复缴税。",
        },
      ],
      en: [
        {
          q: "What if I sell on the ex-dividend day?",
          a: "The holding period is measured from purchase to sale, first-in-first-out. Selling the same day lands in the under-one-month tier: fully taxable, 20%. You converted the entire dividend back into cash and paid 20% for it — usually the worst available combination.",
        },
        {
          q: "Does buying back immediately after the dividend break the exemption?",
          a: "No. The exemption attaches to the shares that earned the dividend; newly bought shares are a separate block. Do keep FIFO in mind: a future sale is deemed to dispose of your oldest shares, which determines which tier the clawback lands in.",
        },
        {
          q: "Do stock dividends and capitalisation issues follow the same rates?",
          a: "Not exactly. A stock dividend is generally taxed on the par value of the shares rather than market value; capitalisation of capital reserve is normally not a distribution at all, while capitalisation of retained earnings is treated as one. Check the withholding note in the company's announcement — every issuer spells it out.",
        },
        {
          q: "Do I still owe dividend tax if the position is at a loss?",
          a: "Yes. The tax is on the dividend as income and is independent of your holding gain or loss. A falling price does not reduce it, which is exactly why buying for the dividend hurts in a downtrend.",
        },
        {
          q: "Does the same apply to fund distributions?",
          a: "Funds are subject to the same tiered treatment on dividends received from listed companies, with the manager tracking the holding period. The distribution you see is normally already net of tax at the fund level, so you are not taxed twice.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "股息红利税后计算器", href: "/tools/dividend-tax" },
        { label: "港股通 20% 与 28% 差在哪", href: "/learn/hk-us-dividend-withholding" },
        { label: "同一家公司，三个价格", href: "/learn/cross-market-premium-guide" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "持仓成本三种口径", href: "/learn/position-cost-methods" },
      ],
      en: [
        { label: "Dividend tax calculator", href: "/tools/dividend-tax" },
        { label: "Why Stock Connect is 20% and 28%", href: "/learn/hk-us-dividend-withholding" },
        { label: "One company, three prices", href: "/learn/cross-market-premium-guide" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Three ways to measure cost basis", href: "/learn/position-cost-methods" },
      ],
    },
    sourceNote: {
      "zh-CN": "税率依据财税〔2015〕101 号、〔2012〕85 号（上市公司股息红利差别化个人所得税）；除权与补扣机制按中国结算现行做法。表中金额为计算结果，非引用。",
      en: "Rates per Caishui [2015] No. 101 and [2012] No. 85 on tiered dividend taxation; ex-dividend and clawback mechanics follow ChinaClear's current practice. Figures in the tables are computed, not quoted.",
    },
  },
  {
    slug: "hk-us-dividend-withholding",
    category: "tools",
    ctaHref: "/tools/dividend-tax",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      "zh-CN": "港股通红利税不是一个数字：20% 和 28% 差在哪",
      en: "Stock Connect dividend tax is not one number: where 20% and 28% come from",
    },
    summary: {
      "zh-CN": "同样是港股通，买 H 股扣 20%，买红筹可能扣到 28%。差的这 8 个点不在个人税上，而在公司注册地带来的那层预提所得税。以 8% 股息率、20 年再投计算，这个差别会放大到 160 万。",
      en: "Through the same Stock Connect channel, an H share is withheld at 20% but a red chip can lose 28%. The extra eight points are not individual tax — they come from a withholding layer created by where the company is incorporated. At an 8% yield reinvested for 20 years, that gap compounds into 1.6 million.",
    },
    paragraphs: {
      "zh-CN": [
        "「港股通红利税 20%」这句话只对了一半。同样通过港股通买入，公司注册在内地还是开曼，到手差 8 个百分点。",
        "这篇把两层税拆开：个人层面的 20% 是统一的，企业层面的 10% 才是变量。",
      ],
      en: [
        "\"Stock Connect withholds 20% on dividends\" is only half true. Buy through the same channel and the take-home differs by eight percentage points depending on whether the company is incorporated in the mainland or in the Cayman Islands.",
        "This piece separates the two layers: the 20% at the individual level is uniform; the 10% at the corporate level is the variable.",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "先分清两类公司。H 股是在内地注册、在香港上市的股份有限公司；红筹股是在境外（开曼、百慕大等）注册、业务在内地、在香港上市的公司。名字都带「港股」，税却不是一套。",
        },
        { type: "h2", text: "20% 是统一的那一层" },
        {
          type: "p",
          text: "财税〔2014〕81 号和〔2016〕127 号规定：内地个人投资者通过沪港通、深港通投资香港联交所上市的 H 股，由 H 股公司按 20% 代扣个人所得税；投资非 H 股，由中国结算按 20% 代扣。两条路径、同一个税率，都没有持股满一年免税的优惠。",
        },
        {
          type: "p",
          text: "所以「持有多久」在港股通里不影响税率。你持十年，照样 20%。这一点和 A 股完全相反，也是长期吃息策略最容易算错的地方。",
        },
        { type: "h2", text: "28% 里的另外 8 个点，发生在公司那一层" },
        {
          type: "p",
          text: "红筹的利润在内地子公司，分红要汇出境外母公司，这一步通常要缴 10% 的预提所得税（依据国税函〔2008〕897 号等，符合条件的可申请协定待遇）。母公司再把剩下的钱派给股东，个人这一层再扣 20%。",
        },
        {
          type: "p",
          text: "两刀下去，100 元税前分红到手 100 × 90% × 80% = 72 元，合计税负 28%。这不是一个官方合并税率，而是两层规则叠加后的市场常用口径。",
        },
        {
          type: "table",
          head: ["情形", "代扣环节", "合计税负", "8% 股息率到手"],
          rows: [
            ["A 股，持股超 1 年", "无", "0%", "8.00%"],
            ["美股，已提交 W-8BEN", "美国预扣", "10%", "7.20%"],
            ["港股通 · H 股", "H 股公司代扣", "20%", "6.40%"],
            ["港股通 · 红筹", "企业端 10% + 个人 20%", "28%", "5.76%"],
            ["美股，未提交 W-8BEN", "美国预扣", "30%", "5.60%"],
          ],
        },
        { type: "h2", text: "美股：30% 和 10% 之间只差一张表" },
        {
          type: "p",
          text: "美国对非居民股东的股息默认预扣 30%。提交 W-8BEN 并申报中美税收协定待遇后，股息预扣税率降到 10%。这张表是免费的，但不主动提交就没有——很多券商在开户流程里默认勾选，也有不少需要你自己补。",
        },
        {
          type: "p",
          text: "值得单独确认一次：如果你的美股账户显示的分红扣税是 30%，那不是美国税法的问题，是你的协定待遇没生效。",
        },
        { type: "h2", text: "8% 股息率，20 年后差出 160 万" },
        {
          type: "p",
          text: "单看一年的税率，28% 和 0% 的差别似乎是「少拿一点」。放进复利里，它是本金的分叉。100 万元本金、股息全部再投、20 年：",
        },
        {
          type: "table",
          head: ["持有方式", "税后股息率", "20 年后"],
          rows: [
            ["A 股，持股超 1 年", "8.00%", "466.1 万"],
            ["美股，W-8BEN", "7.20%", "401.7 万"],
            ["港股通 · H 股", "6.40%", "345.8 万"],
            ["港股通 · 红筹", "5.76%", "306.5 万"],
          ],
        },
        {
          type: "p",
          text: "最高和最低之间差 160 万，而它们的分红来源可以完全是同一批资产。这就是「税前股息率」这个指标在跨境比较里几乎没用的原因。",
        },
        { type: "h2", text: "三个常见误解" },
        {
          type: "ul",
          items: [
            "以为港股通和 A 股一样有持股满一年免税——没有，港股通不看持有期限。",
            "以为 28% 是官方税率——它是两层规则叠加的结果，具体是否发生取决于公司架构；若企业端按 20% 扣，综合可达 36%。",
            "以为直接开港股账户就一定更省——通过香港券商直投通常不扣那 20% 个人税，但企业端的预提税仍然存在，且要自行处理资金跨境与申报。",
          ],
        },
        { type: "h2", text: "怎么查自己那只" },
        {
          type: "p",
          text: "看公司注册地：章程或年报首页写「中华人民共和国」的是 H 股，写「开曼群岛」「百慕大」的是红筹。再看分红公告里的「扣税说明」，H 股会明确写按 20% 代扣；红筹通常会提到境外预提。两处一对，就知道自己落在哪一档。",
        },
        {
          type: "p",
          text: "把分红金额和市场填进股息红利工具，能直接看到四种情形的到手对照。在决定「同样 8% 股息率该买哪边」之前，先把税后的那个数算出来——税前股息率是没有意义的比较起点。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Start by separating two kinds of company. An H share is incorporated in the mainland and listed in Hong Kong. A red chip is incorporated offshore — Cayman, Bermuda — with its business in the mainland and its listing in Hong Kong. Both are called Hong Kong stocks; they are not taxed the same way.",
        },
        { type: "h2", text: "The 20% layer is uniform" },
        {
          type: "p",
          text: "Caishui [2014] No. 81 and [2016] No. 127 provide that a mainland individual investing in H shares through Shanghai or Shenzhen Connect has 20% individual income tax withheld by the H-share company, and 20% withheld by ChinaClear on non-H shares. Two paths, one rate, and no one-year exemption.",
        },
        {
          type: "p",
          text: "Holding period is therefore irrelevant on Stock Connect. Hold for ten years and you still pay 20%. That is the exact opposite of A-shares and the most common arithmetic error in long-term income strategies.",
        },
        { type: "h2", text: "The other eight points happen at the company level" },
        {
          type: "p",
          text: "A red chip earns its money in mainland subsidiaries. Moving that profit offshore as a dividend normally triggers 10% withholding tax (per Guoshuihan [2008] No. 897 and related rules, subject to treaty relief where available). The offshore parent then pays out what remains, and the individual layer takes another 20%.",
        },
        {
          type: "p",
          text: "Two cuts: 100 of gross dividend becomes 100 × 90% × 80% = 72, a combined 28%. That is not an official blended rate — it is the market convention for two layers stacked.",
        },
        {
          type: "table",
          head: ["Situation", "Where it is withheld", "Combined", "Net on an 8% yield"],
          rows: [
            ["A-share, held over 1 year", "None", "0%", "8.00%"],
            ["US, W-8BEN filed", "US withholding", "10%", "7.20%"],
            ["Stock Connect · H share", "By the H-share company", "20%", "6.40%"],
            ["Stock Connect · red chip", "10% corporate + 20% individual", "28%", "5.76%"],
            ["US, no W-8BEN", "US withholding", "30%", "5.60%"],
          ],
        },
        { type: "h2", text: "US: 30% versus 10% is one form apart" },
        {
          type: "p",
          text: "The US withholds 30% on dividends paid to non-resident shareholders by default. File W-8BEN and claim the treaty rate and it drops to 10%. The form is free but not automatic — some brokers include it in onboarding, plenty leave it to you.",
        },
        {
          type: "p",
          text: "Worth checking once: if your US account shows 30% withheld, that is not US tax law, it is your treaty benefit not being applied.",
        },
        { type: "h2", text: "At an 8% yield, 20 years separates them by 1.6 million" },
        {
          type: "p",
          text: "A single year of 28% versus 0% looks like giving up a little. Compounded, it splits the principal. One million, dividends fully reinvested, 20 years:",
        },
        {
          type: "table",
          head: ["Holding", "Net yield", "After 20 years"],
          rows: [
            ["A-share, held over 1 year", "8.00%", "4.66m"],
            ["US, W-8BEN", "7.20%", "4.02m"],
            ["Stock Connect · H share", "6.40%", "3.46m"],
            ["Stock Connect · red chip", "5.76%", "3.07m"],
          ],
        },
        {
          type: "p",
          text: "The spread between top and bottom is 1.6 million, and the dividends can come from exactly the same underlying assets. This is why gross dividend yield is close to meaningless in cross-border comparisons.",
        },
        { type: "h2", text: "Three common mistakes" },
        {
          type: "ul",
          items: [
            "Assuming Stock Connect has the same one-year exemption as A-shares. It does not — holding period is irrelevant.",
            "Treating 28% as an official rate. It is two layers stacked; whether it applies depends on the structure, and if the corporate layer is charged at 20% the combined figure reaches 36%.",
            "Assuming a direct Hong Kong account is always cheaper. Direct brokerage accounts normally avoid the 20% individual tax, but the corporate-level withholding remains, and you handle cross-border funding and reporting yourself.",
          ],
        },
        { type: "h2", text: "How to check the stock you own" },
        {
          type: "p",
          text: "Look at the place of incorporation: \"People's Republic of China\" on the cover of the annual report means an H share; \"Cayman Islands\" or \"Bermuda\" means a red chip. Then read the withholding note in the dividend announcement — H shares state the 20% deduction explicitly, red chips usually mention offshore withholding. Those two facts place you in a tier.",
        },
        {
          type: "p",
          text: "Enter the dividend and the market into the dividend tax calculator to see all four cases side by side. Before deciding which 8% yield to buy, compute the after-tax number — gross yield is not a meaningful starting point for comparison.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "港股通能不能像 A 股一样，持满一年免红利税？",
          a: "不能。港股通股息红利统一按 20% 代扣，不看持有期限。持有十年和持有十天税率相同，这是与 A 股差别化政策最关键的区别。",
        },
        {
          q: "28% 是所有非 H 股都适用吗？",
          a: "不是。28% 是「境外母公司派息前已被扣 10% 预提所得税」这种结构下的常见结果。是否发生取决于公司架构与是否能享受税收协定待遇；如果企业端按 20% 扣，综合税负会到 36%。以公司分红公告的扣税说明为准。",
        },
        {
          q: "直接开港股账户是不是就免税了？",
          a: "个人层面通常不再扣那 20%，但企业层面的预提税依然存在，而且你还要自行处理资金跨境、年度申报等事项。是否更划算取决于金额与你的申报成本，不是一个税率就能判断的。",
        },
        {
          q: "美股赚的差价要在国内缴税吗？",
          a: "法律上，中国税收居民取得的境外财产转让所得属于应税所得；实际执行中长期较宽松，但近年随着信息交换推进在收紧。这块的表述容易走极端——既不能说「必须缴」，也不能说「不用缴」。建议记录完整交易与扣税凭证，必要时咨询税务专业人士。",
        },
        {
          q: "以股代息怎么算税？",
          a: "以股代息（scrip dividend）在许多市场被视为等额现金分红后再买入股票，因此仍按现金分红的口径计税，只是现金没有实际到账。港股通的以股代息安排以中国结算与公司公告为准。",
        },
      ],
      en: [
        {
          q: "Does Stock Connect get the one-year exemption like A-shares?",
          a: "No. Dividends are withheld at a flat 20% regardless of holding period. Ten years and ten days are taxed identically — the single most important difference from the A-share tiered regime.",
        },
        {
          q: "Does the 28% apply to every non-H share?",
          a: "No. 28% is the common outcome where 10% withholding tax was already taken offshore before the parent paid out. Whether it happens depends on the structure and on treaty relief; if the corporate layer is charged at 20%, the combined figure reaches 36%. The company's dividend announcement is the authority.",
        },
        {
          q: "Is a direct Hong Kong account tax-free then?",
          a: "The 20% individual layer normally does not apply, but corporate-level withholding still does, and you handle cross-border funding and annual reporting yourself. Whether it is cheaper depends on size and compliance cost, not on a single rate.",
        },
        {
          q: "Do US capital gains need to be taxed in China?",
          a: "In law, offshore property transfer income earned by a Chinese tax resident is taxable; enforcement has historically been light but is tightening as information exchange expands. This is a topic where both extremes — \"must pay\" and \"need not pay\" — are wrong. Keep complete trade records and withholding receipts, and consult a tax professional where it matters.",
        },
        {
          q: "How is a scrip dividend taxed?",
          a: "In most markets a scrip dividend is treated as a cash dividend followed by a share purchase, so it is taxed on the cash-dividend basis even though no cash arrives. For Stock Connect, follow ChinaClear and the company announcement.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "股息红利税后计算器", href: "/tools/dividend-tax" },
        { label: "持有多久才免税", href: "/learn/dividend-tax-holding-period" },
        { label: "同一家公司，三个价格", href: "/learn/cross-market-premium-guide" },
        { label: "港股通、QDII、直接开户成本对照", href: "/learn/hk-access-channels-cost" },
        { label: "复利计算器", href: "/tools/compound" },
      ],
      en: [
        { label: "Dividend tax calculator", href: "/tools/dividend-tax" },
        { label: "How long to hold for a tax-free dividend", href: "/learn/dividend-tax-holding-period" },
        { label: "One company, three prices", href: "/learn/cross-market-premium-guide" },
        { label: "Stock Connect, QDII or direct account", href: "/learn/hk-access-channels-cost" },
        { label: "Compound calculator", href: "/tools/compound" },
      ],
    },
    sourceNote: {
      "zh-CN": "税负依据财税〔2014〕81 号、〔2016〕127 号（沪港通、深港通个人所得税政策），红筹预提部分参考国税函〔2008〕897 号；复利数字用复利工具按税后股息率计算。28% 为两层规则叠加的市场口径，具体适用以公司分红公告为准。",
      en: "Withholding per Caishui [2014] No. 81 and [2016] No. 127; the red-chip layer references Guoshuihan [2008] No. 897. Compounding figures computed from after-tax yields with the compound calculator. The 28% is a market convention for two stacked layers; the company's dividend announcement governs.",
    },
  },
];
