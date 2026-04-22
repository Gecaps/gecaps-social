import { generateJSON } from "./client";
import { buildReferenceUserPrompt } from "./prompts/reference";
import { buildIdeasUserPrompt } from "./prompts/ideas";
import { buildPieceUserPrompt } from "./prompts/piece";
import { buildInsightsUserPrompt } from "./prompts/insights";
import {
  buildPerplexitySearchPrompt,
  buildIdeasFromResearchUserPrompt,
} from "./prompts/research";
import { buildSystemPrompt } from "@/modules/playbook/prompt-builder";
import { getPlaybookByAccountId } from "@/modules/playbook/queries";
import {
  getReferenceById,
  updateReferenceProcessed,
  updateReferenceStatus,
} from "@/modules/references/queries";
import { getIdeaById, createIdea, listIdeas } from "@/modules/ideas/queries";
import { createPiece, updatePiece } from "@/modules/pieces/queries";
import { generateImage } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import {
  getResearchById,
  updateResearchResults,
  updateResearchStatus,
} from "@/modules/research/queries";
import { searchWithPerplexity } from "@/modules/research/perplexity-client";
import type { ResearchResults } from "@/modules/research/types";
import type { Piece } from "@/modules/pieces/types";
import type { Metrics } from "@/modules/metrics/types";
import type { Insight } from "@/modules/insights/types";

