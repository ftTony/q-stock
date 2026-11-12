type TopicDiagram =
  | "multi-market-101"
  | "stock-picking-steps"
  | "financials-three-statements"
  | "peer-compare"
  | "kline-basics"
  | "stocks-support-resistance"
  | "stocks-false-breakout"
  | "indicator-trend-momentum"
  | "risk-reward-expectancy"
  | "stocks-exit-rules"
  | "paper-review"
  | "money-traps-small-capital"
  | "book-poor-charlie-almanack"
  | "money-and-desire";

const DIAGRAMS = new Set<string>([
  "multi-market-101",
  "stock-picking-steps",
  "financials-three-statements",
  "peer-compare",
  "kline-basics",
  "stocks-support-resistance",
  "stocks-false-breakout",
  "indicator-trend-momentum",
  "risk-reward-expectancy",
  "stocks-exit-rules",
  "paper-review",
  "money-traps-small-capital",
  "book-poor-charlie-almanack",
  "money-and-desire",
]);

const LABELS: Record<
  "zh" | "en",
  Record<TopicDiagram, { title: string; caption: string; note: string }>
> = {
  zh: {
    "multi-market-101": {
      title: "四个市场速览：美股 · 港股 · A股 · 加密货币",
      caption:
        "同样是「买一点」,在不同市场面对的交易时段、结算货币和涨跌配色习惯都不一样，下单前先对齐这些细节。",
      note: "时段为常规交易时段，不含盘前盘后与节假日调整",
    },
    "stock-picking-steps": {
      title: "选股漏斗：从几千只到一份计划",
      caption:
        "先按基本面粗筛，再用估值收紧范围，接着看技术位置，最后落成带仓位的可执行计划——每一步都在缩小名单。",
      note: "层内数量为示意，非真实筛选结果",
    },
    "financials-three-statements": {
      title: "三张报表如何勾稽",
      caption:
        "利润表的净利润最终计入资产负债表的留存收益，也是现金流量表的起点；三张报表是同一家公司的三个角度。",
      note: "勾稽关系为简化示意，实际科目更细",
    },
    "peer-compare": {
      title: "同业估值对比：市盈率与增速",
      caption:
        "把几家公司的市盈率放在一起并画出行业中位数线：明显偏离中位数时，先想清楚市场在为什么定价。",
      note: "公司与数据均为虚构示例，非真实行情",
    },
    "kline-basics": {
      title: "一根 K 线的解剖",
      caption:
        "实体是开盘到收盘的距离，影线是曾经到过的最高与最低；右侧是一段上涨行情里 K 线的常见组合。",
      note: "概念示意，非真实行情",
    },
    "stocks-support-resistance": {
      title: "支撑与阻力：箱体运行",
      caption:
        "价格在一个箱体内反复来回，上沿形成阻力带、下沿形成支撑带；被多次触碰的位置才更值得记录。",
      note: "概念示意，非真实标的行情",
    },
    "stocks-false-breakout": {
      title: "真突破 vs 假突破",
      caption:
        "左边：突破后回踩不破箱体上沿，趋势延续；右边：冲出箱体又收回，属于假突破，常伴随后续下跌。",
      note: "概念示意，非真实标的行情",
    },
    "indicator-trend-momentum": {
      title: "趋势指标 vs 动量指标",
      caption:
        "左：多条均线先粘合后发散，用来刻画方向；右：动量值在超买超卖区间之间摆动，柱体刻画力度的变化。",
      note: "概念示意，非真实指标数据",
    },
    "risk-reward-expectancy": {
      title: "盈亏比与期望值",
      caption:
        "开仓前先量好到止损位和目标价的距离；右侧公式提醒：长期结果由胜率与盈亏比共同决定，缺一不可。",
      note: "公式为简化模型，未计手续费与滑点",
    },
    "stocks-exit-rules": {
      title: "离场三扇门",
      caption:
        "达到目标价、跌破失效价、论点变化——三条路任何一条被触发，都通向同一个动作：离场。",
      note: "概念示意，具体规则以各篇正文为准",
    },
    "paper-review": {
      title: "复盘闭环",
      caption:
        "计划 → 执行 → 记录 → 复盘 → 修正计划，环上每一环都喂给下一环；缺了记录，复盘就容易变成回忆。",
      note: "概念示意，节奏以个人习惯为准",
    },
    "money-traps-small-capital": {
      title: "两条本金路径：避坑的复利 vs 踩坑的归零",
      caption:
        "上面一条线是小额定投的缓慢复利；下面一条线被四个坑逐级打断——分期实际利率、一次 all-in、付费荐股、保本高息盘子，最后归零。",
      note: "示意曲线，非真实行情；回本年限按年化 8% 估算",
    },
    "book-poor-charlie-almanack": {
      title: "反过来想：正问没有答案，反问全是行动",
      caption:
        "左边「怎么赚 20%」没有可执行答案；右边「怎么亏 30%」能列出具体清单——避开清单上的事，剩下的路自动更接近正收益。",
      note: "概念示意；避坑算术见站内避坑篇",
    },
    "money-and-desire": {
      title: "享乐跑步机：收入在爬，欲望在跳级",
      caption:
        "收入是缓升曲线，欲望是阶梯——每次「暂时满足」之后基线跳一级。两条线之间的缺口就是焦虑；跑步机上唯一有效的比较对象是去年的自己。",
      note: "概念示意，数字示例见正文",
    },
  },
  en: {
    "multi-market-101": {
      title: "Four markets at a glance: US · HK · A-shares · crypto",
      caption:
        "The same act of buying looks different across markets: sessions, settlement currencies and up/down color conventions all change.",
      note: "Regular sessions only; excludes pre/post-market and holiday adjustments",
    },
    "stock-picking-steps": {
      title: "Stock-picking funnel: from thousands to one plan",
      caption:
        "Screen on fundamentals first, tighten with valuation, then check the technical setup, and finish with a sized, actionable plan.",
      note: "Counts shown are illustrative, not real screen results",
    },
    "financials-three-statements": {
      title: "How the three statements link",
      caption:
        "Net income flows into retained earnings on the balance sheet and starts the cash flow statement — three views of one business.",
      note: "Simplified linkages; real line items are more granular",
    },
    "peer-compare": {
      title: "Peer multiples: P/E vs growth",
      caption:
        "Put several P/E ratios side by side with the sector median; when one deviates, ask what the market is pricing in.",
      note: "Fictional companies and data, not real quotes",
    },
    "kline-basics": {
      title: "Anatomy of a single candlestick",
      caption:
        "The body spans open to close; the wicks mark the high and low. Right: a typical candle sequence in an uptrend.",
      note: "Conceptual illustration, not market data",
    },
    "stocks-support-resistance": {
      title: "Support and resistance: range trading",
      caption:
        "Price oscillates inside a box; the top edge acts as resistance, the bottom as support. Levels touched repeatedly matter most.",
      note: "Conceptual illustration, not market data",
    },
    "stocks-false-breakout": {
      title: "True breakout vs false breakout",
      caption:
        "Left: price retests the level, holds, and the trend resumes. Right: price pokes out, falls back into the box, then drops.",
      note: "Conceptual illustration, not market data",
    },
    "indicator-trend-momentum": {
      title: "Trend indicators vs momentum indicators",
      caption:
        "Left: moving averages coil, then fan out to show direction. Right: momentum swings between extremes while a histogram shows force.",
      note: "Conceptual illustration, not indicator data",
    },
    "risk-reward-expectancy": {
      title: "Risk-reward and expectancy",
      caption:
        "Measure the distance to stop and target before entering; the formula shows long-run results depend on win rate and payoff ratio together.",
      note: "Simplified model; fees and slippage excluded",
    },
    "stocks-exit-rules": {
      title: "Three doors to exit",
      caption:
        "Target hit, invalidation level broken, or thesis changed — any one of them leads to the same action: exit.",
      note: "Conceptual; follow the rules in each article",
    },
    "paper-review": {
      title: "The review loop",
      caption:
        "Plan, trade, record, review, adjust — each step feeds the next. Without records, review drifts into storytelling.",
      note: "Conceptual; adapt the cadence to your own routine",
    },
    "money-traps-small-capital": {
      title: "Two paths for small capital: compounding vs reset-to-zero",
      caption:
        "The upper line is slow DCA compounding. The lower line gets broken at four traps — real installment rates, one all-in bet, paid signal groups, guaranteed-high-yield pools — and ends at zero.",
      note: "Illustrative curves; recovery years estimated at 8% annually",
    },
    "book-poor-charlie-almanack": {
      title: "Invert: the forward question has no answer, the reverse is all action",
      caption:
        "Left: 'how do I make 20%' — no executable answer. Right: 'how do I lose 30%' — a concrete list. Delete the list, and what remains drifts toward positive returns.",
      note: "Conceptual; the arithmetic lives in the traps article",
    },
    "money-and-desire": {
      title: "The hedonic treadmill: income climbs, desire jumps a level",
      caption:
        "Income is a slow curve; desire is a staircase — the baseline jumps right after each 'temporary satisfaction'. The gap between the lines is the anxiety. The only fair benchmark is last year's you.",
      note: "Conceptual; worked numbers live in the article",
    },
  },
};

