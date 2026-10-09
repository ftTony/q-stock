import { futuRequest } from "../src/lib/market/providers/futu-http";

const PLATES = [
  "US..SPX",
  "US..IXIC",
  "US..DJI",
  "HK.800000",
  "HK.800100",
  "HK.800150",
  "SH.000300", // CSI 300?
  "SZ.399006",
];

async function fetchAll(plate: string, pageLimit = 100, maxPages = 10) {
  const codes: string[] = [];
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const { data, hasMore } = await futuRequest<{
      stock_list?: Array<{ code?: string }>;
    }>("GET", "/api/v1.0/quote/plate-stock", {
      query: {
        plate_code: plate,
        limit: String(pageLimit),
        ...(offset ? { offset: String(offset) } : {}),
      },
    });
    const batch = (data.stock_list ?? [])
      .map((s) => s.code)
      .filter((c): c is string => Boolean(c));
    codes.push(...batch);
    if (!batch.length || !hasMore) break;
    offset += batch.length;
  }
  return codes;
}

async function main() {
  for (const plate of PLATES) {
    try {
      const codes = await fetchAll(plate, 100, 8);
      console.log(plate, codes.length, codes.slice(0, 6));
    } catch (e) {
      console.log(plate, "ERR", e instanceof Error ? e.message : e);
    }
  }

  // Also industry members path
  const { data } = await futuRequest<{
    plate_list?: Array<{ code?: string; plate_name?: string }>;
  }>("GET", "/api/v1.0/quote/plate-list", {
    query: { market: "HK", plate_class: "INDUSTRY" },
  });
  console.log("HK INDUSTRY plates", (data.plate_list ?? []).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
