import { supabase } from "@/lib/supabase";
import type { BrandPlaybook } from "./types";

export async function getPlaybookByAccountId(
  accountId: string
): Promise<BrandPlaybook | null> {
  const { data, error } = await supabase()
    .from("social_brand_playbooks")
    .select("*")
    .eq("account_id", accountId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as BrandPlaybook | null;
}

export async function upsertPlaybook(
  accountId: string,
  fields: Partial<Omit<BrandPlaybook, "id" | "account_id" | "updated_at">>
): Promise<BrandPlaybook> {
  const { data, error } = await supabase()
    .from("social_brand_playbooks")
    .upsert(
      { account_id: accountId, ...fields },
      { onConflict: "account_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as BrandPlaybook;
}
