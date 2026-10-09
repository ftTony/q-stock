import { NextResponse } from "next/server";
import { format, subMonths, addMonths } from "date-fns";
import { auth } from "@/lib/auth";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getCompanyProfile2,
  getEarnings,
  getEarningsCalendar,
} from "@/lib/finnhub/client";
import { getLongbridgeEarnings } from "@/lib/market/providers/longbridge";
import { getFutuEarnings } from "@/lib/market/providers/futu-content";
import { getDailyCandles } from "@/lib/market";
import { isProviderEnabled } from "@/lib/market/router";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType, type AssetType } from "@/lib/types";

type MetricRow = { key: string; value: number | null };

function mergeMetrics(primary: MetricRow[], secondary: MetricRow[]): MetricRow[] {
  const map = new Map<string, number | null>();
  for (const m of primary) {
    if (m.value != null) map.set(m.key, m.value);
  }
  for (const m of secondary) {
    if (m.value != null && !map.has(m.key)) map.set(m.key, m.value);
  }
  return [...map.entries()].map(([key, value]) => ({ key, value }));
}

type SeriesPoint = { period?: string; v?: number };

function latestSeriesValue(
  series: unknown,
  key: string,
  bucket: "annual" | "quarterly" = "annual",
): number | null {
  const arr = (
    series as
      | { annual?: Record<string, SeriesPoint[]>; quarterly?: Record<string, SeriesPoint[]> }
      | undefined
  )?.[bucket]?.[key];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  // Finnhub usually returns newest-first; fall back to max period
  const sorted = [...arr].sort((a, b) =>
    String(b.period ?? "").localeCompare(String(a.period ?? "")),
  );
  const v = sorted[0]?.v;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Free-tier Finnhub `/stock/metric` series has ratios + per-share figures,
 * but not absolute revenue / totalAssets. Derive them from:
 * - quarterly salesPerShare × sharesOutstanding(millions) → 近季营收
 * - annual salesPerShare × shares / assetTurnoverTTM → 总资产
 * - totalDebtToTotalAsset → 资产负债率
 */
async function finnhubBasicMetrics(sym: string): Promise<MetricRow[]> {
  try {
    const [basic, profile] = await Promise.all([
      getBasicFinancials(sym),
      getCompanyProfile2(sym),
    ]);
    const metric = basic?.metric ?? {};
    const rows = BASIC_METRIC_KEYS.map((key) => ({
      key,
      value: typeof metric[key] === "number" ? metric[key]! : null,
    })).filter((m) => m.value != null);

    const series = basic?.series;
    const sharesMil = profile?.shareOutstanding; // Finnhub: millions of shares

    const salesQ = latestSeriesValue(series, "salesPerShare", "quarterly");
    const salesA = latestSeriesValue(series, "salesPerShare", "annual");
    const turnover =
      latestSeriesValue(series, "assetTurnoverTTM", "quarterly") ??
      latestSeriesValue(series, "assetTurnoverTTM", "annual");
    const debtToAsset =
      latestSeriesValue(series, "totalDebtToTotalAsset", "annual") ??
      latestSeriesValue(series, "totalDebtToTotalAsset", "quarterly") ??
      latestSeriesValue(series, "longtermDebtTotalAsset", "annual");

    if (salesQ != null && sharesMil != null && sharesMil > 0) {
      rows.push({
        key: "revenueLatest",
        value: salesQ * sharesMil * 1e6,
      });
    }

    if (
      salesA != null &&
      sharesMil != null &&
      sharesMil > 0 &&
      turnover != null &&
      turnover > 0
    ) {
      const revTtm = salesA * sharesMil * 1e6;
      rows.push({ key: "totalAssets", value: revTtm / turnover });
    }

    if (debtToAsset != null) {
      rows.push({
        key: "debtToAssetRatio",
        // series values are ratios (0.41); metric map sometimes uses percent
        value: debtToAsset <= 1.5 ? debtToAsset * 100 : debtToAsset,
      });
    }

    return rows;
  } catch {
    return [];
  }
}

async function week52FromCandles(
  symbol: string,
  assetType: AssetType,
): Promise<MetricRow[]> {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 370 * 86400;
    const bars = await getDailyCandles(symbol, assetType, from, to);
    if (!bars.length) return [];
    let high = -Infinity;
    let low = Infinity;
    for (const b of bars) {
      if (b.high > high) high = b.high;
      if (b.low > 0 && b.low < low) low = b.low;
    }
    const out: MetricRow[] = [];
    if (Number.isFinite(high) && high > 0) {
      out.push({ key: "52WeekHigh", value: high });
    }
    if (Number.isFinite(low) && low < Infinity) {
      out.push({ key: "52WeekLow", value: low });
    }
    return out;
  } catch {
    return [];
  }
}

