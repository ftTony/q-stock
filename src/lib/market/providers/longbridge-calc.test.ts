import { describe, expect, it } from "vitest";
import { mergeCalcRows, type SecurityCalcRow } from "./longbridge-calc";

describe("mergeCalcRows", () => {
  it("keeps Longbridge fields and fills gaps from later layers", () => {
    const lb: SecurityCalcRow[] = [
      {
        symbol: "AAPL.US",
        localSymbol: "AAPL",
        turnoverRate: 1.2,
        change5d: 3.4,
      },
    ];
    const futu: SecurityCalcRow[] = [
      {
        symbol: "US.AAPL",
        localSymbol: "AAPL",
        volumeRatio: 1.5,
        changeSpeed: -0.3,
        turnoverRate: 9.9,
      },
    ];
    const periods: SecurityCalcRow[] = [
      {
        symbol: "AAPL",
        localSymbol: "AAPL",
        change20d: 5.1,
        change5d: 99,
      },
    ];
    const [row] = mergeCalcRows(["AAPL"], "stock", [lb, futu, periods]);
    expect(row?.turnoverRate).toBe(1.2);
    expect(row?.change5d).toBe(3.4);
    expect(row?.volumeRatio).toBe(1.5);
    expect(row?.changeSpeed).toBe(-0.3);
    expect(row?.change20d).toBe(5.1);
  });

  it("normalizes CN symbols for lookup", () => {
    const futu: SecurityCalcRow[] = [
      {
        symbol: "SH.600519",
        localSymbol: "600519.SH",
        turnoverRate: 0.8,
        volumeRatio: 1.1,
      },
    ];
    const [row] = mergeCalcRows(["600519.SH"], "cn", [[], futu, []]);
    expect(row?.localSymbol).toBe("600519.SH");
    expect(row?.turnoverRate).toBe(0.8);
    expect(row?.volumeRatio).toBe(1.1);
  });
});
