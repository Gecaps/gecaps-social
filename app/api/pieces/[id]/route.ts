import { NextResponse } from "next/server";
import { after } from "next/server";
import { getPieceById, updatePiece } from "@/modules/pieces/queries";
import { validateTransition } from "@/modules/pieces/status-machine";
import type { PieceStatus } from "@/modules/accounts/types";
import { notifyStatusChange } from "@/lib/telegram";

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

    let previousStatus: PieceStatus | null = null;
    if (body.status) {
      const piece = await getPieceById(id);
      if (!piece) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      validateTransition(piece.status, body.status as PieceStatus);
      previousStatus = piece.status;
    }

    const piece = await updatePiece(id, body);

    if (previousStatus && piece.status !== previousStatus) {
      after(
        notifyStatusChange(
          {
            id: piece.id,
            title: piece.title,
            account_id: piece.account_id,
            format: piece.format,
            scheduled_date: piece.scheduled_date,
          },
          previousStatus,
          piece.status
        )
      );
    }

    return NextResponse.json(piece);
  } catch (error) {
    const message = (error as Error).message;
    if (message.startsWith("Invalid transition")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
