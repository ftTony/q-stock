import type { LearnArticle } from "@/lib/learn/types";
import { LEARN_ARTICLE_DAO_GREED_FEAR } from "@/lib/learn/articles-mindset-dao";
import { LEARN_ARTICLE_ECONOMICS_RETAIL } from "@/lib/learn/articles-mindset-economics";
import { LEARN_ARTICLE_FINANCIAL_FREEDOM } from "@/lib/learn/articles-mindset-freedom";
import { LEARN_ARTICLE_LIFE_STAGE_PLAN } from "@/lib/learn/articles-mindset-life-stages";

/** Mindset articles — depth aligned with kline-basics. */
export const LEARN_ARTICLES_MINDSET: LearnArticle[] = [
  LEARN_ARTICLE_FINANCIAL_FREEDOM,
  LEARN_ARTICLE_LIFE_STAGE_PLAN,
  LEARN_ARTICLE_DAO_GREED_FEAR,
  LEARN_ARTICLE_ECONOMICS_RETAIL,
  {
    slug: "calm-watching",
    category: "mindset",
    ctaHref: "/markets",
    title: {
      "zh-CN": "冷静看盘：先看结构，再谈感觉",
      "zh-TW": "冷靜看盤：先看結構，再談感覺",
      en: "Calm watching: structure before feelings",
    },
    summary: {
      "zh-CN": "少刷屏、少追热点：用结构、价位与失效条件约束冲动。",
      "zh-TW": "少刷屏、少追熱點：用結構、價位與失效條件約束衝動。",
      en: "Fewer refreshes—anchor on structure, levels, and invalidation.",
    },
    paragraphs: {
      "zh-CN": [
        "打开行情页，涨跌颜色、短讯推送、别人的截图，都会把注意力往「此刻该不该动」上拽。很多人以为多刷几遍就能更清醒，结果往往更焦虑：越刷越想追，越追越后悔。冷静看盘不是关掉行情，而是先把判断框架钉死，再决定要不要动手。",
        "一个常见误区是：把「感觉」当成分析。感觉可能来自刚刚涨停的标题、群里的口号，或自己账户的浮亏压力——它们很真实，但很少稳定。更稳的做法是固定问三件事，答不上来就先不加仓、不追单。",
        "一、结构：现在更像趋势推进、区间震荡，还是破位后的混乱？说不清结构，说明你还在看局部噪声，不适合放大仓位。",
        "二、价位：真正关键的支撑、阻力或区间沿在哪里？整数关口、前高前低、放量区，优先看你事先标过的线，而不是盘中临时找的「希望位」。",
        "三、失效：什么情况出现，你就承认原先判断作废？没有失效条件，等于给自己无限辩护空间——跌了说「洗盘」，涨飞了说「踏空要追」。",
        "钱力股的 AI 读图与情景推演，也按「结构 → 关键位 → 失效」组织。它们是学习辅助，用来逼你把话说清楚，不是买卖指令，更不是保证方向正确。",
        "实操时可以这样练：打开一只你熟悉的标的，先关掉新闻和评论，只看日线与一条均线，用三句话写笔记。写得出来再去看短周期；写不出来，说明今天只适合观察，不适合动手。",
        "提醒适合绑定失效价或计划位，而不是「希望涨到的整数」。价格打到该线，先停手复核清单，而不是立刻加仓证明自己正确。冲动加仓，往往是在用仓位掩盖框架缺失。",
        "冷静看盘的终点，不是永远不动，而是把「感觉」降级为参考，把结构、价位、失效升格为默认流程。流程可以反复用；情绪不能当策略。若刷屏欲望特别强，可先读《道德经看贪婪、恐惧与欲望》，把「少刺激」当成护栏再回来看盘。",
      ],
      "zh-TW": [
        "打開行情頁，漲跌顏色與短訊很容易把人拽進「此刻該不該動」。冷靜看盤不是關掉行情，而是先釘死判斷框架，再決定要不要動手。",
        "常見誤區是把「感覺」當成分析。更穩的做法是固定問三件事：結構、價位、失效。答不上來，就先不加倉、不追單。",
        "一、結構：趨勢、震盪，還是破位後的混亂？",
        "二、價位：真正關鍵的支撐／阻力或區間沿在哪？",
        "三、失效：什麼情況出現，原先判斷就作廢？",
        "錢力股的 AI 讀圖與情景也按這個順序組織，是學習輔助，不是買賣指令。把失效條件寫進提醒或筆記，打到該線先停手複核。刷屏欲望強時，可先讀《道德經看貪婪、恐懼與欲望》。",
      ],
      en: [
        "Color, headlines, and screenshots yank attention toward “should I act now?” More refresh rarely brings clarity—it often brings chase. Calm watching means locking a frame before you move.",
        "A common trap is treating feelings as analysis. Feelings are real; they are rarely stable. Ask three fixed questions; if you cannot answer, do not add risk.",
        "1) Structure: trend, range, or messy break?",
        "2) Levels: where are the real supports, resistances, or range edges you marked in advance?",
        "3) Invalidation: what voids this read? Without it, you will invent reasons to stay.",
        "Q-Stock’s AI chart and scenario tools follow structure → levels → invalidation. They are study aids, not tickets. Practice: write three lines on a daily chart before looking at minutes; put invalidation into an alert and pause when it fires. If feed-chasing is loud, read the Tao Te Ching greed/fear/desire essay first.",
      ],
    },
  },
  {
    slug: "checklist-three",
    category: "mindset",
    ctaHref: "/portfolio",
    title: {
      "zh-CN": "下单前三问清单",
      "zh-TW": "下單前三問清單",
      en: "Three questions before you click",
    },
    summary: {
      "zh-CN": "结构清楚了吗？风险预算定了吗？失效条件写了吗？",
      "zh-TW": "結構清楚了嗎？風險預算定了嗎？失效條件寫了嗎？",
      en: "Structure clear? Risk budget set? Invalidation written down?",
    },
    paragraphs: {
      "zh-CN": [
        "很多后悔单，复盘时其实说不清当时为什么点下去。不是「没看新闻」，而是动手前没有固定问题。清单的作用不是保证盈利，而是把冲动拦在门外：答不上来的三问，就先不加仓、不追单。",
        "清单要短。问题一多，盘中根本不会用。建议每次只问三句，写在笔记或模拟单备注里，形成肌肉记忆。",
        "一、结构：现在更像趋势、震荡，还是刚破位后的混乱？说不清结构，就不该放大仓位——你还在用局部波动当理由。",
        "二、风险：这笔最多愿意亏账户的百分之几？先定「亏得起」，再反推数量；不要先想能赚多少再倒推「必须买多少」。仓位工具就是把这句话算成可执行股数。",
        "三、失效：什么价位或条件出现，你就承认计划作废？没写失效，等于给自己无限辩护空间。跌破还说「再等等」，涨飞又说「错过了要追」，都是同一类问题。",
        "三问之间有顺序：结构不清楚，后面两问容易变成自欺；风险不定，再漂亮的结构也是裸奔；失效不写，前面两问会在盘中被情绪改写。",
        "常见误用：把清单当成「做多许可证」。三问通过，只说明你具备动手的最低条件，不代表方向一定对。清单通过后仍可能亏钱——那是概率与风险预算要管的事，不是清单失灵。",
        "在钱力股可以先用模拟盘把这三问走通：每笔模拟单备注里写结构 / 风险% / 失效价，再用仓位计算器把「亏得起」换成数量。真盘前用同一套语言，比换一套口号更重要。",
        "建议节奏：宁可少做几笔答得清的单，也不要每天几十次说不清的点点点。清单是外挂大脑，用来约束冲动，不是圣杯咒语。若总被「再多一点」推着走，可对照《道德经看贪婪、恐惧与欲望》里的知足与知止；若总在盘中改规则，可读《思考，快与慢》导读——系统 1 很勤快，系统 2 要靠清单值班。",
      ],
      "zh-TW": [
        "很多後悔單，不是「沒看新聞」，而是動手前沒有固定問題。清單不是保證獲利，而是把衝動攔在門外。",
        "一、結構：趨勢、震盪，還是破位後的混亂？說不清就不要放大倉位。",
        "二、風險：這筆最多願意虧帳戶的百分之幾？先定虧得起，再反推數量。",
        "三、失效：什麼價位或條件出現，計畫就作廢？",
        "在錢力股可用模擬盤把三問走通，再用倉位工具把「虧得起」算成數量。清單約束衝動，不是獲利咒語。被「再多一點」推著走時，可讀《道德經看貪婪、恐懼與欲望》。",
      ],
      en: [
        "Regret often comes from skipping a fixed checklist—not from missing a headline. A short list is a gate: if you cannot answer, do not add risk.",
        "1) Structure: trend, range, or messy break? If you cannot name it, do not size up.",
        "2) Risk: what percent of equity is the max loss? Set the budget before dreaming about upside; the position tool turns that into size.",
        "3) Invalidation: what price or condition voids the plan? Without it, you will keep inventing reasons to stay.",
        "Passing the checklist is a minimum to act—not a guarantee of direction. Practice on paper with three-line notes, then reuse the same language before real money. A checklist constrains impulse; it is not a profit spell. When “a bit more” keeps pushing you, read the Tao Te Ching greed/fear/desire essay.",
      ],
    },
  },
];
