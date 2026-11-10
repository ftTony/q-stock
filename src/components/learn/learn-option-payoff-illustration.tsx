type OptionDiagram =
  | "options-basics-roles-pricing"
  | "options-strategies-directional"
  | "options-strategies-volatility"
  | "options-strategies-calendar";

const DIAGRAMS = new Set<string>([
  "options-basics-roles-pricing",
  "options-strategies-directional",
  "options-strategies-volatility",
  "options-strategies-calendar",
]);

const LABELS: Record<
  "zh" | "en",
  Record<OptionDiagram, { title: string; caption: string; note: string }>
> = {
  zh: {
    "options-basics-roles-pricing": {
      title: "看涨 / 看跌：权利与到期盈亏形状",
      caption:
        "左图买看涨：涨过行权价才赚钱；右图买看跌：跌破行权价才赚钱。横轴是到期标的价，纵轴是盈亏。",
      note: "概念示意，未计入手续费与提前行权",
    },
    "options-strategies-directional": {
      title: "方向与持仓相关：单腿 · 担保 · 垂直 · 领口",
      caption:
        "四条线对应本页四种结构。注意：卖出未对冲的裸期权，右侧亏损可以不封顶——图里只画了常见有限风险形态。",
      note: "与个股页策略抽屉里的模板同构",
    },
    "options-strategies-volatility": {
      title: "波动与区间：跨式 · 宽跨式 · 蝶式",
      caption:
        "跨式/宽跨式吃「大波动」；蝶式吃「到期停在中间附近」。权利金高低会把盈亏平衡点整体抬升或压低。",
      note: "到期假设示意，持有期内市价会随 IV 波动",
    },
    "options-strategies-calendar": {
      title: "期限结构：日历与对角",
      caption:
        "近月卖、远月买：赚的是近月时间衰减与波动率曲线的形状差。对角再错开行权价，多一层方向倾斜。",
      note: "示意形态，实际依赖两腿 IV 与剩余天数",
    },
  },
  en: {
    "options-basics-roles-pricing": {
      title: "Calls and puts: rights and expiry payoff shapes",
      caption:
        "Left: long call pays when the underlying finishes above the strike. Right: long put pays below it. X = expiry price, Y = P&L.",
      note: "Conceptual — ignores fees and early exercise",
    },
    "options-strategies-directional": {
      title: "Directional / stock-linked: single, covered, vertical, collar",
      caption:
        "Four shapes match the templates in this article. Naked short options can have uncapped loss — not drawn here.",
      note: "Same building blocks as the symbol options drawer",
    },
    "options-strategies-volatility": {
      title: "Volatility / range: straddle, strangle, butterfly",
      caption:
        "Straddle/strangle want a large move; butterfly wants the underlying near the body at expiry. Premium shifts the break-evens.",
      note: "Expiry sketch — mark-to-market still moves with IV",
    },
    "options-strategies-calendar": {
      title: "Term structure: calendar and diagonal",
      caption:
        "Short near expiry, long far expiry: you are trading decay and the IV curve. Diagonals also stagger strikes for a directional tilt.",
      note: "Shape only — live P&L depends on both IVs and days left",
    },
  },
};

function Axis() {
  return (
    <>
      <path d="M40 20V190H320" className="axis-line" />
      <path d="M40 105H320" className="zero-line" />
    </>
  );
}

function PanelLabel({ x, text }: { x: number; text: string }) {
  return (
    <text x={x} y="214" className="diagram-label">
      {text}
    </text>
  );
}

function BasicsDiagram({ zh }: { zh: boolean }) {
  return (
    <>
      <g transform="translate(0,0)">
        <Axis />
        <path
          d="M40 95 L140 95 L280 30"
          className="pay-up"
          fill="none"
        />
        <path d="M40 95H140" className="pay-flat" fill="none" />
        <text x="148" y="88" className="diagram-label">
          K
        </text>
        <PanelLabel x={40} text={zh ? "买看涨" : "Long call"} />
      </g>
      <g transform="translate(340,0)">
        <Axis />
        <path
          d="M40 30 L160 95 L320 95"
          className="pay-down"
          fill="none"
        />
        <text x="152" y="88" className="diagram-label">
          K
        </text>
        <PanelLabel x={40} text={zh ? "买看跌" : "Long put"} />
      </g>
    </>
  );
}

