export type IdeaStatus = "pending" | "approved" | "rejected";

export interface Idea {
  id: string;
  account_id: string;
  reference_id: string | null;
  theme: string;
  angle: string | null;
  objective: string | null;
  suggested_format: string | null;
  justification: string | null;
  brand_fit: string | null;
  status: IdeaStatus;
  is_manual: boolean;
  created_at: string;
}
