type OptionsTopic =
  | "options-moneyness-itm-otm"
  | "options-greeks-in-practice"
  | "options-iv-hv-rank"
  | "options-expiry-iv-crush"
  | "options-chain-and-drawer"
  | "options-breakeven-scenarios"
  | "options-earnings-season";

const TOPICS = new Set<OptionsTopic>([
  "options-moneyness-itm-otm",
  "options-greeks-in-practice",
  "options-iv-hv-rank",
  "options-expiry-iv-crush",
  "options-chain-and-drawer",
  "options-breakeven-scenarios",
  "options-earnings-season",
]);

const LABELS: Record<
  "zh" | "en",
  Record<OptionsTopic, { title: string; caption: string; note: string }>
> = {
  zh: {
    "options-moneyness-itm-otm": {
      title: "价内 / 平值 / 价外：取决于方向",
      caption:
        "同一根行权价竖线，看涨期权左边是价内、看跌期权右边是价内——价内价外永远相对于持仓方向而言。",
      note: "概念示意，未计入手续费",
    },
    "options-greeks-in-practice": {
      title: "四个希腊字母：各自被什么输入推动",
      caption:
        "Delta 跟着现价走、Gamma 决定 Delta 变得多快、Theta 随日历流逝、Vega 看隐含波动率脸色。",
      note: "一阶近似示意，实际为非线性联动",
    },
    "options-iv-hv-rank": {
      title: "IV / HV 与分位带：当前波动贵不贵",
      caption:
        "把当前 IV 放进近一年的分布里看位置：贴着上分位带说明权利金偏贵，落在下分位带则相对便宜。",
      note: "示意曲线，非真实行情数据",
    },
    "options-expiry-iv-crush": {
      title: "IV 压缩：事件前爬升、事件后塌陷",
      caption:
        "财报等事件前 IV 往往持续抬升，事件落地后迅速回落；即使方向判断对了，买方也可能被这波回落吞掉利润。",
      note: "概念示意，实际塌陷幅度因事件而异",
    },
    "options-chain-and-drawer": {
      title: "期权链与策略抽屉：从一行报价到一张结构",
      caption:
        "T 型链左边看涨、右边看跌，中间是行权价；点选其中一腿，右侧策略抽屉把它组装成完整结构。",
      note: "界面示意，报价字段以实际行情为准",
    },
    "options-breakeven-scenarios": {
      title: "到期情景：垂直价差的盈利区与亏损区",
      caption:
        "横轴是到期标的价：价格站上盈亏平衡点进入盈利区，停在下方则承受有限亏损——风险收益在开仓前就画好了。",
      note: "到期假设示意，未计入手续费",
    },
    "options-earnings-season": {
      title: "财报周节奏：四个节点走完一笔交易",
      caption:
        "T-5 查 IV 分位定贵贱，T-1 定好结构，财报夜只执行不下判断，T+1 复盘希腊字母与持仓。",
      note: "流程示意，非投资建议",
    },
  },
  en: {
    "options-moneyness-itm-otm": {
      title: "ITM / ATM / OTM: it depends on direction",
      caption:
        "Same strike line: for a call, lower prices are ITM; for a put, higher prices are. Moneyness is always relative to the position.",
      note: "Conceptual — fees not included",
    },
    "options-greeks-in-practice": {
      title: "Four Greeks: what input pushes each one",
      caption:
        "Delta tracks the spot price, Gamma sets how fast Delta moves, Theta bleeds with the calendar, Vega follows implied volatility.",
      note: "First-order sketch — real sensitivities are non-linear",
    },
    "options-iv-hv-rank": {
      title: "IV / HV and percentile bands: is volatility rich?",
      caption:
        "Place today's IV inside its one-year distribution: near the upper band means rich premium, near the lower band means relatively cheap.",
      note: "Illustrative curves, not market data",
    },
    "options-expiry-iv-crush": {
      title: "IV crush: run-up before the event, collapse after",
      caption:
        "IV often climbs into an earnings date and deflates right after; even a correct directional call can lose to that drop.",
      note: "Conceptual — actual crush varies by event",
    },
    "options-chain-and-drawer": {
      title: "Option chain and strategy drawer: one row to a structure",
      caption:
        "Calls on the left, puts on the right, strikes down the middle; picking a leg feeds the strategy drawer that assembles a full structure.",
      note: "UI sketch — quote fields follow live data",
    },
    "options-breakeven-scenarios": {
      title: "Expiry scenarios: profit and loss zones of a vertical",
      caption:
        "X-axis is the expiry price: above the break-even the spread earns, below it the loss is capped — the trade-off is drawn before entry.",
      note: "Expiry sketch — fees not included",
    },
    "options-earnings-season": {
      title: "Earnings-week rhythm: four checkpoints per trade",
      caption:
        "T-5 check the IV rank, T-1 fix the structure, execute only on earnings night, review the Greeks and position at T+1.",
      note: "Process sketch, not investment advice",
    },
  },
};

