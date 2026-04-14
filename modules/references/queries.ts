import { supabase } from "@/lib/supabase";
import type { Reference, ReferenceStatus } from "./types";

export async function listReferences(
  accountId: string,
  filters?: { status?: ReferenceStatus; limit?: number }
): Promise<Reference[]> {
  let query = supabase()
    .from("social_references")
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
  return data as Reference[];
}

export async function getReferenceById(
  id: string
): Promise<Reference | null> {
  const { data, error } = await supabase()
    .from("social_references")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Reference;
}

export async function createReference(
  ref: Omit<Reference, "id" | "created_at" | "processed_at">
): Promise<Reference> {
  const { data, error } = await supabase()
    .from("social_references")
    .insert({ ...ref, status: "novo" })
    .select()
    .single();

  if (error) throw error;
  return data as Reference;
}

export async function updateReferenceProcessed(
  id: string,
  fields: {
    summary?: string;
    tags?: string[];
    suggested_pilar?: string;
    suggested_format?: string;
    relevance_score?: number;
  }
): Promise<Reference> {
  const { data, error } = await supabase()
    .from("social_references")
    .update({
      ...fields,
      status: "triado",
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Reference;
}

export async function updateReferenceStatus(
  id: string,
  status: ReferenceStatus
): Promise<Reference> {
  const { data, error } = await supabase()
    .from("social_references")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Reference;
}

export async function deleteReference(id: string): Promise<void> {
  const { error } = await supabase()
    .from("social_references")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
