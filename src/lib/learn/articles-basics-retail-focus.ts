import type { LearnArticle } from "@/lib/learn/types";

/**
 * What retail investors should actually watch about a company —
 * a synthesis of checklist, three statements, and picking order.
 */
export const LEARN_ARTICLE_RETAIL_FOCUS: LearnArticle = {
  slug: "retail-company-focus",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "散户该盯企业什么：一张能用的关注清单",
    "zh-TW": "散戶該盯企業什麼：一張能用的關注清單",
    en: "What retail should watch in a company: a usable list",
  },
  summary: {
    "zh-CN": "信息、工具、时间都不如机构时，少而准比全而乱更重要。业务、近况、家底、同业、仓位五块就够入门。",
    "zh-TW": "資訊與工具不如機構時，少而準比全而亂重要。業務、近況、家底、同業、倉位五塊夠用。",
    en: "When you lack institutional bandwidth, a short list beats a noisy one: business, trajectory, balance sheet, peers, and size.",
  },
  paragraphs: {
    "zh-CN": [
      "散户和企业之间，天然不对等：对面有团队拆年报、建模型、盯供应链；你只有晚上两小时和一部手机。硬要「关注所有方面」，结果往往是什么都看一点、什么都没形成判断，最后仍被标题和涨跌幅推着下单。更老实的问法是：在信息不完整时，哪几块最能减少「无知重仓」？下面这张清单，是我从踩坑里收出来的，不是机构研报目录的缩写。",
      "一、业务一句话。公司靠什么赚钱、卖给谁、钱为什么会重复进来——答不上来，后面的比率都是空中楼阁。钱力股个股页先扫公司简介，逼自己用口语复述；复述时舌头打结，说明还没到谈估值的时候。细节可回《基本面怎么看》。",
      "二、近况方向，而不是单季神话。最近几季营收、利润是同向改善、恶化，还是各说各话？有没有显眼的一次性项目把净利润打扮得很漂亮？财报 Tab 的日历、实际对预期、利润率类指标，适合当灯号。灯号不等于买卖点：超预期可以情绪先行，数字只是事后注解。拆解见利润表专文与《三张表怎么串》。",
      "三、家底与现金含金量。利润好看时，现金进没进口袋？应收、存货是否在「垫」成绩单？短债与现金是否拧巴？这是资产负债表与现金流量表的事——散户不必会做分录，但要有「成绩单 vs 银行流水」的对质习惯。长期只信 EPS、不信流水，是我付过学费的路径。",
      "四、同业尺子，避免自我感动。单独看一只，很容易把平庸说成独特。分析页塞 2～4 家同赛道，问增速、利润率、估值是不是同一口径；有人口径爱用非 GAAP，并排时要打折。同业对比用来提问，不用来证明「这只最该买」。",
      "五、估值只当相对位置。PE、PB、市值是压缩后的结果，离开行业与增速会骗人。周期股、亏损成长、金融股，尺子本就不同。清单里的估值栏，回答的是「贵在哪、便宜在哪、我是否在用低估给冲动开脱」，不是给出目标价。",
      "六、仓位与失效——这才是散户真正的主场。机构比你强的是研究深度；你还能守住的是「亏得起多少、什么情况认错」。仓位工具算风险预算；提醒写失效位而非许愿价；拿不准先模拟；复盘记有没有又被标题带走。选股步骤文里的一票否决，在这里同样适用：业务或近况说不清，仓位为零。",
      "刻意少看的：短期热搜排名、群消息里的「内部」、把单根 K 线或金叉当企业质变、把 AI 读图结论直接当订单。AI 适合追问结构与「利润和现金是否同向」，交叉验证仍要回到财报摘要与官方披露。免费源有延迟与估算，对不上以官方为准。",
      "站内一条龙（可当作业）：个股 → 公司一句话 → 财报灯号 → 必要时空开资产负债/现金流专文对质 → 同业对比 → 自选备注「还盯什么」→ 提醒/仓位/模拟。整条走完仍写不出「若错了怎么办」，说明关注清单还停在浏览，没有进交易流程。",
      "边界：本站行情、摘要与工具仅供学习参考，不构成投资建议。散户关注企业，目标是少做无知的决定，不是变成全能分析师。能稳定执行上面五到六块，已经比「什么都关注一点」更接近长久。",
    ],
    "zh-TW": [
      "資訊不如機構時，少而準：業務一句、近況方向、家底與現金、同業尺子、估值相對位置、倉位與失效。",
      "錢力股路徑：公司簡介 → 財報 Tab 燈號 → 三表對質 → 同業對比 → 提醒／倉位／模擬。AI 只做交叉驗證。",
      "少看熱搜與喊單；免費源有延遲，以官方為準。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Retail lacks institutional bandwidth. Watch a short list: one-line business, trajectory (revenue/earnings direction, one-offs), balance-sheet and cash quality, peer yardsticks, valuation as relative position only, and size plus invalidation—your real home field.",
      "On Q-Stock: company blurb → earnings-tab lights → three-statement cross-check essays → peer compare → watchlist notes, alerts, position tool, paper, review. AI probes; filings win. Skip hot-list mythology. Learning only—not advice.",
    ],
  },
};
