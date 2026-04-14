import { NextResponse } from "next/server";
import {
  getReferenceById,
  deleteReference,
} from "@/modules/references/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const ref = await getReferenceById(id);
    if (!ref) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(ref);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteReference(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
