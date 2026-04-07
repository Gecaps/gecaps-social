import { renderWithCloudflare } from "@/lib/cloudflare-render";
import type { RenderOptions } from "@/lib/cloudflare-render";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const template = (url.searchParams.get("template") || "branco") as RenderOptions["template"];
    const title = url.searchParams.get("title") || "Titulo do post";
    const subtitle = url.searchParams.get("subtitle") || "";
    const tags = url.searchParams.get("tags") || "";
    const badge = url.searchParams.get("badge") || "Educativo";
    const cta = url.searchParams.get("cta") || "";
    const handle = url.searchParams.get("handle") || "@gecapsbrasil";
    const bigNum = url.searchParams.get("bigNum") || "";
    const highlight = url.searchParams.get("highlight") || "";

    const buffer = await renderWithCloudflare({
      template,
      title,
      subtitle: subtitle || undefined,
      tags: tags || undefined,
      badge,
      cta: cta || undefined,
      handle,
      bigNum: bigNum || undefined,
      highlight: highlight || undefined,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("Render error:", e);
    return new Response(
      `Error: ${e instanceof Error ? e.message : "Unknown"}`,
      { status: 500 }
    );
  }
}
