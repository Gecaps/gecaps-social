import { NextResponse } from "next/server";
import { getIdeaById, updateIdeaStatus } from "@/modules/ideas/queries";
import type { IdeaStatus } from "@/modules/ideas/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const idea = await getIdeaById(id);
    if (!idea) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(idea);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    if (!body.status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }
    const idea = await updateIdeaStatus(id, body.status as IdeaStatus);
    return NextResponse.json(idea);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
