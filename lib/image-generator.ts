import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";

let _fontBase64Cache: { regular: string; bold: string; extraBold: string } | null = null;

async function loadFontFile(name: string): Promise<Buffer> {
  const fsPath = join(process.cwd(), "public", "assets", "fonts", name);
  try {
    return await readFile(fsPath);
  } catch {
    // Fallback: try .next/server path (Vercel standalone)
    try {
      return await readFile(join(process.cwd(), "assets", "fonts", name));
    } catch {
      // Last resort: fetch from public URL
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const res = await fetch(`${baseUrl}/assets/fonts/${name}`);
      return Buffer.from(await res.arrayBuffer());
    }
  }
}

async function loadFontsBase64() {
  if (_fontBase64Cache) return _fontBase64Cache;
  const [regular, bold, extraBold] = await Promise.all([
    loadFontFile("Inter-Regular.ttf").then((b) => b.toString("base64")),
    loadFontFile("Inter-Bold.ttf").then((b) => b.toString("base64")),
    loadFontFile("Inter-ExtraBold.ttf").then((b) => b.toString("base64")),
  ]);
  _fontBase64Cache = { regular, bold, extraBold };
  return _fontBase64Cache;
}

function fontFaceSvg(fonts: { regular: string; bold: string; extraBold: string }): string {
  return `
    <style>
      @font-face { font-family: 'Inter'; font-weight: 400; src: url('data:font/ttf;base64,${fonts.regular}') format('truetype'); }
      @font-face { font-family: 'Inter'; font-weight: 700; src: url('data:font/ttf;base64,${fonts.bold}') format('truetype'); }
      @font-face { font-family: 'Inter'; font-weight: 800; src: url('data:font/ttf;base64,${fonts.extraBold}') format('truetype'); }
    </style>`;
}

export interface ProductPostOptions {
  layout: "produto-centro" | "produto-direita" | "produto-esquerda" | "produto-metricas";
  title: string;
  subtitle?: string;
  tag?: string;
  category?: string;
  cta?: string;
  handle?: string;
  productImageUrl?: string;
  metrics?: { value: string; label: string }[];
}

const WIDTH = 1080;
const HEIGHT = 1350;

