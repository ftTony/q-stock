/**
 * Fetch that routes through HTTPS_PROXY / HTTP_PROXY when set.
 * Native Node fetch ignores Windows IE proxy; Auth.js Google OIDC discovery
 * and token exchange need this on networks that cannot reach Google directly.
 */
type FetchLike = typeof globalThis.fetch;

let cached: FetchLike | null = null;

function proxyUrlFromEnv(): string {
  return (
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim() ||
    process.env.https_proxy?.trim() ||
    process.env.http_proxy?.trim() ||
    ""
  );
}

export function getProxyAwareFetch(): FetchLike {
  if (cached) return cached;

  const proxyUrl = proxyUrlFromEnv();
  if (!proxyUrl) {
    cached = globalThis.fetch.bind(globalThis);
    return cached;
  }

  try {
    // undici ships with Node / Next; ProxyAgent is not on global fetch.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const undici = require("undici") as {
      ProxyAgent: new (url: string) => unknown;
      fetch: typeof globalThis.fetch & ((input: unknown, init?: unknown) => Promise<Response>);
    };
    const agent = new undici.ProxyAgent(proxyUrl);
    const proxied: FetchLike = (input, init) =>
      undici.fetch(input as never, {
        ...(init as object),
        dispatcher: agent,
      } as never) as Promise<Response>;
    cached = proxied;
    return cached;
  } catch (err) {
    console.warn(
      "[http] HTTPS_PROXY is set but undici ProxyAgent is unavailable; using direct fetch",
      err,
    );
    cached = globalThis.fetch.bind(globalThis);
    return cached;
  }
}
