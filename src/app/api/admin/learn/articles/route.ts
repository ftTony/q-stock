import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  upsertLearnArticles,
  type LearnImportInput,
} from "@/lib/learn/import-articles";

function authorized(req: Request): boolean {
  const secret = process.env.LEARN_IMPORT_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";
  return token.length > 0 && token === secret;
}

const articleSchema = z.object({
  slug: z.string().min(1).max(120),
  category: z.string().min(1).max(32),
  ctaHref: z.string().max(200).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
  title: z.record(z.string(), z.string()),
  summary: z.record(z.string(), z.string()),
  paragraphs: z.record(z.string(), z.array(z.string())),
});

const bodySchema = z.object({
  articles: z.array(articleSchema).min(1).max(50),
});

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const items = parsed.data.articles as LearnImportInput[];
  const result = await upsertLearnArticles(prisma, items);

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  }, { status: result.errors.length ? 207 : 200 });
}
