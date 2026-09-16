import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toDbLocale } from "@/i18n/config";

const schema = z.object({
  locale: z.enum(["zh-CN", "zh-TW", "en"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  changeColorScheme: z.enum(["cn", "us"]).optional(),
  name: z.string().min(1).max(64).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      theme: true,
      changeColorScheme: true,
    },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data: {
    locale?: "zh_CN" | "zh_TW" | "en";
    theme?: "light" | "dark" | "system";
    changeColorScheme?: "cn" | "us";
    name?: string;
  } = {};

  if (parsed.data.locale) data.locale = toDbLocale(parsed.data.locale);
  if (parsed.data.theme) data.theme = parsed.data.theme;
  if (parsed.data.changeColorScheme) {
    data.changeColorScheme = parsed.data.changeColorScheme;
  }
  if (parsed.data.name) data.name = parsed.data.name;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      theme: true,
      changeColorScheme: true,
    },
  });

  return NextResponse.json({ user });
}
