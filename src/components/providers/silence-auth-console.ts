/**
 * Must load before `next-auth/react`. That module captures `console.error` into
 * its logger at import time; patching later (useEffect) never reaches Auth.js.
 *
 * Soft-nav / HMR can make `/api/auth/*` return non-JSON; Auth.js then
 * `console.error(ClientFetchError)` and Next 15 shows a blocking overlay.
 */
function isAuthClientFetchNoise(args: unknown[]): boolean {
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string") {
      if (
        arg.includes("ClientFetchError") ||
        arg.includes("ClientSessionError") ||
        arg.includes("errors.authjs.dev#autherror")
      ) {
        return true;
      }
      continue;
    }
    if (typeof arg === "object") {
      const err = arg as { name?: string; message?: string; type?: string };
      const name = err.name ?? "";
      const type = err.type ?? "";
      const message = err.message ?? "";
      if (
        name === "ClientFetchError" ||
        name === "ClientSessionError" ||
        type === "ClientFetchError" ||
        type === "AuthError" ||
        message.includes("ClientFetchError") ||
        message.includes("errors.authjs.dev#autherror")
      ) {
        return true;
      }
    }
  }
  return false;
}

if (typeof window !== "undefined") {
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (isAuthClientFetchNoise(args)) {
      console.warn("[auth] client fetch soft-failed (ignored)");
      return;
    }
    original(...args);
  };
}

export {};
