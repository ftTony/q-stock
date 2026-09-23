import { useTranslations } from "next-intl";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";

export function CompanyProfilePanel({ profile }: { profile: CompanyProfile | null }) {
  const t = useTranslations("company");
  if (!profile) {
    return <p className="text-sm text-[var(--muted)]">{t("na")}</p>;
  }

  const rows: [string, string][] = (
    [
      [t("industry"), profile.industry],
      [t("listed"), profile.listed],
      [t("founded"), profile.founded],
      [t("market"), profile.exchange ?? profile.ticker],
      [t("country"), profile.country],
      [t("employees"), profile.employees],
      [t("chairman"), profile.chairman],
      [t("manager"), profile.manager],
      [t("secretary"), profile.secretary],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => row[1] != null && row[1] !== "");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {profile.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt={profile.name || ""}
            className="h-10 w-10 rounded-lg object-contain"
          />
        )}
        <div className="min-w-0">
          <div className="font-medium">{profile.name}</div>
          {profile.companyName && (
            <div className="text-xs text-[var(--muted)]">{profile.companyName}</div>
          )}
        </div>
      </div>

      {profile.brief && (
        <p className="text-sm leading-relaxed text-[var(--muted)]">{profile.brief}</p>
      )}

      {profile.website && (
        <div className="text-sm">
          <span className="text-[var(--muted)]">{t("website")}: </span>
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--brand-text)] hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        </div>
      )}

      {rows.length > 0 && (
        <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-1.5 text-sm"
            >
              <dt className="shrink-0 text-[var(--muted)]">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function OfficersPanel({ officers }: { officers: CompanyOfficer[] }) {
  const t = useTranslations("company");
  if (officers.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{t("noOfficers")}</p>;
  }

  return (
    <ul className="space-y-4">
      {officers.map((o, i) => {
        const secondary =
          o.nameEn && o.nameEn !== o.name ? o.nameEn : undefined;
        return (
          <li key={i} className="flex items-start gap-3 border-b border-[var(--border)] pb-3 last:border-0">
            {o.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={o.photo}
                alt={o.name || ""}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="font-medium">{o.name}</div>
              {secondary && (
                <div className="text-xs text-[var(--muted)]">{secondary}</div>
              )}
              {o.title && (
                <div className="text-sm text-[var(--brand-text)]">{o.title}</div>
              )}
              {o.age != null && (
                <div className="text-xs text-[var(--muted)]">
                  {t("age")}: {o.age}
                </div>
              )}
              {o.bio && (
                <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">
                  {o.bio}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}