import type { Metadata } from "next";
import { redirect } from "@/i18n/routing";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildNoIndexMetadata(locale, `/learn/${slug}`, "Learn");
}

/** Articles not published yet — send to the coming-soon index. */
export default async function LearnArticlePage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/learn", locale });
}
