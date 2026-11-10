import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const BODY_MIN = 8;
const BODY_MAX = 4000;
/** ~150KB data URL ceiling — screenshots must be compressed client-side. */
const IMAGE_MAX = 160_000;
const LIST_TAKE = 30;
const DAY_LIMIT = 8;

const postSchema = z.object({
  body: z.string().trim().min(BODY_MIN).max(BODY_MAX),
  imageData: z
    .string()
    .max(IMAGE_MAX)
    .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/i)
    .optional()
    .nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.featureSuggestion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: LIST_TAKE,
    select: {
      id: true,
      body: true,
      imageData: true,
      status: true,
      createdAt: true,
    },
  });

  // Do not return image payloads on the list path (1GB host / CLS-friendly).
  return NextResponse.json({
    items: items.map((row) => ({
      id: row.id,
      body: row.body,
      hasImage: Boolean(row.imageData),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? null;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (userId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.featureSuggestion.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (recent >= DAY_LIMIT) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429 },
      );
    }
  }

  const imageData = parsed.data.imageData?.trim() || null;

  const row = await prisma.featureSuggestion.create({
    data: {
      userId,
      email,
      body: parsed.data.body,
      imageData,
    },
    select: {
      id: true,
      body: true,
      status: true,
      createdAt: true,
      imageData: true,
    },
  });

  return NextResponse.json({
    item: {
      id: row.id,
      body: row.body,
      hasImage: Boolean(row.imageData),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    },
  });
}
