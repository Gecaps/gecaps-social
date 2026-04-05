import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

async function loadImage(url: string): Promise<Buffer> {
  if (url.startsWith("http")) {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  }
  const fsPath = join(process.cwd(), "public", url);
  try {
    return await readFile(fsPath);
  } catch {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}${url}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const layout = url.searchParams.get("layout") || "produto-direita";
    const title = url.searchParams.get("title") || "Titulo do post";
    const subtitle = url.searchParams.get("subtitle") || "";
    const tag = url.searchParams.get("tag") || "PRODUTO";
    const category = url.searchParams.get("category") || "SUPLEMENTO";
    const cta = url.searchParams.get("cta") || "";
    const handle = url.searchParams.get("handle") || "@gecapsbrasil";
    const imageUrl = url.searchParams.get("image") || "/assets/products/curcuma-pote-nobg.png";

    // Step 1: Generate text layer with Satori (handles fonts perfectly)
    const textLayer = generateTextLayer({ layout, title, subtitle, tag, category, cta, handle });

    // Step 2: Render text layer to PNG via Satori
    const textResponse = new ImageResponse(textLayer, { width: 1080, height: 1350 });
    const textArrayBuf = await textResponse.arrayBuffer();
    const textPng = Buffer.from(textArrayBuf);

    // Step 3: Load and resize product image
    let productBuf: Buffer | null = null;
    try {
      const rawProduct = await loadImage(imageUrl);
      const sizes: Record<string, { w: number; h: number }> = {
        "produto-centro": { w: 500, h: 500 },
        "produto-direita": { w: 450, h: 550 },
        "produto-esquerda": { w: 450, h: 550 },
        "produto-metricas": { w: 380, h: 450 },
      };
      const s = sizes[layout] || sizes["produto-direita"];
      productBuf = await sharp(rawProduct)
        .resize(s.w, s.h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    } catch {}

    // Step 4: Compose text + product image with Sharp
    const composites: sharp.OverlayOptions[] = [];

    if (productBuf) {
      const positions: Record<string, { top: number; left: number }> = {
        "produto-centro": { top: 120, left: 290 },
        "produto-direita": { top: 180, left: 590 },
        "produto-esquerda": { top: 180, left: 40 },
        "produto-metricas": { top: 100, left: 640 },
      };
      const pos = positions[layout] || positions["produto-direita"];
      composites.push({ input: productBuf, top: pos.top, left: pos.left });
    }

    // Overlay text on top of product
    composites.push({ input: textPng, top: 0, left: 0 });

    const result = await sharp({
      create: { width: 1080, height: 1350, channels: 4, background: { r: 247, g: 250, b: 247, alpha: 1 } },
    })
      .composite(composites)
      .png()
      .toBuffer();

    return new Response(new Uint8Array(result), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("Product preview error:", e);
    return new Response(`Error: ${e instanceof Error ? e.message : "Unknown"}`, { status: 500 });
  }
}

function generateTextLayer({ layout, title, subtitle, tag, category, cta, handle }: {
  layout: string; title: string; subtitle: string; tag: string; category: string; cta: string; handle: string;
}) {
  // Common elements
  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 64px 0", width: "100%" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#43A047", letterSpacing: 2, display: "flex" }}>GECAPS</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#43A047", border: "2px solid #43A047", padding: "7px 20px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const, display: "flex" }}>{category}</div>
    </div>
  );

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 64px 44px", width: "100%" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#43A047", display: "flex" }}>{handle}</div>
      <div style={{ fontSize: 12, color: "#999", letterSpacing: 1, display: "flex" }}>GECAPS · Cosmeticos & Suplementos</div>
    </div>
  );

  const tagEl = (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#B8860B", letterSpacing: 4, textTransform: "uppercase" as const, marginBottom: 12, display: "flex" }}>{tag}</div>
  );

  const bar = <div style={{ width: 48, height: 4, background: "#43A047", borderRadius: 2, marginBottom: 24, display: "flex" }} />;

  const ctaBtn = cta ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", background: "#B8860B", padding: "12px 28px", borderRadius: 22, width: 200, textTransform: "uppercase" as const, marginTop: 20 }}>{cta} →</div>
  ) : null;

  if (layout === "produto-centro") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "transparent" }}>
        {header}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 64px", paddingTop: 520 }}>
          {tagEl}
          <div style={{ fontSize: 48, fontWeight: 800, color: "#1B2A1B", lineHeight: 1.12, textAlign: "center", marginBottom: 16, display: "flex", maxWidth: 800 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 18, color: "#666", textAlign: "center", marginBottom: 8, display: "flex", maxWidth: 700 }}>{subtitle}</div> : null}
          {ctaBtn}
          <div style={{ height: 80, display: "flex" }} />
        </div>
        {footer}
      </div>
    );
  }

  if (layout === "produto-esquerda") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "transparent" }}>
        {header}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", paddingLeft: 520 }}>
          {tagEl}
          {bar}
          <div style={{ fontSize: 46, fontWeight: 800, color: "#1B2A1B", lineHeight: 1.12, marginBottom: 16, display: "flex", maxWidth: 480 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 17, color: "#666", lineHeight: 1.5, display: "flex", maxWidth: 440 }}>{subtitle}</div> : null}
          {ctaBtn}
        </div>
        {footer}
      </div>
    );
  }

  if (layout === "produto-metricas") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "transparent" }}>
        {header}
        <div style={{ display: "flex", flexDirection: "column", padding: "40px 64px 0", maxWidth: 560 }}>
          {tagEl}
          <div style={{ fontSize: 46, fontWeight: 800, color: "#1B2A1B", lineHeight: 1.12, marginBottom: 16, display: "flex" }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 17, color: "#666", lineHeight: 1.5, display: "flex" }}>{subtitle}</div> : null}
        </div>
        <div style={{ flex: 1, display: "flex" }} />
        {/* Divider */}
        <div style={{ margin: "0 64px", height: 1, background: "#E0E0E0", display: "flex" }} />
        {/* Metrics */}
        <div style={{ display: "flex", padding: "30px 64px", gap: 0 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#B8860B", display: "flex" }}>500mg</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: 1, display: "flex", marginTop: 4 }}>CURCUMINA POR CAPSULA</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#B8860B", display: "flex" }}>100%</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: 1, display: "flex", marginTop: 4 }}>PRODUCAO PROPRIA</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#B8860B", display: "flex" }}>ANVISA</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: 1, display: "flex", marginTop: 4 }}>REGISTRO GARANTIDO</div>
          </div>
        </div>
        {ctaBtn ? <div style={{ padding: "0 64px 20px", display: "flex" }}>{ctaBtn}</div> : null}
        {footer}
      </div>
    );
  }

  // Default: produto-direita
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "transparent" }}>
      {header}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", maxWidth: 560 }}>
        {tagEl}
        {bar}
        <div style={{ fontSize: 50, fontWeight: 800, color: "#1B2A1B", lineHeight: 1.12, marginBottom: 16, display: "flex" }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 17, color: "#666", lineHeight: 1.5, display: "flex", maxWidth: 480 }}>{subtitle}</div> : null}
        {ctaBtn}
      </div>
      {footer}
    </div>
  );
}
