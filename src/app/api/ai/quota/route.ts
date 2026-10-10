import { requireAiUser, getAiQuotaForUser } from "@/lib/ai/http";

export async function GET() {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;
  const quota = await getAiQuotaForUser(gate.userId);
  return Response.json(quota);
}
