import { NextResponse } from "next/server";
import { generateInsights } from "@/modules/ai/pipeline";
import { supabase } from "@/lib/supabase";
import type { Piece } from "@/modules/pieces/types";
import type { Metrics } from "@/modules/metrics/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { account_id } = await req.json();
    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    // Fetch published pieces with their metrics
    const { data: pieces, error: piecesError } = await supabase()
      .from("social_pieces")
      .select("*")
      .eq("account_id", account_id)
      .eq("status", "published")
      .order("published_date", { ascending: false })
      .limit(30);

    if (piecesError) throw piecesError;
    if (!pieces || pieces.length === 0) {
      return NextResponse.json(
        { error: "No published pieces found for this account" },
        { status: 404 }
      );
    }

    const pieceIds = pieces.map((p: Piece) => p.id);
    const { data: metrics, error: metricsError } = await supabase()
      .from("social_metrics")
      .select("*")
      .in("piece_id", pieceIds);

    if (metricsError) throw metricsError;

    const metricsMap = new Map(
      (metrics ?? []).map((m: Metrics) => [m.piece_id, m])
    );

    const piecesWithMetrics = pieces
      .filter((p: Piece) => metricsMap.has(p.id))
      .map((p: Piece) => ({
        ...p,
        metrics: metricsMap.get(p.id)!,
      }));

    if (piecesWithMetrics.length === 0) {
      return NextResponse.json(
        { error: "No pieces with metrics found" },
        { status: 404 }
      );
    }

    const insights = await generateInsights(account_id, piecesWithMetrics);
    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
