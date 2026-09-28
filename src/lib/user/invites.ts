import crypto from "crypto";
import { prisma } from "@/lib/db";

export const INITIAL_INVITE_COUNT = 3;

/** Readable invite code (no ambiguous 0/O/1/I). */
export function generateInviteCode(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

async function createUniqueInviteCode(ownerId: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateInviteCode();
    try {
      await prisma.inviteCode.create({ data: { code, ownerId } });
      return code;
    } catch {
      /* unique collision — retry */
    }
  }
  throw new Error("Failed to mint invite code");
}

/** Ensure the user has at least INITIAL_INVITE_COUNT codes (first visit). */
export async function ensureUserInviteCodes(userId: string): Promise<void> {
  const count = await prisma.inviteCode.count({ where: { ownerId: userId } });
  if (count > 0) return;
  for (let i = 0; i < INITIAL_INVITE_COUNT; i++) {
    await createUniqueInviteCode(userId);
  }
}

export async function mintRewardInviteCode(ownerId: string): Promise<void> {
  await createUniqueInviteCode(ownerId);
}

export function inviteRegisterUrl(opts: {
  baseUrl: string;
  locale: string;
  code: string;
}): string {
  const base = opts.baseUrl.replace(/\/+$/, "");
  return `${base}/${opts.locale}/register?invite=${encodeURIComponent(opts.code)}`;
}

export function appBaseUrl(): string {
  return (
    process.env.APP_URL?.replace(/\/+$/, "") ||
    process.env.AUTH_URL?.replace(/\/+$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}
