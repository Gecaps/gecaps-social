import { generateProductPost } from "@/lib/image-generator";
import type { ProductPostOptions } from "@/lib/image-generator";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const layout = (url.searchParams.get("layout") || "produto-direita") as ProductPostOptions["layout"];
    const title = url.searchParams.get("title") || "Titulo do post";
    const subtitle = url.searchParams.get("subtitle") || "";
    const tag = url.searchParams.get("tag") || "PRODUTO";
    const category = url.searchParams.get("category") || "SUPLEMENTO";
    const cta = url.searchParams.get("cta") || "";
    const handle = url.searchParams.get("handle") || "@gecapsbrasil";
    const productImage = url.searchParams.get("image") || "/assets/products/curcuma-pote-nobg.png";

    const buffer = await generateProductPost({
      layout,
      title,
      subtitle: subtitle || undefined,
      tag,
      category,
      cta: cta || undefined,
      handle,
      productImageUrl: productImage,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("Product preview error:", e);
    return new Response(
      `Error: ${e instanceof Error ? e.message : "Unknown"}`,
      { status: 500 }
    );
  }
}
