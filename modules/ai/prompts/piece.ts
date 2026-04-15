import type { Idea } from "@/modules/ideas/types";
import type { Reference } from "@/modules/references/types";
import type { Piece } from "@/modules/pieces/types";

export function buildPieceUserPrompt(
  idea: Idea,
  reference: Reference | null,
  topPosts: Piece[]
): string {
  const referenceContext = reference
    ? `\n## Referência original\n- Resumo: ${reference.summary ?? reference.raw_content ?? "Sem conteúdo"}\n- Tags: ${reference.tags?.join(", ") ?? "Nenhuma"}\n`
    : "";

  const topPostsContext =
    topPosts.length > 0
      ? `\n## Top posts anteriores (use como referência de estilo)\n${topPosts
          .map(
            (p) =>
              `- Título: ${p.title} | Hook: ${p.hook ?? "N/A"} | Caption: ${p.caption?.substring(0, 200) ?? "N/A"}`
          )
          .join("\n")}\n`
      : "";

  return `Crie um conteúdo completo para redes sociais com base na ideia abaixo.

## Ideia
- Tema: ${idea.theme}
- Ângulo: ${idea.angle ?? "Não definido"}
- Objetivo: ${idea.objective ?? "Não definido"}
- Formato sugerido: ${idea.suggested_format ?? "Não definido"}
${referenceContext}${topPostsContext}
## Estrutura esperada (JSON)
\`\`\`json
{
  "title": "Título curto e impactante",
  "hook": "Frase de abertura que prende a atenção",
  "caption": "Legenda completa com formatação para Instagram",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "cta": "Call-to-action claro e direto",
  "creative_brief": "Descrição do que o designer deve criar",
  "visual_direction": "Direção visual: cores, elementos, composição",
  "pilar": "educativo | autoridade | produto | conexao | social-proof | objecao",
  "format": "estatico | carrossel | story | reels",
  "layout": "branco | verde | quote | foto",
  "slide_structure": null
}
\`\`\`

## Regras
- title: máximo 60 caracteres, impactante
- hook: primeira frase que prende atenção (para caption ou primeiro slide)
- caption: legenda completa formatada, com quebras de linha, emojis estratégicos
- hashtags: 5-15 hashtags relevantes
- cta: call-to-action claro
- creative_brief: instruções claras para o designer
- visual_direction: cores, estilo, elementos visuais
- pilar e format: escolha entre as opções listadas
- layout: escolha entre branco, verde, quote ou foto
- slide_structure: se format for "carrossel", retorne array de objetos com {slide_number, headline, body, visual_note}. Se não for carrossel, retorne null
- Retorne APENAS o JSON, sem texto adicional`;
}
