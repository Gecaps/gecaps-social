"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, X, Camera } from "lucide-react";

interface PexelsResult {
  id: number;
  url: string;
  urlLarge: string;
  alt: string;
  photographer: string;
}

interface PhotoSearchProps {
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export function PhotoSearch({ onSelect, currentUrl }: PhotoSearchProps) {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/pexels/search?q=${encodeURIComponent(query.trim())}&limit=12`
      );
      if (!res.ok) throw new Error("Erro na busca");
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSelect = (photo: PexelsResult) => {
    setSelectedId(photo.id);
    onSelect(photo.urlLarge);
  };

  const handleClear = () => {
    setSelectedId(null);
    onSelect("");
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar fotos... ex: suplementos, modelo, fitness"
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
          Buscar
        </button>
      </div>

      {/* Current image indicator */}
      {currentUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="size-10 rounded overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Imagem selecionada"
              className="size-full object-cover"
            />
          </div>
          <span className="text-xs text-muted-foreground flex-1 truncate">
            Imagem selecionada
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Results grid */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => handleSelect(photo)}
              className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                selectedId === photo.id
                  ? "border-primary shadow-[0_0_10px_var(--glow-primary)]"
                  : "border-transparent hover:border-primary/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.alt}
                className="size-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white/80 truncate">
                  {photo.photographer}
                </p>
              </div>
              {selectedId === photo.id && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="size-3.5 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && searched && photos.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Nenhuma foto encontrada. Tente outro termo.
          </p>
        </div>
      )}

      {!searched && !currentUrl && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Busque fotos profissionais gratuitas do Pexels
          </p>
        </div>
      )}

      {/* Manual URL fallback */}
      <details className="group">
        <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          Ou cole uma URL manualmente
        </summary>
        <input
          type="url"
          value={currentUrl ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="https://..."
        />
      </details>
    </div>
  );
}
