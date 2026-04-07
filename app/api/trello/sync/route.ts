import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTrelloLists, parseListDate, parseListTopic, labelToPilar, cleanTrelloText } from "@/lib/trello";
import type { TrelloList } from "@/lib/trello";
import { sendTelegramMessage } from "@/lib/telegram";

async function syncTrello() {
  const boardId = process.env.TRELLO_BOARD_ID;
  if (!boardId) {
    return { error: "TRELLO_BOARD_ID not set", created: 0, skipped: 0 };
  }

  const { data: defaultAccount } = await supabase()
    .from("social_accounts")
    .select("id")
    .eq("handle", "@gecapsbrasil")
    .single();

  const lists: TrelloList[] = await getTrelloLists(boardId);
  let created = 0;
  let skipped = 0;

  for (const list of lists) {
    const date = parseListDate(list.name);
    if (!date) {
      skipped++;
      continue;
    }

    const topic = parseListTopic(list.name);

    for (const card of list.cards || []) {
      const { data: existing } = await supabase()
        .from("social_posts")
        .select("id")
        .eq("trello_card_id", card.id)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const pilar = labelToPilar(card.labels || []);
      const cardName = card.name; // "Feed", "Stories", etc
      const lines = card.desc?.split("\n").filter(Boolean) || [];
      const hook = cleanTrelloText(lines[0] || "");
      const cta = cleanTrelloText(lines[lines.length - 1] || "");

      // Build title from topic + card type
      // "Suplemento/ Curcuma" + "Feed" → "Curcuma" (use topic as title)
      const title = topic || cardName;
      const cardNameLower = cardName.toLowerCase();
      const format = cardNameLower.includes("stories") || cardNameLower.includes("story")
        ? "story"
        : cardNameLower.includes("carrossel") || cardNameLower.includes("carousel")
        ? "carrossel"
        : "estatico";
      const time = format === "story" ? "19:00" : "10:00";

      await supabase().from("social_posts").insert({
        title,
        hook,
        pilar,
        format,
        status: "pending",
        scheduled_date: date,
        scheduled_time: time,
        cta,
        trello_card_id: card.id,
        trello_list_name: list.name,
        account_id: defaultAccount?.id || null,
      });

      created++;
    }
  }

  if (created > 0) {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://social.gecaps.com.br";
    await sendTelegramMessage(
      `📱 <b>${created} novo(s) post(s) sincronizado(s) do Trello!</b>\n\n` +
      `👉 <a href="${baseUrl}/calendario">Ver no calendario</a>`
    );
  }

  return { created, skipped };
}

export async function GET() {
  try {
    const result = await syncTrello();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      message: `Sync concluido: ${result.created} criados, ${result.skipped} ignorados`,
      ...result,
    });
  } catch (e) {
    console.error("Trello sync error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
