/** Plan entitlement caps (productized Free / Pro). */

export const FREE_WATCHLIST_LIMIT = 20;
export const PRO_WATCHLIST_LIMIT = 100;

export const FREE_ALERT_LIMIT = 5;
export const PRO_ALERT_LIMIT = 30;

export const FREE_RESEARCH_CARD_LIMIT = 1;
export const PRO_RESEARCH_CARD_LIMIT = 500;

/** Pro hosted AI uses per calendar month (UTC). */
export const PRO_AI_MONTHLY_LIMIT = 100;

export const PLAN_LIMITS = {
  free: {
    watchlist: FREE_WATCHLIST_LIMIT,
    alerts: FREE_ALERT_LIMIT,
    researchCards: FREE_RESEARCH_CARD_LIMIT,
    aiMonthly: null as number | null,
  },
  pro: {
    watchlist: PRO_WATCHLIST_LIMIT,
    alerts: PRO_ALERT_LIMIT,
    researchCards: PRO_RESEARCH_CARD_LIMIT,
    aiMonthly: PRO_AI_MONTHLY_LIMIT,
  },
} as const;
