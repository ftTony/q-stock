import { NextResponse } from "next/server";
import { format, subMonths, addMonths } from "date-fns";
import { auth } from "@/lib/auth";
import { getEarnings, getEarningsCalendar } from "@/lib/finnhub/client";
import {
  buildStatementPayload,
  loadFinnhubFinBundle,
} from "@/lib/earnings/finnhub-bundle";
import { loadFinnhubStatements } from "@/lib/earnings/finnhub-statements";
import { getLongbridgeEarnings } from "@/lib/market/providers/longbridge";
import { getFutuEarnings } from "@/lib/market/providers/futu-content";
import { getDailyCandles } from "@/lib/market";
import { isProviderEnabled } from "@/lib/market/router";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType, type AssetType } from "@/lib/types";
import type { SeriesLike } from "@/lib/earnings/build-statement";
import type { EarningsStatement } from "@/lib/earnings/types";

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

  if (fh.recent.length || fh.upcoming.length) {
    return {
      upcoming: fh.upcoming.length ? fh.upcoming : primary.upcoming,
      recent: fh.recent.length ? fh.recent : primary.recent,
    };
  }

  return primary;
}

function withStatement(
  surprises: EarningsBundle["surprises"],
  recent: CalRow[],
  series: SeriesLike[],
): EarningsStatement | null {
  return buildStatementPayload(surprises, recent, series);
}

async function enrichBundle(
  bundle: EarningsBundle,
  sym: string,
  assetType: AssetType,
  source: string,
) {
  const needFhStmt =
    isProviderEnabled("finnhub") &&
    (!bundle.balance?.rows.length || !bundle.cashflow?.rows.length);

  const [fhBundle, fhCal, fhStmt] = await Promise.all([
    isProviderEnabled("finnhub")
      ? loadFinnhubFinBundle(sym)
      : Promise.resolve({ metrics: [] as MetricRow[], series: [] as SeriesLike[] }),
    finnhubCalendarRows(sym),
    needFhStmt
      ? loadFinnhubStatements(sym)
      : Promise.resolve({ balance: null, cashflow: null }),
  ]);
  let metrics = mergeMetrics(bundle.metrics, fhBundle.metrics);
  const needWeek =
    !metrics.some((m) => m.key === "52WeekHigh") ||
    !metrics.some((m) => m.key === "52WeekLow");
  if (needWeek && process.env.EARNINGS_WEEK52_CANDLES === "1") {
    metrics = mergeMetrics(metrics, await week52FromCandles(sym, assetType));
  }

  const calendar = mergeCalendarRevenue(bundle.calendar, fhCal);
  const calRev =
    [...fhCal.recent, ...bundle.calendar.recent].find(
      (r) => r.revenueActual != null,
    )?.revenueActual ?? null;
  if (calRev != null && !metrics.some((m) => m.key === "revenueLatest")) {
    metrics = mergeMetrics(metrics, [{ key: "revenueLatest", value: calRev }]);
  }

  const balance = bundle.balance?.rows.length
    ? bundle.balance
    : fhStmt.balance;
  const cashflow = bundle.cashflow?.rows.length
    ? bundle.cashflow
    : fhStmt.cashflow;

  return {
    symbol: sym,
    surprises: bundle.surprises,
    calendar,
    metrics,
    statement: withStatement(
      bundle.surprises,
      calendar.recent,
      fhBundle.series,
    ),
    balance,
    cashflow,
    source:
      fhBundle.metrics.length || fhCal.recent.length || fhStmt.balance || fhStmt.cashflow
        ? `${source}+finnhub`
        : source,
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
            ? await loadFinnhubFinBundle(sym)
            : { metrics: [] as MetricRow[], series: [] as SeriesLike[] };
          const week = await week52FromCandles(sym, assetType);
          return NextResponse.json({
            symbol: sym,
            surprises: [],
            calendar: { upcoming: [], recent: [] },
            metrics: mergeMetrics(fh.metrics, week),
            statement: withStatement([], [], fh.series),
            balance: null,
            cashflow: null,
            source: fh.metrics.length || week.length ? "fallback" : null,
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
          statement: null,
          balance: null,
          cashflow: null,
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
          loadFinnhubFinBundle(sym),
        ]);

      const surprises =
        surprisesResult.status === "fulfilled" ? surprisesResult.value : [];
      const calendar =
        calendarResult.status === "fulfilled" ? calendarResult.value : [];
      const fhBundle =
        metricsResult.status === "fulfilled"
          ? metricsResult.value
          : { metrics: [] as MetricRow[], series: [] as SeriesLike[] };

      let metrics = fhBundle.metrics;
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

      const fhStmt = await loadFinnhubStatements(sym);

      return NextResponse.json({
        symbol: sym,
        surprises,
        calendar: {
          upcoming,
          recent: recentCalendar,
        },
        metrics,
        statement: withStatement(surprises, recentCalendar, fhBundle.series),
        balance: fhStmt.balance,
        cashflow: fhStmt.cashflow,
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
        statement: null,
        balance: null,
        cashflow: null,
        degraded: true,
      },
      { status: 200 },
    );
  }
}
