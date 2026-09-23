import { NextResponse } from "next/server";
import { aggregateCandles } from "@/lib/candles/aggregate";
import {
  getDailyCandles,
  getMonthlyCandles,
} from "@/lib/market";
import { MarketDataError } from "@/lib/market";
import { computeIndicators } from "@/lib/indicators";
import { parseAssetType, type CandleResolution } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));
    const resolution = (searchParams.get("resolution") || "D") as CandleResolution;
    const withIndicators = searchParams.get("indicators") !== "0";

    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    let bars;

    if (resolution === "Y") {
      const from = now - 20 * 365 * 24 * 3600;
      const monthly = await getMonthlyCandles(symbol, assetType, from, now);
      bars = aggregateCandles(monthly.length ? monthly : await getDailyCandles(symbol, assetType, from, now), "Y");
    } else if (resolution === "Q") {
      const from = now - 10 * 365 * 24 * 3600;
      const monthly = await getMonthlyCandles(symbol, assetType, from, now);
      bars = aggregateCandles(
        monthly.length ? monthly : await getDailyCandles(symbol, assetType, from, now),
        "Q",
      );
    } else {
      const from = now - 3 * 365 * 24 * 3600;
      bars = await getDailyCandles(symbol, assetType, from, now);
    }

    const indicators = withIndicators ? computeIndicators(bars) : undefined;
    return NextResponse.json({ bars, indicators, resolution });
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
