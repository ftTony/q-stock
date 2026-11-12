import type { LearnArticle } from "@/lib/learn/types";

/**
 * Money and desire: the target keeps moving. Money buys four different
 * layers at very different prices, desire inflates faster than income,
 * and in trading, desire is what quietly deletes your stop-loss.
 * Companion to dao-greed-fear-desire (intraday) and money-traps (defense).
 */
export const LEARN_ARTICLE_MONEY_DESIRE: LearnArticle = {
  slug: "money-and-desire",
  category: "mindset",
  ctaHref: "/tools/compound",
  author: "钱力股研究组",
  publishedAt: "2026-11-12",
  updatedAt: "2026-11-12",
  title: {
    en: "Money and desire: why the target keeps moving",
    "zh-CN": "金钱与欲望",
  },
  summary: {
    en: "Money is a tool with a fixed list of jobs; desire is the only counterparty that renegotiates after every deal. This essay maps what money can actually buy, why the target keeps moving, and how desire quietly rewrites your trading rules.",
    "zh-CN":
      "钱是工具，能干的活其实就那几样；欲望是对手方，每笔交易成交之后都会重新开价。这篇讲清楚钱真正买得到什么、为什么目标总在移动、以及欲望怎么悄悄改写你的交易规则。",
  },
  paragraphs: {
    en: [
      "Most people never write down what they want money for. The answer keeps upgrading itself as income rises, which is why someone earning three times what they earned five years ago still says the same sentence: I just need a bit more. The problem was never the number. The number is a moving target because the counterparty—desire—renegotiates every time you pay it.",
    ],
    "zh-CN": [
      "很少有人认真回答过一个问题：我要钱来干什么。收入涨了三倍，答案还是那句「再有一点就够了」。问题从来不在数字上——数字是移动的，因为你的交易对手是欲望，而它在每次成交之后都会重新开价。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Start by separating what money actually buys. It is not one thing—it is four layers, and the price efficiency collapses as you climb.",
      },
      {
        type: "table",
        head: ["Layer", "What it buys", "Price efficiency", "Failure mode"],
        rows: [
          ["Survival", "Food, rent, transport, a bed", "Extremely high—cheap money solves real problems", "Never reaching it keeps you poor"],
          ["Safety", "Insurance, cash buffer, no debt", "High—buys the right to sleep well", "Skipped by people who jump straight to investing"],
          ["Freedom", "The right to say no to a bad job or a bad deal", "Moderate—needs a number, roughly 25x annual spend", "People confuse it with layer four"],
          ["Status", "Logos, upgrades, being seen", "Collapses fast—others' baselines rise too", "The layer that eats all the surplus"],
        ],
        caption: "Same banknote, four jobs. Money spent on layers one and two buys the most life per yuan; money spent on layer four buys the least, because the target is other people's attention.",
      },
      {
        type: "p",
        text: "The practical takeaway: money is genuinely powerful below layer three and structurally weak above it. A 2,000 cushion that keeps an emergency from becoming debt is doing more work per yuan than a 20,000 watch. That is not a moral judgment about watches—it is arithmetic about what each yuan purchases.",
      },
      { type: "h2", text: "Desire is not satisfied—it is upgraded" },
      {
        type: "p",
        text: "Psychology calls it the hedonic treadmill: a raise, a new car, a better apartment each produce a spike of satisfaction, then the baseline resets and the spike becomes the new normal. The mechanism is not weakness. It is prediction: your brain prices the future by the present, so yesterday's luxury becomes today's requirement. This is why lottery winners report the same life satisfaction a year later, and why the sentence \"I'd be content if I just earned X\" has been wrong at every X you have hit so far.",
      },
      {
        type: "p",
        text: "Run the lifestyle-inflation numbers. Year one: income 10,000, spend 6,000, save 4,000. Year five: income 15,000—and spending has drifted up to 11,000, one subscription, one upgrade, one bigger flat at a time. The raise was 50%; the saving barely moved. Meanwhile the invested surplus compounds in the opposite direction: 4,000 a year at 8% is about 58,000 after ten years, and 11,000 a year is about 160,000. The gap between those two lives is not talent or luck. It is whether the baseline was allowed to eat the raise.",
      },
      {
        type: "note",
        text: "The rule that survives contact with reality: when income jumps, fix the saving rate first and let spending adjust last. Raises are the only moment when raising your savings costs you nothing you ever had.",
      },
      { type: "h2", text: "Convert desire back into money before buying it" },
      {
        type: "p",
        text: "Desire quotes prices in feelings—\"it's just 12 installments\", \"I deserve this\". Convert it back into money and most purchases reprice themselves. A 12,000 item looks very different in three currencies: 12,000 cash today; about 13,050 if the 12-installment fee is annualized honestly; and 55,900 if that same 12,000 compounded at 8% for twenty years. None of these is wrong to spend. The point is that the price depends on which clock you measure with, and desire always quotes you the shortest clock.",
      },
      {
        type: "table",
        head: ["The same 12,000, measured by", "Real price", "What you are actually paying"],
        rows: [
          ["Cash today", "12,000", "Its face value"],
          ["12 installments, 0.6%/mo fee", "About 13,050 annualized", "About 13% real interest for liquidity"],
          ["Opportunity cost at 8% for 20 years", "About 55,900", "A future version of the money"],
        ],
        caption: "Desire quotes the first row and hides the other two. Any purchase above impulse size deserves all three readings—assume figures are illustrative.",
      },
      {
        type: "p",
        text: "Two cheap tools keep this honest. The 72-hour rule: park anything above a set threshold on a written list for three days; most entries quietly expire, and the few that survive are wants worth funding. And the conversion habit: before buying, divide the price by your monthly investable surplus and say the number out loud. \"This watch is four months of my future\" is a different sentence than \"it's on sale\".",
      },
      { type: "h2", text: "Positional goods: you always compare upward, and the bar moves" },
      {
        type: "p",
        text: "Layer four has a brutal property: it is positional. Its value depends entirely on having more than the people around you, which makes it a game with no finish line—someone always has more, and social media quietly replaces your actual neighbors with the top 0.1% of the planet as your reference group. A 2023 study pointing at this: people shown richer profiles report lower satisfaction with identical lives. Your income did not change; your comparison did. This is also why \"X% of households earn more than you\" is a useless statistic for happiness—your brain does not average, it anchors on the person just above you.",
      },
      {
        type: "p",
        text: "The only comparison that compounds instead of burns: you, last year. Same calculator, same rules, same person with one more year of data. Every other benchmark is a race where the finish line is drawn by someone else and redrawn nightly.",
      },
      { type: "h2", text: "Where desire goes in trading: it deletes your rules" },
      {
        type: "p",
        text: "The intraday version of this—greed and fear at the screen—is covered in the Dao essay. Here is the account-level version. Desire for a faster outcome shows up in three specific behaviors: leverage that turns a bad week into a reset; chasing whatever just moved, because standing still feels like losing; and, most expensive of all, quietly deleting the invalidation level when the trade goes against you. Notice the pattern: none of these is a new analysis. They are all the original plan being renegotiated by desire mid-trade.",
      },
      {
        type: "p",
        text: "The countermeasure is not willpower. It is making the desireless version of you write the rules while the desiring version of you is not in the room. Write the plan into the plan tab on the symbol page—entry range, size, invalidation—before there is a position to defend. Set the alert at the invalidation price in /alerts, so the exit is a notification rather than a negotiation. And when a hot idea itches hard enough to break these rules, route the itch into /portfolio: let the desire trade in the simulator where it cannot cost anything but pride. Over a few months, most people find their simulated fever trades underperform their boring planned ones—evidence worth more than any lecture.",
      },
      {
        type: "p",
        text: "One more translation worth doing: turn \"I want to be rich\" into a number with a date, then run it backwards in /tools/compound. \"A million in 15 years\" needs roughly 2,700 a month at 8%. Suddenly the conversation shifts from fantasy to a monthly gap you can actually work on—raise income, hold the baseline, extend the timeline. Desire becomes a plan the moment it accepts arithmetic.",
      },
      { type: "h2", text: "\"Enough\" is a line, not a number" },
      {
        type: "p",
        text: "Layer three—freedom—has a computable boundary: the classic 4% rule says capital of about 25 times your annual spending can, in favorable conditions, sustain withdrawals long-term. Notice the variable that matters is not the capital. It is the spending. Cutting annual spend from 120,000 to 90,000 shrinks the freedom number from 3 million to 2.25 million—750,000 of freedom bought by editing desire rather than earning. Money you never spend is the cheapest money you will ever have. That is why \"enough\" cannot be defined by income figures: it is the point where your chosen baseline meets your capital, and you control one of the two variables directly.",
      },
      {
        type: "ul",
        items: [
          "Know which layer a purchase belongs to—survival, safety, freedom, or status—before you pay; the layers have wildly different prices.",
          "When income jumps, raise the saving rate first and let spending adjust last; the baseline eats raises by default.",
          "Run anything above impulse size through the three clocks: cash, honest installments, opportunity cost.",
          "Compare only with yourself last year; social feeds are reference groups selected against you.",
          "Write plans before positions, alerts at invalidation, and let fever trades run in /portfolio where they are free.",
        ],
      },
      {
        type: "p",
        text: "The end state is not wanting nothing. Desire is fuel—it pays for ambition, side projects, the version of life worth funding. The work is putting a meter on it: desire pays retail, compounds wholesale. Money handed to desire today is retail; money invested today funds every future desire at a discount. You are not choosing between enjoying money and growing it. You are choosing who sets the price.",
      },
      {
        type: "note",
        text: "Educational essay. All figures (installment rates, compounding examples, the 25x/4% heuristic) are illustrative assumptions, not recommendations; the 4% rule is a research heuristic with known limits, not a guarantee. Not investment advice.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "先把钱真正买得到的东西拆开。它不是一样东西，是四层，而且越往上，性价比塌得越快。",
      },
      {
        type: "table",
        head: ["层级", "买什么", "性价比", "典型失败方式"],
        rows: [
          ["生存层", "吃饭、房租、通勤、一张床", "极高——便宜的钱解决真问题", "够不到这层，一切免谈"],
          ["安全层", "保险、现金缓冲、无高息负债", "高——买的是睡得着觉的权利", "被急着投资的人跳过"],
          ["自由层", "对烂工作和烂交易说「不」的权利", "中等——需要数字，约 25 倍年支出", "总被误当成第四层"],
          ["地位层", "logo、升级、被看见", "迅速塌陷——别人的基线也在涨", "吃掉全部结余的那层"],
        ],
        caption: "同一张钞票，四种工作。花在前两层的钱每一元买到的「生活」最多；花在地位层的最少——因为它买的是别人的注意力。",
      },
      {
        type: "p",
        text: "结论先给：钱在第三层以下真正强大，在第四层结构性无力。一笔 2000 块的应急缓冲，防止意外变成负债，它每块钱干的活比 20000 的表多。这不是对表的道德审判，是对每块钱购买力的算术。",
      },
      { type: "h2", text: "欲望不是被满足的，是被升级的" },
      {
        type: "p",
        text: "心理学管这个叫享乐适应：加薪、新车、换大房子，每一次都带来一针满足感，然后基线重置，这一针变成了新的正常水位。机制不是你意志薄弱，是预测本能——大脑用现在给未来定价，所以昨天的奢侈品成了今天的必需品。这就是为什么彩票中奖者一年后的生活满意度几乎回到原点，也是为什么「等我赚到 X 就满足了」这句话在你到过的每个 X 上都错了。",
      },
      {
        type: "p",
        text: "算一笔生活膨胀的账。第一年：收入 10000，支出 6000，结余 4000。第五年：收入涨到 15000——支出悄悄爬到了 11000，一次订阅、一次升级、一间大一点的房子，每次都只多一点点。涨幅 50%，结余几乎没动。与此同时，投出去的结余在反方向复利：每年 4000 按年化 8%，十年约 58000；每年 11000，十年约 160000。这两种人生中间的差距，不是天赋也不是运气，是基线有没有被允许吃掉涨幅。",
      },
      {
        type: "note",
        text: "能落地的规则只有一条：收入跳涨时，先固定储蓄率，让支出最后调整。涨薪是唯一一个「提高储蓄不用付出任何你已有的东西」的时刻。",
      },
      { type: "h2", text: "买之前，把欲望换算回钱" },
      {
        type: "p",
        text: "欲望报价用的是感受——「才 12 期」「我值得」。换算回钱，大部分购买会自己重新标价。同一件 12000 的东西有三种货币：今天付 12000 现金；12 期手续费按真实口径年化，约 13050；而这笔钱按年化 8% 放二十年，约 55900。花哪一种都不丢人，关键是价格取决于你用哪个钟表来量——而欲望永远只报最短的那个钟。",
      },
      {
        type: "table",
        head: ["同一件 12000，用哪个口径", "真实价格", "你实际在付什么"],
        rows: [
          ["今天付现金", "12000", "面值"],
          ["12 期、每期 0.6% 手续费", "年化约 13050", "为流动性付约 13% 的真实利率"],
          ["年化 8% 放二十年的机会成本", "约 55900", "一个未来的版本的这笔钱"],
        ],
        caption: "欲望只报第一行，藏起后两行。超过冲动阈值的购买，值得三个口径都读一遍——数字均为假设示例。",
      },
      {
        type: "p",
        text: "两个便宜的工具让它诚实。72 小时规则：超过设定阈值的物件先写进清单放三天，大多数条目会安静过期，活下来的才是值得拨款的真实欲望。换算习惯：下单前把价格除以你每月可投结余，把数字说出来——「这块表是我四个月的未来」，和「它在打折」，是完全不同的两句话。",
      },
      { type: "h2", text: "位置性商品：你永远在和身边最富的人比，而且杆会自己升高" },
      {
        type: "p",
        text: "第四层有个残酷属性：位置性。它的价值完全取决于比周围人拥有得多，这让它成了一场没有终点的游戏——永远有人比你多，而社交媒体悄悄把你的参照系从真邻居换成了这颗星球头部 0.1% 的人。相关研究指向同一个结论：被展示更富有画像的人，对自己完全相同的生活报告更低的满意度。你的收入没变，你的比较对象变了。这也是为什么「全国百分之多少的家庭收入比你高」对幸福感毫无用处——大脑不做平均，它锚定在你正上方那一个人身上。",
      },
      {
        type: "p",
        text: "唯一一个复利而非燃烧的比较对象：去年的自己。同一个计算器，同一套规则，同一个多了一年数据的人。其他所有基准都是别人画终点线、而且每晚重画的比赛。",
      },
      { type: "h2", text: "欲望进了交易账户，会先删掉你的规则" },
      {
        type: "p",
        text: "盘中版本——屏幕前的贪婪与恐惧——已在《贪婪、恐惧与欲望》里写过，这里是账户级的版本。想要更快变富的欲望，在账户里表现为三个具体动作：上杠杆，把糟糕的一周变成重开；追刚刚涨过的东西，因为站着不动像在亏钱；还有最贵的一个——行情逆着走时，悄悄把失效价删掉。注意共同点：这三个都不是新的分析，全是原计划在交易中途被欲望重新谈判。",
      },
      {
        type: "p",
        text: "解药不是意志力，是让「没有欲望的你」在「有欲望的你」不在场时把规则写好。开仓之前，在个股页的计划 Tab 里写好买入区间、仓位、失效价；把失效价设进 /alerts，让离场变成一条通知，而不是一场谈判。等哪个热点痒到想破例，把痒引到 /portfolio 模拟盘去——让欲望在那里跑，输的只是虚荣心。跑几个月你会发现：模拟盘里的 fever trade，长期跑输无聊的计划单。这个证据比任何说教都值钱。",
      },
      {
        type: "p",
        text: "还有一个值得做的翻译：把「我想变有钱」变成带日期的数字，再到 /tools/compound 反推。「十五年到一百万」，年化 8% 大约每月需要 2700。对话立刻从幻想变成一个可以动手的月度缺口——提收入、摁住基线、或者把时间轴放长。欲望一旦接受算术，就成了计划。",
      },
      { type: "h2", text: "「够」不是数字，是一条线" },
      {
        type: "p",
        text: "自由层是可以算出边界的：经典的 4% 法则说，约 25 倍年支出的本金，在有利条件下可以长期支撑提取。注意真正重要的变量不是本金，是支出。把年支出从 12 万压到 9 万，自由数字就从 300 万降到 225 万——75 万的自由，靠修改欲望而不是增加收入买到。永远不花出去的钱，是你能拥有的最便宜的钱。这就是为什么「够」没法用收入来定义：它是你选定的基线和你的本金的交点，而这两个变量里，有一个你直接控制。",
      },
      {
        type: "ul",
        items: [
          "付钱之前先归类：这笔钱在生存、安全、自由还是地位层——各层的价差大得离谱。",
          "收入跳涨时先固定储蓄率，让支出最后调整；基线默认会吃掉涨幅。",
          "超过冲动阈值的购买过三个钟表：现金、诚实口径的分期、机会成本。",
          "只和去年的自己比；社交信息流是专门针对你筛选过的参照系。",
          "计划写在持仓前、提醒设在失效价、fever trade 丢进 /portfolio，那里免费。",
        ],
      },
      {
        type: "p",
        text: "终点不是无欲。欲望是燃料——它供养野心、副业和值得去过的生活。要做的是给它装上计价器：欲望是零售价，复利是批发价。今天交给欲望的钱按零售结算；今天投出去的钱，未来给每一个欲望打折。你选的从来不是享受还是增值，是定价权归谁。",
      },
      {
        type: "note",
        text: "教学随笔。文中数字（分期利率、复利示例、25 倍/4% 启发式）均为假设示例，不构成建议；4% 法则是经验启发式，有已知局限，不保证成立。非投资建议。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Is desire itself the enemy? Should I try to want less?",
        a: "No—desire is fuel. The problem is unpriced desire. Keep the ambitions that survive the 72-hour test and fund them deliberately; only kill the ones that exist to impress a reference group you never chose.",
      },
      {
        q: "Won't this stop mattering once I actually have money?",
        a: "The treadmill scales with income. Studies on lottery winners and high earners find the same moving baseline at every level. The mechanism adapts to whatever number you reach, which is why it must be handled now, at any account size.",
      },
      {
        q: "How do I tell healthy enjoyment from runaway desire?",
        a: "Ask what it buys and for how long. A trip with people you love is layer-three spending with lasting returns; a purchase whose joy depends on being seen is layer four, and it decays fastest. Also: healthy spending doesn't need installment plans to feel affordable.",
      },
      {
        q: "My partner's baseline keeps rising and mine doesn't. Who's right?",
        a: "Neither—it's a negotiation, not a debate. Agree on the saving rate first, give each person an uncontested allowance, and price shared goals in /tools/compound. Fights about money are usually fights about whose baseline wins; writing numbers down turns them into arithmetic.",
      },
    ],
    "zh-CN": [
      {
        q: "欲望本身是不是敌人，要不要尽量少想要？",
        a: "不是。欲望是燃料，问题在于没有计价的欲望。让通过了 72 小时测试的野心保留下来、认真拨款；只砍掉那些为了给一个你从未选定的参照群看的欲望。",
      },
      {
        q: "等我真有钱了，这些是不是就不成问题了？",
        a: "跑步机会随收入放大。对中奖者和高收入者的研究都发现，每个收入水平上都存在同样的移动基线。机制会适应你到达的任何数字，所以这件事只能在现在的账户规模上处理。",
      },
      {
        q: "怎么区分正常享受和欲望失控？",
        a: "问它买什么、能买多久。和喜欢的人的旅行是自由层消费，回报留存很久；快乐取决于「被看见」的购买是地位层，衰减最快。另一个信号：健康的消费不需要分期才付得起。",
      },
      {
        q: "伴侣的消费基线一直涨，我的不涨，谁对？",
        a: "都对——这是谈判不是辩论。先谈定储蓄率，给每人一笔不被审查的零花额度，共同目标放进 /tools/compound 里算数。关于钱的争吵多半是「谁的基线赢」，写下来就变成了算术。",
      },
    ],
  },
  links: {
    en: [
      { label: "Compound calculator", href: "/tools/compound" },
      { label: "Greed, fear, desire (intraday)", href: "/learn/dao-greed-fear-desire" },
      { label: "Traps to dodge first", href: "/learn/money-traps-small-capital" },
      { label: "Compounding is hard behavior", href: "/learn/mindset-compounding-hard" },
      { label: "What financial freedom means", href: "/learn/financial-freedom-defined" },
      { label: "Paper trading and review", href: "/learn/paper-review" },
    ],
    "zh-CN": [
      { label: "复利计算器", href: "/tools/compound" },
      { label: "贪婪、恐惧与欲望（盘中）", href: "/learn/dao-greed-fear-desire" },
      { label: "本金少，先避开这些坑", href: "/learn/money-traps-small-capital" },
      { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
      { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
      { label: "模拟交易与复盘", href: "/learn/paper-review" },
    ],
  },
  sourceNote: {
    en: "Educational essay. Figures are illustrative assumptions; the 25x/4% heuristic has known limits and varies by market conditions. Not investment advice.",
    "zh-CN": "教学随笔。文中数字均为假设示例；25 倍/4% 启发式有已知局限，随市场环境变化。不构成投资建议。",
  },
};