function DirectionalDiagram({ zh }: { zh: boolean }) {
  const labels = zh
    ? ["买看涨", "备兑看涨", "牛市看涨价差", "领口"]
    : ["Long call", "Covered call", "Bull call vertical", "Collar"];
  return (
    <>
      <g transform="translate(0,0)">
        <Axis />
        <path d="M40 118 L130 118 L300 28" className="pay-up" fill="none" />
        <PanelLabel x={40} text={labels[0]!} />
      </g>
      <g transform="translate(340,0)">
        <Axis />
        <path
          d="M40 160 L130 160 L220 70 L320 70"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[1]!} />
      </g>
      <g transform="translate(0,230)">
        <Axis />
        <path
          d="M40 140 L120 140 L200 55 L320 55"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[2]!} />
      </g>
      <g transform="translate(340,230)">
        <Axis />
        <path
          d="M40 150 L110 150 L190 60 L280 60 L320 60"
          className="pay-flat"
          fill="none"
        />
        <path
          d="M40 150 L110 150 L190 60"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[3]!} />
      </g>
    </>
  );
}

function VolatilityDiagram({ zh }: { zh: boolean }) {
  const labels = zh
    ? ["买跨式", "买宽跨式", "多头蝶式"]
    : ["Long straddle", "Long strangle", "Long butterfly"];
  return (
    <>
      <g transform="translate(0,0)">
        <Axis />
        <path
          d="M40 40 L160 150 L280 40"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[0]!} />
      </g>
      <g transform="translate(340,0)">
        <Axis />
        <path
          d="M40 50 L120 130 L200 130 L280 50"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[1]!} />
      </g>
      <g transform="translate(170,230)">
        <Axis />
        <path
          d="M40 140 L110 140 L160 45 L210 140 L280 140"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[2]!} />
      </g>
    </>
  );
}

function CalendarDiagram({ zh }: { zh: boolean }) {
  const labels = zh ? ["日历价差（示意）", "对角价差（示意）"] : ["Calendar", "Diagonal"];
  return (
    <>
      <g transform="translate(0,0)">
        <Axis />
        <path
          d="M40 150 C90 150 120 40 180 40 C240 40 270 150 320 150"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[0]!} />
      </g>
      <g transform="translate(340,0)">
        <Axis />
        <path
          d="M40 155 C100 155 130 55 200 45 C260 38 290 120 320 90"
          className="pay-up"
          fill="none"
        />
        <PanelLabel x={40} text={labels[1]!} />
      </g>
    </>
  );
}

function Diagram({ id, zh }: { id: OptionDiagram; zh: boolean }) {
  switch (id) {
    case "options-basics-roles-pricing":
      return <BasicsDiagram zh={zh} />;
    case "options-strategies-directional":
      return <DirectionalDiagram zh={zh} />;
    case "options-strategies-volatility":
      return <VolatilityDiagram zh={zh} />;
    case "options-strategies-calendar":
      return <CalendarDiagram zh={zh} />;
  }
}

export function isOptionPayoffIllustrationSlug(slug: string): boolean {
  return DIAGRAMS.has(slug);
}

export function LearnOptionPayoffIllustration({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  if (!DIAGRAMS.has(slug)) return null;
  const id = slug as OptionDiagram;
  const zh = locale.startsWith("zh");
  const label = LABELS[zh ? "zh" : "en"][id];
  const tall =
    id === "options-strategies-directional" ||
    id === "options-strategies-volatility";
  const viewH = tall ? 460 : 230;
  const viewW = 680;

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
          className={`h-auto min-w-[560px] w-full ${tall ? "min-h-[320px] sm:min-h-[400px]" : "min-h-[200px] sm:min-h-[240px]"}`}
          role="img"
          viewBox={`0 0 ${viewW} ${viewH}`}
        >
          <title>{label.title}</title>
          <desc>{label.caption}</desc>
          <Diagram id={id} zh={zh} />
          <style>{`
            .axis-line { stroke: var(--muted); stroke-width: 1.2; fill: none; opacity: .55; }
            .zero-line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 4 4; opacity: .55; }
            .pay-up { stroke: var(--up); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
            .pay-down { stroke: var(--down); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
            .pay-flat { stroke: var(--brand-text); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
            .diagram-label { fill: var(--muted); font: 12px system-ui, sans-serif; }
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
