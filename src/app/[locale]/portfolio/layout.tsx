import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";
import { ScopedMessages } from "@/components/providers/scoped-messages";

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
  return buildNoIndexMetadata(locale, "/portfolio");
}

export default async function PrivateLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["portfolio", "trading"]}>
      {children}
    </ScopedMessages>
  );
}
