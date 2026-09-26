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
  // Longbridge JWT / refresh-style tokens can be long
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

const putSchema = z
  .object({
    longbridge: longbridgeSchema.optional(),
    futu: z.union([futuBearerSchema, futuAppKeySchema]).optional(),
  })
  .refine((v) => v.longbridge != null || v.futu != null, {
    message: "Provide longbridge and/or futu credentials",
  });

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
    if (parsed.data.longbridge) {
      const payload = encryptJson(parsed.data.longbridge);
      await prisma.userMarketCredential.upsert({
        where: {
          userId_provider: { userId, provider: "longbridge" },
        },
        create: { userId, provider: "longbridge", payload },
        update: { payload },
      });
    }

    if (parsed.data.futu) {
      const payload = encryptJson(parsed.data.futu);
      await prisma.userMarketCredential.upsert({
        where: {
          userId_provider: { userId, provider: "futu" },
        },
        create: { userId, provider: "futu", payload },
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
    if (/userMarketCredential|UserMarketCredential|prisma generate/i.test(msg)) {
      if (/UserMarketCredential_userId_fkey/i.test(msg)) {
        return NextResponse.json(
          {
            error: "Your session is outdated. Sign out and sign in again.",
            code: "SESSION_USER_NOT_FOUND",
          },
          { status: 401 },
        );
      }
      return NextResponse.json(
        {
          error:
            "Prisma client outdated — run `npx prisma generate` and restart the server",
          code: "PRISMA_CLIENT_STALE",
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
  if (provider !== "longbridge" && provider !== "futu") {
    return NextResponse.json(
      { error: "provider must be longbridge or futu" },
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
