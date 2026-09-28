import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/email";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const tokenHash = hashResetToken(parsed.data.token);
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: row.userId,
          usedAt: null,
          id: { not: row.id },
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
