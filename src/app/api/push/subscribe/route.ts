import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPushConfigured } from "@/lib/push/vapid";

const subscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(256),
  }),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isPushConfigured();
  const count = configured
    ? await prisma.pushSubscription.count({
        where: { userId: session.user.id },
      })
    : 0;

  return NextResponse.json({
    configured,
    subscribed: count > 0,
    count,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push not configured" },
      { status: 503 },
    );
  }

  const parsed = subscribeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { endpoint, keys } = parsed.data;
  const userAgent = req.headers.get("user-agent")?.slice(0, 512) || null;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let endpoint: string | undefined;
  try {
    const body = await req.json();
    endpoint =
      typeof body?.endpoint === "string" ? body.endpoint : undefined;
  } catch {
    endpoint = undefined;
  }

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id, endpoint },
    });
  } else {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    });
  }

  return NextResponse.json({ ok: true });
}
