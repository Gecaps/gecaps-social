import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  return _client;
}

interface GenerateCaptionInput {
  title: string;
  hook: string;
  pilar: string;
  cta: string;
  context?: string;
}

export async function generateCaption(
  input: GenerateCaptionInput
): Promise<{ caption: string; hashtags: string }> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Voce e o social media da GECAPS, empresa de cosmeticos e suplementos que fabrica marcas proprias (private label).

Gere uma legenda para Instagram com base nos dados abaixo:

Titulo: ${input.title}
Hook: ${input.hook}
Pilar: ${input.pilar}
CTA: ${input.cta}
${input.context ? `Contexto adicional: ${input.context}` : ""}

Regras:
- Tom profissional mas acessivel, B2B
- NAO usar travessoes ("—")
- NAO usar emojis em excesso (maximo 2-3 no texto todo)
- Handle correto: @gecapsbrasil
- Comecar com o hook pra prender atencao
- Terminar com CTA claro
- Entre 150-300 palavras
- Gerar 5-8 hashtags relevantes

Responda EXATAMENTE neste formato JSON:
{"caption": "texto da legenda aqui", "hashtags": "#tag1 #tag2 #tag3"}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return {
    caption: text,
    hashtags: "#gecaps #cosmeticos #marcapropria",
  };
}
