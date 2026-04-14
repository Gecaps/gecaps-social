export interface Insight {
  id: string;
  account_id: string;
  content: string;
  type: "auto" | "manual";
  source_pieces: string[];
  is_edited: boolean;
  created_at: string;
}
