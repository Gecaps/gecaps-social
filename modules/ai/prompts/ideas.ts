import type { Reference } from "@/modules/references/types";
import type { Idea } from "@/modules/ideas/types";

export function buildIdeasUserPrompt(
  reference: Reference,
  existingIdeas: Idea[]
): string {
  const existingThemes =
    existingIdeas.length > 0
      ? `\n## Ideias ja existentes (evite duplicar temas)\n${existingIdeas.map((i) => `- ${i.theme}`).join("\n")}\n`
      : "";

  return `Com base na referencia abaixo, gere 5 ideias de conteudo para redes sociais.

## Referencia
- Resumo: ${reference.summary ?? reference.raw_content ?? "Sem conteudo"}
- Tags: ${reference.tags?.join(", ") ?? "Nenhuma"}
- Pilar sugerido: ${reference.suggested_pilar ?? "Nao definido"}
- Formato sugerido: ${reference.suggested_format ?? "Nao definido"}
${existingThemes}
## Estrutura esperada (JSON)
\`\`\`json
{
  "ideas": [
    {
      "theme": "Tema principal da ideia",
      "angle": "Angulo ou abordagem especifica",
      "objective": "Objetivo do conteudo (educar, engajar, converter, etc)",
      "suggested_format": "estatico | carrossel | story | reels",
      "justification": "Por que essa ideia funciona para redes sociais",
      "brand_fit": "Como se conecta com a marca"
    }
  ]
}
\`\`\`

## Regras
- Gere exatamente 5 ideias variadas
- Cada ideia deve ter um angulo unico e diferente
- Evite repetir temas das ideias ja existentes
- Foque em conteudo que gere engajamento
- Retorne APENAS o JSON, sem texto adicional`;
}
