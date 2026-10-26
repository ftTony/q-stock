/** Central query-key factory — keep strings stable for cache invalidation. */
export const queryKeys = {
  strategies: {
    all: ["strategies"] as const,
    list: (locale: string) => ["strategies", "list", locale] as const,
    detail: (id: string, locale: string) =>
      ["strategies", "detail", id, locale] as const,
    replays: (strategyId?: string) =>
      strategyId
        ? (["strategies", "replays", strategyId] as const)
        : (["strategies", "replays"] as const),
    labReport: (id: string) => ["strategies", "lab-report", id] as const,
    paramGrid: (id: string) => ["strategies", "param-grid", id] as const,
  },
  watchlist: {
    all: ["watchlist"] as const,
    list: (quotes: boolean) => ["watchlist", "list", quotes] as const,
    groups: ["watchlist", "groups"] as const,
    group: (id: string) => ["watchlist", "group", id] as const,
  },
  alerts: {
    all: ["alerts"] as const,
    list: ["alerts", "list"] as const,
  },
  trading: {
    all: ["trading"] as const,
    account: ["trading", "account"] as const,
    positions: ["trading", "positions"] as const,
    orders: ["trading", "orders"] as const,
    risk: ["trading", "risk"] as const,
  },
  market: {
    boards: (assetType: string) => ["market", "boards", assetType] as const,
    news: (assetType: string) => ["market", "news", assetType] as const,
    sentiment: (assetType: string) =>
      ["market", "sentiment", assetType] as const,
    indices: (assetType: string) => ["market", "indices", assetType] as const,
    industryRanks: (assetType: string) =>
      ["market", "industry-ranks", assetType] as const,
  },
  symbol: {
    quote: (assetType: string, symbol: string) =>
      ["symbol", "quote", assetType, symbol] as const,
    candles: (assetType: string, symbol: string, resolution: string) =>
      ["symbol", "candles", assetType, symbol, resolution] as const,
  },
  credentials: {
    market: ["credentials", "market"] as const,
    service: (kind: string) => ["credentials", "service", kind] as const,
  },
  ai: {
    quota: ["ai", "quota"] as const,
    reviewNotes: ["ai", "review-notes"] as const,
  },
  review: {
    process: (period: string) => ["review", "process", period] as const,
  },
  invites: {
    list: ["invites", "list"] as const,
  },
  health: ["health"] as const,
} as const;
