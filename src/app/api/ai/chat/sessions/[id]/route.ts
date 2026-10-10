import { requireAiUser } from "@/lib/ai/http";
import {
  deleteAiChatSession,
  getAiChatSession,
} from "@/lib/ai/chat-sessions";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const session = await getAiChatSession(gate.userId, id);
  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    session: {
      id: session.id,
      symbol: session.symbol,
      assetType: session.assetType,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const ok = await deleteAiChatSession(gate.userId, id);
  if (!ok) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
