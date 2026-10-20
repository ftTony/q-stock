import type { LearnArticle } from "@/lib/learn/types";

/**
 * Stock-picking steps that force fundamentals and technicals to work together.
 */
export const LEARN_ARTICLE_PICKING: LearnArticle = {
  slug: "stock-picking-steps",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "选股步骤：基本面过关，技术面才谈位置",
    "zh-TW": "選股步驟：基本面過關，技術面才談位置",
    en: "Picking steps: fundamentals first, then location on the chart",
  },
  summary: {
    "zh-CN": "选股不是两套互相打架的方法。先筛「值不值得研究」，再问「现在值不值得动手」；答不上任一句，就不该上仓位。",
    "zh-TW": "選股不是兩套互打的方法。先篩「值不值得研究」，再問「現在值不值得動手」。",
    en: "Not two rival methods. First: worth studying? Then: worth acting now? Fail either—and size stays zero.",
  },
  paragraphs: {
    "zh-CN": [
      "选股这件事，市场上永远不缺「秘籍」：有人只认财报，有人只认图，还有人两者都不看，只认群消息。我见过、也干过更糟的一种——基本面和技术面各拿来给自己壮胆：故事好听时说「长期持有」，图破了又说「公司基本面没变」；指标翻红时说「趋势来了」，财报一差又说「技术只是短期噪声」。两套语言轮着给冲动开脱，最后亏的还是自己。",
      "更深一层的问题不是缺指标，而是缺顺序。基本面回答的是「这家公司值不值得进入你的观察名单」；技术面回答的是「即便值得，现在动手的位置与失效条件清不清楚」。把顺序颠倒——先被一根大阳线勾进去，再补故事圆场——你会在最贵、最挤的位置上，用最软的理由说服自己。钱力股里把公司、财报、图表、提醒放在同一只标的下，就是为了逼你把两件事放在一张桌子上，而不是两个互相推诿的借口。",
      "第一步，先做基本面门禁，而且要残忍一点。能用一句话说清它靠什么赚钱吗？近几个季度，营收与利润是同向改善、恶化，还是各说各话？跟同赛道两到四家比，贵或便宜有没有同一把尺子？你仍不懂的点写得出两点吗？亏得起的比例写得出数字吗？这五问过不了，标的可以进自选「以后再看」，但不应进入「准备下单」的队列。细节见《基本面怎么看》；在站内路径大致是：行情搜到个股 → 公司 → 财报 → 同业对比（分析页）。免费摘要有延迟与估算，对不上以官方披露为准——基本面慢，价格快，错位是常态，不是你「悟性不够」的证据。",
      "第二步，才轮到技术面，而且只干一件事：给「现在」定价位置与认错线。打开日线（必要时再看更大周期），先问结构——趋势还是箱体；再问位置——相对这段行情是高、中、还是低；量能与均线、MACD、RSI 只做旁证，不替你下判决。趋势里回踩与箱体里假突破，长得常常很像，差的就是你有没有先回答结构。K 线与指标另有专文；这里只强调一句：技术面不负责证明「公司好」，只负责证明「你是否在用好公司的名义，买在一个讲不清失效条件的位置上」。",
      "第三步，把两边合成，而不是加权平均出一个「感觉分」。常见四种组合，对应四种动作，比「看多看空」有用：基本面过关、位置冷静（结构清楚、离失效不远就能认错）——才进入仓位与模拟讨论；基本面过关、位置很冲（高位加速、指标钝化、你说不清失效）——只观察或极小仓试错规则，默认是等；位置好看、基本面说不清——不当机会，当噪音；两边都糊——直接划掉，省下的注意力比多看十张图值钱。合成的本质是一票否决：任一门禁失败，仓位为零。很多人亏在「两边都有一点道理，所以折中买一点」——折中往往是情绪的算术，不是风控。",
      "第四步，落到钱力股可执行的动作，而不是停在顿悟。观察名单：自选里少而准，备注写「还缺哪条基本面证据」。动手前：价格提醒绑的是失效位或结构位，不是许愿价；仓位工具只回答「这笔最多亏账户多少」，不回答「该不该买」。拿不准就先模拟走一遍流程，复盘三问——结构说清了吗？风险预算写了吗？失效触发后你是否真的停手？AI 读图可以逼你把结构、价位、推翻条件说出口，但若它和你肉眼、和财报线索打架，停手比抬杠重要。整条链是：筛 → 定位 → 合成 → 提醒/模拟/复盘；缺任何一环，选股就会退回「听说 + 图形 + 感觉」。",
      "还有一层常被忽视的「深刻」：选股是在选你愿意长期忍受不确定性的对象，不是选下周最可能涨的代码。基本面过关，意味着你对「坏消息来时凭什么还不慌」有一点依据；技术面过关，意味着坏消息或假突破来时，你有事先写好的离场句，而不是现场编。两者缺一，剩下的往往是叙事成瘾——涨了归功于眼光，跌了归咎于市场不讲理。把失效条件写进提醒与复盘，是在跟未来的自己签合同；合同不签，任何选股步骤都只是作文。",
      "练习用一只你已经盯着的票（别为了练习专门找黑马）：按五问过基本面，过不了就停。过了再画结构、位置、失效价，写进提醒备注。然后强制选择上面四种组合里的一种动作，只许选一个，不许「再看看但也先买一点」。一周后复盘：你当时选的动作，事后有没有被情绪改写？被改写的次数，比盈亏数字更能衡量这套步骤有没有进你的骨头。",
      "边界说死：本站内容与工具仅供学习参考，不构成投资建议，更不保证按步骤操作就能盈利。市场对散户不对等——信息、速度、纪律都可能弱于机构与量化；步骤能做的，是降低「无知下单」和「位置失控」叠在一起的概率。能把「暂时不选」当成选股结果的一部分，已经比多会三个形态更接近长久。",
    ],
    "zh-TW": [
      "選股常敗在順序顛倒：先被大陽線勾進去，再補故事。基本面回答「值不值得進觀察名單」；技術面回答「現在位置與失效清不清楚」。兩套語言輪流幫衝動開脫，最後虧的是自己。",
      "門禁一（基本面五問）：靠什麼賺錢？近況變好／變差？同業尺子？不懂的兩點？虧得起的數字？過不了只進自選「以後再看」。路徑：個股 → 公司 → 財報 → 同業對比。詳見《基本面怎麼看》。",
      "門禁二（技術面）：日線先問結構與位置，均線／MACD／RSI 只做旁證。技術面不證明「公司好」，只證明你有沒有講清失效。",
      "合成用一票否決，不要折中買一點：兩邊過關才談倉位；基本面過、位置衝 → 等；圖好看、故事不清 → 當雜訊；都糊 → 劃掉。站內：提醒綁失效位、倉位工具只答「虧得起多少」、模擬與複盤三問、AI 讀圖要交叉驗證。",
      "選股是選你願意承受不確定性的對象，並預先與自己簽失效合同。內容僅供學習，不構成投資建議；「暫時不選」也是結果。",
    ],
    en: [
      "Stock picking fails less from missing an indicator than from reversed order. Fundamentals ask whether a name deserves your watchlist. Technicals ask whether—even if it does—today’s location and invalidation are clear. Using each language in turn to excuse impulse is how people lose.",
      "Gate 1 — five fundamental questions: how it earns; whether recent quarters improved or worsened; peers on one yardstick; two things you still don’t get; a number for what you can lose. Fail → watchlist “later,” not an order queue. Path: symbol → company → earnings → peer compare. See the fundamentals checklist essay. Free summaries lag; filings win.",
      "Gate 2 — technicals only price “now”: structure (trend vs range), location (high/mid/low), indicators as witnesses. Charts do not prove “good company”; they prove you are not buying a story at a nameless level. See the candle and indicator essays.",
      "Combine with vetoes, not a fuzzy score: both pass → discuss size/paper; fundamentals pass but location hot → wait or tiny rule-bound probe; pretty chart, unclear story → noise; both muddy → cut. On Q-Stock: alerts store invalidation; position tools answer loss budget; paper + review three prompts; AI chart read must cross-check your eyes and filings.",
      "Deeper point: you are choosing what uncertainty you will tolerate, and signing a pre-written exit with yourself. Learning only—not advice. Treating “not picking” as a valid outcome already beats memorizing three more patterns.",
    ],
  },
};
