import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Classic Greeks — tied to calculator + drawer, not a formula dump. */
export const LEARN_ARTICLES_SEO_OPTIONS_GREEKS: LearnArticle[] = [
  {
    slug: "options-greeks-in-practice",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Greeks without the textbook fog: which risk is moving your P&L today",
      "zh-CN": "希腊字母别背公式：今天动你盈亏的到底是哪一项",
    },
    summary: {
      en: "Stock up 2, call up 0.30 — that is not a broken market, it is gamma, theta or vega talking. Name the dial first; resize the trade second.",
      "zh-CN":
        "股票涨了两块，期权只涨三毛——不是市场坏了，是 Gamma、Theta 或 Vega 在说话。先给旋钮起名，再谈调仓。",
    },
    paragraphs: {
      en: [
        "A long call can lose on a day the underlying rallies. That sentence is usually theta or vega, not bad luck.",
        "Greeks are how you name the dial before you touch the size.",
      ],
      "zh-CN": [
        "标的涨了，看涨期权还是亏——背后多半是 Theta 或 Vega，不是运气差。",
        "希腊字母的作用，是让你在动仓位之前先给旋钮起名。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Greeks answer one question: if a single input nudges, roughly how does the premium move. They are local slopes around today's mark — good for diagnosis, useless as prophecy. In Q-Stock, contract rows show Greeks next to the mid, and the calculator at /tools/options solves them with an American binomial tree or a European Black–Scholes approximation.",
        },
        { type: "h2", text: "Five dials, five inputs" },
        {
          type: "table",
          head: ["Greek", "Input that moves it", "Long-call intuition", "When it dominates"],
          rows: [
            ["Delta", "Spot", "Premium tends to rise as the stock rises", "Quiet tape, no IV shock"],
            ["Gamma", "Delta itself", "Delta moves faster near ATM and near expiry", "0DTE and event weeks"],
            ["Theta", "Calendar time", "Rent charged for every day held", "Short-dated longs in a flat market"],
            ["Vega", "Implied vol", "Higher IV lifts the quote; crush hurts", "Earnings, FOMC, launches"],
            ["Rho", "Rates", "Second-order at retail equity sizes", "LEAPS and deep ITM over long horizons"],
          ],
          caption:
            "Slopes, not guarantees. Gamma and theta go nonlinear close to expiry, and the linear math quietly stops being enough.",
        },
        { type: "h2", text: "Run one day through the numbers" },
        {
          type: "p",
          text: "Setup: stock at 100, a 21-day 100 call quoted 2.40, delta 0.50, gamma 0.08, theta −0.05 a day, vega 0.15 (all hypothetical). Next day the stock gains 2 while IV drops from 40 to 38. Delta contributes ≈ 2 × 0.50 = +1.00. Gamma adds ≈ ½ × 0.08 × 2² = +0.16. Subtotal +1.16. Vega takes (38 − 40) × 0.15 = −0.30, theta takes 0.05. Net ≈ +0.81: the quote moves from 2.40 to about 3.21. The stock rose 2%; the option rose about a third of that in absolute terms — the vol drop and the calendar ate the difference.",
        },
        {
          type: "table",
          head: ["Variable", "Change", "Contribution"],
          rows: [
            ["Spot", "+2", "+1.00 (delta) +0.16 (gamma)"],
            ["Implied vol", "−2 pts", "−0.30"],
            ["Calendar", "one day", "−0.05"],
            ["Net", "—", "≈ +0.81"],
          ],
          caption:
            "One position, one day, three dials turned at once. Reading a single Greek is how misdiagnosis starts.",
        },
        {
          type: "p",
          text: "Flip one input and the story changes: same stock move with IV rising from 38 to 42 instead would add another +0.60 on top. That sensitivity — long vega or short vega — is a bigger driver of event-week P&L than whether you were bullish or bearish.",
        },
        { type: "h2", text: "A reading order that matches your thesis" },
        {
          type: "ul",
          items: [
            "Direction thesis → delta, and whether you truly want that much stock-equivalent exposure.",
            "Clock thesis → theta versus the number of days you actually need.",
            "Event thesis → vega, and which side of the crush you are standing on.",
            "Pinned, whippy tape → gamma warning that your delta will not sit still.",
          ],
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Buying short-dated OTM before an event for cheap delta, then discovering you held a pile of vega: the print lands, IV collapses, the direction is right and the position still loses.",
            "Watching delta while theta compounds: at 7 days out, −0.15 a day on a 2.00 quote is −7.5% a week of doing nothing.",
            "Treating model price as fill price: when the spread is wide, a 0.05 theoretical gap matters less than the spread itself.",
          ],
        },
        {
          type: "note",
          text: "Model Greeks depend on IV and rate assumptions — change the assumption, change the number. They are a second opinion next to the live mid, not a verdict. Wide markets can move more in one print than a 0.01 delta change implies.",
        },
        { type: "h2", text: "A ten-minute drill in Q-Stock" },
        {
          type: "p",
          text: "Pick a name already in /watchlist. In the options drawer, click one ATM call and copy the five numbers down. Enter the same spot, strike, IV and days into /tools/options and compare — if the two disagree by more than a few cents, something in the assumptions moved. Do the same copy at the next close and check prediction against reality. Ten rounds of this and you will stop asking what a Greek means and start noticing which one is moving your money.",
        },
        {
          type: "p",
          text: "Set an /alerts trigger at the price where your delta-equivalent stock move would double or halve the position. Greeks stop being vocabulary the day you watch one of those alerts fire.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "希腊字母回答一个问题：某一个输入轻轻一推，权利金大概怎么动。它们是今天报价附近的局部斜率——适合诊断，当不了预言。钱力股在合约行里把希腊字母和中间价放在一起；/tools/options 的计算器用美式二叉树或欧式 BS 近似把它们算出来。",
        },
        { type: "h2", text: "五个旋钮，各管一个输入" },
        {
          type: "table",
          head: ["字母", "推动它的输入", "买看涨的直觉", "什么时候它说了算"],
          rows: [
            ["Delta", "现价", "股价涨，权利金倾向涨", "盘面平静、IV 没突变"],
            ["Gamma", "Delta 本身", "越近平值、越临到期，Delta 变得越快", "0DTE、事件周"],
            ["Theta", "日历时间", "持有的每一天都在付租金", "短期限多头碰上横盘"],
            ["Vega", "隐含波动率", "IV 升抬报价；塌陷伤多头", "财报、议息、发布会"],
            ["Rho", "利率", "零售股票仓位多为二阶", "远期深度实值、LEAPS"],
          ],
          caption:
            "是斜率，不是保证。Gamma 和 Theta 在临近到期会非线性放大，线性心算悄悄不够用。",
        },
        { type: "h2", text: "代入数字过一天" },
        {
          type: "p",
          text: "设定：现价 100，一张 21 天的 100 Call 报 2.40，Delta 0.50、Gamma 0.08、Theta 每天 −0.05、Vega 0.15（均为假设）。第二天股价 +2，IV 从 40 掉到 38。Delta 贡献 ≈ 2 × 0.50 = +1.00；Gamma 再加 ≈ ½ × 0.08 × 2² = +0.16，小计 +1.16。Vega 扣 (38 − 40) × 0.15 = −0.30，Theta 扣 0.05。净变动 ≈ +0.81，报价从 2.40 走到约 3.21。股票涨 2%，期权绝对涨幅只有三分之一——波动回落和日历把差额吃掉了。",
        },
        {
          type: "table",
          head: ["变量", "变动", "贡献"],
          rows: [
            ["现价", "+2", "+1.00（Delta）+0.16（Gamma）"],
            ["隐含波动率", "−2 个点", "−0.30"],
            ["日历", "过一天", "−0.05"],
            ["净额", "—", "≈ +0.81"],
          ],
          caption: "一个仓位、一天、三个旋钮同时拧。只看单字母，误诊就是这么开始的。",
        },
        {
          type: "p",
          text: "换一个输入，故事就变：同样的股价涨幅，若 IV 从 38 升到 42，会在 +0.81 之上再多出约 +0.60。这个敏感度——你是 Vega 多头还是空头——对事件周盈亏的影响，常常大于你看多还是看空本身。",
        },
        { type: "h2", text: "对准论点的阅读顺序" },
        {
          type: "ul",
          items: [
            "论点是方向 → 看 Delta，以及你是否真要这么多「类股票」敞口。",
            "论点是时间窗口 → 看 Theta 对得起你真正需要的天数吗。",
            "论点是事件 → 看 Vega，以及你站在 Crush 的哪一侧。",
            "盘面又钉又抽 → Gamma 在提醒：你的 Delta 不会老实待着。",
          ],
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "事件前买短期限价外图「便宜 Delta」，其实扛着一坨 Vega：消息落地、IV 塌陷，方向对了仓位照样亏。",
            "盯 Delta 不看 Theta：剩 7 天、报价 2.00 的合约每天 −0.15，等于横盘一周白送 7.5%。",
            "把模型价当成交价：价差很宽时，0.05 的理论偏差远不如价差本身要紧。",
          ],
        },
        {
          type: "note",
          text: "模型希腊字母依赖 IV 和利率假设——假设一变，数字跟着变。它们是实时中间价旁边的第二意见，不是判决书。价差宽的市场，一次跳动可以大过 0.01 的 Delta 变化。",
        },
        { type: "h2", text: "钱力股里的十分钟练习" },
        {
          type: "p",
          text: "挑一只 /watchlist 里已有的票，抽屉里点一张平值 Call，把五个数抄下来；再把同样的现价、行权价、IV、天数输进 /tools/options 对一遍——两边差超过几分钱，说明某个假设动了。次日收盘再抄一遍，对比预测和实际。做上十轮，你就不会再问希腊字母是什么意思，而是直接看出今天是谁在动你的钱。",
        },
        {
          type: "p",
          text: "在 /alerts 挂一条触发价：股价走到哪个位置，你这份 Delta 敞口会翻倍或腰斩。等那条提醒真的响过一次，希腊字母就不再是词汇表了。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is delta 0.50 the same as a 50% chance of expiring ITM?",
          a: "Close enough for a rough gut-check, but they are not identical. Delta is a hedge ratio; probability is a distribution question. Near events the two can diverge a lot.",
        },
        {
          q: "Is theta always negative?",
          a: "For buyers, yes — time value decays. For sellers it is income, which is exactly why selling premium without a max-loss structure is dangerous: the rent you collect is real, and so is the gamma you take on.",
        },
        {
          q: "Is a bigger gamma better?",
          a: "For a long option, bigger gamma means faster gains when you are right and faster delta swings when you are not. It is leverage on the hedge ratio, not free upside.",
        },
        {
          q: "Where do I actually see these numbers?",
          a: "On the contract rows in the symbol options drawer, and in the options calculator at /tools/options, which shows theoretical value and Greeks from spot, strike, IV, days and rate.",
        },
      ],
      "zh-CN": [
        {
          q: "Delta 0.5 等于 50% 概率到期价内吗？",
          a: "粗略感受可以这么用，但两者不是一回事。Delta 是对冲比率，概率是分布问题。事件附近，两者可能差很远。",
        },
        {
          q: "Theta 一定是负的吗？",
          a: "对买方是——时间价值天天衰减。对卖方是收入，这也正是没有最大亏损结构就卖权利金危险的原因：收的租是真的，接的 Gamma 也是真的。",
        },
        {
          q: "Gamma 越大越好吗？",
          a: "对买方，Gamma 大意味着看对时赚得快、看错时 Delta 摆得也快。它是对冲比率上的杠杆，不是免费的上行。",
        },
        {
          q: "这些数字在哪里能看到？",
          a: "个股期权抽屉的合约行上；以及 /tools/options 的期权计算器——输入现价、行权价、IV、天数、利率，输出理论价和希腊字母。",
        },
      ],
    },
    links: {
      en: [
        { label: "ITM, ATM, OTM", href: "/learn/options-moneyness-itm-otm" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "Options calculator", href: "/tools/options" },
      ],
      "zh-CN": [
        { label: "价内 · 平值 · 价外", href: "/learn/options-moneyness-itm-otm" },
        { label: "IV、HV 与高低分位", href: "/learn/options-iv-hv-rank" },
        { label: "到期日、周期权与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "期权链与策略抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "期权计算器", href: "/tools/options" },
      ],
    },
    sourceNote: {
      en: "Educational. Model Greeks depend on IV and rate assumptions. All figures in the example are hypothetical.",
      "zh-CN": "仅供学习。模型希腊字母依赖 IV 与利率假设，算例中的数字均为假设。",
    },
  },
];
