import {
  getCompanyExecutives as getFinnhubExecutives,
  getCompanyProfile2 as getFinnhubProfile,
  type CompanyExecutiveItem,
  type CompanyProfile as FinnhubCompanyProfile,
} from "@/lib/finnhub/client";
import {
  getLongbridgeCompany,
  getLongbridgeExecutive,
  type LongbridgeCompanyProfile,
  type LongbridgeOfficer,
} from "@/lib/market/providers/longbridge";
import {
  getFutuCompany,
  getFutuExecutives,
  type FutuCompanyProfile,
  type FutuOfficer,
} from "@/lib/market/providers/futu-content";
import { isProviderEnabled } from "@/lib/market/router";
import type { AssetType } from "@/lib/types";

export type CompanyOfficer = {
  name?: string;
  nameEn?: string;
  title?: string;
  age?: number;
  born?: string;
  bio?: string;
  photo?: string;
};

export type CompanyProfile = {
  name?: string;
  companyName?: string;
  ticker?: string;
  logo?: string;
  website?: string;
  industry?: string;
  country?: string;
  currency?: string;
  exchange?: string;
  founded?: string;
  listed?: string;
  employees?: string;
  chairman?: string;
  manager?: string;
  secretary?: string;
  brief?: string;
};

export type CompanyData = {
  profile: CompanyProfile | null;
  officers: CompanyOfficer[];
  source: string | null;
  degraded: boolean;
};

function s(v: number | string | null | undefined): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v);
}

function mapLbProfile(lb: LongbridgeCompanyProfile): CompanyProfile {
  return {
    name: lb.name,
    companyName: lb.companyName,
    ticker: lb.ticker,
    logo: lb.logo,
    website: lb.website,
    industry: lb.category,
    country: lb.region,
    exchange: lb.market,
    founded: lb.founded,
    listed: lb.listingDate,
    employees: lb.employees,
    chairman: lb.chairman,
    manager: lb.manager,
    secretary: lb.secretary,
    brief: lb.brief,
  };
}

function mapLbOfficers(list: LongbridgeOfficer[]): CompanyOfficer[] {
  return list.map((o) => ({
    name: o.name,
    nameEn: o.nameEn,
    title: o.title,
    bio: o.bio,
    photo: o.photo,
  }));
}

function mapFutuProfile(p: FutuCompanyProfile): CompanyProfile {
  return {
    name: p.name,
    companyName: p.companyName,
    ticker: p.ticker,
    website: p.website,
    industry: p.industry,
    country: p.country,
    exchange: p.exchange,
    founded: p.founded,
    listed: p.listed,
    employees: p.employees,
    chairman: p.chairman,
    manager: p.manager,
    secretary: p.secretary,
    brief: p.brief,
  };
}

function mapFutuOfficers(list: FutuOfficer[]): CompanyOfficer[] {
  return list.map((o) => ({
    name: o.name,
    nameEn: o.nameEn,
    title: o.title,
    age: o.age,
  }));
}

function mapFhProfile(fh: FinnhubCompanyProfile): CompanyProfile {
  return {
    name: fh.name,
    companyName: fh.name,
    ticker: fh.ticker,
    logo: fh.logo,
    website: fh.weburl,
    industry: fh.finnhubIndustry,
    country: fh.country,
    currency: fh.currency,
    exchange: fh.exchange,
    listed: fh.ipo,
    employees: s(fh.employees),
    brief: fh.description,
  };
}

function mapFhOfficers(list: CompanyExecutiveItem[]): CompanyOfficer[] {
  return list.map((o) => ({
    name: o.name,
    title: o.title,
    age: o.age,
    born: o.born,
  }));
}

function isPresent(c: CompanyProfile | null, officers: CompanyOfficer[]): boolean {
  if (c && (c.name || c.brief || c.ticker)) return true;
  return officers.length > 0;
}

/**
 * Company profile + executives.
 * Priority: Longbridge → Futu → Finnhub (respect MARKET_DATA_PROVIDERS).
 */
export async function getCompanyData(
  symbol: string,
  assetType: AssetType,
  locale?: string,
): Promise<CompanyData> {
  const empty: CompanyData = {
    profile: null,
    officers: [],
    source: null,
    degraded: true,
  };
  const sym = symbol.toUpperCase();

  if (assetType === "crypto") return { ...empty };

  if (assetType === "stock" || assetType === "hk") {
    if (isProviderEnabled("longbridge")) {
      try {
        const [profileRes, officersRes] = await Promise.allSettled([
          getLongbridgeCompany(sym, assetType, locale),
          getLongbridgeExecutive(sym, assetType, locale),
        ]);
        const profile =
          profileRes.status === "fulfilled" ? profileRes.value : null;
        const officers =
          officersRes.status === "fulfilled" ? officersRes.value : [];
        if (isPresent(profile, officers)) {
          return {
            profile: profile ? mapLbProfile(profile) : null,
            officers: mapLbOfficers(officers),
            source: "longbridge",
            degraded: false,
          };
        }
      } catch (err) {
        console.warn(
          "[company] longbridge failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    if (isProviderEnabled("futu")) {
      try {
        const [profileRes, officersRes] = await Promise.allSettled([
          getFutuCompany(sym, assetType),
          getFutuExecutives(sym, assetType),
        ]);
        const profile =
          profileRes.status === "fulfilled" ? profileRes.value : null;
        const officers =
          officersRes.status === "fulfilled" ? officersRes.value : [];
        if (isPresent(profile, officers)) {
          return {
            profile: profile ? mapFutuProfile(profile) : null,
            officers: mapFutuOfficers(officers),
            source: "futu",
            degraded: false,
          };
        }
      } catch (err) {
        console.warn(
          "[company] futu failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  if (assetType === "stock" && isProviderEnabled("finnhub")) {
    try {
      const [profileRes, officersRes] = await Promise.allSettled([
        getFinnhubProfile(sym),
        getFinnhubExecutives(sym),
      ]);
      const rawProfile =
        profileRes.status === "fulfilled" ? profileRes.value : null;
      const rawOfficers =
        officersRes.status === "fulfilled" ? officersRes.value : [];
      const profile = rawProfile ? mapFhProfile(rawProfile) : null;
      const officers = mapFhOfficers(rawOfficers);
      if (isPresent(profile, officers)) {
        return {
          profile,
          officers,
          source: "finnhub",
          degraded: false,
        };
      }
    } catch (err) {
      console.warn(
        "[company] finnhub failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { ...empty };
}
