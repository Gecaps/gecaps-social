import { NextResponse } from "next/server";
import {
  generateIdeasFromReference,
  generateIdeasFromResearch,
} from "@/modules/ai/pipeline";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { reference_id, research_id } = await req.json();

    if (!reference_id && !research_id) {
      return NextResponse.json(
        { error: "reference_id or research_id is required" },
        { status: 400 }
      );
    }

    const ideas = research_id
      ? await generateIdeasFromResearch(research_id)
      : await generateIdeasFromReference(reference_id);

    return NextResponse.json(ideas, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
