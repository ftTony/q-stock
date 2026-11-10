import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-10";

/** Deep crash first-aid — process protocol, not dip-calling. */
export const LEARN_ARTICLES_SEO_MINDSET_CRASH: LearnArticle[] = [
  {
    slug: "mindset-crash-first-aid",
    category: "mindset",
    ctaHref: "/alerts",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    title: {
      en: "Crash first-aid: triage yourself before you triage the book",
      "zh-CN": "暴跌急救：先分诊自己，再分诊持仓",
    },
    summary: {
      en: "The first hour after a shock is when improvised rules feel like courage. They are usually adrenaline. Rehearse a freeze–read–write sequence so live tape cannot invent policy.",
      "zh-CN":
        "冲击后的第一个小时，即兴规则最像勇气，其实多半是肾上腺素。预先排练「冻结—读计划—写一句」，免得实盘现场立法。",
    },
    paragraphs: {
      en: [
        "A crash does not ask for your opinion. It asks whether you already have one written down.",
        "If the answer is no, the market will help you invent a loud one—usually at the worst size.",
      ],
      "zh-CN": [
        "暴跌不征求你的意见。它只问：你事先有没有写成字的意见。",
        "如果没有，市场会帮你发明一个很响的——仓位往往也最大。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "This protocol is deliberately boring. It is not a buy-the-dip manifesto, a flatten-everything manifesto, or a prediction about VIX. It is triage: keep the decision-maker (you) from hemorrhaging process while the tape is noisy. Rehearse it on paper after an ordinary −2% day so the −8% day is not your first rehearsal.",
        },
        { type: "h2", text: "What the first hour is for—and not for" },
        {
          type: "p",
          text: "For: reading which pre-written invalidations already fired; silencing non-plan noise; writing one sentence that constrains the next action. Not for: discovering a new thesis from headlines; averaging because “it can’t go lower”; heroically timing the exact low; arguing with strangers.",
        },
        {
          type: "ul",
          items: [
            "Minute 0–5: hands off new risk. Close social feeds. Open the symbol plan tab, not the hot list.",
            "Minute 5–20: for each open name, ask only—did invalidation print? If yes, the trade is the exit you already defined.",
            "Minute 20–40: check session context (cash vs thin hours; which market’s print you are watching). Multi-market 101 exists for a reason.",
            "Minute 40–60: write one sentence into the review note: “I will do X because Y; I will not do Z.” Screenshot it. Only then consider any contingency that was pre-written—not invented now.",
          ],
        },
        { type: "h2", text: "Three impulses that dress up as strategy" },
        {
          type: "table",
          head: ["Impulse", "Story it tells", "What usually breaks", "Latch"],
          rows: [
            [
              "Average down now",
              "“Washout / get even.”",
              "Risk % and thesis clarity",
              "Checklist ceiling already used?",
            ],
            [
              "Flatten everything",
              "“Cut the noise.”",
              "Names that never hit invalidation get sold for mood",
              "Per-symbol plan, not portfolio panic",
            ],
            [
              "Hunt a savior narrative",
              "“Someone knows the bottom.”",
              "Confirmation under stress",
              "One chart, three calm lines, no feed",
            ],
          ],
          caption:
            "If your sentence needs a villain (“the market is irrational”), you are protecting ego, not capital.",
        },
        { type: "h2", text: "Invalidation already hit versus “it feels scary”" },
        {
          type: "p",
          text: "Scary is not a trigger. A daily close beyond a pre-drawn band is. Gap opens that skip your alert still count—execute on the first liquid print you planned for, or the contingency you wrote for gaps. Renegotiating the band mid-crash is loss aversion with better lighting.",
        },
        {
          type: "note",
          text: "Holding options into the shock? Finish equity triage first, then re-mark IV. Do not solve gamma and shame in the same minute. Earnings-week and IV-crush lessons belong after the hour, not inside it.",
        },
        { type: "h2", text: "After the hour: clean the desk" },
        {
          type: "p",
          text: "Shrink the watchlist to names with written plans. Delete tourist tickers added while red. Same evening review: which latch held; which story almost moved a stop. Crashes improve traders who refuse to practice heroics. They punish traders who confuse movement with skill.",
        },
        {
          type: "p",
          text: "Optional drill: once a quarter, pick a historical gap day on a liquid name you know. Walk the sixty-minute script without placing size. Note where you wanted to cheat. That itch is the curriculum.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "这套协议故意无聊。它不是抄底宣言，不是一键清仓宣言，也不是对波动率的预测。它是分诊：在盘面很吵时，先别让决策者（你）失血式丢掉流程。最好在普通 −2% 的日子用模拟预演一遍，这样 −8% 的日子就不是首演。",
        },
        { type: "h2", text: "第一个小时用来干什么——不干什么" },
        {
          type: "p",
          text: "用来：看哪些事先写好的失效已经触发；关掉非计划噪音；写下一句约束下一步的话。不用来：从标题里发现新论点；因为「不可能再低」而摊平；英雄式去点最低价；跟陌生人抬杠。",
        },
        {
          type: "ul",
          items: [
            "0–5 分钟：不加新风险。关社交。打开个股计划 Tab，不是热榜。",
            "5–20 分钟：对每个持仓只问——失效是否已经出现？是，则交易就是你已定义的离场。",
            "20–40 分钟：核对时段语境（现金盘 vs 薄流动性；你看的是哪个市场的价）。《多市场》那课不是摆设。",
            "40–60 分钟：复盘备注写一句：「我做 X 因为 Y；我不做 Z。」截图。然后才考虑事先写过的应急条款——不是现在发明的。",
          ],
        },
        { type: "h2", text: "三种打扮成策略的冲动" },
        {
          type: "table",
          head: ["冲动", "它讲的故事", "通常破坏什么", "门闩"],
          rows: [
            [
              "立刻摊平",
              "「洗盘 / 扳本。」",
              "风险%与论点清晰度",
              "三问里的顶是否已用尽？",
            ],
            [
              "情绪性全平",
              "「先切断噪音。」",
              "从未触发失效的标的被心情卖掉",
              "按标的计划，不按组合恐慌",
            ],
            [
              "寻找救世主叙事",
              "「有人知道底在哪。」",
              "压力下的确认偏误",
              "一张图、冷静三句、不看信息流",
            ],
          ],
          caption:
            "若你的句子需要一个反派（「市场不讲理」），你在保护面子，不是保护本金。",
        },
        { type: "h2", text: "失效已触发，还是「只是吓人」" },
        {
          type: "p",
          text: "吓人不是扳机。日线收盘越过事先画好的带子才是。跳空越过提醒价仍然算——按你为跳空写过的条款，在第一笔可成交的流动性上执行。暴跌中挪带子，是打了聚光灯的损失厌恶。",
        },
        {
          type: "note",
          text: "冲击里还持有期权？先完成股票侧分诊，再重新标记 IV。不要同一分钟里同时处理 Gamma 与羞耻感。财报周与 IV Crush 的课放在一小时之后，不要塞进第一根大阴线。",
        },
        { type: "h2", text: "一小时之后：收拾桌子" },
        {
          type: "p",
          text: "自选缩回「有书面计划」的名字。删掉飘红时加进来的观光票。当晚复盘：哪扇门闩守住了；哪个故事差点挪走止损。暴跌成就拒绝练习英雄主义的人；惩罚把「动起来」误当成能力的人。",
        },
        {
          type: "p",
          text: "可选练习：每季度挑一个你熟悉的流动性标的的历史跳空日。不上仓，只走六十分钟剧本。记下你最想作弊的瞬间。那个痒，才是功课。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is sitting on my hands always correct?",
          a: "Executing a pre-written invalidation is not “doing nothing.” Inventing a new rule because red feels unbearable is the failure mode.",
        },
        {
          q: "What if I have no written plan?",
          a: "Then the first hour’s job is to not dig. Flat new risk, journal the urge, build the plan on the next calm day—not during the ambulance ride.",
        },
      ],
      "zh-CN": [
        {
          q: "按兵不动一定对吗？",
          a: "执行事先写好的失效，不是「什么都不做」。因为受不了红色而发明新规则，才是失败模式。",
        },
        {
          q: "如果我根本没有书面计划？",
          a: "那第一个小时的任务是别再挖深。冻结新风险，记下冲动，等平静日再写计划——不要在救护车上写宪法。",
        },
      ],
    },
    links: {
      en: [
        { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
        { label: "Exit rules", href: "/learn/stocks-exit-rules" },
        { label: "Calm watching", href: "/learn/calm-watching" },
      ],
      "zh-CN": [
        { label: "五种行为偏差", href: "/learn/mindset-behavior-biases" },
        { label: "自选与提醒", href: "/learn/watchlist-alerts" },
        { label: "何时卖出", href: "/learn/stocks-exit-rules" },
        { label: "冷静看盘", href: "/learn/calm-watching" },
      ],
    },
    sourceNote: {
      en: "Educational. Not a timing system. Rehearse before you need the protocol.",
      "zh-CN": "仅供学习。不是择时系统。用得到之前先预演。",
    },
  },
];
