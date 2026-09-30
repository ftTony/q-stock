import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptJson } from "@/lib/crypto/secret-box";
import {
  getUserMarketCredsStatus,
  invalidateUserMarketCredsCache,
} from "@/lib/market/creds-context";

const longbridgeSchema = z.object({
  appKey: z.string().min(1).max(512),
  appSecret: z.string().min(1).max(512),
  accessToken: z.string().min(1).max(16_384),
});

const futuBearerSchema = z.object({
  mode: z.literal("bearer"),
  accessToken: z.string().min(1).max(16_384),
});

const futuAppKeySchema = z.object({
  mode: z.literal("appkey"),
  appKey: z.string().min(1).max(512),
  privateKey: z.string().min(1).max(65_536),
  signAlg: z.enum(["ed25519", "rsa-sha256", "rsa"]).optional(),
});

const binanceSchema = z.object({
  apiKey: z.string().min(1).max(256),
  apiSecret: z.string().max(256).optional(),
});

const okxSchema = z.object({
  apiKey: z.string().min(1).max(256),
  apiSecret: z.string().max(256).optional(),
  passphrase: z.string().max(256).optional(),
});

const fuyaoSchema = z.object({
  apiKey: z.string().min(1).max(512),
});

const putSchema = z
  .object({
    longbridge: longbridgeSchema.optional(),
    futu: z.union([futuBearerSchema, futuAppKeySchema]).optional(),
    binance: binanceSchema.optional(),
    okx: okxSchema.optional(),
    fuyao: fuyaoSchema.optional(),
    equityVendor: z.enum(["longbridge", "futu"]).optional(),
    cryptoVendor: z.enum(["binance", "okx"]).optional(),
  })
  .refine(
    (v) =>
      v.longbridge != null ||
      v.futu != null ||
      v.binance != null ||
      v.okx != null ||
      v.fuyao != null ||
      v.equityVendor != null ||
      v.cryptoVendor != null,
    { message: "Provide credentials and/or vendor preference" },
  );

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = await getUserMarketCredsStatus(session.user.id);
  return NextResponse.json(status);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json(
      {
        error: "Your session is outdated. Sign out and sign in again.",
        code: "SESSION_USER_NOT_FOUND",
      },
      { status: 401 },
    );
  }

  try {
    if (parsed.data.equityVendor || parsed.data.cryptoVendor) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(parsed.data.equityVendor
            ? { equityVendor: parsed.data.equityVendor }
            : {}),
          ...(parsed.data.cryptoVendor
            ? { cryptoVendor: parsed.data.cryptoVendor }
            : {}),
        },
      });
    }

    if (parsed.data.longbridge) {
      const payload = encryptJson(parsed.data.longbridge);
      await prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "longbridge" } },
        create: { userId, provider: "longbridge", payload },
        update: { payload },
      });
    }

    if (parsed.data.futu) {
      const payload = encryptJson(parsed.data.futu);
      await prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "futu" } },
        create: { userId, provider: "futu", payload },
        update: { payload },
      });
    }

    if (parsed.data.binance) {
      const payload = encryptJson({
        apiKey: parsed.data.binance.apiKey,
        apiSecret: parsed.data.binance.apiSecret?.trim() || undefined,
      });
      await prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "binance" } },
        create: { userId, provider: "binance", payload },
        update: { payload },
      });
    }

    if (parsed.data.okx) {
      const payload = encryptJson({
        apiKey: parsed.data.okx.apiKey,
        apiSecret: parsed.data.okx.apiSecret?.trim() || undefined,
        passphrase: parsed.data.okx.passphrase?.trim() || undefined,
      });
      await prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "okx" } },
        create: { userId, provider: "okx", payload },
        update: { payload },
      });
    }

    if (parsed.data.fuyao) {
      const payload = encryptJson({
        apiKey: parsed.data.fuyao.apiKey,
      });
      await prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "fuyao" } },
        create: { userId, provider: "fuyao", payload },
        update: { payload },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Save failed";
    console.error("[market-credentials] save failed:", msg);
    if (/CREDENTIALS_ENCRYPTION_KEY/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Server missing CREDENTIALS_ENCRYPTION_KEY — add it to .env and restart",
          code: "ENCRYPTION_KEY_MISSING",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  invalidateUserMarketCredsCache(userId);
  const status = await getUserMarketCredsStatus(userId);
  return NextResponse.json(status);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = new URL(req.url).searchParams.get("provider");
  if (
    provider !== "longbridge" &&
    provider !== "futu" &&
    provider !== "binance" &&
    provider !== "okx" &&
    provider !== "fuyao"
  ) {
    return NextResponse.json(
      { error: "provider must be longbridge, futu, binance, okx, or fuyao" },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  await prisma.userMarketCredential.deleteMany({
    where: { userId, provider },
  });
  invalidateUserMarketCredsCache(userId);
  const status = await getUserMarketCredsStatus(userId);
  return NextResponse.json(status);
}
