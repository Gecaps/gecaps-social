export type PiecePilar =
  | "educativo"
  | "autoridade"
  | "produto"
  | "conexao"
  | "social-proof"
  | "objecao";

export type PieceFormat = "estatico" | "carrossel" | "story" | "reels";

export type PieceLayout = "branco" | "verde" | "quote" | "foto" | "magazine" | "editorial";

export type PieceStatus =
  | "reference"
  | "idea"
  | "idea_approved"
  | "in_production"
  | "final_approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "in_adjustment"
  | "paused";

export interface Account {
  id: string;
  name: string;
  handle: string;
  platform: string;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}

export const PILAR_LABELS: Record<PiecePilar, string> = {
  educativo: "Educativo",
  autoridade: "Autoridade",
  produto: "Produto",
  conexao: "Conexão",
  "social-proof": "Social Proof",
  objecao: "Objeção",
};

export const PILAR_COLORS: Record<PiecePilar, string> = {
  educativo: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  autoridade: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  produto: "bg-neon-pink/10 text-neon-pink border-neon-pink/20",
  conexao: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "social-proof": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  objecao: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const STATUS_LABELS: Record<PieceStatus, string> = {
  reference: "Referência",
  idea: "Ideia",
  idea_approved: "Ideia Aprovada",
  in_production: "Em Produção",
  final_approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado",
  rejected: "Rejeitado",
  in_adjustment: "Em Ajuste",
  paused: "Pausado",
};

export const STATUS_COLORS: Record<PieceStatus, string> = {
  reference: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  idea: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  idea_approved: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  in_production: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  final_approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  published: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  in_adjustment: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  paused: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export const LAYOUT_LABELS: Record<PieceLayout, string> = {
  branco: "Branco",
  verde: "Verde",
  quote: "Quote",
  foto: "Foto",
  magazine: "Magazine",
  editorial: "Editorial",
};

export const LAYOUT_DESCRIPTIONS: Record<PieceLayout, string> = {
  branco: "Fundo claro, acentos verdes. Clean e profissional.",
  verde: "Gradiente verde escuro. Bold e impactante.",
  quote: "Fundo escuro luxo, moldura dourada. Para frases.",
  foto: "Foto premium com overlay verde. Conteúdo na parte inferior.",
  magazine: "Capa de revista. Foto full-bleed, tipografia editorial dourada.",
  editorial: "Split editorial. Foto topo, conteúdo embaixo. Elegante e fino.",
};
