import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = supabase()
    .from("social_posts")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (status) query = query.eq("status", status);
  if (from) query = query.gte("scheduled_date", from);
  if (to) query = query.lte("scheduled_date", to);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase()
    .from("social_posts")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
