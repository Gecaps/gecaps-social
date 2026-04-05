import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { action?: string; feedback?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON obrigatorio com campo 'action'" },
      { status: 400 }
    );
  }

  const { action, feedback } = body;

  if (action === "approve") {
    const { data, error } = await supabase()
      .from("social_posts")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  if (action === "reject") {
    // Get current post to save version history
    const { data: post } = await supabase()
      .from("social_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Save current version to history
    await supabase().from("social_post_versions").insert({
      post_id: id,
      version: post.current_version,
      caption: post.caption,
      hashtags: post.hashtags,
      image_url: post.image_url,
      feedback,
    });

    // Update post status and bump version
    const { data, error } = await supabase()
      .from("social_posts")
      .update({
        status: "rejected",
        current_version: post.current_version + 1,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  return NextResponse.json(
    { error: "Invalid action. Use 'approve' or 'reject'" },
    { status: 400 }
  );
}
