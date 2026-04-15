import { NextResponse } from "next/server";
import { listResearch } from "@/modules/research/queries";

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

    const sessions = await listResearch(accountId);
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
