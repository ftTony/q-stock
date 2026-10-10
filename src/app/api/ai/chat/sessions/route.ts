import { z } from "zod";
import { requireAiUser } from "@/lib/ai/http";
import {
  latestAiChatSession,
  listAiChatSessions,
  saveAiChatSession,
} from "@/lib/ai/chat-sessions";
import { parseAssetType } from "@/lib/types";

const saveSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

/** List sessions for a symbol, or return latest with messages when latest=1. */
export async function GET(req: Request) {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) {
    return Response.json({ error: "symbol required" }, { status: 400 });
  }
  const assetType = parseAssetType(searchParams.get("assetType"));
  const wantLatest = searchParams.get("latest") === "1";

  if (wantLatest) {
    const session = await latestAiChatSession(gate.userId, symbol, assetType);
    if (!session) {
      return Response.json({ session: null });
    }
    return Response.json({
      session: {
        id: session.id,
        symbol: session.symbol,
        assetType: session.assetType,
        title: session.title,
        updatedAt: session.updatedAt.toISOString(),
        messages: session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    });
  }

  const sessions = await listAiChatSessions(gate.userId, {
    symbol,
    assetType,
  });
  return Response.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      symbol: s.symbol,
      assetType: s.assetType,
      title: s.title,
      messageCount: s._count.messages,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
}

/** Create or update a session after a completed chat turn. */
export async function PUT(req: Request) {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;

  const parsed = saveSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const id = await saveAiChatSession(gate.userId, {
      id: parsed.data.id,
      symbol: parsed.data.symbol,
      assetType: parseAssetType(parsed.data.assetType),
      messages: parsed.data.messages,
    });
    return Response.json({ id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "save failed";
    if (msg === "NOT_FOUND") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (msg === "EMPTY_MESSAGES") {
      return Response.json({ error: "Empty messages" }, { status: 400 });
    }
    console.error("ai/chat/sessions PUT", err);
    return Response.json({ error: "Save failed" }, { status: 500 });
  }
}
