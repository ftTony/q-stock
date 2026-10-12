import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disclaimer" });
  return buildPageMetadata(locale, "/disclaimer", {
    title: t("title"),
    description: t("subtitle"),
  });
}

const BODY_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

export default async function DisclaimerPage({ params }: Props) {
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disclaimer");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-[qtFade_0.45s_ease]">
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
          <header className="shrink-0 max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
              {t("subtitle")}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </header>

          <article className="qt-panel mt-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain sm:mt-5">
            <ol className="divide-y divide-[var(--border)]">
              {BODY_KEYS.map((key, i) => (
                <li
                  key={key}
                  className="flex gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 font-mono text-xs font-semibold tabular-nums text-[var(--brand-text)]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--foreground)] sm:leading-6">
                    {t(key)}
                  </p>
                </li>
              ))}
            </ol>

            <aside
              className="border-t border-[var(--border)] px-4 py-3.5 sm:px-6 sm:py-4"
              role="note"
              style={{
                background: "color-mix(in srgb, #f59e0b 10%, var(--panel))",
              }}
            >
              <div className="flex gap-3 sm:gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                  style={{
                    background: "color-mix(in srgb, #f59e0b 22%, transparent)",
                    color: "color-mix(in srgb, #b45309 85%, var(--foreground))",
                  }}
                >
                  !
                </span>
                <p
                  className="text-sm leading-relaxed sm:leading-6"
                  style={{
                    color: "color-mix(in srgb, #b45309 88%, var(--foreground))",
                  }}
                >
                  {t("mainlandNotice")}
                </p>
              </div>
            </aside>
          </article>
        </div>
        <MarketingCtaBand compact />
      </div>
    </ScopedMessages>
  );
}
