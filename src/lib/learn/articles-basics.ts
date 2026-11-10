import { LEARN_ARTICLE_FUNDAMENTALS } from "@/lib/learn/articles-basics-fundamentals";
import { LEARN_ARTICLE_FINANCIALS_BALANCE } from "@/lib/learn/articles-basics-financials-balance";
import { LEARN_ARTICLE_FINANCIALS_CASHFLOW } from "@/lib/learn/articles-basics-financials-cashflow";
import { LEARN_ARTICLE_FINANCIALS_INCOME } from "@/lib/learn/articles-basics-financials-income";
import { LEARN_ARTICLE_FINANCIALS_OVERVIEW } from "@/lib/learn/articles-basics-financials-overview";
import { LEARN_ARTICLE_INDICATORS } from "@/lib/learn/articles-basics-indicators";
import { LEARN_ARTICLE_PICKING } from "@/lib/learn/articles-basics-picking";
import { LEARN_ARTICLE_RETAIL_FOCUS } from "@/lib/learn/articles-basics-retail-focus";
import { LEARN_ARTICLES_MERGED_CANDLES } from "@/lib/learn/articles-merged-candles";
import { LEARN_ARTICLES_MERGED_TREND } from "@/lib/learn/articles-merged-trend";
import { LEARN_ARTICLES_MERGED_VOLATILITY } from "@/lib/learn/articles-merged-volatility";
import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/**
 * Basics articles — deep sections version.
 *
 * 2026-11 consolidation: five ~900-char candle pages became
 * `candle-reversal-patterns`; the five indicator pages became
 * `indicator-trend-momentum` (MA + MACD) and `indicator-volatility-toolkit`
 * (RSI + Bollinger + ATR). Sixteen thin pages competing for the same
 * long-tail queries now resolve to three pages with real depth.
 */
