import { NextResponse } from "next/server";
import { listIdeas, createIdea } from "@/modules/ideas/queries";
import type { IdeaStatus } from "@/modules/ideas/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account_id");
    if (!accountId) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    const status = searchParams.get("status") as IdeaStatus | null;
    const referenceId = searchParams.get("reference_id");

    const ideas = await listIdeas(accountId, {
      status: status ?? undefined,
      referenceId: referenceId ?? undefined,
    });
    return NextResponse.json(ideas);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea = await createIdea(body);
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
