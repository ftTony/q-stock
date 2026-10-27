import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  fetchFutuOptionChain,
  fetchFutuOptionExpiries,
} from "@/lib/market/providers/futu-options";
import {
  fetchLbOptionChain,
  fetchLbOptionExpiries,
} from "@/lib/market/providers/longbridge-research";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export const dynamic = "force-dynamic";

function classifyError(msg: string): string | undefined {
  if (/connections (limitation|exhausted)/i.test(msg)) return "LB_CONN_LIMIT";
  if (/no option-chain access|USOption|404000|api not found/i.test(msg)) {
    return "LB_OPTION_PACKAGE";
  }
  if (/Futu credentials not configured/i.test(msg)) return "FUTU_NO_CREDS";
  if (/Futu .*unsupported|market not in/i.test(msg)) return "FUTU_UNSUPPORTED";
  return undefined;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      const assetType = parseAssetType(searchParams.get("assetType"));
      const expiry = searchParams.get("expiry");
      const spot = Number(searchParams.get("spot") || 0);
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }
      if (assetType !== "stock" && assetType !== "hk") {
        return NextResponse.json({ unavailable: true });
      }

      const errors: string[] = [];
      const spotN = Number.isFinite(spot) ? spot : 0;

      if (!expiry) {
        try {
          const expiries = await fetchLbOptionExpiries(symbol, assetType);
          return NextResponse.json({ expiries, source: "longbridge" });
        } catch (err) {
          errors.push(
            `longbridge: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        try {
          const expiries = await fetchFutuOptionExpiries(symbol, assetType);
          return NextResponse.json({ expiries, source: "futu" });
        } catch (err) {
          errors.push(
            `futu: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } else {
        try {
          const chain = await fetchLbOptionChain(
            symbol,
            assetType,
            expiry,
            spotN,
          );
          return NextResponse.json({ ...chain, source: "longbridge" });
        } catch (err) {
          errors.push(
            `longbridge: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        try {
          const chain = await fetchFutuOptionChain(
            symbol,
            assetType,
            expiry,
            spotN,
          );
          return NextResponse.json({ ...chain, source: "futu" });
        } catch (err) {
          errors.push(
            `futu: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      const detail = errors.join(" | ");
      console.warn("[options]", detail);
      const code =
        classifyError(errors.find((e) => e.startsWith("longbridge:")) ?? "") ??
        classifyError(errors.find((e) => e.startsWith("futu:")) ?? "");
      return NextResponse.json({
        unavailable: true,
        detail,
        code,
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "options failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
