import Image from "next/image";
import { getTranslations } from "next-intl/server";

const CONTACT_EMAIL = "172993974@qq.com";

type Props = {
  /** When true, put international methods first (non-CN locales). */
  intlFirst?: boolean;
};

function PayLinkCard({
  href,
  title,
  hint,
  accent,
}: {
  href: string;
  title: string;
  hint: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-center no-underline transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]"
    >
      <span
        className="flex h-[120px] w-full max-w-[200px] items-center justify-center rounded-lg text-[15px] font-semibold tracking-tight"
        style={{
          background: `color-mix(in srgb, ${accent} 14%, var(--panel))`,
          color: accent,
        }}
      >
        {title}
      </span>
      <span className="text-[12px] leading-snug text-[var(--muted)]">{hint}</span>
      <span className="text-sm font-medium text-[var(--brand-text)]">{title}</span>
    </a>
  );
}

function QrCard({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="h-[200px] w-[200px] rounded-lg bg-white object-contain"
        unoptimized
      />
      <figcaption className="text-sm font-medium">{caption}</figcaption>
    </figure>
  );
}

/** CN QR + overseas tip links for About → support. */
export async function AboutSupportPayments({ intlFirst = false }: Props) {
  const t = await getTranslations("about");
  const paypal = process.env.NEXT_PUBLIC_SUPPORT_PAYPAL_URL?.trim() || "";
  const stripeTip =
    process.env.NEXT_PUBLIC_SUPPORT_STRIPE_TIP_URL?.trim() || "";
  const mailtoIntl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Qianli Gu · support (international)",
  )}`;

  const cnBlock = (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold tracking-tight text-[var(--muted)]">
        {t("payCnTitle")}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <QrCard
          src="/about/wechat-qr.jpg"
          alt={t("wechatQrAlt")}
          caption={t("wechat")}
        />
        <QrCard
          src="/about/alipay-qr.jpg"
          alt={t("alipayQrAlt")}
          caption={t("alipay")}
        />
      </div>
    </div>
  );

  const intlBlock = (
    <div className="space-y-2">
      <h4 className="text-[12px] font-semibold tracking-tight text-[var(--muted)]">
        {t("payIntlTitle")}
      </h4>
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        {t("payIntlHint")}
      </p>
      <div
        className={`grid gap-4 ${
          paypal && stripeTip ? "sm:grid-cols-2" : "sm:grid-cols-1 sm:max-w-sm"
        }`}
      >
        {paypal ? (
          <PayLinkCard
            href={paypal}
            title={t("paypal")}
            hint={t("paypalHint")}
            accent="#0070ba"
          />
        ) : null}
        {stripeTip ? (
          <PayLinkCard
            href={stripeTip}
            title={t("stripeTip")}
            hint={t("stripeTipHint")}
            accent="var(--brand-text)"
          />
        ) : null}
        {!paypal && !stripeTip ? (
          <PayLinkCard
            href={mailtoIntl}
            title={t("intlEmailCta")}
            hint={t("intlEmailHint")}
            accent="var(--brand-text)"
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {intlFirst ? (
        <>
          {intlBlock}
          {cnBlock}
        </>
      ) : (
        <>
          {cnBlock}
          {intlBlock}
        </>
      )}
      <p className="text-xs text-[var(--muted)]">{t("qrHint")}</p>
    </div>
  );
}

export { CONTACT_EMAIL };
