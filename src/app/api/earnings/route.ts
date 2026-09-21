import { NextResponse } from "next/server";
import { format, subMonths, addMonths } from "date-fns";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getEarnings,
  getEarningsCalendar,
} from "@/lib/finnhub/client";

export async function GET(req: Request) {
  try {
    const symbol = new URL(req.url).searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const sym = symbol.toUpperCase();
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
