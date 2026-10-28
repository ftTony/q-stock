"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { trackBillingClick } from "@/lib/billing/client-events";

const CONTACT_EMAIL = "172993974@qq.com";

export type PricingPlanCopy = {
  name: string;
  price: string;
  /** Struck-through list price; omit for custom / no discount. */
  originalPrice?: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export type OnlinePlanCopy = {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  href: "/register" | "/settings" | "/pricing";
  trackUpgrade?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  onlineTitle: string;
  onlineSubtitle: string;
  onlinePlans: [OnlinePlanCopy, OnlinePlanCopy];
  sourceTitle: string;
  sourceSubtitle: string;
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
      className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${
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
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          {plan.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        {plan.originalPrice ? (
          <span className="text-base tabular-nums text-[var(--muted)] line-through decoration-[var(--muted)]">
            {plan.originalPrice}
          </span>
        ) : null}
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {plan.price}
        </span>
        {plan.priceNote ? (
          <span className="text-sm text-[var(--muted)]">{plan.priceNote}</span>
        ) : null}
      </div>

      <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-[var(--foreground)]">
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

function OnlinePlanCard({ plan }: { plan: OnlinePlanCopy }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${
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
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          {plan.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {plan.price}
        </span>
        {plan.priceNote ? (
          <span className="text-sm text-[var(--muted)]">{plan.priceNote}</span>
        ) : null}
      </div>

      <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-[var(--foreground)]">
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

      <Link
        href={plan.href}
        onClick={() => {
          if (plan.trackUpgrade) void trackBillingClick("click_upgrade");
        }}
        className={`qt-btn mt-5 h-10 w-full justify-center px-4 text-sm ${
          plan.highlighted ? "qt-btn-primary" : "qt-btn-ghost"
        }`}
      >
        {plan.cta}
      </Link>
    </article>
  );
}

/** Pricing: online Free/Pro + source/deploy (mailto). */
export function MarketingPricing({
  title,
  subtitle,
  onlineTitle,
  onlineSubtitle,
  onlinePlans,
  sourceTitle,
  sourceSubtitle,
  plans,
  footnote,
}: Props) {
  const t = useTranslations("pricing");

  return (
    <div className="flex flex-1 flex-col animate-[qtFade_0.45s_ease]">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {subtitle}
          </p>
        </header>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {onlineTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {onlineSubtitle}
          </p>
          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2 lg:items-start">
            {onlinePlans.map((plan) => (
              <OnlinePlanCard key={plan.name} plan={plan} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            {t("onlineFootnote")}
          </p>
        </section>

        <section className="mt-10 border-t border-[var(--border)] pt-8 sm:mt-12 sm:pt-10">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {sourceTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {sourceSubtitle}
          </p>
          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-3 lg:items-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                mailSubject={`钱力股 · ${plan.name}`}
              />
            ))}
          </div>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-[var(--muted)] sm:mt-8">
          {footnote}
        </p>
      </div>
      <MarketingCtaBand compact />
    </div>
  );
}
