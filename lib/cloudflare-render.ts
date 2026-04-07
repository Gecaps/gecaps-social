import { readFile } from "fs/promises";
import { join } from "path";

export interface RenderOptions {
  template: "branco" | "verde" | "quote" | "foto-premium";
  title: string;
  subtitle?: string;
  tags?: string;
  badge?: string;
  cta?: string;
  handle?: string;
  bigNum?: string;
  highlight?: string;
  imageUrl?: string;
}

const TEMPLATE_FILES: Record<string, string> = {
  branco: "post-final-branco.html",
  verde: "post-final-verde.html",
  quote: "post-quote.html",
  "foto-premium": "post-foto-premium.html",
};

async function loadTemplate(name: string): Promise<string> {
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        new RegExp(`(${escapeRegex(word)})`, "gi"),
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

  // Image URL for foto-premium template
  if (opts.imageUrl) {
    result = result.replace(/\{\{IMAGE_URL\}\}/g, opts.imageUrl);
  }

  return result;
}

export async function renderWithCloudflare(
  opts: RenderOptions
): Promise<Buffer> {
  const templateFile = TEMPLATE_FILES[opts.template];
  if (!templateFile) throw new Error(`Unknown template: ${opts.template}`);

  const rawHtml = await loadTemplate(templateFile);
  const html = injectVariables(rawHtml, opts);

  const accountId = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_BROWSER_TOKEN;

  if (!accountId || !token) {
    throw new Error("CF_ACCOUNT_ID and CF_BROWSER_TOKEN are required");
  }

  const height = opts.template === "quote" ? 1080 : 1350;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/screenshot`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        viewport: { width: 1080, height },
        screenshotOptions: { type: "png", fullPage: false },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudflare render failed (${response.status}): ${text}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
