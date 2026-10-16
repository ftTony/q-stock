import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aggregateCandles } from "@/lib/candles/aggregate";
import {
  getDailyCandles,
  getIntradayCandles,
  getMonthlyCandles,
  MarketDataError,
} from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { computeIndicators } from "@/lib/indicators";
import {
  isIntradayResolution,
  parseAssetType,
  type CandleResolution,
} from "@/lib/types";

function parseUnix(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function defaultIntradayFrom(resolution: CandleResolution, to: number): number {
  // Cap windows for 1GB host — prefer recent session over deep history.
  if (resolution === "T") return to - 1 * 24 * 3600;
  if (resolution === "1") return to - 2 * 24 * 3600;
  return to - 5 * 24 * 3600; // 5m
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      const assetType = parseAssetType(searchParams.get("assetType"));
      const resolution = (searchParams.get("resolution") ||
        "D") as CandleResolution;
      const withIndicators = searchParams.get("indicators") !== "0";
      const fromParam = parseUnix(searchParams.get("from"));
      const toParam = parseUnix(searchParams.get("to"));

      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }

      const now = Math.floor(Date.now() / 1000);
      const to = toParam && toParam <= now ? toParam : now;

      let from: number;
      if (fromParam && fromParam < to) {
        from = fromParam;
      } else if (isIntradayResolution(resolution)) {
        from = defaultIntradayFrom(resolution, to);
      } else if (resolution === "Y") {
        from = to - 20 * 365 * 24 * 3600;
      } else if (resolution === "Q") {
        from = to - 10 * 365 * 24 * 3600;
      } else {
        from = to - Math.floor(0.75 * 365 * 24 * 3600);
      }

      if (isIntradayResolution(resolution)) {
        const interval = resolution === "5" ? "5" : "1";
        let bars;
        try {
          bars = await getIntradayCandles(
            symbol,
            assetType,
            from,
            to,
            interval,
          );
        } catch (err) {
          console.warn(
            "candles intraday",
            err instanceof Error ? err.message : err,
          );
          return NextResponse.json({
            bars: [],
            indicators: undefined,
            resolution,
            from,
            to,
            hasMore: false,
            unavailable: "intraday",
          });
        }
        if (!bars.length) {
          return NextResponse.json({
            bars: [],
            indicators: undefined,
            resolution,
            from,
            to,
            hasMore: false,
            unavailable: "intraday",
          });
        }
        // Cap denser minute series harder than daily (memory).
        const cap = resolution === "5" ? 400 : 500;
        if (bars.length > cap) bars = bars.slice(-cap);
        const indicators = withIndicators ? computeIndicators(bars) : undefined;
        return NextResponse.json({
          bars,
          indicators,
          resolution,
          from,
          to,
          hasMore: false,
        });
      }

      let bars;
      if (resolution === "Y") {
        const monthly = await getMonthlyCandles(symbol, assetType, from, to);
        bars = aggregateCandles(
          monthly.length
            ? monthly
            : await getDailyCandles(symbol, assetType, from, to),
          "Y",
        );
      } else if (resolution === "Q") {
        const monthly = await getMonthlyCandles(symbol, assetType, from, to);
        bars = aggregateCandles(
          monthly.length
            ? monthly
            : await getDailyCandles(symbol, assetType, from, to),
          "Q",
        );
      } else {
        bars = await getDailyCandles(symbol, assetType, from, to);
      }

      if (bars.length > 400) bars = bars.slice(-400);
      const indicators = withIndicators ? computeIndicators(bars) : undefined;
      return NextResponse.json({
        bars,
        indicators,
        resolution,
        from,
        to,
        hasMore: bars.length > 0,
      });
    });
  } catch (err) {
    console.error("candles", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch candles";
    if (err instanceof MarketDataError && /HTTP 403/.test(msg)) {
      return NextResponse.json(
        {
          error:
            "K 线拉取失败。请在设置中配置你的长桥或富途 OpenAPI Key，或升级 Finnhub 套餐",
          code: "CANDLE_ACCESS_DENIED",
          detail: msg,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
