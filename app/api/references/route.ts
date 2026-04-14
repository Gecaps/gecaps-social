import { NextResponse } from "next/server";
import {
  listReferences,
  createReference,
} from "@/modules/references/queries";
import { extractContent } from "@/modules/references/extractor";
import type { ReferenceType, ReferenceStatus } from "@/modules/references/types";

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

    const status = searchParams.get("status") as string | null;
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    const references = await listReferences(accountId, {
      status: (status as ReferenceStatus) ?? undefined,
      limit,
    });
    return NextResponse.json(references);
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

    // Auto-extract content for link and pdf types
    if (
      (body.type === "link" || body.type === "pdf") &&
      (body.source_url || body.file_url) &&
      !body.raw_content
    ) {
      const source = body.source_url || body.file_url;
      body.raw_content = await extractContent(
        body.type as ReferenceType,
        source
      );
    }

    const ref = await createReference(body);
    return NextResponse.json(ref, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
