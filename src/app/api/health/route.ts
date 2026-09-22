import { NextResponse } from "next/server";
import { listBrokerGateways } from "@/lib/broker";
import { prisma } from "@/lib/db";
import { getActiveProviders, getProviderPriority } from "@/lib/market";

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
      futu: Boolean(
        process.env.FUTU_ACCESS_TOKEN ||
          (process.env.FUTU_APP_KEY &&
            (process.env.FUTU_PRIVATE_KEY || process.env.FUTU_PRIVATE_KEY_PATH)),
      ),
      adanos: Boolean(process.env.ADANOS_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
    });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