export const LEARN_ARTICLES_BASICS: LearnArticle[] = [
  LEARN_ARTICLE_RETAIL_FOCUS,
  LEARN_ARTICLE_PICKING,
  LEARN_ARTICLE_FUNDAMENTALS,
  LEARN_ARTICLE_FINANCIALS_OVERVIEW,
  LEARN_ARTICLE_FINANCIALS_INCOME,
  LEARN_ARTICLE_FINANCIALS_BALANCE,
  LEARN_ARTICLE_FINANCIALS_CASHFLOW,
  LEARN_ARTICLE_INDICATORS,
  ...LEARN_ARTICLES_MERGED_CANDLES,
  ...LEARN_ARTICLES_MERGED_TREND,
  ...LEARN_ARTICLES_MERGED_VOLATILITY,
  {
    slug: "paper-review",
    category: "basics",
    ctaHref: "/review",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Paper trading and review notes",
      "zh-CN": "模拟交易与复盘笔记",
    },
    summary: {
      en: "Paper rehearses process; review exposes emotion and hands you a short list. Rhythm beats volume, and honesty beats both.",
      "zh-CN":
        "模拟练流程，复盘练诚实。少而认真胜过天天点点点，执行率比收益曲线更能说明问题。",
    },
    paragraphs: {
      en: [
        "Paper trading is a rehearsal room, not a vanity equity curve. Its only real value: run the process until it is boring, and leave review something honest to inspect.",
      ],
      "zh-CN": [
        "模拟盘最容易被玩成「虚拟赚钱游戏」：曲线要好看、胜率要漂亮，唯独下单流程没人管。真金一上场，情绪两分钟打回原形。说白了，模拟盘花的不是钱，是注意力——它的价值只有一个：把流程彩排熟，并给复盘留下能看的材料。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In Q-Stock the two pieces sit side by side: /portfolio runs the paper fills, /review holds the notes. Fills and notes land on the same page, so writing nothing but a mood is harder to get away with.",
        },
        {
          type: "p",
          text: "Random taps teach bad habits at expert speed. Before any paper order, write four lines into the note. On a real account, you would not skip a single one.",
        },
        { type: "h2", text: "Paper like it is real money" },
        {
          type: "table",
          head: ["Note item", "What to write", "Example (all hypothetical)"],
          rows: [
            ["Structure", "The read behind the trade", "Pullback near range top, 20-21.5 band"],
            ["Risk budget", "Max loss as % of account", "100k account, 1% per trade = 1,000"],
            ["Invalidation", "What kills the thesis", "Close below 19.4, range read is void"],
            ["Size", "Shares and weight", "Backed out from the position calculator"],
          ],
          caption:
            "If a line is embarrassing to write, that is the line you were about to skip on real money.",
        },
        {
          type: "p",
          text: "A hypothetical example: account 100,000, risk 1% per trade = 1,000. Entry around 20.5, invalidation 19.4, risk per share about 1.1. Size cap = 1,000 / 1.1 ≈ 900 shares, roughly 18,000 in notional—far smaller than the half-account most people eyeball. Do this in /tools/position, not in your head at midnight; /tools/risk-reward adds the expectancy view if you want it.",
        },
        { type: "h2", text: "Review in three lines" },
        {
          type: "ul",
          items: [
            "What the plan said vs what I did—the gap between those two lines is your real P&L source.",
            "Where impulse showed up: chasing, revenge orders, off-plan adds. Name them.",
            "Next-week list capped at three items. Ten changes equal zero changes.",
          ],
        },
        {
          type: "p",
          text: "The review page can draft a summary from paper fills, but a summary cannot take responsibility for you. When it says you exited per plan, walk back to the chart and check. Automation saves typing; it does not save honesty.",
        },
        { type: "h2", text: "Three traps worth naming" },
        {
          type: "ul",
          items: [
            "Treating paper P&L as validated strategy: small sample, no slippage, no fear—a pretty curve proves nothing.",
            "Reviewing only your mood: an emotion label needs an executable change attached, like 'hands off once invalidation hits' or 'no adds on news days'.",
            "Practicing too long: past a few weeks, paper teaches nothing new about slippage, depth, or real counterparties—you are just rehearsing confidence.",
          ],
        },
        {
          type: "p",
          text: "Know the gaps before you fund an account:",
        },
        {
          type: "table",
          head: ["Dimension", "Paper", "Real"],
          rows: [
            ["Fill", "At the price you see", "Slippage, worse on urgent orders"],
            ["Emotion", "Losing numbers", "Losing this month's rent"],
            ["Counterparty", "Nobody racing you", "Your order may be someone's liquidity"],
          ],
          caption:
            "So paper can only train process, never nerve. Nerve regrows slowly, in small real size.",
        },
        {
          type: "p",
          text: "Rhythm: three questions same-day on every paper trade, one weekly review session, one improvement carried into next week. Do not turn the weekly review into forty daily taps—volume is not progress.",
        },
        { type: "h2", text: "When to stop paper trading" },
        {
          type: "p",
          text: "A checkable bar (hypothetical, but make one): four straight weeks with plan-adherence above 90%, at least two invalidations honored on the spot, and a one-line change written for every trade. Clear all three, then talk about tiny real size. Below the bar, fix the process first—real money amplifies whatever you currently are.",
        },
        {
          type: "p",
          text: "Paper and review promise no winning trade. They let you see your own behavior and turn 'stay calm' from a wish into a repeatable motion. Process is trainable; a shortcut to riches is not.",
        },
        {
          type: "note",
          text: "Educational only; every figure above is hypothetical. Paper fills do not represent executable prices, and nothing here is investment advice.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "在钱力股里，这两件事是一对：/portfolio 模拟盘负责走流程，/review 复盘页负责看自己。模拟成交会流进复盘页，笔记和成交摆在同一屏，你想只写一句「我心态不好」糊弄过去，都没那么容易。",
        },
        {
          type: "p",
          text: "随手点几十次「玩玩」，练熟的全是坏习惯。开一单之前，四行东西先写进备注——这四行放到真盘里，同样一个字都不能少。",
        },
        { type: "h2", text: "模拟要像真盘" },
        {
          type: "table",
          head: ["备注项", "写什么", "例子（全部为假设）"],
          rows: [
            ["结构", "这单基于什么读法", "箱体上沿附近回踩，20–21.5 区间"],
            ["风险预算", "这单最多亏账户百分之几", "账户 10 万，单笔 1%，即 1000"],
            ["失效价", "什么情况认错离场", "收盘跌破 19.4，箱体论点作废"],
            ["仓位", "多少股、占多少", "用仓位计算器反推，别心算"],
          ],
          caption: "哪一行让你写着别扭，真盘里你就最容易跳过哪一行。",
        },
        {
          type: "p",
          text: "举个假设的例子：账户 10 万，单笔风险 1% 就是 1000。打算在 20.5 附近买，失效价 19.4，每股风险约 1.1。仓位上限 = 1000 ÷ 1.1 ≈ 900 股，市值 1.8 万左右——比大多数人拍脑袋的「买一半」小得多。这笔账别深夜口算，丢进 /tools/position 跑一遍；想要更完整的期望值视角，/tools/risk-reward 顺手看一眼。",
        },
        { type: "h2", text: "复盘只问三句" },
        {
          type: "ul",
          items: [
            "计划说什么、我做了什么——两行对不上的地方，才是真正的盈亏来源。",
            "哪里冲动了：追价、报复单、计划外加仓，点名写清楚。",
            "下次清单改三条以内，改十条等于没改。",
          ],
        },
        {
          type: "p",
          text: "复盘页可以基于模拟成交生成摘要，但摘要不能替你认账——它说「按计划离场」，你要自己回 K 线核对是不是真的。自动总结帮你省打字，不帮你省诚实。",
        },
        { type: "h2", text: "三个坑，提前点名" },
        {
          type: "ul",
          items: [
            "拿模拟盈亏当「策略已验证」：样本小、无滑点、无情绪，漂亮曲线什么都证明不了。",
            "复盘只骂自己「心态差」：情绪标签要落到可执行的改动，比如「触发失效先停手」「新闻日不加仓」。",
            "练太久：超过几周，滑点、盘口、真实对手全都学不到，练的只是熟练的错觉。",
          ],
        },
        { type: "p", text: "模拟和真盘差在哪，上真金之前心里要有数：" },
        {
          type: "table",
          head: ["维度", "模拟盘", "真盘"],
          rows: [
            ["成交", "按你看到的价格成交", "有滑点，急单更贵"],
            ["情绪", "亏的是数字", "亏的是这个月的生活费"],
            ["对手", "没人和你抢", "你挂的单可能就是别人的流动性"],
          ],
          caption: "所以模拟只能练流程，练不了胆量。胆量要在小仓真金里重新长一遍。",
        },
        {
          type: "p",
          text: "节奏建议：模拟单当天写三问，周末集中复盘一次，下一周只带一条改进上场。别手快地把周复盘改成日更几十笔——数量从来不等于进步。",
        },
        { type: "h2", text: "什么时候可以停" },
        {
          type: "p",
          text: "给一个可检验的标准（同样是假设）：连续四周，模拟单按计划执行率在九成以上；失效触发时真的当场停手过至少两次；每一单的复盘笔记里都有一行改动。三条都过，再谈小仓真金。没过就先修流程——真盘只会放大你现在的样子，不会修复它。",
        },
        {
          type: "p",
          text: "模拟与复盘都不保证下一笔赚钱。它们能做的，是让你看见自己的行为模式，把「冷静」从愿望变成可重复的动作。流程可练，暴富捷径不可练。",
        },
        {
          type: "note",
          text: "本篇为教学示例，所有数字均为假设，不构成投资建议。模拟成交不代表真实可成交价格。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "I made money on paper. Does that mean the strategy works?",
          a: "No, it means the process held. Small sample, no slippage, no fear—dozens of pretty trades prove little. Track adherence rate, not returns.",
        },
        {
          q: "How long should I paper trade?",
          a: "A few weeks. The goal is making the four pre-trade note lines and honoring invalidation feel automatic. Months of paper mostly harden bad habits.",
        },
        {
          q: "Does every review need to be long?",
          a: "Three lines: plan, actual, next change. Long market commentary is usually a way to avoid writing line two.",
        },
        {
          q: "Can I trust the AI-generated review summary?",
          a: "As a draft. It omits and softens things—especially 'exited per plan'—so verify key lines against the fills and the chart yourself.",
        },
      ],
      "zh-CN": [
        {
          q: "模拟盘赚钱了，说明策略行吗？",
          a: "不行，只能说明流程没崩。样本小、没有滑点和情绪成本，几十笔的漂亮曲线什么都证明不了。要看的是执行率，不是收益率。",
        },
        {
          q: "模拟应该练多久？",
          a: "几周就够，目标是把下单前四行备注和失效执行练成条件反射。练几个月以上，多数人只是在把坏习惯练熟。",
        },
        {
          q: "复盘每次都要写很多吗？",
          a: "三行就够：计划、实际、下次改动。写长篇行情评论，通常是在回避第二行。",
        },
        {
          q: "AI 生成的复盘摘要可信吗？",
          a: "当草稿用。它会漏、会美化，尤其「是否按计划离场」这种关键句，必须回成交记录和 K 线自己核对。",
        },
      ],
    },
    links: {
      en: [
        { label: "The workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Risk-reward calculator", href: "/tools/risk-reward" },
        { label: "The three-question checklist", href: "/learn/checklist-three" },
      ],
      "zh-CN": [
        { label: "一条闭环：看盘→分析→计划→复盘", href: "/learn/stocks-workbench-loop" },
        { label: "自选与提醒：少而准", href: "/learn/watchlist-alerts" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "风险回报计算器", href: "/tools/risk-reward" },
        { label: "复盘三问清单", href: "/learn/checklist-three" },
      ],
    },
    sourceNote: {
      en: "Educational. All figures are hypothetical; paper fills are not executable quotes. Not investment advice.",
      "zh-CN": "仅供学习。文中数字均为假设；模拟成交非可执行报价。不构成投资建议。",
    },
  },
  {
    slug: "kline-basics",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Candles: wicks, bodies, and not over-reading",
      "zh-CN": "K 线怎么读：影线、实体与别过度解读",
    },
    summary: {
      en: "A candle compresses contested prices into four numbers. It is a word, not a sentence—location decides meaning.",
      "zh-CN":
        "K 线把一段时间的博弈压缩成四个价。它是句子里一个词，不是整句话——位置决定含义。",
    },
    paragraphs: {
      en: [
        "Candles do not see the future. They compress a period of trading into open, high, low, close, so you can read shifting participation without scrolling raw ticks. If your goal is predicting the next bar, expect disappointment.",
      ],
      "zh-CN": [
        "K 线不预知未来。它把一段时间内的成交压缩成四个价——开、高、低、收——让你不用翻海量明细也能看见资金态度的变化。如果学它的目标是「猜下一根涨跌」，大概率失望。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In Q-Stock, pick any of the four tabs on /markets—US, HK, A-shares, crypto—open a symbol, and quote plus chart sit on one screen. When you want a second pair of eyes, the AI chart read will say structure, levels, and invalidation out loud; the conclusion still gets checked by you, on the chart.",
        },
        { type: "h2", text: "What one candle says" },
        {
          type: "p",
          text: "The wide rectangle is the body, open to close. The thin lines above and below are wicks: rejected highs, rejected lows. A wide body means one side pushed hard; a body near zero means a stalemate. A long wick only means that side was tested—never that a top or a floor is permanent.",
        },
        {
          type: "p",
          text: "Dissect a hypothetical candle: open 20.0, high 21.2, low 19.6, close 20.9. Body 0.9, upper wick 0.3, lower wick 1.3. Translation: the push to 21.2 got sold, the dip to 19.6 got bought, buyers closed on top. But whether this is a bull counterattack or a struggle at range top depends entirely on where it sits in the larger move. Location beats shape—that line is worth the whole article.",
        },
        {
          type: "table",
          head: ["Candle feature", "What the market did", "What not to over-read"],
          rows: [
            ["Wide green body", "Buyers in control", "Blow-off top and a volume breakout share the same shape"],
            ["Long upper wick", "Highs got sold into", "Not automatically a top—can be intraday mood"],
            ["Long lower wick", "Lows got bought", "A quiet, low-volume spike is weak evidence"],
            ["Doji", "Temporary balance", "Bullish or bearish on its own—wait for the next bar"],
          ],
          caption:
            "A single candle is almost never an order. It is one word in a sentence.",
        },
        { type: "h2", text: "Location beats pattern" },
        {
          type: "p",
          text: "The same bullish engulfing after a long decline, at support, on expanding volume, is worth watching. The same pattern after a big run is often just a late-day save. Applying textbook shapes without location is reading the chart through a rearview mirror.",
        },
        {
          type: "p",
          text: "Before hunting entries, ask three questions: structure—trend or range, and what is the moving average doing? Location—is this candle high, mid, or low in the move? Volume—expanding or drying versus the prior stretch? Answer all three before you study combinations.",
        },
        {
          type: "table",
          head: ["Timeframe", "What to read", "The usual misuse"],
          rows: [
            ["Daily", "Medium-term direction and structure", "Led around by the hourly, trading against the larger trend"],
            ["Hourly", "Nearer observation points", "Mistaking noise for a trend turn"],
            ["Minutes", "Intraday rhythm only", "Staring at minutes while ignoring the frame"],
          ],
          caption:
            "Big timeframe sets direction, small timeframe finds spots. Reversing that order is expensive.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Buying every long lower wick: it only proves the low got bought; a high-position wick can be the tail of distribution.",
            "Treating a green streak as endless: shrinking bodies and more dojis late in a trend usually mean fading energy.",
            "Using AI chart output as an order price: it gives candidate levels, not tickets.",
          ],
        },
        {
          type: "p",
          text: "Volume is the candle's best witness: price up on expanding volume has sponsorship; price up on shrinking volume tends to retrace. Down on heavy volume leans bearish; down on quiet volume may mean sellers are running out. Price says where; volume says how many believed it.",
        },
        { type: "h2", text: "Turn reading into action" },
        {
          type: "p",
          text: "After the read, land it: write entry band, size, and invalidation into the plan tab on the symbol page, and bind alerts to invalidation levels—not round numbers. Candles read strength, the plan holds your hand, review checks whether you kept the deal. One chain, three links.",
        },
        {
          type: "p",
          text: "Ten-minute drill: open a name you watch, add one moving average to the daily, answer the three questions; then scroll back and find three candles you remember, and check what actually happened over the next five days. Twenty rounds of this beats memorizing fifty pattern names.",
        },
        {
          type: "note",
          text: "Candles and indicators are aids, not a holy grail. Educational only; all prices above are hypothetical. Signals fail on news and market mood—this is not investment advice.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "在钱力股里，/markets 顶部四个 tab 任选市场——美股、港股、A 股、加密币——进个股页，报价和 K 线就在同一屏。需要第二双眼睛时，AI 读图可以帮你把结构、价位、失效说出口，但结论要回图表自己核对。",
        },
        { type: "h2", text: "一根 K 线在说什么" },
        {
          type: "p",
          text: "中间的粗矩形是实体，从开盘到收盘；上面的细线是上影，下面的细线是下影。实体宽，说明一方攻势强；实体窄到接近十字，说明分歧大。影线长只说明「这一侧被测试过」，不等于见顶，也不等于铁底。",
        },
        {
          type: "p",
          text: "拆一根假设的 K：开 20.0，最高 21.2，最低 19.6，收 20.9。实体 0.9，上影 0.3，下影 1.3。翻译过来：冲到 21.2 被卖回，砸到 19.6 有人接走，收盘多方占优。但它是「多头反攻」还是「箱体上沿的挣扎」，取决于它出现在行情的哪个位置。位置比形态重要——这句话值回全篇。",
        },
        {
          type: "table",
          head: ["单根特征", "市场在说什么", "别过度解读成"],
          rows: [
            ["大阳线", "买方推进强", "高位冲顶和低位放量突破长得一样"],
            ["长上影", "冲高被卖压打回", "不必然见顶，可能只是盘中情绪"],
            ["长下影", "下探被买盘接住", "缩量砸出的低点，参考意义弱"],
            ["十字星", "多空暂时均衡", "本身不分涨跌，等下一根表态"],
          ],
          caption: "单根 K 几乎不能当买卖指令，它只是句子里的一个词。",
        },
        { type: "h2", text: "位置比形态重要" },
        {
          type: "p",
          text: "同一根看涨吞没，出现在连跌之后的支撑区、量能温和放大，才有观察价值；出现在大涨之后的高位，很多时候只是尾盘拉回的假象。教科书形态不分位置硬套，就是后视镜看图。",
        },
        {
          type: "p",
          text: "找买卖点之前先问三句：结构——趋势还是箱体，均线朝哪？位置——这根 K 在行情的高位、中段还是低位？量能——相对前一段是放量还是缩量？三句都答得出，再谈组合形态。",
        },
        {
          type: "table",
          head: ["周期", "看什么", "常见的用法错误"],
          rows: [
            ["日线", "中期方向与结构", "被小时线牵着走，逆大势操作"],
            ["小时线", "短线观察位与确认", "把噪音当成趋势转折"],
            ["分钟线", "日内节奏", "只盯分钟线，忘了自己在哪个结构里"],
          ],
          caption: "大周期定方向，小周期找观察位——顺序不能反。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "看见长下影就抄底：长下影只说明砸下去有人接，高位长下影可能是出货当天的尾声。",
            "连收几根阳线就当永远涨：趋势走久后实体变短、十字增多，往往是动能衰减。",
            "把 AI 读图的话直接当委托价：它给的是候选位，不是订单。",
          ],
        },
        {
          type: "p",
          text: "量能是 K 线最好的搭档：价涨量增，上涨有资金认可；价涨量缩，容易回头。下跌放量偏空头强，下跌缩量则卖压可能在衰减。价格说到哪，成交量说有多少人相信。",
        },
        { type: "h2", text: "把读法变成动作" },
        {
          type: "p",
          text: "看懂之后落到计划：个股页的计划 Tab 写买入区间、仓位和失效价，提醒绑的是失效位，不是整数关口。K 线读懂强弱，计划管住手，复盘检验有没有守约——三件事是一条链。",
        },
        {
          type: "p",
          text: "十分钟练习：打开一只你盯的票，日线上叠一条均线，先回答结构、位置、量能三问；再翻回历史，找三根你印象深的 K，看它之后五天实际怎么走。做上二十次，比背五十个名词更值钱。",
        },
        {
          type: "note",
          text: "K 线与指标都是辅助，不是圣杯。本篇为教学示例，价格数字均为假设；信号会因消息与大盘情绪失效，不构成投资建议。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Should I memorize every pattern?",
          a: "No. Engulfing, morning/evening star, and harami cover most of what you need—always paired with location and volume. Learn the rest when history charts hand them to you.",
        },
        {
          q: "Which moving average is best?",
          a: "The one you use consistently—20/60 on the daily are common. Changing parameters every week means you are hunting a grail, not reading structure.",
        },
        {
          q: "Can the AI chart read find entries for me?",
          a: "It is better at saying structure, levels, and invalidation out loud for you to verify. Ask for 'entry points' and you usually get vague or dangerous answers.",
        },
        {
          q: "Why do patterns look perfect in hindsight?",
          a: "Because you already know the ending. Test honestly: cover the future on a historical chart, write the call first, then uncover and score it. That win rate is yours.",
        },
      ],
      "zh-CN": [
        {
          q: "要不要把所有形态都背下来？",
          a: "不用。吞没、早晨/黄昏之星、孕线这几种配合位置和量能已经够用，其余在历史图里遇到再学。",
        },
        {
          q: "哪根均线最好？",
          a: "没有最好，只有你用得一致的。日线常见 20/60；每周换参数，说明你在找圣杯，不是在看结构。",
        },
        {
          q: "AI 读图能帮我找买卖点吗？",
          a: "它更适合帮你把结构、关键位、失效条件说清楚，你回图表核对后再写进计划。直接要「买卖点」，得到的答案多半含糊或危险。",
        },
        {
          q: "为什么我看 K 线总觉得马后炮都准？",
          a: "因为你看图时已经知道结局。检验方法是回历史图遮住后面的走势，先写下判断再翻开对照——这样统计出来的胜率才是你的。",
        },
      ],
    },
    links: {
      en: [
        { label: "Candle reversal patterns", href: "/learn/candle-reversal-patterns" },
        { label: "Support and resistance zones", href: "/learn/stocks-support-resistance" },
        { label: "MA and MACD in practice", href: "/learn/indicator-trend-momentum" },
        { label: "The workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Markets (US/HK/A/crypto)", href: "/markets" },
      ],
      "zh-CN": [
        { label: "反转形态实战", href: "/learn/candle-reversal-patterns" },
        { label: "支撑与阻力带子", href: "/learn/stocks-support-resistance" },
        { label: "均线与 MACD 实操", href: "/learn/indicator-trend-momentum" },
        { label: "一条闭环：看盘→分析→计划→复盘", href: "/learn/stocks-workbench-loop" },
        { label: "多市场行情（美股/港股/A股/加密币）", href: "/markets" },
      ],
    },
    sourceNote: {
      en: "Educational. All prices in examples are hypothetical. Technical signals are probabilistic and can fail—this is not investment advice.",
      "zh-CN": "仅供学习。示例价格均为假设。技术信号是概率，不是承诺。不构成投资建议。",
    },
  },
  {
    slug: "multi-market-101",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "US, HK, A-shares, and crypto in one shell",
      "zh-CN": "一个终端里的美股、港股、A 股与加密",
    },
    summary: {
      en: "Four markets in one app is a study convenience, not a rule unification. Ask what differs before what pays.",
      "zh-CN":
        "一个终端看四个市场是学习便利，不是规则统一。先问规则差在哪，再问机会在哪。",
    },
    paragraphs: {
      en: [
        "Seeing US, HK, A-shares, and crypto side by side helps comparison—it does not make the rules identical. Settle the rules first; opportunity can wait.",
      ],
      "zh-CN": [
        "一个终端里能同时看美股、港股、A 股和加密币，是学习上的便利，不是规则上的统一。很多人被「都能看」迷惑，忽略了时段、交收、限制和合规边界，之后才在真盘上还账。原则先立住：先问规则差在哪，再问机会在哪。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "On Q-Stock's /markets page, the top row is four tabs: US, HK, A-shares, crypto. Walk each tab once and take nothing but a differences list—leave the cross-market arbitrage stories for later.",
        },
        { type: "h2", text: "The differences list comes first" },
        {
          type: "table",
          head: ["Market", "Session notes", "Symbol habit", "Structural trap"],
          rows: [
            ["US", "Regular hours plus pre/post", "Letters, e.g. AAPL", "Thin after-hours liquidity; jumps may not hold"],
            ["HK", "Two sessions, half-days common", "Five digits", "Sparse names, wide spreads"],
            ["A-shares", "T+1: today's buy cannot sell today", "Six digits", "Daily limits—on mood days you cannot leave"],
            ["Crypto", "Near 24/7", "Symbols like BTC", "No equity market open on weekends to hedge against"],
          ],
          caption:
            "Worth copying into your watchlist notes. More durable than any opportunity list.",
        },
        {
          type: "p",
          text: "T+1 has a price you can compute (all hypothetical): an A-share account of 100,000 buys 50,000 of a stock late in the session at 20.0. Bad news lands overnight; next open is 19.4, a 1,500 drawdown—and the rules forbid selling today. The same 50,000 split into a smaller size, or held for a next-day decision, halves this 'rules tax'. Position design passes through the rules layer before it reaches the opinion layer.",
        },
        { type: "h2", text: "Sessions and overlaps" },
        {
          type: "p",
          text: "Stack the four clocks: A-shares close while HK still trades; HK closes as US opens; crypto runs through all of it. A move you watch live may be happening on a closed, illiquid market. Say a US-listed Chinese name closes at 50, then gaps to 52 after hours on earnings (hypothetical). Plan off 52 as the new price and the next open at 50.8 charges you 1.2 in session tuition.",
        },
        {
          type: "p",
          text: "Symbol habits trip people too: letters, five digits, six digits, crypto ids. Pick the right market when searching—A-shares and HK both have near-identical names in unrelated businesses.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "US habits pasted onto A-shares: full-size chase, then T+1 locks the door.",
            "Treating after-hours quotes as real prices: thin liquidity means a quote is just a quote.",
            "Forgetting HK half-days: assuming a full afternoon before a holiday.",
            "Heavy crypto weekend positions: no equity reference, no hedging, no reinforcements.",
          ],
        },
        { type: "h2", text: "Compliance edges" },
        {
          type: "p",
          text: "Whether you may access a product where you live, and what investor status it needs, is decided by local law and licensed institutions. Q-Stock provides information and paper practice—it is not a broker onboarding or order channel. This paragraph is not exciting, but it is the one part of four markets that review cannot repair.",
        },
        { type: "h2", text: "Same frame, local parameters" },
        {
          type: "p",
          text: "Structure, levels, invalidation—the calm-watching trio—reusable across all four markets. But how far the invalidation sits, how big the size is, when the alerts fire: each market recalculates. The plan tab and alerts do not care where a symbol was born; your parameters should.",
        },
        {
          type: "table",
          head: ["Frame step", "US parameter", "A-share parameter (hypothetical)"],
          rows: [
            ["Where invalidation sits", "Close below range floor", "Budget wider—limit-down may trap the exit"],
            ["Risk per trade", "1.5%", "Lower under T+1, say 1%"],
            ["Decision timing", "Check pre/post once", "Decide before 14:45; overnight risk is not exitable"],
          ],
          caption:
            "Keep the frame, localize the numbers. Copying parameters without the thinking is the classic cross-market loss.",
        },
        {
          type: "p",
          text: "Drill: pick two names in one industry—one US, one A-share—and write one differences line for each: sessions, settlement, limits. Then write each one's invalidation into alerts. A week later, the rule differences move from knowledge to feel.",
        },
        {
          type: "note",
          text: "Educational only; example prices and ratios are hypothetical. Market rules follow the latest exchange and regulator disclosures. Not investment advice.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "钱力股的 /markets 页面顶部就是四个 tab：美股、港股、A 股、加密币。建议每个 tab 各逛一遍，只记差异清单——先不急着找「跨市场套利故事」。",
        },
        { type: "h2", text: "差异清单先立" },
        {
          type: "table",
          head: ["市场", "时段要点", "代码习惯", "结构性差异要留神"],
          rows: [
            ["美股", "常规时段外加盘前盘后", "字母代码，如 AAPL", "盘后流动性薄，跳价不一定守得住"],
            ["港股", "两段时段，常有半日市", "五位数字", "部分个股成交稀疏，点差大"],
            ["A 股", "常见 T+1，当日买不能当日卖", "六位数字", "涨跌停限制，情绪日想走走不掉"],
            ["加密币", "接近 7×24", "BTC 这类符号", "周末没有股票行情可对冲"],
          ],
          caption: "这张表值得抄进自选备注，比任何「机会清单」都保值。",
        },
        {
          type: "p",
          text: "T+1 的代价可以算得很具体（全部假设）：A 股账户 10 万，尾盘追进 5 万某股，成交价 20.0。当晚出利空，次日开盘 19.4，浮亏 1500——而你不能卖，规则不允许当日止损。同样 5 万，仓位减半或留到次日再决策，这笔「规则税」就小一半。仓位设计要先过规则这一关，才轮到观点。",
        },
        { type: "h2", text: "时段与重叠" },
        {
          type: "p",
          text: "四张时间表叠起来看才有意思：A 股收盘后港股还在走，港股收盘后美股开盘，加密全程在线。你看到的「现在涨跌」，可能发生在对方市场已收盘、流动性变薄的时候。假设一只美股上市的中概股收盘 50，财报后盘后跳到 52——你按 52 当成新价格做计划，次日开盘回到 50.8，这 1.2 就是时段的学费。",
        },
        {
          type: "p",
          text: "代码习惯也别想当然：美股字母、港股五位、A 股六位、加密用符号。搜索时选对市场，能少很多「同名不同标的」的乌龙——A 股和港股都存在名字相近、业务毫不相干的公司。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "用美股习惯套 A 股：满仓追进去才发现 T+1 把门锁了。",
            "把盘后跳价当真价格：流动性薄的时候，报价只是报价。",
            "忽略港股半日市：节假日前以为还有整个下午。",
            "加密周末重仓：没有股票参照，没有对冲，也没有援军。",
          ],
        },
        { type: "h2", text: "合规边界" },
        {
          type: "p",
          text: "你所在地能否参与某类产品、需要什么投资者身份，以当地法规和持牌机构为准。钱力股提供的是信息与模拟，不是券商开户或下单通道。这一段不性感，但它是四个市场里唯一没法靠复盘修复的部分。",
        },
        { type: "h2", text: "框架迁移，参数本地化" },
        {
          type: "p",
          text: "结构、价位、失效——冷静看盘三件事——四个市场都能复用。但失效价挂多远、仓位给多大、提醒几点响，每个市场要重新算。个股页的计划 Tab 和提醒页不问标的老家是哪，你的参数得自己问。",
        },
        {
          type: "table",
          head: ["框架动作", "美股参数", "A 股参数（假设）"],
          rows: [
            ["失效价挂哪", "收盘跌破箱体下沿", "预算留更宽，防跌停打不开"],
            ["单笔风险", "1.5%", "T+1 下建议更低，比如 1%"],
            ["决策时点", "盘前盘后各看一眼", "14:45 前定完，隔夜风险无法止损"],
          ],
          caption: "框架不变，参数跟着规则走。抄参数不抄思考，是跨市场最经典的亏损姿势。",
        },
        {
          type: "p",
          text: "练习：挑同一行业的两只票，一只美股一只 A 股，各写一行差异——时段、交收、限制——再把各自的失效价写进提醒。一周后回看，规则差异就从「知识」变成了「手感」。",
        },
        {
          type: "note",
          text: "本篇为教学示例，示例价格与比例均为假设。市场规则以交易所与当地监管最新披露为准，不构成投资建议。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Which market should I learn first?",
          a: "The one where you have the least money and the most familiarity. Get the loop working on paper, then add depth in a single market—do not spread across four at once.",
        },
        {
          q: "Can I trade US pre/post markets, and can I see them here?",
          a: "Whether you can trade extended hours depends on your broker; Q-Stock shows quotes for reference. Extended-hours liquidity is thin—never treat the quote as an executable price.",
        },
        {
          q: "Crypto moves big on weekends. Should I trade it?",
          a: "Big moves are not big opportunities. Weekends have no equity reference, and spreads and flash moves get worse. Watch first, keep size tiny or zero.",
        },
        {
          q: "Is A-share T+1 just an inconvenience?",
          a: "It blocks same-day stop-outs, but it also blocks same-day chases. If you are trigger-happy, T+1 is the brake system working for you—just size positions for overnight risk from the start.",
        },
      ],
      "zh-CN": [
        {
          q: "四个市场我该先学哪个？",
          a: "从你真金最少、规则最熟的那个开始。先用模拟盘把闭环走顺，再挑一个市场加深度，别四个同时铺开。",
        },
        {
          q: "美股盘后能交易吗？钱力股能看到盘后价吗？",
          a: "能否交易盘后取决于你的券商；钱力股提供的是行情参考。盘后流动性很薄，别把报价当成可以成交的价格。",
        },
        {
          q: "加密币周末波动大，要做吗？",
          a: "波动大不等于机会大。周末没有股票参照，点差和插针都更极端，新手先观察，仓位给零或极小。",
        },
        {
          q: "A 股 T+1 是不是很不方便？",
          a: "它限制当日止损，也限制当日追涨。对容易手快的人，T+1 反而是制度替你踩了刹车——关键是仓位一开始就按「隔夜风险」来设计。",
        },
      ],
    },
    links: {
      en: [
        { label: "The workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "HK trading rules and pitfalls", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "Cross-market premium guide", href: "/learn/cross-market-premium-guide" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Markets (US/HK/A/crypto)", href: "/markets" },
      ],
      "zh-CN": [
        { label: "一条闭环：看盘→分析→计划→复盘", href: "/learn/stocks-workbench-loop" },
        { label: "港股交易规则与坑", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "跨市场溢价指南", href: "/learn/cross-market-premium-guide" },
        { label: "自选与提醒：少而准", href: "/learn/watchlist-alerts" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "多市场行情（美股/港股/A股/加密币）", href: "/markets" },
      ],
    },
    sourceNote: {
      en: "Educational. All example figures are hypothetical. Market rules follow the latest exchange and regulator disclosures. Not investment advice.",
      "zh-CN": "仅供学习。示例数字均为假设。市场规则以交易所与监管最新披露为准。不构成投资建议。",
    },
  },
];
