import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { toDbLocale } from "@/i18n/config";
import { generateInviteCode } from "@/lib/user/invites";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  name: z.string().min(1).max(64).optional(),
  locale: z.string().optional(),
  inviteCode: z.string().min(6).max(32).optional(),
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

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const locale = parsed.data.locale || "en";
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const rawInvite = parsed.data.inviteCode?.trim();

    let inviteRow: {
      id: string;
      ownerId: string;
      usedById: string | null;
    } | null = null;

    if (rawInvite) {
      inviteRow = await prisma.inviteCode.findUnique({
        where: { code: rawInvite },
        select: { id: true, ownerId: true, usedById: true },
      });
      if (!inviteRow || inviteRow.usedById) {
        return NextResponse.json(
          { error: "Invalid or used invite code" },
          { status: 400 },
        );
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: parsed.data.name,
          locale: toDbLocale(locale),
        },
        select: { id: true, email: true, name: true },
      });

      if (inviteRow) {
        const updated = await tx.inviteCode.updateMany({
          where: { id: inviteRow.id, usedById: null },
          data: { usedById: created.id, usedAt: new Date() },
        });
        if (updated.count !== 1) {
          throw new Error("INVITE_RACE");
        }

        // Reward inviter with one new code (“缘法流转”).
        for (let attempt = 0; attempt < 8; attempt++) {
          try {
            await tx.inviteCode.create({
              data: {
                code: generateInviteCode(),
                ownerId: inviteRow.ownerId,
              },
            });
            break;
          } catch {
            /* unique collision — retry */
          }
        }
      }

      return created;
    });

    void sendWelcomeEmail({
      to: user.email,
      name: user.name,
      locale,
    }).catch((err) => {
      console.error("[register] welcome email failed:", err);
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INVITE_RACE") {
      return NextResponse.json(
        { error: "Invalid or used invite code" },
        { status: 400 },
      );
    }
    console.error("register", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
