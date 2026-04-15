export type ResearchStatus = "pending" | "searching" | "completed" | "failed";

export interface TrendItem {
  topic: string;
  description: string;
  platform: string;
  relevance: number;
}

export interface ArticleItem {
  title: string;
  source: string;
  url: string;
  key_points: string[];
}

export interface ResearchResults {
  trends: TrendItem[];
  articles: ArticleItem[];
  competitor_angles: string[];
  expert_opinions: string[];
  summary: string;
  citations: string[];
}

export interface ResearchSession {
  id: string;
  account_id: string;
  query: string;
  status: ResearchStatus;
  results: ResearchResults | null;
  created_at: string;
  completed_at: string | null;
}
