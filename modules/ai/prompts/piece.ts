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
  "layout": "branco | verde | quote | foto | magazine | editorial",
  "slide_structure": null
}
\`\`\`

## Regras gerais (sempre)
- title: máximo 60 caracteres, impactante
- hook: primeira frase que prende atenção (para caption ou primeiro slide)
- caption: legenda completa formatada, com quebras de linha, emojis estratégicos
- hashtags: 5-15 hashtags relevantes
- cta: call-to-action de **engajamento** (ex: "Salva esse post", "Manda pra uma amiga", "Comenta aqui se já passou por isso", "Clica no link da bio"). NUNCA CTAs comerciais B2B ("fale com comercial", "solicite orçamento", "agende demo")
- creative_brief: instruções claras para o designer
- visual_direction: cores, estilo, elementos visuais
- pilar e format: escolha entre as opções listadas
- layout: branco (clean), verde (bold), quote (frase forte), foto (foto com overlay), magazine (capa de revista), editorial (split elegante)
- Evite travessões nas copies (parece IA)
- **Não repetir o nome da marca/conta** (GECAPS, @gecapsbrasil) mais de 1x na peça inteira somando título + caption + slides. O perfil já é da marca, não precisa repetir.
- Evite frases óbvias tipo "descubra", "veja como", "saiba mais"
- slide_structure: se format for "carrossel", retorne array de 4-7 objetos no formato abaixo. Se não for carrossel, retorne null

## Formato de cada slide (quando carrossel)
\`\`\`json
{
  "title": "Headline principal do slide (curta, impactante)",
  "subtitle": "Texto de apoio (1-2 linhas)",
  "tags": "",
  "cta": "CTA só no último slide, vazio nos demais",
  "highlight": "Badge/etiqueta opcional (ex: Sinal 1, Dica, Alerta)",
  "bigNum": "Número grande opcional (ex: 1, 2, 3) para slides numerados",
  "imageUrl": "",
  "layout": "branco | verde | quote | foto | magazine | editorial",
  "visual_prompt": "Descrição curta da imagem ideal para este slide (em inglês, estilo fotorealista, sem texto na imagem). Apenas para slides com layout foto, magazine ou editorial."
}
\`\`\`

## Regras do carrossel
- Slide 1 (capa): layout impactante (verde, magazine ou editorial), title é a promessa/hook, bigNum vazio
- Slides do meio: pode ter bigNum ("1", "2", "3"), highlight ("Sinal 1", etc), layout alterna para quebrar visual
- Último slide: contém o cta (ex: "Salva esse post", "Comenta aqui", "Manda pra uma amiga")
- imageUrl: deixe SEMPRE vazio (será gerado depois)
- visual_prompt: obrigatório para slides com layout foto, magazine ou editorial; vazio para branco, verde, quote

## Regras do visual_prompt (para Nano Banana / Gemini Image)
**SEMPRE em inglês**, vocabulário visual editorial premium. Estrutura:
\`[subject], [setting/context], [composition], [lighting], [color palette], [photography style], no text, no logos, no watermark\`

Exemplos bons:
- "Close-up of a woman in her early 30s applying serum to her cheekbones, soft morning sunlight from a window, shallow depth of field, warm beige and rose gold palette, editorial skincare photography, clean minimalist background, no text, no logos"
- "Flat lay of premium cosmetic bottles on a marble surface with eucalyptus leaves, top-down composition, diffused soft daylight, neutral cream and sage palette, magazine cover styling, no text, no labels"
- "Portrait of a confident woman with glowing skin in her 40s looking at the camera, neutral studio backdrop, soft butterfly lighting, warm earth tones, beauty editorial photography, high-end campaign feel, no text"

Evite: "beautiful", "amazing" (genérico), descrições em português, prompts curtos sem contexto visual.

- Retorne APENAS o JSON, sem texto adicional`;
}
