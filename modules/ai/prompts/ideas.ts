import type { Reference } from "@/modules/references/types";
import type { Idea } from "@/modules/ideas/types";

export function buildIdeasUserPrompt(
  reference: Reference,
  existingIdeas: Idea[]
): string {
  const existingThemes =
    existingIdeas.length > 0
      ? `\n## Ideias já existentes (evite duplicar temas)\n${existingIdeas.map((i) => `- ${i.theme}`).join("\n")}\n`
      : "";

  return `Com base na referência abaixo, gere 5 ideias de conteúdo para redes sociais.

## Referência
- Resumo: ${reference.summary ?? reference.raw_content ?? "Sem conteúdo"}
- Tags: ${reference.tags?.join(", ") ?? "Nenhuma"}
- Pilar sugerido: ${reference.suggested_pilar ?? "Não definido"}
- Formato sugerido: ${reference.suggested_format ?? "Não definido"}
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
- Cada ideia deve ter um ângulo único e diferente
- Evite repetir temas das ideias já existentes
- Foque em conteúdo que gere engajamento
- Retorne APENAS o JSON, sem texto adicional`;
}
