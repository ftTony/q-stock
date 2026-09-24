import { NextResponse } from "next/server";
import { format, subMonths, addMonths } from "date-fns";
import { auth } from "@/lib/auth";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
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

async function finnhubBasicMetrics(sym: string): Promise<MetricRow[]> {
  try {
    const basic = await getBasicFinancials(sym);
    const metric = basic?.metric ?? {};
    return BASIC_METRIC_KEYS.map((key) => ({
      key,
      value: typeof metric[key] === "number" ? metric[key] : null,
    })).filter((m) => m.value != null);
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

async function enrichBundle(
  bundle: EarningsBundle,
  sym: string,
  assetType: AssetType,
  source: string,
) {
  const fh = await finnhubBasicMetrics(sym);
  let metrics = mergeMetrics(bundle.metrics, fh);
  const needWeek =
    !metrics.some((m) => m.key === "52WeekHigh") ||
    !metrics.some((m) => m.key === "52WeekLow");
  if (needWeek) {
    metrics = mergeMetrics(metrics, await week52FromCandles(sym, assetType));
  }
  return {
    symbol: sym,
    surprises: bundle.surprises,
    calendar: bundle.calendar,
    metrics,
    source: fh.length ? `${source}+finnhub` : source,
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
          getBasicFinancials(sym),
        ]);

      const surprises =
        surprisesResult.status === "fulfilled" ? surprisesResult.value : [];
      const calendar =
        calendarResult.status === "fulfilled" ? calendarResult.value : [];
      const basic =
        metricsResult.status === "fulfilled" ? metricsResult.value : null;

      const metric = basic?.metric ?? {};
      let metrics = BASIC_METRIC_KEYS.map((key) => ({
        key,
        value: typeof metric[key] === "number" ? metric[key] : null,
      })).filter((m) => m.value != null) as MetricRow[];

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
