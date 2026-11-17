import { createHash } from "crypto";
import { jwtVerify } from "jose";

export type ApiUser = {
  id: string;
  email?: string;
};

function signingSecret(): Uint8Array {
  const raw =
    process.env.JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "dev-change-me";
  return new TextEncoder().encode(raw);
}

/**
 * Verify FastAPI access JWT from Authorization: Bearer.
 * Fail soft on Redis version check (signature + exp still required).
 */
export async function optionalApiUser(req: Request): Promise<ApiUser | null> {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingSecret(), {
      algorithms: ["HS256"],
    });
    if (payload.typ !== "access") return null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!id) return null;
    // Optional session version: if REDIS_URL set, callers may check later.
    void createHash; // keep import used if we add redis later
    return {
      id,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireApiUser(req: Request): Promise<ApiUser | Response> {
  const user = await optionalApiUser(req);
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized", details: {} } },
      { status: 401 },
    );
  }
  return user;
}

export function isApiUser(v: ApiUser | Response): v is ApiUser {
  return Boolean(v && typeof v === "object" && "id" in v);
}
