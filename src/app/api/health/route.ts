import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      finnhub: Boolean(process.env.FINNHUB_API_KEY),
      adanos: Boolean(process.env.ADANOS_API_KEY),
    });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
