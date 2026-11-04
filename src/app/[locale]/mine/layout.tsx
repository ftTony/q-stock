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
  return buildNoIndexMetadata(locale, "/mine");
}

export default async function MineLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["settings", "paperRisk", "nav", "minePage"]}>
      <div className="settings-ui">{children}</div>
    </ScopedMessages>
  );
}
