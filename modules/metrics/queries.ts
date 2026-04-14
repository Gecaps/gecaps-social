import { supabase } from "@/lib/supabase";
import type { Metrics } from "./types";

export async function getMetricsByPieceId(
  pieceId: string
): Promise<Metrics | null> {
  const { data, error } = await supabase()
    .from("social_metrics")
    .select("*")
    .eq("piece_id", pieceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Metrics;
}

export async function upsertMetrics(
  fields: Omit<Metrics, "id" | "engagement_rate" | "updated_at">
): Promise<Metrics> {
  // Auto-calc engagement_rate: (likes + comments + shares + saves) / reach * 100
  const total =
    (fields.likes ?? 0) +
    (fields.comments ?? 0) +
    (fields.shares ?? 0) +
    (fields.saves ?? 0);
  const engagement_rate =
    fields.reach > 0 ? Number(((total / fields.reach) * 100).toFixed(2)) : 0;

  const { data, error } = await supabase()
    .from("social_metrics")
    .upsert(
      {
        ...fields,
        engagement_rate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "piece_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Metrics;
}

export async function listMetricsByAccount(
  accountId: string
): Promise<Array<Metrics & { title: string; pilar: string; format: string }>> {
  const { data, error } = await supabase()
    .from("social_metrics")
    .select(
      "*, social_pieces!inner(title, pilar, format, account_id)"
    )
    .eq("social_pieces.account_id", accountId)
    .order("recorded_at", { ascending: false });

  if (error) throw error;

  // Flatten the join result
  return (data ?? []).map((row: Record<string, unknown>) => {
    const piece = row.social_pieces as Record<string, string>;
    const { social_pieces: _, ...metrics } = row;
    return {
      ...metrics,
      title: piece.title,
      pilar: piece.pilar,
      format: piece.format,
    };
  }) as Array<Metrics & { title: string; pilar: string; format: string }>;
}
