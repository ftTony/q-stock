type Indicator =
  | "indicator-moving-averages"
  | "indicator-macd"
  | "indicator-rsi"
  | "indicator-bollinger-bands"
  | "indicator-atr";

const INDICATORS = new Set<Indicator>([
  "indicator-moving-averages",
  "indicator-macd",
  "indicator-rsi",
  "indicator-bollinger-bands",
  "indicator-atr",
]);

const LABELS: Record<
  "zh" | "en",
  Record<Indicator, { title: string; caption: string; note: string }>
> = {
  zh: {
    "indicator-moving-averages": {
      title: "价格与移动平均线示意图",
      caption: "价格线会先变化，移动平均线随后跟随；EMA 通常比同周期 SMA 反应更快。",
      note: "概念示意，非真实标的行情",
    },
    "indicator-macd": {
      title: "MACD 线与柱体示意图",
      caption: "柱体表示 DIF 与信号线之间的距离；交叉描述动量变化，不保证趋势反转。",
      note: "概念示意，非真实标的行情",
    },
    "indicator-rsi": {
      title: "RSI 区间示意图",
      caption: "70 与 30 是常见参考区间；趋势中 RSI 可以停留在极端区域。",
      note: "概念示意，非真实指标数据",
    },
    "indicator-bollinger-bands": {
      title: "布林带与价格示意图",
      caption: "轨道随近期波动扩张或收敛；触轨本身不代表反转。",
      note: "概念示意，非真实标的行情",
    },
    "indicator-atr": {
      title: "ATR 波动变化示意图",
      caption: "ATR 描述一段时间内的波动幅度，不含涨跌方向。",
      note: "概念示意，非真实指标数据",
    },
  },
  en: {
    "indicator-moving-averages": {
      title: "Price and moving-average illustration",
      caption: "Price changes first; averages follow. EMA typically reacts faster than an SMA with the same period.",
      note: "Conceptual illustration, not market data",
    },
    "indicator-macd": {
      title: "MACD lines and histogram illustration",
      caption: "The histogram shows the gap between DIF and its signal line; a cross is not a guaranteed reversal.",
      note: "Conceptual illustration, not market data",
    },
    "indicator-rsi": {
      title: "RSI range illustration",
      caption: "70 and 30 are common reference levels; RSI can remain extreme during a trend.",
      note: "Conceptual illustration, not indicator data",
    },
    "indicator-bollinger-bands": {
      title: "Price and Bollinger Bands illustration",
      caption: "Bands expand or contract with recent volatility; a touch alone does not imply a reversal.",
      note: "Conceptual illustration, not market data",
    },
    "indicator-atr": {
      title: "ATR volatility illustration",
      caption: "ATR describes the size of recent movement, not its direction.",
      note: "Conceptual illustration, not indicator data",
    },
  },
};

