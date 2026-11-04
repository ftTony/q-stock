import { useTranslations } from "next-intl";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";

type Density = "default" | "stack";

export function CompanyProfilePanel({
  profile,
  density = "default",
  loading = false,
}: {
  profile: CompanyProfile | null;
  /** Stack bottom: single-column hairline rows (dock / mobile keep default). */
  density?: Density;
  /** True while company/fundamentals fetch is in flight. */
  loading?: boolean;
}) {
  const t = useTranslations("company");
  const tCommon = useTranslations("common");
  if (loading && !profile) {
    return <p className="aw-caption">{tCommon("loading")}</p>;
  }
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

  const stack = density === "stack";

  if (stack) {
    return (
      <div className="aw-stack-company">
        <div className="aw-stack-company-head">
          {profile.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo}
              alt={profile.name || ""}
              className="aw-stack-company-logo"
            />
          ) : null}
          <div className="min-w-0">
            <div className="aw-stack-company-name">{profile.name}</div>
            {profile.companyName ? (
              <div className="aw-stack-company-aka">{profile.companyName}</div>
            ) : null}
          </div>
        </div>

        {profile.brief ? (
          <p className="aw-stack-company-brief">{profile.brief}</p>
        ) : null}

        {profile.website ? (
          <div className="aw-stack-company-site">
            <span>{t("website")}</span>
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="aw-text-link"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <dl className="aw-stack-company-list">
            {rows.map(([label, value]) => (
              <div key={label} className="aw-stack-company-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {profile.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt={profile.name || ""}
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
          />
        ) : null}
        <div className="min-w-0 space-y-0.5">
          <div className="truncate text-[15px] font-semibold tracking-[-0.2px] text-[var(--foreground)]">
            {profile.name}
          </div>
          {profile.companyName ? (
            <div className="truncate text-[12px] text-[var(--muted)]">
              {profile.companyName}
            </div>
          ) : null}
        </div>
      </div>

      {profile.brief ? (
        <p className="text-[13px] leading-[1.55] tracking-[-0.08px] text-[color-mix(in_srgb,var(--foreground)_72%,var(--muted))]">
          {profile.brief}
        </p>
      ) : null}

      {profile.website ? (
        <p className="text-[12px] text-[var(--muted)]">
          <span>{t("website")}: </span>
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--brand-text)] hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}

      {rows.length > 0 ? (
        <dl className="grid grid-cols-1 border-t border-[var(--aw-hairline,var(--border))] sm:grid-cols-2 sm:gap-x-8">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex min-h-10 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] py-2.5"
            >
              <dt className="shrink-0 text-[12px] text-[var(--muted)]">{label}</dt>
              <dd className="min-w-0 text-right text-[13px] font-medium tabular-nums tracking-[-0.08px] text-[var(--foreground)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export function OfficersPanel({
  officers,
  title,
  density = "default",
}: {
  officers: CompanyOfficer[];
  title?: string;
  density?: Density;
}) {
  const t = useTranslations("company");
  if (officers.length === 0) {
    return <p className="aw-caption">{t("noOfficers")}</p>;
  }

  const stack = density === "stack";

  return (
    <section className={stack ? "aw-stack-company" : undefined}>
      {title ? (
        <h3
          className={
            stack
              ? "aw-stack-company-section"
              : "mb-3 text-[12px] font-semibold tracking-[-0.08px] text-[var(--muted)]"
          }
        >
          {title}
        </h3>
      ) : null}
      <ul
        className={
          stack
            ? "aw-stack-company-list"
            : "grid grid-cols-1 gap-x-8 sm:grid-cols-2"
        }
      >
        {officers.map((o, i) => {
          const secondary =
            o.nameEn && o.nameEn !== o.name ? o.nameEn : undefined;
          if (stack) {
            return (
              <li key={i} className="aw-stack-company-officer">
                <div className="aw-stack-feed-title">{o.name}</div>
                {secondary ? (
                  <div className="aw-stack-feed-meta">{secondary}</div>
                ) : null}
                {o.title ? (
                  <div className="aw-stack-company-role">{o.title}</div>
                ) : null}
                {o.age != null ? (
                  <div className="aw-stack-feed-meta">
                    {t("age")}: {o.age}
                  </div>
                ) : null}
                {o.bio ? (
                  <p className="aw-stack-feed-summary">{o.bio}</p>
                ) : null}
              </li>
            );
          }
          return (
            <li
              key={i}
              className="border-b border-[var(--aw-hairline,var(--border))] py-3.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-[13px] font-semibold tracking-[-0.15px] text-[var(--foreground)]">
                  {o.name}
                </div>
                {secondary ? (
                  <div className="text-[11px] text-[var(--muted)]">{secondary}</div>
                ) : null}
                {o.title ? (
                  <div className="text-[12px] font-medium text-[var(--brand-text)]">
                    {o.title}
                  </div>
                ) : null}
                {o.age != null ? (
                  <div className="text-[11px] text-[var(--muted)]">
                    {t("age")}: {o.age}
                  </div>
                ) : null}
                {o.bio ? (
                  <p className="line-clamp-3 pt-0.5 text-[12px] leading-[1.5] text-[color-mix(in_srgb,var(--foreground)_68%,var(--muted))]">
                    {o.bio}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
