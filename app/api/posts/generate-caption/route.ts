import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, hook, pilar, cta } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await generateCaption({
      title,
      hook: hook || "",
      pilar: pilar || "educativo",
      cta: cta || "",
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Generate caption error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
