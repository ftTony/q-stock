import type { LearnArticle } from "@/lib/learn/types";

/**
 * Skill or luck: a layer-by-layer attribution essay. The honest answer is
 * "it depends on which layer of wealth you are talking about", and the useful
 * skill is knowing how to subtract beta before calling yourself talented.
 */
export const LEARN_ARTICLE_SKILL_OR_LUCK: LearnArticle = {
  slug: "wealth-skill-or-luck",
  category: "mindset",
  ctaHref: "/review",
  author: "钱力股研究组",
  publishedAt: "2026-11-13",
  updatedAt: "2026-11-13",
  title: {
    en: "Is wealth skill or luck? A layer-by-layer audit",
    "zh-CN": "财富积累是能力还是运气？",
  },
  summary: {
    en: "The question is malformed until you name the layer. Survival is mostly structure, the first 100k is mostly behavior, compounding is mostly not interrupting, and the far tail is mostly luck. Here is how to tell which one you are looking at—with arithmetic.",
    "zh-CN":
      "不问「哪一层」，这个问题没有答案。生存底线几乎全是结构，第一个十万几乎全是行为，复利几乎全是「不打断」，而最尾部的那一小撮财富，运气权重最大。这篇给出可操作的归因方法，用算术而不是感觉来判断。",
  },
  paragraphs: {
    en: [
      "Every January someone shows you a portfolio that beat the index and asks: was that skill? The honest answer is that one year cannot tell you, and neither can one person. But the question is not unanswerable—it just needs to be split. Skill and luck do not mix evenly across the whole journey; they take turns being in charge.",
    ],
    "zh-CN": [
      "每年都有人拿着过去一年的账户曲线问：这是能力还是运气？诚实的回答是，一个样本、一个年度，什么都证明不了。但这个问题并非无解——只需要拆开。能力和运气不是均匀搅拌在一起的，它们在财富的不同阶段轮流掌权。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Split the journey into four layers first. Each layer has a different mix, and arguments about \"skill vs luck\" usually fail because two people are describing different layers.",
      },
      {
        type: "table",
        head: ["Layer", "Typical size", "Main driver", "Luck weight", "What you can do"],
        rows: [
          ["Survival floor", "Birth to first income", "Country, family, health, era", "Very high", "Almost nothing—but you can avoid gambling it away"],
          ["First surplus", "0 to ~100k", "Saving rate, income growth, debt", "Low", "Mostly controllable"],
          ["Compounding", "100k to a few million", "Not interrupting, costs, allocation", "Medium", "Discipline and process"],
          ["Far tail", "Top 0.01%", "Concentration, timing, leverage, luck", "Very high", "Survive long enough to be sampled"],
        ],
        caption: "Same word, four different games. Arguing about skill without naming the layer is how the debate goes in circles.",
      },
      {
        type: "p",
        text: "Read the table honestly and two things follow. First, the bottom layer is almost pure structure—being born in a growing economy with a functioning school system is worth more than any stock pick you will ever make, and you did not earn it. Second, the top layer is dominated by luck, which is exactly why the people at the top are the worst source of advice: their sample size is one, and it was selected after the fact.",
      },
      { type: "h2", text: "Result = skill + luck + noise" },
      {
        type: "p",
        text: "Every outcome contains three ingredients. Skill is the part that repeats if you run it again. Luck is the part that came from the world and will not repeat on demand. Noise is the part that is neither—a random draw that makes this year's number different from your true average. A single good year is mostly luck and noise; a decade of slightly-above-average years starts to look like skill, because noise averages out and the same edge keeps showing up.",
      },
      {
        type: "p",
        text: "How many observations before the noise clears? Take a trader with a true 55% win rate on 1:1 bets, against a coin-flip 50%. To separate that five-point edge from randomness at 95% confidence takes roughly 400 trades—the standard error of a proportion is about 2.5% at n=400, and 5% is exactly two of those. Twenty trades, win or lose, prove nothing. This is also why \"I've been right three times in a row\" is not evidence of anything except that three coin flips came up heads.",
      },
      { type: "h2", text: "Subtract beta before calling it talent" },
      {
        type: "p",
        text: "Suppose you started the year with 1,000,000, the index returned 15%, your account returned 25%, and you feel brilliant. Now check your risk exposure. If your portfolio's beta to that index was 1.4, the market alone would have delivered about 21%—you earned 40,000 of genuine selection on top, not 100,000. The remaining 60,000 was the market paying you for taking more risk, which is not skill, it is rent. If you were also concentrated in small caps during a small-cap year, most of the rest is style exposure. In a year when crypto or AI names ran, the same account would look like genius while doing nothing different.",
      },
      {
        type: "table",
        head: ["Line item", "Return", "On 1,000,000", "What it means"],
        rows: [
          ["Index benchmark", "+15%", "+150,000", "What a passive dollar earned"],
          ["Beta-adjusted expectation (1.4x)", "+21%", "+210,000", "What your risk level deserved"],
          ["Your actual result", "+25%", "+250,000", "Beta plus selection"],
          ["Selection (alpha)", "+4%", "+40,000", "The only part that might be skill"],
        ],
        caption: "Beta is the rent the market pays for risk; alpha is the part that has to repeat. Figures illustrative, ignoring fees and taxes.",
      },
      {
        type: "note",
        text: "Attribution needs three things before it means anything: a benchmark you did not choose after the fact, a risk adjustment, and a window long enough to include at least one drawdown. Any one missing, the number flatters you.",
      },
      { type: "h2", text: "Survivorship bias: the success stories you see were filtered" },
      {
        type: "p",
        text: "Imagine 1,000 funds flipping coins. After five years, about 31 will have beaten the coin five times in a row (0.5 to the fifth is 3.1%); after ten years, about one will have done it ten times. Now put that survivor on a magazine cover and call it a decade of outperformance. The same arithmetic applies to entrepreneurs, traders, and every \"self-made\" biography you have ever read: the ones who took the same risks and lost are not publishing books. Studies of fund survivorship (SPIVA and similar) keep finding that most active funds trail their benchmark over ten years—and the funds that disappeared are not in the average, which makes the industry look better than it is.",
      },
      {
        type: "p",
        text: "This does not mean every rich person is lucky. It means the sample you are looking at is not random. A useful habit: when you read a success story, ask what the failure rate of that exact strategy was, and how many people who did the same thing are now silent. If nobody can answer, you are reading a highlight reel, not data.",
      },
      { type: "h2", text: "What skill actually does: raise the odds, cap the damage" },
      {
        type: "p",
        text: "Skill does not predict luck. It does two narrower, more useful jobs. First, it increases how often you are exposed to positive-expectation situations—saving every month, owning assets that produce cash flow, staying in a growing industry, meeting more people who can hire you. Second, it caps what a bad draw can do: position sizing, an emergency buffer, insurance, no high-interest debt, no leverage that can force a sale at the bottom. The first job is offense, the second is survival, and at small capital the second matters more.",
      },
      {
        type: "p",
        text: "There is a third, quieter skill: not interrupting. Long-run compounding is destroyed less by low returns than by withdrawals, panic sales, and switching strategies every eighteen months. A portfolio that earns 6% for thirty years beats one that earns 10% for eight years and then gets liquidated for a house, a business, or a margin call. \"Staying in\" is not a passive trait—it requires a cash-flow plan, a temperament, and a position size you can live through a 40% drawdown with.",
      },
      {
        type: "table",
        head: ["Question", "Skill signal", "Luck signal"],
        rows: [
          ["Does the feedback arrive quickly and repeatedly?", "Yes—hundreds of cycles", "No—one or two shots"],
          ["Are the rules stable across attempts?", "Yes, same market, same rules", "Rules changed mid-game"],
          ["Is the sample large enough to separate edge from noise?", "Hundreds of trades, multiple cycles", "A handful of outcomes"],
          ["Would a random participant also have won?", "No—most peers underperformed", "Yes—the whole sector ran"],
        ],
        caption: "Four questions. Three or more 'luck' answers means you are describing a draw, not a skill—and should size the next bet accordingly.",
      },
      { type: "h2", text: "Run the audit on yourself once a quarter" },
      {
        type: "p",
        text: "Doing this well is mostly bookkeeping, not introspection. Write down the reason for every position before you enter it, including the benchmark you expect to beat and the level at which you are wrong. Then, once a quarter, compare: what did the benchmark do, what did your risk level deserve, and what is left over? In Q-Stock the pieces are already in place—the review page keeps the record, the paper portfolio lets an idea run without real money so you can see whether your \"edge\" survives contact with a full quarter, and the compound tool turns \"I'm good at this\" into a required monthly return you can check against reality.",
      },
      {
        type: "p",
        text: "One warning about attribution: do not do it monthly. At a one-month window, noise dominates everything, and you will conclude you are a genius in March and a fraud in April. A year is the minimum, and the year must include at least one period where you wanted to quit. That is when the skill, if there is any, shows up—not in the return, in whether the process held.",
      },
      {
        type: "ul",
        items: [
          "Name the layer before arguing: survival, first surplus, compounding, or tail.",
          "Subtract beta and style exposure before calling the remainder skill.",
          "Require a benchmark, a risk adjustment, and a window with a drawdown in it.",
          "Judge process on hundreds of decisions, not on the last three outcomes.",
          "Treat \"I was right\" as a hypothesis to test next quarter, not a conclusion.",
        ],
      },
      {
        type: "p",
        text: "So: skill or luck? Both, in a specific order. Luck decides which table you sit at and which cards you are dealt; skill decides how much you bring to the table, how you size the bet, and whether you are still there when a good hand arrives. Over one year, the cards dominate. Over thirty, the person who kept showing up with a survivable bet and a written plan has usually collected more good hands than the person who went all-in on the first one. That is not a comforting story—it is just what the arithmetic of repeated exposure does.",
      },
      {
        type: "note",
        text: "Educational essay. All figures are illustrative assumptions (returns, beta, win rates, survivorship math), not forecasts or advice. Past performance does not indicate future results; nothing here recommends any security.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "先把整段路拆成四层。每一层的配方不一样，关于「能力还是运气」的争论之所以经常原地打转，是因为两个人在说不同的层。",
      },
      {
        type: "table",
        head: ["层级", "典型规模", "主要驱动", "运气权重", "你能做什么"],
        rows: [
          ["生存底线", "出生到第一份收入", "国家、家庭、健康、时代", "极高", "几乎无能为力——但可以避免把它赌掉"],
          ["第一笔结余", "0 到约 10 万", "储蓄率、收入增长、负债", "低", "大部分可控"],
          ["复利阶段", "10 万到几百万", "不打断、成本、配置", "中", "纪律与流程"],
          ["最尾部", "前 0.01%", "集中、时机、杠杆、运气", "极高", "活得够久，被运气采样到"],
        ],
        caption: "同一个词，四种游戏。不先说清在哪一层，争论就永远绕圈。",
      },
      {
        type: "p",
        text: "照实读这张表，会得到两个结论。第一，最底层几乎是纯结构——出生在一个增长的经济体、有一套能运转的学校系统，这件事比你此生任何一次选股都值钱，而它不是你挣来的。第二，最顶层由运气主导，这恰恰解释了为什么顶层的人是最差的建议来源：他们的样本量是一，而且是事后筛出来的。",
      },
      { type: "h2", text: "结果 = 能力 + 运气 + 噪声" },
      {
        type: "p",
        text: "任何一次结果都含三种成分。能力是「再来一次还会重复」的部分；运气是「世界给的、不会按需重播」的部分；噪声是两者之外那个让今年数字偏离真实均值的随机抖动。单独一个好年份，主要是运气和噪声；连续十年略高于平均，才开始像能力——因为噪声被平均掉了，而同一个优势一直在出现。",
      },
      {
        type: "p",
        text: "要多少样本，噪声才会散开？假设一个交易者真实胜率 55%，盈亏比 1:1，对手是掷硬币的 50%。要把这 5 个百分点的优势以 95% 置信度从随机里分出来，大约需要 400 笔——n=400 时比例的标准误约 2.5%，5% 正好是两个标准误。二十笔，无论输赢，什么都证明不了。这也是为什么「我连对三次」不是证据，只能说明三次硬币都是正面。",
      },
      { type: "h2", text: "先把 beta 扣掉，再谈本事" },
      {
        type: "p",
        text: "假设年初 100 万，指数涨 15%，你的账户涨 25%，你觉得自己很行。先看风险暴露：如果组合对指数的 beta 是 1.4，市场单独就该给你约 21%——你真正多赚的是 4 万的选择收益，不是 10 万。剩下 6 万是市场为多承担的风险付的租金，不是本事。如果那年小盘股整体跑赢、而你恰好重仓小盘，那连这 4 万里也有一部分是风格暴露。碰上加密或 AI 大年，同一个账户看起来会像天才，其实什么都没多做。",
      },
      {
        type: "table",
        head: ["拆项", "收益率", "按 100 万计", "含义"],
        rows: [
          ["指数基准", "+15%", "+15 万", "一个被动美元赚到的"],
          ["按 1.4 倍 beta 应得", "+21%", "+21 万", "你的风险水平应得的"],
          ["你的实际结果", "+25%", "+25 万", "beta 加选择"],
          ["选择收益（alpha）", "+4%", "+4 万", "唯一可能算能力的部分"],
        ],
        caption: "beta 是市场为风险付的租金，alpha 是必须能重复的那部分。数字为示意，未计费用与税费。",
      },
      {
        type: "note",
        text: "归因要成立，需要三样东西：一个不是事后挑的基准、一次风险调整、一个至少包含一轮回撤的窗口。缺任何一样，数字都会偏向好看。",
      },
      { type: "h2", text: "幸存者偏差：你看到的成功，是被筛过一遍的" },
      {
        type: "p",
        text: "想象 1000 只基金在掷硬币。五年后大约 31 只会连赢五次（0.5 的五次方是 3.1%）；十年后大约剩 1 只连赢十次。把这只幸存者放上杂志封面，标题叫「十年持续跑赢」。同一套算术适用于创业者、交易者和每一本「白手起家」传记：承担同样风险然后输掉的人，不出书。关于基金存续的研究（SPIVA 一类）反复发现，大多数主动基金十年跑输基准——而消失的基金不在平均值里，这让整个行业显得比实际好看。",
      },
      {
        type: "p",
        text: "这不是说每个有钱人都靠运气。它说的是：你看到的样本不是随机的。一个有用的习惯——读到成功故事时，先问这个策略当时的失败率是多少、做过同样事情而现在沉默的人有多少。如果没人答得上来，你读的是集锦，不是数据。",
      },
      { type: "h2", text: "能力真正干的活：抬高赔率，封住伤害" },
      {
        type: "p",
        text: "能力不预测运气，它干两件更窄也更实用的事。一是提高你暴露在正期望情境里的频率——每月存钱、持有能产生现金流的资产、留在增长的行业里、多认识能雇你的人。二是封住一次坏手能造成的破坏：仓位上限、应急缓冲、保险、不碰高息负债、不上那种会在底部强制卖出你的杠杆。前者是进攻，后者是生存，本金小的时候，后者更重要。",
      },
      {
        type: "p",
        text: "还有第三种更安静的能力：不打断。长期复利被杀掉，多数不是因为收益率低，而是因为取钱、恐慌卖出、每十八个月换一套策略。三十年 6% 的组合，跑赢「八年 10% 然后为了买房、创业或补保证金被清仓」的组合。留在场内不是一种性格，它需要现金流计划、能扛住 40% 回撤的仓位，以及一个不需要每天证明自己的心态。",
      },
      {
        type: "table",
        head: ["提问", "像能力的信号", "像运气的信号"],
        rows: [
          ["反馈来得快且能重复吗？", "是——几百个周期", "否——只有一两次机会"],
          ["规则在各次尝试中稳定吗？", "是，同一市场同一规则", "中途改规则"],
          ["样本够大到能分开优势和噪声吗？", "数百笔、多轮周期", "只有几个结果"],
          ["一个随机参与者也会赢吗？", "不会——多数同行跑输", "会——整个板块都在涨"],
        ],
        caption: "四个问题。三个以上落在「运气」列，你描述的就是一次抽样，不是一项能力——下一注就该按这个结论来定大小。",
      },
      { type: "h2", text: "每季度给自己做一次归因" },
      {
        type: "p",
        text: "做这件事靠记账，不靠自省。开仓之前写下理由，包括你打算跑赢的基准、以及价格到哪里算你错了。然后每季度对照一次：基准走了多少、你的风险水平应得多少、剩下的才是你的。钱力股里零件是齐的——复盘页留着记录，模拟盘让一个想法在不花真钱的情况下跑完整个季度，看看你的「优势」能不能活过三个月；复利工具则把「我很行」翻译成一个必须达到的月收益率，拿去和现实对账。",
      },
      {
        type: "p",
        text: "一个提醒：别按月做归因。一个月窗口里噪声压倒一切，你会在三月认定自己是天才、四月认定自己是骗子。一年是下限，而且这一年里必须至少有一段你想放弃的时期。能力如果存在，就是在那时候显形的——不在收益率里，在流程有没有守住。",
      },
      {
        type: "ul",
        items: [
          "争论之前先报层级：生存、第一笔结余、复利，还是尾部。",
          "先扣掉 beta 和风格暴露，剩下的才可能算能力。",
          "归因三件套：基准、风险调整、含回撤的窗口，缺一不可。",
          "用几百次决策判断流程，别用最近三个结果判断自己。",
          "把「我判断对了」当成下季度待验证的假设，不是结论。",
        ],
      },
      {
        type: "p",
        text: "所以是能力还是运气？都是，但有先后。运气决定你坐在哪张桌子、摸到什么牌；能力决定你带多少钱上桌、下注多大、以及好牌来的时候你还在不在。一年尺度上，牌面主导。三十年尺度上，那个每次都带着能活下来的注和一张写好的计划出现的人，通常比第一次就 all-in 的人收集到更多好牌。这不算安慰——这只是重复暴露的算术。",
      },
      {
        type: "note",
        text: "教学随笔。文中收益率、beta、胜率与幸存者计算均为假设示例，不是预测或建议。历史业绩不代表未来表现；本文不推荐任何标的。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Doesn't admitting luck just encourage people to give up?",
        a: "The opposite. Believing outcomes are pure skill makes you double down after a lucky win and blame yourself after a random loss. Knowing which part was luck lets you keep the process and shrink the bet—it is a risk-management stance, not resignation.",
      },
      {
        q: "But plenty of self-made people clearly worked harder than everyone around them.",
        a: "Hard work raises exposure—more attempts, more skills, more people who will bet on you. That is real and it compounds. It still does not control timing or which sector happened to be expanding when they started, which is why two equally capable people can end up 100x apart.",
      },
      {
        q: "How do I know whether my returns are skill or just a bull market?",
        a: "Compare against a benchmark you picked in advance, adjust for your beta and style exposure, and use a window that includes a drawdown. If the leftover alpha is small and unstable, assume beta. If it persists across several cycles and different markets, you may have something—keep measuring.",
      },
      {
        q: "If luck matters that much, is there any point in trying?",
        a: "Yes, because the two things skill controls are the ones that decide whether luck can reach you: number of positive-expectation attempts, and survival through bad draws. You cannot schedule a windfall, but you can be solvent, invested, and still in the game when one arrives.",
      },
    ],
    "zh-CN": [
      {
        q: "承认运气，是不是等于劝人躺平？",
        a: "正相反。相信结果纯靠能力的人，会在一次幸运盈利之后加倍下注，在一次随机亏损之后自我否定。分清哪部分是运气，才能保住流程、缩小赌注——这是风险管理姿势，不是认命。",
      },
      {
        q: "可很多白手起家的人，明明比周围人努力得多。",
        a: "努力抬高的是暴露次数——更多尝试、更多技能、更多愿意在你身上押注的人。这部分真实且会复利。但它控制不了时机，也控制不了你起步时哪个行业恰好在扩张，所以两个能力相当的人，结果可以差 100 倍。",
      },
      {
        q: "怎么判断我的收益是能力还是牛市？",
        a: "和一个事先选定的基准比，对 beta 和风格暴露做调整，窗口里必须包含一次回撤。剩下的 alpha 又小又不稳定，就按 beta 处理；如果它能跨几轮周期、跨不同市场持续存在，那可能真有点东西——继续量。",
      },
      {
        q: "运气这么重要，那努力还有意义吗？",
        a: "有。能力控制的两件事，恰好决定运气能不能找到你：正期望尝试的次数，以及坏手来临时你还活不活得到下一轮。你没法预约横财，但可以做到不破产、在场内、运气来的时候还没出局。",
      },
    ],
  },
  links: {
    en: [
      { label: "Review page", href: "/review" },
      { label: "Compounding is hard behavior", href: "/learn/mindset-compounding-hard" },
      { label: "Wealth as a process", href: "/learn/wealth-building-process" },
      { label: "100k→1M vs 1M→10M", href: "/learn/wealth-stages-100k-10m" },
      { label: "Money and desire", href: "/learn/money-and-desire" },
      { label: "Paper trading and review", href: "/learn/paper-review" },
    ],
    "zh-CN": [
      { label: "复盘页", href: "/review" },
      { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
      { label: "财富累积的过程", href: "/learn/wealth-building-process" },
      { label: "10 万与 1000 万：两个阶段", href: "/learn/wealth-stages-100k-10m" },
      { label: "金钱与欲望", href: "/learn/money-and-desire" },
      { label: "模拟交易与复盘", href: "/learn/paper-review" },
    ],
  },
  sourceNote: {
    en: "Educational essay. Returns, beta, win rates and survivorship math are illustrative assumptions. Not investment advice; past performance is not indicative of future results.",
    "zh-CN": "教学随笔。文中收益率、beta、胜率与幸存者计算均为假设示例。不构成投资建议；历史业绩不代表未来表现。",
  },
};