function MoneynessDiagram({ zh }: { zh: boolean }) {
  return (
    <>
      {/* 看涨一行 */}
      <g transform="translate(0,0)">
        <path d="M40 20V92H640" className="axis-line" />
        <rect x="40" y="24" width="280" height="66" fill="var(--brand)" opacity="0.14" />
        <text x="70" y="80" className="diagram-strong">
          {zh ? "价内 ITM" : "ITM"}
        </text>
        <path d="M320 20V92" className="strike-line" />
        <text x="312" y="16" className="diagram-strong">
          K
        </text>
        <text x="308" y="80" className="diagram-label">
          ATM
        </text>
        <text x="500" y="80" className="diagram-label">
          {zh ? "价外 OTM" : "OTM"}
        </text>
        <text x="40" y="106" className="diagram-label">
          {zh ? "买看涨：价格越低越价内" : "Long call: lower spot = deeper ITM"}
        </text>
      </g>
      {/* 看跌一行 */}
      <g transform="translate(0,128)">
        <path d="M40 20V92H640" className="axis-line" />
        <rect x="320" y="24" width="280" height="66" fill="var(--brand)" opacity="0.14" />
        <text x="500" y="80" className="diagram-strong">
          {zh ? "价内 ITM" : "ITM"}
        </text>
        <path d="M320 20V92" className="strike-line" />
        <text x="312" y="16" className="diagram-strong">
          K
        </text>
        <text x="308" y="80" className="diagram-label">
          ATM
        </text>
        <text x="70" y="80" className="diagram-label">
          {zh ? "价外 OTM" : "OTM"}
        </text>
        <text x="40" y="106" className="diagram-label">
          {zh ? "买看跌：价格越高越价内" : "Long put: higher spot = deeper ITM"}
        </text>
      </g>
    </>
  );
}

function GreeksDiagram({ zh }: { zh: boolean }) {
  const cards = zh
    ? [
        { g: "Delta", line: "← 现价跳动" },
        { g: "Gamma", line: "← Delta 的变化速度" },
        { g: "Theta", line: "← 日历，每天流逝" },
        { g: "Vega", line: "← 隐含波动率" },
      ]
    : [
        { g: "Delta", line: "← spot moves" },
        { g: "Gamma", line: "← how fast Delta moves" },
        { g: "Theta", line: "← the calendar, daily" },
        { g: "Vega", line: "← implied volatility" },
      ];
  const pos = [
    { x: 30, y: 26 },
    { x: 350, y: 26 },
    { x: 30, y: 128 },
    { x: 350, y: 128 },
  ];
  return (
    <>
      {cards.map((card, index) => {
        const { x, y } = pos[index]!;
        return (
          <g key={card.g} transform={`translate(${x},${y})`}>
            <rect
              x="0"
              y="0"
              width="300"
              height="86"
              rx="12"
              className="card-frame"
            />
            <text x="20" y="36" className="diagram-strong" fontSize="18">
              {card.g}
            </text>
            <text x="20" y="64" className="diagram-label" fontSize="13">
              {card.line}
            </text>
          </g>
        );
      })}
    </>
  );
}

