export type PostPilar =
  | "educativo"
  | "autoridade"
  | "produto"
  | "conexao"
  | "social-proof"
  | "objecao";

export type PostStatus = "pending" | "approved" | "rejected" | "published";

export type PostFormat = "estatico" | "carrossel" | "story" | "reels";

export type PostLayout = "branco" | "verde" | "quote" | "foto" | "premium";

export const LAYOUT_LABELS: Record<PostLayout, string> = {
  branco: "Branco",
  verde: "Verde",
  quote: "Quote",
  foto: "Foto",
  premium: "Premium",
};

export const LAYOUT_DESCRIPTIONS: Record<PostLayout, string> = {
  branco: "Fundo claro, acentos verdes. Clean e profissional.",
  verde: "Gradiente verde escuro. Bold e impactante.",
  quote: "Fundo escuro luxo, moldura dourada. Para frases.",
  foto: "Imagem de fundo com overlay de texto.",
  premium: "Foto premium com overlay elegante.",
};

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
  layout: PostLayout;
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
  educativo: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  autoridade: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  produto: "bg-neon-pink/10 text-neon-pink border-neon-pink/20",
  conexao: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "social-proof": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  objecao: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  pending: "bg-status-pending/10 text-amber-400 border-status-pending/25",
  approved: "bg-status-approved/10 text-neon-cyan border-status-approved/25",
  rejected: "bg-status-rejected/10 text-neon-pink border-status-rejected/25",
  published: "bg-status-published/10 text-neon-purple border-status-published/25",
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  published: "Publicado",
};
