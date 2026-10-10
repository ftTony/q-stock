import { prisma } from "@/lib/db";
import type { AssetType } from "@/lib/types";

export type ChatMessageInput = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 40;
const MAX_SESSIONS_LIST = 30;

function previewTitle(messages: ChatMessageInput[]): string {
  const first = messages.find((m) => m.role === "user" && m.content.trim());
  const text = (first?.content || "对话").trim().replace(/\s+/g, " ");
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export async function listAiChatSessions(
  userId: string,
  opts: { symbol: string; assetType: AssetType; limit?: number },
) {
  const limit = Math.min(opts.limit ?? MAX_SESSIONS_LIST, 50);
  return prisma.aiChatSession.findMany({
    where: {
      userId,
      symbol: opts.symbol.toUpperCase(),
      assetType: opts.assetType,
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      symbol: true,
      assetType: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function getAiChatSession(userId: string, sessionId: string) {
  return prisma.aiChatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });
}

/** Create or replace messages for a session owned by the user. */
export async function saveAiChatSession(
  userId: string,
  input: {
    id?: string;
    symbol: string;
    assetType: AssetType;
    messages: ChatMessageInput[];
  },
) {
  const symbol = input.symbol.toUpperCase();
  const messages = input.messages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES);

  if (messages.length === 0) {
    throw new Error("EMPTY_MESSAGES");
  }

  const title = previewTitle(messages);

  if (input.id) {
    const existing = await prisma.aiChatSession.findFirst({
      where: { id: input.id, userId },
      select: { id: true },
    });
    if (!existing) throw new Error("NOT_FOUND");

    await prisma.$transaction(async (tx) => {
      await tx.aiChatMessage.deleteMany({ where: { sessionId: existing.id } });
      await tx.aiChatSession.update({
        where: { id: existing.id },
        data: {
          title,
          symbol,
          assetType: input.assetType,
          messages: {
            create: messages.map((m) => ({
              role: m.role,
              content: m.content.trim(),
            })),
          },
        },
      });
    });
    return existing.id;
  }

  const created = await prisma.aiChatSession.create({
    data: {
      userId,
      symbol,
      assetType: input.assetType,
      title,
      messages: {
        create: messages.map((m) => ({
          role: m.role,
          content: m.content.trim(),
        })),
      },
    },
    select: { id: true },
  });
  return created.id;
}

export async function deleteAiChatSession(userId: string, sessionId: string) {
  const existing = await prisma.aiChatSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.aiChatSession.delete({ where: { id: existing.id } });
  return true;
}

export async function latestAiChatSession(
  userId: string,
  symbol: string,
  assetType: AssetType,
) {
  return prisma.aiChatSession.findFirst({
    where: {
      userId,
      symbol: symbol.toUpperCase(),
      assetType,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      },
    },
  });
}
