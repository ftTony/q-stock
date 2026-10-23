import type { LearnArticle } from "@/lib/learn/types";

/** Balance sheet — assets, liabilities, and what “strong book” really means. */
export const LEARN_ARTICLE_FINANCIALS_BALANCE: LearnArticle = {
  slug: "financials-balance-sheet",
  category: "basics",
  ctaHref: "/analysis",
  title: {
    "zh-CN": "资产负债表：家底、欠账与别只看总资产",
    "zh-TW": "資產負債表：家底、欠帳與別只看總資產",
    en: "Balance sheet: assets, debts, and why totals mislead",
  },
  summary: {
    "zh-CN": "资产负债表是某一天的快照。现金与债务结构、应收与存货质量，往往比「总资产很大」更重要。",
    "zh-TW": "資產負債表是某一時點快照。現金、債務、應收與存貨質量，比總資產數字更關鍵。",
    en: "A point-in-time snapshot. Cash, leverage, receivables, and inventory quality beat a fat total-asset line.",
  },
  paragraphs: {
    "zh-CN": [
      "资产负债表常被当成「公司有多有钱」的成绩单，其实它更像某一天晚上的家庭收支盘点：左边列出你拥有的（资产），右边列出你欠的（负债）和真正属于股东的部分（权益）。同一天、同一套会计规则下，左右必须平衡——这不是玄学，是定义。散户不必会做分录，但要习惯问：这个「有」有多容易变成现金？这个「欠」有多快要还？",
      "资产侧，我习惯先抓流动性，再抓质量。货币资金与短期投资：打仗用的子弹。应收款项：货卖了、钱还没收回，涨太快时要回利润表问是不是在赊销冲量。存货：有的行业正常，有的行业一堆货等于未来打折。长短期投资、商誉、无形资产：扩张与并购留下的痕迹，减值来时利润表会疼。总资产很大，可能只是商誉和应收堆出来的「虚胖」——所以别只截总资产一行发朋友圈。",
      "负债与权益侧，重点是期限与约束。短期借款、一年内到期的长期负债、应付账款：近端压力。长期负债：利率与契约条款你在摘要里未必看全，但「有息负债相对现金与经营现金流」的直觉要有。所有者权益被利润累积、分红、回购、增发反复改写——利润表赚到的，最终常常落到这里；现金分红则同时动现金与权益。把权益当成「永远安全垫」会误事，尤其是高杠杆行业。",
      "和利润表、现金流量表的咬合，是这张表真正的价值。利润很好、应收与存货同步暴涨：成绩单可能在赊账。现金减少、有息负债上升：要问在扩产还是在补窟窿。回购猛、现金薄、负债升：可能是在用杠杆抬 EPS，短好看、长更脆。三张表对质的习惯，比背「流动比率标准值」有用。",
      "钱力股不会把完整资产负债科目树都铺在页面上——零售终端也不是年报阅读器。你在财报 Tab 里更常碰到的是压缩指标与市值、以及和利润相关的率（ROE、ROA 等会用到权益与资产）。它们是灯号：ROE 很高时，要想是利润强还是杠杆高；市净率要把「净资产质量」放进脑子，而不是只比数字大小。要细节，仍以官方年报/季报为准；免费源的指标可能估算或滞后。",
      "同业对比特别适合资产负债表直觉。分析页并排 2～4 家时，不必先比谁总资产更大，可先问：谁现金更厚？谁短债更紧？谁商誉更吓人？口径不一致时并排会骗人，所以对比的用途是提问，不是排名「最健康」。基本面清单里的「仍不懂的两点」，很多其实落在资产质量与或有负债上——写下来，比装作看懂更安全。",
      "练习：选一只你盯着的票，打开财报与同业对比，只记四条——此刻我最关心的资产项；最担心的负债项；若利润表继续好看，资产负债表哪里可能先裂；做错时的仓位上限。然后再读现金流专文，看经营现金能不能撑住你的担心。本站内容仅供学习参考，不构成投资建议。",
    ],
    "zh-TW": [
      "資產負債表是某一時點盤點：資產＝負債＋權益。先問「有」多快變現、「欠」多快要還，別只截總資產。",
      "應收、存貨、商譽常造成虛胖；短債與有息負債看近端壓力。利潤好但應收暴漲、現金掉、負債升，要三表對質。",
      "錢力股財報指標是燈號（如 ROE／市淨）；細節以官方為準。同業對比用來提問家底質量。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "The balance sheet is a night-time inventory: assets versus liabilities plus equity. Ask how fast assets become cash and how soon debts come due—fat total assets can be receivables, inventory, or goodwill bloat.",
      "Q-Stock surfaces compressed metrics (ROE, PB, market cap) as dashboard lights, not a full line-item reader—filings still rule. Peer compare to ask who holds more cash or tighter short debt, not who “wins” size. Cross-check the P&L and cash flow when earnings look fine but the balance sheet fattens. Learning only—not advice.",
    ],
  },
};
