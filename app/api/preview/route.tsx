import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const PILAR_LABELS: Record<string, string> = {
  educativo: "Educativo",
  autoridade: "Autoridade",
  produto: "Produto",
  conexao: "Conexao",
  "social-proof": "Social Proof",
  objecao: "Objecao",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "Titulo do post";
    const subtitle = url.searchParams.get("subtitle") || "";
    const hook = url.searchParams.get("hook") || "";
    const pilar = url.searchParams.get("pilar") || "educativo";
    const tags = url.searchParams.get("tags") || "";
    const cta = url.searchParams.get("cta") || "";
    const layout = url.searchParams.get("layout") || "branco";
    const handle = url.searchParams.get("handle") || "@gecapsbrasil";
    const highlight = url.searchParams.get("highlight") || "";
    const bigNum = url.searchParams.get("bigNum") || "";
    const w = parseInt(url.searchParams.get("w") || "1080");

    const baseH = layout === "quote" ? 1080 : 1350;
    const scale = w / 1080;
    const h = Math.round(baseH * scale);
    const size = { width: w, height: h };

    const badge = PILAR_LABELS[pilar] || pilar;
    const props = { title, subtitle, hook, tags, cta, handle, badge, highlight, bigNum };

    let response: Response;
    if (layout === "verde") response = renderVerde(props, size);
    else if (layout === "quote") response = renderQuote(props, size);
    else if (layout === "foto") response = renderFoto(props, size);
    else response = renderBranco(props, size);

    if (w < 1080) {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    }
    return response;
  } catch (e) {
    console.error("Preview error:", e);
    return new Response(`Error: ${e instanceof Error ? e.message : "Unknown"}`, { status: 500 });
  }
}

interface Props {
  title: string;
  subtitle: string;
  hook: string;
  tags: string;
  cta: string;
  handle: string;
  badge: string;
  highlight: string;
  bigNum: string;
}

interface Size { width: number; height: number; }

