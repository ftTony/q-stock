import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Consolidated from six thin per-template articles (290–400 chars each).
 * Six 300-character pages could not rank for anything; as one page they cover
 * the whole template library and still leave room for the variables that matter.
 */
export const LEARN_ARTICLES_MERGED_STRATEGY: LearnArticle[] = [
  {
    slug: "strategy-lab-six-templates",
    category: "tools",
    ctaHref: "/strategies",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      "zh-CN": "规则实验室六个模板：每个在教你什么，变量怎么改",
      en: "The six Rule Lab templates: what each one teaches, and which knob to turn",
    },
    summary: {
      "zh-CN":
        "双均线、突破止损、失效价、时间出场、风险定仓、定额定投——六个模板不是六种赚钱方法，是六种把话说清楚的方式。",
      en:
        "MA cross, breakout with stop, invalidation level, time exit, risk sizing, fixed DCA — six templates, not six ways to make money, but six ways to say what you mean.",
    },
    paragraphs: {
      "zh-CN": [
        "规则实验室里的六个模板，本质上是六种「把交易假设写成可检查的规则」的练习。它们各自只盯住一个变量：交叉、止损距离、失效价、持有时间、仓位口径、买入节奏。六个都跑一遍，你会发现自己最常在哪一环含糊。",
      ],
      en: [
        "The six templates in Rule Lab are six exercises in writing a trade thesis as a checkable rule. Each isolates a single variable: the cross, the stop distance, the invalidation level, the holding clock, the sizing basis, the buy cadence. Run all six and you will find the one step where your thinking is usually vague.",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "先纠正一个预期：这不是六个策略，也就不存在「哪个收益最高」。回放用的是简化日 K 成交假设，没有滑点、没有排队、没有你的情绪。它的用途是让你看见规则的行为特征——触发密不密、回撤有多深、在震荡里会亏多少次——而不是给未来收益做预测。",
        },
        { type: "h2", text: "六个模板一览" },
        {
          type: "table",
          head: ["模板", "入场", "出场", "它在教你", "关键变量"],
          rows: [
            ["双均线交叉", "快线上穿慢线", "快线下穿慢线", "信号的滞后与震荡磨损", "fast / slow 周期"],
            ["突破 + 止损", "创 N 日新高", "固定百分比止损", "先定亏得起，再谈追高", "lookback、stop_pct"],
            ["失效价出场", "突破入场", "跌破预设价位", "承认计划作废，不事后挪线", "price_level 与比较方向"],
            ["持有 N 日必出", "均线交叉", "持有满 N 根 K 线", "用时间约束死扛", "hold_bars"],
            ["风险定仓", "均线交叉等信号", "止损百分比", "用亏得起反推买多少", "riskPercent、maxPositionPct"],
            ["定额定投", "固定间隔买入", "模板内常设超长持有", "平滑成本，不是收益承诺", "cooldownBars、fixedNotional"],
          ],
        },
        { type: "h2", text: "双均线交叉：学滞后，不学圣杯" },
        {
          type: "p",
          text: "金叉开多、死叉平仓。它教的第一件事是滞后：信号永远晚于价格拐点，而且快慢线的差距越小信号越密、越噪，差距越大越滞后、交易越少。第二件事是磨损：震荡市里连续小亏会把趋势段的利润吃掉，这部分亏损不是策略「坏了」，是它的成本结构。",
        },
        {
          type: "p",
          text: "回放时只改一个周期再对比，别一次拧所有旋钮。如果你同时改了周期、仓位和止损，结论就无法归因。",
        },
        { type: "h2", text: "突破 + 止损：先定亏得起" },
        {
          type: "p",
          text: "价格创近 N 日新高开多，入场价下方固定百分比止损。它的价值在于强制你先写下「这一笔最多亏多少」，再谈突破能不能延续。假突破被扫损是这类规则的成本的一部分，不是执行失误。",
        },
        {
          type: "p",
          text: "变量上，N 越大突破越稀有也越滞后；止损越紧，扫损次数越多，单笔损失越小。这两者要一起看：只把止损收紧而不看胜率变化，很容易得到一条交易次数更多、净结果更差的曲线。",
        },
        { type: "h2", text: "失效价出场：承认计划作废的那条线" },
        {
          type: "p",
          text: "失效价通常来自结构——区间下沿、关键支撑——而不是一个取整的百分比。它的意义是事先承认「价格到这里，我的叙事就不成立了」。这比浮动止损更难，因为浮动止损允许你在事后挪线。",
        },
        {
          type: "p",
          text: "模板里的价格是示例数字，复制后必须换成你在标的上事先画好的线。失效价离现价太近会被噪声扫出，太远等于几乎不失效。判断标准不是「亏多少钱舒服」，而是「什么价位证明我错了」。",
        },
        { type: "h2", text: "持有 N 日必出：用时间约束死扛" },
        {
          type: "p",
          text: "入场信号之后，持有满 N 根 K 线就平仓。它不保证卖在最高点，但保证有一个默认退出时钟，专门对付「盈利了再等等、亏了再扛扛」这个最常见的失效模式。",
        },
        {
          type: "p",
          text: "N 极短会把策略变成噪声交易，N 极长则几乎不构成约束。它的最佳用法是当对照组：同一段行情下，与「仅死叉出场」的版本对比，看你的死扛通常发生在第几根 K 线。",
        },
        { type: "h2", text: "风险定仓：用亏得起反推买多少" },
        {
          type: "p",
          text: "先定这一笔最多亏权益的百分之几，再结合止损距离反推可买数量，并受单标上限约束。它纠正的顺序错误很具体：多数人是先拍一个股数，再倒推「那我止损放哪」——这样止损是被仓位逼出来的，不是被结构决定的。",
        },
        {
          type: "p",
          text: "验证方法很简单：把止损距离调宽，看名义仓位是不是自动变小。如果没有变小，说明口径有问题。另外要留意多笔高度相关的持仓会叠加风险，单笔 1% 在五只同板块标的上不等于组合 1%。",
        },
        { type: "h2", text: "定额定投：平滑成本，不是收益承诺" },
        {
          type: "p",
          text: "每隔固定交易日买入固定金额，涨跌都执行同一动作。它把「买入节奏」写成纪律，用来体会机械分批与一次性投入的路径差异，而不是证明「定投一定赚钱」。",
        },
        {
          type: "p",
          text: "高杠杆或高波动合约上机械加仓的风险结构与宽基指数完全不同，不要套用同一个模板。分批与一次性的完整对比——包括分红再投和真实费率——另有一篇专门算过。",
        },
        { type: "h2", text: "六个模板的共同点" },
        {
          type: "ul",
          items: [
            "都只隔离一个变量。同时改三个，你无法知道结果由谁造成。",
            "都需要一个事先写下的失效条件。没有失效条件的规则不是规则，是愿望。",
            "都在回放里暴露同一个问题：你会想在中途改规则。这个冲动本身就是练习目标。",
            "都不预测收益。它们描述行为，收益是行为在特定市场环境下的结果。",
          ],
        },
        { type: "h2", text: "回放怎么做才有意义" },
        {
          type: "ul",
          items: [
            "一次只改一个变量，其余全部固定，否则无法归因。",
            "同一区间至少跑两个版本（例如仅死叉出场 vs 加时间出场），把差异记下来。",
            "看四个数：触发频率、最大回撤、连续亏损次数、与买入持有的对照。",
            "写下三句笔记再离开：触发密不密？回撤能不能接受？有没有想中途改规则的冲动？",
            "想改规则时开新版本回放，不要在原来的记录上改——否则历史会变成你想要的样子。",
          ],
        },
        {
          type: "p",
          text: "最后提醒：回放基于简化成交假设，不含滑点、部分成交和心理压力。它的结论只对「规则的行为特征」有效，不能外推成未来收益。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Clear up one expectation first: these are not six strategies, so there is no “which one earns most.” Replays use simplified daily-bar fills — no slippage, no queue, no emotions. Their job is to show how a rule behaves: how often it triggers, how deep it draws down, how many small losses a range produces. Not to forecast returns.",
        },
        { type: "h2", text: "The six templates at a glance" },
        {
          type: "table",
          head: ["Template", "Entry", "Exit", "What it teaches", "Key knobs"],
          rows: [
            ["MA crossover", "Fast MA above slow MA", "Fast crosses below", "Signal lag and chop wear", "fast / slow periods"],
            ["Breakout + stop", "N-day high", "Fixed % stop", "Budget the loss before the chase", "lookback, stop_pct"],
            ["Invalidation exit", "Breakout entry", "Price level breach", "Let the plan die without moving the line", "price_level and direction"],
            ["Time exit", "MA cross", "Flat after N bars", "A clock against holding forever", "hold_bars"],
            ["Risk sizing", "Any entry signal", "% stop", "Size from what you can lose", "riskPercent, maxPositionPct"],
            ["Fixed DCA", "Buy every N bars", "Long hold inside the template", "Smooth cost, not a return promise", "cooldownBars, fixedNotional"],
          ],
        },
        { type: "h2", text: "MA crossover: learn the lag, not a holy grail" },
        {
          type: "p",
          text: "Long on the golden cross, flat on the death cross. The first lesson is lag: the signal always arrives after the turn, and tighter fast/slow gaps mean denser, noisier signals while wider gaps mean fewer and later trades. The second lesson is wear: consecutive small losses in a range eat the profits from the trending stretch. That loss is the cost structure, not a broken strategy.",
        },
        {
          type: "p",
          text: "Change one period between runs. If you change period, size, and stop together, you cannot attribute the result to anything.",
        },
        { type: "h2", text: "Breakout + stop: budget the loss first" },
        {
          type: "p",
          text: "Enter on an N-day high with a fixed percentage stop below entry. Its value is forcing you to write down the maximum loss before discussing whether the breakout extends. Getting stopped out on a fake breakout is part of the cost of this rule, not an execution mistake.",
        },
        {
          type: "p",
          text: "Larger N means rarer and later breakouts; tighter stops mean more shakeouts and smaller losses each time. Read them together — tightening a stop without watching the hit rate usually produces more trades and a worse net result.",
        },
        { type: "h2", text: "Invalidation exit: the line that voids the plan" },
        {
          type: "p",
          text: "Invalidation usually comes from structure — a range low, a key support — not a round percentage. It means admitting in advance that if price trades there, the thesis is wrong. That is harder than a trailing stop, because a trailing stop lets you move the line afterwards.",
        },
        {
          type: "p",
          text: "The price in the template is a placeholder; replace it with a level you marked before the trade. Too close and noise takes you out; too far and it never invalidates. The test is not “where am I comfortable losing money” but “what price proves I was wrong.”",
        },
        { type: "h2", text: "Time exit: a clock against holding forever" },
        {
          type: "p",
          text: "After an entry signal, go flat once N bars have passed. It will not sell the top, but it guarantees a default exit clock — aimed squarely at the most common failure mode: hold the winner a bit longer, hold the loser a bit longer.",
        },
        {
          type: "p",
          text: "Tiny N turns the rule into noise trading; huge N is no constraint at all. Its best use is as a control group: run it against an MA-only exit on the same window and see which bar number your “just wait” behaviour usually lands on.",
        },
        { type: "h2", text: "Risk sizing: size from what you can lose" },
        {
          type: "p",
          text: "Set a max loss as a percentage of equity, divide by the stop distance, cap by a per-symbol limit. It corrects a specific ordering error: most people pick a share count first and then ask where the stop should go — which makes the stop a function of the position rather than of structure.",
        },
        {
          type: "p",
          text: "Verify it simply: widen the stop and check that notional size shrinks. If it does not, the sizing basis is wrong. Also remember that correlated positions stack risk — 1% per trade across five names in one sector is not 1% for the book.",
        },
        { type: "h2", text: "Fixed DCA: smooth cost, not a return promise" },
        {
          type: "p",
          text: "Buy the same amount on a fixed cadence regardless of price. It turns buy rhythm into discipline and lets you compare paced entry against lump sum — it does not prove DCA always wins.",
        },
        {
          type: "p",
          text: "Mechanical adding on leveraged or highly volatile contracts has a completely different risk structure from broad indices; do not reuse the same template. The full lump-sum comparison — including reinvested dividends and real fees — has its own article.",
        },
        { type: "h2", text: "What all six have in common" },
        {
          type: "ul",
          items: [
            "Each isolates one variable. Change three at once and you learn nothing about attribution.",
            "Each needs a written invalidation condition. A rule without one is a wish.",
            "Each exposes the same temptation in replay: editing the rule mid-run. That urge is the exercise.",
            "None forecasts returns. They describe behaviour; returns are behaviour meeting an environment.",
          ],
        },
        { type: "h2", text: "How to make a replay mean something" },
        {
          type: "ul",
          items: [
            "Change one variable per run and hold everything else fixed, or attribution is impossible.",
            "Run at least two versions on the same window (e.g. MA-only exit vs MA plus time exit) and log the difference.",
            "Read four numbers: trigger frequency, max drawdown, longest losing streak, and the buy-and-hold comparison.",
            "Write three notes before leaving: how dense were triggers, could you sit through the drawdown, did you want to bend the rule?",
            "When you want to change something, start a new version — do not edit the old record, or history becomes what you wanted.",
          ],
        },
        {
          type: "p",
          text: "One last caveat: replays assume simplified fills, with no slippage, partial fills, or psychological pressure. Conclusions hold for rule behaviour only; they do not extrapolate to future returns.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "六个模板里哪个最好？",
          a: "没有「最好」，它们隔离的是不同变量。选择标准应该是「我最容易在哪一环含糊」，而不是「哪条曲线最漂亮」。",
        },
        {
          q: "回放赚钱就说明策略有效吗？",
          a: "不能。回放用简化成交假设，样本区间也有限。它只能说明在这段历史、这套假设下规则的表现，不能外推到未来。",
        },
        {
          q: "止损应该设固定百分比还是失效价？",
          a: "如果你的入场依据是结构，就用失效价；如果更看重风险预算的一致性，就用固定百分比。两者都能用，但不能混着用而不自知。",
        },
        {
          q: "为什么回放里我总想改规则？",
          a: "因为看到结果之后改条件，是人类默认的反应。这正是练习要针对的：把「想改」这个冲动记录下来，而不是真的去改。",
        },
        {
          q: "定投模板适合所有品种吗？",
          a: "不适合。宽基指数、ETF 与高杠杆合约的风险结构完全不同，机械加仓在后者上可能快速放大亏损。",
        },
      ],
      en: [
        {
          q: "Which of the six templates is best?",
          a: "There is no best; they isolate different variables. Choose by which step you usually leave vague, not by which equity curve looks prettiest.",
        },
        {
          q: "If a replay is profitable, is the strategy proven?",
          a: "No. Replays use simplified fills on a limited window. They describe behaviour in that history under those assumptions, not future returns.",
        },
        {
          q: "Should the stop be a fixed percentage or an invalidation level?",
          a: "Use a level if your entry is structural, a percentage if consistent risk budgeting matters more. Both work — but do not mix them without knowing which one you are using.",
        },
        {
          q: "Why do I always want to change rules mid-replay?",
          a: "Because adjusting conditions after seeing outcomes is the default human response. That is exactly what the exercise targets: record the urge instead of acting on it.",
        },
        {
          q: "Does the DCA template fit every instrument?",
          a: "No. Broad indices, ETFs, and leveraged contracts have entirely different risk structures; mechanical adding can amplify losses quickly in the last case.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "打开规则实验室", href: "/strategies" },
        { label: "定投 vs 一次性投入：完整对比", href: "/learn/lump-sum-vs-dca" },
        { label: "仓位与止损计算器", href: "/tools/position" },
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
        { label: "均线与 MACD：趋势和动量两把尺", href: "/learn/indicator-trend-momentum" },
      ],
      en: [
        { label: "Open Rule Lab", href: "/strategies" },
        { label: "Lump sum vs DCA: the full comparison", href: "/learn/lump-sum-vs-dca" },
        { label: "Position and stop calculator", href: "/tools/position" },
        { label: "Risk-reward and expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Moving averages and MACD", href: "/learn/indicator-trend-momentum" },
      ],
    },
    sourceNote: {
      "zh-CN":
        "模板中的周期、止损百分比、回看天数均为教学默认值，不是推荐参数。回放基于简化日 K 成交假设，不含滑点与部分成交，结果仅供学习。",
      en:
        "Periods, stop percentages, and lookbacks in the templates are teaching defaults, not recommended parameters. Replays assume simplified daily-bar fills without slippage or partial fills.",
    },
  },
];
