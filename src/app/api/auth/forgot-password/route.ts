import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createResetToken,
  hashResetToken,
  sendPasswordResetEmail,
} from "@/lib/email";
import { fromDbLocale } from "@/i18n/config";

const schema = z.object({
  email: z.string().email(),
});

/**
 * Always returns 200 to avoid email enumeration.
 * Creates a one-time token and emails a reset link when the user exists.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, locale: true },
    });

    if (user) {
      // Invalidate unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const token = createResetToken();
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      try {
        await sendPasswordResetEmail({
          to: user.email,
          token,
          locale: fromDbLocale(user.locale),
        });
      } catch (err) {
        console.error("[forgot-password] email failed:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgot-password", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
