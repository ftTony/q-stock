import type { LearnArticle } from "@/lib/learn/types";

/**
 * Traps that hit hardest when capital is small: the same 30% drawdown that is
 * a scratch at 1M is a reset at 100k. Companion piece to wealth-stages-100k-10m.
 */
export const LEARN_ARTICLE_MONEY_TRAPS: LearnArticle = {
  slug: "money-traps-small-capital",
  category: "mindset",
  ctaHref: "/tools/compound",
  author: "钱力股研究组",
  publishedAt: "2026-11-11",
  updatedAt: "2026-11-11",
  title: {
    en: "Small capital, expensive traps: what to dodge before the first 100k",
    "zh-CN": "本金少的时候，最贵的不是亏，是踩坑",
  },
  summary: {
    en: "A 30% drawdown on 1M is a scratch; on 100k it is a reset. When capital is small, avoiding the deep holes pays better than hunting the big wins—and every trap on this page is dodged with arithmetic, not luck.",
    "zh-CN":
      "同样亏 30%，100 万的人掉层皮，10 万的人直接重开。本金少的时候，避开深坑比寻找机会更值钱——而且每个坑都能用算术躲开，不用靠运气。",
  },
  paragraphs: {
    en: [
      "Rich and poor differ less in their returns than in how many mistakes they can absorb. With 10,000 in the account, one deep hole takes years to climb out of; with 1,000,000, the same hole is a bad quarter. That asymmetry is why trap-avoidance beats opportunity-hunting when capital is small.",
    ],
    "zh-CN": [
      "穷人和富人的差别，不在收益表上，在能吸收多少个错误。账户里 10 万的人，一个深坑要爬好几年；1000 万的人掉进同一个坑，只是难看的一个季度。这种不对称，就是本金少时「避坑」排在「找机会」前面的原因。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Why is a hole so expensive? Because losses compound against you. Lose 30% and you need +42.9% to get back to even—30/(1−30%). At an optimistic 8% a year, that is four and a half years of doing nothing but undoing a mistake. The person who never fell is four and a half years ahead, with less effort than you spent recovering.",
      },
      {
        type: "table",
        head: ["Drawdown", "Gain needed to break even", "Years to recover at 8%/yr"],
        rows: [
          ["10%", "11.1%", "About 1.4"],
          ["30%", "42.9%", "About 4.5"],
          ["50%", "100%", "About 9"],
          ["90%", "900%", "About 29"],
        ],
        caption: "The deeper the hole, the steeper the climb. Avoiding the 50%+ holes is the whole game at small size.",
      },
      { type: "h2", text: "Trap one: high-interest debt, the only negative starting line" },
      {
        type: "p",
        text: "Installment plans hide their true cost. A 12,000 phone split into 12 payments at a 0.6% monthly fee (72 a month) sounds like 7.2% a year—until you notice your average outstanding balance is only about 6,000, because you repay 1,000 every month. Real annualized cost: roughly 13%. Minimum credit-card payments run higher. No investment reliably beats a 13% guaranteed loss, so paying off that debt is the best risk-free return available to you. Consumer loans and borrowing-to-invest are worse still: a negative carry where the math loses before you start.",
      },
      {
        type: "note",
        text: "Rule of thumb: if the borrowed rate is above what a diversified portfolio can plausibly earn, debt reduction is your investment portfolio until further notice.",
      },
      { type: "h2", text: "Trap two: the all-in comeback bet" },
      {
        type: "p",
        text: "Run the survival odds. Suppose you find an edge with a genuinely good 60% win rate and 1:1 payoff, and you go all-in every time. The chance of winning two in a row is 36%; three in a row, under 22%; five, 8%. One zero wipes the account, and the rebuild runs on your salary, not on skill. Small capital needs dispersion more than precision—you are betting survival, not optimizing return. This is exactly what /tools/position is for: cap every single trade at a fixed fraction (1–2%) of the account so no single story can end the game.",
      },
      { type: "h2", text: "Trap three: paying for the opportunity to get rich" },
      {
        type: "p",
        text: "Signal groups, insider tips, paid courses, copy-trading software. Apply one question: if the method reliably makes money, why sell it by subscription instead of quietly compounding it? The subscription model itself answers where the profit comes from. Keep a mental red-light list—guaranteed principal, monthly returns, lead-trading, insider info, recruiting friends. Any one of them lights up, walk away.",
      },
      {
        type: "p",
        text: "You do not need to trust anyone's claim, because you can test it. Q-Stock's compound calculator: 5% monthly compounding is 1.8x in a year, 6.2x in three years, 23x in five. Anyone who could genuinely do that for five years would be a legend with no reason to charge you 299 a month. The AI chart read on symbol pages follows the same boundary: it names structure, levels and invalidation—it does not recommend orders.",
      },
      { type: "h2", text: "Trap four: guaranteed high yield and the friends-and-family pool" },
      {
        type: "p",
        text: "Risk-free rates sit around 2%. Anything promising 10%+ with principal guaranteed is either loading invisible risk onto you or paying old depositors with new ones—Ponzi mechanics. The classic entry point is trust: a colleague, an uncle, a friend's group chat. Trust changes who introduces the deal; it does not change the arithmetic. One-line test: who is the counterparty, where does the return physically come from, can you exit this week? If the answers are vague, the yield is the bait.",
      },
      { type: "h2", text: "Trap five: insurance bought wrong, in both directions" },
      {
        type: "p",
        text: "Two mistakes, opposite signs. First direction: buying dividend-return whole-life products as investments—expensive, opaque, and liquidating early costs years of premiums. Second direction: skipping medical and accident cover entirely to keep every yuan invested—one hospital stay can reset a decade of saving. When capital is small, cheap term cover for the catastrophic risks first; invest what is left. Protection is not a return, it is what keeps your returns from being confiscated.",
      },
      { type: "h2", text: "Trap six: screen addiction dressed up as diligence" },
      {
        type: "p",
        text: "Frequent trading has a meter running. Assume 0.15% round-trip cost per full-position switch (fees plus spread, conservatively low). One full switch a month costs about 1.8% a year—on 100k, 1,800 of ticket fees, before you have won or lost anything. Add the hours spent watching ticks, which at this stage should be invested in the highest-return asset you own: your main income. Practical fix: alerts instead of screens. Set the invalidation level in /alerts, close the app, go work on the career that actually funds the account.",
      },
      {
        type: "ul",
        items: [
          "Five red-light words: guaranteed principal, monthly yield, lead-trading, insider tips, recruit friends.",
          "One rule on debt: pay off anything above 8% before buying any asset.",
          "One rule on size: no single position big enough to end the game—run it through /tools/position.",
          "One rule on trust: verify returns with your own arithmetic in /tools/compound before believing any screenshot.",
        ],
      },
      {
        type: "p",
        text: "If you suspect you are already inside a trap, three questions decide it: Can the money exit this week without penalties? Can the return source be explained in one sentence? Is anyone encouraging you to add money or bring friends? Any single vague answer—start exiting, quietly, before you feel the need to defend the decision.",
      },
      {
        type: "note",
        text: "Educational only. Products, rates and probabilities above are hypothetical illustrations; loan pricing and insurance terms vary by region and provider. Not investment advice.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "坑为什么贵？因为亏损对你复利。亏 30%，回本需要涨 42.9%——30/(1−30%)。按乐观的年化 8% 算，这是四年半「什么都没干、只用来 undo 一个错误」的时间。没掉坑的人领先你四年半，而且花的力气比你填坑少得多。",
      },
      {
        type: "table",
        head: ["回撤幅度", "回本需要涨幅", "按年化 8% 回本年数"],
        rows: [
          ["10%", "11.1%", "约 1.4 年"],
          ["30%", "42.9%", "约 4.5 年"],
          ["50%", "100%", "约 9 年"],
          ["90%", "900%", "约 29 年"],
        ],
        caption: "坑越深，爬坡越陡。本金小的时候，不掉 50% 以上的坑就是全部战略。",
      },
      { type: "h2", text: "坑一：高息负债，唯一的负起点" },
      {
        type: "p",
        text: "分期把真实成本藏起来了。12000 的手机分 12 期，每期手续费 0.6%（72 元），听着像年化 7.2%——但你每月还 1000，平均占用本金只有 6000 左右，实际年化约 13%。信用卡最低还款更贵。没有任何投资能稳定跑赢 13% 的确定亏损，所以还清这笔钱就是你当下最好的「无风险收益」。网贷和以贷养贷更不用讨论：负 carry，数学开局就输了。",
      },
      {
        type: "note",
        text: "经验法则：借来的钱利率高于分散组合能拿到的合理收益，那在还清之前，还债就是你的投资组合。",
      },
      { type: "h2", text: "坑二：翻身赌注，一次 all-in" },
      {
        type: "p",
        text: "算一下存活概率。假设你真有一个不错的优势：胜率 60%、盈亏比 1:1，每次 all-in。连对两次的概率 36%，三次不到 22%，五次 8%。一次归零，重建靠工资，不靠技术。本金少的时候，「分散」比「精选」更重要——你赌的是生存，不是收益最优。这正是 /tools/position 干的事：把每笔交易封顶在账户的固定比例（1–2%），让任何一个故事都终结不了游戏。",
      },
      { type: "h2", text: "坑三：为「赚钱的机会」付费" },
      {
        type: "p",
        text: "荐股群、内幕消息、付费课、跟单软件。先问一个问题：如果方法真能稳定赚钱，为什么不闷声自己复利，而是按月收订阅费？商业模式本身就回答了利润从哪来。心里存一张红灯词表：保本、月化、带单、内幕、拉人头——亮一个就走。",
      },
      {
        type: "p",
        text: "别人的收益率不用信，因为可以自己验。钱力股的复利计算器：月化 5% 复利，一年 1.8 倍，三年 6.2 倍，五年 23 倍。真能这么干五年的人早就是传奇了，犯不着收你每月 299。个股页的 AI 读图也守同一条边界：它只说结构、价位、失效——不荐股，不带单。",
      },
      { type: "h2", text: "坑四：保本高息和熟人盘子" },
      {
        type: "p",
        text: "无风险利率大约 2%。声称 10% 以上还保本的，要么把看不见的风险压在你身上，要么在用新钱付旧息——庞氏的两种标准姿势。这类坑的经典入口是信任：同事、亲戚、朋友的群。信任改变的只是谁来介绍这个盘子，改变不了算术。一句话检验：对手方是谁、收益从哪笔真实现金流来、本周能不能退出？答案含糊，收益率就是诱饵。",
      },
      { type: "h2", text: "坑五：保险买错方向" },
      {
        type: "p",
        text: "两个方向都会踩。一个方向是把分红返还型产品当投资买——贵、不透明、中途退保亏掉几年的保费。另一个方向是完全不配医疗和意外保障，把每一块钱都拿去理财——一场大病的 reset 能抹掉十年储蓄。本金少的时候，先用便宜的消费型保险兜住灾难性风险，剩下的钱再谈投资。保障不是收益，它是防止你的收益被一次性没收。",
      },
      { type: "h2", text: "坑六：盯盘成瘾，包装成勤奋" },
      {
        type: "p",
        text: "短炒一直在打表。假设每次全仓换手的往返成本 0.15%（手续费加点差，已经算保守），每月换手一次，一年成本约 1.8%——10 万本金一年交 1800 门票，还没算输赢。再算上盯盘的时间：这个阶段你手里收益率最高的资产是主业，盯盘是在烧它。解法很机械：用提醒代替盯屏。把失效价写进 /alerts，关掉软件，回去干活。",
      },
      {
        type: "ul",
        items: [
          "五个红灯词：保本、月化、带单、内幕、拉人头。",
          "负债一条规则：利率高于 8% 的债，在任何买入之前先还清。",
          "仓位一条规则：任何单笔都别大到能终结游戏——先过 /tools/position。",
          "信任一条规则：任何收益截图，先在 /tools/compound 里用自己的算术验一遍。",
        ],
      },
      {
        type: "p",
        text: "怀疑自己已经在坑里，三个问题定生死：钱这周能不能无惩罚退出？收益来源能不能一句话讲清？有没有人在鼓动你加钱或拉朋友？任何一条答不上来——悄悄开始撤，趁你还没到需要为这个决定辩护的时候。",
      },
      {
        type: "note",
        text: "本篇为教学示例。文中产品、利率与概率均为假设，贷款定价与保险条款因地区和机构而异，不构成投资建议。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Are interest-free installments okay?",
        a: "True zero-fee installments are a free cash-flow tool—use them if the price is identical. The trap is marketing that slides 'interest-free' into small print fees; always compare the lump-sum price against the total of all installments.",
      },
      {
        q: "Should I borrow to invest if rates are low?",
        a: "No, at this stage. Leverage belongs to the second capital stage with bounded, planned borrowing—not to a 100k account where one margin call is a reset.",
      },
      {
        q: "The signal group posts real profit screenshots. Doesn't that prove it?",
        a: "Screenshots cost nothing to fake and cherry-pick. Ask for a verifiable track record spanning half a year with entry and exit timestamps; almost nobody supplies one, and that is your answer.",
      },
      {
        q: "How do I know if I'm already inside a trap?",
        a: "Three questions: can funds exit this week without penalty, can the return source be explained in one sentence, is anyone pushing you to add money or recruit friends? Any vague answer means start exiting quietly.",
      },
    ],
    "zh-CN": [
      {
        q: "免息分期是不是就没问题？",
        a: "真·零手续费的免息分期是免费的现金流工具，价格完全一样时可以用。坑在于话术——「免息」悄悄滑进小额手续费。判断方法：拿总价和所有分期加总之和直接对比。",
      },
      {
        q: "利率低的时候能不能借钱投资？",
        a: "这个阶段不能。杠杆属于资本的第二阶段——便宜、有边界、有计划的借钱；10 万的账户上一次强平就是重开。",
      },
      {
        q: "荐股群有人晒真实盈利截图，不算证明吗？",
        a: "截图造假成本为零，而且可以只晒赢的。要求提供带进出场时间戳、能验证的半年以上记录——几乎没人拿得出来，拿不出来本身就是答案。",
      },
      {
        q: "怎么判断自己是不是已经在坑里？",
        a: "三问：资金本周能否无惩罚退出？收益来源能否一句话讲清？是否有人鼓动加钱或拉人？任何一条含糊，就悄悄开始撤。",
      },
    ],
  },
  links: {
    en: [
      { label: "Compound calculator", href: "/tools/compound" },
      { label: "Position sizing", href: "/tools/position" },
      { label: "100k→1M vs 1M→10M", href: "/learn/wealth-stages-100k-10m" },
      { label: "Compounding is hard behavior", href: "/learn/mindset-compounding-hard" },
      { label: "Paper trading and review", href: "/learn/paper-review" },
    ],
    "zh-CN": [
      { label: "复利计算器", href: "/tools/compound" },
      { label: "仓位计算器", href: "/tools/position" },
      { label: "10 万与 1000 万：两个阶段", href: "/learn/wealth-stages-100k-10m" },
      { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
      { label: "模拟交易与复盘", href: "/learn/paper-review" },
    ],
  },
  sourceNote: {
    en: "Educational. Rates, products and probabilities are hypothetical illustrations; local loan and insurance terms vary. Not investment advice.",
    "zh-CN": "仅供学习。文中利率、产品与概率均为假设示例，贷款与保险条款因地区而异。不构成投资建议。",
  },
};
