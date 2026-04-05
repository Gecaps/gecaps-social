import { readFile } from "fs/promises";
import { join } from "path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export interface RenderOptions {
  template: "branco" | "verde" | "quote";
  title: string;
  subtitle?: string;
  tags?: string;
  badge?: string;
  cta?: string;
  handle?: string;
  bigNum?: string;
  highlight?: string; // word(s) to wrap in <span class="hl">
}

const TEMPLATE_FILES: Record<string, string> = {
  branco: "post-final-branco.html",
  verde: "post-final-verde.html",
  quote: "post-quote.html",
};

async function loadTemplate(name: string): Promise<string> {
  const filePath = join(process.cwd(), "templates", name);
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    // Fallback for Vercel — templates bundled in .next/server
    const altPath = join(process.cwd(), ".next", "server", "templates", name);
    try {
      return await readFile(altPath, "utf-8");
    } catch {
      throw new Error(`Template not found: ${name}`);
    }
  }
}

function injectVariables(html: string, opts: RenderOptions): string {
  let result = html;

  // Replace big number
  if (opts.bigNum) {
    result = result.replace(
      /<div class="big-num">[^<]*<\/div>/,
      `<div class="big-num">${opts.bigNum}</div>`
    );
  }

  // Replace badge (pilar)
  if (opts.badge) {
    result = result.replace(
      /<div class="badge">[^<]*<\/div>/,
      `<div class="badge">${opts.badge}</div>`
    );
  }

  // Replace tags
  if (opts.tags) {
    result = result.replace(
      /<div class="tags">[^<]*<\/div>/,
      `<div class="tags">${opts.tags}</div>`
    );
  }

  // Replace title with optional highlight
  let titleHtml = opts.title;
  if (opts.highlight) {
    // Wrap the highlight word(s) in <span class="hl">
    const words = opts.highlight.split(",").map((w) => w.trim());
    for (const word of words) {
      titleHtml = titleHtml.replace(
        new RegExp(`(${escapeRegex(word)})`, "gi"),
        '<span class="hl">$1</span>'
      );
    }
  }
  result = result.replace(
    /<h1 class="title">[\s\S]*?<\/h1>/,
    `<h1 class="title">${titleHtml}</h1>`
  );

  // Replace subtitle
  if (opts.subtitle !== undefined) {
    result = result.replace(
      /<p class="subtitle">[\s\S]*?<\/p>/,
      `<p class="subtitle">${opts.subtitle}</p>`
    );
  }

  // Replace CTA
  if (opts.cta !== undefined) {
    result = result.replace(
      /<div class="cta">[\s\S]*?<\/div>/,
      `<div class="cta">${opts.cta} <span>→</span></div>`
    );
  }

  // Replace handle
  if (opts.handle) {
    result = result.replace(
      /<span class="handle">[^<]*<\/span>/,
      `<span class="handle">${opts.handle}</span>`
    );
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function renderTemplate(opts: RenderOptions): Promise<Buffer> {
  const templateFile = TEMPLATE_FILES[opts.template];
  if (!templateFile) throw new Error(`Unknown template: ${opts.template}`);

  const rawHtml = await loadTemplate(templateFile);
  const html = injectVariables(rawHtml, opts);

  // Launch headless Chrome
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1080,
      height: opts.template === "quote" ? 1080 : 1350,
    },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: 1080,
        height: opts.template === "quote" ? 1080 : 1350,
      },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
