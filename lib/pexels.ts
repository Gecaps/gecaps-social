import { createClient } from "pexels";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createClient(process.env.PEXELS_API_KEY || "");
  }
  return _client;
}

export interface PexelsPhoto {
  id: number;
  url: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
}

export async function searchPhotos(
  query: string,
  perPage = 8
): Promise<PexelsPhoto[]> {
  const client = getClient();
  const result = await client.photos.search({
    query,
    per_page: perPage,
    orientation: "portrait",
  });

  if ("photos" in result) {
    return result.photos.map((p) => ({
      id: p.id,
      url: p.url,
      src: p.src,
      alt: p.alt || "",
      photographer: p.photographer,
    }));
  }

  return [];
}
