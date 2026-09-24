import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBrokerGateways } from "@/lib/broker";
import { prisma } from "@/lib/db";
import { getActiveProviders, getProviderPriority } from "@/lib/market";
import { hasLongbridgeCreds } from "@/lib/market/providers/longbridge-client";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import { withUserMarket } from "@/lib/market/with-user-market";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const providers = getActiveProviders();
      const providerMap = Object.fromEntries(
        providers.map((p) => [p.id, p.configured]),
      );
      return NextResponse.json({
        ok: true,
        providers: providerMap,
        providerPriority: getProviderPriority(),
        brokers: listBrokerGateways(),
        finnhub: Boolean(process.env.FINNHUB_API_KEY),
        longbridge: hasLongbridgeCreds(),
        futu: isFutuConfigured(),
        adanos: Boolean(process.env.ADANOS_API_KEY),
        deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
        binance: true,
      });
    });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
