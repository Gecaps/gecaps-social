import type { Piece } from "@/modules/pieces/types";
import type { Metrics } from "@/modules/metrics/types";

export function buildInsightsUserPrompt(
  piecesWithMetrics: Array<Piece & { metrics: Metrics }>
): string {
  const dataLines = piecesWithMetrics.map(
    (p) =>
      `- "${p.title}" | Pilar: ${p.pilar} | Formato: ${p.format} | ` +
      `Reach: ${p.metrics.reach} | Likes: ${p.metrics.likes} | ` +
      `Comments: ${p.metrics.comments} | Shares: ${p.metrics.shares} | ` +
      `Saves: ${p.metrics.saves} | Engagement: ${p.metrics.engagement_rate.toFixed(2)}%`
  );

  return `Analise os dados de performance abaixo e gere insights acionaveis.

## Dados de Performance
${dataLines.join("\n")}

## Estrutura esperada (JSON)
\`\`\`json
{
  "insights": [
    {
      "content": "Descricao detalhada do insight",
      "type": "auto"
    }
  ]
}
\`\`\`

## Regras
- Gere entre 3 e 7 insights
- Cubra: o que funciona, o que nao funciona, padroes identificados, sugestoes de melhoria
- Cada insight deve ser acionavel e especifico
- Use os dados concretos para embasar cada insight
- type deve ser sempre "auto"
- Retorne APENAS o JSON, sem texto adicional`;
}
