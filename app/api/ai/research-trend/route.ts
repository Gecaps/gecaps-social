import { NextResponse } from "next/server";
import { createResearch } from "@/modules/research/queries";
import { executeResearch } from "@/modules/ai/pipeline";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { account_id, query } = await req.json();
    if (!account_id || !query) {
      return NextResponse.json(
        { error: "account_id and query are required" },
        { status: 400 }
      );
    }

    const session = await createResearch({ account_id, query });
    const completed = await executeResearch(session.id);

    return NextResponse.json(completed, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
