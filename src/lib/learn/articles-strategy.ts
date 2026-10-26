import type { LearnArticle } from "@/lib/learn/types";

/** Shared “how to click” steps — keep wording parallel across strategy tutorials. */
const OPS_ZH = [
  "一、打开规则实验室：顶部导航进入「规则实验室」，确认当前在「策略模板库」页签。",
  "二、找到并复制模板：在卡片上点「复制」（需登录）。复制成功后会进入「我的策略」里的可编辑副本。",
  "三、用积木改参数：策略详情里切到「积木」。改入场/出场卡片上的数字；不确定时切「代码」看 JSON 是否一致，再点上方「保存」。",
  "四、排队回放：右侧填写标的（如 AAPL / 指数代码）、市场与起止日期，点「排队回放」。等待状态变为完成后查看结果。",
  "五、读结果写笔记：对照权益曲线、买入持有、最大回撤、交易次数。只记三句：触发密不密、回撤能不能接受、自己会不会想改规则。",
] as const;

const OPS_TW = [
  "一、打開規則實驗室：進入「規則實驗室」→「策略模板庫」。",
  "二、複製模板：卡片上點「複製」（需登入），進入可編輯副本。",
  "三、積木改參數：詳情頁切「積木」改數字，必要時用「代碼」核對後儲存。",
  "四、排隊回放：右側填標的、區間 →「排隊回放」，完成後看結果。",
  "五、讀結果寫筆記：對照曲線、回撤、成交次數；只記觸發、回撤、會否改規則。",
] as const;

const OPS_EN = [
  "1) Open Rule Lab: go to Rule Lab → Strategy templates.",
  "2) Copy the template: tap Copy on the card (sign-in required) to get an editable draft under My strategies.",
  "3) Edit in Blocks: on the detail page use Blocks to change numbers; switch to Code to verify JSON, then Save.",
  "4) Queue replay: set symbol, market, and date range on the right → Queue replay; wait until finished.",
  "5) Read the report: equity vs buy&hold, max drawdown, trade count. Note three lines only: trigger density, drawdown tolerance, urge to bend the rule.",
] as const;

