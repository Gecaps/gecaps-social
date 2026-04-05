import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

let _supabase: ReturnType<typeof getSupabase> | null = null;

export function supabase() {
  if (!_supabase) _supabase = getSupabase();
  return _supabase;
}
