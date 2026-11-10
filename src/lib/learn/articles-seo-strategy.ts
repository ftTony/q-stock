import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/** Strategy cluster: behavioural topics with an explicit method section. */
export const LEARN_ARTICLES_SEO_STRATEGY: LearnArticle[] = [
  {
    slug: "lump-sum-vs-dca",
    category: "tools",
    ctaHref: "/tools/dca",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Lump sum or dollar-cost averaging? Open the data, and the answer stops being clean",
      "zh-CN": "定投还是一次性投入：把数据摊开看，结论不那么干脆",
    },
    summary: {
      en: "Mathematically, investing earlier wins more often in a rising market. Behaviourally, averaging wins because people finish the plan. The interesting part is knowing which of the two problems you actually have.",
      "zh-CN": "在上涨的市场里，早投入在数学上更常占优；但从行为上看，定投更容易被坚持到底。真正有意思的是：你面对的到底是哪一个问题。",
    },
    paragraphs: {
      en: [
        "The debate is usually framed as a contest between two strategies. It is really a contest between two problems.",
        "One is a maths problem about time in the market. The other is a behaviour problem about staying in it.",
      ],
      "zh-CN": [
        "这场争论通常被摆成两种策略的对决，其实它是两个问题的对决。",
        "一个是关于「资金在市场里待多久」的数学题，另一个是关于「你能不能坚持住」的行为题。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: if you already hold the cash and your horizon is long, investing it sooner has the higher expected return, because risk premia accrue with time. Averaging in lowers the chance of a terrible entry and raises the chance you complete the plan. Neither dominates — they optimise different things.",
        },
        { type: "h2", text: "Why the debate never resolves" },
        {
          type: "p",
          text: "Most comparisons pick one market and one window, then report which did better. Change the window and the winner changes. A conclusion that flips when you move the start date by two years is not a finding, it is a sample.",
        },
        { type: "h2", text: "The six parameters a backtest must disclose" },
        {
          type: "ul",
          items: [
            "Instrument and market — index, ETF or single stock, and which currency.",
            "Start and end dates, plus how many alternative windows were tested.",
            "Contribution frequency and the exact day of each purchase.",
            "Whether cash sits in a deposit earning interest while waiting.",
            "Fees, spreads and taxes on every contribution and on the final sale.",
            "Dividend treatment: reinvested, taken as cash, or ignored.",
          ],
        },
        {
          type: "note",
          text: "If a study does not state these six, its conclusion is not reproducible, and an irreproducible conclusion about your money is not evidence. This is also why we publish the method rather than a single 「X% better」 headline.",
        },
        { type: "h2", text: "Why investing earlier usually wins on paper" },
        {
          type: "p",
          text: "Equity risk premium is compensation for holding risk over time. Cash waiting on the sidelines earns the short rate instead. Over long horizons the expected gap is positive, so the strategy with more time exposed has the higher expected value — regardless of whether any single year cooperates. Averaging in deliberately holds cash, so it starts with a structural handicap.",
        },
        { type: "h2", text: "Why averaging still wins in practice" },
        {
          type: "p",
          text: "Expected value assumes you finish. A lump sum invested the week before a 30% drawdown is mathematically fine and behaviourally fatal: many people sell, and the plan ends there. Averaging spreads the entry price, shortens the regret window, and converts a single decision into a routine. The return it gives up is the fee you pay for completion.",
        },
        { type: "h2", text: "The distribution matters more than the average" },
        {
          type: "table",
          head: ["Question", "Lump sum", "Averaging in"],
          rows: [
            ["Expected return over a long horizon", "Higher", "Lower"],
            ["Worst-case entry timing", "Unprotected", "Diversified across prices"],
            ["Chance of abandoning the plan", "Higher after a bad start", "Lower"],
            ["Effort and monitoring", "One decision", "A schedule, sustained"],
            ["Works with irregular income", "No", "Yes"],
          ],
          caption:
            "Averages hide the tails. If the bad tail is the outcome you would actually quit on, the average is not the number that governs your life.",
        },
        { type: "h2", text: "Which problem are you actually solving?" },
        {
          type: "table",
          head: ["Your situation", "Reasonable default", "Reason"],
          rows: [
            ["Lump sum in hand, 10+ year horizon, no leverage", "Invest now, in tranches over weeks", "Keeps most of the time-in-market advantage, reduces single-day risk"],
            ["Monthly salary surplus", "Scheduled contributions", "You do not have the lump sum; the choice is hypothetical"],
            ["Known upcoming cash need within 3 years", "Neither — hold cash or short duration", "Horizon too short for equity risk"],
            ["History of selling in drawdowns", "Averaging, with a written rule", "Completion beats optimisation"],
          ],
        },
        { type: "h2", text: "Run it on your own numbers" },
        {
          type: "p",
          text: "Put your actual contribution schedule, fee level and horizon into the DCA tool, then run the same amount as a single purchase on the same dates. Compare not just the ending value but the path — the maximum drawdown you would have had to sit through is the number that decides whether you finish.",
        },
        { type: "h2", text: "When averaging in is guaranteed to lose" },
        {
          type: "p",
          text: "If the asset rises monotonically from day one with no drawdown, averaging in must underperform a lump sum: your first purchase is at the lowest price and every later one is more expensive. That is structure, not luck.",
        },
        {
          type: "p",
          text: "More precisely, the average purchase price under fixed cash contributions is the harmonic mean of the period prices, while a lump sum pays the opening price. For a rising series the harmonic mean sits above the opening price, so your cost basis is higher — and the more one-directional the move, the wider the gap.",
        },
        {
          type: "p",
          text: "Conversely, averaging only overtakes when prices fall first, fall far enough, and stay low long enough for the cheap purchases to accumulate. In other words, DCA wins by going through exactly the period you least want to sit through.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：如果现金已经在手、投资期限又长，早投入的期望收益更高，因为风险溢价是按时间累积的；分批投入降低的是「买在坏时点」的概率，抬高的是「你能把计划执行完」的概率。两者优化的不是同一件事。",
        },
        { type: "h2", text: "为什么这场争论永远没有结论" },
        {
          type: "p",
          text: "大多数对比只挑一个市场、一段区间，然后报告谁赢。换个区间，赢家就换了。一个把起点挪两年就翻转的结论，不是发现，是样本。",
        },
        { type: "h2", text: "回测必须交代的六个参数" },
        {
          type: "ul",
          items: [
            "标的与市场：指数、ETF 还是个股，用什么货币计价。",
            "起止日期，以及一共试过多少个不同区间。",
            "投入频率，以及每月具体哪一天买入。",
            "等待期间现金是否计息，按什么利率计。",
            "每次投入和最终卖出的费用、点差与税。",
            "分红如何处理：再投、取现，还是忽略。",
          ],
        },
        {
          type: "note",
          text: "一份没说清这六项的研究，结论不可复现；而关于你钱的研究，不可复现的结论不算证据。这也是本文只给方法、不给「高出 X%」这种标题的原因。",
        },
        { type: "h2", text: "为什么纸面上早投入更常占优" },
        {
          type: "p",
          text: "股票风险溢价是对「承担时间风险」的补偿，而场外现金只能拿到短端利率。长期看这个差值为正，所以暴露时间更长的方案期望值更高——不管某一年是否配合。分批投入是主动持有现金，所以它一开始就带着结构性劣势。",
        },
        { type: "h2", text: "为什么实践中定投仍然赢" },
        {
          type: "p",
          text: "期望值的前提是「你把计划执行完」。一次性投在一轮 30% 回撤前一周，数学上没问题，行为上是致命的：很多人会卖，计划到此结束。分批投入摊平了入场价、缩短了后悔窗口，把一个决定变成一套习惯。它让出的收益，是你能走完全程的门票钱。",
        },
        { type: "h2", text: "分布比平均值更重要" },
        {
          type: "table",
          head: ["问题", "一次性投入", "分批投入"],
          rows: [
            ["长周期期望收益", "更高", "更低"],
            ["最差入场时点", "无保护", "在不同价位摊开"],
            ["中途放弃的概率", "开局不利时更高", "更低"],
            ["精力投入", "一次决定", "长期执行的纪律"],
            ["适配不稳定收入", "不适合", "适合"],
          ],
          caption:
            "平均值会藏住尾部。如果那个坏尾部正是你会放弃的情形，那么平均值就不是支配你生活的那个数。",
        },
        { type: "h2", text: "你真正要解的是哪个问题" },
        {
          type: "table",
          head: ["你的情况", "较合理的默认做法", "原因"],
          rows: [
            ["手上有一笔现金、期限 10 年以上、不用杠杆", "现在开始投，分几周建仓", "保住大部分时间优势，降低单日风险"],
            ["每月工资结余", "按计划定投", "你本来就没有那笔现金，选择题是假设的"],
            ["3 年内有确定用钱需求", "两者都不选，持现金或短久期", "期限太短，承担不起股票风险"],
            ["历史上在回撤中卖过", "定投 + 写成文字的规则", "执行完胜过最优化"],
          ],
        },
        { type: "h2", text: "用你自己的数字跑一遍" },
        {
          type: "p",
          text: "把你的投入计划、费率、期限放进定投工具，再把同样金额在同样日期做一次性买入，对比。不要只看终值，要看路径——你需要忍受的最大回撤，才是决定你能否坚持的那个数。",
        },
        { type: "h2", text: "数学上，定投什么时候必然更差" },
        {
          type: "p",
          text: "如果标的从第一天起单边上涨、中途没有回撤，定投必然落后于一次性：你第一笔买在最低价，后面每一笔都买得更贵。这不是运气问题，是结构问题。",
        },
        {
          type: "p",
          text: "更严格一点说，定投的平均买入价是各期价格的调和平均，而一次性投入的买入价是期初价格。对一段整体上行的价格序列，调和平均高于期初价，所以成本更高——区间越单边，劣势越明显。",
        },
        {
          type: "p",
          text: "反过来，只有当价格先跌后涨、且跌幅足够深、低位停留足够久，定投才能在低价区累积更多份额，从而反超。也就是说：定投赢的条件是「先亏」，而这恰恰是它最难受的时候。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is dollar-cost averaging mathematically inferior?",
          a: "On expected return over a long horizon, usually yes, because it holds cash. That is not the only objective a real investor has.",
        },
        {
          q: "How often should I contribute?",
          a: "Frequency matters far less than starting and continuing. Monthly and weekly schedules produce very similar results over years; stopping does not.",
        },
        {
          q: "Does averaging work in a falling market?",
          a: "It does what it says: it spreads your entry. Whether that is good depends on what happens after, which is unknowable at the time.",
        },
        {
          q: "Can I combine both?",
          a: "Yes, and most people should: invest the lump sum in tranches over weeks, then keep a scheduled plan with ongoing income.",
        },
      ],
      "zh-CN": [
        {
          q: "定投在数学上真的更差吗？",
          a: "就长期期望收益而言通常是的，因为它持有现金。但那不是真实投资者的唯一目标。",
        },
        {
          q: "多久投一次合适？",
          a: "频率远不如「开始」和「持续」重要。按月还是按周，几年下来结果很接近；停下来则完全不同。",
        },
        {
          q: "下跌市里定投有效吗？",
          a: "它只做它承诺的事：摊开入场价。这好不好取决于之后发生什么，而当时没人知道。",
        },
        {
          q: "两种可以一起用吗？",
          a: "可以，而且多数人应该这样：现金分几周建仓，同时用持续收入维持定投计划。",
        },
      ],
    },
    links: {
      en: [
        { label: "DCA calculator", href: "/tools/dca" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Adjusted prices and dividends", href: "/learn/adjusted-price-and-dividends" },
      ],
      "zh-CN": [
        { label: "定投计算器", href: "/tools/dca" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "复权、除权与分红再投", href: "/learn/adjusted-price-and-dividends" },
      ],
    },
    sourceNote: {
      en: "No return figures are quoted on purpose: any single window can be chosen to support either side. The method section is the reproducible part; run it on your own schedule.",
      "zh-CN":
        "本文刻意不引用收益率数字：任何单一区间都能被挑出来支持任意一方。可复现的是方法部分，请用你自己的计划跑一遍。历史表现不代表未来。",
    },
  },
  {
    slug: "risk-reward-expectancy",
    category: "tools",
    ctaHref: "/tools/risk-reward",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: "2026-11-10",
    title: {
      en: "A 1:2 risk-reward ratio is not a strategy — here is the win rate it requires",
      "zh-CN": "风险回报比 1:2 就能赚钱？先算清楚它要求的胜率",
    },
    summary: {
      en: "A 1:2 ratio only breaks even at a 33.3% win rate before costs. Add commission and slippage and the bar rises. Expectancy, not the ratio, is what pays you.",
      "zh-CN": "1:2 的盈亏比，在扣费前需要 33.3% 的胜率才刚好打平。加上佣金和滑点，门槛会更高。付你钱的是期望值，不是那个比值。",
    },
    paragraphs: {
      en: [
        "The ratio is the easy part. Whether it makes money depends on how often you are right and what each attempt costs. Expectancy settles most of the argument.",
        "One formula, one worked example, and the slogan stops being a slogan.",
      ],
      "zh-CN": [
        "比值是最容易算的部分。它能不能赚钱，取决于你对的频率，和每次尝试的成本。期望值一个公式就能终结大部分争论。",
        "一个公式加一个算例，口号就不再是口号。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Expectancy = win rate × reward − loss rate × risk − cost. At 1:2, break-even is a 33.3% win rate before fees; at 1:1 it is 50%. A ratio alone never tells you whether a setup works—the pair of ratio and win rate does.",
        },
        { type: "h2", text: "The formula behind the slogan" },
        {
          type: "p",
          text: "Let R be the reward per unit of risk. Expectancy per trade is p × R − (1 − p). Setting it to zero gives the break-even win rate p* = 1 ÷ (1 + R). That is the entire content of the “1:2 needs 33%” claim—arithmetic, not market insight.",
        },
        { type: "h2", text: "Break-even win rates by ratio" },
        {
          type: "table",
          head: ["Reward : risk", "Break-even win rate", "What it implies"],
          rows: [
            ["0.5 : 1", "66.7%", "Needs a high-hit-rate setup"],
            ["1 : 1", "50%", "A coin flip before costs"],
            ["1.5 : 1", "40%", "Moderate edge required"],
            ["2 : 1", "33.3%", "The classic “1:2” claim"],
            ["3 : 1", "25%", "Fewer, larger winners"],
            ["4 : 1", "20%", "Requires tolerance for long losing streaks"],
          ],
          caption:
            "Before costs. Every trade also pays commission, spread and slippage, which shifts every number in the middle column upward.",
        },
        { type: "h2", text: "Costs move the goalposts" },
        {
          type: "p",
          text: "If each attempt costs c, expressed as a fraction of the amount you risk, the bar becomes p* = (1 + c) ÷ (1 + R). Risk 1,000 per trade, pay 50 in commission and slippage, and at 2:1 the bar climbs from 33.3% to 35%. Cost per attempt matters more than cost per share—high-frequency approaches need a bigger edge, not a smaller one.",
        },
        { type: "h2", text: "A full expectancy example (hypothetical)" },
        {
          type: "table",
          head: ["Outcome", "Probability", "P&L per trade (risk = 1,000)"],
          rows: [
            ["Target hit, +2R", "40%", "+2,000"],
            ["Stop hit, −1R", "60%", "−1,000"],
          ],
          caption:
            "Expectancy = 0.4 × 2,000 − 0.6 × 1,000 = +200 per trade before costs. Hypothetical numbers, not recommended parameters.",
        },
        {
          type: "p",
          text: "Add cost: 50 per attempt makes the average +150. Still positive—but expectancy is a long-run average, not a per-trade promise. Quit executing after three losses, or double up to get it back, and a positive machine still ruins the account. The win-rate input also has to come from a log, not memory: the review page keeps every paper fill, so pull the number from there instead of from your impression.",
        },
        { type: "h2", text: "Win rate is an outcome, not a setting" },
        {
          type: "p",
          text: "You cannot choose to win 40% of the time. What you can choose is where the stop goes, and that determines the risk side of the ratio. Tightening the stop to manufacture a 3:1 ratio raises the chance of being stopped out—the ratio and the win rate are not independent dials. Anyone quoting a ratio without the matching hit rate is quoting half a system.",
        },
        { type: "h2", text: "Sizing: where the ratio becomes money" },
        {
          type: "p",
          text: "Account 100,000, risk per trade 1% = 1,000. Entry 50, stop 46, so risk per share is 4. Size = 1,000 ÷ 4 = 250 shares, or 12,500 in market value—12.5% of the account. Note what is 1% of the account: the risk, not the position. Confusing the two is how a “small” position becomes a large loss. Run the arithmetic through /tools/position rather than in your head.",
        },
        { type: "h2", text: "Losing streaks are the baseline, not the exception" },
        {
          type: "p",
          text: "Take a 40% win rate over 100 trades. A run of six consecutive losses has probability 0.6⁶ ≈ 4.7% at any given start, and 100 trades offer nearly a hundred starting points—so seeing one is unremarkable.",
        },
        {
          type: "p",
          text: "A useful approximation: the expected longest losing streak is about ln(number of trades) ÷ ln(1 ÷ loss rate). At 100 trades and a 60% loss rate, ln100 ÷ ln1.667 ≈ 9. A nine-loss run is not a malfunction; it is the system behaving as designed.",
        },
        {
          type: "p",
          text: "That number sets your size. Risking 1% per trade, nine losses cost about 9%. Risking 10%, they cost about 61%, and you now need a 2.5x gain to recover. Same edge, different size, opposite outcome: still trading versus forced out.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Moving the stop further away as price approaches it: the planned risk becomes an open-ended one.",
            "Banking winners early while losers run: this compresses R below 1 without changing the win rate.",
            "Upsizing after a loss to get it back: that multiplies the cost of the streak instead of surviving it.",
          ],
        },
        {
          type: "note",
          text: "Before entry: entry, stop, target and account into /tools/risk-reward, then the resulting size through /tools/position. Three minutes, and you know whether the trade survives arithmetic before it has to survive you.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "期望值 = 胜率 × 盈利 − 败率 × 亏损 − 成本。1:2 的盈亏比，扣费前打平需要 33.3% 的胜率；1:1 需要 50%。比值本身不说明一个形态能不能做，比值和胜率这一对才说明。",
        },
        { type: "h2", text: "口号背后的公式" },
        {
          type: "p",
          text: "设 R 为每单位风险对应的盈利。单笔期望 = p × R −（1 − p）。令其为零，临界胜率 p* = 1 ÷（1 + R）。「1:2 需要 33%」的全部内容就是这个式子——它是算术，不是市场洞见。",
        },
        { type: "h2", text: "不同盈亏比对应的临界胜率" },
        {
          type: "table",
          head: ["盈亏比", "临界胜率", "意味着什么"],
          rows: [
            ["0.5 : 1", "66.7%", "需要高胜率形态"],
            ["1 : 1", "50%", "扣费前就是抛硬币"],
            ["1.5 : 1", "40%", "需要中等优势"],
            ["2 : 1", "33.3%", "经典的「1:2」说法"],
            ["3 : 1", "25%", "交易更少、单笔更大"],
            ["4 : 1", "20%", "要能忍受长连亏"],
          ],
          caption:
            "以上均为扣费前。每笔还要付佣金、点差和滑点，会把中间列每个数字都往上推。",
        },
        { type: "h2", text: "成本把门槛挪走" },
        {
          type: "p",
          text: "若每次尝试的成本为 c（以风险金额为分母），临界胜率变成 p* =（1 + c）÷（1 + R）。每笔风险 1000、成本 50，在 2:1 下门槛从 33.3% 升到 35%。「每次尝试的成本」比「每股的成本」重要得多——这正是高频做法需要更大优势而不是更小优势的原因。",
        },
        { type: "h2", text: "期望值算例（假设）" },
        {
          type: "table",
          head: ["结果", "概率", "每笔损益（风险 1000 计）"],
          rows: [
            ["止盈 +2R", "40%", "+2000"],
            ["止损 −1R", "60%", "−1000"],
          ],
          caption: "期望值 = 0.4 × 2000 − 0.6 × 1000 = 每笔 +200（扣费前）。假设数字，不是推荐参数。",
        },
        {
          type: "p",
          text: "把成本放进来：每次尝试付 50，均值变成 +150。还是正的——但期望值是长期平均，不是每一笔的承诺。连亏三笔就不执行了，或者亏完加倍想捞回来，这台正期望机器照样把账户做没。胜率那一栏也得来自日志而不是记忆：复盘页把每笔模拟成交都记着，去那里取数，别用印象填公式。",
        },
        { type: "h2", text: "胜率是结果，不是设置项" },
        {
          type: "p",
          text: "你没法选择自己赢 40% 的次数。你能选的是止损放在哪里，而那决定了比值里「风险」那一项。为了做出 3:1 而把止损压得很紧，会同步提高被打掉的概率——比值和胜率不是两个独立旋钮。只报比值、不报对应胜率的人，只报了半个系统。",
        },
        { type: "h2", text: "仓位：比值变成钱的地方" },
        {
          type: "p",
          text: "账户 10 万，单笔风险 1% = 1000。入场 50、止损 46，每股风险 4。仓位 = 1000 ÷ 4 = 250 股，市值 12500，占账户 12.5%。注意占账户 1% 的是风险，不是仓位。把这两件事混为一谈，就是「小仓位」变成大亏的路径。这笔算术丢给 /tools/position，别口算。",
        },
        { type: "h2", text: "连亏是常态，不是意外" },
        {
          type: "p",
          text: "以 40% 胜率、100 笔交易为例。连亏不是意外，而是分布的必然部分：单纯计算「从某处开始连续 6 笔全亏」的概率约 0.6⁶ ≈ 4.7%，而 100 笔里有近百个起始位置，所以出现一次并不稀奇。",
        },
        {
          type: "p",
          text: "更直观的估算：最长连亏的期望长度约为 ln(交易笔数) ÷ ln(1 ÷ 败率)。100 笔、败率 60% 时，ln100 ÷ ln1.667 ≈ 9。也就是说不止一次 9 连亏，是这套系统的正常表现。",
        },
        {
          type: "p",
          text: "这个数字决定仓位：单笔风险 1%，9 连亏约回撤 9%；单笔风险 10%，9 连亏约回撤 61%，需要翻 2.5 倍才回本。同样的胜率与盈亏比，仓位不同，结局是「继续执行」和「被迫离场」的区别。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "价格靠近止损时把止损往下挪：计划内的风险变成了无底线风险。",
            "盈利单提前跑、亏损单一直扛：胜率不变，R 却被压到 1 以下。",
            "亏了以后加仓想赚回来：把连亏的成本放大，而不是熬过去。",
          ],
        },
        {
          type: "note",
          text: "进场前：入场、止损、目标、账户规模填进 /tools/risk-reward，算出的仓位再用 /tools/position 复核。三分钟，让你在考验自己之前，先确认这笔交易在算术上站得住。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is a 2:1 ratio good?",
          a: "Only in combination with a win rate above 33.3% after costs. On its own the ratio says nothing about profitability.",
        },
        {
          q: "Should I aim for a higher ratio?",
          a: "Not by tightening the stop artificially. A higher ratio bought with a lower hit rate is usually a wash, and costs make it worse.",
        },
        {
          q: "How do I know my win rate?",
          a: "From a trade log, not from memory. Memory overweights recent and vivid outcomes; a log with dates is the only honest source.",
        },
        {
          q: "Does position sizing belong here?",
          a: "It is the step that converts expectancy into money. Without it, a positive-expectancy system can still ruin the account.",
        },
      ],
      "zh-CN": [
        {
          q: "2:1 的盈亏比好吗？",
          a: "只有在扣费后胜率高于 33.3% 时才成立。单看比值，说明不了是否赚钱。",
        },
        {
          q: "应该追求更高的盈亏比吗？",
          a: "不要靠人为收紧止损去换。用更低胜率换来的高比值通常是白忙，加上成本会更差。",
        },
        {
          q: "怎么知道自己的胜率？",
          a: "看交易日志，不是靠记忆。记忆会高估近期和印象深的结果；带日期的日志是唯一诚实的来源。",
        },
        {
          q: "仓位管理算这一篇的内容吗？",
          a: "它是把期望值变成钱的那一步。没有它，正期望的系统照样能把账户做没。",
        },
      ],
    },
    links: {
      en: [
        { label: "Risk-reward calculator", href: "/tools/risk-reward" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "When to sell: three doors", href: "/learn/stocks-exit-rules" },
        { label: "Position cost conventions", href: "/learn/position-cost-methods" },
        { label: "Paper and review", href: "/learn/paper-review" },
        { label: "Review page", href: "/review" },
      ],
      "zh-CN": [
        { label: "风险回报计算器", href: "/tools/risk-reward" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "何时卖出：三扇门", href: "/learn/stocks-exit-rules" },
        { label: "持仓成本的三种口径", href: "/learn/position-cost-methods" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "复盘页", href: "/review" },
      ],
    },
    sourceNote: {
      en: "Formulas are exact; the worked examples use hypothetical probabilities and costs. Nothing here is a recommendation to trade.",
      "zh-CN":
        "公式是精确的；算例中的概率与成本均为假设。本文不构成任何交易建议。",
    },
  },
];