function IvhvRankDiagram({ zh }: { zh: boolean }) {
  return (
    <>
      <path d="M48 24V206H650" className="axis-line" />
      <path d="M48 60H650" className="grid-line" />
      <path d="M48 170H650" className="grid-line" />
      {/* 上下分位带 */}
      <path d="M48 60C140 48 220 66 300 56S470 70 650 52L650 74C470 92 380 78 300 88S140 70 48 82Z" className="band-fill" />
      <text x="56" y="54" className="diagram-label">
        {zh ? "上分位带（贵）" : "Upper band (rich)"}
      </text>
      <text x="56" y="182" className="diagram-label">
        {zh ? "下分位带（便宜）" : "Lower band (cheap)"}
      </text>
      {/* HV 平滑线 */}
      <path d="M48 132C110 128 160 122 220 124S330 118 400 112 500 108 560 104 620 100 648 98" className="hv-line" fill="none" />
      {/* IV 曲线 */}
      <path d="M48 150C80 138 100 106 130 98S180 120 210 96 250 60 290 68 330 100 370 84 420 52 470 58 530 84 580 70 648 62" className="iv-line" fill="none" />
      {/* 当前 IV 位置 */}
      <path d="M580 20V206" className="now-line" />
      <circle cx="580" cy="70" r="5" className="now-dot" />
      <text x="500" y="40" className="diagram-strong">
        {zh ? "当前 IV：近一年 72% 分位" : "Current IV: 72nd percentile (1Y)"}
      </text>
      <text x="656" y="102" className="diagram-label">
        HV
      </text>
      <text x="656" y="66" className="diagram-label">
        IV
      </text>
    </>
  );
}

function IvCrushDiagram({ zh }: { zh: boolean }) {
  return (
    <>
      <path d="M48 24V196H650" className="axis-line" />
      {/* 事件日 */}
      <path d="M370 24V196" className="event-line" />
      <text x="344" y="214" className="diagram-strong">
        {zh ? "事件日" : "Event day"}
      </text>
      {/* IV 曲线：事件前爬升、事件后塌陷 */}
      <path d="M48 150C100 142 150 118 200 104S300 74 340 62 356 58 372 56C400 58 430 96 470 118S580 142 648 150" className="iv-line" fill="none" />
      <text x="140" y="96" className="diagram-label">
        {zh ? "事件前 IV 爬升" : "IV run-up"}
      </text>
      <text x="452" y="96" className="diagram-label">
        {zh ? "事件后 IV 塌陷" : "IV crush"}
      </text>
      {/* 权利金回落 */}
      <path d="M372 74C410 84 450 122 500 140S600 160 648 164" className="premium-line" fill="none" />
      <text x="520" y="150" className="diagram-label">
        {zh ? "权利金随之回落" : "Premium deflates"}
      </text>
      <text x="56" y="66" className="diagram-label">
        IV
      </text>
    </>
  );
}

