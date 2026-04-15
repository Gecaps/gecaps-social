import { supabase } from "@/lib/supabase";
import type { ResearchSession, ResearchStatus, ResearchResults } from "./types";

export async function createResearch(data: {
  account_id: string;
  query: string;
}): Promise<ResearchSession> {
  const { data: row, error } = await supabase()
    .from("social_research")
    .insert({ ...data, status: "pending" as ResearchStatus })
    .select()
    .single();

  if (error) throw error;
  return row as ResearchSession;
}

export async function getResearchById(
  id: string
): Promise<ResearchSession | null> {
  const { data, error } = await supabase()
    .from("social_research")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as ResearchSession;
}

export async function listResearch(
  accountId: string
): Promise<ResearchSession[]> {
  const { data, error } = await supabase()
    .from("social_research")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ResearchSession[];
}

export async function updateResearchResults(
  id: string,
  results: ResearchResults
): Promise<ResearchSession> {
  const { data, error } = await supabase()
    .from("social_research")
    .update({
      results,
      status: "completed" as ResearchStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ResearchSession;
}

export async function updateResearchStatus(
  id: string,
  status: ResearchStatus
): Promise<ResearchSession> {
  const { data, error } = await supabase()
    .from("social_research")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ResearchSession;
}
