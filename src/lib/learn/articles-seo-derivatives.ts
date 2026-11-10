import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/** Derivatives / crypto cluster — the two markets where mechanics dominate outcomes. */
export const LEARN_ARTICLES_SEO_DERIVATIVES: LearnArticle[] = [
  {
    slug: "options-expiry-iv-crush",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: "2026-11-10",
    title: {
      en: "Option expiry: 0DTE, weeklies, and the IV crush that eats correct calls",
      "zh-CN": "期权到期日：0DTE、周期权与 IV Crush 的定价陷阱",
    },
    summary: {
      en: "Being right about direction is not enough. Time value decays on a curve, implied volatility collapses after events, and weekly expiries compress both effects into days. Here is the mechanics, then a worked example with numbers.",
      "zh-CN":
        "看对方向并不够。时间价值按曲线衰减，事件之后隐含波动率会塌陷，而周期权把这两个效应压进几天里。先讲机制，再用一组假设数字算一遍。",
    },
    paragraphs: {
      en: [
        "Option price = intrinsic value + time value. Direction is half of one variable; time and implied volatility can both cut your account while you were right.",
        "One worked example below. All numbers are hypothetical.",
      ],
      "zh-CN": [
        "期权价格 = 内在价值 + 时间价值。方向只是半个变量——时间和隐含波动率可以在你「看对了」的同时把账户划一道口子。",
        "下面用一组假设数字走一遍。全部数字为示意。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Most people learn option pricing as a formula and then trade it as a lottery ticket. The formula has a quieter message: you are renting time and paying for uncertainty, and both bills accelerate near expiry.",
        },
        {
          type: "p",
          text: "This piece covers the mechanics first, then runs one hypothetical earnings trade through an IV crush so you can see exactly where the money goes.",
        },
        { type: "h2", text: "Expiry mechanics worth knowing" },
        {
          type: "table",
          head: ["Type", "Typical expiry", "Settlement", "Practical consequence"],
          rows: [
            ["Standard monthly equity option", "Third Friday of the month", "American, physical delivery", "Early assignment is possible"],
            ["Weekly equity option", "Most Fridays", "American, physical delivery", "Faster decay, more gamma near expiry"],
            ["Index option (many series)", "Weekly and monthly", "Often European, cash settled", "No early assignment, but no early exercise either"],
            ["0DTE", "Same day", "Varies by product", "Gamma and slippage dominate everything"],
          ],
          caption:
            "Contract specifications differ by product and exchange. Check multiplier, settlement style and last trading day before sizing anything.",
        },
        {
          type: "p",
          text: "Time value does not decay in a straight line. Remaining time enters most models under a square root, so the burn rate accelerates into expiry: a two-week option is a countdown, a two-year LEAPS is a lease. Both are rent; the difference is speed. This is also why \u201cwait and see\u201d is a luxury short-dated positions cannot afford.",
        },
        { type: "h2", text: "An IV crush, with numbers" },
        {
          type: "p",
          text: "Setup: stock at 200, earnings tonight after the close. You buy one 200 strike call expiring in a week. IV is 55%, so the premium is roughly 6.10 per share — 610 dollars a contract. Break-even at expiry sits at 206.10, about +3%. The implied weekly move at 55% IV is roughly ±7.6%, so your break-even is inside the implied band. Reasonable so far.",
        },
        {
          type: "p",
          text: "Next morning the print is good and the stock opens at 204. Direction: right, +2%. But the event resolving collapses IV from 55% to 32% with six days left. Re-price the call and it is worth about 5.7. You were right, and the account is down roughly 40 dollars on the contract.",
        },
        {
          type: "table",
          head: ["State", "Stock", "Days left", "IV", "200 call value"],
          rows: [
            ["At entry", "200", "7", "55%", "≈ 6.10"],
            ["After earnings", "204", "6", "32%", "≈ 5.70"],
            ["Same stock, milder crush", "204", "6", "40%", "≈ 6.40"],
          ],
          caption:
            "Hypothetical numbers, European BS approximation, rates and dividends ignored. Live fills also carry the bid-ask spread.",
        },
        {
          type: "p",
          text: "Read the table sideways: identical +2% move, only the IV column changes, and the trade flips from a loss to a small gain. That is the crush. Part of what you paid was the uncertainty itself, and once the event lands, that part of the premium is simply cancelled. Nobody refunds it.",
        },
        {
          type: "p",
          text: "Sellers are the mirror image and they collect the collapse happily. But a naked short call has theoretically uncapped losses — one overshoot gap can wipe out months of premium in a night. The crush is the seller's wage; the tail is the seller's bill. Keep both on file.",
        },
        { type: "h2", text: "Common ways this goes wrong" },
        {
          type: "ul",
          items: [
            "Buying short-dated options into an event, holding through it, losing despite being right — and reacting by blaming the market or switching symbols, never by checking what IV did.",
            "Estimating everything at the mid price: backtests, break-evens, even expected fills. On quiet strikes the spread can eat several days of theta, and the mid is not a fill.",
            "Holding deep ITM American calls across a dividend and forgetting early exercise exists — the dividend quietly goes to someone else.",
          ],
        },
        {
          type: "p",
          text: "All three share a root: treating the option as a shadow of the stock. It is a separate contract whose fine print is time and volatility.",
        },
        { type: "h2", text: "What 0DTE actually changes" },
        {
          type: "p",
          text: "A same-day expiry removes the option of \u201cbeing right later\u201d — the thesis needs an intraday catalyst, today. Gamma is extreme, so small moves rewrite your delta and the position's risk changes minute by minute. Spreads widen because everyone crowds the same expiration. Averaging down a 0DTE is not a strategy; it is adding money to a countdown. Decide the exit before entry, not during the slide.",
        },
        { type: "h2", text: "Where to check this in Q-Stock" },
        {
          type: "p",
          text: "Open a symbol page, then the options drawer: pick strikes off the chain, drop a strategy template in, and read Theta and Vega straight off the contract quote. To ask \u201chow much does IV have to fall before I lose?\u201d, run it through /tools/options — American binomial tree or European BS approximation, both let you edit IV manually and watch the premium collapse. Put the earnings date into /alerts, and after the trade write one line in /review: volatility paid versus move delivered.",
        },
        {
          type: "note",
          text: "The drawer's ±σ scenarios assume expiry exercise; model Greeks depend on IV and rate assumptions. They are checking tools, not promises — and none of this is investment advice.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "多数人把期权定价学成公式，然后当彩票去交易。公式其实有句更安静的话：你在租时间、买不确定性，而且两张账单都越临近到期涨得越快。",
        },
        {
          type: "p",
          text: "这篇先讲机制，再用一笔假设的财报交易把 IV Crush 从头算到尾，让你看清钱到底去了哪。",
        },
        { type: "h2", text: "到期机制先弄清楚" },
        {
          type: "table",
          head: ["类型", "典型到期日", "结算方式", "实际影响"],
          rows: [
            ["标准月度股票期权", "每月第三个周五", "美式，实物交割", "存在提前被行权的可能"],
            ["周期权", "多数周五", "美式，实物交割", "衰减更快，临近到期 Gamma 更高"],
            ["指数期权（多系列）", "周度与月度", "多为欧式、现金交割", "不会被提前行权，但也不能提前行权"],
            ["0DTE", "当日到期", "因产品而异", "Gamma 与滑点主导一切"],
          ],
          caption:
            "合约规格因产品与交易所而异。下单前确认合约乘数、结算方式与最后交易日。",
        },
        {
          type: "p",
          text: "时间价值不是直线衰减。多数定价模型里剩余时间要开平方，所以越临近到期烧得越快：两周的期权是倒计时，两年的 LEAPS 是租约——都在付租金，区别是速度。这也是为什么「再等等」对短天期仓位是奢侈品。",
        },
        { type: "h2", text: "IV Crush，带数字走一遍" },
        {
          type: "p",
          text: "假设股价 200，财报今晚盘后。你买一张一周后到期的 200 Call，IV 55%，权利金约 6.10 每股——一张合约 610 美元。到期盈亏平衡在 206.10，约 +3%。55% 的 IV 对应的隐含周波动约 ±7.6%，平衡点落在隐含区间里面，看起来不离谱。",
        },
        {
          type: "p",
          text: "第二天早上，财报不错，股价开在 204。方向对了，+2%。但事件落地把不确定性一次性解除，IV 从 55% 掉到 32%，剩 6 天。重估这只 Call 大约值 5.7：你对了，账户却少了 40 美元上下。",
        },
        {
          type: "table",
          head: ["状态", "股价", "剩余天数", "IV", "200 Call 估值"],
          rows: [
            ["买入时", "200", "7", "55%", "≈ 6.10"],
            ["财报后", "204", "6", "32%", "≈ 5.70"],
            ["对照：同涨幅、塌得轻", "204", "6", "40%", "≈ 6.40"],
          ],
          caption:
            "假设数字，欧式 BS 近似估算，忽略利率与股息；实际成交还要过买卖价差。",
        },
        {
          type: "p",
          text: "把表横着读：同样的 +2%，只有 IV 那一栏在变，交易就从亏损翻成小赚。这就是 Crush——你付的权利金里有相当一部分买的是「不确定性」本身，事件落地，这部分溢价直接作废，没有人退款。",
        },
        {
          type: "p",
          text: "卖方是镜像，收塌陷收得很开心。但裸卖看涨的亏损理论上不封顶，一次超预期的跳空能把几个月的权利金一夜抹掉。塌陷是卖方的工资，尾部是卖方的账单，两张都要留底。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "事件前买短期期权并持有过事件，方向对了还亏钱——第一反应骂市场，第二反应换标的，很少有人第三反应去查 IV 发生了什么。",
            "什么都按中间价估：回测、盈亏、甚至预期成交。冷门行权价的价差能吃掉好几天的 Theta，中间价不是成交价。",
            "深度实值的美式 Call 撞上分红，忘了提前行权这回事，股息悄悄归了别人。",
          ],
        },
        {
          type: "p",
          text: "三条共用一个根：把期权当成股票的影子。它是另一张合同，条款里写满了时间和波动率。",
        },
        { type: "h2", text: "0DTE 到底改变了什么" },
        {
          type: "p",
          text: "当日到期取消了「以后再对」这个选项——论点必须自带日内催化剂，而且就是今天。Gamma 极端：小幅波动就重写 Delta，持仓风险每分钟都在变；价差变宽，因为所有人挤同一个到期日。对 0DTE 补仓摊平不是策略，是给倒计时续秒。离场要在进场前决定，不是在下滑途中决定。",
        },
        { type: "h2", text: "在钱力股里核对" },
        {
          type: "p",
          text: "个股页打开期权抽屉：链上点行权价带腿，策略模板一键生成结构，合约报价直接给 Theta 和 Vega。想问「IV 掉到多少我会亏」，去 /tools/options 期权计算器单独跑——美式二叉树和欧式 BS 近似都行，手动改 IV，看着权利金塌下去。财报日期挂进 /alerts 提醒；成交完去 /review 留一行：付了多少波动率，实际走了多少。",
        },
        {
          type: "note",
          text: "抽屉的 ±σ 情景按到期行权假设估算；模型希腊字母依赖 IV 与利率假设。它们是核对工具，不是承诺。本文仅供学习，不构成投资建议。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Can I lose money on a call when the stock rises?",
          a: "Yes. In the example above, +2% combined with IV dropping from 55% to 32% turned a $610 contract into roughly $570. When the volatility premium shrinks faster than intrinsic value grows, that is exactly what happens.",
        },
        {
          q: "What is the maximum loss when buying an option?",
          a: "The premium paid — that is the whole cap. Selling is a different risk table: a naked short option can lose far more than the premium it collected, in theory without limit.",
        },
        {
          q: "Weeklies or monthlies?",
          a: "Weeklies are cheaper per contract but bleed faster per day; monthlies are the reverse. Pick by how many days your thesis actually needs, not by which looks cheaper.",
        },
        {
          q: "Are 0DTE options a good place to learn?",
          a: "No. Gamma and slippage dominate, and being one minute late on an exit is itself a new risk decision. Learn the loop on weeklies and monthlies first.",
        },
      ],
      "zh-CN": [
        {
          q: "股票涨了，看涨期权还会亏吗？",
          a: "会。文中的例子里，+2% 配上 IV 从 55% 掉到 32%，一张 610 美元买入的合约只剩 570 左右。波动率溢价缩水快过内在价值增长时，就是这样。",
        },
        {
          q: "买期权的最大亏损是多少？",
          a: "已付权利金，上限就到这里。卖出是另一张风险表：裸卖期权的亏损可以远超收到的权利金，理论上不封顶。",
        },
        {
          q: "周期权和月期权怎么选？",
          a: "周期权单张便宜、每天损耗快；月期权反过来。按论点真正需要几天来选，不是按哪张便宜来选。",
        },
        {
          q: "0DTE 适合新手练手吗？",
          a: "不适合。Gamma 和滑点主导一切，晚一分钟离场本身就是一次新的风险决策。先用周期权和月期权把流程练熟。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Break-even and ±σ scenarios", href: "/learn/options-breakeven-scenarios" },
        { label: "Directional templates", href: "/learn/options-strategies-directional" },
        { label: "Options calculator", href: "/tools/options" },
        { label: "Watchlist and alerts", href: "/watchlist" },
      ],
      "zh-CN": [
        { label: "期权入门：作用与定价", href: "/learn/options-basics-roles-pricing" },
        { label: "IV、HV 与百分位", href: "/learn/options-iv-hv-rank" },
        { label: "盈亏平衡与 ±σ 情景", href: "/learn/options-breakeven-scenarios" },
        { label: "单腿 · 担保 · 垂直 · 领口", href: "/learn/options-strategies-directional" },
        { label: "期权计算器", href: "/tools/options" },
        { label: "自选与提醒", href: "/watchlist" },
      ],
    },
    sourceNote: {
      en: "Educational only. Worked numbers are hypothetical and use a simplified pricing model. Contract rules vary by product and exchange; confirm specifications before trading. No strategy here is a recommendation.",
      "zh-CN":
        "仅供学习。文中算例为假设数字，采用简化定价模型。合约规则因产品与交易所而异，交易前请以交易所规格为准。不构成任何策略建议。",
    },
  },
  {
    slug: "crypto-vs-equity-volatility",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "24-hour markets vs a 4-hour close: why the same leverage is a different risk",
      "zh-CN": "24 小时交易 vs 4 小时收盘：同样的杠杆，风险并不一样",
    },
    summary: {
      en: "A closing bell manufactures overnight gaps; round-the-clock trading removes them but never lets you step away. Two different risks, routinely compared as if they were one.",
      "zh-CN": "收盘制造了隔夜跳空；全天候交易消除了跳空，却也不给你下班的权利。两种不同的风险，却经常被当成一种来比较。",
    },
    paragraphs: {
      en: [
        "Leverage is a number. Risk is a number divided by volatility, and volatility depends on when the market is open.",
        "That is why a 3x position is not the same trade in two markets.",
      ],
      "zh-CN": [
        "杠杆是一个数字，风险是「这个数字除以波动率」，而波动率取决于市场什么时候开门。",
        "这就是为什么 3 倍杠杆在两个市场里根本不是同一笔交易。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: in equity markets, risk arrives in a 6.5-hour session plus a gap you cannot trade through. In crypto, risk is continuous, so position size must be calibrated on volatility per unit of time, not on the leverage label.",
        },
        { type: "h2", text: "How a closing bell shapes volatility" },
        {
          type: "p",
          text: "A closing price is an administrative fact: trading stops, and the next print may be far away. News arriving overnight is absorbed into the opening auction, producing a gap. That gap is why a stop order is not a guarantee — it becomes a market order once the market reopens, at whatever price is available.",
        },
        { type: "h2", text: "Crypto has no overnight gap, and no off switch" },
        {
          type: "p",
          text: "Continuous trading removes the gap but also removes the pause. There is no close at which you can reassess with a clear head, and no session boundary that limits how fast a position can move. Liquidity also thins at certain hours and at weekends, so the same order size has a different footprint depending on when it hits the book.",
        },
        { type: "h2", text: "Convert leverage into distance, not conviction" },
        {
          type: "table",
          head: ["Annualised volatility", "Daily move (1σ)", "3x position: move to lose most of the margin"],
          rows: [
            ["30%", "≈1.6%", "≈33%, or roughly 20 daily sigmas"],
            ["60%", "≈3.1%", "≈33%, or roughly 11 daily sigmas"],
            ["90%", "≈4.7%", "≈33%, or roughly 7 daily sigmas"],
            ["120%", "≈6.3%", "≈33%, or roughly 5 daily sigmas"],
          ],
          caption:
            "Daily sigma = annual volatility ÷ √365. The distance to liquidation is fixed by leverage; how often you get there is set by volatility. Fees and maintenance margin make the real distance shorter.",
        },
        {
          type: "note",
          text: "A single-day five-sigma move sounds impossible and is not: over hundreds of days, tail events accumulate. This is why the same 3x feels manageable in a quiet market and fatal in a volatile one.",
        },
        { type: "h2", text: "Perpetual futures add a cost that equities do not have" },
        {
          type: "p",
          text: "Perpetual contracts have no expiry, so exchanges use a funding payment between longs and shorts to keep the contract near spot. Funding is charged repeatedly, and in trending markets it can persist in one direction for a long time. A position that is directionally right can still bleed through funding — a cost with no direct equivalent in a cash equity position.",
        },
        { type: "h2", text: "Sizing a cross-market book" },
        {
          type: "p",
          text: "Allocate by risk contribution, not by capital: position size × volatility should be roughly equal across sleeves. A 20% crypto sleeve at 60% volatility contributes far more risk than a 60% equity sleeve at 18%. Equal capital weights produce a portfolio that is mostly a crypto bet wearing a diversified label.",
        },
        { type: "h2", text: "Three comparisons that do not work" },
        {
          type: "ul",
          items: [
            "Comparing drawdowns without noting that one market closes and the other does not.",
            "Treating a stop as protection in a market that can gap through it.",
            "Assuming lower leverage is safer across markets without looking at volatility per day.",
          ],
        },
        { type: "h2", text: "Estimating the annual cost of funding" },
        {
          type: "p",
          text: "Perpetual funding usually settles every eight hours. At 0.01% per settlement that is 0.03% a day, or roughly 11% a year. It is direction-independent: you pay that before forming any view on price.",
        },
        {
          type: "p",
          text: "In a one-directional market funding persists on one side, with longs paying shorts for extended periods. Crucially it is charged on notional exposure — at 3x leverage the same rate applies to three times your own capital, and the annual cost triples with it.",
        },
        {
          type: "table",
          head: ["Funding per 8h", "Daily", "Annualised", "3x notional, annualised"],
          rows: [
            ["0.01%", "0.03%", "≈11%", "≈33%"],
            ["0.03%", "0.09%", "≈33%", "≈99%"],
            ["0.05%", "0.15%", "≈55%", "≈165%"],
          ],
          caption:
            "Simplified continuous estimate over 365 days, ignoring compounding and rate changes. Funding floats with supply and demand and can be negative — shorts paying longs.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：股票市场的风险集中在 6.5 小时的交易时段，外加一个你无法在其中交易的跳空；加密的风险是连续的，所以仓位必须按「单位时间的波动」来定，而不是按杠杆标签来定。",
        },
        { type: "h2", text: "收盘如何塑造波动" },
        {
          type: "p",
          text: "收盘价是一个行政事实：交易停止，下一个成交可能离得很远。隔夜消息被吸收进开盘集合竞价，于是产生跳空。跳空正是止损单不等于保险的原因——开盘后它变成市价单，按当时能成交的价格成交。",
        },
        { type: "h2", text: "加密没有隔夜跳空，但也没有关机键" },
        {
          type: "p",
          text: "连续交易消除了跳空，也消除了暂停。没有一个收盘让你冷静重估，也没有时段边界限制持仓变化的速度。某些时段和周末流动性会更薄，同样的下单量在不同时点对盘口的冲击完全不同。",
        },
        { type: "h2", text: "把杠杆换算成距离，而不是信心" },
        {
          type: "table",
          head: ["年化波动率", "日波动（1σ）", "3 倍杠杆：亏掉大部分保证金需要跌多少"],
          rows: [
            ["30%", "≈1.6%", "≈33%，约 20 个日标准差"],
            ["60%", "≈3.1%", "≈33%，约 11 个日标准差"],
            ["90%", "≈4.7%", "≈33%，约 7 个日标准差"],
            ["120%", "≈6.3%", "≈33%，约 5 个日标准差"],
          ],
          caption:
            "日标准差 = 年化波动率 ÷ √365。到爆仓的距离由杠杆固定，多久走到那里由波动率决定。手续费与维持保证金会让真实距离更短。",
        },
        {
          type: "note",
          text: "单日五个标准差听起来不可能，其实并不：几百个交易日累积下来，尾部事件总会发生。这就是同一个 3 倍在安静行情里显得可控、在剧烈行情里致命的原因。",
        },
        { type: "h2", text: "永续合约多了一项股票没有的成本" },
        {
          type: "p",
          text: "永续合约没有到期日，交易所用多空之间的资金费把价格锚在现货附近。资金费按周期反复收取，在单边行情里可能长时间朝同一个方向。方向做对了的仓位，也可能被资金费慢慢磨掉——现金股票没有对应的成本。",
        },
        { type: "h2", text: "跨市场组合怎么配" },
        {
          type: "p",
          text: "按风险贡献配，不按资金占比配：各部分的「仓位 × 波动率」应大致相等。20% 的加密仓位、60% 的波动率，贡献的风险远大于 60% 的股票仓位、18% 的波动率。等资金权重配出来的组合，其实是「一个加密货币的赌注穿了件分散化的外套」。",
        },
        { type: "h2", text: "三种无效的对比" },
        {
          type: "ul",
          items: [
            "比回撤却不提一个市场会收盘、另一个不会。",
            "把一个会跳空穿过的止损当成保护。",
            "只看杠杆数字判断哪个更安全，不看每日波动。",
          ],
        },
        { type: "h2", text: "资金费的年化成本怎么估" },
        {
          type: "p",
          text: "资金费通常每 8 小时结算一次。按每次 0.01% 计算：一天 0.03%，一年约 11%。这个数字和方向无关，是纯粹的持有成本——你还没开始判断行情，就已经付了这笔钱。",
        },
        {
          type: "p",
          text: "单边行情里资金费会持续偏向一边，多头长期付钱给空头。更关键的是，资金费按名义仓位计算：3 倍杠杆下，同样的费率相当于占用自有资金的 3 倍，年化成本也随之三倍。",
        },
        {
          type: "table",
          head: ["每次资金费（8 小时）", "日成本", "年化", "3 倍名义仓位的年化"],
          rows: [
            ["0.01%", "0.03%", "≈11%", "≈33%"],
            ["0.03%", "0.09%", "≈33%", "≈99%"],
            ["0.05%", "0.15%", "≈55%", "≈165%"],
          ],
          caption:
            "按 365 天连续计息简化估算，未考虑复利与费率变动。实际资金费随市场供需波动，可能为负（空头付钱给多头）。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is crypto more volatile than equities?",
          a: "Usually, and materially so on an annualised basis. The practical point is not the ranking but that position sizing must be recalculated per market.",
        },
        {
          q: "Do stop orders work in crypto?",
          a: "They execute, but during thin liquidity or a fast move the fill can be far from the trigger — the same slippage problem equities have at the open.",
        },
        {
          q: "What is funding in perpetual futures?",
          a: "A periodic payment between longs and shorts that keeps the contract near spot. It is a holding cost that never appears on a stock position.",
        },
        {
          q: "Can I use the same leverage in both markets?",
          a: "You can, but the risk will not be the same. Match risk contribution instead: lower leverage where volatility is higher.",
        },
      ],
      "zh-CN": [
        {
          q: "加密一定比股票波动大吗？",
          a: "通常是的，按年化口径差距明显。但真正的结论不是排名，而是每个市场都要重新算仓位。",
        },
        {
          q: "加密里的止损单有效吗？",
          a: "会执行，但在流动性薄或快速行情中，成交价可能离触发价很远——和股票开盘时的滑点问题同源。",
        },
        {
          q: "永续合约的资金费是什么？",
          a: "多空之间定期支付、用来把合约价格锚在现货附近的费用。它是持有成本，股票现货没有对应项。",
        },
        {
          q: "两个市场可以用同样的杠杆吗？",
          a: "可以用，但风险不同。应该按风险贡献对齐：波动率高的地方，杠杆要更低。",
        },
      ],
    },
    links: {
      en: [
        { label: "Risk, reward and expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Options expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Multi-market overview", href: "/markets" },
      ],
      "zh-CN": [
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
        { label: "期权到期日与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "多市场行情总览", href: "/markets" },
      ],
    },
    sourceNote: {
      en: "Sigma calculations assume a normal distribution, which understates tails in practice. Figures are illustrative of the relationship, not forecasts of any asset's volatility.",
      "zh-CN":
        "标准差计算假设正态分布，实际会低估尾部。表中数字用于说明关系，不是对任何资产波动率的预测。",
    },
  },
];
