import type { LearnArticle } from "@/lib/learn/types";

/**
 * Fundamentals checklist — how to read a company without mistaking ratios for a buy button.
 * Kept separate so articles-basics.ts stays under the line limit.
 */
export const LEARN_ARTICLE_FUNDAMENTALS: LearnArticle = {
  slug: "fundamentals-checklist",
  category: "basics",
  ctaHref: "/analysis",
  title: {
    "zh-CN": "基本面怎么看：一张清单，而不是一堆比率",
    "zh-TW": "基本面怎麼看：一張清單，而不是一堆比率",
    en: "Fundamentals as a checklist, not a pile of ratios",
  },
  summary: {
    "zh-CN": "先搞清公司靠什么赚钱，再碰估值；财报与同业对比是线索，不是买卖指令。",
    "zh-TW": "先搞清公司靠什麼賺錢，再碰估值；財報與同業對比是線索，不是買賣指令。",
    en: "Know how the company earns before touching valuation. Filings and peers are clues, not orders.",
  },
  paragraphs: {
    "zh-CN": [
      "一提基本面，很多人脑子里先蹦出 PE、PB、ROE 一串缩写，然后对着数字争论「贵不贵」。我自己当年也这样——表格填满了，对公司到底卖什么、客户为什么付钱，反而说不清。后来才觉得：比率是压缩后的结果，清单才是入口。",
      "基本面不是「算出一个公平价再下单」。对散户更现实的目标是：减少「听故事就重仓」的次数。你至少要答得出三句——它靠什么赚钱？最近几个季度有没有明显变差或变好？跟同赛道几家比，贵在哪、便宜在哪、口径一不一致？答不上来，就还没到谈仓位的时候。",
      "钱力股个股页里，公司简介、财报摘要、新闻，是按「先看清楚再谈感觉」摆的。我习惯顺序是：先扫公司在做什么（一句话业务），再看营收/利润是否同向，最后才打开估值字段。反过来——先盯 PE 再补故事——很容易被「低估」两个字拖进坑。",
      "财报季最容易上头。亮眼增速、超预期、指引上调，社交媒体会把情绪推得很满。这时更适合把摘要当线索：哪一项变了？是一次性项目还是主业？指引有没有收回？钱力股财报相关 Tab 能帮你少翻几页 PDF，但免费源常有估算与延迟，对不上时以公司官方披露为准，别和朋友圈截图较劲。",
      "同业对比比单看一只舒服。塞两到四家同赛道标的进分析页，看毛利率、增速、估值是不是「同一套尺子」。口径不一致时（有的用非 GAAP，有的含一次性收益），数字接近也可能在说不同的事。同业对比的用途是提问，不是证明「这只更该买」。",
      "几个我反复踩过的坑，写在这里省你一点学费：把高 PE 一律当成泡沫、把低 PE 一律当成便宜——周期股、亏损成长股、金融股，尺子本来就不同；只看一年暴增的利润，不看现金流与应收；把新闻标题里的「看好」当成基本面已经兑现。基本面慢，价格快，两者错位是常态，不是你没读懂的证明。",
      "和站内其他功能怎么接：看完公司与财报，若仍觉得「故事好听但位置很冲」，去 K 线问结构与位置（技术面另文）；若只是怕错过，先丢进自选、写一条价格提醒，把「失效位」写清楚，而不是许愿位。真金白银前，仓位工具只回答「这笔亏得起多少」，不会告诉你该不该买。",
      "练习不妨极简：挑一只你已经关注的票（别为了练专门找黑马），在钱力股打开个股 → 公司 → 财报 → 同业对比，用纸笔只记五条：业务一句话、最近变好/变差的证据、同业里最显眼的差异、你仍不懂的两点、若做错你准备认亏的比例。写得出来，基本面才算进了你的交易流程；写不出来，再多比率也只是屏幕上的装饰。",
      "最后留一句边界：本站行情与摘要供学习参考，不构成投资建议。基本面帮你降低无知下单的概率，不担保下一季一定兑现。能把「不知道」写进清单，本身就是进步。",
    ],
    "zh-TW": [
      "基本面不是堆滿 PE／PB 再爭論貴不貴。更實際的目標是減少「聽故事就重倉」：公司靠什麼賺錢？近幾季有沒有變差／變好？同賽道比起來貴在哪、口徑一不一樣？",
      "錢力股個股頁建議順序：公司在做什麼 → 營收／利潤是否同向 → 再看估值。財報摘要是線索，免費源可能有估算與延遲，對不上以官方揭露為準。",
      "同業對比放 2～4 家同賽道，用來提問，不是證明「這檔該買」。高／低 PE 不能一套尺子量所有產業。",
      "練習：打開個股 → 公司 → 財報 → 同業對比，只記五條——業務一句、近況證據、同業差異、不懂的兩點、虧得起的比例。寫得出來，基本面才進流程。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Fundamentals are not a contest over who can quote more PE and PB. The practical job for retail is fewer “story → size” jumps. Can you say what the company sells, whether the last few quarters got better or worse, and how it sits versus two to four peers on the same yardstick?",
      "On a Q-Stock symbol page I go company one-liner → revenue/profit direction → then valuation fields. Starting at PE and reverse-engineering a story is how “cheap” becomes a trap. Earnings tabs are clues; free feeds lag and estimate—official filings win arguments.",
      "Peer compare is for questions, not a buy ranking. Different industries need different rulers; one hot year of earnings without cash flow is a classic miss. Pair with charts only after the checklist; watchlist alerts should store invalidation, not wish prices. Position tools answer “how much can I lose,” never “should I buy.” Learning only—not advice.",
    ],
  },
};