async function loadProductImage(url?: string): Promise<Buffer | null> {
  if (!url) return null;

  try {
    if (url.startsWith("http")) {
      const res = await fetch(url);
      return Buffer.from(await res.arrayBuffer());
    }
    // Local file — try filesystem first, then HTTP
    const fsPath = join(process.cwd(), "public", url);
    try {
      return await readFile(fsPath);
    } catch {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const res = await fetch(`${baseUrl}${url}`);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
  } catch {
    return null;
  }
}

async function loadAsset(name: string): Promise<Buffer> {
  const fsPath = join(process.cwd(), "public", "assets", name);
  try {
    return await readFile(fsPath);
  } catch {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/assets/${name}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

function createSvgText(opts: {
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  lineHeight?: number;
  anchor?: string;
}): string {
  const {
    text,
    fontSize,
    fontWeight,
    color,
    x,
    y,
    maxWidth,
    lineHeight = 1.15,
    anchor = "start",
  } = opts;

  // Simple word wrap
  const words = text.split(" ");
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length > charsPerLine && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${x}" dy="${i === 0 ? 0 : fontSize * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return `<text x="${x}" y="${y}" font-family="Inter" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="${anchor}">${tspans}</text>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateProductPost(
  opts: ProductPostOptions
): Promise<Buffer> {
  const {
    layout,
    title,
    subtitle,
    tag = "PRODUTO",
    category = "SUPLEMENTO",
    cta,
    handle = "@gecapsbrasil",
    productImageUrl,
    metrics,
  } = opts;

  // Load product image
  const productBuf = await loadProductImage(productImageUrl);

  // Create base canvas (light background)
  let base = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 247, g: 250, b: 247, alpha: 1 },
    },
  }).png();

  const composites: sharp.OverlayOptions[] = [];

  // Top green bar
  const topBar = await sharp({
    create: { width: WIDTH, height: 7, channels: 4, background: { r: 67, g: 160, b: 71, alpha: 1 } },
  }).png().toBuffer();
  composites.push({ input: topBar, top: 0, left: 0 });

  // Logo
  try {
    const logoBuf = await loadAsset("logo-gecaps.png");
    const logo = await sharp(logoBuf).resize(110, null).toBuffer();
    composites.push({ input: logo, top: 40, left: 64 });
  } catch {}

  // Category badge will be added to SVG overlay

  // Product image positioning based on layout
  if (productBuf) {
    const productSharp = sharp(productBuf);
    const meta = await productSharp.metadata();
    const isTransparent = meta.channels === 4;

    let resized: Buffer;
    let prodTop: number;
    let prodLeft: number;

    switch (layout) {
      case "produto-centro": {
        resized = await productSharp.resize(500, 500, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
        prodTop = 120;
        prodLeft = Math.round((WIDTH - 500) / 2);
        break;
      }
      case "produto-direita": {
        resized = await productSharp.resize(450, 550, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
        prodTop = 180;
        prodLeft = WIDTH - 450 - 40;
        break;
      }
      case "produto-esquerda": {
        resized = await productSharp.resize(450, 550, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
        prodTop = 180;
        prodLeft = 40;
        break;
      }
      case "produto-metricas": {
        resized = await productSharp.resize(380, 450, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
        prodTop = 100;
        prodLeft = WIDTH - 380 - 60;
        break;
      }
    }

    composites.push({ input: resized, top: prodTop, left: prodLeft });
  }

  // Text positioning based on layout
  const textElements: string[] = [];
  let textX: number;
  let textMaxW: number;
  let textStartY: number;

  switch (layout) {
    case "produto-centro": {
      textX = WIDTH / 2;
      textMaxW = 800;
      textStartY = 700;
      // Centered tag
      textElements.push(createSvgText({ text: tag.toUpperCase(), fontSize: 13, fontWeight: 700, color: "#B8860B", x: textX, y: textStartY, maxWidth: textMaxW, anchor: "middle" }));
      textElements.push(createSvgText({ text: title, fontSize: 52, fontWeight: 800, color: "#1B2A1B", x: textX, y: textStartY + 50, maxWidth: textMaxW, anchor: "middle" }));
      if (subtitle) textElements.push(createSvgText({ text: subtitle, fontSize: 20, fontWeight: 400, color: "#666", x: textX, y: textStartY + 200, maxWidth: textMaxW, anchor: "middle" }));
      break;
    }
    case "produto-direita": {
      textX = 64;
      textMaxW = 520;
      textStartY = 500;
      textElements.push(createSvgText({ text: tag.toUpperCase(), fontSize: 13, fontWeight: 700, color: "#B8860B", x: textX, y: textStartY, maxWidth: textMaxW }));
      // Green bar
      textElements.push(`<rect x="${textX}" y="${textStartY + 20}" width="48" height="4" rx="2" fill="#43A047"/>`);
      textElements.push(createSvgText({ text: title, fontSize: 52, fontWeight: 800, color: "#1B2A1B", x: textX, y: textStartY + 70, maxWidth: textMaxW }));
      if (subtitle) textElements.push(createSvgText({ text: subtitle, fontSize: 18, fontWeight: 400, color: "#666", x: textX, y: textStartY + 280, maxWidth: textMaxW }));
      break;
    }
    case "produto-esquerda": {
      textX = 530;
      textMaxW = 480;
      textStartY = 500;
      textElements.push(createSvgText({ text: tag.toUpperCase(), fontSize: 13, fontWeight: 700, color: "#B8860B", x: textX, y: textStartY, maxWidth: textMaxW }));
      textElements.push(`<rect x="${textX}" y="${textStartY + 20}" width="48" height="4" rx="2" fill="#43A047"/>`);
      textElements.push(createSvgText({ text: title, fontSize: 48, fontWeight: 800, color: "#1B2A1B", x: textX, y: textStartY + 70, maxWidth: textMaxW }));
      if (subtitle) textElements.push(createSvgText({ text: subtitle, fontSize: 18, fontWeight: 400, color: "#666", x: textX, y: textStartY + 280, maxWidth: textMaxW }));
      break;
    }
    case "produto-metricas": {
      textX = 64;
      textMaxW = 550;
      textStartY = 200;
      textElements.push(createSvgText({ text: tag.toUpperCase(), fontSize: 13, fontWeight: 700, color: "#B8860B", x: textX, y: textStartY, maxWidth: textMaxW }));
      textElements.push(createSvgText({ text: title, fontSize: 48, fontWeight: 800, color: "#1B2A1B", x: textX, y: textStartY + 50, maxWidth: textMaxW }));
      if (subtitle) textElements.push(createSvgText({ text: subtitle, fontSize: 18, fontWeight: 400, color: "#666", x: textX, y: textStartY + 250, maxWidth: textMaxW }));

      // Divider line
      textElements.push(`<line x1="64" y1="920" x2="${WIDTH - 64}" y2="920" stroke="#E0E0E0" stroke-width="1"/>`);

      // Metrics row
      const mets = metrics || [
        { value: "500mg", label: "POR CAPSULA" },
        { value: "100%", label: "PRODUCAO PROPRIA" },
        { value: "ANVISA", label: "REGISTRO GARANTIDO" },
      ];
      const metricWidth = Math.floor((WIDTH - 128) / mets.length);
      mets.forEach((m, i) => {
        const mx = 64 + i * metricWidth;
        textElements.push(createSvgText({ text: m.value, fontSize: 36, fontWeight: 800, color: "#B8860B", x: mx, y: 990, maxWidth: metricWidth }));
        textElements.push(createSvgText({ text: m.label, fontSize: 11, fontWeight: 600, color: "#999", x: mx, y: 1030, maxWidth: metricWidth }));
      });
      break;
    }
  }

  // Category badge (top right)
  const badgeX = WIDTH - 64 - 160;
  textElements.push(`<rect x="${badgeX}" y="40" width="160" height="36" rx="18" fill="none" stroke="#43A047" stroke-width="2"/>`);
  textElements.push(createSvgText({ text: category.toUpperCase(), fontSize: 12, fontWeight: 700, color: "#43A047", x: badgeX + 80, y: 64, maxWidth: 140, anchor: "middle" }));

  // Footer: handle + info
  textElements.push(createSvgText({ text: handle, fontSize: 16, fontWeight: 700, color: "#43A047", x: 64, y: HEIGHT - 50, maxWidth: 400 }));
  textElements.push(createSvgText({ text: "GECAPS · Cosmeticos & Suplementos", fontSize: 12, fontWeight: 400, color: "#999", x: WIDTH - 64, y: HEIGHT - 50, maxWidth: 400, anchor: "end" }));

  // CTA button
  if (cta) {
    const ctaY = layout === "produto-centro" ? HEIGHT - 120 : layout === "produto-metricas" ? 1100 : HEIGHT - 120;
    const ctaX = layout === "produto-centro" ? (WIDTH - 200) / 2 : 64;
    textElements.push(`<rect x="${ctaX}" y="${ctaY}" width="200" height="44" rx="22" fill="#B8860B"/>`);
    textElements.push(createSvgText({ text: cta.toUpperCase() + " →", fontSize: 12, fontWeight: 700, color: "#fff", x: ctaX + 100, y: ctaY + 28, maxWidth: 180, anchor: "middle" }));
  }

  // Load fonts and compose all text as SVG overlay
  const fonts = await loadFontsBase64();
  const svgOverlay = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${fontFaceSvg(fonts)}${textElements.join("")}</svg>`
  );
  composites.push({ input: svgOverlay, top: 0, left: 0 });

  // Compose everything
  const result = await base.composite(composites).png().toBuffer();
  return result;
}