// Helper: render title with highlighted words
function renderTitle(title: string, highlight: string, color: string, hlBg: string, hlColor: string) {
  if (!highlight) {
    return <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1.1, letterSpacing: -1.5 }}>{title}</div>;
  }
  const words = highlight.split(",").map(w => w.trim().toLowerCase());
  const parts = title.split(" ");
  return (
    <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1.15, letterSpacing: -1.5, display: "flex", flexWrap: "wrap", gap: "0 10px" }}>
      {parts.map((word, i) => {
        const isHl = words.some(h => word.toLowerCase().includes(h));
        return isHl ? (
          <span key={i} style={{ background: hlBg, color: hlColor, padding: "2px 14px 6px", borderRadius: 8 }}>{word}</span>
        ) : (
          <span key={i}>{word}</span>
        );
      })}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BRANCO — Fiel ao template aprovado
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderBranco(p: Props, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#f7faf7", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>
        {/* Top bar */}
        <div style={{ height: 7, background: "linear-gradient(90deg, #2E7D32, #43A047, #66BB6A, #43A047, #2E7D32)", width: "100%", display: "flex" }} />

        {/* Decorative big number */}
        {p.bigNum ? (
          <div style={{ position: "absolute", right: 40, top: 200, fontSize: 380, fontWeight: 900, color: "rgba(67,160,71,0.06)", lineHeight: 1, letterSpacing: -15, display: "flex" }}>{p.bigNum}</div>
        ) : null}

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -70, right: -70, width: 300, height: 300, borderRadius: "50%", border: "50px solid rgba(67,160,71,0.06)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 140, right: 50, width: 180, height: 180, borderRadius: "50%", background: "rgba(67,160,71,0.04)", display: "flex" }} />
        <div style={{ position: "absolute", top: 250, left: -60, width: 140, height: 140, borderRadius: "50%", background: "rgba(67,160,71,0.03)", display: "flex" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 64px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#43A047", letterSpacing: 2, display: "flex" }}>GECAPS</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#43A047", padding: "8px 22px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const, display: "flex" }}>{p.badge}</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", position: "relative", zIndex: 2 }}>
          {/* Tags */}
          {p.tags ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: "#43A047", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18, display: "flex" }}>{p.tags}</div>
          ) : p.hook ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: "#43A047", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18, display: "flex" }}>{p.hook.split(" ").slice(0, 5).join(" ").toUpperCase()}</div>
          ) : null}

          {/* Green bar */}
          <div style={{ width: 56, height: 5, background: "#43A047", borderRadius: 3, marginBottom: 28, display: "flex" }} />

          {/* Title with highlights */}
          {renderTitle(p.title, p.highlight, "#1a1a1a", "linear-gradient(135deg, #388E3C, #2E7D32)", "#fff")}

          {/* Subtitle */}
          {p.subtitle ? (
            <div style={{ fontSize: 22, fontWeight: 400, color: "#666", lineHeight: 1.55, maxWidth: 750, marginTop: 24, display: "flex" }}>{p.subtitle}</div>
          ) : null}

          {/* CTA */}
          {p.cta ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 700, color: "#43A047", letterSpacing: 1, textTransform: "uppercase" as const, padding: "16px 32px", border: "2.5px solid #43A047", borderRadius: 100, marginTop: 32, width: "fit-content" }}>{p.cta} →</div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 64px 44px", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#43A047", display: "flex" }}>{p.handle}</div>
          <div style={{ fontSize: 13, color: "#9CA89C", letterSpacing: 1, display: "flex" }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
      </div>
    ),
    size
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERDE — Fundo gradiente verde
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderVerde(p: Props, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(170deg, #1B5E20 0%, #2E7D32 35%, #388E3C 65%, #2E7D32 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>
        <div style={{ height: 5, background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1))", width: "100%", display: "flex" }} />

        {/* Big number */}
        {p.bigNum ? (
          <div style={{ position: "absolute", right: 30, top: 200, fontSize: 400, fontWeight: 900, color: "rgba(255,255,255,0.05)", lineHeight: 1, letterSpacing: -15, display: "flex" }}>{p.bigNum}</div>
        ) : null}

        {/* Decorations */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "50px solid rgba(255,255,255,0.04)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 130, right: 40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 64px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 2, display: "flex" }}>GECAPS</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E7D32", background: "#fff", padding: "8px 22px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const, display: "flex" }}>{p.badge}</div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", position: "relative", zIndex: 2 }}>
          {p.tags ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18, display: "flex" }}>{p.tags}</div>
          ) : p.hook ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18, display: "flex" }}>{p.hook.split(" ").slice(0, 5).join(" ").toUpperCase()}</div>
          ) : null}

          <div style={{ width: 56, height: 5, background: "rgba(255,255,255,0.5)", borderRadius: 3, marginBottom: 28, display: "flex" }} />

          {renderTitle(p.title, p.highlight, "#fff", "#fff", "#2E7D32")}

          {p.subtitle ? (
            <div style={{ fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, maxWidth: 750, marginTop: 24, display: "flex" }}>{p.subtitle}</div>
          ) : null}

          {p.cta ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase" as const, padding: "16px 32px", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 100, marginTop: 32, width: "fit-content" }}>{p.cta} →</div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 64px 44px", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.9)", display: "flex" }}>{p.handle}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1, display: "flex" }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
      </div>
    ),
    size
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUOTE — Luxo escuro com moldura dourada
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderQuote(p: Props, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0f0f1a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, color: "#f5f5f5", position: "relative", overflow: "hidden", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 40, left: 40, right: 40, bottom: 40, border: "1px solid rgba(201,169,110,0.15)", display: "flex" }} />
        <div style={{ position: "absolute", top: 35, left: 35, width: 30, height: 30, borderTop: "2px solid #c9a96e", borderLeft: "2px solid #c9a96e", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 35, right: 35, width: 30, height: 30, borderBottom: "2px solid #c9a96e", borderRight: "2px solid #c9a96e", display: "flex" }} />
        <div style={{ position: "absolute", top: 60, fontSize: 20, fontWeight: 700, color: "#c9a96e", letterSpacing: 4, textTransform: "uppercase" as const, display: "flex" }}>GECAPS</div>
        <div style={{ position: "absolute", top: 120, left: 80, fontSize: 180, fontWeight: 900, color: "rgba(201,169,110,0.1)", lineHeight: 1, display: "flex" }}>&ldquo;</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#f5f5f5", lineHeight: 1.3, marginBottom: 40, maxWidth: 800, display: "flex", textAlign: "center" }}>{p.title}</div>
        <div style={{ width: 60, height: 2, background: "#c9a96e", marginBottom: 30, display: "flex" }} />
        {p.hook ? <div style={{ fontSize: 18, color: "rgba(245,245,245,0.6)", letterSpacing: 2, marginBottom: 20, display: "flex" }}>{p.hook}</div> : null}
        <div style={{ position: "absolute", bottom: 60, fontSize: 15, fontWeight: 600, color: "#c9a96e", letterSpacing: 2, display: "flex" }}>{p.handle}</div>
      </div>
    ),
    size
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FOTO — Overlay verde premium
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderFoto(p: Props, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1a2e1a 0%, #0d1f0d 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "60%", background: "linear-gradient(135deg, #2a3a2a 0%, #1a2a1a 30%, #0f1f0f 60%, #1a2e1a 100%)", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, rgba(27,94,32,0.0) 0%, rgba(27,94,32,0.05) 20%, rgba(27,94,32,0.3) 40%, rgba(27,94,32,0.75) 55%, rgba(27,94,32,0.92) 70%, rgba(21,71,24,0.97) 100%)", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 120, background: "linear-gradient(180deg, rgba(21,71,24,0.6) 0%, transparent 100%)", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 60px 0", position: "relative", zIndex: 3 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 2, display: "flex" }}>GECAPS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1B5E20", background: "rgba(255,255,255,0.92)", padding: "7px 20px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const, display: "flex" }}>{p.badge}</div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 60px", position: "relative", zIndex: 3 }}>
          {p.tags ? (
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 14, display: "flex" }}>{p.tags}</div>
          ) : null}
          <div style={{ width: 48, height: 3, background: "#66BB6A", borderRadius: 2, marginBottom: 24, display: "flex" }} />

          {renderTitle(p.title, p.highlight, "#fff", "#fff", "#1B5E20")}

          {p.subtitle ? (
            <div style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, maxWidth: 680, marginTop: 18, display: "flex" }}>{p.subtitle}</div>
          ) : null}

          {p.cta ? (
            <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" as const, padding: "14px 28px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 100, background: "rgba(255,255,255,0.06)", marginTop: 24, marginBottom: 70, width: "fit-content" }}>{p.cta} →</div>
          ) : (
            <div style={{ marginBottom: 70, display: "flex" }} />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 60px 40px", position: "relative", zIndex: 3 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#66BB6A", display: "flex" }}>{p.handle}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1, display: "flex" }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
      </div>
    ),
    size
  );
}
