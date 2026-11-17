/**
 * Server auth shim — FastAPI JWT only (NextAuth retired).
 * `auth()` reads Authorization Bearer from the incoming request headers.
 */

import { headers } from "next/headers";
import { optionalApiUser, type ApiUser } from "@/lib/auth/api-user";

export type { ApiUser };

export type SessionLike = {
  user: { id: string; email?: string | null; name?: string | null };
} | null;

/** Drop-in for former NextAuth `auth()` in Route Handlers / server code. */
export async function auth(): Promise<SessionLike> {
  const h = await headers();
  const authorization = h.get("authorization") || h.get("Authorization") || "";
  const req = new Request("http://localhost/api/_auth", {
    headers: authorization ? { authorization } : {},
  });
  const user = await optionalApiUser(req);
  if (!user) return null;
  return { user: { id: user.id, email: user.email ?? null } };
}

/** NextAuth handlers removed — return 410. */
export const handlers = {
  GET() {
    return Response.json(
      { error: { code: "GONE", message: "Use /api/v1/auth/*", details: {} } },
      { status: 410 },
    );
  },
  POST() {
    return Response.json(
      { error: { code: "GONE", message: "Use /api/v1/auth/*", details: {} } },
      { status: 410 },
    );
  },
};

export async function signIn(): Promise<never> {
  throw new Error("signIn is client-only; import from @/lib/auth/react");
}

export async function signOut(): Promise<never> {
  throw new Error("signOut is client-only; import from @/lib/auth/react");
}
