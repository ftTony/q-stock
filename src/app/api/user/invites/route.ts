import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromDbLocale } from "@/i18n/config";
import {
  appBaseUrl,
  ensureUserInviteCodes,
  inviteRegisterUrl,
} from "@/lib/user/invites";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      locale: true,
      aiUsageCount: true,
      aiUsageLimit: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserInviteCodes(userId);

  const rows = await prisma.inviteCode.findMany({
    where: { ownerId: userId },
    orderBy: [{ usedAt: "asc" }, { createdAt: "asc" }],
    select: { code: true, usedAt: true, usedById: true },
  });

  const locale = fromDbLocale(user.locale);
  const base = appBaseUrl();

  return NextResponse.json({
    aiQuota: {
      used: user.aiUsageCount,
      limit: user.aiUsageLimit,
      remaining: Math.max(0, user.aiUsageLimit - user.aiUsageCount),
    },
    invites: rows.map((r) => ({
      code: r.code,
      used: Boolean(r.usedById && r.usedAt),
      usedAt: r.usedAt?.toISOString() ?? null,
      inviteLink: inviteRegisterUrl({ baseUrl: base, locale, code: r.code }),
    })),
  });
}
