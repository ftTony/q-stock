import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MarketsDashboard from "@/components/market/markets-dashboard";
import { getMarketsFirstScreen } from "@/lib/market/markets-first-screen";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** 首屏榜单快照 60s 一再生（与 getMarketsFirstScreen 的缓存对齐）。 */
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  return buildPageMetadata(locale, "/markets", {
    title: t("markets"),
    description: tSeo("description"),
  });
}

export default async function MarketsPage({ searchParams }: Props) {
  // 服务端先取一份热门榜单注水，避免首屏只剩骨架（失败则空，客户端照常拉取）。
  // `?list=` 也在服务端读，让面板不再依赖 useSearchParams（那会让整个面板
  // 在静态渲染时被 CSR bailout 成 Loading 占位，注水就白做了）。
  const [firstScreen, sp] = await Promise.all([
    getMarketsFirstScreen("stock"),
    searchParams,
  ]);
  const list = typeof sp.list === "string" ? sp.list : undefined;

  // 首屏数据在服务端就绪后直接渲染；导航过渡由路由级 `loading.tsx` 骨架承担，
  // 这里不再挂 "Loading…" 兜底（面板已无 useSearchParams，不需要 Suspense 边界）。
  return <MarketsDashboard initialBoards={firstScreen} initialList={list} />;
}
