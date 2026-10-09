import { getTranslations } from "next-intl/server";
import { NotFoundView } from "@/components/marketing/not-found-view";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  const tM = await getTranslations("marketing");
  const tApp = await getTranslations("app");

  return (
    <NotFoundView
      title={t("title")}
      body={t("body")}
      homeLabel={t("home")}
      marketsLabel={t("markets")}
      ctaEnter={tM("ctaEnter")}
      brandName={tApp("name")}
    />
  );
}
