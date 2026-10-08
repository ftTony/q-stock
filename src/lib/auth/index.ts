import NextAuth, { customFetch } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { getProxyAwareFetch } from "@/lib/http/proxy-fetch";
import { fromDbLocale, toDbLocale, defaultLocale, localizedPath } from "@/i18n/config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
);

const githubConfigured = Boolean(
  process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim(),
);

const oauthProviders = new Set(["google", "github"]);

async function localeFromRequestCookie(): Promise<string> {
  try {
    const jar = await cookies();
    return (
      jar.get("NEXT_LOCALE")?.value ||
      jar.get("NEXT_LOCALE".toLowerCase())?.value ||
      defaultLocale
    );
  } catch {
    return defaultLocale;
  }
}

async function upsertOAuthUser(opts: {
  email: string;
  name?: string | null;
  provider: string;
}) {
  const email = opts.email.toLowerCase();
  const uiLocale = await localeFromRequestCookie();
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    const name = opts.name?.trim() || email.split("@")[0] || null;
    dbUser = await prisma.user.create({
      data: {
        email,
        name,
        locale: toDbLocale(uiLocale),
      },
    });
    void sendWelcomeEmail({
      to: dbUser.email,
      name: dbUser.name,
      locale: fromDbLocale(dbUser.locale),
    }).catch((err) => {
      console.error(`[auth] ${opts.provider} welcome email failed:`, err);
    });
  } else if (!dbUser.name && opts.name?.trim()) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { name: opts.name.trim() },
    });
  }
  return dbUser;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: localizedPath(defaultLocale, "/login"),
    error: localizedPath(defaultLocale, "/login"),
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
            // Mainland / filtered networks: Node cannot reach Google without a proxy.
            // Browser may use the system proxy; Auth.js server fetch must opt in.
            [customFetch]: getProxyAwareFetch(),
          }),
        ]
      : []),
    ...(githubConfigured
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
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
    async signIn({ account, profile }) {
      if (!account?.provider || !oauthProviders.has(account.provider)) {
        return true;
      }
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      if (account.provider === "google") {
        const verified =
          typeof profile === "object" &&
          profile &&
          "email_verified" in profile &&
          (profile as { email_verified?: boolean }).email_verified;
        if (verified === false) return false;
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider && oauthProviders.has(account.provider)) {
        const email = (
          profile?.email ||
          user?.email ||
          token.email ||
          ""
        ).toLowerCase();
        if (!email) return token;

        const dbUser = await upsertOAuthUser({
          email,
          name: profile?.name || user?.name,
          provider: account.provider,
        });

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name ?? token.name;
        token.locale = dbUser.locale;
        token.theme = dbUser.theme;
        token.changeColorScheme = dbUser.changeColorScheme;
        return token;
      }

      if (user) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
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
        if (session.name !== undefined) token.name = session.name;
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
        session.user.name =
          (token.name as string | undefined) ?? session.user.name;
        session.user.email =
          (token.email as string | undefined) ?? session.user.email;
        session.user.locale = token.locale as string;
        session.user.theme = token.theme as string;
        session.user.changeColorScheme = token.changeColorScheme as string;
      }
      return session;
    },
  },
  trustHost: true,
});
