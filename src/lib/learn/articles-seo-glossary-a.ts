import type { LearnArticle } from "@/lib/learn/types";
import {
  buildTermArticle,
  termBlocks,
  termFaq,
  termLinks,
} from "@/lib/learn/articles-seo-term-helpers";

/** Glossary batch A: valuation, risk, DCA/compound. */
export const LEARN_ARTICLES_SEO_GLOSSARY_A: LearnArticle[] = [
  buildTermArticle({
    slug: "term-pe-pb",
    ctaHref: "/analysis",
    titleEn: "PE / PB: what valuation multiples actually say",
    titleZh: "PE / PB 是什么：估值倍数怎么读",
    summaryEn:
      "PE and PB compress price versus earnings or book value. They are relative rulers—useless without industry, cycle, and peer context. Practice on the analysis page; learning only.",
    summaryZh:
      "PE、PB 把价格相对盈利或净资产压成倍数。离开行业、周期与同业，数字会骗人。到分析页做相对比较；仅供学习，非投资建议。",
    sections: termBlocks(
      [
        { type: "h2", text: "What they measure" },
        {
          type: "p",
          text: "PE asks how many years of current earnings the market is paying for. PB compares price to accounting equity. Both are snapshots, not forecasts.",
        },
        { type: "h2", text: "How to use them without worship" },
        {
          type: "ul",
          items: [
            "Same industry, similar stage—then compare.",
            "Ask whether earnings are one-off or cash-backed.",
            "Low PE is not automatically cheap; high PE is not automatically a bubble.",
          ],
        },
        { type: "h2", text: "Practice on Q-Stock" },
        {
          type: "p",
          text: "Open peer compare, line up 2–4 names, and write why the multiple differs. Pair with the three-statement essays before sizing.",
        },
      ],
      [
        { type: "h2", text: "它在量什么" },
        {
          type: "p",
          text: "PE（市盈率）问市场愿意为当前盈利付多少年；PB（市净率）把价格相对账面净资产。它们是快照，不是预测。",
        },
        { type: "h2", text: "怎么用不迷信" },
        {
          type: "ul",
          items: [
            "同行业、同阶段，再比倍数。",
            "问盈利是不是一次性、有没有现金支撑。",
            "低 PE 不等于便宜，高 PE 不等于泡沫。",
          ],
        },
        { type: "h2", text: "在钱力股怎么练" },
        {
          type: "p",
          text: "打开同业对比，放 2–4 只，写清倍数差异可能来自哪里。先读三张表，再谈仓位。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Is a PE under 10 always a buy?",
          a: "No. Cyclicals and value traps often print low PE before earnings fall.",
        },
        {
          q: "TTM or forward PE?",
          a: "Know which one you are using and keep peers on the same basis.",
        },
      ],
      [
        {
          q: "PE 低于 10 就该买吗？",
          a: "不。周期股与价值陷阱常在盈利下滑前显示很低的 PE。",
        },
        {
          q: "用静态还是预测 PE？",
          a: "先弄清口径，同业必须同一套尺子。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Analysis page", href: "/analysis" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "同业对比怎么用", href: "/learn/peer-compare" },
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "分析页", href: "/analysis" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-roe-roa",
    ctaHref: "/analysis",
    titleEn: "ROE / ROA: return on equity and assets",
    titleZh: "ROE / ROA：净资产与总资产收益率",
    summaryEn:
      "ROE and ROA describe accounting returns on equity or assets—not future price. Leverage can inflate ROE; read beside the balance sheet. Learning only.",
    summaryZh:
      "ROE、ROA 描述账面回报效率，不是未来涨跌。杠杆会抬高 ROE，要和资产负债表一起读。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Definitions" },
        {
          type: "p",
          text: "ROE = net income / equity. ROA = net income / assets. High ROE with thin equity and heavy debt differs from high ROE with a fortress balance sheet.",
        },
        { type: "h2", text: "Misreads" },
        {
          type: "ul",
          items: [
            "One hot year after buybacks or one-offs.",
            "Comparing banks to software on the same ROE target.",
            "Ignoring whether cash flow agrees with the income line.",
          ],
        },
      ],
      [
        { type: "h2", text: "定义" },
        {
          type: "p",
          text: "ROE＝净利润／净资产；ROA＝净利润／总资产。高杠杆撑起来的高 ROE，与厚家底的高 ROE，不是同一种生意。",
        },
        { type: "h2", text: "常见误读" },
        {
          type: "ul",
          items: [
            "回购或一次性项目抬出的单年 ROE。",
            "银行与软件用同一套 ROE 目标硬比。",
            "不管现金流是否跟利润同向。",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Is higher ROE always better?",
          a: "Only if capital structure and earnings quality are comparable.",
        },
      ],
      [
        {
          q: "ROE 越高越好吗？",
          a: "只有在资本结构与盈利质量可比时，更高才有意义。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "Analysis page", href: "/analysis" },
      ],
      [
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "资产负债表", href: "/learn/financials-balance-sheet" },
        { label: "同业对比", href: "/learn/peer-compare" },
        { label: "分析页", href: "/analysis" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-stop-loss",
    ctaHref: "/tools/position",
    titleEn: "Stop-loss: an invalidation price, not a wish",
    titleZh: "止损：失效价，不是许愿价",
    summaryEn:
      "A stop is the level where your thesis is wrong—wired to size and sleep. Round numbers are often crowd magnets, not your structure. Learning only.",
    summaryZh:
      "止损是「这套解读作废」的价位，要和仓位、睡眠质量绑在一起。整数关口常是大众焦点，未必是你的结构。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Write it before you click" },
        {
          type: "p",
          text: "Structure → levels → invalidation. If you cannot write the third sentence, you do not have a stop—you have hope.",
        },
        { type: "h2", text: "Size from the stop" },
        {
          type: "p",
          text: "Use the position tool: risk budget ÷ distance to stop ≈ size. Widening the stop without shrinking size quietly blows accounts up.",
        },
      ],
      [
        { type: "h2", text: "先写再点" },
        {
          type: "p",
          text: "结构 → 价位 → 失效。第三句写不出来，就还没有止损，只有希望。",
        },
        { type: "h2", text: "用止损反推仓位" },
        {
          type: "p",
          text: "仓位工具：风险预算 ÷ 到止损的距离 ≈ 数量。止损放宽却不减仓，是账户悄悄爆掉的常见路径。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Hard broker stop on every trade?",
          a: "Write invalidation first. Live stop mechanics depend on your broker.",
        },
      ],
      [
        {
          q: "每笔都要挂券商止损单吗？",
          a: "先写清失效。真实挂单方式以券商为准。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Risk & expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Position tool", href: "/tools/position" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "风险回报与期望", href: "/learn/risk-reward-expectancy" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-position-sizing",
    ctaHref: "/tools/position",
    titleEn: "Position sizing: lose what you can sleep with",
    titleZh: "仓位：先定亏得起，再算手数",
    summaryEn:
      "Size from a fixed risk fraction and the distance to invalidation—not from conviction theater. Run the numbers in /tools/position. Learning only.",
    summaryZh:
      "仓位由固定风险比例与到失效位的距离决定，不由「很有把握」的感觉决定。先在仓位工具里算清楚。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "The only math that matters first" },
        {
          type: "p",
          text: "Pick a max loss you can survive (often 0.5–2% of equity per idea). Divide by stop distance. That is size.",
        },
        {
          type: "note",
          text: "Correlated names stack risk—five “1%” bets in one theme are not 1%.",
        },
      ],
      [
        { type: "h2", text: "先算这笔" },
        {
          type: "p",
          text: "先定单笔亏得起的上限（常见是权益的 0.5–2%），再除以止损距离，得到数量。",
        },
        {
          type: "note",
          text: "同主题多笔会叠风险——五个「各 1%」不等于组合只亏 1%。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Size by how much I like it?",
          a: "No. Conviction without a risk budget turns drawdowns into crises.",
        },
      ],
      [
        {
          q: "可以按喜欢程度加仓吗？",
          a: "不建议。没有风险预算的信念，容易把回撤做成危机。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Stop-loss term", href: "/learn/term-stop-loss" },
        { label: "Risk & expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Position tool", href: "/tools/position" },
        { label: "Money traps", href: "/learn/money-traps-small-capital" },
      ],
      [
        { label: "止损词条", href: "/learn/term-stop-loss" },
        { label: "风险回报与期望", href: "/learn/risk-reward-expectancy" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "本金少先避坑", href: "/learn/money-traps-small-capital" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-dca",
    ctaHref: "/tools/dca",
    titleEn: "DCA: scheduled buying under assumptions",
    titleZh: "定投：按计划投入，假设不是承诺",
    summaryEn:
      "Dollar-cost averaging spreads purchases over time. It reduces timing drama; it does not guarantee profit. Stress-test in /tools/dca. Learning only.",
    summaryZh:
      "定投把买入拆到时间轴上，降低择时焦虑，但不保证盈利。到定投工具做压力测试。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "What DCA is for" },
        {
          type: "p",
          text: "A cash-flow habit for long-horizon buckets—not a license to ignore valuation, fees, or an emergency fund.",
        },
        { type: "h2", text: "Pair with lump-sum thinking" },
        {
          type: "p",
          text: "See the lump-sum vs DCA essay; both are assumptions. Pick the process you can keep.",
        },
      ],
      [
        { type: "h2", text: "定投解决什么" },
        {
          type: "p",
          text: "给长期桶一个可坚持的现金流习惯——不是无视估值、费用与应急金的通行证。",
        },
        { type: "h2", text: "和一次性投入对照" },
        {
          type: "p",
          text: "见「一次性与定投」一文；两者都是假设。选你能执行的流程。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Does DCA beat lump sum?",
          a: "Not always. It often wins on behavior and cash-flow fit, not on every backtest.",
        },
      ],
      [
        {
          q: "定投一定优于一次性吗？",
          a: "不。它常赢在行为与现金流匹配，不是每段回测都赢。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Lump sum vs DCA", href: "/learn/lump-sum-vs-dca" },
        { label: "DCA calculator", href: "/tools/dca" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Wealth-building process", href: "/learn/wealth-building-process" },
      ],
      [
        { label: "一次性与定投", href: "/learn/lump-sum-vs-dca" },
        { label: "定投计算器", href: "/tools/dca" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "财富积累过程", href: "/learn/wealth-building-process" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-compound",
    ctaHref: "/tools/compound",
    titleEn: "Compounding: time, contributions, and behavior",
    titleZh: "复利：时间、投入与行为",
    summaryEn:
      "Compounding multiplies contributions over time—fees, gaps, and panic break it. Treat calculator returns as scenarios, not forecasts. Learning only.",
    summaryZh:
      "复利放大的是持续投入与时间；费用、中断与恐慌会拆掉它。计算器里的报酬率是情景，不是预测。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "The boring inputs win" },
        {
          type: "ul",
          items: [
            "Contribution size and consistency",
            "Time horizon",
            "Costs and taxes",
            "Whether you stay invested through drawdowns",
          ],
        },
      ],
      [
        { type: "h2", text: "无聊的输入决定结果" },
        {
          type: "ul",
          items: [
            "投入金额与是否中断",
            "时间长度",
            "费用与税",
            "回撤时能不能待得住",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Reverse-engineer freedom from 15%?",
          a: "Dangerous. Stress lower returns first; see the freedom and compounding essays.",
        },
      ],
      [
        {
          q: "能用 15% 反推财富自由日期吗？",
          a: "危险。先用更保守假设压测；对照财富自由与复利行为文。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Compounding is hard", href: "/learn/mindset-compounding-hard" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
        { label: "DCA term", href: "/learn/term-dca" },
      ],
      [
        { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
        { label: "定投词条", href: "/learn/term-dca" },
      ],
    ),
  }),
];