function MultiMarketDiagram({ zh }: { zh: boolean }) {
  const cards = zh
    ? [
        { name: "美股", rows: ["9:30–16:00", "美元 USD", "绿涨红跌"] },
        { name: "港股", rows: ["9:30–16:00", "港币 HKD", "绿涨红跌"] },
        { name: "A股", rows: ["9:30–15:00", "人民币 CNY", "红涨绿跌"] },
        { name: "加密货币", rows: ["7×24 全年无休", "USDT 等稳定币", "无统一习惯"] },
      ]
    : [
        { name: "US stocks", rows: ["9:30–16:00 ET", "USD", "Green up, red down"] },
        { name: "HK stocks", rows: ["9:30–16:00 HKT", "HKD", "Green up, red down"] },
        { name: "A-shares", rows: ["9:30–15:00 CST", "CNY", "Red up, green down"] },
        { name: "Crypto", rows: ["24/7, all year", "USDT and peers", "No fixed habit"] },
      ];
  const rowLabels = zh ? ["时段", "货币", "涨跌色"] : ["Session", "Currency", "Up-down"];
  return (
    <>
      {cards.map((card, i) => {
        const x = 16 + i * 168;
        return (
          <g key={card.name}>
            <rect
              x={x}
              y="26"
              width="152"
              height="184"
              rx="12"
              fill="none"
              className="card-border"
            />
            <text
              x={x + 76}
              y="52"
              textAnchor="middle"
              className="diagram-strong"
            >
              {card.name}
            </text>
            <path d={`M${x + 14} 64H${x + 138}`} className="divider" />
            {card.rows.map((row, r) => (
              <g key={rowLabels[r]}>
                <text x={x + 14} y={86 + r * 44} className="diagram-tiny">
                  {rowLabels[r]}
                </text>
                <text x={x + 14} y={104 + r * 44} className="diagram-strong-sm">
                  {row}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </>
  );
}

function StockPickingDiagram({ zh }: { zh: boolean }) {
  const layers = zh
    ? ["基本面筛选", "估值检查", "技术位置", "计划与仓位"]
    : ["Fundamental screen", "Valuation check", "Technical setup", "Plan & sizing"];
  const notes = zh
    ? ["全市场几千只", "估值留下 ~50 只", "技术位置筛到 ~10 只", "1 份可执行计划"]
    : ["Thousands of stocks", "Valuation → ~50", "Setup → ~10", "1 actionable plan"];
  const shapes = [
    "M130 30H550L520 66H160Z",
    "M160 66H520L490 102H190Z",
    "M190 102H490L460 138H220Z",
    "M220 138H460L430 174H250Z",
  ];
  const opacities = [0.88, 0.7, 0.55, 0.42];
  const mids = [52, 88, 124, 160];
  return (
    <>
      {shapes.map((d, i) => (
        <g key={layers[i]}>
          <path d={d} fill="var(--brand)" fillOpacity={opacities[i]} />
          <text x="340" y={mids[i]! + 4} textAnchor="middle" className="diagram-strong">
            {layers[i]}
          </text>
          <text x="566" y={mids[i]! + 4} className="diagram-tiny">
            {notes[i]}
          </text>
        </g>
      ))}
    </>
  );
}

function ThreeStatementsDiagram({ zh }: { zh: boolean }) {
  const boxes = zh
    ? [
        { title: "利润表", sub: "收入 − 成本费用 = 净利润" },
        { title: "资产负债表", sub: "资产 = 负债 + 股东权益" },
        { title: "现金流量表", sub: "经营 · 投资 · 筹资" },
      ]
    : [
        { title: "Income statement", sub: "Revenue − costs = net income" },
        { title: "Balance sheet", sub: "Assets = liabilities + equity" },
        { title: "Cash flow statement", sub: "cash in − cash out" },
      ];
  const xs = [30, 260, 490];
  const centers = [110, 340, 570];
  const arrowLabel1 = zh ? "净利润结转" : "net income";
  const arrowLabel2 = zh ? "期末现金计入" : "ending cash added";
  const flowLabel1 = zh ? "净利润" : "net income";
  const flowLabel2 = zh ? "计入留存收益" : "added to retained earnings";
  const flowLabel3 = zh ? "现金流量表起点" : "starts the cash flow statement";
  return (
    <>
      {boxes.map((box, i) => (
        <g key={box.title}>
          <rect
            x={xs[i]}
            y="44"
            width="160"
            height="78"
            rx="12"
            fill="var(--brand)"
            fillOpacity="0.12"
            className="card-border"
          />
          <text x={centers[i]} y="74" textAnchor="middle" className="diagram-strong">
            {box.title}
          </text>
          <text x={centers[i]} y="98" textAnchor="middle" className="diagram-tiny">
            {box.sub}
          </text>
        </g>
      ))}
      <path d="M194 83H252" className="arrow-line" />
      <path d="M252 78L260 83L252 88Z" fill="var(--muted)" />
      <text x="227" y="102" textAnchor="middle" className="diagram-tiny">
        {arrowLabel1}
      </text>
      <path d="M486 83H428" className="arrow-line" />
      <path d="M428 78L420 83L428 88Z" fill="var(--muted)" />
      <text x="457" y="102" textAnchor="middle" className="diagram-tiny">
        {arrowLabel2}
      </text>
      <circle cx="110" cy="130" r="3.5" fill="var(--brand)" />
      <text x="120" y="148" className="diagram-tiny">
        {flowLabel1}
      </text>
      <path d="M110 130V152H340V136" className="flow-line" fill="none" />
      <path d="M335 136L340 126L345 136Z" fill="var(--brand)" />
      <text x="340" y="172" textAnchor="middle" className="diagram-tiny">
        {flowLabel2}
      </text>
      <path d="M110 152H570V136" className="flow-line" fill="none" />
      <path d="M565 136L570 126L575 136Z" fill="var(--brand)" />
      <text x="570" y="172" textAnchor="middle" className="diagram-tiny">
        {flowLabel3}
      </text>
    </>
  );
}

function PeerCompareDiagram({ zh }: { zh: boolean }) {
  const names = zh
    ? ["甲公司", "乙公司", "丙公司", "丁公司"]
    : ["Co. A", "Co. B", "Co. C", "Co. D"];
  const pes = [15, 22, 34, 27];
  const growth = zh
    ? ["增速 +18%", "增速 +12%", "增速 +35%", "增速 +9%"]
    : ["growth +18%", "growth +12%", "growth +35%", "growth +9%"];
  const tops = [133, 101, 47, 79];
  const centers = [155, 295, 435, 575];
  const medianLabel = zh ? "行业中位数 PE ≈ 25" : "Sector median PE ≈ 25";
  const axisLabel = zh ? "市盈率（倍）" : "P/E";
  return (
    <>
      <path d="M60 36V200" className="axis-line" />
      <path d="M60 200H640" className="axis-line" />
      <text x="64" y="30" className="diagram-tiny">
        {axisLabel}
      </text>
      {pes.map((pe, i) => (
        <g key={names[i]}>
          <rect
            x={centers[i]! - 30}
            y={tops[i]}
            width="60"
            height={200 - tops[i]!}
            rx="3"
            fill="var(--brand)"
            fillOpacity="0.75"
          />
          <text
            x={centers[i]}
            y={tops[i]! - 8}
            textAnchor="middle"
            className="diagram-strong"
          >
            {pe}
          </text>
          <text
            x={centers[i]}
            y={tops[i]! - 26}
            textAnchor="middle"
            className="diagram-tiny"
          >
            {growth[i]}
          </text>
          <text
            x={centers[i]}
            y="220"
            textAnchor="middle"
            className="diagram-label"
          >
            {names[i]}
          </text>
        </g>
      ))}
      <path d="M60 88H640" className="median-line" fill="none" />
      <text x="64" y="82" className="diagram-tiny">
        {medianLabel}
      </text>
    </>
  );
}

function KlineBasicsDiagram({ zh }: { zh: boolean }) {
  const singleLabels = zh
    ? ["最高价", "收盘价", "开盘价", "最低价"]
    : ["High", "Close", "Open", "Low"];
  const wickLabel = zh ? "影线" : "Wick";
  const bodyLabel = zh ? "实体" : "Body";
  const groupLabel = zh
    ? "上涨途中的一组 K 线（示意）"
    : "A sequence of candles in an uptrend";
  const candles = [
    { x: 408, top: 150, bot: 188, bt: 160, bb: 180, up: true },
    { x: 440, top: 142, bot: 182, bt: 148, bb: 176, up: true },
    { x: 472, top: 144, bot: 178, bt: 150, bb: 170, up: false },
    { x: 504, top: 134, bot: 174, bt: 140, bb: 168, up: true },
    { x: 536, top: 122, bot: 164, bt: 128, bb: 158, up: true },
    { x: 568, top: 106, bot: 152, bt: 112, bb: 146, up: true },
    { x: 600, top: 110, bot: 140, bt: 116, bb: 132, up: false },
    { x: 632, top: 90, bot: 130, bt: 96, bb: 124, up: true },
  ];
  return (
    <>
      <path d="M150 35V185" stroke="var(--up)" strokeWidth="1.6" fill="none" />
      <rect x="125" y="70" width="50" height="80" fill="var(--up)" />
      <path d="M154 35H230M180 70H230M180 150H230M154 185H230" className="leader-line" />
      <text x="236" y="39" className="diagram-label">{singleLabels[0]}</text>
      <text x="236" y="74" className="diagram-label">{singleLabels[1]}</text>
      <text x="236" y="154" className="diagram-label">{singleLabels[2]}</text>
      <text x="236" y="189" className="diagram-label">{singleLabels[3]}</text>
      <path d="M104 36H146M104 110H121" className="leader-line" />
      <text x="100" y="40" textAnchor="end" className="diagram-label">{wickLabel}</text>
      <text x="100" y="114" textAnchor="end" className="diagram-label">{bodyLabel}</text>
      <path d="M330 26V206" className="divider" />
      {candles.map((c) => (
        <g key={c.x} fill={c.up ? "var(--up)" : "var(--down)"}>
          <path
            d={`M${c.x} ${c.top}V${c.bot}`}
            stroke={c.up ? "var(--up)" : "var(--down)"}
            strokeWidth="1.5"
            fill="none"
          />
          <rect x={c.x - 7} y={c.bt} width="14" height={c.bb - c.bt} />
        </g>
      ))}
      <text x="520" y="216" textAnchor="middle" className="diagram-tiny">
        {groupLabel}
      </text>
    </>
  );
}

function SupportResistanceDiagram({ zh }: { zh: boolean }) {
  const resLabel = zh ? "阻力带" : "Resistance";
  const supLabel = zh ? "支撑带" : "Support";
  return (
    <>
      <rect x="60" y="52" width="560" height="18" fill="var(--down)" opacity="0.16" />
      <rect x="60" y="172" width="560" height="18" fill="var(--up)" opacity="0.16" />
      <path d="M60 52H620M60 190H620" className="edge-line" />
      <text x="620" y="44" textAnchor="end" className="diagram-label">{resLabel}</text>
      <text x="620" y="208" textAnchor="end" className="diagram-label">{supLabel}</text>
      <path
        d="M70 152C92 120 112 94 132 68S166 150 194 176 234 160 254 112 284 66 314 56 344 140 374 178 414 150 444 106 476 72 514 58 542 98 568 130"
        className="stroke-brand"
      />
    </>
  );
}

function FalseBreakoutDiagram({ zh }: { zh: boolean }) {
  const leftTitle = zh ? "真突破" : "True breakout";
  const rightTitle = zh ? "假突破" : "False breakout";
  const leftNote = zh ? "回踩不破，趋势延续" : "Retest holds, trend resumes";
  const rightNote = zh ? "冲高回落，跌回箱体" : "Falls back into the box";
  return (
    <>
      <text x="170" y="26" textAnchor="middle" className="diagram-strong">{leftTitle}</text>
      <path d="M34 110H316" className="zero-line" />
      <path
        d="M40 162C62 152 78 132 98 126S132 150 158 144 178 116 192 90 208 92 222 106 246 108 268 84 300 46"
        className="stroke-brand"
      />
      <circle cx="234" cy="107" r="4.5" fill="none" stroke="var(--brand)" strokeWidth="2" />
      <text x="170" y="222" textAnchor="middle" className="diagram-tiny">{leftNote}</text>
      <path d="M340 24V206" className="divider" />
      <text x="510" y="26" textAnchor="middle" className="diagram-strong">{rightTitle}</text>
      <path d="M364 110H646" className="zero-line" />
      <path
        d="M380 162C402 152 418 132 438 126S472 148 498 142 514 116 526 92 538 96 550 122 566 146 600 168 644 178"
        className="stroke-brand"
      />
      <circle cx="526" cy="92" r="4.5" fill="none" stroke="var(--down)" strokeWidth="2" />
      <text x="510" y="222" textAnchor="middle" className="diagram-tiny">{rightNote}</text>
    </>
  );
}

function TrendMomentumDiagram({ zh }: { zh: boolean }) {
  const leftTitle = zh ? "趋势指标：粘合 → 发散" : "Trend: MAs coil, then fan out";
  const rightTitle = zh ? "动量指标：区间与柱体" : "Momentum: bands and histogram";
  const legend = zh ? ["快线", "中线", "慢线"] : ["Fast", "Mid", "Slow"];
  const obLabel = zh ? "超买" : "Overbought";
  const osLabel = zh ? "超卖" : "Oversold";
  return (
    <>
      <text x="180" y="26" textAnchor="middle" className="diagram-strong-sm">{leftTitle}</text>
      <path d="M40 152C90 146 130 130 180 124S250 92 320 56" className="ma-fast" fill="none" />
      <path d="M40 136C90 134 130 126 180 123S250 114 320 96" className="ma-mid" fill="none" />
      <path d="M40 120C90 122 130 122 180 122S250 138 320 158" className="ma-slow" fill="none" />
      <path d="M60 228H84" className="ma-fast" />
      <text x="90" y="232" className="diagram-tiny">{legend[0]}</text>
      <path d="M150 228H174" className="ma-mid" />
      <text x="180" y="232" className="diagram-tiny">{legend[1]}</text>
      <path d="M240 228H264" className="ma-slow" />
      <text x="270" y="232" className="diagram-tiny">{legend[2]}</text>
      <path d="M340 24V206" className="divider" />
      <text x="510" y="26" textAnchor="middle" className="diagram-strong-sm">{rightTitle}</text>
      <path d="M368 62H656M368 134H656" className="threshold-line" />
      <text x="656" y="58" textAnchor="end" className="diagram-tiny">{obLabel}</text>
      <text x="656" y="150" textAnchor="end" className="diagram-tiny">{osLabel}</text>
      <path
        d="M372 128C392 112 406 92 426 76S456 118 476 126 496 128 516 106 546 68 566 74 590 100 610 118 634 114 652 98"
        className="stroke-brand"
      />
      <path d="M368 178H656" className="zero-line" />
      <path
        d="M392 178v-14M424 178v-18M440 178v-10M504 178v-8M520 178v-16M536 178v-22M552 178v-12M616 178v-6M632 178v-14M648 178v-4"
        className="hbar-up"
      />
      <path
        d="M376 178v8M408 178v6M456 178v14M472 178v20M488 178v10M568 178v6M584 178v16M600 178v10"
        className="hbar-down"
      />
    </>
  );
}

function RiskRewardDiagram({ zh }: { zh: boolean }) {
  const targetLabel = zh ? "目标价" : "Target";
  const stopLabel = zh ? "止损" : "Stop";
  const entryLabel = zh ? "开仓价" : "Entry";
  const rewardLabel = zh ? "收益" : "Reward";
  const riskLabel = zh ? "风险" : "Risk";
  const formulaTitle = zh ? "期望值" : "Expectancy";
  const formula = zh
    ? "胜率 × 平均盈利 − 败率 × 平均亏损"
    : "win rate × avg win − loss rate × avg loss";
  const formulaNote = zh
    ? "正期望，才值得反复执行"
    : "Only a positive edge deserves repetition";
  const example = zh
    ? "例：胜率 40% × 盈亏比 2:1 → 期望为正"
    : "e.g. 40% win rate at 2:1 payoff is positive";
  return (
    <>
      <path d="M96 60H340" className="level-up" />
      <text x="346" y="64" fill="var(--up)" className="diagram-tiny">{targetLabel}</text>
      <path d="M96 185H340" className="level-down" />
      <text x="346" y="189" fill="var(--down)" className="diagram-tiny">{stopLabel}</text>
      <path d="M96 140H160" className="zero-line" />
      <text x="98" y="130" className="diagram-tiny">{entryLabel}</text>
      <path
        d="M45 176C70 182 90 178 110 166S132 148 150 138 180 116 210 96 250 78 290 64 330 56 352 52"
        className="stroke-brand"
      />
      <circle cx="150" cy="138" r="4.5" fill="var(--brand)" />
      <path d="M84 140V185" className="arrow-line" />
      <path d="M80 146L84 138L88 146Z" fill="var(--down)" />
      <path d="M80 179L84 187L88 179Z" fill="var(--down)" />
      <text x="78" y="167" textAnchor="end" fill="var(--down)" className="diagram-tiny">{riskLabel}</text>
      <path d="M84 60V140" className="arrow-line" />
      <path d="M80 66L84 58L88 66Z" fill="var(--up)" />
      <path d="M80 134L84 142L88 134Z" fill="var(--up)" />
      <text x="78" y="104" textAnchor="end" fill="var(--up)" className="diagram-tiny">{rewardLabel}</text>
      <rect
        x="396"
        y="56"
        width="254"
        height="118"
        rx="14"
        fill="var(--brand)"
        fillOpacity="0.08"
        className="card-border"
      />
      <text x="523" y="90" textAnchor="middle" className="diagram-strong">{formulaTitle}</text>
      <text x="523" y="122" textAnchor="middle" fill="var(--foreground)" fontSize="11.5">
        {formula}
      </text>
      <text x="523" y="150" textAnchor="middle" className="diagram-tiny">{formulaNote}</text>
      <text x="523" y="202" textAnchor="middle" className="diagram-tiny">{example}</text>
    </>
  );
}

function ExitRulesDiagram({ zh }: { zh: boolean }) {
  const gates = zh
    ? [
        { title: "达到目标价", sub: "按计划止盈" },
        { title: "失效价触发", sub: "跌破关键位离场" },
        { title: "论点变化", sub: "买入理由不再成立" },
      ]
    : [
        { title: "Target price hit", sub: "take profit as planned" },
        { title: "Invalidation hit", sub: "key level broken" },
        { title: "Thesis changed", sub: "reason to own is gone" },
      ];
  const exitLabel = zh ? "离场" : "Exit";
  const xs = [30, 250, 470];
  const centers = [120, 340, 560];
  return (
    <>
      {gates.map((gate, i) => (
        <g key={gate.title}>
          <rect
            x={xs[i]}
            y="40"
            width="180"
            height="64"
            rx="12"
            fill="var(--brand)"
            fillOpacity="0.12"
            className="card-border"
          />
          <text x={centers[i]} y="66" textAnchor="middle" className="diagram-strong">
            {gate.title}
          </text>
          <text x={centers[i]} y="88" textAnchor="middle" className="diagram-tiny">
            {gate.sub}
          </text>
        </g>
      ))}
      <path d="M120 104C120 138 260 142 310 162" className="flow-line" fill="none" />
      <path d="M310 157L320 164L308 169Z" fill="var(--muted)" />
      <path d="M340 104V158" className="flow-line" />
      <path d="M334 156L340 168L346 156Z" fill="var(--muted)" />
      <path d="M560 104C560 138 420 142 370 162" className="flow-line" fill="none" />
      <path d="M370 157L360 164L372 169Z" fill="var(--muted)" />
      <rect
        x="272"
        y="176"
        width="136"
        height="46"
        rx="12"
        fill="var(--brand)"
        fillOpacity="0.9"
      />
      <text x="340" y="205" textAnchor="middle" fill="var(--brand-text)" className="diagram-strong">
        {exitLabel}
      </text>
    </>
  );
}

function PaperReviewDiagram({ zh }: { zh: boolean }) {
  const nodes = zh
    ? ["计划", "执行", "记录", "复盘", "修正"]
    : ["Plan", "Trade", "Log", "Review", "Adjust"];
  const points = [
    { x: 340, y: 40 },
    { x: 424, y: 101 },
    { x: 392, y: 199 },
    { x: 288, y: 199 },
    { x: 256, y: 101 },
  ];
  const arrows = [
    { x: 392, y: 57, r: 36 },
    { x: 408, y: 150, r: 108 },
    { x: 340, y: 199, r: 180 },
    { x: 272, y: 150, r: -108 },
    { x: 298, y: 70, r: -36 },
  ];
  const centerTitle = zh ? "复盘闭环" : "Review loop";
  const centerNote = zh ? "每周一轮" : "once a week";
  return (
    <>
      <circle cx="340" cy="128" r="88" className="ring" />
      {arrows.map((a) => (
        <path
          key={`${a.x}-${a.y}`}
          d="M-6 -4.5L6 0L-6 4.5Z"
          fill="var(--brand)"
          transform={`translate(${a.x} ${a.y}) rotate(${a.r})`}
        />
      ))}
      {points.map((p, i) => (
        <g key={nodes[i]}>
          <circle
            cx={p.x}
            cy={p.y}
            r="31"
            fill="var(--brand)"
            fillOpacity="0.14"
            className="node-border"
          />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            className={zh ? "diagram-strong-sm" : "diagram-tiny-strong"}
          >
            {nodes[i]}
          </text>
        </g>
      ))}
      <text x="340" y="124" textAnchor="middle" className="diagram-strong">{centerTitle}</text>
      <text x="340" y="146" textAnchor="middle" className="diagram-tiny">{centerNote}</text>
    </>
  );
}

function MoneyTrapsDiagram({ zh }: { zh: boolean }) {
  const traps = zh
    ? ["分期实际利率", "一次 all-in", "付费荐股", "保本高息盘子"]
    : ["Installments 13%", "One all-in", "Paid signals", "Guaranteed pool"];
  const trapX = [150, 285, 380, 470];
  const goodTitle = zh ? "小额定投" : "DCA discipline";
  const goodSub = zh ? "慢，但在复利" : "slow, but compounding";
  const zero = zh ? "归零" : "Reset";
  const startLabel = zh ? "起点本金" : "Starting capital";
  return (
    <>
      <path d="M60 30V190H640" className="axis-line" />
      <path d="M60 176H640" className="zero-line" />
      <text x="66" y="170" className="diagram-tiny">{startLabel}</text>
      <path
        d="M60 176C160 168 260 142 380 116C460 99 560 76 630 62"
        className="ma-fast"
      />
      <circle cx="630" cy="62" r="3.5" fill="var(--brand)" />
      <text x="466" y="66" className="diagram-strong-sm">{goodTitle}</text>
      <text x="466" y="82" className="diagram-tiny">{goodSub}</text>
      <path
        d="M60 177H150C165 178 180 180 200 182C235 185 262 185 285 186L310 188C330 189 345 190 360 190C420 190 470 190 520 190"
        stroke="var(--down)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {trapX.map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={176 + i * 4.5}
            r="4.5"
            fill="var(--down)"
            fillOpacity="0.9"
          />
          <path d={`M${x} ${182 + i * 4.5}V200`} className="leader-line" />
          <text
            x={x}
            y="212"
            textAnchor="middle"
            className="diagram-tiny"
          >
            {traps[i]}
          </text>
        </g>
      ))}
      <text x="560" y="184" fill="var(--down)" className="diagram-strong-sm">
        {zero}
      </text>
    </>
  );
}

function InversionDiagram({ zh }: { zh: boolean }) {
  const fwdTitle = zh ? "怎么赚 20%？" : "How to make 20%?";
  const fwdSub = zh ? "没有本周可执行的答案" : "no executable answer";
  const revTitle = zh ? "怎么亏 30%？" : "How to lose 30%?";
  const revItems = zh
    ? ["借 13% 的钱买资产", "在一个故事上 all-in", "追涨、跨出能力圈", "听大师预测调仓"]
    : ["Borrow at 13% to invest", "All-in one story", "Chase, leave your circle", "Trade on guru forecasts"];
  const bottom = zh ? "避开蠢事，剩下交给复利" : "Refuse the dumb stuff; compounding works";
  return (
    <>
      <rect x="40" y="46" width="200" height="128" rx="12" fill="var(--surface-2, var(--panel))" className="card-border" />
      <text x="140" y="84" textAnchor="middle" className="diagram-strong">{fwdTitle}</text>
      <text x="140" y="108" textAnchor="middle" className="diagram-tiny">{fwdSub}</text>
      <text x="140" y="140" textAnchor="middle" className="diagram-tiny">{zh ? "只能等，或靠运气" : "wait, or rely on luck"}</text>

      <rect x="440" y="46" width="200" height="128" rx="12" fill="var(--brand)" fillOpacity="0.1" className="card-border" />
      <text x="540" y="74" textAnchor="middle" className="diagram-strong">{revTitle}</text>
      {revItems.map((t, i) => (
        <text key={t} x="540" y={98 + i * 18} textAnchor="middle" className="diagram-tiny">
          {t}
        </text>
      ))}

      <path d="M150 178C170 196 220 200 268 200" className="flow-line" fill="none" />
      <path d="M266 194L280 200L266 206Z" fill="var(--muted)" />
      <path d="M530 178C510 196 460 200 412 200" className="flow-line" fill="none" />
      <path d="M414 194L400 200L414 206Z" fill="var(--muted)" />

      <rect x="240" y="176" width="200" height="48" rx="12" fill="var(--brand)" fillOpacity="0.9" />
      <text x="340" y="205" textAnchor="middle" fill="var(--brand-text)" className="diagram-strong-sm">
        {bottom}
      </text>
    </>
  );
}

function MoneyDesireDiagram({ zh }: { zh: boolean }) {
  const incomeLabel = zh ? "收入（缓升）" : "Income (slow)";
  const desireLabel = zh ? "欲望基线（跳级）" : "Desire baseline (jumps)";
  const gapLabel = zh ? "缺口 = 焦虑" : "gap = anxiety";
  const resetLabel = zh ? "基线重置" : "baseline reset";
  const youLabel = zh ? "参照系：去年的自己" : "Benchmark: last year's you";
  return (
    <>
      <path d="M60 30V190H640" className="axis-line" />
      <path
        d="M60 176C180 166 320 148 470 126C540 116 600 108 636 102"
        className="ma-fast"
      />
      <text x="486" y="94" className="diagram-strong-sm">{incomeLabel}</text>
      <path
        d="M60 178H130L170 148H250L290 122H380L420 96H510L550 74H636"
        stroke="var(--down)"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <text x="470" y="60" stroke="none" fill="var(--down)" className="diagram-strong-sm">
        {desireLabel}
      </text>
      {[[170, 148], [290, 122], [420, 96], [550, 74]].map(([x, y]) => (
        <g key={x}>
          <line x1={x} y1={y + 8} x2={x} y2={y + 26} stroke="var(--muted)" strokeDasharray="3 4" />
          <circle cx={x} cy={y} r="3" fill="var(--down)" />
        </g>
      ))}
      <text x="216" y="188" className="diagram-tiny">{resetLabel}</text>
      <rect x="330" y="118" width="220" height="34" rx="8" fill="var(--brand)" fillOpacity="0.08" />
      <text x="440" y="140" textAnchor="middle" fill="var(--foreground)" className="diagram-tiny">
        {gapLabel}
      </text>
      <rect x="60" y="42" width="180" height="30" rx="8" fill="var(--surface-2, var(--panel))" className="card-border" />
      <text x="150" y="62" textAnchor="middle" className="diagram-tiny">{youLabel}</text>
    </>
  );
}

function Diagram({ id, zh }: { id: TopicDiagram; zh: boolean }) {
  switch (id) {
    case "multi-market-101":
      return <MultiMarketDiagram zh={zh} />;
    case "stock-picking-steps":
      return <StockPickingDiagram zh={zh} />;
    case "financials-three-statements":
      return <ThreeStatementsDiagram zh={zh} />;
    case "peer-compare":
      return <PeerCompareDiagram zh={zh} />;
    case "kline-basics":
      return <KlineBasicsDiagram zh={zh} />;
    case "stocks-support-resistance":
      return <SupportResistanceDiagram zh={zh} />;
    case "stocks-false-breakout":
      return <FalseBreakoutDiagram zh={zh} />;
    case "indicator-trend-momentum":
      return <TrendMomentumDiagram zh={zh} />;
    case "risk-reward-expectancy":
      return <RiskRewardDiagram zh={zh} />;
    case "stocks-exit-rules":
      return <ExitRulesDiagram zh={zh} />;
    case "paper-review":
      return <PaperReviewDiagram zh={zh} />;
    case "money-traps-small-capital":
      return <MoneyTrapsDiagram zh={zh} />;
    case "money-and-desire":
      return <MoneyDesireDiagram zh={zh} />;
    case "book-poor-charlie-almanack":
      return <InversionDiagram zh={zh} />;
  }
}

export function isTopicIllustrationSlug(slug: string): boolean {
  return DIAGRAMS.has(slug);
}

export function LearnTopicIllustration({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  if (!DIAGRAMS.has(slug)) return null;
  const id = slug as TopicDiagram;
  const zh = !locale.startsWith("en");
  const label = LABELS[zh ? "zh" : "en"][id];

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="border-b border-[var(--border)] px-4 py-3.5 sm:px-6">
        <p className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          {label.title}
        </p>
      </div>
      <div className="overflow-x-auto px-3 py-5 sm:px-6 sm:py-6">
        <svg
          aria-label={label.title}
          className="h-auto min-h-[200px] min-w-[560px] w-full sm:min-h-[240px]"
          role="img"
          viewBox="0 0 680 240"
        >
          <title>{label.title}</title>
          <desc>{label.caption}</desc>
          <Diagram id={id} zh={zh} />
          <style>{`
            .axis-line { stroke: var(--muted); stroke-width: 1; fill: none; opacity: .45; }
            .zero-line { stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 5 4; fill: none; opacity: .6; }
            .divider { stroke: var(--border); stroke-width: 1; stroke-dasharray: 4 5; fill: none; }
            .card-border { stroke: var(--border); stroke-width: 1.2; }
            .node-border { stroke: var(--border); stroke-width: 1.4; }
            .edge-line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 6 4; fill: none; opacity: .55; }
            .leader-line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 3 3; fill: none; opacity: .6; }
            .median-line { stroke: var(--foreground); stroke-width: 1.4; stroke-dasharray: 7 4; opacity: .65; }
            .threshold-line { stroke: #d99b28; stroke-width: 1.4; stroke-dasharray: 5 5; fill: none; opacity: .85; }
            .arrow-line { stroke: var(--muted); stroke-width: 1.4; fill: none; }
            .flow-line { stroke: var(--muted); stroke-width: 1.4; stroke-dasharray: 4 3; }
            .stroke-brand { stroke: var(--brand-text); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
            .ma-fast { stroke: var(--brand-text); stroke-width: 2.4; stroke-linecap: round; fill: none; }
            .ma-mid { stroke: #d99b28; stroke-width: 2.4; stroke-linecap: round; fill: none; }
            .ma-slow { stroke: #8b6bd6; stroke-width: 2.4; stroke-linecap: round; fill: none; }
            .level-up { stroke: var(--up); stroke-width: 1.4; stroke-dasharray: 5 4; fill: none; opacity: .85; }
            .level-down { stroke: var(--down); stroke-width: 1.4; stroke-dasharray: 5 4; fill: none; opacity: .85; }
            .hbar-up { stroke: var(--up); stroke-width: 8; fill: none; opacity: .7; }
            .hbar-down { stroke: var(--down); stroke-width: 8; fill: none; opacity: .7; }
            .ring { stroke: var(--border); stroke-width: 1.5; stroke-dasharray: 4 5; fill: none; }
            .diagram-label { fill: var(--muted); font: 12px system-ui, sans-serif; }
            .diagram-tiny { fill: var(--muted); font: 10.5px system-ui, sans-serif; }
            .diagram-strong { fill: var(--foreground); font: 600 13px system-ui, sans-serif; }
            .diagram-strong-sm { fill: var(--foreground); font: 600 12px system-ui, sans-serif; }
            .diagram-tiny-strong { fill: var(--foreground); font: 600 10.5px system-ui, sans-serif; }
          `}</style>
        </svg>
      </div>
      <figcaption className="px-4 pb-5 pt-1 text-[13px] leading-relaxed text-[var(--muted)] sm:px-6">
        <span className="font-medium text-[var(--foreground)]">{label.note}。</span>{" "}
        {label.caption}
      </figcaption>
    </figure>
  );
}
