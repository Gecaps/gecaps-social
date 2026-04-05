import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase()
    .from("social_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const ALLOWED = [
    "title", "hook", "pilar", "format", "status",
    "scheduled_date", "scheduled_time", "caption",
    "hashtags", "cta", "image_url", "layout", "account_id",
  ];

  const filtered: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) filtered[key] = body[key];
  }

  if (Object.keys(filtered).length === 0) {
    return NextResponse.json({ error: "Nenhum campo valido para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabase()
    .from("social_posts")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
