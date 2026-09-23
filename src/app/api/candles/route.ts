import { NextResponse } from "next/server";
import { aggregateCandles } from "@/lib/candles/aggregate";
import {
  getDailyCandles,
  getMonthlyCandles,
  MarketDataError,
} from "@/lib/market";
import { computeIndicators } from "@/lib/indicators";
import { parseAssetType, type CandleResolution } from "@/lib/types";

function parseUnix(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export async function GET(req: Request) {
  try {
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
    } else if (resolution === "Y") {
      from = to - 20 * 365 * 24 * 3600;
    } else if (resolution === "Q") {
      from = to - 10 * 365 * 24 * 3600;
    } else {
      // Initial daily window ~1.5y; older history via from/to pagination on pan
      from = to - Math.floor(1.5 * 365 * 24 * 3600);
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

    const indicators = withIndicators ? computeIndicators(bars) : undefined;
    return NextResponse.json({
      bars,
      indicators,
      resolution,
      from,
      to,
      hasMore: bars.length > 0,
    });
  } catch (err) {
    console.error("candles", err);
    if (
      err instanceof MarketDataError &&
      err.message.includes("HTTP 403")
    ) {
      return NextResponse.json(
        {
          error:
            "Finnhub 当前 API 套餐没有 K 线权限，请升级套餐或配置支持 K 线的数据源",
          code: "CANDLE_ACCESS_DENIED",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch candles" },
      { status: 502 },
    );
  }
}
