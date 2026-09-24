import { NextResponse } from "next/server";
import { listBrokerGateways } from "@/lib/broker";
import { prisma } from "@/lib/db";
import { getActiveProviders, getProviderPriority } from "@/lib/market";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
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
      longbridge: Boolean(
        process.env.LONGBRIDGE_APP_KEY &&
          process.env.LONGBRIDGE_APP_SECRET &&
          process.env.LONGBRIDGE_ACCESS_TOKEN,
      ),
      futu: isFutuConfigured(),
      adanos: Boolean(process.env.ADANOS_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      binance: true,
    });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