function ChainDiagram({ zh }: { zh: boolean }) {
  // 行数据：y 起点 + 间隔
  const rowY = [66, 92, 118, 144, 170];
  const hi = 2; // 高亮行索引
  return (
    <>
      {/* 表头 */}
      <text x="88" y="46" className="diagram-label">
        {zh ? "Delta" : "Delta"}
      </text>
      <text x="146" y="46" className="diagram-label">
        IV
      </text>
      <text x="198" y="46" className="diagram-label">
        {zh ? "买价" : "Bid"}
      </text>
      <text x="286" y="46" className="diagram-strong">
        {zh ? "行权价" : "Strike"}
      </text>
      <text x="392" y="46" className="diagram-label">
        {zh ? "买价" : "Bid"}
      </text>
      <text x="444" y="46" className="diagram-label">
        IV
      </text>
      <text x="66" y="24" className="diagram-strong">
        {zh ? "Calls 看涨" : "Calls"}
      </text>
      <text x="398" y="24" className="diagram-strong">
        {zh ? "Puts 看跌" : "Puts"}
      </text>
      {/* 高亮行背景 */}
      <rect x="58" y={rowY[hi]! - 18} width="428" height="26" rx="6" fill="var(--brand)" opacity="0.18" />
      {/* 中缝与外框 */}
      <path d="M340 54V190" className="chain-divider" />
      <path d="M58 54H486" className="chain-divider" />
      {/* 行权价列 */}
      {["102", "104", "105", "106", "108"].map((k, index) => (
        <text key={k} x="288" y={rowY[index]!} className={index === hi ? "diagram-strong" : "diagram-label"}>
          {k}
        </text>
      ))}
      {/* 左侧 calls 数据 */}
      {["0.62", "0.55", "0.48", "0.41", "0.33"].map((v, index) => (
        <text key={`d${index}`} x="88" y={rowY[index]!} className="diagram-label">
          {v}
        </text>
      ))}
      {["31%", "29%", "27%", "26%", "25%"].map((v, index) => (
        <text key={`iv${index}`} x="146" y={rowY[index]!} className="diagram-label">
          {v}
        </text>
      ))}
      {["3.10", "2.05", "1.38", "0.86", "0.42"].map((v, index) => (
        <text key={`cb${index}`} x="198" y={rowY[index]!} className="diagram-label">
          {v}
        </text>
      ))}
      {/* 右侧 puts 数据 */}
      {["0.28", "0.52", "0.94", "1.52", "2.60"].map((v, index) => (
        <text key={`pb${index}`} x="392" y={rowY[index]!} className="diagram-label">
          {v}
        </text>
      ))}
      {["26%", "26%", "27%", "28%", "30%"].map((v, index) => (
        <text key={`piv${index}`} x="444" y={rowY[index]!} className="diagram-label">
          {v}
        </text>
      ))}
      {/* 箭头指向策略抽屉 */}
      <path d="M492 118H544" className="arrow-line" />
      <path d="M536 112L546 118L536 124" className="arrow-line" />
      <rect x="552" y="86" width="104" height="62" rx="10" className="card-frame" />
      <text x="568" y="112" className="diagram-strong">
        {zh ? "策略抽屉" : "Strategy"}
      </text>
      <text x="568" y="132" className="diagram-label">
        {zh ? "组装成结构" : "drawer"}
      </text>
      <text x="58" y="216" className="diagram-label">
        {zh ? "点选一腿 → 抽屉里组装价差 / 跨式等结构" : "Pick a leg → assemble spreads / straddles in the drawer"}
      </text>
    </>
  );
}

function BreakevenDiagram({ zh }: { zh: boolean }) {
  return (
    <>
      <path d="M48 24V180H650" className="axis-line" />
      <path d="M48 110H650" className="zero-line" />
      {/* 亏损区：低行权价以下 */}
      <rect x="150" y="110" width="130" height="42" fill="var(--down)" opacity="0.2" />
      {/* 盈利区：盈亏平衡点以上 */}
      <rect x="360" y="68" width="200" height="42" fill="var(--up)" opacity="0.2" />
      {/* 到期盈亏折线：牛市看涨价差 */}
      <path d="M48 152L150 152L280 110L560 68L650 68" className="pay-up" fill="none" />
      {/* 低行权价与盈亏平衡点 */}
      <path d="M280 24V180" className="strike-line" />
      <path d="M360 24V180" className="breakeven-line" />
      <text x="258" y="20" className="diagram-label">
        {zh ? "买 105C" : "Long 105C"}
      </text>
      <text x="330" y="20" className="diagram-strong">
        {zh ? "盈亏平衡 106.3" : "Break-even 106.3"}
      </text>
      <text x="380" y="94" className="diagram-label">
        {zh ? "盈利区" : "Profit zone"}
      </text>
      <text x="180" y="94" className="diagram-label">
        {zh ? "亏损区（有限）" : "Loss zone (capped)"}
      </text>
      <text x="48" y="200" className="diagram-label">
        {zh ? "横轴：到期标的价" : "X: expiry underlying price"}
      </text>
    </>
  );
}

