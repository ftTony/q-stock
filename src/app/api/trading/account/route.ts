import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  ensureAccounts,
  resetAccount,
  serializeAccount,
  refreshAccountInterest,
} from "@/lib/trading/account";
import { assertTradePasswordFromRequest } from "@/lib/trading/trade-password";
import type { AccountType } from "@prisma/client";

function parseAccountType(v: string | null): AccountType {
  return v === "margin" ? "margin" : "cash";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = parseAccountType(
    new URL(req.url).searchParams.get("accountType"),
  );
  const { cash, margin } = await ensureAccounts(session.user.id);

  // Accrue interest lazily on the margin book (best-effort).
  const [freshCash, freshMargin] = await Promise.all([
    refreshAccountInterest(cash),
    refreshAccountInterest(margin),
  ]);

  const accounts = [freshCash, freshMargin].map(serializeAccount);
  const active =
    requested === "margin" ? freshMargin : freshCash;

  return NextResponse.json({
    account: serializeAccount(active),
    accounts,
  });
}

const postSchema = z.object({
  action: z.literal("reset"),
  accountType: z.enum(["cash", "margin"]).optional(),
  tradePin: z.string().regex(/^\d{6}$/).optional().nullable(),
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

  try {
    await assertTradePasswordFromRequest(req, session.user.id, parsed.data.tradePin);
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "INVALID_TRADE_PASSWORD") {
      return NextResponse.json(
        { error: "Invalid trade password", code },
        { status: 401 },
      );
    }
    throw err;
  }

  const accountType = parsed.data.accountType ?? "cash";
  const account = await resetAccount(session.user.id, accountType);
  return NextResponse.json({ account: serializeAccount(account) });
}
