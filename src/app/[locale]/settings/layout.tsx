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
  return buildNoIndexMetadata(locale, "/settings");
}

export default async function PrivateLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["settings"]}>
      <div className="settings-ui">{children}</div>
    </ScopedMessages>
  );
}
