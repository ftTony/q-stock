import { Link } from "@/i18n/routing";

type Props = {
  indexTitle: string;
  title: string;
  subtitle: string;
  disclaimer: string;
  disclaimerLinkLabel: string;
  ctaMarkets: string;
  ctaPortfolio: string;
  children: React.ReactNode;
};

export function ToolPageShell({
  indexTitle,
  title,
  subtitle,
  disclaimer,
  disclaimerLinkLabel,
  ctaMarkets,
  ctaPortfolio,
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 animate-[qtFade_0.45s_ease]">
      <header>
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
          <Link
            href="/tools"
            className="font-medium text-[var(--brand-text)] hover:underline"
          >
            {indexTitle}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{title}</span>
        </nav>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-1">
            <Link
              href="/portfolio"
              className="qt-btn qt-btn-primary h-9 px-3.5 text-sm"
            >
              {ctaPortfolio}
            </Link>
            <Link href="/markets" className="qt-btn h-9 px-3.5 text-sm">
              {ctaMarkets}
            </Link>
          </div>
        </div>
      </header>

      {children}

      <p className="text-xs text-[var(--muted)]">
        {disclaimer}{" "}
        <Link href="/disclaimer" className="underline-offset-2 hover:underline">
          {disclaimerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
