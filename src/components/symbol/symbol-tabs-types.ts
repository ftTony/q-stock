import type { FormEvent } from "react";
import type { AiTrendAnalysis } from "@/components/market/ai-analysis-panel";
import type {
  EarningsCalendarRow,
  EarningsMetric,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { AssetType } from "@/lib/types";

export type SymbolTab =
  | "chart"
  | "overview"
  | "derivatives"
  | "funds"
  | "short"
  | "chips"
  | "news"
  | "earnings"
  | "press"
  | "profile"
  | "fundamentals"
  | "officers"
  | "comments"
  | "sentiment"
  | "ai";

export type NewsRow = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
};

export type PressRow = {
  headline?: string;
  datetime?: string;
  url?: string;
  description?: string;
  source?: string;
};

export type CommentRow = {
  id: string;
  content: string;
  author: string;
  userId: string;
  createdAt: string;
};

/** Shared props for scrollable tab bodies (excludes chart / derivatives). */
export type SymbolTabsScrollBodyProps = {
  tab: SymbolTab;
  tabLoading: boolean;
  loadingLabel: string;
  degraded: boolean;
  degradedLabel: string;
  errorLabel: string;
  assetType: AssetType;
  isIndex: boolean;
  news: NewsRow[];
  press: PressRow[];
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsLoading: boolean;
  earningsCryptoNa: string;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
  comments: CommentRow[];
  commentText: string;
  onCommentTextChange: (v: string) => void;
  onPostComment: (e: FormEvent) => void;
  onDeleteComment: (id: string) => void;
  commentBusy: boolean;
  canComment: boolean;
  currentUserId?: string;
  commentsPlaceholder: string;
  commentsPost: string;
  commentsLoginRequired: string;
  commentsEmpty: string;
  commentsDelete: string;
  sentiment: {
    news?: Record<string, unknown>;
    reddit?: Record<string, unknown>;
  } | null;
  aiAvailable: boolean | null;
  aiMessage: string | null;
  aiAnalysis: AiTrendAnalysis | null;
  aiDisclaimer: string | null;
  aiCached: boolean;
  aiLoading: boolean;
  aiRefreshing?: boolean;
  aiToast?: string | null;
  aiToastKey?: number;
  onClearAiToast?: () => void;
  onRegenerateAi?: () => void;
  aiRegenerateLabel?: string;
};
