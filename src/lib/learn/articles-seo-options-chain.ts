import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Product-first: how to read the chain + strategy drawer. */
export const LEARN_ARTICLES_SEO_OPTIONS_CHAIN: LearnArticle[] = [
  {
    slug: "options-chain-and-drawer",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "From chain row to plan: using the options drawer without getting lost",
      "zh-CN": "从期权链到交易计划：策略抽屉怎么用才不迷路",
    },
    summary: {
      en: "A chain is a grid of rights; the drawer turns one click into legs, payoff, plain-language risk, ±σ scenarios and a trade plan — in that order on purpose.",
      "zh-CN":
        "期权链是一张权利的表格。抽屉把一次点击变成腿、盈亏图、风险白话、±σ 情景，再进交易计划——这个顺序是故意的。",
    },
    paragraphs: {
      en: [
        "Confusion on an options screen is rarely math. It is clicking before naming the job: hedge, direction, or volatility.",
        "Walk the Q-Stock path once, in order. The grid stops looking like noise.",
      ],
      "zh-CN": [
        "期权界面上让人晕的，多半不是数学，而是没说清用途就先点：对冲、方向，还是波动。",
        "把钱力股这条路径按顺序走一遍，格子就不那么像噪音。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Open any US equity from /markets or search, then switch to Options. Pick an expiry. The chain lists calls and puts by strike with bid/ask, volume, open interest, IV and Greeks where data allows. Liquidity beats a pretty mid, every time — a fair price you cannot trade is not a price.",
        },
        { type: "h2", text: "What each column is for" },
        {
          type: "table",
          head: ["Column", "What it is", "How to use it"],
          rows: [
            ["Bid / ask", "The market maker's two sides", "The gap is your round-trip cost, not noise"],
            ["Volume / open interest", "Today's activity vs accumulated positions", "Thin strikes get wide fills; prefer crowded rows"],
            ["IV", "The vol priced into this contract", "Same name, different strikes — IV can differ a lot"],
            ["Greeks + mid", "Local slopes and a fair-value reference", "Keep model mid and your fill price in separate mental buckets"],
          ],
          caption:
            "Everything here is a snapshot. Intraday numbers move; never treat one second's mid as a constant.",
        },
        { type: "h2", text: "A click order that keeps you honest" },
        {
          type: "ul",
          items: [
            "Expiry matching your clock — not the one with the flashiest premium.",
            "Strike band around spot; know ITM/ATM/OTM before falling for a cheap wing.",
            "Click a row to seed the drawer, then pick a strategy chip.",
            "Read net premium, max loss and break-evens before admiring the payoff chart.",
            "Read the risk summary and ±σ table; only then write it into the trade plan.",
          ],
        },
        { type: "h2", text: "The nine templates in the drawer" },
        {
          type: "p",
          text: "One click loads a leg; the chip decides the shape. Single leg, covered, vertical, collar, straddle, strangle, butterfly, calendar, diagonal. Chips are building blocks, not a menu of recommendations — the drawer recalculates net premium, max loss and break-evens each time you change one.",
        },
        {
          type: "table",
          head: ["Template", "One-line structure", "Question it fits"],
          rows: [
            ["Single leg", "Buy one call or put", "Directional view, loss capped at premium"],
            ["Covered", "Hold shares, sell a call", "Happy to sell at the strike for the income"],
            ["Vertical", "Buy and sell same expiry, two strikes", "Bounded view within a range"],
            ["Collar", "Shares + long put + short call", "Cheap insurance on a holding"],
            ["Straddle", "Buy same-strike call and put", "Betting the move beats the priced move"],
            ["Strangle", "Buy OTM call and put", "Cheaper vol ticket, farther break-evens"],
            ["Butterfly", "Three strikes, two bought one sold", "Betting expiry lands near the middle"],
            ["Calendar", "Same strike, two expiries", "Betting on the decay difference"],
            ["Diagonal", "Two strikes, two expiries", "Direction plus time, combined"],
          ],
          caption:
            "Every chip is a different answer to what you are willing to owe. Read the max-loss line before the profit line.",
        },
        { type: "h2", text: "One spread, worked through" },
        {
          type: "p",
          text: "Assume spot 100 and a mildly bullish view you do not want to bet on with a naked leg. Buy the 100 call at 3.40, sell the 105 call at 1.30 — a net debit of 2.10. Per contract: max loss 210, max profit (5.00 − 2.10) × 100 = 290, break-even 102.10. At expiry, 104 leaves the spread worth 4.00, a 1.90 gain; anything above 105 caps at 2.90. Run the same legs through /tools/options and the Greeks sum to roughly 0.25 delta — bounded risk, bounded reward, and the trade-off is giving away everything past 105 (figures hypothetical).",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Mixing expiries: calendar and diagonal load a second chain on demand. If the metrics strip shows a missing premium on a leg, the dates did not line up.",
            "Reading the probability cone as a forecast: it is an educational band drawn from IV, not a prediction of path.",
            "Skipping the risk summary for the payoff chart: a flat P&L across ±2σ usually means the strikes are too far or the days too few — the structure is decorative at that point.",
          ],
        },
        {
          type: "note",
          text: "There is no live order ticket here. The loop is watch → analyze → paper/plan → review: the drawer makes the numbers explicit, the plan records them, and execution stays in your brokerage account.",
        },
        { type: "h2", text: "From drawer to trade plan" },
        {
          type: "p",
          text: "The last step in the drawer is writing the structure into the trade plan: legs, net debit, break-evens and max loss travel with it. Put an /alerts trigger on the break-even and let the review page check execution later. Once the options layer is done, the symbol page is still there underneath — chart, financials, peers, unchanged. Options are a layer on the workbench, not a separate room.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "从 /markets 或搜索打开任意美股标的，切到「期权」，选一个到期日。链上按行权价列出 Call/Put，附买卖价、成交、持仓、IV 和希腊字母（有数据时）。流动性永远排在好看的中间价前面——一个你成交不了的好价格，不叫价格。",
        },
        { type: "h2", text: "每一列是干什么的" },
        {
          type: "table",
          head: ["列", "是什么", "怎么用"],
          rows: [
            ["买卖价", "做市商的两边", "差价就是你的来回成本，不是噪音"],
            ["成交 / 持仓", "当日活跃度对累计兴趣", "冷门行权价成交差，优先挤人多的行"],
            ["IV", "这张合约里定价的波动", "同一标的、不同行权价，IV 可以差很远"],
            ["希腊字母 + 中间价", "局部斜率与公允参考", "模型中间价和你能成交的价，分开记两本账"],
          ],
          caption: "这里所有列都是快照。盘中数字会动，别把某一秒的中间价当恒定值。",
        },
        { type: "h2", text: "一个让自己不撒谎的点击顺序" },
        {
          type: "ul",
          items: [
            "先选对得起你时间窗口的到期，不是权利金最好看的那个。",
            "在现价附近扫行权价带；先分清价内/平值/价外，再迷恋便宜的翅膀。",
            "点一行带入抽屉，再选策略芯片。",
            "先读净权利金、最大亏损和平衡点，再欣赏盈亏图。",
            "读风险摘要和 ±σ 表；最后才写入交易计划。",
          ],
        },
        { type: "h2", text: "抽屉里的九个模板" },
        {
          type: "p",
          text: "点一行加载腿，芯片定形状：单腿、担保、垂直、领口、跨式、宽跨式、蝶式、日历、对角。芯片是积木，不是推荐菜单——每换一次，抽屉都会重算净权利金、最大亏损和平衡点。",
        },
        {
          type: "table",
          head: ["模板", "结构一句话", "适合的问题"],
          rows: [
            ["单腿", "买一张 Call 或 Put", "方向判断，亏损封顶在权利金"],
            ["担保", "持股 + 卖 Call", "愿意按行权价卖出，换权利金"],
            ["垂直", "同到期一买一卖两档", "框在区间内的观点"],
            ["领口", "持股 + 买 Put + 卖 Call", "给持仓上便宜的保险"],
            ["跨式", "同行权价买 Call + Put", "押波动跑赢已定价的波动"],
            ["宽跨式", "买虚值 Call + Put", "更便宜的波动票，平衡点更远"],
            ["蝶式", "三档行权价、两买一卖", "押到期停在中间附近"],
            ["日历", "同行权价、两个到期", "押时间损耗的差"],
            ["对角", "两个行权价、两个到期", "方向加时间的组合"],
          ],
          caption: "每个芯片都是对「你愿意欠什么」的不同回答。先读最大亏损行，再读盈利行。",
        },
        { type: "h2", text: "一个价差算到底" },
        {
          type: "p",
          text: "假设现价 100，你偏多，但不想用裸腿去赌。买 100 Call 报 3.40，卖 105 Call 报 1.30，净借 2.10。按一张算：最大亏损 210，最大盈利 (5.00 − 2.10) × 100 = 290，盈亏平衡 102.10。到期股价 104 时价差值 4.00，赚 1.90；超过 105 封顶在 2.90。把两条腿输进 /tools/options，希腊字母加总 Delta 约 0.25——风险封了边，收益也封了边，代价是 105 以上的部分全让出去（数字均为假设）。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "到期日对错位：日历和对角会按需加载第二本链。指标条上某条腿显示缺权利金，多半是日期没对上。",
            "把概率锥当预测：那是用 IV 画的教育示意带，不是走势预报。",
            "跳过风险摘要直接看盈亏图：±2σ 情景一条平线，通常说明行权价太远或剩余天数太短——这时候结构只是装饰。",
          ],
        },
        {
          type: "note",
          text: "这里没有实盘下单。主路径是看盘 → 分析 → 模拟/计划 → 复盘：抽屉把数字摆明白，计划把数字记下来，成交留在你自己的券商账户。",
        },
        { type: "h2", text: "从抽屉到交易计划" },
        {
          type: "p",
          text: "抽屉的最后一步是把结构写进交易计划：腿、净借、平衡点、最大亏损一起带过去。在 /alerts 给平衡点挂一条提醒，复盘页回头核对执行。期权这层做完，个股页还在原地——图表、财报、同业，都没动。期权是工作台上的一层，不是另一个房间。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Why seed from the chain instead of typing strikes manually?",
          a: "So premium, IV and Greeks stay tied to a real quote row. Typing a fantasy strike teaches you to trust numbers that no market maker is standing behind.",
        },
        {
          q: "A row shows no IV or Greeks — is it broken?",
          a: "Usually missing vendor data on a thin contract. The drawer falls back to an illustrative 30% vol for scenarios; read the hint on the card and treat those rows as educational, not marks.",
        },
        {
          q: "How do I build a calendar or diagonal with two expiries?",
          a: "Pick the front leg first, then choose the far expiry in the drawer — the far chain loads on demand. Watch the metrics strip: a missing premium means the second expiry did not load.",
        },
        {
          q: "Can I place a real order from the drawer?",
          a: "No. Q-Stock stops at plan and paper. The structure, break-evens and max loss go into your trade plan; execution stays at your broker, where the account and the risk actually live.",
        },
      ],
      "zh-CN": [
        {
          q: "为什么要从链上点，而不是手填行权价？",
          a: "让权利金、IV、希腊字母跟真实报价行绑在一起。手填幻想行权价，练出来的是对没有做市商背书的数字的信任。",
        },
        {
          q: "有一行没有 IV 或希腊字母，是坏了吗？",
          a: "通常是冷门合约缺数据源字段。抽屉的情景会退回 30% 示意波动——先读卡片提示，把这些行当教育示意，别当实盘标记。",
        },
        {
          q: "日历和对角要两个到期日，怎么搭？",
          a: "先选近月腿，再到抽屉里选远月——远月链按需加载。盯住指标条：某条腿缺权利金，多半是第二到期没加载成功。",
        },
        {
          q: "能在抽屉里直接下单吗？",
          a: "不能。钱力股停在计划与模拟。结构、平衡点、最大亏损写进交易计划；成交留在你的券商，账户和风险本来就在那里。",
        },
      ],
    },
    links: {
      en: [
        { label: "ITM, ATM, OTM", href: "/learn/options-moneyness-itm-otm" },
        { label: "Break-even and scenarios", href: "/learn/options-breakeven-scenarios" },
        {
          label: "Single leg, covered, vertical, collar",
          href: "/learn/options-strategies-directional",
        },
        { label: "Straddle, strangle, butterfly", href: "/learn/options-strategies-volatility" },
        { label: "Options calculator", href: "/tools/options" },
      ],
      "zh-CN": [
        { label: "价内 · 平值 · 价外", href: "/learn/options-moneyness-itm-otm" },
        { label: "盈亏平衡与到期情景", href: "/learn/options-breakeven-scenarios" },
        {
          label: "单腿 · 担保 · 垂直 · 领口",
          href: "/learn/options-strategies-directional",
        },
        { label: "跨式 · 宽跨式 · 蝶式", href: "/learn/options-strategies-volatility" },
        { label: "期权计算器", href: "/tools/options" },
      ],
    },
    sourceNote: {
      en: "Educational. Chain fields vary by venue and data vendor; scenario bands are illustrative. All figures hypothetical.",
      "zh-CN":
        "仅供学习。链上字段因交易所与数据源而异，情景带为教育示意。文中数字均为假设。",
    },
  },
];
