import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEntitlements } from "@/lib/billing/entitlements";
import { peekAiQuota } from "@/lib/ai/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [entitlements, quota] = await Promise.all([
    getEntitlements(session.user.id),
    peekAiQuota(session.user.id),
  ]);

  return NextResponse.json({ entitlements, quota });
}
