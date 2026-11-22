import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFutuConstituentsPage } from "@/lib/market/providers/futu-constituents";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

/** Two upstream calls (screen + snapshot) per page; hard ceiling keeps the tab responsive. */
const PROVIDER_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = (searchParams.get("symbol") || "").trim();
      if (!symbol) {
        return NextResponse.json(
          { error: "Missing symbol", constituents: [] },
          { status: 400 },
        );
      }
      const assetType = parseAssetType(searchParams.get("assetType"));
      const nextKey = searchParams.get("nextKey") || "";

      try {
        const page = await withTimeout(
          getFutuConstituentsPage(symbol, assetType, nextKey),
          PROVIDER_TIMEOUT_MS,
          "index constituents",
        );
        return NextResponse.json({
          constituents: page.constituents,
          total: page.total,
          nextKey: page.nextKey,
          hasMore: page.hasMore,
          source: page.source,
        });
      } catch (err) {
        console.warn(
          "[indices/constituents] provider failed:",
          err instanceof Error ? err.message : err,
        );
        return NextResponse.json(
          {
            constituents: [],
            total: 0,
            nextKey: null,
            hasMore: false,
            source: null,
            degraded: true,
            error: err instanceof Error ? err.message : "Constituents failed",
          },
          { status: 502 },
        );
      }
    });
  } catch (err) {
    console.error("indices/constituents", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Constituents failed",
        constituents: [],
      },
      { status: 502 },
    );
  }
}
