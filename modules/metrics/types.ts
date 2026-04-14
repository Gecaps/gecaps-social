export interface Metrics {
  id: string;
  piece_id: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  source: "manual" | "api";
  notes: string | null;
  recorded_at: string;
  updated_at: string;
}
