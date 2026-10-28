import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getEntitlements,
  limitExceededResponse,
} from "@/lib/billing/entitlements";
import { prisma } from "@/lib/db";
import { normalizeSymbol } from "@/lib/types";

const upsertSchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  whyWatch: z.string().max(2000).optional(),
  question: z.string().max(2000).optional(),
  watchConditions: z.string().max(2000).optional(),
  risks: z.string().max(2000).optional(),
  reviewAt: z.string().datetime().nullable().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const assetType = url.searchParams.get("assetType");

  if (symbol && assetType) {
    const parsedType = z
      .enum(["stock", "hk", "crypto", "cn"])
      .safeParse(assetType);
    if (!parsedType.success) {
      return NextResponse.json({ error: "Invalid assetType" }, { status: 400 });
    }
    const card = await prisma.researchCard.findUnique({
      where: {
        userId_symbol_assetType: {
          userId: session.user.id,
          symbol: normalizeSymbol(symbol, parsedType.data),
          assetType: parsedType.data,
        },
      },
    });
    return NextResponse.json({ card });
  }

  const entitlements = await getEntitlements(session.user.id);
  const cards = await prisma.researchCard.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: entitlements.researchCardLimit,
  });
  return NextResponse.json({
    cards,
    limit: entitlements.researchCardLimit,
    count: cards.length,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const symbol = normalizeSymbol(parsed.data.symbol, parsed.data.assetType);
  const entitlements = await getEntitlements(session.user.id);
  const existing = await prisma.researchCard.findUnique({
    where: {
      userId_symbol_assetType: {
        userId: session.user.id,
        symbol,
        assetType: parsed.data.assetType,
      },
    },
  });

  if (!existing) {
    const count = await prisma.researchCard.count({
      where: { userId: session.user.id },
    });
    if (count >= entitlements.researchCardLimit) {
      return limitExceededResponse(
        "researchCards",
        entitlements.researchCardLimit,
      );
    }
  }

  const data = {
    whyWatch: parsed.data.whyWatch ?? "",
    question: parsed.data.question ?? "",
    watchConditions: parsed.data.watchConditions ?? "",
    risks: parsed.data.risks ?? "",
    reviewAt:
      parsed.data.reviewAt === undefined
        ? undefined
        : parsed.data.reviewAt
          ? new Date(parsed.data.reviewAt)
          : null,
  };

  const card = await prisma.researchCard.upsert({
    where: {
      userId_symbol_assetType: {
        userId: session.user.id,
        symbol,
        assetType: parsed.data.assetType,
      },
    },
    create: {
      userId: session.user.id,
      symbol,
      assetType: parsed.data.assetType,
      whyWatch: data.whyWatch,
      question: data.question,
      watchConditions: data.watchConditions,
      risks: data.risks,
      reviewAt: data.reviewAt ?? null,
    },
    update: {
      ...(parsed.data.whyWatch !== undefined
        ? { whyWatch: parsed.data.whyWatch }
        : {}),
      ...(parsed.data.question !== undefined
        ? { question: parsed.data.question }
        : {}),
      ...(parsed.data.watchConditions !== undefined
        ? { watchConditions: parsed.data.watchConditions }
        : {}),
      ...(parsed.data.risks !== undefined ? { risks: parsed.data.risks } : {}),
      ...(parsed.data.reviewAt !== undefined
        ? {
            reviewAt: parsed.data.reviewAt
              ? new Date(parsed.data.reviewAt)
              : null,
          }
        : {}),
    },
  });

  return NextResponse.json({ card }, { status: existing ? 200 : 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = z
    .object({
      symbol: z.string().min(1).max(20),
      assetType: z.enum(["stock", "hk", "crypto", "cn"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.researchCard.deleteMany({
    where: {
      userId: session.user.id,
      symbol: normalizeSymbol(body.data.symbol, body.data.assetType),
      assetType: body.data.assetType,
    },
  });
  return NextResponse.json({ ok: true });
}
