import type { ResearchResults } from "@/modules/research/types";
import type { Idea } from "@/modules/ideas/types";

export function buildPerplexitySearchPrompt(query: string): string {
  return `Pesquise sobre "${query}" com foco em redes sociais e marketing de conteúdo. Inclua:

1. **Tendências atuais**: O que está em alta/trending sobre "${query}" nas redes sociais (Instagram, TikTok, LinkedIn). Para cada tendência, indique a plataforma e o nível de relevância.

2. **Artigos e discussões recentes**: Top artigos, posts e discussões relevantes sobre o tema. Inclua título, fonte e pontos-chave de cada um.

3. **Ângulos de concorrentes**: Como concorrentes e marcas estão abordando "${query}" nas redes sociais. Que tipo de conteúdo estão publicando, que formatos usam, o que está funcionando.

4. **Opiniões de especialistas**: O que influenciadores, especialistas e líderes de opinião estão dizendo sobre "${query}". Cite opiniões relevantes.

5. **Dados e estatísticas**: Números, pesquisas e dados relevantes sobre "${query}" que possam embasar conteúdo.

Seja detalhado e forneça informações atualizadas. Cite as fontes sempre que possível.`;
}

export function buildIdeasFromResearchUserPrompt(
  research: ResearchResults,
  existingIdeas: Idea[]
): string {
  const existingThemes =
    existingIdeas.length > 0
      ? `\n## Ideias já existentes (evite duplicar temas)\n${existingIdeas.map((i) => `- ${i.theme}`).join("\n")}\n`
      : "";

  const trendsText = research.trends
    .map(
      (t) =>
        `- ${t.topic} (${t.platform}, relevância: ${t.relevance}/10): ${t.description}`
    )
    .join("\n");

  const articlesText = research.articles
    .map(
      (a) =>
        `- "${a.title}" (${a.source}): ${a.key_points.join("; ")}`
    )
    .join("\n");

  const competitorText = research.competitor_angles
    .map((c) => `- ${c}`)
    .join("\n");

  const expertText = research.expert_opinions
    .map((e) => `- ${e}`)
    .join("\n");

  return `Com base na pesquisa de tendências abaixo, gere 5 ideias de conteúdo para redes sociais.

## Resumo da Pesquisa
${research.summary}

## Tendências Identificadas
${trendsText || "Nenhuma tendência identificada"}

## Artigos Relevantes
${articlesText || "Nenhum artigo encontrado"}

## Ângulos de Concorrentes
${competitorText || "Nenhum ângulo identificado"}

## Opiniões de Especialistas
${expertText || "Nenhuma opinião encontrada"}
${existingThemes}
## Estrutura esperada (JSON)
\`\`\`json
{
  "ideas": [
    {
      "theme": "Tema principal da ideia",
      "angle": "Ângulo ou abordagem específica",
      "objective": "Objetivo do conteúdo (educar, engajar, converter, etc)",
      "suggested_format": "estatico | carrossel | story | reels",
      "justification": "Por que essa ideia funciona para redes sociais",
      "brand_fit": "Como se conecta com a marca"
    }
  ]
}
\`\`\`

## Regras
- Gere exatamente 5 ideias variadas
- Cada ideia deve ter um ângulo único, inspirado nas tendências e dados da pesquisa
- Evite repetir temas das ideias já existentes
- Use dados e insights da pesquisa para justificar cada ideia
- Priorize formatos que estão performando bem nas tendências identificadas
- Foque em conteúdo que gere engajamento e seja relevante para o momento
- Retorne APENAS o JSON, sem texto adicional`;
}
