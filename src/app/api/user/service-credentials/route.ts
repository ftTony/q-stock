import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptJson } from "@/lib/crypto/secret-box";
import {
  getUserServiceCredsStatus,
  invalidateUserServiceCredsCache,
  loadUserServiceCreds,
  mergeAiCreds,
  mergeEmailCreds,
} from "@/lib/user/service-creds";

const emailPutSchema = z.object({
  channel: z.enum(["resend", "smtp"]),
  from: z.string().email().max(320),
  resendApiKey: z.string().max(512).optional(),
  smtpHost: z.string().max(256).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpUser: z.string().max(320).optional(),
  smtpPass: z.string().max(512).optional(),
  smtpSecure: z.boolean().optional(),
});

const aiPutSchema = z.object({
  vendor: z.enum([
    "deepseek",
    "openai",
    "openai_compat",
    "gemini",
    "anthropic",
  ]),
  apiKey: z.string().max(512).optional(),
  model: z.string().min(1).max(128),
  baseUrl: z.string().max(512).optional(),
});

const putSchema = z
  .object({
    email: emailPutSchema.optional(),
    ai: aiPutSchema.optional(),
  })
  .refine((v) => v.email != null || v.ai != null, {
    message: "Provide email and/or ai credentials",
  });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = await getUserServiceCredsStatus(session.user.id);
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
    const existing = await loadUserServiceCreds(userId);

    if (parsed.data.email) {
      const merged = mergeEmailCreds(parsed.data.email, existing.email);
      if (!merged) {
        return NextResponse.json(
          {
            error:
              "Email credentials incomplete — provide API key / SMTP host (or keep existing)",
          },
          { status: 400 },
        );
      }
      const payload = encryptJson(merged);
      await prisma.userServiceCredential.upsert({
        where: { userId_provider: { userId, provider: "email" } },
        create: { userId, provider: "email", payload },
        update: { payload },
      });
    }

    if (parsed.data.ai) {
      const merged = mergeAiCreds(parsed.data.ai, existing.ai);
      if (!merged) {
        return NextResponse.json(
          {
            error:
              "AI credentials incomplete — provide API key and model (compat needs Base URL)",
          },
          { status: 400 },
        );
      }
      const payload = encryptJson(merged);
      await prisma.userServiceCredential.upsert({
        where: { userId_provider: { userId, provider: "ai" } },
        create: { userId, provider: "ai", payload },
        update: { payload },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Save failed";
    console.error("[service-credentials] save failed:", msg);
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

  invalidateUserServiceCredsCache(userId);
  const status = await getUserServiceCredsStatus(userId);
  return NextResponse.json(status);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = new URL(req.url).searchParams.get("provider");
  if (provider !== "email" && provider !== "ai") {
    return NextResponse.json(
      { error: "provider must be email or ai" },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  await prisma.userServiceCredential.deleteMany({
    where: { userId, provider },
  });
  invalidateUserServiceCredsCache(userId);
  const status = await getUserServiceCredsStatus(userId);
  return NextResponse.json(status);
}
