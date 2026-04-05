import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTrelloLists, parseListDate, labelToPilar } from "@/lib/trello";
import type { TrelloList } from "@/lib/trello";

export async function POST() {
  try {
    const boardId = process.env.TRELLO_BOARD_ID;
    if (!boardId) {
      return NextResponse.json({ error: "TRELLO_BOARD_ID not set" }, { status: 500 });
    }

    const lists: TrelloList[] = await getTrelloLists(boardId);
    let created = 0;
    let skipped = 0;

    for (const list of lists) {
      const date = parseListDate(list.name);
      if (!date) {
        skipped++;
        continue;
      }

      for (const card of list.cards || []) {
        // Check if already synced
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
        const lines = card.desc?.split("\n").filter(Boolean) || [];
        const hook = lines[0] || "";
        const cta = lines[lines.length - 1] || "";

        await supabase().from("social_posts").insert({
          title: card.name,
          hook,
          pilar,
          format: "estatico",
          status: "pending",
          scheduled_date: date,
          scheduled_time: "10:00",
          cta,
          trello_card_id: card.id,
          trello_list_name: list.name,
        });

        created++;
      }
    }

    return NextResponse.json({
      message: `Sync concluido: ${created} criados, ${skipped} ignorados`,
      created,
      skipped,
    });
  } catch (e) {
    console.error("Trello sync error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
