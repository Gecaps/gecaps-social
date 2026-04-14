import { NextResponse } from "next/server";
import { generatePieceFromIdea } from "@/modules/ai/pipeline";
import { getIdeaById } from "@/modules/ideas/queries";
import { listPieces } from "@/modules/pieces/queries";
import type { Piece } from "@/modules/pieces/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { idea_id } = await req.json();
    if (!idea_id) {
      return NextResponse.json(
        { error: "idea_id is required" },
        { status: 400 }
      );
    }

    // Fetch top 5 published pieces for style reference
    const idea = await getIdeaById(idea_id);
    let topPosts: Piece[] = [];
    if (idea) {
      topPosts = await listPieces(idea.account_id, {
        status: "published",
        limit: 5,
      });
    }

    const piece = await generatePieceFromIdea(idea_id, topPosts);
    return NextResponse.json(piece, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
