import type { LearnArticle } from "@/lib/learn/types";

/**
 * Applied economics for retail decisions — not a macro tip sheet,
 * not a second Poor Economics book guide.
 */
export const LEARN_ARTICLE_ECONOMICS_RETAIL: LearnArticle = {
  slug: "economics-for-retail",
  category: "mindset",
  ctaHref: "/learn/book-poor-economics",
  title: {
    "zh-CN": "经济学怎么帮散户想清楚：激励、代价与带宽",
    "zh-TW": "經濟學怎麼幫散戶想清楚：激勵、代價與帶寬",
    en: "Economics for calmer retail: incentives, trade-offs, bandwidth",
  },
  summary: {
    "zh-CN": "不必先啃宏观模型。把激励、机会成本、匮乏带宽和小步验证用在下单前，比多记几个指标管用。",
    "zh-TW": "不必先啃總經模型。激勵、機會成本、匱乏帶寬與小步驗證，比多背指標更能少犯錯。",
    en: "Skip the macro textbook first. Incentives, opportunity cost, scarce bandwidth, and small tests beat memorizing more ratios.",
  },
  paragraphs: {
    "zh-CN": [
      "一提经济学，很多人脑子里先出现 GDP、加息、漂亮公式。散户晚上两小时，啃完一套宏观也未必能少亏一次冲动单。更有用的入口其实很土：经济学首先是一套「看约束和权衡」的习惯——谁在什么激励下行动？你为了得到 A，放弃了什么 B？口袋紧的时候，脑子为什么更容易变笨？把这几问问到自己的交易上，比背术语更接近长久。",
      "第一块：激励。人会对奖励与惩罚做出反应，机构如此，你也如此。涨了有群夸、跌了有羞耻，本身就是激励结构；券商推送、热榜、惊喜百分比，都在争夺你的注意力。钱力股刻意把「失效条件、风险预算、复盘」放在前面，不是因为态度高尚，而是想换一套激励：让「守规则」比「今日必须翻本」更容易被选中。空喊理性，不如改界面与清单——这和《贫困的本质》里「小机制胜过大口号」是同一种脾气，导读在书单里。",
      "第二块：机会成本。选了满仓赌一只故事股，你放弃的不只是现金利息，还有「留子弹应对更好结构」的权利，以及睡眠。机会成本不是要你算到小数点，而是下单前多逼一句：这笔仓位占用之后，我还敢不敢按计划做下一件该做的事？仓位工具回答的是「亏得起多少」；机会成本逼你承认「就算小亏，占用本身也有价」。很多人不是死在一次大亏，而是死在子弹被垃圾仓位锁死、好位置来了却不敢动。",
      "第三块：匮乏与认知带宽。发展经济学里反复出现的画面是：资源太紧时，人会被紧急事占满，长期打算排不上队。换成账户语言：保证金告急、浮亏刺眼、必须今日回本——带宽被抽干，三问清单再熟也会跳过。现金缓冲、更少强制杠杆、减少热榜刷屏，不是胆小，是给系统 2 留电。带宽一紧，直觉（系统 1）更容易接管；《思考，快与慢》导读可以接着看。自由的一部分，是让自己不那么「穷于决策」。",
      "第四块：小步验证，少搞不容证伪的人生叙事。「这次逻辑不同」「我看过内部」——听起来像信念，运作起来像拒绝被打脸。经济学味的谦逊是：好方案也要经得起对照。站内对应很具体：模拟盘先走通结构、风险、失效；小仓位验证你能不能真的停手；复盘问「哪一条假设被事实验了」。别把自己的账户过成一部不能剪辑的英雄片。",
      "第五块：信息也是有成本的商品。多看一张图、多问一轮 AI，看似勤奋，机会成本是睡眠与规则执行。钱力股的用法宜克制：财报 Tab 当灯号，三张表闭环当对质，同业对比当提问，AI 只追问「利润和现金是否同向」或「失效写清了没」——然后停。免费源有延迟，官方披露说了算；信息越多，不等于判断越好，有时只是带宽更窄。",
      "和宏观新闻怎么共处：加息、就业、地缘会动价格，但散户很难在信息上跑赢专台。更稳的姿态是：宏观当天气，仓位与失效当雨具；天气变了，先检查雨具在不在，而不是假装自己是气象台。主题炒作把「经济学故事」卖成必涨逻辑时，回到激励问题——谁在卖故事？你若买进，付出的机会成本是什么？",
      "一张可执行的对照表（写进复盘也行）：今天推动我点下去的激励是什么（恐惧错过，还是规则触发）？这笔的机会成本我认不认？带宽够不够写完三问？我能不能用模拟或小仓验证，而不是世界观梭哈？四问里有两问答不上，默认不加大仓位。",
      "边界说清楚：本文不是宏观策略，也不是《贫困的本质》的缩写版；书单导读讲田野与试验，本文只借「约束、激励、带宽」迁到个人流程。本站工具与内容仅供学习参考，不构成投资建议。经济学帮散户想清楚，目标是少做被激励结构牵着走的决定，不是让你看起来更懂术语。",
    ],
    "zh-TW": [
      "一提經濟學，很多人先想到 GDP 與加息。散戶更有用的入口很土：誰在什麼激勵下行動？為了 A 放棄了什麼 B？口袋緊時為什麼更容易變笨？問到自己的交易上，比背術語更接近長久。",
      "激勵：漲有誇、跌有羞，本身就是激勵結構；熱榜與驚喜百分比在搶注意力。錢力股把失效、風險預算、複盤放前面，是想換一套激勵——讓守規則比今日翻本更容易被選中。空喊理性，不如改介面與清單；脾氣同《貧困的本質》導讀。",
      "機會成本：滿倉賭故事股，放棄的不只利息，還有彈藥與睡眠。下單前逼一句：占用之後，還敢不敢做下一件該做的事？很多人不是死在一次大虧，而是死在垃圾倉位鎖死、好位置不敢動。",
      "匱乏與帶寬：保證金告急、必須今日回本時，三問再熟也會跳過。現金緩衝、少強制槓桿、少刷熱榜，是給系統 2 留電。可接《思考，快與慢》導讀。",
      "小步驗證：好方案也要經得起對照——模擬走通結構／風險／失效，小倉驗證能不能停手。資訊也有成本；財報燈號、三表對質、同業提問、AI 交叉驗證後就停。",
      "宏觀當天氣，倉位與失效當雨具。四問對照：推動點下去的激勵？機會成本認不認？帶寬夠不夠寫完三問？能否用模擬或小倉驗證？兩問答不上，預設不加大倉位。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Skip the macro textbook first. Useful economics asks: who acts under which incentives? What B did you give up for A? Why does a tight wallet make thinking worse? Put those on your own trades before memorizing jargon.",
      "Incentives: praise on wins and shame on losses are already a payoff structure; heat lists and surprise percentages fight for attention. Q-Stock puts invalidation, risk budget, and review up front to make “follow the rule” easier to choose than “must recover today.” Redesign the checklist, don’t preach. Same temper as the Poor Economics guide.",
      "Opportunity cost: a full bet on a story stock costs more than idle interest—it costs dry powder and sleep. Before you click: after this size, can I still do the next planned thing? Many accounts die from locked junk, not one blow-up.",
      "Scarcity and bandwidth: when margin screams or “must recover today” takes over, even a familiar three-question list gets skipped. Cash buffer, less forced leverage, fewer heat-list refreshes keep System 2 online—see Thinking, Fast and Slow.",
      "Small falsifiable tests beat hero narratives: paper the structure / risk / invalidation path; tiny size to prove you can stop. Information is costly—earnings lights, three-statement cross-checks, peer questions, then stop.",
      "Macro is weather; size and invalidation are the coat. Four checks: what incentive pushed the click? Do I accept the opportunity cost? Bandwidth enough for the three questions? Paper or tiny size before worldview bets? Miss two—default: do not add size. Learning only—not advice.",
    ],
  },
};
