import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function LocaleNotFound() {
  const t = await getTranslations("common");
  return (
    <main className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("error")}</h1>
      <Link
        href="/"
        className="qt-btn-primary mt-2 rounded-md px-4 py-2 text-sm font-medium"
      >
        Home
      </Link>
    </main>
  );
}