function EarningsDiagram({ zh }: { zh: boolean }) {
  const nodes = zh
    ? [
        { t: "T-5", d: "查 IV 分位" },
        { t: "T-1", d: "定好结构" },
        { t: "财报夜", d: "只执行" },
        { t: "T+1", d: "核对希腊字母" },
      ]
    : [
        { t: "T-5", d: "Check IV rank" },
        { t: "T-1", d: "Fix the structure" },
        { t: "Earnings", d: "Execute only" },
        { t: "T+1", d: "Review Greeks" },
      ];
  const cx = [100, 280, 460, 620];
  return (
    <>
      <path d="M56 110H640" className="axis-line" />
      {nodes.map((node, index) => {
        const x = cx[index]!;
        return (
          <g key={node.t}>
            <circle cx={x} cy="110" r="22" className="node-circle" />
            <text x={x} y="115" textAnchor="middle" className="diagram-strong" fontSize="13">
              {node.t}
            </text>
            <text x={x} y="158" textAnchor="middle" className="diagram-label">
              {node.d}
            </text>
          </g>
        );
      })}
      {/* 节点间箭头 */}
      <path d="M128 110H252" className="arrow-line" />
      <path d="M244 104L254 110L244 116" className="arrow-line" />
      <path d="M308 110H432" className="arrow-line" />
      <path d="M424 104L434 110L424 116" className="arrow-line" />
      <path d="M488 110H592" className="arrow-line" />
      <path d="M584 104L594 110L584 116" className="arrow-line" />
      <text x="56" y="52" className="diagram-label">
        {zh ? "财报周时间线" : "Earnings-week timeline"}
      </text>
      <text x="430" y="86" className="diagram-label">
        {zh ? "事件落地，不猜方向" : "Event lands — no guessing"}
      </text>
    </>
  );
}

function Diagram({ id, zh }: { id: OptionsTopic; zh: boolean }) {
  switch (id) {
    case "options-moneyness-itm-otm":
      return <MoneynessDiagram zh={zh} />;
    case "options-greeks-in-practice":
      return <GreeksDiagram zh={zh} />;
    case "options-iv-hv-rank":
      return <IvhvRankDiagram zh={zh} />;
    case "options-expiry-iv-crush":
      return <IvCrushDiagram zh={zh} />;
    case "options-chain-and-drawer":
      return <ChainDiagram zh={zh} />;
    case "options-breakeven-scenarios":
      return <BreakevenDiagram zh={zh} />;
    case "options-earnings-season":
      return <EarningsDiagram zh={zh} />;
  }
}

export function isOptionsTopicIllustrationSlug(slug: string): boolean {
  return TOPICS.has(slug as OptionsTopic);
}

export function LearnOptionsTopicIllustration({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  if (!TOPICS.has(slug as OptionsTopic)) return null;
  const id = slug as OptionsTopic;
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
            .axis-line { stroke: var(--muted); stroke-width: 1.2; fill: none; opacity: .55; }
            .zero-line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 4 4; opacity: .55; }
            .grid-line { stroke: var(--border); stroke-width: 1; stroke-dasharray: 3 5; }
            .strike-line { stroke: var(--brand-text); stroke-width: 1.6; stroke-dasharray: 5 4; }
            .breakeven-line { stroke: var(--brand); stroke-width: 1.6; stroke-dasharray: 2 3; }
            .event-line { stroke: var(--brand); stroke-width: 1.6; stroke-dasharray: 6 4; opacity: .8; }
            .now-line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 4 4; opacity: .6; }
            .iv-line { stroke: var(--brand-text); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
            .hv-line { stroke: var(--muted); stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: 7 5; opacity: .8; }
            .premium-line { stroke: var(--down); stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: 2 4; }
            .band-fill { fill: var(--border); opacity: .5; stroke: none; }
            .pay-up { stroke: var(--up); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
            .chain-divider { stroke: var(--border); stroke-width: 1.2; }
            .card-frame { fill: none; stroke: var(--border); stroke-width: 1.2; }
            .node-circle { fill: var(--panel); stroke: var(--brand-text); stroke-width: 2; }
            .arrow-line { stroke: var(--brand); stroke-width: 1.8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
            .now-dot { fill: var(--brand); stroke: var(--brand-text); stroke-width: 1.5; }
            .diagram-label { fill: var(--muted); font: 12px system-ui, sans-serif; }
            .diagram-strong { fill: var(--foreground); font: 600 13px system-ui, sans-serif; }
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
