import { supabase } from "@/lib/supabase";
import type { PieceStatus } from "@/modules/accounts/types";
import type { Piece, PieceVersion } from "./types";

export async function listPieces(
  accountId: string,
  filters?: { status?: PieceStatus; limit?: number }
): Promise<Piece[]> {
  let query = supabase()
    .from("social_pieces")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Piece[];
}

export async function getPieceById(id: string): Promise<Piece | null> {
  const { data, error } = await supabase()
    .from("social_pieces")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Piece;
}

export async function createPiece(
  piece: Omit<Piece, "id" | "created_at" | "updated_at" | "current_version">
): Promise<Piece> {
  const { data, error } = await supabase()
    .from("social_pieces")
    .insert({ ...piece, current_version: 1 })
    .select()
    .single();

  if (error) throw error;
  return data as Piece;
}

export async function updatePiece(
  id: string,
  fields: Partial<Omit<Piece, "id" | "created_at">>
): Promise<Piece> {
  const { data, error } = await supabase()
    .from("social_pieces")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Piece;
}

export async function listVersions(pieceId: string): Promise<PieceVersion[]> {
  const { data, error } = await supabase()
    .from("social_piece_versions")
    .select("*")
    .eq("piece_id", pieceId)
    .order("version", { ascending: false });

  if (error) throw error;
  return data as PieceVersion[];
}

export async function createVersion(
  version: Omit<PieceVersion, "id" | "created_at">
): Promise<PieceVersion> {
  const { data, error } = await supabase()
    .from("social_piece_versions")
    .insert(version)
    .select()
    .single();

  if (error) throw error;
  return data as PieceVersion;
}
