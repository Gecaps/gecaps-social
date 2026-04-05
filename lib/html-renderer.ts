import { readFile } from "fs/promises";
import { join } from "path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export interface RenderOptions {
  template: "branco" | "verde" | "quote";
  title: string;
  subtitle?: string;
  tags?: string;
  badge?: string;
  cta?: string;
  handle?: string;
  bigNum?: string;
  highlight?: string;
}

const TEMPLATE_FILES: Record<string, string> = {
  branco: "post-final-branco.html",
  verde: "post-final-verde.html",
  quote: "post-quote.html",
};

// Chromium CDN URL for serverless
const CHROMIUM_URL =
  "https://github.com/nichochar/chromium-for-lambda/releases/download/v143.0.4/chromium-v143.0.4-pack.tar";

async function loadTemplate(name: string): Promise<string> {
  // Try multiple paths (local dev vs Vercel)
  const paths = [
    join(process.cwd(), "templates", name),
    join(process.cwd(), ".next", "server", "templates", name),
  ];
  for (const p of paths) {
    try {
      return await readFile(p, "utf-8");
    } catch {}
  }
  throw new Error(`Template not found: ${name}`);
}

function injectVariables(html: string, opts: RenderOptions): string {
  let result = html;

  if (opts.bigNum) {
    result = result.replace(
      /<div class="big-num">[^<]*<\/div>/,
      `<div class="big-num">${opts.bigNum}</div>`
    );
  }

  if (opts.badge) {
    result = result.replace(
      /<div class="badge">[^<]*<\/div>/,
      `<div class="badge">${opts.badge}</div>`
    );
  }

  if (opts.tags) {
    result = result.replace(
      /<div class="tags">[^<]*<\/div>/,
      `<div class="tags">${opts.tags}</div>`
    );
  }

  let titleHtml = opts.title;
  if (opts.highlight) {
    const words = opts.highlight.split(",").map((w) => w.trim());
    for (const word of words) {
      titleHtml = titleHtml.replace(
        new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
        '<span class="hl">$1</span>'
      );
    }
  }
  result = result.replace(
    /<h1 class="title">[\s\S]*?<\/h1>/,
    `<h1 class="title">${titleHtml}</h1>`
  );

  if (opts.subtitle !== undefined) {
    result = result.replace(
      /<p class="subtitle">[\s\S]*?<\/p>/,
      `<p class="subtitle">${opts.subtitle}</p>`
    );
  }

  if (opts.cta !== undefined) {
    result = result.replace(
      /<div class="cta">[\s\S]*?<\/div>/,
      `<div class="cta">${opts.cta} <span>→</span></div>`
    );
  }

  if (opts.handle) {
    result = result.replace(
      /<span class="handle">[^<]*<\/span>/,
      `<span class="handle">${opts.handle}</span>`
    );
  }

  return result;
}

export async function renderTemplate(opts: RenderOptions): Promise<Buffer> {
  const templateFile = TEMPLATE_FILES[opts.template];
  if (!templateFile) throw new Error(`Unknown template: ${opts.template}`);

  const rawHtml = await loadTemplate(templateFile);
  const html = injectVariables(rawHtml, opts);

  const isLocal = !process.env.VERCEL;
  const height = opts.template === "quote" ? 1080 : 1350;

  let executablePath: string;
  if (isLocal) {
    // Local: use system Chrome
    executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    // Vercel: download chromium from CDN
    executablePath = await chromium.executablePath(CHROMIUM_URL);
  }

  const browser = await puppeteer.launch({
    args: isLocal
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : chromium.args,
    defaultViewport: { width: 1080, height },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
