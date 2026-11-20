/** Client-side RSA-OAEP (SHA-256) for login/register passwordCipher. */

type PasswordKeyResponse = {
  keyId: string;
  publicKeyPem: string;
  alg: string;
};

type CachedKey = {
  pem: string;
  cryptoKey: CryptoKey;
  fetchedAt: number;
};

const KEY_TTL_MS = 5 * 60 * 1000;
let cache: CachedKey | null = null;

function pemToSpki(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    pemToSpki(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

async function fetchPasswordKey(): Promise<CachedKey> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < KEY_TTL_MS) {
    return cache;
  }
  const res = await fetch("/api/v1/auth/password-key", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch password key (${res.status})`);
  }
  const data = (await res.json()) as PasswordKeyResponse;
  if (!data.publicKeyPem) {
    throw new Error("Password key response missing publicKeyPem");
  }
  const cryptoKey = await importPublicKey(data.publicKeyPem);
  cache = { pem: data.publicKeyPem, cryptoKey, fetchedAt: now };
  return cache;
}

/** Encrypt password as base64 RSA-OAEP ciphertext of `{"p","t"}`. */
export async function encryptPasswordForApi(password: string): Promise<string> {
  const { cryptoKey } = await fetchPasswordKey();
  const payload = new TextEncoder().encode(
    JSON.stringify({ p: password, t: Date.now() }),
  );
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, cryptoKey, payload);
  return bytesToBase64(new Uint8Array(cipher));
}

/** Test / logout helper. */
export function clearPasswordKeyCache(): void {
  cache = null;
}
