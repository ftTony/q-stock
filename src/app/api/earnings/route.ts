import { NextResponse } from "next/server";
import { format, subMonths, addMonths } from "date-fns";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getEarnings,
  getEarningsCalendar,
} from "@/lib/finnhub/client";
import { getLongbridgeEarnings } from "@/lib/market/providers/longbridge";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const sym = symbol.toUpperCase();

    // HK (and stock when Longbridge has data): prefer Longbridge fundamentals
    if (assetType === "hk" || assetType === "stock") {
      try {
        const lb = await getLongbridgeEarnings(sym, assetType);
        if (lb && (lb.metrics.length || lb.surprises.length || lb.calendar.upcoming.length || lb.calendar.recent.length)) {
          // For US stock, still merge Finnhub if Longbridge is thin — but if HK, return LB only
          if (assetType === "hk") {
            return NextResponse.json({
              symbol: sym,
              surprises: lb.surprises,
              calendar: lb.calendar,
              metrics: lb.metrics,
              source: "longbridge",
              degraded: false,
            });
          }
          // stock: if LB has good data use it; otherwise fall through to Finnhub
          if (lb.surprises.length >= 2 || lb.metrics.length >= 2) {
            return NextResponse.json({
              symbol: sym,
              surprises: lb.surprises,
              calendar: lb.calendar,
              metrics: lb.metrics,
              source: "longbridge",
              degraded: false,
            });
          }
        }
      } catch (err) {
        console.warn(
          "[earnings] longbridge failed:",
          err instanceof Error ? err.message : err,
        );
        if (assetType === "hk") {
          return NextResponse.json({
            symbol: sym,
            surprises: [],
            calendar: { upcoming: [], recent: [] },
            metrics: [],
            source: null,
            degraded: true,
          });
        }
      }
    }

    if (assetType === "hk") {
      return NextResponse.json({
        symbol: sym,
        surprises: [],
        calendar: { upcoming: [], recent: [] },
        metrics: [],
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
    const metrics = BASIC_METRIC_KEYS.map((key) => ({
      key,
      value: typeof metric[key] === "number" ? metric[key] : null,
    })).filter((m) => m.value !== null && m.value !== undefined);

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
