type Props = {
  title: string;
  intro: string;
  howTitle: string;
  steps: string[];
  disclaimer: string;
};

/** SSR copy for crawlers — no market I/O. Hover icons reveal each step. */
export function AnalysisSeoIntro({
  title,
  intro,
  howTitle,
  steps,
  disclaimer,
}: Props) {
  return (
    <header className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-lg space-y-1">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          <p className="text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
            {intro}
          </p>
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            {disclaimer}
          </p>
        </div>

        <nav
          aria-label={howTitle}
          className="relative shrink-0 self-start sm:pt-1"
        >
          <p className="mb-2 text-[11px] font-medium tracking-wide text-[var(--muted)] sm:text-right">
            {howTitle}
          </p>
          <ol className="flex items-center gap-2 sm:justify-end">
            {steps.map((step, i) => (
              <li key={step} className="group relative">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums text-[var(--brand-text)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40"
                  style={{ background: "var(--brand-soft)" }}
                  aria-describedby={`analysis-step-${i + 1}`}
                  aria-label={`${i + 1}. ${step}`}
                >
                  {i + 1}
                </button>
                <span
                  id={`analysis-step-${i + 1}`}
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-[calc(100%+8px)] z-20 w-[min(240px,70vw)] rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-left text-[12px] leading-snug text-[var(--foreground)] opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <span className="mb-0.5 block text-[10px] font-medium text-[var(--muted)]">
                    {i + 1}/{steps.length}
                  </span>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
