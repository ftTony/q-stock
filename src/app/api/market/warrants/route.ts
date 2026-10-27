import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchFutuWarrantList } from "@/lib/market/providers/futu-warrants";
import {
  fetchLbWarrantList,
  type WarrantKind,
} from "@/lib/market/providers/longbridge-warrants";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export const dynamic = "force-dynamic";

const KINDS = new Set<WarrantKind>([
  "call",
  "put",
  "bull",
  "bear",
  "inline",
]);

function parseKinds(raw: string | null): WarrantKind[] | null {
  if (!raw?.trim()) return null;
  const out = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is WarrantKind => KINDS.has(s as WarrantKind));
  return out.length ? out : null;
}

function classifyError(msg: string): string | undefined {
  if (/connections (limitation|exhausted)/i.test(msg)) return "LB_CONN_LIMIT";
  if (/no warrant access|404000|api not found/i.test(msg)) {
    return "LB_WARRANT_PACKAGE";
  }
  if (/Futu credentials not configured/i.test(msg)) return "FUTU_NO_CREDS";
  return undefined;
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
      if (assetType !== "hk") {
        return NextResponse.json({ unavailable: true });
      }

      const kinds = parseKinds(searchParams.get("types"));
      const errors: string[] = [];

      try {
        const rows = await fetchLbWarrantList(symbol, assetType, kinds);
        return NextResponse.json({ rows, source: "longbridge" });
      } catch (err) {
        errors.push(
          `longbridge: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      try {
        const rows = await fetchFutuWarrantList(symbol, assetType, kinds);
        return NextResponse.json({ rows, source: "futu" });
      } catch (err) {
        errors.push(
          `futu: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      const detail = errors.join(" | ");
      console.warn("[warrants]", detail);
      return NextResponse.json({
        unavailable: true,
        detail,
        code:
          classifyError(errors.find((e) => e.startsWith("longbridge:")) ?? "") ??
          classifyError(errors.find((e) => e.startsWith("futu:")) ?? ""),
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "warrants failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