// ── Process Reference ────────────────────────────────────────────
export async function processReference(referenceId: string) {
  const ref = await getReferenceById(referenceId);
  if (!ref) throw new Error(`Reference ${referenceId} not found`);

  const playbook = await getPlaybookByAccountId(ref.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildReferenceUserPrompt(
    ref.raw_content ?? ref.source_url ?? ""
  );

  const result = await generateJSON<{
    summary: string;
    tags: string[];
    suggested_pilar: string;
    suggested_format: string;
    relevance_score: number;
  }>(systemPrompt, userPrompt);

  return updateReferenceProcessed(referenceId, {
    summary: result.summary,
    tags: result.tags,
    suggested_pilar: result.suggested_pilar,
    suggested_format: result.suggested_format,
    relevance_score: result.relevance_score,
  });
}

// ── Generate Ideas from Reference ────────────────────────────────
export async function generateIdeasFromReference(referenceId: string) {
  const ref = await getReferenceById(referenceId);
  if (!ref) throw new Error(`Reference ${referenceId} not found`);

  const playbook = await getPlaybookByAccountId(ref.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildIdeasUserPrompt(ref, []);

  const result = await generateJSON<{
    ideas: Array<{
      theme: string;
      angle: string;
      objective: string;
      suggested_format: string;
      justification: string;
      brand_fit: string;
    }>;
  }>(systemPrompt, userPrompt);

  const saved = await Promise.all(
    result.ideas.map((idea) =>
      createIdea({
        account_id: ref.account_id,
        reference_id: ref.id,
        research_id: null,
        theme: idea.theme,
        angle: idea.angle,
        objective: idea.objective,
        suggested_format: idea.suggested_format,
        justification: idea.justification,
        brand_fit: idea.brand_fit,
        status: "pending",
        is_manual: false,
      })
    )
  );

  await updateReferenceStatus(referenceId, "virou_ideia");
  return saved;
}

// ── Generate Piece from Idea ─────────────────────────────────────
export async function generatePieceFromIdea(
  ideaId: string,
  topPosts: Piece[] = []
) {
  const idea = await getIdeaById(ideaId);
  if (!idea) throw new Error(`Idea ${ideaId} not found`);

  const ref = idea.reference_id
    ? await getReferenceById(idea.reference_id)
    : null;

  const playbook = await getPlaybookByAccountId(idea.account_id);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildPieceUserPrompt(idea, ref, topPosts);

  const result = await generateJSON<{
    title: string;
    hook: string;
    caption: string;
    hashtags: string;
    cta: string;
    creative_brief: string;
    visual_direction: string;
    pilar: string;
    format: string;
    layout: string;
    slide_structure: Record<string, unknown>[] | null;
  }>(systemPrompt, userPrompt, 4000);

  const piece = await createPiece({
    account_id: idea.account_id,
    idea_id: idea.id,
    title: result.title,
    hook: result.hook,
    pilar: result.pilar as Piece["pilar"],
    format: result.format as Piece["format"],
    status: "in_production",
    scheduled_date: null,
    scheduled_time: null,
    published_date: null,
    caption: result.caption,
    hashtags: result.hashtags,
    cta: result.cta,
    image_url: null,
    layout: (result.layout as Piece["layout"]) ?? "branco",
    creative_brief: result.creative_brief,
    visual_direction: result.visual_direction,
    slide_structure: result.slide_structure,
    rejection_reason: null,
  });

  if (
    result.format === "carrossel" &&
    Array.isArray(result.slide_structure) &&
    result.slide_structure.length > 0
  ) {
    const enriched = await enrichSlidesWithImages(
      result.slide_structure as SlideInput[],
      piece.account_id
    );
    if (enriched.some((s, i) => s.imageUrl !== (result.slide_structure as SlideInput[])[i].imageUrl)) {
      return updatePiece(piece.id, {
        slide_structure: enriched as unknown as Record<string, unknown>[],
      });
    }
  }

  return piece;
}

interface SlideInput {
  title?: string;
  subtitle?: string;
  tags?: string;
  cta?: string;
  highlight?: string;
  bigNum?: string;
  imageUrl?: string;
  layout?: string;
  visual_prompt?: string;
  id?: string;
}

const VISUAL_LAYOUTS = new Set(["foto", "magazine", "editorial"]);

async function enrichSlidesWithImages(
  slides: SlideInput[],
  accountId: string
): Promise<SlideInput[]> {
  const tasks = slides.map(async (slide, idx) => {
    const base: SlideInput = {
      id: slide.id ?? `s${idx + 1}`,
      title: slide.title ?? "",
      subtitle: slide.subtitle ?? "",
      tags: slide.tags ?? "",
      cta: slide.cta ?? "",
      highlight: slide.highlight ?? "",
      bigNum: slide.bigNum ?? "",
      imageUrl: slide.imageUrl ?? "",
      layout: slide.layout ?? "branco",
      visual_prompt: slide.visual_prompt ?? "",
    };

    if (
      !VISUAL_LAYOUTS.has(base.layout!) ||
      !base.visual_prompt ||
      base.imageUrl
    ) {
      return base;
    }

    if (idx > 0) await new Promise((r) => setTimeout(r, idx * 1500));

    try {
      const img = await generateImage(base.visual_prompt, "3:4");
      const ext = img.mimeType.includes("png") ? "png" : "jpg";
      const path = `${accountId}/slide_${Date.now()}_${idx}.${ext}`;
      const buf = Buffer.from(img.imageBase64, "base64");
      const { error } = await supabase()
        .storage.from("references")
        .upload(path, buf, {
          contentType: img.mimeType,
          upsert: false,
        });
      if (error) throw error;
      const { data } = supabase().storage.from("references").getPublicUrl(path);
      base.imageUrl = data.publicUrl;
    } catch (err) {
      console.error(`Slide ${idx} image generation failed:`, err);
    }

    return base;
  });

  return Promise.all(tasks);
}

// ── Execute Research (Perplexity) ────────────────────────────────
export async function executeResearch(researchId: string) {
  const session = await getResearchById(researchId);
  if (!session) throw new Error(`Research ${researchId} not found`);

  try {
    await updateResearchStatus(researchId, "searching");

    const searchPrompt = buildPerplexitySearchPrompt(session.query);
    const { text, citations } = await searchWithPerplexity(searchPrompt);

    const playbook = await getPlaybookByAccountId(session.account_id);
    const systemPrompt = buildSystemPrompt(playbook);

    const results = await generateJSON<ResearchResults>(
      systemPrompt,
      `Estruture o texto de pesquisa abaixo no formato JSON especificado.

## Texto da Pesquisa
${text}

## Citações encontradas
${citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n")}

## Estrutura esperada (JSON)
\`\`\`json
{
  "trends": [{ "topic": "string", "description": "string", "platform": "string", "relevance": 8 }],
  "articles": [{ "title": "string", "source": "string", "url": "string", "key_points": ["string"] }],
  "competitor_angles": ["string"],
  "expert_opinions": ["string"],
  "summary": "Resumo geral da pesquisa em 2-3 parágrafos",
  "citations": ["url1", "url2"]
}
\`\`\`

## Regras
- Extraia TODAS as tendências mencionadas, com relevância de 1 a 10
- Liste TODOS os artigos/fontes citados
- Identifique ângulos de concorrentes e opiniões de especialistas
- Inclua as citações/URLs das fontes
- Retorne APENAS o JSON, sem texto adicional`,
      4000
    );

    // Merge citations from Perplexity API with extracted ones
    const allCitations = [
      ...new Set([...results.citations, ...citations]),
    ];
    results.citations = allCitations;

    return await updateResearchResults(researchId, results);
  } catch (error) {
    await updateResearchStatus(researchId, "failed");
    throw error;
  }
}

// ── Generate Ideas from Research ────────────────────────────────
export async function generateIdeasFromResearch(researchId: string) {
  const session = await getResearchById(researchId);
  if (!session) throw new Error(`Research ${researchId} not found`);
  if (!session.results)
    throw new Error(`Research ${researchId} has no results`);

  const playbook = await getPlaybookByAccountId(session.account_id);
  const systemPrompt = buildSystemPrompt(playbook);

  const existingIdeas = await listIdeas(session.account_id);
  const userPrompt = buildIdeasFromResearchUserPrompt(
    session.results,
    existingIdeas
  );

  const result = await generateJSON<{
    ideas: Array<{
      theme: string;
      angle: string;
      objective: string;
      suggested_format: string;
      justification: string;
      brand_fit: string;
    }>;
  }>(systemPrompt, userPrompt);

  const saved = await Promise.all(
    result.ideas.map((idea) =>
      createIdea({
        account_id: session.account_id,
        reference_id: null,
        research_id: researchId,
        theme: idea.theme,
        angle: idea.angle,
        objective: idea.objective,
        suggested_format: idea.suggested_format,
        justification: idea.justification,
        brand_fit: idea.brand_fit,
        status: "pending",
        is_manual: false,
      })
    )
  );

  return saved;
}

// ── Generate Insights ────────────────────────────────────────────
export async function generateInsights(
  accountId: string,
  piecesWithMetrics: Array<Piece & { metrics: Metrics }>
) {
  const playbook = await getPlaybookByAccountId(accountId);
  const systemPrompt = buildSystemPrompt(playbook);
  const userPrompt = buildInsightsUserPrompt(piecesWithMetrics);

  const result = await generateJSON<{
    insights: Array<{ content: string; type: "auto" }>;
  }>(systemPrompt, userPrompt);

  return result.insights as Array<Pick<Insight, "content" | "type">>;
}
