import { generateJSON } from "./client";
import { buildReferenceUserPrompt } from "./prompts/reference";
import { buildIdeasUserPrompt } from "./prompts/ideas";
import { buildPieceUserPrompt } from "./prompts/piece";
import { buildInsightsUserPrompt } from "./prompts/insights";
import { buildSystemPrompt } from "@/modules/playbook/prompt-builder";
import { getPlaybookByAccountId } from "@/modules/playbook/queries";
import {
  getReferenceById,
  updateReferenceProcessed,
  updateReferenceStatus,
} from "@/modules/references/queries";
import { getIdeaById, createIdea } from "@/modules/ideas/queries";
import { createPiece } from "@/modules/pieces/queries";
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

  return createPiece({
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
