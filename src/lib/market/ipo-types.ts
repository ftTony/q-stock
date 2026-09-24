/** Shared IPO list types used by providers + UI. */

/** 上市中 / 已上市 / 提交中 */
export type IpoStatus = "listing" | "listed" | "filing";

export type IpoItem = {
  id: string;
  symbol: string;
  name: string;
  date: string;
  content?: string;
  assetType: "hk";
  /** Only listed IPOs can open the symbol page */
  linkable: boolean;
  status: IpoStatus;
};

export function parseIpoStatus(raw: string | null | undefined): IpoStatus {
  if (raw === "listed" || raw === "filing" || raw === "listing") return raw;
  return "listing";
}
