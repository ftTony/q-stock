import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalDocView, legalFallbackNote } from "@/components/marketing/legal-doc-view";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { resolveLegalDoc } from "@/lib/legal/legal-docs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { doc } = resolveLegalDoc("privacy", locale);
  return buildPageMetadata(locale, "/privacy", {
    title: doc.title,
    description: doc.subtitle,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { doc } = resolveLegalDoc("privacy", locale);

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <LegalDocView doc={doc} fallbackNote={legalFallbackNote(locale)} />
    </ScopedMessages>
  );
}
