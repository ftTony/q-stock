import Image from "next/image";
import { getTranslations } from "next-intl/server";

const CONTACT_EMAIL = "172993974@qq.com";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-[qtFade_0.45s_ease]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("subtitle")}</p>
      </div>

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
  );
}
