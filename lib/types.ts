export type PostPilar =
  | "educativo"
  | "autoridade"
  | "produto"
  | "conexao"
  | "social-proof"
  | "objecao";

export type PostStatus = "pending" | "approved" | "rejected" | "published";

export type PostFormat = "estatico" | "carrossel" | "story" | "reels";

export interface Post {
  id: string;
  title: string;
  hook: string | null;
  pilar: PostPilar;
  format: PostFormat;
  status: PostStatus;
  scheduled_date: string;
  scheduled_time: string;
  caption: string | null;
  hashtags: string | null;
  cta: string | null;
  image_url: string | null;
  current_version: number;
  trello_card_id: string | null;
  trello_list_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVersion {
  id: string;
  post_id: string;
  version: number;
  caption: string | null;
  hashtags: string | null;
  image_url: string | null;
  feedback: string | null;
  created_at: string;
}

export const PILAR_LABELS: Record<PostPilar, string> = {
  educativo: "Educativo",
  autoridade: "Autoridade",
  produto: "Produto",
  conexao: "Conexao",
  "social-proof": "Social Proof",
  objecao: "Objecao",
};

export const PILAR_COLORS: Record<PostPilar, string> = {
  educativo: "bg-blue-100 text-blue-700",
  autoridade: "bg-purple-100 text-purple-700",
  produto: "bg-gecaps-green/10 text-gecaps-green-dark",
  conexao: "bg-orange-100 text-orange-700",
  "social-proof": "bg-amber-100 text-amber-700",
  objecao: "bg-red-100 text-red-700",
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  pending: "bg-status-pending/15 text-amber-700 border-status-pending/30",
  approved: "bg-status-approved/15 text-green-700 border-status-approved/30",
  rejected: "bg-status-rejected/15 text-red-700 border-status-rejected/30",
  published: "bg-status-published/15 text-blue-700 border-status-published/30",
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  published: "Publicado",
};
