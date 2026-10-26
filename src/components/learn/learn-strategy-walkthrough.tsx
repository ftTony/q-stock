"use client";

type StepMock = {
  titleZh: string;
  titleEn: string;
  hintZh: string;
  hintEn: string;
  kind: "lab" | "copy" | "blocks" | "replay" | "result";
};

const STEPS: StepMock[] = [
  {
    kind: "lab",
    titleZh: "打开规则实验室",
    titleEn: "Open Rule Lab",
    hintZh: "顶部导航 → 规则实验室 → 策略模板库",
    hintEn: "Nav → Rule Lab → Templates",
  },
  {
    kind: "copy",
    titleZh: "复制对应模板",
    titleEn: "Copy the template",
    hintZh: "卡片右下角「复制」，进入我的策略",
    hintEn: "Tap Copy on the card → My strategies",
  },
  {
    kind: "blocks",
    titleZh: "积木改关键参数",
    titleEn: "Edit in Blocks",
    hintZh: "入场 / 出场卡片改数字，可切代码核对",
    hintEn: "Tweak entry/exit cards; Code tab to verify JSON",
  },
  {
    kind: "replay",
    titleZh: "排队规则回放",
    titleEn: "Queue a replay",
    hintZh: "右侧填标的、区间 → 排队回放",
    hintEn: "Symbol + range on the right → Queue replay",
  },
  {
    kind: "result",
    titleZh: "看曲线与成交",
    titleEn: "Read the report",
    hintZh: "对照收益、回撤、交易次数写笔记",
    hintEn: "Note return, drawdown, trade count",
  },
];

function MiniUi({ kind, zh }: { kind: StepMock["kind"]; zh: boolean }) {
  if (kind === "lab") {
    return (
      <div className="flex h-full flex-col justify-center gap-2.5 p-4 sm:p-5">
        <div className="h-2.5 w-24 rounded-md bg-[var(--brand-soft)]" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5"
            >
              <div className="h-2 w-14 rounded bg-[var(--foreground)]/25" />
              <div className="mt-2 h-1.5 w-full rounded bg-[var(--muted)]/25" />
              <div className="mt-1.5 h-1.5 w-3/4 rounded bg-[var(--muted)]/20" />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {zh ? "模板库卡片" : "Template cards"}
        </p>
      </div>
    );
  }
  if (kind === "copy") {
    return (
      <div className="flex h-full min-h-[7.5rem] flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2">
          <div className="h-2.5 w-28 rounded-md bg-[var(--foreground)]/30" />
          <div className="h-2 w-full rounded bg-[var(--muted)]/20" />
          <div className="h-2 w-4/5 rounded bg-[var(--muted)]/15" />
        </div>
        <div className="flex justify-end pt-3">
          <span className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-[12px] font-medium text-white">
            {zh ? "复制" : "Copy"}
          </span>
        </div>
      </div>
    );
  }
  if (kind === "blocks") {
    return (
      <div className="flex h-full flex-col justify-center gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[var(--brand-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--brand-text)]">
            {zh ? "积木" : "Blocks"}
          </span>
          <span className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[12px] text-[var(--muted)]">
            {zh ? "代码" : "Code"}
          </span>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-[var(--muted)]">{zh ? "出场" : "Exit"}</span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5">
              {zh ? "持有 N 根K" : "Hold N bars"}
            </span>
            <span className="rounded-md border border-[var(--brand)] px-2 py-0.5 font-semibold tabular-nums text-[var(--brand-text)]">
              20
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "replay") {
    return (
      <div className="flex h-full flex-col justify-center gap-2.5 p-4 sm:p-5">
        <div className="flex gap-2">
          <div className="flex h-9 flex-1 items-center rounded-md border border-[var(--border)] bg-[var(--panel)] px-2.5 text-[12px] text-[var(--muted)]">
            AAPL
          </div>
          <div className="h-9 w-14 rounded-md border border-[var(--border)] bg-[var(--panel)]" />
        </div>
        <div className="flex h-9 w-full items-center justify-center rounded-md bg-[var(--brand)] text-[13px] font-medium text-white">
          {zh ? "排队回放" : "Queue replay"}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-center p-4 sm:p-5">
      <svg viewBox="0 0 160 64" className="h-16 w-full sm:h-[4.5rem]" aria-hidden>
        <path
          d="M6 48 L36 38 L62 42 L94 18 L124 24 L154 10"
          fill="none"
          stroke="var(--brand-text)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M6 52 L36 44 L62 46 L94 38 L124 40 L154 36"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          opacity="0.7"
        />
      </svg>
      <p className="mt-1 text-[11px] text-[var(--muted)]">
        {zh ? "权益 vs 买入持有" : "Equity vs buy&hold"}
      </p>
    </div>
  );
}

/** Visual how-to strip for strategy-* learn articles (UI mocks, not photos). */
export function LearnStrategyWalkthrough({ locale }: { locale: string }) {
  const zh = locale.toLowerCase().startsWith("zh");

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <p className="text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-[17px]">
          {zh ? "在钱力股里怎么练（示意）" : "How to practice in Q-Stock (mock UI)"}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
          {zh
            ? "下面五步对应真实界面位置；示意图非截图，仅帮助对照操作。"
            : "Five steps map to the real UI. Conceptual mocks—not screenshots."}
        </p>
      </div>
      <ol className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
        {STEPS.map((step, i) => (
          <li
            key={step.kind}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--brand)_4%,var(--panel))] sm:min-h-[8.5rem] sm:flex-row"
          >
            <div className="flex shrink-0 items-start gap-3 border-b border-[var(--border)] px-4 py-4 sm:w-[15rem] sm:border-b-0 sm:border-r sm:px-5 sm:py-5 lg:w-[17rem]">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-semibold leading-snug text-[var(--brand-text)] sm:text-base">
                  {zh ? step.titleZh : step.titleEn}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
                  {zh ? step.hintZh : step.hintEn}
                </p>
              </div>
            </div>
            <div className="min-h-[8.5rem] min-w-0 flex-1 bg-[var(--aw-parchment,var(--surface-2))]/45 sm:min-h-0">
              <MiniUi kind={step.kind} zh={zh} />
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="px-4 pb-4 text-[12px] leading-relaxed text-[var(--muted)] sm:px-6 sm:pb-5 sm:text-[13px]">
        {zh
          ? "练完后把「触发次数 / 回撤 / 自己会不会改规则」写进笔记；历史回放 ≠ 未来收益。"
          : "Log trigger count, drawdown, and whether you want to bend the rule. Replay ≠ future returns."}
      </figcaption>
    </figure>
  );
}
