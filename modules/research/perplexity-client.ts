export async function searchWithPerplexity(
  query: string
): Promise<{ text: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not set");

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "Você é um pesquisador de tendências de redes sociais. Responda sempre em português brasileiro.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || [];

  return { text, citations };
}
