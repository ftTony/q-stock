import { futuRequest } from "../src/lib/market/providers/futu-http";

async function main() {
  for (const market of ["1", "2"] as const) {
    for (const plate_class of ["INDUSTRY", "CONCEPT", "ALL", "OTHER"]) {
      try {
        const { data } = await futuRequest<{
          plate_list?: Array<{ code?: string; plate_name?: string; name?: string }>;
        }>("GET", "/api/v1.0/quote/plate-list", {
          query: { market, plate_class },
        });
        const list = data.plate_list ?? [];
        console.log(`m=${market} class=${plate_class} n=${list.length}`, list.slice(0, 5).map((p) => `${p.code}:${p.plate_name || p.name}`));
      } catch (e) {
        console.log(`m=${market} class=${plate_class} ERR`, e instanceof Error ? e.message : e);
      }
    }
  }

  // Try known index / list plates
  for (const plate of ["HK.800000", "HK.HSI", "US.SPX", "US..SPX", "HK.LIST1290"]) {
    try {
      const { data } = await futuRequest<{
        stock_list?: Array<{ code?: string; name?: string }>;
      }>("GET", "/api/v1.0/quote/plate-stock", {
        query: { plate_code: plate, limit: "20" },
      });
      const stocks = data.stock_list ?? [];
      console.log(
        `plate ${plate} n=${stocks.length}`,
        stocks.slice(0, 8).map((s) => s.code),
      );
    } catch (e) {
      console.log(`plate ${plate} ERR`, e instanceof Error ? e.message : e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
