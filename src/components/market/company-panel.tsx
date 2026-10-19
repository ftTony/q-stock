import { useTranslations } from "next-intl";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";

export function CompanyProfilePanel({ profile }: { profile: CompanyProfile | null }) {
  const t = useTranslations("company");
  if (!profile) {
    return <p className="aw-caption">{t("na")}</p>;
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
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {profile.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt={profile.name || ""}
            className="h-9 w-9 shrink-0 rounded-[8px] object-contain"
          />
        )}
        <div className="min-w-0 space-y-0.5">
          <div className="aw-caption-strong truncate">{profile.name}</div>
          {profile.companyName && (
            <div className="aw-caption truncate">{profile.companyName}</div>
          )}
        </div>
      </div>

      {profile.brief && (
        <p className="text-[13px] leading-[1.47] tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]">
          {profile.brief}
        </p>
      )}

      {profile.website && (
        <p className="aw-caption">
          <span>{t("website")}: </span>
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--aw-primary,var(--brand-text))] hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        </p>
      )}

      {rows.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-8 border-t border-[var(--aw-hairline,var(--border))] sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex min-h-[40px] items-center justify-between gap-4 border-b border-[var(--aw-hairline,var(--border))] py-2.5"
            >
              <dt className="aw-metric-label shrink-0">{label}</dt>
              <dd className="min-w-0 text-right text-[13px] font-medium leading-[1.3] tracking-[-0.08px] text-[var(--aw-ink,var(--foreground))]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function OfficersPanel({
  officers,
  title,
}: {
  officers: CompanyOfficer[];
  title?: string;
}) {
  const t = useTranslations("company");
  if (officers.length === 0) {
    return <p className="aw-caption">{t("noOfficers")}</p>;
  }

  return (
    <section>
      {title ? (
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
          {title}
        </h3>
      ) : null}
      <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {officers.map((o, i) => {
          const secondary =
            o.nameEn && o.nameEn !== o.name ? o.nameEn : undefined;
          return (
            <li
              key={i}
              className="border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-b-0 lg:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="flex items-start gap-3">
                {o.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.photo}
                    alt={o.name || ""}
                    className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="space-y-0.5">
                    <div className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[var(--aw-ink,var(--foreground))]">
                      {o.name}
                    </div>
                    {secondary ? (
                      <div className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                        {secondary}
                      </div>
                    ) : null}
                    {o.title ? (
                      <div className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-primary,var(--brand-text))]">
                        {o.title}
                      </div>
                    ) : null}
                    {o.age != null ? (
                      <div className="text-[10px] leading-[1.3] tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]">
                        {t("age")}: {o.age}
                      </div>
                    ) : null}
                  </div>
                  {o.bio ? (
                    <p className="line-clamp-3 text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                      {o.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
