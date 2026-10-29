import type { Metadata } from "next";
import { ScopedMessages } from "@/components/providers/scoped-messages";
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
  return buildNoIndexMetadata(locale, "/alerts");
}

/**
 * `alerts` 命名空间已在外壳白名单里；这里补 `watchlist` ——
 * 提醒弹窗的标的选择器复用自选列表的客户端组件，会用到它的文案。
 * 漏声明会在运行时抛 MISSING_MESSAGE（`npm run check:i18n` 会拦住）。
 */
export default function PrivateLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["watchlist"]}>{children}</ScopedMessages>
  );
}
