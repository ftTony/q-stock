import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildNoIndexMetadata(locale, "/watchlist");
}

export default function PrivateLayout({ children }: Props) {
  return children;
}