type EarningsBundle = NonNullable<
  Awaited<ReturnType<typeof getLongbridgeEarnings>>
>;

type CalRow = {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  year: number;
};

async function finnhubCalendarRows(sym: string): Promise<{
  upcoming: CalRow[];
  recent: CalRow[];
}> {
  if (!isProviderEnabled("finnhub")) {
    return { upcoming: [], recent: [] };
  }
  try {
    const today = new Date();
    const from = format(subMonths(today, 18), "yyyy-MM-dd");
    const to = format(addMonths(today, 9), "yyyy-MM-dd");
    const calendar = await getEarningsCalendar(sym, from, to);
    const todayStr = format(today, "yyyy-MM-dd");
    const upcoming = calendar
      .filter((c) => c.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    const recent = calendar
      .filter((c) => c.date < todayStr)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
    return { upcoming, recent };
  } catch {
    return { upcoming: [], recent: [] };
  }
}

function mergeCalendarRevenue(
  primary: { upcoming: CalRow[]; recent: CalRow[] },
  fh: { upcoming: CalRow[]; recent: CalRow[] },
): { upcoming: CalRow[]; recent: CalRow[] } {
  const byDate = new Map<string, CalRow>();
  for (const row of [...fh.recent, ...fh.upcoming]) {
    byDate.set(row.date, row);
  }

  function patch(rows: CalRow[]): CalRow[] {
    return rows.map((row) => {
      if (row.revenueActual != null || row.revenueEstimate != null) return row;
      const hit = byDate.get(row.date);
      if (!hit) return row;
      return {
        ...row,
        revenueActual: hit.revenueActual ?? row.revenueActual,
        revenueEstimate: hit.revenueEstimate ?? row.revenueEstimate,
      };
    });
  }

  const primaryHasRev = [...primary.recent, ...primary.upcoming].some(
    (r) => r.revenueActual != null,
  );
  if (primaryHasRev) {
    return {
      upcoming: patch(primary.upcoming),
      recent: patch(primary.recent),
    };
  }

  // LB/Futu never fill revenue — prefer Finnhub calendar when present
  if (fh.recent.length || fh.upcoming.length) {
    return {
      upcoming: fh.upcoming.length ? fh.upcoming : primary.upcoming,
      recent: fh.recent.length ? fh.recent : primary.recent,
    };
  }

  return primary;
}

async function enrichBundle(
  bundle: EarningsBundle,
  sym: string,
  assetType: AssetType,
  source: string,
) {
  const [fh, fhCal] = await Promise.all([
    finnhubBasicMetrics(sym),
    finnhubCalendarRows(sym),
  ]);
  let metrics = mergeMetrics(bundle.metrics, fh);
  const needWeek =
    !metrics.some((m) => m.key === "52WeekHigh") ||
    !metrics.some((m) => m.key === "52WeekLow");
  if (needWeek) {
    metrics = mergeMetrics(metrics, await week52FromCandles(sym, assetType));
  }

  // Surface latest calendar revenue as a metric for compare UI
  const calRev =
    [...fhCal.recent, ...bundle.calendar.recent].find(
      (r) => r.revenueActual != null,
    )?.revenueActual ?? null;
  if (calRev != null && !metrics.some((m) => m.key === "revenueLatest")) {
    metrics = mergeMetrics(metrics, [{ key: "revenueLatest", value: calRev }]);
  }

  return {
    symbol: sym,
    surprises: bundle.surprises,
    calendar: mergeCalendarRevenue(bundle.calendar, fhCal),
    metrics,
    source: fh.length || fhCal.recent.length ? `${source}+finnhub` : source,
    degraded: false,
  };
}

function hasBundleData(lb: EarningsBundle | null): lb is EarningsBundle {
  return Boolean(
    lb &&
      (lb.metrics.length ||
        lb.surprises.length ||
        lb.calendar.upcoming.length ||
        lb.calendar.recent.length),
  );
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      const assetType = parseAssetType(searchParams.get("assetType"));
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }

      const sym = symbol.toUpperCase();

      if (assetType === "hk" || assetType === "stock") {
        if (isProviderEnabled("longbridge")) {
          try {
            const lb = await getLongbridgeEarnings(sym, assetType);
            if (hasBundleData(lb)) {
              return NextResponse.json(
                await enrichBundle(lb, sym, assetType, "longbridge"),
              );
            }
          } catch (err) {
            console.warn(
              "[earnings] longbridge failed:",
              err instanceof Error ? err.message : err,
            );
          }
        }

        if (isProviderEnabled("futu")) {
          try {
            const futu = await getFutuEarnings(sym, assetType);
            if (hasBundleData(futu)) {
              return NextResponse.json(
                await enrichBundle(futu, sym, assetType, "futu"),
              );
            }
          } catch (err) {
            console.warn(
              "[earnings] futu failed:",
              err instanceof Error ? err.message : err,
            );
          }
        }

        if (assetType === "hk") {
          const fh = isProviderEnabled("finnhub")
            ? await finnhubBasicMetrics(sym)
            : [];
          const week = await week52FromCandles(sym, assetType);
          return NextResponse.json({
            symbol: sym,
            surprises: [],
            calendar: { upcoming: [], recent: [] },
            metrics: mergeMetrics(fh, week),
            source: fh.length || week.length ? "fallback" : null,
            degraded: true,
          });
        }
      }

      if (!isProviderEnabled("finnhub")) {
        return NextResponse.json({
          symbol: sym,
          surprises: [],
          calendar: { upcoming: [], recent: [] },
          metrics: await week52FromCandles(sym, assetType),
          source: null,
          degraded: true,
        });
      }

      const today = new Date();
      const from = format(subMonths(today, 3), "yyyy-MM-dd");
      const to = format(addMonths(today, 9), "yyyy-MM-dd");

      const [surprisesResult, calendarResult, metricsResult] =
        await Promise.allSettled([
          getEarnings(sym),
          getEarningsCalendar(sym, from, to),
          finnhubBasicMetrics(sym),
        ]);

      const surprises =
        surprisesResult.status === "fulfilled" ? surprisesResult.value : [];
      const calendar =
        calendarResult.status === "fulfilled" ? calendarResult.value : [];

      // Full Finnhub metric extraction (series revenue / assets / etc.)
      let metrics =
        metricsResult.status === "fulfilled" ? metricsResult.value : [];

      if (
        !metrics.some((m) => m.key === "52WeekHigh") ||
        !metrics.some((m) => m.key === "52WeekLow")
      ) {
        metrics = mergeMetrics(metrics, await week52FromCandles(sym, "stock"));
      }

      const upcoming = calendar
        .filter((c) => c.date >= format(today, "yyyy-MM-dd"))
        .sort((a, b) => a.date.localeCompare(b.date));
      const recentCalendar = calendar
        .filter((c) => c.date < format(today, "yyyy-MM-dd"))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8);

      const calRev = recentCalendar.find(
        (c) => c.revenueActual != null,
      )?.revenueActual;
      if (calRev != null && !metrics.some((m) => m.key === "revenueLatest")) {
        metrics = mergeMetrics(metrics, [
          { key: "revenueLatest", value: calRev },
        ]);
      }

      const degraded =
        surprisesResult.status === "rejected" &&
        calendarResult.status === "rejected" &&
        metricsResult.status === "rejected";

      return NextResponse.json({
        symbol: sym,
        surprises,
        calendar: {
          upcoming,
          recent: recentCalendar,
        },
        metrics,
        source: degraded ? null : "finnhub",
        degraded,
      });
    });
  } catch (err) {
    console.error("earnings", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Earnings failed",
        surprises: [],
        calendar: { upcoming: [], recent: [] },
        metrics: [],
        degraded: true,
      },
      { status: 200 },
    );
  }
}
