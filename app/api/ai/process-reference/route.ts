import { NextResponse } from "next/server";
import { processReference } from "@/modules/ai/pipeline";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { reference_id } = await req.json();
    if (!reference_id) {
      return NextResponse.json(
        { error: "reference_id is required" },
        { status: 400 }
      );
    }

    const result = await processReference(reference_id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
