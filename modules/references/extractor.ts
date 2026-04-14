import type { ReferenceType } from "./types";

const MAX_CONTENT_LENGTH = 10000;

export async function extractContent(
  type: ReferenceType,
  source: string
): Promise<string> {
  switch (type) {
    case "link":
      return extractFromLink(source);
    case "pdf":
      return extractFromPdf(source);
    case "text":
    case "file":
      return source;
    default:
      return source;
  }
}

async function extractFromLink(url: string): Promise<string> {
  const { Readability } = await import("@mozilla/readability");
  const { parseHTML } = await import("linkedom");

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const { document } = parseHTML(html);
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article?.textContent) {
    throw new Error("Could not extract content from URL");
  }

  return article.textContent.slice(0, MAX_CONTENT_LENGTH);
}

async function extractFromPdf(source: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");

  let data: Uint8Array;

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    data = new Uint8Array(arrayBuffer);
  } else {
    // Assume base64 input
    data = new Uint8Array(Buffer.from(source, "base64"));
  }

  const parser = new PDFParse({ data });
  const result = await parser.getText();
  return result.text.slice(0, MAX_CONTENT_LENGTH);
}
