import { NextResponse } from "next/server";
import { searchPhotos } from "@/lib/pexels";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "cosmetics supplement";
    const perPage = parseInt(url.searchParams.get("limit") || "8");

    const photos = await searchPhotos(query, perPage);

    return NextResponse.json({
      photos: photos.map((p) => ({
        id: p.id,
        url: p.src.medium,
        urlLarge: p.src.large,
        alt: p.alt,
        photographer: p.photographer,
      })),
    });
  } catch (e) {
    console.error("Pexels search error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
