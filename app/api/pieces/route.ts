import { NextResponse } from "next/server";
import { listPieces, createPiece } from "@/modules/pieces/queries";
import type { PieceStatus } from "@/modules/accounts/types";

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

    const status = searchParams.get("status") as PieceStatus | null;
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    const pieces = await listPieces(accountId, {
      status: status ?? undefined,
      limit,
    });
    return NextResponse.json(pieces);
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
    const piece = await createPiece(body);
    return NextResponse.json(piece, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
