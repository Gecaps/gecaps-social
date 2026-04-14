import type { PiecePilar, PieceFormat, PieceStatus, PieceLayout } from "@/modules/accounts/types";

export interface Piece {
  id: string;
  account_id: string;
  idea_id: string | null;
  title: string;
  hook: string | null;
  pilar: PiecePilar;
  format: PieceFormat;
  status: PieceStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  published_date: string | null;
  caption: string | null;
  hashtags: string | null;
  cta: string | null;
  image_url: string | null;
  layout: PieceLayout;
  current_version: number;
  creative_brief: string | null;
  visual_direction: string | null;
  slide_structure: Record<string, unknown>[] | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PieceVersion {
  id: string;
  piece_id: string;
  version: number;
  caption: string | null;
  hashtags: string | null;
  image_url: string | null;
  creative_brief: string | null;
  visual_direction: string | null;
  slide_structure: Record<string, unknown>[] | null;
  change_type: string | null;
  feedback: string | null;
  created_at: string;
}
