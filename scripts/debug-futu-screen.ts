import {
  futuRequest,
  isFutuConfigured,
} from "../src/lib/market/providers/futu-http";

async function main() {
  console.log("cfg", isFutuConfigured());
  // US market=2, one small page — should not rate-limit as hard as full scan
  const r = await futuRequest<{ items?: Array<{ code?: string }> }>(
    "POST",
    "/api/v1.0/quote/stock-screen",
    {
      body: {
        screen_queries: [
          {
            simple_field_query: {
              simple_field: 1,
              screen_value_list: [2],
            },
          },
        ],
        limit: 50,
      },
    },
  );
  const codes = (r.data.items ?? []).map((i) => i.code).filter(Boolean);
  console.log("count", codes.length, "sample", codes.slice(0, 15));
  console.log("hasMore", r.hasMore, "next", r.nextKey);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
