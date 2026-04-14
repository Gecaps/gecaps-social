import { NextResponse } from "next/server";
import { getPieceById, updatePiece } from "@/modules/pieces/queries";
import { validateTransition } from "@/modules/pieces/status-machine";
import type { PieceStatus } from "@/modules/accounts/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const piece = await getPieceById(id);
    if (!piece) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(piece);
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

    // Validate status transition if status field is present
    if (body.status) {
      const piece = await getPieceById(id);
      if (!piece) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      validateTransition(piece.status, body.status as PieceStatus);
    }

    const piece = await updatePiece(id, body);
    return NextResponse.json(piece);
  } catch (error) {
    const message = (error as Error).message;
    if (message.startsWith("Invalid transition")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
