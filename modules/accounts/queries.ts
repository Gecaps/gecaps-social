import { supabase } from "@/lib/supabase";
import type { Account } from "./types";

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase()
    .from("social_accounts")
    .select("*")
    .eq("active", true)
    .order("created_at");

  if (error) throw error;
  return data as Account[];
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data, error } = await supabase()
    .from("social_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Account;
}

export async function createAccount(
  fields: Omit<Account, "id" | "created_at">
): Promise<Account> {
  const { data, error } = await supabase()
    .from("social_accounts")
    .insert(fields)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

export async function updateAccount(
  id: string,
  fields: Partial<Omit<Account, "id" | "created_at">>
): Promise<Account> {
  const { data, error } = await supabase()
    .from("social_accounts")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}
