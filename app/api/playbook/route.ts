import { NextResponse } from "next/server";
import {
  getPlaybookByAccountId,
  upsertPlaybook,
} from "@/modules/playbook/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");

  if (!accountId) {
    return NextResponse.json(
      { error: "account_id is required" },
      { status: 400 }
    );
  }

  try {
    const playbook = await getPlaybookByAccountId(accountId);
    if (!playbook) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(playbook);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { account_id, ...fields } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    const playbook = await upsertPlaybook(account_id, fields);
    return NextResponse.json(playbook);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
