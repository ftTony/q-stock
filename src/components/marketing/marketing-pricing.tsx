import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";

const CONTACT_EMAIL = "172993974@qq.com";

export type PricingPlanCopy = {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  plans: [PricingPlanCopy, PricingPlanCopy, PricingPlanCopy];
  footnote: string;
};

function PlanCard({
  plan,
  mailSubject,
}: {
  plan: PricingPlanCopy;
  mailSubject: string;
}) {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}`;

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-4 sm:p-5 ${
        plan.highlighted
          ? "border-[var(--brand-text)]"
          : "border-[var(--border)]"
      }`}
      style={{
        background: plan.highlighted
          ? "color-mix(in srgb, var(--brand) 8%, var(--panel))"
          : "var(--panel)",
      }}
    >
      <div>
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {plan.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{plan.description}</p>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {plan.price}
        </span>
        {plan.priceNote ? (
          <span className="text-sm text-[var(--muted)]">{plan.priceNote}</span>
        ) : null}
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm leading-relaxed text-[var(--foreground)]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span
              aria-hidden
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-text)]"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className={`qt-btn mt-5 h-10 w-full justify-center px-4 text-sm ${
          plan.highlighted ? "qt-btn-primary" : "qt-btn-ghost"
        }`}
      >
        {plan.cta}
      </a>
    </article>
  );
}

/** One-screen pricing: content block centered between header and CTA. */
export function MarketingPricing({ title, subtitle, plans, footnote }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-[qtFade_0.45s_ease]">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5">
        <div className="w-full">
          <header className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {subtitle}
            </p>
          </header>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                mailSubject={`钱力股 · ${plan.name}`}
              />
            ))}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)] sm:mt-4">
            {footnote}
          </p>
        </div>
      </div>
      <MarketingCtaBand compact />
    </div>
  );
}
