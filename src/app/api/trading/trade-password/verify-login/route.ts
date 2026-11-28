import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const verifySchema = z.object({
  /** Login password — proves identity before a forgotten PIN can be reset. */
  loginPassword: z.string().min(1),
});

/**
 * Step 1 of the forgot-trade-PIN flow: verify the account login password.
 * Separate from the reset endpoint so the dialog can advance to "set new
 * PIN" only after the user's identity is actually confirmed.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = verifySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    // OAuth-only account has no login password to verify against.
    return NextResponse.json(
      { error: "No login password", code: "NO_LOGIN_PASSWORD" },
      { status: 400 },
    );
  }
  const ok = await bcrypt.compare(parsed.data.loginPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid login password", code: "INVALID_LOGIN_PASSWORD" },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true });
}
