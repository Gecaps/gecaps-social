export function buildReferenceUserPrompt(rawContent: string): string {
  return `Analise o seguinte conteúdo de referência e retorne um JSON com a estrutura abaixo.

## Conteúdo
${rawContent}

## Estrutura esperada (JSON)
\`\`\`json
{
  "summary": "Resumo de 3-5 frases do conteúdo principal",
  "tags": ["tag1", "tag2", "tag3"],
  "suggested_pilar": "educativo | autoridade | produto | conexao | social-proof | objecao",
  "suggested_format": "estatico | carrossel | story | reels",
  "relevance_score": 8
}
\`\`\`

## Regras
- summary: 3-5 frases objetivas, capturando os pontos principais
- tags: 3-8 tags relevantes em português
- suggested_pilar: escolha o pilar mais adequado entre as opções
- suggested_format: escolha o formato mais adequado para o conteúdo
- relevance_score: de 1 (irrelevante) a 10 (altamente relevante para redes sociais)
- Retorne APENAS o JSON, sem texto adicional`;
}
