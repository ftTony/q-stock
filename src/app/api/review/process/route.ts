import { z } from "zod";
import { auth } from "@/lib/auth";
import { buildProcessSummary } from "@/lib/review/process-summary";

const querySchema = z.object({
  period: z.enum(["day", "week"]).default("day"),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    period: url.searchParams.get("period") ?? "day",
  });
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const payload = await buildProcessSummary({
    userId: session.user.id,
    period: parsed.data.period,
  });

  return Response.json(payload);
}
