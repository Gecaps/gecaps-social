import { NextResponse } from "next/server";
import { generateText } from "@/modules/ai/client";
import { buildSystemPrompt } from "@/modules/playbook/prompt-builder";
import { getPlaybookByAccountId } from "@/modules/playbook/queries";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { title, hook, pilar, cta, account_id } = await req.json();
    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const playbook = account_id
      ? await getPlaybookByAccountId(account_id)
      : null;
    const systemPrompt = buildSystemPrompt(playbook);

    const userPrompt = `Gere uma legenda completa para Instagram com base nas informacoes abaixo.

## Dados do post
- Titulo: ${title}
- Hook: ${hook ?? "Nao definido"}
- Pilar: ${pilar ?? "Nao definido"}
- CTA: ${cta ?? "Nao definido"}

## Regras
- Legenda formatada para Instagram com quebras de linha
- Inclua emojis estrategicos (sem exagero)
- Comece com um hook forte
- Termine com um CTA claro
- Inclua 5-10 hashtags relevantes no final
- Retorne APENAS a legenda pronta, sem explicacoes`;

    const caption = await generateText(systemPrompt, userPrompt);
    return NextResponse.json({ caption });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
