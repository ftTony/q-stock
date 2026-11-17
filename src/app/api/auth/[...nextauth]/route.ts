import { handlers } from "@/lib/auth";

/** NextAuth retired — clients must use /api/v1/auth/*. */
export const { GET, POST } = handlers;