function IndicatorDiagram({ indicator }: { indicator: Indicator }) {
  const common = {
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (indicator) {
    case "indicator-moving-averages":
      return (
        <>
          <path d="M48 35H650M48 90H650M48 145H650M48 200H650" className="grid-line" />
          <path d="M48 25V210M650 25V210" className="axis-line" />
          <path d="M50 165C80 155 92 172 120 148S160 140 188 116 225 132 250 105 285 95 310 120 345 135 370 90 405 82 430 103 465 70 490 80 530 48 560 70 600 35 648 43" className="price-line" {...common} />
          <path d="M50 155C95 151 115 145 145 140S190 125 220 120 265 112 295 110 340 112 370 105 410 92 440 90 485 81 515 75 560 67 590 58 625 50 648 47" className="ma-line" {...common} />
          <path d="M50 160C90 157 112 149 145 143S190 127 220 120 264 112 295 111 339 113 370 104 409 91 440 89 485 80 515 74 558 66 590 57 624 49 648 46" className="ema-line" {...common} />
          <Legend items={["Price", "SMA", "EMA"]} />
        </>
      );
    case "indicator-macd":
      return (
        <>
          <path d="M48 40H650M48 85H650M48 130H650M48 175H650M48 210H650" className="grid-line" />
          <path d="M48 130H650" className="zero-line" />
          <g className="histogram">
            <path d="M80 130V144M115 130V160M150 130V176M185 130V166M220 130V145M255 130V134M290 130V118M325 130V98M360 130V88M395 130V100M430 130V119M465 130V139M500 130V151M535 130V145M570 130V131M605 130V111" />
          </g>
          <path d="M50 145C82 145 93 165 120 161S160 179 190 166 220 140 250 136 280 122 310 105 348 80 375 91 408 116 438 125 468 150 500 153 532 142 560 135 593 109 648 96" className="price-line" {...common} />
          <path d="M50 150C80 149 100 154 122 157S160 166 190 161 220 149 250 141 280 130 310 115 348 99 375 96 408 102 438 111 470 126 500 137 532 140 560 137 593 122 648 105" className="signal-line" {...common} />
          <Legend items={["DIF", "Signal", "Histogram"]} />
        </>
      );
    case "indicator-rsi":
      return (
        <>
          <path d="M48 40H650M48 85H650M48 130H650M48 175H650M48 210H650" className="grid-line" />
          <path d="M48 69H650M48 171H650" className="threshold-line" />
          <path d="M48 120H650" className="zero-line" />
          <path d="M50 130C85 112 100 80 130 87S170 145 205 157 240 169 270 145 302 88 332 74 365 95 395 118 430 151 460 140 490 92 520 84 555 102 580 132 610 177 648 151" className="price-line" {...common} />
          <text x="655" y="73" className="diagram-label">70</text>
          <text x="655" y="175" className="diagram-label">30</text>
          <Legend items={["RSI", "Reference levels"]} />
        </>
      );
    case "indicator-bollinger-bands":
      return (
        <>
          <path d="M48 35H650M48 90H650M48 145H650M48 200H650" className="grid-line" />
          <path d="M48 25V210M650 25V210" className="axis-line" />
          <path d="M50 100C95 81 110 70 145 76S190 100 220 105 265 120 295 115 340 93 370 87 410 95 440 105 485 99 515 81 560 63 590 70 625 99 648 94" className="band-boundary" {...common} />
          <path d="M50 164C95 151 110 147 145 142S190 139 220 136 265 131 295 130 340 129 370 125 410 122 440 119 485 116 515 109 560 102 590 103 625 107 648 104" className="band-boundary" {...common} />
          <path d="M50 132C95 116 110 108 145 109S190 120 220 120 265 126 295 123 340 111 370 106 410 108 440 112 485 108 515 95 560 83 590 87 625 103 648 99" className="ma-line" {...common} />
          <path d="M50 142C80 151 98 128 120 126S156 108 180 120 212 151 238 143 268 101 294 108 324 137 350 131 382 92 408 100 440 129 468 118 498 80 526 86 556 111 586 105 616 82 648 91" className="price-line" {...common} />
          <Legend items={["Price", "Middle average", "Outer bands"]} />
        </>
      );
    case "indicator-atr":
      return (
        <>
          <path d="M48 40H650M48 85H650M48 130H650M48 175H650M48 210H650" className="grid-line" />
          <path d="M48 25V210M650 25V210" className="axis-line" />
          <g className="histogram">
            <path d="M70 195V155M102 195V165M134 195V170M166 195V146M198 195V178M230 195V158M262 195V167M294 195V120M326 195V105M358 195V145M390 195V160M422 195V130M454 195V85M486 195V112M518 195V142M550 195V158M582 195V122M614 195V105" />
          </g>
          <path d="M70 163C94 163 110 165 134 166S158 159 182 160 206 164 230 162 254 164 278 158 302 141 326 138 350 139 374 145 398 150 422 146 446 126 470 121 494 124 518 131 542 140 566 144 590 140 614 131" className="signal-line" {...common} />
          <Legend items={["True range", "ATR average"]} />
        </>
      );
  }
}

function Legend({ items }: { items: string[] }) {
  return (
    <g>
      {items.map((item, index) => {
        const x = 52 + index * 150;
        return (
          <g key={item}>
            <path d={`M${x} 232H${x + 24}`} className={`legend-line legend-${index}`} />
            <text x={x + 31} y="236" className="diagram-label">
              {item}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function LearnIndicatorIllustration({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  if (!INDICATORS.has(slug as Indicator)) return null;
  const indicator = slug as Indicator;
  const language = locale.startsWith("zh") ? "zh" : "en";
  const label = LABELS[language][indicator];

  return (
    <figure className="my-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="overflow-x-auto px-3 pt-4 sm:px-5">
        <svg
          aria-label={label.title}
          className="h-auto min-w-[540px] w-full"
          role="img"
          viewBox="0 0 680 250"
        >
          <title>{label.title}</title>
          <desc>{label.caption}</desc>
          <IndicatorDiagram indicator={indicator} />
          <style>{`
            .grid-line { stroke: var(--border); stroke-width: 1; stroke-dasharray: 3 5; }
            .axis-line { stroke: var(--muted); stroke-width: 1; opacity: .45; }
            .zero-line { stroke: var(--muted); stroke-width: 1.4; stroke-dasharray: 5 4; opacity: .7; }
            .threshold-line { stroke: #d99b28; stroke-width: 1.5; stroke-dasharray: 5 5; opacity: .85; }
            .price-line { stroke: var(--brand-text); stroke-width: 3; }
            .ma-line { stroke: #d99b28; stroke-width: 2.4; }
            .ema-line { stroke: #8b6bd6; stroke-width: 2.4; stroke-dasharray: 7 4; }
            .signal-line { stroke: #d99b28; stroke-width: 2.5; }
            .band-boundary { stroke: #4b9b8c; stroke-width: 2; stroke-dasharray: 6 4; }
            .histogram path { stroke: #4b9b8c; stroke-width: 10; opacity: .68; }
            .diagram-label { fill: var(--muted); font: 12px system-ui, sans-serif; }
            .legend-line { stroke-width: 3; }
            .legend-0 { stroke: var(--brand-text); }
            .legend-1 { stroke: #d99b28; }
            .legend-2 { stroke: #4b9b8c; }
          `}</style>
        </svg>
      </div>
      <figcaption className="px-4 pb-4 pt-2 text-xs leading-relaxed text-[var(--muted)] sm:px-5">
        <span className="font-medium text-[var(--foreground)]">{label.note}。</span>{" "}
        {label.caption}
      </figcaption>
    </figure>
  );
}
