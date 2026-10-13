import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { ToolCardVisual } from "@/components/tools/tool-card-visual";
import { Link } from "@/i18n/routing";
import { TOOL_CATALOG, toolMessageKey } from "@/lib/tools/catalog";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return buildPageMetadata(locale, "/tools", {
    title: t("title"),
    description: t("indexSubtitle"),
  });
}

export default async function ToolsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6 animate-[qtFade_0.45s_ease]">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t("indexSubtitle")}
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t("disclaimer")}{" "}
              <Link
                href="/disclaimer"
                className="underline-offset-2 hover:underline"
              >
                {t("disclaimerLink")}
              </Link>
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {TOOL_CATALOG.map((tool) => {
              const key = toolMessageKey(tool);
              return (
                <li key={tool.slug}>
                  <Link
                    href={tool.href}
                    className="qt-panel block h-full overflow-hidden p-5 transition-colors hover:border-[var(--brand)]/40"
                  >
                    <ToolCardVisual slug={tool.slug} />
                    <h2 className="text-sm font-semibold tracking-tight sm:text-base">
                      {t(`cards.${key}.title`)}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
                      {t(`cards.${key}.body`)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
