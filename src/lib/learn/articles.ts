import { defaultLocale, type AppLocale } from "@/i18n/config";

export type LearnArticle = {
  slug: string;
  /** i18n key under learn.categories.* */
  category: "basics" | "tools" | "mindset";
  title: Partial<Record<AppLocale, string>> & { en: string; "zh-CN": string };
  summary: Partial<Record<AppLocale, string>> & { en: string; "zh-CN": string };
  paragraphs: Partial<Record<AppLocale, string[]>> & {
    en: string[];
    "zh-CN": string[];
  };
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "calm-watching",
    category: "mindset",
    title: {
      "zh-CN": "冷静看盘：先看结构，再谈感觉",
      "zh-TW": "冷靜看盤：先看結構，再談感覺",
      en: "Calm watching: structure before feelings",
    },
    summary: {
      "zh-CN": "少刷屏、少追热点：用价位与失效条件约束冲动。",
      "zh-TW": "少刷屏、少追熱點：用價位與失效條件約束衝動。",
      en: "Fewer refreshes, less chase—anchor on levels and invalidation.",
    },
    paragraphs: {
      "zh-CN": [
        "看盘容易被涨跌颜色和短讯带着跑。更稳的做法是先问三件事：现在处在什么结构（趋势、震荡、还是破位后的混乱）？关键价位在哪里？什么情况会推翻你原先的判断？",
        "钱力股的 AI 读图与情景推演也按这个顺序组织：结构 → 关键位 → 失效条件。它们是学习辅助，不是买卖指令。",
        "实操建议：把「失效条件」写进提醒或笔记。价格打到该线，先停手复核，而不是加仓证明自己正确。",
      ],
      "zh-TW": [
        "看盤容易被漲跌顏色和短訊帶著跑。更穩的做法是先問三件事：現在處在什麼結構？關鍵價位在哪裡？什麼情況會推翻原先判斷？",
        "錢力股的 AI 讀圖與情景推演也按這個順序：結構 → 關鍵位 → 失效條件。它們是學習輔助，不是買賣指令。",
        "實操建議：把失效條件寫進提醒或筆記。價格打到該線，先停手複核，而不是加倉證明自己正確。",
      ],
      en: [
        "Quotes and headlines pull hard. Ask three things first: what structure are we in, where are the levels, and what would invalidate the read?",
        "Q-Stock’s AI chart and scenario tools follow the same order: structure → levels → invalidation. They are study aids, not order tickets.",
        "Practice: put invalidation into an alert or note. When price hits it, pause and re-check—don’t double down to prove yourself right.",
      ],
    },
  },
  {
    slug: "peer-compare",
    category: "tools",
    title: {
      "zh-CN": "同业对比怎么用",
      "zh-TW": "同業對比怎麼用",
      en: "How to use peer compare",
    },
    summary: {
      "zh-CN": "同一行业里挑 2–4 只股票，并排看估值与财务要点。",
      "zh-TW": "同一行業裡挑 2–4 隻股票，並排看估值與財務要點。",
      en: "Pick 2–4 names in one industry and line up valuation basics.",
    },
    paragraphs: {
      "zh-CN": [
        "对比的价值在「同一语境」。先在榜单或行业里锁定赛道，再勾选 2–4 只股票，看市值、PE/PB、利润率、负债等是否处在合理区间——而不是跨行业硬比。",
        "部分绝对金额（如营收、总资产）在免费数据源上可能是估算值，页面会标明口径。把它当作核对线索，而不是精确财报替代品。",
        "做完对比，回到个股 K 线与新闻，看估值差异是否已被市场定价，或只是数据缺失造成的错觉。",
      ],
      "zh-TW": [
        "對比的價值在「同一語境」。先鎖定賽道，再勾選 2–4 隻股票，看市值、PE/PB、利潤率、負債等——而不是跨行業硬比。",
        "部分絕對金額在免費資料源上可能是估算值，頁面會標明口徑。把它當作核對線索，而非精確財報替代品。",
        "做完對比，回到個股 K 線與新聞，看估值差異是否已被定價，或只是資料缺失造成的錯覺。",
      ],
      en: [
        "Compare inside one context. Lock an industry, pick 2–4 names, and scan mkt cap, PE/PB, margins, and leverage—don’t force cross-sector matches.",
        "Some absolute figures from free feeds may be estimates; the UI labels that. Treat them as clues, not a filing replacement.",
        "After compare, return to the chart and news: is the gap priced in, or just a data hole?",
      ],
    },
  },
  {
    slug: "paper-review",
    category: "basics",
    title: {
      "zh-CN": "模拟交易与复盘笔记",
      "zh-TW": "模擬交易與複盤筆記",
      en: "Paper trading and review notes",
    },
    summary: {
      "zh-CN": "用模拟仓位练流程，用复盘看见情绪与下次清单。",
      "zh-TW": "用模擬倉位練流程，用複盤看見情緒與下次清單。",
      en: "Practice process with paper; review notes surface emotion and next checks.",
    },
    paragraphs: {
      "zh-CN": [
        "模拟不是为了「虚拟赚钱」，而是把下单、持仓、止损提醒走通，同时降低真金白银的情绪干扰。",
        "复盘笔记适合固定问：今天做得好的是什么？哪里冲动了？下次清单三条即可。钱力股可基于模拟成交生成摘要，仍需你自己确认是否属实。",
        "建议节奏：少而认真的模拟单 + 每周一次复盘，比每天几十次点点点更有用。",
      ],
      "zh-TW": [
        "模擬不是為了「虛擬賺錢」，而是把下單、持倉、止損提醒走通，同時降低真金白銀的情緒干擾。",
        "複盤筆記適合固定問：今天做得好的是什麼？哪裡衝動了？下次清單三條即可。",
        "建議節奏：少而認真的模擬單 + 每週一次複盤，比每天幾十次點點點更有用。",
      ],
      en: [
        "Paper trading is for process—entries, holds, stop alerts—with less real-money heat.",
        "Review notes work with fixed prompts: what went well, where was impulse, three items for next time. Auto summaries still need your judgment.",
        "Rhythm beats volume: a few serious paper trades plus a weekly review beat dozens of taps a day.",
      ],
    },
  },
];

export function listLearnArticles() {
  return LEARN_ARTICLES;
}

export function getLearnArticle(slug: string) {
  return LEARN_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function learnText<T extends string | string[]>(
  locale: string,
  map: Partial<Record<AppLocale, T>> & { en: T; "zh-CN": T },
): T {
  const loc = locale as AppLocale;
  if (map[loc] != null) return map[loc] as T;
  if (loc.startsWith("zh") && map["zh-CN"] != null) return map["zh-CN"];
  if (loc === "zh-TW" && map["zh-TW"] != null) return map["zh-TW"] as T;
  return map.en ?? map[defaultLocale as AppLocale] ?? map["zh-CN"];
}
