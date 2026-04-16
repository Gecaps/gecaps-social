import { NextResponse } from "next/server";
import { generateImage, editImage } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, imageUrl, mode, accountId } = body as {
      prompt: string;
      imageUrl?: string;
      mode: "generate" | "enhance";
      accountId?: string;
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    let result;

    if (mode === "enhance" && imageUrl) {
      // Fetch the image and convert to base64
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error("Não foi possível baixar a imagem");

      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

      result = await editImage(base64, mimeType, prompt);
    } else {
      result = await generateImage(prompt);
    }

    // Upload to Supabase Storage for a persistent URL
    const ext = result.mimeType.includes("png") ? "png" : "jpg";
    const folder = accountId || "generated";
    const filePath = `${folder}/gemini_${Date.now()}.${ext}`;
    const imageBuffer = Buffer.from(result.imageBase64, "base64");

    const { error: uploadError } = await supabase()
      .storage.from("references")
      .upload(filePath, imageBuffer, {
        contentType: result.mimeType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase().storage.from("references").getPublicUrl(filePath);

    return NextResponse.json({
      imageUrl: publicUrl,
      text: result.text,
    });
  } catch (e) {
    console.error("Gemini image error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar imagem" },
      { status: 500 }
    );
  }
}
