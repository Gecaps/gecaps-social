import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateCaption } from "@/lib/claude";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: post } = await supabase()
      .from("social_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { caption, hashtags } = await generateCaption({
      title: post.title,
      hook: post.hook || "",
      pilar: post.pilar || "educativo",
      cta: post.cta || "",
    });

    await supabase()
      .from("social_posts")
      .update({ caption, hashtags })
      .eq("id", id);

    return NextResponse.json({ caption, hashtags });
  } catch (e) {
    console.error("Generate caption error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