/** One tutorial per strategy template — linked from 规则实验室「学习策略». */
export const LEARN_ARTICLES_STRATEGY: LearnArticle[] = [
  {
    slug: "strategy-lab-intro",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "规则实验室入门：从模板到回放",
      "zh-TW": "規則實驗室入門：從模板到回放",
      en: "Rule Lab intro: from template to replay",
    },
    summary: {
      "zh-CN": "弄清模板库、我的策略与回放怎么串起来；按图示五步走完第一遍闭环。",
      "zh-TW": "弄清模板庫、我的策略與回放怎麼串起來；按圖示五步走完第一遍閉環。",
      en: "How templates, My strategies, and replay connect—finish one loop with the five-step mock UI.",
    },
    paragraphs: {
      "zh-CN": [
        "规则实验室不是荐股榜，也不是自动下单系统。它帮你把「什么条件开仓、什么条件离场、仓位怎么定」写成可检查的规则，再在历史日 K 上做简化回放，看看触发密不密、回撤能不能接受。目的是练计划与纪律，不是找收益最高的曲线。",
        "界面三块要先分清：左侧「我的策略」是你复制或新建后的草稿；中间「策略模板库」是内置教学模板；「回测历史」汇总你排过的回放任务。侧栏底部的本篇，就是专为第一次走进实验室写的总览。",
        "上方示意图对应真实点击路径。请先通读五格，再严格按下列步骤做完一遍；做完后再去点某个模板卡片上的「学习策略」，读该模板的专题说明。",
        "一、进入实验室：顶部导航打开「规则实验室」，确认页签在「策略模板库」。可先浏览卡片上的标签（趋势、风险、定投等）与适用市场，挑一个难度★较少的模板。",
        "二、复制模板：登录后点卡片「复制」。系统会生成「×× (copy)」进「我的策略」。不要直接改系统模板——模板只读，练习一律在副本上改。",
        "三、看懂积木与代码：打开副本详情。默认「积木」可改入场、出场、仓位卡片；「代码」显示同一套规则 JSON，两边保存前会校验。改完务必点上方「保存」。",
        "四、跑一条回放：右侧填标的（如熟悉的大盘股或指数代码）、市场与日期区间，点「排队回放」。注意每日次数上限；完成后看权益曲线、买入持有对照、最大回撤与成交明细。",
        "五、写三句笔记再离开：① 这段历史里规则触发算密还是稀？② 回撤你能不能接受？③ 有没有想中途改规则的冲动？想改就开新版本再回放，不要边看结果边推翻原计划却不留痕迹。",
        "进阶用法：用「新建策略」从空白草稿起步；或在积木里加减条件，体会「且」入场与「先触先出」出场。个股页的「计划」也可以挂策略标签，但回放与改规则仍以实验室为准。",
        "务必记住：回放用简化成交假设，不计完整真实摩擦与情绪；历史表现不代表未来，内容仅供学习，不构成投资建议。准备好后，点下方按钮回到规则实验室开始第一份副本。",
      ],
      "zh-TW": [
        "規則實驗室用來寫清開倉／離場／倉位，並做簡化歷史回放，不是薦股或自動下單。",
        "分清「我的策略」「策略模板庫」「回測歷史」。請先看上方五格示意，再依步驟操作。",
        "一、進入實驗室並選一張簡單模板。",
        "二、登入後「複製」成可編輯副本，不要改系統模板。",
        "三、在「積木／代碼」改規則並儲存。",
        "四、右側排隊回放，看曲線、回撤與成交。",
        "五、寫三句筆記：觸發密度、回撤能否接受、會否想改規則。",
        "回放≠未來收益；僅供學習，非投資建議。",
      ],
      en: [
        "Rule Lab is for writing checkable entry, exit, and sizing rules, then running a simplified daily-bar replay. It is not a tip sheet or an auto-trader. The goal is discipline and risk awareness—not the prettiest equity curve.",
        "Three areas: My strategies (your copies/drafts), Strategy templates (built-in lessons), and Replay history. This article is the lab overview linked from the sidebar.",
        "Study the five-panel mock UI above, then follow the steps once before opening a per-template “Learn strategy” article.",
        "1) Open Rule Lab → Strategy templates. Pick a low-difficulty card.",
        "2) Sign in and Copy. You get an editable “×× (copy)” under My strategies. System templates stay read-only.",
        "3) On the detail page use Blocks (or Code) to edit rules, then Save.",
        "4) Queue a replay with symbol, market, and range. Read equity vs buy&hold, drawdown, and trades when done.",
        "5) Write three notes: trigger density, drawdown tolerance, urge to bend the rule. Version changes instead of silently rewriting mid-review.",
        "Replay uses simplified fills. Educational only—not advice. Return to Rule Lab when ready for your first copy.",
      ],
    },
  },
  {
    slug: "strategy-ma-cross",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "双均线交叉：学滞后，而不是学「圣杯」",
      "zh-TW": "雙均線交叉：學滯後，而不是學「聖杯」",
      en: "MA crossover: learn lag, not a holy grail",
    },
    summary: {
      "zh-CN": "金叉开多、死叉平仓——重点是体会趋势信号的滞后与震荡磨损。按下面五步在规则实验室亲手跑一遍。",
      "zh-TW": "金叉開多、死叉平倉——重點是體會滯後與震盪磨損；請依操作步驟練習。",
      en: "Golden cross in, death cross out—study lag and chop. Follow the in-app steps below.",
    },
    paragraphs: {
      "zh-CN": [
        "双均线交叉是入门最常见的趋势规则：短均线上穿长均线（金叉）考虑开多，下穿（死叉）考虑平仓。模板默认 10 / 20 日，可在积木里改。它教的不是「必涨」，而是信号天然滞后，以及震荡市里来回交叉的磨损。",
        "上方示意图对应钱力股真实入口：模板库 → 复制 → 积木改参 → 回放 → 读报告。请对照图中五步操作，不要只读概念。",
        ...OPS_ZH,
        "积木里重点看：入场「均线交叉」快慢周期与「上穿」；出场同周期「下穿」。保存后再回放，避免改了没存。",
        "回放时盯三件事：交叉触发频率、假突破后的回撤、横盘连续小亏。把「看起来很稳」和「实际交易次数」对照。",
        "常见误区：把参数优化到历史最好看当圣杯；或忽略仓位——信号再漂亮，满仓一笔回撤也能打崩纪律。",
        "规则回放是简化日 K 假设，仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "短均線金叉開多、死叉平倉。重點是滯後與震盪磨損，請對照上方示意五步操作。",
        ...OPS_TW,
        "積木改快慢週期後務必儲存再回放。歷史回放 ≠ 未來收益。",
      ],
      en: [
        "Classic trend rule: short MA crossing above long MA to enter; cross below to exit. Defaults like 10/20 are starting points. The lesson is lag and chop wear—not a guaranteed edge.",
        "The diagram above maps to the real product: templates → copy → Blocks → replay → report. Do the clicks, don’t only read theory.",
        ...OPS_EN,
        "In Blocks, focus on MA cross periods and up/down direction for entry and exit. Save before replaying.",
        "Educational only—not advice. Replay ≠ future returns.",
      ],
    },
  },
  {
    slug: "strategy-break-stop",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "突破 + 止损：先定「亏得起」，再谈追高",
      "zh-TW": "突破 + 止損：先定「虧得起」，再談追高",
      en: "Breakout + stop: budget the loss before the chase",
    },
    summary: {
      "zh-CN": "创 N 日新高买入，并用固定比例止损——练风险预算。请按示意图五步在规则实验室跑通。",
      "zh-TW": "創 N 日新高買入並設固定止損；請依示意步驟練習。",
      en: "N-day high entry with a fixed % stop—practice risk budget via the steps below.",
    },
    paragraphs: {
      "zh-CN": [
        "突破规则很直观：价格创近 N 日新高考虑入场；入场价下方固定百分比止损，把单笔亏损框进预算。默认常见 20 日高点与约 5% 止损，可在积木改。假突破被扫止损是成本的一部分，不等于「策略坏了」。",
        "先看上方「怎么练」示意图，再按下列步骤点一遍；仓位模式若是风险百分比，还可打开「仓位计算工具」对照。",
        ...OPS_ZH,
        "积木重点：入场「突破新高」的回看天数 N；出场「止损 %」。改完保存，用同一标的回放两三次，只改 N 或只改止损，观察交易次数与回撤如何变。",
        "常见误区：止损太宽一笔亏掉多日盈利；或盘中把止损越挪越远等于没有规则。",
        "教育用途，不构成投资建议。",
      ],
      "zh-TW": [
        "新高入場 + 固定比例止損，用來練風險預算。請對照上方示意操作。",
        ...OPS_TW,
        "積木改 N 與止損%後儲存再回放。假突破被掃是成本的一部分。",
      ],
      en: [
        "Enter on an N-day high; place a fixed % stop under entry. Fakeouts that hit the stop are part of the cost—not proof the idea is broken.",
        "Use the walkthrough diagram, then follow the steps. If sizing is risk %, open the position tool alongside.",
        ...OPS_EN,
        "In Blocks, edit lookback N and stop %. Save, then change one knob at a time across replays.",
        "Educational only—not advice.",
      ],
    },
  },
  {
    slug: "strategy-dca-fixed",
    category: "tools",
    ctaHref: "/tools/dca",
    title: {
      "zh-CN": "定额定投：平滑成本，不是收益承诺",
      "zh-TW": "定額定投：平滑成本，不是收益承諾",
      en: "Fixed DCA: smooth cost—not a return promise",
    },
    summary: {
      "zh-CN": "固定周期定额买入——练纪律与成本摊平。按示意图在规则实验室操作，并可对照定投计算器。",
      "zh-TW": "固定週期定額買入；請依示意步驟練習，並可對照定投計算器。",
      en: "Fixed notional on a fixed cadence—practice averaging. Follow the steps; try the DCA calculator too.",
    },
    paragraphs: {
      "zh-CN": [
        "定额定投每隔固定交易日买入固定金额，不管涨跌执行同一动作。模板用于体会机械买入与一次性择时的差异，不是「定投一定赚钱」。",
        "上方示意图说明从模板到回放的路径；也可先打开站内「定投」工具用指数参数试算，再回规则实验室看触发节奏。",
        ...OPS_ZH,
        "积木/约束里关注：买入间隔（冷却根数）与每笔金额。回放时对照「同一区间一次性投入 vs 分批」的成本与回撤感受。",
        "常见误区：无上限「跌了更要加」；或在高杠杆品种上机械加仓。",
        "教育用途，不构成投资建议。",
      ],
      "zh-TW": [
        "固定週期、固定金額買入，用來理解攤平與紀律。請對照示意操作。",
        ...OPS_TW,
        "可同時打開定投計算器對照。歷史路徑 ≠ 未來表現。",
      ],
      en: [
        "Fixed DCA buys the same notional every N bars. The lesson is averaging and cadence—not a promise of profit.",
        "Follow the diagram steps; optionally try the DCA calculator on a broad index first.",
        ...OPS_EN,
        "Watch cooldown and notional in Blocks. Compare lump-sum vs paced buys over the same window.",
        "Educational only—not advice.",
      ],
    },
  },
  {
    slug: "strategy-invalidation",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "失效价出场：承认「计划作废」的那条线",
      "zh-TW": "失效價出場：承認「計畫作廢」的那條線",
      en: "Invalidation exit: the line that voids the plan",
    },
    summary: {
      "zh-CN": "突破入场后，跌破预设失效价就出场。请按示意图完成复制 → 改失效价 → 回放。",
      "zh-TW": "突破入場後跌破失效價出場；請依示意完成操作。",
      en: "After breakout entry, exit when price breaches invalidation—follow the click path below.",
    },
    paragraphs: {
      "zh-CN": [
        "失效价通常来自结构（区间下沿、关键支撑），是事先承认「叙事作废」的价位，不是随便写的百分比。模板用突破入场 + 价格水平出场，把冷静情景里的失效写成可回放规则。",
        "对照上方五步示意操作。模板里的失效价是示例数字，复制后务必改成你研究标的上事先画好的线。",
        ...OPS_ZH,
        "积木重点：出场「价格水平」的比较符（≤ / ≥）与价格。改完保存再回放；观察自己是否想在回放里「偷偷改线」。",
        "常见误区：失效设在几乎不能回踩的位置被噪声扫出；或触发后立刻报复反手。",
        "教育用途，不构成投资建议。",
      ],
      "zh-TW": [
        "失效價來自結構，不是隨便的百分比。複製後請改成你自己的線，再回放。",
        ...OPS_TW,
        "觸發後先停手複核，不要報復單。",
      ],
      en: [
        "Invalidation is usually structural—the price that voids your narrative. The template pairs breakout entry with a level exit.",
        "Follow the walkthrough. Replace the sample level with a line you marked in advance.",
        ...OPS_EN,
        "In Blocks, edit the price-level op and value. Notice the urge to move the line after the fact.",
        "Educational only—not advice.",
      ],
    },
  },
  {
    slug: "strategy-time-exit",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "持有 N 日必出：用时间约束死扛",
      "zh-TW": "持有 N 日必出：用時間約束死扛",
      en: "Time exit: a clock against “holding forever”",
    },
    summary: {
      "zh-CN": "均线入场后，持有固定天数强制了结。下面有界面示意与逐步点击说明，请照着练。",
      "zh-TW": "均線入場後持有固定天數強制了結；請依示意與步驟練習。",
      en: "After an MA entry, force flat after N bars. Use the mock UI and numbered clicks below.",
    },
    paragraphs: {
      "zh-CN": [
        "很多人会开仓，却很难说清何时结束：盈利时想再等等，亏损时想再扛扛。时间出场把「最多持有 N 根 K」写成硬规则——到点就平。它不保证卖在最高点，但保证你有一个默认退出时钟。模板常见组合：均线上穿开多，持有约 20 个交易日（可调）后出场。",
        "请先看文章上方的五格示意图：它对应规则实验室里「模板 → 复制 → 积木改 N → 回放 → 看曲线」的真实路径。然后严格按下列步骤点一遍，不要跳步。",
        ...OPS_ZH,
        "积木里本策略关键旋钮：出场卡片选「持有 N 根K」，把数字改成你想练的天数（例如 10 / 20 / 40）。入场保持均线上穿即可。每次只改一个 N，保存后再点回放，方便对比。",
        "对比练法：同一标的、同一区间，先用「仅均线死叉出场」的思路（可另开双均线模板）回放一次，再用本模板的时间出场回放一次。笔记只写：哪些拖死段落被截断了？哪些强趋势里过早下车？你的死扛通常发生在第几天？",
        "常见误区：N 设得极短变成噪声；或强趋势里到期就「无理由再开」，用时间规则掩盖加仓冲动。到期若要再开，需要新的结构理由，而不是惯性。",
        "规则回放基于简化日 K 与成交假设，仅供学习，不构成投资建议；历史表现不代表未来。",
      ],
      "zh-TW": [
        "時間出場把「最多持有 N 根 K」写成硬規則。請先看上方五格示意，再依步驟操作。",
        ...OPS_TW,
        "積木裡把出場改成「持有 N 根K」並只改一個 N 再回放。對照均線出場，記錄拖死段落與過早下車。",
        "N 別太短；到期再開需要新的結構理由。僅供學習，非投資建議。",
      ],
      en: [
        "A time exit forces flat after N bars so hope is not an open-ended hold. Common pairing: MA cross up, exit after ~20 bars. You will miss some trends and cut some slow-bleed holds—log both.",
        "Study the five-panel mock UI above (templates → copy → Blocks → replay → report), then follow the clicks in order.",
        ...OPS_EN,
        "In Blocks, set the exit card to Hold N bars and change only N between runs (10 / 20 / 40). Keep the MA entry fixed.",
        "Compare against an MA-only exit on the same symbol and range. Ask which day your holds usually go stale.",
        "Educational only—not advice. Replay ≠ future returns.",
      ],
    },
  },
  {
    slug: "strategy-risk-sized",
    category: "tools",
    ctaHref: "/tools/position",
    title: {
      "zh-CN": "风险定仓：用「亏得起」反推买多少",
      "zh-TW": "風險定倉：用「虧得起」反推買多少",
      en: "Risk-sized entry: size from what you can lose",
    },
    summary: {
      "zh-CN": "按权益风险%与止损距估算仓位。请按示意图操作，并打开仓位工具对照。",
      "zh-TW": "按權益風險%與止損距估算倉位；請依示意操作並對照倉位工具。",
      en: "Size from equity risk % and stop distance—follow the steps and the position tool.",
    },
    paragraphs: {
      "zh-CN": [
        "风险定仓先定「这笔最多亏权益的百分之几」，再结合止损距离反推可买数量，并受单标上限约束。模板把入场信号与风险百分比仓位绑在一起，逼你先想亏损再想收益。",
        "上方示意是规则实验室路径；同时建议新开一页打开「仓位计算工具」，用同一权益与风险%试不同止损距。",
        ...OPS_ZH,
        "积木重点：仓位模式选「风险百分比」，核对风险%与出场止损%。止损越远，可买应越少——回放时看名义仓位是否真按此收缩。",
        "常见误区：先拍「买 1000 股」再倒推止损；或忽略多笔相关持仓的风险叠加。",
        "教育用途，不构成投资建议。",
      ],
      "zh-TW": [
        "先定虧得起的權益%，再依止損距反推數量。請對照示意與倉位工具。",
        ...OPS_TW,
        "止損越遠，可買應越少。别先拍股數。",
      ],
      en: [
        "Pick a max loss as % of equity, divide by stop distance, cap by max position %. Loss language comes before upside dreams.",
        "Follow the Rule Lab walkthrough and open the position tool with the same inputs.",
        ...OPS_EN,
        "In Blocks, use risk-percent sizing and check that wider stops shrink size in replay.",
        "Educational only—not advice.",
      ],
    },
  },
];
