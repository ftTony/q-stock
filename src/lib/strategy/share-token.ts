import { randomBytes } from "crypto";

/** URL-safe opaque share token (32 hex chars). */
export function createShareToken(): string {
  return randomBytes(16).toString("hex");
}
