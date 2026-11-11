import type { LearnArticle } from "@/lib/learn/types";

/**
 * 100k→1M vs 1M→10M: same compounding math, different game.
 * Corrects the common "bigger principal compounds slower" myth —
 * at a fixed rate both take ln(10)/ln(1.08) ≈ 30 years; what changes
 * is the achievable return, the risk budget and the tools available.
 */
export const LEARN_ARTICLE_WEALTH_STAGES: LearnArticle = {
  slug: "wealth-stages-100k-10m",
  category: "mindset",
  ctaHref: "/tools/compound",
  author: "钱力股研究组",
  publishedAt: "2026-11-11",
  updatedAt: "2026-11-11",
  title: {
    en: "0.1M → 1M and 1M → 10M: same math, different games",
    "zh-CN": "10 万到 100 万，100 万到 1000 万：同一个道理，两种活法",
  },
  summary: {
    en: "At a fixed 8% both ten-fold climbs take the same ~30 years—the compounding formula does not care about your balance. What changes is how much of the return comes from your labor versus your capital, and how many mistakes you can afford.",
    "zh-CN":
      "固定年化下，两个十倍所需的年头一模一样——复利公式不看你余额。真正变的是收益里劳动和资本各占多少，以及你错得起几次。",
  },
  paragraphs: {
    en: [
      "A common myth: the second ten-fold is harder because the principal is bigger. At one fixed rate, the formula says otherwise—both take the same ~30 years. The difference is not the formula; it is which tools, risks and income sources each stage can actually use.",
    ],
    "zh-CN": [
      "一个流传很广的说法：第二个十倍更难，因为本金大。固定收益率下，公式不这么认为——两个十倍需要的年头一模一样。差别不在公式，在于每个阶段真正用得上什么工具、扛得住什么风险、靠什么赚钱。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Start with the honest arithmetic. At 8% a year, one dollar grows ten-fold in ln(10)/ln(1.08) ≈ 29.9 years, whether that dollar is one of your first 100,000 or one of your first 10,000,000. Compounding is indifferent to scale. If someone tells you the second ten-fold takes twice as long at the same rate, they are describing a real phenomenon—the return actually achievable shrinks when money gets big—but attributing it to the wrong cause.",
      },
      { type: "h2", text: "What actually changes between the two stages" },
      {
        type: "table",
        head: ["Dimension", "100k → 1M", "1M → 10M"],
        rows: [
          ["Main engine", "Labor income: salary, side work, extreme saving", "Capital income: allocation, access, disciplined leverage"],
          ["Rough mix", "90% labor / 10% investing", "70% capital / 30% everything else"],
          ["Annual 8% yield", "8,000 a year—smaller than one month of savings", "80,000 a year—a second salary that never sleeps"],
          ["Error budget", "One 50% drawdown sets you back years", "A 20% loss is painful, not structural"],
          ["Access", "Retail products only", "Lower fees, private placements, better counterparties"],
          ["Real bottleneck", "Cash flow you can add per month", "Return on capital without blowing up"],
        ],
        caption: "Same formula, different games. The first stage is a job; the second is a portfolio.",
      },
      { type: "h2", text: "Stage one: the math is unglamorous on purpose" },
      {
        type: "p",
        text: "Put numbers on it. Saving 3,000 a month at 8% reaches the first million in roughly 17 years; saving 5,000 a month gets there in about 12. Push the annual return from 8% to 12% and you save maybe two years. Raise your monthly contribution by 2,000 and you save several more. In this stage, contribution size beats return optimization almost every time—and a single all-in gamble that loses 40% sets you back more than either lever can recover.",
      },
      {
        type: "p",
        text: "That is why stage-one advice sounds boring: kill revolving debt, automate contributions into broad indexes, upgrade the main career, add one controllable side income. None of it is clever. All of it survives contact with a bad year. Q-Stock's DCA calculator (/tools/dca) exists to keep this stage honest—simulate before you commit, then let the schedule run without renegotiation.",
      },
      { type: "h2", text: "Stage two: capital stops being a passenger" },
      {
        type: "p",
        text: "Past the first million, the 8,000-per-year yield on 100k becomes 80,000 on 1M. Now allocation decisions dominate: the spread between a careless portfolio and a considered one compounds on a much larger base, so the same percentage point of skill is worth ten times more. Diversification stops being a slogan—single-stock risk that would merely bruise stage one can structurally wound stage two. Fees, taxes and currency exposure deserve their own line items. Leverage can appear, but as cheap, bounded, purposeful borrowing—not margin on a story.",
      },
      {
        type: "table",
        head: ["Lever that was useless at 100k", "Why it pays at 1M"],
        rows: [
          ["Asset allocation", "Rebalancing across uncorrelated assets adds return per unit of risk at any size, but only matters once capital income is your main income"],
          ["Fee negotiation", "0.5% saved on 1M is 5,000 a year—free money that did not exist at 100k scale"],
          ["Bounded leverage", "Cheap, collateralized borrowing against a diversified base amplifies a plan, never a hunch"],
          ["Access", "Some products simply have entry minimums; the second stage unlocks doors the first cannot knock on"],
        ],
        caption: "None of these levers change the compounding formula. They change the return you can realistically earn.",
      },
      { type: "h2", text: "The trap in both directions" },
      {
        type: "p",
        text: "Stage one's trap: imitating the rich. Concentrating everything into one hot idea, using leverage at 100k, or paying for products designed for someone else's tax situation. Stage two's trap: imitating the poor—and we mean that precisely—letting labor habits run capital, i.e. constant tinkering. At 1M, checking the portfolio hourly and reshuffling monthly is a behavior tax of several percentage points a year.",
      },
      {
        type: "note",
        text: "Both stages run on the same review loop: write the plan, execute it, record what happened, adjust the plan—not the story. Q-Stock's paper trading (/portfolio) and review page (/review) keep the loop on one desk.",
      },
      { type: "h2", text: "Run your own numbers before believing anyone's" },
      {
        type: "p",
        text: "Open /tools/compound. Set 8%. Watch how long 100k takes to reach 1M—then notice the next 1M arrives in the same number of years at the same rate. The exponent does not flatter anyone. What you control is the contribution line, the cost line, and the behavior line; the formula only converts those three inputs into a date.",
      },
      {
        type: "ul",
        items: [
          "Before the first million: contribution size > return chasing. Boring schedules beat clever bets.",
          "After the first million: risk control > return squeezing. One structural loss costs more than a decade of optimization earns.",
          "In both stages: the review page matters more than the watchlist.",
        ],
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "先把账算诚实。年化 8%，1 块钱涨十倍需要 ln(10)/ln(1.08) ≈ 29.9 年——不管这一块钱是你最初的 10 万里的一块，还是 1000 万里的一块。复利对规模无感。所以「本金大了翻倍更慢」这句话描述的现象可能是真的（钱变大后，能拿到的真实收益率确实会缩水），但把它归因给复利公式，就错了。",
      },
      { type: "h2", text: "两个阶段真正变的东西" },
      {
        type: "table",
        head: ["维度", "10 万 → 100 万", "100 万 → 1000 万"],
        rows: [
          ["主引擎", "劳动收入：主业升职、副业、极致储蓄", "资本收入：配置、通道、有纪律的杠杆"],
          ["大致配比", "90% 靠劳动，10% 靠理财", "70% 靠资本，30% 靠其它"],
          ["年化 8% 的年收益", "8000 元——还不如一个月攒得多", "8 万元——一份不用睡觉的工资"],
          ["容错预算", "一次腰斩，倒退好几年", "亏 20% 是疼，不是伤筋动骨"],
          ["通道", "只有零售产品", "费率、私募、对手方都换了一层"],
          ["真正的瓶颈", "每月能新增的现金流", "资本回报率，以及别爆仓"],
        ],
        caption: "公式相同，游戏不同。前一个阶段像一份工作，后一个阶段像一个组合。",
      },
      { type: "h2", text: "第一个阶段：数学注定不好看，别跟它较劲" },
      {
        type: "p",
        text: "代入数字。每月定投 3000，年化 8%，约 17 年到第一个 100 万；每月 5000，约 12 年。把收益率从 8% 提到 12%，大概省两年；把月投入多加 2000，省下的年份更多。这个阶段，投入规模几乎每次都跑赢收益率优化——而一把 all-in 输掉 40%，两种杠杆一起报废。",
      },
      {
        type: "p",
        text: "所以第一阶段的建议听着都很无聊：清掉循环负债、工资到账自动定投宽基指数、把主业往上升一级、加一份可控的副业。没有一样显得聪明，但每一样都扛得住烂年份。钱力股的定投计算器（/tools/dca）就是给这个阶段用的——先模拟，再扣款，然后别再跟计划讨价还价。",
      },
      { type: "h2", text: "第二个阶段：资本从乘客变司机" },
      {
        type: "p",
        text: "过了第一个 100 万，10 万本金每年 8000 的收益变成了 100 万本金每年 8 万。配置决策开始主导：同一个百分点的水平，乘的基数大十倍，值钱程度也大十倍。分散不再是口号——第一阶段只是淤青的单票风险，到这个规模会伤到骨头。费率、税务、汇率敞口都值得单独一行。杠杆可以出现，但必须是便宜、有边界、有用途的借钱，不是给一个故事上融资。",
      },
      {
        type: "table",
        head: ["10 万时用不上的杠杆", "为什么 100 万时开始值钱"],
        rows: [
          ["资产配置", "再平衡在任何规模都成立，但只有当资本收入成为主收入时，它才值得花时间"],
          ["费率谈判", "省 0.5% 在 100 万上就是一年 5000——10 万规模时这块免费的钱不存在"],
          ["有边界的杠杆", "便宜、抵押、对着分散组合的借钱放大的是计划，不是灵感"],
          ["门槛", "有些产品有起投线；第二阶段推开的门，第一阶段连门牌都看不到"],
        ],
        caption: "这些杠杆没有一个改动了复利公式，它们改的是你实际能拿到的收益率。",
      },
      { type: "h2", text: "两个方向各有一个陷阱" },
      {
        type: "p",
        text: "第一阶段的陷阱：模仿富人。10 万全押一个热点、上杠杆、买为别人的税务状况设计的产品。第二阶段的陷阱：模仿穷人——这个词是精确的——让劳动习惯接管资本：每小时盯一次净值，每月重构一次组合。在 100 万规模上，这种手痒的行为税一年好几个百分点。",
      },
      {
        type: "note",
        text: "两个阶段跑的是同一条复盘闭环：写计划、执行、记录发生了什么、改计划——不是改故事。钱力股的模拟盘（/portfolio）和复盘页（/review）就是把这条闭环钉在一张桌子上。",
      },
      { type: "h2", text: "别信任何人的结论，先跑自己的数" },
      {
        type: "p",
        text: "打开钱力股的复利计算器（/tools/compound），收益率设 8%。看看 10 万到 100 万要多少年——再注意到同样的利率下，下一个 100 万需要的年头一模一样。指数不偏袒任何人。你能控制的是投入那条线、成本那条线、行为那条线；公式只负责把这三样换算成一个日期。",
      },
      {
        type: "ul",
        items: [
          "第一个 100 万之前：投入规模 > 追收益率。无聊的 schedule 打败聪明的赌注。",
          "第一个 100 万之后：控风险 > 榨收益。一次结构性亏损，比十年优化赚的都多。",
          "两个阶段通用：复盘页比自选列表重要。",
        ],
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Is it really true both stages take ~30 years at 8%?",
        a: "At one fixed rate, yes—ln(10)/ln(1.08) ≈ 29.9 regardless of principal. What people observe as 'slower later' is that achievable returns and contribution leverage change, not the formula.",
      },
      {
        q: "Should I just save more instead of learning to invest?",
        a: "Below the first million, mostly yes—raise the contribution line first. But keep the money in a low-cost broad portfolio while you do; cash savings lose to inflation quietly.",
      },
      {
        q: "When is leverage acceptable?",
        a: "When it is cheap, collateralized, size-limited, and attached to a written plan with a defined worst case. Margin bought on conviction is none of those things at any stage.",
      },
      {
        q: "What tool should I use to test my own timeline?",
        a: "The compound calculator for the formula, the DCA calculator for the contribution schedule, and paper trading before any real behavior change.",
      },
    ],
    "zh-CN": [
      {
        q: "两个阶段在 8% 下真的都要约 30 年吗？",
        a: "固定利率下是的——ln(10)/ln(1.08) ≈ 29.9，与本金无关。大家观察到的「后面更慢」，是因为实际能拿到的收益率和投入杠杆变了，不是公式变了。",
      },
      {
        q: "那我是不是先别学投资，多攒就行？",
        a: "第一个 100 万之前，主要靠提升投入这条线。但攒下的钱要放在低成本的宽基组合里，别放活期——通胀在悄悄吃现金。",
      },
      {
        q: "什么时候可以用杠杆？",
        a: "便宜、有抵押、仓位有上限、有写下来的计划和明确的最坏情形。靠「我有信心」上的融资杠杆，在哪个阶段都不符合这四条。",
      },
      {
        q: "用什么工具验证自己的时间表？",
        a: "复利计算器算公式，定投计算器算投入节奏，真金白银改行为之前先走一遍模拟盘。",
      },
    ],
  },
  links: {
    en: [
      { label: "Compound calculator", href: "/tools/compound" },
      { label: "DCA calculator", href: "/tools/dca" },
      { label: "Position sizing", href: "/tools/position" },
      { label: "Compounding is hard behavior", href: "/learn/mindset-compounding-hard" },
      { label: "Wealth as process", href: "/learn/wealth-building-process" },
      { label: "Paper trading and review", href: "/learn/paper-review" },
    ],
    "zh-CN": [
      { label: "复利计算器", href: "/tools/compound" },
      { label: "定投计算器", href: "/tools/dca" },
      { label: "仓位计算器", href: "/tools/position" },
      { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
      { label: "财富累积是过程", href: "/learn/wealth-building-process" },
      { label: "模拟交易与复盘", href: "/learn/paper-review" },
    ],
  },
  sourceNote: {
    en: "Educational. All returns are hypothetical inputs, not forecasts; stage-two strategies carry real risks that this article does not endorse.",
    "zh-CN": "仅供学习。文中收益率为假设输入，非预测；文中提到的第二阶段策略含真实风险，本文不构成任何建议。",
  },
};
