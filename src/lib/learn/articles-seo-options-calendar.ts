import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Calendar + diagonal — dual-expiry drawer templates, one worked pin scenario. */
export const LEARN_ARTICLES_SEO_OPTIONS_CALENDAR: LearnArticle[] = [
  {
    slug: "options-strategies-calendar",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Trading time itself: calendar and diagonal spreads",
      "zh-CN": "交易时间本身：日历策略与对角策略",
    },
    summary: {
      en: "Two expiries, one idea: sell the near contract's faster decay, keep the far one as ballast. Diagonals add a strike tilt. One hypothetical calendar worked through three expiry scenarios — pin, rally, and everything between.",
      "zh-CN":
        "两个到期日，一个念头：卖掉近月更快的时间损耗，留远月当压舱。对角再错开行权价。一组假设的日历算过三种到期情景——钉住、拉升、以及中间地带。",
    },
    paragraphs: {
      en: [
        "Single-expiry charts assume everything settles on one Friday. Calendars refuse that convenience: the short leg dies first while the long leg still has calendar left on it.",
        "That is why max profit here is an estimate, not a number printed on a ticket. All figures below are hypothetical.",
      ],
      "zh-CN": [
        "单到期盈亏图默认「都在同一个周五交卷」。日历策略不吃这套：短腿先到期，长腿手里还剩日子。",
        "所以这里的最大盈利是估算，不是票面印死的数字。以下全部为假设数字。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In the drawer, choosing Calendar or Diagonal adds a second expiry picker; the far-month chain loads on demand. Before trading one, be able to answer a deceptively simple question: which expiry owns your thesis? Calendars punish fuzzy answers.",
        },
        { type: "h2", text: "Calendar spread, worked in numbers" },
        {
          type: "p",
          text: "Same strike, two expiries: short the near option, long the far one. Example: stock at 150. Sell the front-week 150 call for 2.30, buy the back-month 150 call for 4.60 — net debit 2.30, or 230 dollars a contract. You want the front month's time value to burn off faster, ideally while the stock parks near 150.",
        },
        {
          type: "table",
          head: ["Scenario at front expiry", "Front 150 call", "Far 150 call", "Structure", "P&L"],
          rows: [
            ["Stock pinned at 150", "≈ 0", "≈ 4.00", "≈ 4.00", "+170"],
            ["Stock rallied to 165", "≈ 15.00", "≈ 16.30", "≈ 1.30", "−100"],
            ["Stock rallied far past 165", "intrinsic", "tracks it", "shrinks toward 0", "→ −230 (max)"],
          ],
          caption:
            "Hypothetical, BS approximation. The pin pays; the trend bleeds. Max loss approaches the net debit if you hold a deep trend.",
        },
        {
          type: "p",
          text: "Read the middle row twice. At 165 the stock is up 10% and the structure is losing money — both legs moved up together, and the far call's extra time value was not enough to cover the short strike. A calendar is not a bullish trade with extra steps; it is a bet that nothing dramatic happens before the front expiry.",
        },
        {
          type: "ul",
          items: [
            "People reach for calendars when they expect a quiet drift into the near expiry, or when the front month looks rich against the back on the IV curve.",
            "A hard trend early can hurt in ways a static expiry chart understates — both legs move, just not equally.",
            "Once the near leg expires or is closed, what remains is an ordinary long option. Manage it on purpose: new thesis, new plan, or close it.",
          ],
        },
        { type: "h2", text: "Diagonal: the calendar with a lean" },
        {
          type: "p",
          text: "Different strikes and different expiries. A common call diagonal on the same 150 stock: sell the front-week 155 call for 1.60, buy the back-month 150 call for 4.60 — net debit 3.0. You still harvest front-month decay, but the long leg sits lower, so the structure profits if the stock grinds up modestly rather than pinning exactly.",
        },
        {
          type: "table",
          head: ["Item", "Reading"],
          rows: [
            ["Net debit (example)", "3.00 ($300), roughly the max loss if held to a bad end — confirm live"],
            ["Lean", "Mildly bullish: long 150 / short 155"],
            ["Sweet spot", "Slow drift up toward the short strike by front expiry"],
            ["Worst case", "Fast, hard rally through both strikes early"],
          ],
          caption:
            "Hypothetical. Diagonals are path-dependent: same expiry price, different route, different P&L.",
        },
        {
          type: "p",
          text: "Use a diagonal when a pure calendar feels too neutral but you still want the decay differential. Skip it when you cannot say, in one sentence, whether the thesis lives in the front expiry or the back one.",
        },
        { type: "h2", text: "Common ways this goes wrong" },
        {
          type: "ul",
          items: [
            "Treating the payoff sketch's peak as a promised payout. The drawer's chart is a teaching shape; live value depends on both legs' IV, and the peak is an estimate.",
            "Forgetting the residual. The near leg dies, the far leg stays, and the position quietly becomes a single option nobody is supervising.",
            "Paying two spreads without noticing: near and far months have separate books, and both spreads show up in your fill.",
          ],
        },
        { type: "h2", text: "Why this does not fit the ±σ table cleanly" },
        {
          type: "p",
          text: "The drawer's scenario table prices all legs under one exercise snapshot. That is an approximation while both legs are alive — and it ignores what happens after the near leg disappears. The honest second question is: \u201cwhen the front expires, what do I own, and what is my plan for it?\u201d Write that state into your plan, not into your memory.",
        },
        { type: "h2", text: "Where to check these in Q-Stock" },
        {
          type: "p",
          text: "In the drawer, pick Calendar or Diagonal, set both expiries, and adjust strikes on the legs table — everything re-prices against the live chains. Use /tools/options to price the far leg on its own and check its Greeks, since the residual option is what you will actually be holding after front expiry. Calendars want quiet, so an alert on a hard break of the strike via /alerts is cheaper than watching. Log both phases — pre- and post-front-expiry — in /review.",
        },
        {
          type: "note",
          text: "Educational, not advice. Dual-expiry risk is path-dependent; early assignment on American short legs can change the arithmetic mid-trade. If premium and IV vocabulary still feels shaky, start with the basics article.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "抽屉里选日历或对角，会多出一个到期选择器，远月链按需加载。交易之前，先能回答一个看着简单的问题：你的论点到底押在哪个到期上？日历对模糊答案毫不留情。",
        },
        { type: "h2", text: "日历价差，带数字算一遍" },
        {
          type: "p",
          text: "同行权价、两个到期：卖近月、买远月。算例：股价 150。卖近一周的 150 Call 收 2.30，买远一个月的 150 Call 付 4.60，净支出 2.30——一张合约 230 美元。你要的是近月时间价值先烧完，最好期间股价就停在 150 附近。",
        },
        {
          type: "table",
          head: ["近月到期时的情景", "近月 150 Call", "远月 150 Call", "结构价值", "盈亏"],
          rows: [
            ["股价钉在 150", "≈ 0", "≈ 4.00", "≈ 4.00", "+170"],
            ["股价拉到 165", "≈ 15.00", "≈ 16.30", "≈ 1.30", "−100"],
            ["股价远超 165", "内在价值", "跟着走", "缩向 0", "→ −230（极限）"],
          ],
          caption:
            "假设数字，BS 近似。钉住才付钱，趋势在放血；趋势走深时，最大亏损接近净支出。",
        },
        {
          type: "p",
          text: "中间那行读两遍。股价 165、涨了 10%，结构却在亏钱——两条腿一起上移，远月多出来的时间价值盖不住那张空头行权价。日历不是「加了步骤的看多」，它赌的是近月到期前不出大事。",
        },
        {
          type: "ul",
          items: [
            "预期近月到期前安静漂移、或近月相对远月在 IV 曲线上偏贵时，有人会选日历。",
            "早期单边硬趋势的伤害，静态到期图会低估——两条腿都动，只是不等速。",
            "近月腿到期或平掉之后，剩下的就是一张普通多头期权。主动管理：换论点、换计划，或者平掉。",
          ],
        },
        { type: "h2", text: "对角：带倾斜的日历" },
        {
          type: "p",
          text: "行权价和到期都错开。同一只 150 的股票，常见看涨对角：卖近一周 155 Call 收 1.60，买远月 150 Call 付 4.60，净支出 3.0。仍在收近月衰减，但长腿位置更低——股价不用恰好钉住、温和上爬时结构就开始赚钱。",
        },
        {
          type: "table",
          head: ["项目", "怎么读"],
          rows: [
            ["净支出（算例）", "3.00（300 美元），走坏时约等于最大亏损——以实时计价为准"],
            ["倾斜", "温和偏多：多 150 / 空 155"],
            ["甜点", "近月到期前缓慢爬向空头行权价"],
            ["最坏情形", "早期快速、硬性的上涨穿破两个行权价"],
          ],
          caption:
            "假设数字。对角依赖路径：同样的到期价，不同的路线，盈亏不同。",
        },
        {
          type: "p",
          text: "纯日历太中性、又想保留衰减差时用对角。一句话说不清「论点在近月还是远月」时，别硬上。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "把盈亏图的峰值当成承诺付给你的钱。抽屉那张图是教学轮廓，实时市值取决于两条腿各自的 IV，峰值只是估算。",
            "忘了残余仓。近月腿死了，远月腿还在，仓位悄悄变成一张没人管的期权。",
            "付两次价差而不自知：近月和远月是两本盘口，两次跨价差的成本都记在你的成交里。",
          ],
        },
        { type: "h2", text: "为什么它和 ±σ 情景表对不干净" },
        {
          type: "p",
          text: "抽屉的情景表把所有腿放进同一次行权快照里估价。两腿都活着时这只是近似，而且它不回答「近月腿消失之后呢」。诚实的第二个问题是：近月到期时，我手里剩下什么，我对它有什么计划？把那个状态写进计划，别写进记忆力。",
        },
        { type: "h2", text: "在钱力股里核对" },
        {
          type: "p",
          text: "抽屉里选日历或对角，设两个到期，腿表上改行权价，全部即时对实时链重算。用 /tools/options 单独给远月腿定价、看它的希腊字母——近月到期后你真正持有的就是它。日历要的是安静，所以用 /alerts 在行权价被硬破时提醒一声，比盯盘便宜。复盘时把近月到期前后两个阶段分开记进 /review。",
        },
        {
          type: "note",
          text: "仅供学习，不构成建议。双到期风险依赖路径；美式空腿的提前行权会在中途改变算术。权利金和 IV 的词汇还不熟的话，先读入门篇。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Can I read max profit off one expiry chart?",
          a: "Not cleanly. The front expiry and the residual long are two chapters with different IVs and different risks. Estimate the pin scenario, then manage from there.",
        },
        {
          q: "In the example, the stock rose 10% and the calendar still lost. Why?",
          a: "Both call legs gained together, and the far leg's extra time value could not cover the short strike at 165. Calendars earn from differential decay, not from the stock going up.",
        },
        {
          q: "Call calendar or put calendar?",
          a: "Same time thesis; skew and early-assignment quirks differ. Liquidity and per-strike IV usually decide — pick the side with the tighter spreads.",
        },
        {
          q: "What do I do when the front leg expires?",
          a: "Make a decision the same week: close the residual, re-justify it with a fresh thesis, or roll into a new calendar. \u201cLeave it and forget\u201d is how a planned trade becomes an accidental one.",
        },
      ],
      "zh-CN": [
        {
          q: "一张到期盈亏图能读出最大盈利吗？",
          a: "读不干净。近月到期和残余长仓是两章，IV 不同、风险不同。先估钉住情景，再从那里开始管理。",
        },
        {
          q: "例子里股价涨了 10%，日历怎么还亏钱？",
          a: "两条 Call 腿一起涨，远月多出的时间价值在 165 处盖不住空头行权价。日历赚的是衰减差，不是股价上涨。",
        },
        {
          q: "做 Call 日历还是 Put 日历？",
          a: "时间论点相同；偏斜与提前行权细节不同。通常由流动性和各行权价的 IV 决定——选价差更窄的那一侧。",
        },
        {
          q: "近月腿到期了怎么办？",
          a: "同一周内做决定：平掉残余、用新论点重新论证、或滚成新一组日历。「放着忘掉」是计划内交易变成意外持仓的最短路径。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "Volatility templates", href: "/learn/options-strategies-volatility" },
        { label: "Expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Greeks in practice", href: "/learn/options-greeks-in-practice" },
        { label: "Options calculator", href: "/tools/options" },
        { label: "Watchlist and alerts", href: "/watchlist" },
      ],
      "zh-CN": [
        { label: "期权入门：作用与定价", href: "/learn/options-basics-roles-pricing" },
        { label: "跨式 · 宽跨式 · 蝶式", href: "/learn/options-strategies-volatility" },
        { label: "到期与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "希腊字母实战", href: "/learn/options-greeks-in-practice" },
        { label: "期权计算器", href: "/tools/options" },
        { label: "自选与提醒", href: "/watchlist" },
      ],
    },
    sourceNote: {
      en: "Educational. Scenario values are hypothetical approximations; confirm both chains' liquidity and early-assignment rules. Not advice.",
      "zh-CN":
        "仅供学习。情景数值为假设近似；两条链的流动性与提前行权规则请自行确认。不构成建议。",
    },
  },
];
