import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

const CONTACT_EMAIL = "172993974@qq.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildPageMetadata(locale, "/about", {
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function AboutPage({ params }: Props) {
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col animate-[qtFade_0.45s_ease]">
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <header className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
              {t("subtitle")}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </header>

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            <article className="qt-panel space-y-3 p-5 text-sm leading-relaxed text-[var(--foreground)] sm:p-6">
              <h2 className="text-sm font-semibold tracking-tight sm:text-base">
                {t("platformTitle")}
              </h2>
              <p>{t("platformBody")}</p>
            </article>

            <article className="qt-panel space-y-3.5 p-5 text-sm leading-relaxed text-[var(--foreground)] sm:p-6">
              <p>{t("p1")}</p>
              <p
                className="rounded-lg px-3 py-2.5 text-xs leading-relaxed sm:text-sm"
                style={{
                  background: "color-mix(in srgb, #f59e0b 12%, transparent)",
                  color: "color-mix(in srgb, #b45309 90%, var(--foreground))",
                }}
                role="note"
              >
                {t("mainlandNotice")}
              </p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
              <p className="text-xs text-[var(--muted)] sm:text-sm">{t("p4")}</p>
            </article>

            <section className="qt-panel space-y-5 p-5 sm:p-6 lg:p-8">
              <div>
                <h2 className="text-base font-semibold">{t("contactTitle")}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t("contactEmailLabel")}{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-medium text-[var(--brand-text)] underline-offset-2 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <figure className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <Image
                    src="/about/wechat-qr.jpg"
                    alt={t("wechatQrAlt")}
                    width={200}
                    height={200}
                    className="h-[200px] w-[200px] rounded-lg bg-white object-contain"
                    unoptimized
                  />
                  <figcaption className="text-sm font-medium">{t("wechat")}</figcaption>
                </figure>
                <figure className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <Image
                    src="/about/alipay-qr.jpg"
                    alt={t("alipayQrAlt")}
                    width={200}
                    height={200}
                    className="h-[200px] w-[200px] rounded-lg bg-white object-contain"
                    unoptimized
                  />
                  <figcaption className="text-sm font-medium">{t("alipay")}</figcaption>
                </figure>
              </div>
              <p className="text-xs text-[var(--muted)]">{t("qrHint")}</p>
            </section>
          </div>
        </div>
        <MarketingCtaBand compact />
      </div>
    </ScopedMessages>
  );
}
