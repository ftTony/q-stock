import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/zh-CN/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          locale: user.locale,
          theme: user.theme,
          changeColorScheme: user.changeColorScheme,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const u = user as {
          locale?: string;
          theme?: string;
          changeColorScheme?: string;
        };
        token.locale = u.locale;
        token.theme = u.theme;
        token.changeColorScheme = u.changeColorScheme;
      }
      if (trigger === "update" && session) {
        token.locale = session.locale ?? token.locale;
        token.theme = session.theme ?? token.theme;
        token.changeColorScheme =
          session.changeColorScheme ?? token.changeColorScheme;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.locale = token.locale as string;
        session.user.theme = token.theme as string;
        session.user.changeColorScheme = token.changeColorScheme as string;
      }
      return session;
    },
  },
  trustHost: true,
});
