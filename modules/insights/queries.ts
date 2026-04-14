import { supabase } from "@/lib/supabase";
import type { Insight } from "./types";

export async function listInsights(accountId: string): Promise<Insight[]> {
  const { data, error } = await supabase()
    .from("social_insights")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Insight[];
}

export async function createInsight(
  insight: Omit<Insight, "id" | "created_at" | "is_edited">
): Promise<Insight> {
  const { data, error } = await supabase()
    .from("social_insights")
    .insert({ ...insight, is_edited: false })
    .select()
    .single();

  if (error) throw error;
  return data as Insight;
}

export async function updateInsight(
  id: string,
  content: string
): Promise<Insight> {
  const { data, error } = await supabase()
    .from("social_insights")
    .update({ content, is_edited: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Insight;
}
