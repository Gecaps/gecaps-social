import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateCaption } from "@/lib/claude";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Find pending posts for today that don't have a caption yet
    const { data: posts } = await supabase()
      .from("social_posts")
      .select("*")
      .eq("scheduled_date", today)
      .is("caption", null);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "Nenhum post para gerar hoje" });
    }

    let generated = 0;

    for (const post of posts) {
      const { caption, hashtags } = await generateCaption({
        title: post.title,
        hook: post.hook || "",
        pilar: post.pilar || "educativo",
        cta: post.cta || "",
        context: post.trello_list_name || undefined,
      });

      await supabase()
        .from("social_posts")
        .update({ caption, hashtags })
        .eq("id", post.id);

      generated++;
    }

    return NextResponse.json({
      message: `${generated} legendas geradas`,
      generated,
    });
  } catch (e) {
    console.error("Cron generate error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
