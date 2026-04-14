import { NextResponse } from "next/server";
import { listMetricsByAccount, upsertMetrics } from "@/modules/metrics/queries";

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

    const metrics = await listMetricsByAccount(accountId);
    return NextResponse.json(metrics);
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
    if (!body.piece_id) {
      return NextResponse.json(
        { error: "piece_id is required" },
        { status: 400 }
      );
    }

    const metrics = await upsertMetrics(body);
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
