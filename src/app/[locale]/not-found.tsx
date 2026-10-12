import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { NotFoundView } from "@/components/marketing/not-found-view";
import { ScopedMessages } from "@/components/providers/scoped-messages";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);

  const t = await getTranslations("notFound");
  const tM = await getTranslations("marketing");
  const tApp = await getTranslations("app");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <NotFoundView
        title={t("title")}
        body={t("body")}
        homeLabel={t("home")}
        marketsLabel={t("markets")}
        ctaEnter={tM("ctaEnter")}
        brandName={tApp("name")}
      />
    </ScopedMessages>
  );
}
