import JSZip from "jszip";
import { renderWithCloudflare, type RenderOptions } from "@/lib/cloudflare-render";

export const runtime = "nodejs";
export const maxDuration = 120;

interface CarouselSlideInput {
  title?: string;
  subtitle?: string;
  tags?: string;
  cta?: string;
  highlight?: string;
  bigNum?: string;
  imageUrl?: string;
  layout?: string;
}

const LAYOUT_TO_TEMPLATE: Record<string, RenderOptions["template"]> = {
  branco: "branco",
  verde: "verde",
  quote: "quote",
  foto: "foto-premium",
  magazine: "magazine",
  editorial: "editorial",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slides,
      badge = "Educativo",
      handle = "@gecapsbrasil",
      fileName = "carrossel",
    } = body as {
      slides: CarouselSlideInput[];
      badge?: string;
      handle?: string;
      fileName?: string;
    };

    if (!Array.isArray(slides) || slides.length === 0) {
      return new Response(
        JSON.stringify({ error: "slides array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const renderSlide = async (s: CarouselSlideInput): Promise<Buffer> => {
      const opts = {
        template: LAYOUT_TO_TEMPLATE[s.layout ?? "branco"] ?? "branco",
        title: s.title ?? "",
        subtitle: s.subtitle || undefined,
        tags: s.tags || undefined,
        badge,
        cta: s.cta || undefined,
        handle,
        bigNum: s.bigNum || undefined,
        highlight: s.highlight || undefined,
        imageUrl: s.imageUrl || undefined,
      };
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await renderWithCloudflare(opts);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("429") && attempt < 2) {
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
      throw new Error("render retries exhausted");
    };

    const buffers: Buffer[] = [];
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 1500));
      buffers.push(await renderSlide(slides[i]));
    }

    const zip = new JSZip();
    const pad = String(slides.length).length;
    buffers.forEach((buf, i) => {
      const idx = String(i + 1).padStart(pad, "0");
      zip.file(`slide-${idx}.png`, buf);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const safeName = fileName.replace(/[^a-z0-9-_]/gi, "-").slice(0, 40) || "carrossel";

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Carousel render error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Erro ao gerar carrossel",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
