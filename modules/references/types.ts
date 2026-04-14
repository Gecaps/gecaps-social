export type ReferenceType = "link" | "text" | "file" | "pdf";

export type ReferenceStatus =
  | "novo"
  | "triado"
  | "relevante"
  | "virou_ideia"
  | "usado"
  | "descartado"
  | "arquivado";

export interface Reference {
  id: string;
  account_id: string;
  type: ReferenceType;
  source_url: string | null;
  raw_content: string | null;
  file_url: string | null;
  summary: string | null;
  tags: string[];
  suggested_pilar: string | null;
  suggested_format: string | null;
  relevance_score: number | null;
  status: ReferenceStatus;
  created_at: string;
  processed_at: string | null;
}
