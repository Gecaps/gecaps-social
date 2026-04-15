import type { Idea } from "@/modules/ideas/types";
import type { Reference } from "@/modules/references/types";
import type { Piece } from "@/modules/pieces/types";

export function buildPieceUserPrompt(
  idea: Idea,
  reference: Reference | null,
  topPosts: Piece[]
): string {
  const referenceContext = reference
    ? `\n## Referencia original\n- Resumo: ${reference.summary ?? reference.raw_content ?? "Sem conteudo"}\n- Tags: ${reference.tags?.join(", ") ?? "Nenhuma"}\n`
    : "";

  const topPostsContext =
    topPosts.length > 0
      ? `\n## Top posts anteriores (use como referencia de estilo)\n${topPosts
          .map(
            (p) =>
              `- Titulo: ${p.title} | Hook: ${p.hook ?? "N/A"} | Caption: ${p.caption?.substring(0, 200) ?? "N/A"}`
          )
          .join("\n")}\n`
      : "";

  return `Crie um conteudo completo para redes sociais com base na ideia abaixo.

## Ideia
- Tema: ${idea.theme}
- Angulo: ${idea.angle ?? "Nao definido"}
- Objetivo: ${idea.objective ?? "Nao definido"}
- Formato sugerido: ${idea.suggested_format ?? "Nao definido"}
${referenceContext}${topPostsContext}
## Estrutura esperada (JSON)
\`\`\`json
{
  "title": "Titulo curto e impactante",
  "hook": "Frase de abertura que prende a atencao",
  "caption": "Legenda completa com formatacao para Instagram",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "cta": "Call-to-action claro e direto",
  "creative_brief": "Descricao do que o designer deve criar",
  "visual_direction": "Direcao visual: cores, elementos, composicao",
  "pilar": "educativo | autoridade | produto | conexao | social-proof | objecao",
  "format": "estatico | carrossel | story | reels",
  "layout": "branco | verde | quote | foto",
  "slide_structure": null
}
\`\`\`

## Regras
- title: maximo 60 caracteres, impactante
- hook: primeira frase que prende atencao (para caption ou primeiro slide)
- caption: legenda completa formatada, com quebras de linha, emojis estrategicos
- hashtags: 5-15 hashtags relevantes
- cta: call-to-action claro
- creative_brief: instrucoes claras para o designer
- visual_direction: cores, estilo, elementos visuais
- pilar e format: escolha entre as opcoes listadas
- layout: escolha entre branco, verde, quote ou foto
- slide_structure: se format for "carrossel", retorne array de objetos com {slide_number, headline, body, visual_note}. Se nao for carrossel, retorne null
- Retorne APENAS o JSON, sem texto adicional`;
}
