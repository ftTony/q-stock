import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Consolidated from five thin candle articles (engulfing / hammer / stars /
 * piercing / tweezer, 900–950 chars each). Five near-identical pages were
 * competing for the same long-tail queries and each was too short to rank.
 */
export const LEARN_ARTICLES_MERGED_CANDLES: LearnArticle[] = [
  {
    slug: "candle-reversal-patterns",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      "zh-CN": "五种 K 线反转形态：吞没、锤子、启明星、刺透、镊子",
      en: "Five candlestick reversal patterns — and what none of them can tell you",
    },
    summary: {
      "zh-CN":
        "五种形态的识别条件、它们共同漏掉的东西，以及怎么把「这是不是锤子」变成一个能检验的问题。",
      en:
        "How to identify engulfing, hammer, morning star, piercing and tweezer patterns — and why each one describes a period instead of predicting the next.",
    },
    paragraphs: {
      "zh-CN": [
        "「吞没」「锤子」「启明星」「刺透」「镊子」在教科书里各占一节，实际看图时却经常同时出现、互相矛盾。把它们放在一起讲，是因为它们共享同一个前提：一根或几根 K 线只描述某一时段的价格范围，不描述下一段会怎么走。",
      ],
      en: [
        "Textbooks give engulfing, hammer, morning star, piercing and tweezer patterns a section each. On a real chart they show up together and disagree with each other. They are worth reading as a group because they share one premise: a candle describes one period's price range, not what the next period will do.",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "先说结论：这五种形态的价值不在于「出现就该买/该卖」，而在于它们逼你把三件事说清楚——前面是什么趋势、它出现在什么位置、什么价格会让这个解释作废。说不清这三件，形态名字再标准也只是图案。",
        },
        { type: "h2", text: "先把定义钉死，再看图" },
        {
          type: "p",
          text: "教材对跳空、实体中点、影线比例的要求并不一致。同一张图，按 A 教材是标准早晨之星，按 B 教材就不算。这不是谁错了，而是这些形态本来就没有统一的工业标准。所以第一步不是找形态，而是先选定一套定义写进笔记：要不要跳空？中点按实体算还是按全幅算？影线要几倍实体？定义固定之后，跨案例比较才有意义。",
        },
        { type: "h2", text: "五种形态的识别条件" },
        {
          type: "table",
          head: ["形态", "结构", "常见讨论背景", "最容易搞错的地方"],
          rows: [
            [
              "看涨 / 看跌吞没",
              "第二根实体覆盖第一根实体",
              "下跌末段 / 上涨末段",
              "以为「吞没」包括上下影线",
            ],
            [
              "锤子 / 上吊",
              "小实体 + 长下影，收盘回到区间上部",
              "跌后叫锤子，涨后叫上吊",
              "只截取那一根，把前后走势裁掉",
            ],
            [
              "启明星 / 黄昏星",
              "大实体 + 小实体 + 反向收盘进入第一根实体",
              "三段式反转",
              "把「必须跳空」当成通用条件",
            ],
            [
              "刺透 / 乌云盖顶",
              "第二根收盘进入前一实体中点以上（下）",
              "两段式反转",
              "把中点当成因果分界",
            ],
            [
              "镊子顶 / 底",
              "两根 K 的高点或低点几乎重合",
              "区间边缘",
              "「接近」没有跨市场容差标准",
            ],
          ],
        },
        { type: "h2", text: "吞没：位置比形状重要" },
        {
          type: "p",
          text: "吞没的定义核心是实体覆盖——第二根的实体把第一根的实体包住，影线不要求被包。这一点常被记反：很多人以为要连影线一起吞掉，于是把大量符合定义的样本排除掉了。",
        },
        {
          type: "p",
          text: "同一根看涨吞没，出现在一段持续下跌之后、靠近更大周期的区间下沿，和出现在横盘中间，信息量完全不同。前者至少说明这一时段的卖压被中断了；后者可能只是区间内的正常来回。看跌吞没在上涨末段提醒你注意推进是否受阻，但无法区分趋势反转、获利回吐和普通波动。",
        },
        {
          type: "p",
          text: "成交量能提供背景，但不能提供身份。放量说明参与度上升，不说明是谁在买、会不会继续。不同数据源对盘前盘后、复权和成交量的处理也不一样，跨平台比对前先确认口径。",
        },
        { type: "h2", text: "锤子与上吊：同一根线，两个名字" },
        {
          type: "p",
          text: "长下影、小实体、收盘回到区间上部。跌了一段之后出现常叫锤子，涨了一段之后出现常叫上吊。名字变了，证据强度没变——变的只是它前面的趋势。",
        },
        {
          type: "p",
          text: "它能告诉你的只有一件事：这个时段价格曾明显走低，又在收盘前被买回来了。它不能告诉你下跌已经结束。验证发生在下一根：收盘能不能守在形态高点附近、结构有没有改善；如果价格很快跌破长下影的低点，反转解释就该降级。确认是后续信息，不是成功保证。",
        },
        {
          type: "p",
          text: "最容易踩的坑是只截取那一根 K 线。判断前至少补上四项：前面有没有清晰趋势、形态在区间什么位置、后续有没有跟进、当时有没有财报或流动性变化。脱离这四项，名字再标准也只是图案。",
        },
        { type: "h2", text: "启明星与黄昏星：中间那根不是星星" },
        {
          type: "p",
          text: "三根：一根明显的下跌实体，接着一根小实体（或犹豫型），最后一根向上收盘、并进入第一根实体的一部分。黄昏星是上涨背景下的镜像。中间那根的意义是「推进暂停」，而暂停可能来自多空分歧，也可能来自流动性、假期或消息——一根小实体不说明市场已经决定转向。",
        },
        {
          type: "p",
          text: "跳空是跨市场使用时的最大障碍。传统描述常要求第二根与前后有缺口，但 24 小时交易的品种几乎没有这种缺口。把跳空当必要条件会筛掉大量案例，完全忽略又会把不同结构混在一起。写明自己的定义，比争论哪种定义正确更有用。",
        },
        { type: "h2", text: "刺透与乌云盖顶：中点只是参照" },
        {
          type: "p",
          text: "刺透线是下跌实体之后，出现一根上涨实体，收盘进入前一根实体的中点以上、但未超过前一根的开盘。乌云盖顶方向相反。两者关心的都是「第二根收回了多少」。",
        },
        {
          type: "p",
          text: "中点的作用是可复核：它把「收复了一部分」变成一个能写下来的数字，让不同案例之间能横向比较。它不是市场天然的分界线，也没有「过了中点就必然反转」的因果关系。用中点做筛选，是为了规则一致，不是为了预测。",
        },
        { type: "h2", text: "镊子顶底：两次触及不等于两次守住" },
        {
          type: "p",
          text: "两个低点接近叫平头底，两个高点接近叫平头顶。两根 K 可以一阴一阳，也可以同色，重点是两个极值是否足够接近，而不是颜色符合某个模板。",
        },
        {
          type: "p",
          text: "「足够接近」没有跨市场通用的绝对差值。最小跳动单位、报价精度、波动幅度和图表周期都不同：对高波动标的，差几个 tick 未必重要；对低波动标的，同样的差值已经很显著。与其硬背固定容差，不如记录自己采用的标准并保持一致。",
        },
        {
          type: "p",
          text: "第二次触及同一价位，不证明支撑更强。它可能守住，也可能因为卖盘继续而跌破。形态本身不知道挂单深度，也无法证明有多少人在那里等着。如果价格越过你原先标出的极值，应该更新解释，而不是不断扩大「差不多」的范围。",
        },
        { type: "h2", text: "为什么这五种经常一起失效" },
        {
          type: "ul",
          items: [
            "时段与跳空：隔夜休市的市场有缺口，连续交易的市场没有，同名形态的结构并不相同。",
            "复权方式：前复权会改写历史极值，平头底/顶的「同一价位」可能只是复权造成的。",
            "数据口径：盘前盘后是否纳入、日线怎么切分，都会改变影线长短与实体大小。",
            "流动性：低流动性时段的一笔成交就能造出长影线，那不是「被托住」。",
            "事件：财报、公告、停牌会直接让形态失去参考意义，且往往发生在最像教科书的时候。",
          ],
        },
        { type: "h2", text: "把形态变成一个能回答的问题" },
        {
          type: "p",
          text: "与其问「这是不是锤子」，不如问四句，每一句都能写下答案：",
        },
        {
          type: "ul",
          items: [
            "它前面是什么趋势，持续了多久？没有趋势，就没有「反转」可言。",
            "它出现在区间的什么位置，离最近的边界多远？",
            "第二根（或第三根）收复了多少，收盘落在哪里？",
            "后续几根有没有守住形态区间？什么价格会让这个解释作废？",
          ],
        },
        {
          type: "p",
          text: "这四问的价值在于：它们都能被事后检验。答完仍然不确定要不要行动，说明形态本身提供的就不是行动依据，这是有用的结论，不是失败。",
        },
        { type: "h2", text: "练习：先遮住右边" },
        {
          type: "p",
          text: "找样本时先遮住右侧未来走势，只判断趋势和是否符合事先写下的定义；然后写下解释与失效条件；最后揭开图表，记录结果。这样能避免先看见涨跌、再回头挑出「标准形态」的后视镜偏差。",
        },
        {
          type: "p",
          text: "关键是样本选择规则要事先定。只保留后来上涨的截图，等于把事后故事当成规律。失败案例必须一起留，否则你统计的不是形态的胜率，而是自己记忆的胜率。",
        },
        {
          type: "p",
          text: "另外别无限叠加确认条件。形态、均线、MACD、成交量、新闻如果都要同时同向，历史上总能找到一组漂亮案例，但规则可能已经过度拟合到那段历史。先用少量明确条件，再换标的、换时间段检查。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Short version: the value of these patterns is not that they tell you to buy or sell. It is that they force you to state three things — what the prior trend was, where the pattern sits, and what price would void the interpretation. Without those three, a textbook-perfect shape is just a shape.",
        },
        { type: "h2", text: "Fix the definition before you look at the chart" },
        {
          type: "p",
          text: "Textbooks disagree on gaps, body midpoints, and shadow-to-body ratios. The same chart is a textbook morning star under one definition and not a morning star under another. Neither is wrong; these patterns never had an industrial standard. So the first step is not finding patterns but writing down which definition you use: gaps required or not, midpoint measured on the body or the full range, shadow at least how many times the body. Once fixed, comparisons across examples mean something.",
        },
        { type: "h2", text: "Identification rules for all five" },
        {
          type: "table",
          head: ["Pattern", "Structure", "Usual context", "Most common mistake"],
          rows: [
            [
              "Bullish / bearish engulfing",
              "Second real body covers the first real body",
              "End of a decline / end of an advance",
              "Assuming shadows must be covered too",
            ],
            [
              "Hammer / hanging man",
              "Small body, long lower shadow, close near the top of the range",
              "Hammer after a decline, hanging man after an advance",
              "Cropping the chart to that one candle",
            ],
            [
              "Morning / evening star",
              "Large body, small body, then a close back inside the first body",
              "Three-candle reversal",
              "Treating a gap as a universal requirement",
            ],
            [
              "Piercing / dark cloud",
              "Second close beyond the midpoint of the prior body",
              "Two-candle reversal",
              "Reading the midpoint as a causal threshold",
            ],
            [
              "Tweezer top / bottom",
              "Two candles with nearly matching highs or lows",
              "Range boundaries",
              "No cross-market standard for “nearly”",
            ],
          ],
        },
        { type: "h2", text: "Engulfing: location beats silhouette" },
        {
          type: "p",
          text: "The core of engulfing is body coverage — the second real body wraps the first. Shadows need not be covered. People routinely get this backwards, then exclude a large share of valid samples. A bullish engulfing after a sustained decline near the lower edge of a higher-timeframe range carries different information from the same shape in the middle of a range: the first at least shows selling pressure was interrupted for that period; the second may be ordinary two-way trade.",
        },
        {
          type: "p",
          text: "Volume adds context but not identity. Expanding volume says participation rose; it does not say who bought or whether they will keep buying. Data vendors also differ on extended hours, adjustments, and volume handling, so check the convention before comparing platforms.",
        },
        { type: "h2", text: "Hammer and hanging man: one candle, two labels" },
        {
          type: "p",
          text: "Long lower shadow, small body, close back near the top of the range. After a decline it is usually called a hammer; after an advance, a hanging man. The label changes with context, not the strength of the evidence.",
        },
        {
          type: "p",
          text: "All it tells you is that price moved meaningfully lower during the period and was bought back before the close. It does not tell you the decline is over. Verification happens on the following candles: does price hold near the pattern high, does structure improve? If price quickly breaks the shadow's low, the reversal reading should be downgraded. Confirmation is new information, not a guarantee.",
        },
        { type: "h2", text: "Morning and evening star: the middle candle is not a star" },
        {
          type: "p",
          text: "Three candles: a substantial down body, a small or indecisive body, then a close that pushes back into part of the first body. The evening star mirrors this after an advance. The middle candle means “the push paused.” A pause can come from disagreement, thin liquidity, a holiday, or news — a small body does not prove the market has chosen a new direction.",
        },
        {
          type: "p",
          text: "Gaps are the main obstacle when moving across markets. Traditional descriptions often require a gap around the middle candle, but continuous markets rarely produce one. Requiring a gap filters out most samples; ignoring it entirely blends different structures together. State your definition rather than argue about which is correct.",
        },
        { type: "h2", text: "Piercing and dark cloud: the midpoint is only a reference" },
        {
          type: "p",
          text: "A piercing line is a down body followed by an up body that closes above the midpoint of the prior body but below its open. Dark cloud cover is the mirror. Both ask one question: how much did the second candle retrace?",
        },
        {
          type: "p",
          text: "The midpoint is useful because it is repeatable — it turns “retraced somewhat” into a number you can write down and compare across examples. It is not a natural boundary and there is no causal rule that crossing it forces a reversal. Using it as a filter buys consistency, not prediction.",
        },
        { type: "h2", text: "Tweezer tops and bottoms: touching twice is not holding twice" },
        {
          type: "p",
          text: "Two lows that nearly match make a tweezer bottom; two nearly matching highs make a tweezer top. The candles can be opposite colors or the same. What matters is proximity of the extremes, not a fixed color template.",
        },
        {
          type: "p",
          text: "There is no universal tolerance for “nearly.” Tick size, quote precision, volatility, and timeframe all differ. A few ticks apart may be meaningless on a high-volatility name and significant on a quiet one. Write down your own tolerance and keep it constant instead of memorizing a number.",
        },
        {
          type: "p",
          text: "A second test of the same level does not prove the support is stronger. It may hold again, or it may break because sellers kept coming. The pattern does not see order depth. When price trades through the extreme you marked, update the interpretation rather than widening what counts as “roughly the same.”",
        },
        { type: "h2", text: "Why all five fail together" },
        {
          type: "ul",
          items: [
            "Sessions and gaps: markets with overnight breaks gap; continuous markets do not. Same name, different structure.",
            "Adjustment method: forward-adjusted series rewrite historical extremes, so “the same level” may be an artifact.",
            "Data convention: whether extended hours count, how daily bars are cut, both change shadows and bodies.",
            "Liquidity: a single print in a thin session can manufacture a long shadow that was never support.",
            "Events: earnings, announcements and halts can void a pattern entirely — often right when it looks most textbook.",
          ],
        },
        { type: "h2", text: "Turn the pattern into answerable questions" },
        {
          type: "p",
          text: "Instead of asking “is this a hammer?”, ask four questions, each of which has a written answer:",
        },
        {
          type: "ul",
          items: [
            "What was the prior trend, and how long did it run? Without a trend there is nothing to reverse.",
            "Where in the range does it sit, and how far is the nearest boundary?",
            "How much did the second (or third) candle retrace, and where did it close?",
            "Did subsequent candles hold the pattern's range, and what price would void the reading?",
          ],
        },
        {
          type: "p",
          text: "These questions can all be checked afterwards. If you answer them and still cannot decide, that is a finding: the pattern was never an action signal. Useful conclusion, not a failure.",
        },
        { type: "h2", text: "Practice: cover the right side first" },
        {
          type: "p",
          text: "Hide the future, judge only the trend and whether the candles meet your written definition, write an interpretation and an invalidation condition, then reveal the chart and record the result. This limits hindsight selection. Sample rules must be set in advance; keeping only the screenshots that rallied turns practice into storytelling. Keep the failures or you are measuring your memory, not the pattern.",
        },
        {
          type: "p",
          text: "Also avoid stacking confirmations. If the pattern, a moving average, MACD, volume, and the news all have to agree, you will always find a handful of beautiful historical examples — and a rule overfitted to that history. Start with a few explicit conditions, then test on other symbols and other periods.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "吞没形态要看影线吗？",
          a: "常见定义只看实体覆盖，影线不要求被吞。如果你的定义包含影线，写下来并保持一致即可，但要意识到它更严格、样本更少。",
        },
        {
          q: "锤子线和上吊线有什么区别？",
          a: "形状相同，位置不同。跌了一段之后出现常叫锤子，涨了一段之后出现常叫上吊。名称反映背景，不改变证据强度。",
        },
        {
          q: "早晨之星一定要跳空吗？",
          a: "传统描述常要求，但 24 小时交易的品种几乎没有隔夜缺口。把跳空当必要条件会筛掉大量案例，建议明确写出自己的定义。",
        },
        {
          q: "这五种形态能单独当买卖信号吗？",
          a: "不能。它们只描述某一时段的价格结构，不含趋势、位置、流动性和事件信息。适合用来提出问题，不适合直接决定仓位。",
        },
        {
          q: "为什么我按形态做总是亏？",
          a: "最常见的原因是样本选择和位置判断：只记住成功案例，或者不分位置硬套。先把失败案例纳入样本，再谈形态是否可用。",
        },
      ],
      en: [
        {
          q: "Do engulfing patterns require the shadows to be covered?",
          a: "The common definition only covers the real bodies. If yours includes shadows, write it down and stay consistent — just know it is stricter and produces fewer samples.",
        },
        {
          q: "What is the difference between a hammer and a hanging man?",
          a: "Shape only differs by context. After a decline the same candle is called a hammer; after an advance, a hanging man. The label reflects the backdrop, not stronger evidence.",
        },
        {
          q: "Does a morning star need a gap?",
          a: "Textbooks often require one, but continuous markets rarely gap overnight. Requiring it filters out most samples. State your own definition instead of inheriting one.",
        },
        {
          q: "Can these patterns be used as standalone signals?",
          a: "No. They describe one period of price structure and carry no information about trend, location, liquidity, or events. Good for asking questions, poor for sizing positions.",
        },
        {
          q: "Why do I keep losing when I trade these patterns?",
          a: "Usually sample selection and location: remembering only the winners, or applying the shape regardless of where it appears. Include the failures before judging whether the pattern works.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "K 线怎么读：影线、实体与别过度解读", href: "/learn/kline-basics" },
        { label: "均线与 MACD：趋势和动量两把尺", href: "/learn/indicator-trend-momentum" },
        { label: "RSI、布林带与 ATR：波动率的三种读法", href: "/learn/indicator-volatility-toolkit" },
        { label: "打开行情图练习", href: "/markets" },
      ],
      en: [
        { label: "Reading candles: wicks, bodies, and not over-reading", href: "/learn/kline-basics" },
        { label: "Moving averages and MACD: two rulers", href: "/learn/indicator-trend-momentum" },
        { label: "RSI, Bollinger Bands and ATR", href: "/learn/indicator-volatility-toolkit" },
        { label: "Open a chart to practice", href: "/markets" },
      ],
    },
    sourceNote: {
      "zh-CN":
        "本文采用的定义是「实体关系 + 收盘位置」，不要求跳空。不同教材与平台的判定口径可能不同，跨市场比较前请先统一周期、复权方式与交易时段。",
      en:
        "Definitions here use body relationships plus closing position, with no gap requirement. Textbook and platform conventions differ; align timeframe, adjustment, and session handling before comparing across markets.",
    },
  },
];
