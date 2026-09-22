import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  ensureAccount,
  resetAccount,
  serializeAccount,
} from "@/lib/trading/account";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await ensureAccount(session.user.id);
  return NextResponse.json({ account: serializeAccount(account) });
}

const postSchema = z.object({
  action: z.literal("reset"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const account = await resetAccount(session.user.id);
  return NextResponse.json({ account: serializeAccount(account) });
}
