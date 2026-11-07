import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/marketing/reveal";

const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col justify-center pb-20 pt-12";

function ScrollHint({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="mkt-chevron absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </a>
  );
}

/** C 端注册 与 自托管 并列：两条 GTM 线在首页各有入口。服务端组件。 */
export async function MarketingDualChannel() {
  const t = await getTranslations("marketing");

  return (
    <section id="deploy" className={SCREEN}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {t("dualEyebrow")}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {t("dualTitle")}
          </h2>
        </Reveal>

        <div className="mt-8 grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
          <Reveal delay={140} className="h-full min-w-0">
            <div
              className="flex h-full flex-col rounded-2xl border border-[var(--border)] p-5 sm:p-6"
              style={{
                background: "color-mix(in srgb, var(--panel) 82%, transparent)",
              }}
            >
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                {t("dualDirect.title")}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
                {t("dualDirect.body")}
              </p>
              <Link
                href="/register"
                className="qt-btn qt-btn-primary mt-5 inline-flex h-10 w-fit items-center px-5 text-sm"
              >
                {t("dualDirect.cta")}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={200} className="h-full min-w-0">
            <div
              className="flex h-full flex-col rounded-2xl border border-[var(--border)] p-5 sm:p-6"
              style={{
                background: "color-mix(in srgb, var(--panel) 82%, transparent)",
              }}
            >
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                {t("dualDeploy.title")}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {t("dualDeploy.body")}
              </p>
              <pre className="mt-3.5 min-w-0 overflow-x-auto rounded-xl bg-[#16181d] px-3.5 py-3 font-mono text-[11px] leading-relaxed text-[#e6edf6]">
                <code>
                  <span className="opacity-55">{t("dualDeploy.note")}</span>
                  {"\n"}docker compose -f docker-compose.prod.yml up -d
                </code>
              </pre>
              <Link
                href="/pricing"
                className="qt-btn qt-btn-ghost mt-5 inline-flex h-10 w-fit items-center px-5 text-sm"
              >
                {t("dualDeploy.cta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      <ScrollHint href="#trust" label={t("scrollNext")} />
    </section>
  );
}
