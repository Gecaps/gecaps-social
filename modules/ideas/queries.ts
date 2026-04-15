import { supabase } from "@/lib/supabase";
import type { Idea, IdeaStatus } from "./types";

export async function listIdeas(
  accountId: string,
  filters?: { status?: IdeaStatus; referenceId?: string; researchId?: string }
): Promise<Idea[]> {
  let query = supabase()
    .from("social_ideas")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.referenceId) {
    query = query.eq("reference_id", filters.referenceId);
  }
  if (filters?.researchId) {
    query = query.eq("research_id", filters.researchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Idea[];
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const { data, error } = await supabase()
    .from("social_ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Idea;
}

export async function createIdea(
  idea: Omit<Idea, "id" | "created_at">
): Promise<Idea> {
  const { data, error } = await supabase()
    .from("social_ideas")
    .insert(idea)
    .select()
    .single();

  if (error) throw error;
  return data as Idea;
}

export async function updateIdeaStatus(
  id: string,
  status: IdeaStatus
): Promise<Idea> {
  const { data, error } = await supabase()
    .from("social_ideas")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Idea;
}
