import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const PILAR_COLORS: Record<string, string> = {
  educativo: "#0891B2",
  autoridade: "#9333EA",
  produto: "#E11D63",
  conexao: "#D97706",
  "social-proof": "#059669",
  objecao: "#EA580C",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "Titulo do post";
    const hook = url.searchParams.get("hook") || "";
    const pilar = url.searchParams.get("pilar") || "educativo";
    const cta = url.searchParams.get("cta") || "";
    const layout = url.searchParams.get("layout") || "branco";
    const handle = url.searchParams.get("handle") || "@gecapsbrasil";

    const w = parseInt(url.searchParams.get("w") || "1080");
    const baseHeight = layout === "quote" ? 1080 : 1350;
    const scale = w / 1080;
    const h = Math.round(baseHeight * scale);

    const pilarColor = PILAR_COLORS[pilar] || PILAR_COLORS.educativo;
    const props = { title, hook, pilar, cta, pilarColor, handle };
    const size = { width: w, height: h };

    let response: Response;
    if (layout === "verde") response = renderVerde(props, size);
    else if (layout === "quote") response = renderQuote(props, size);
    else if (layout === "foto") response = renderFoto(props, size);
    else response = renderBranco(props, size);

    // Cache thumbnails for 1 hour
    if (w < 1080) {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    }

    return response;
  } catch (e) {
    console.error("Preview error:", e);
    return new Response(`Error: ${e instanceof Error ? e.message : "Unknown"}`, { status: 500 });
  }
}

interface TemplateProps {
  title: string;
  hook: string;
  pilar?: string;
  cta: string;
  pilarColor?: string;
  handle: string;
}

interface Size {
  width: number;
  height: number;
}

// ── Layout 1: Branco ──
function renderBranco({ title, hook, pilar, cta, pilarColor, handle }: TemplateProps, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#f7faf7", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ height: 7, background: "linear-gradient(90deg, #2E7D32, #43A047, #66BB6A, #43A047, #2E7D32)", width: "100%" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 64px 0" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#43A047", letterSpacing: 2 }}>GECAPS</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: pilarColor, padding: "8px 24px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const }}>{pilar}</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
          {hook ? <div style={{ fontSize: 13, fontWeight: 700, color: "#43A047", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18 }}>{hook.split(" ").slice(0, 6).join(" ").toUpperCase()}</div> : null}
          <div style={{ width: 56, height: 4, background: "#43A047", borderRadius: 2, marginBottom: 32 }} />
          <div style={{ fontSize: 58, fontWeight: 800, color: "#1B2A1B", lineHeight: 1.12, letterSpacing: -1.5, marginBottom: 24 }}>{title}</div>
          {cta ? <div style={{ display: "flex", alignItems: "center", fontSize: 15, fontWeight: 700, color: "#43A047", letterSpacing: 1, textTransform: "uppercase" as const, padding: "16px 32px", border: "2.5px solid #43A047", borderRadius: 100 }}>{cta} →</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 64px 44px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#43A047" }}>{handle}</div>
          <div style={{ fontSize: 13, color: "#9CA89C", letterSpacing: 1 }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
        <div style={{ position: "absolute", top: -70, right: -70, width: 300, height: 300, borderRadius: "50%", border: "50px solid rgba(67,160,71,0.06)" }} />
        <div style={{ position: "absolute", bottom: 140, right: 50, width: 180, height: 180, borderRadius: "50%", background: "rgba(67,160,71,0.04)" }} />
      </div>
    ),
    size
  );
}

// ── Layout 2: Verde ──
function renderVerde({ title, hook, pilar, cta, handle }: TemplateProps, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(170deg, #1B5E20 0%, #2E7D32 35%, #388E3C 65%, #2E7D32 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ height: 5, background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1))", width: "100%" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 64px 0" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>GECAPS</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E7D32", background: "#fff", padding: "8px 24px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const }}>{pilar}</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
          {hook ? <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 18 }}>{hook.split(" ").slice(0, 6).join(" ").toUpperCase()}</div> : null}
          <div style={{ width: 56, height: 4, background: "rgba(255,255,255,0.5)", borderRadius: 2, marginBottom: 32 }} />
          <div style={{ fontSize: 58, fontWeight: 800, color: "#fff", lineHeight: 1.12, letterSpacing: -1.5, marginBottom: 24 }}>{title}</div>
          {cta ? <div style={{ display: "flex", alignItems: "center", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase" as const, padding: "16px 32px", border: "2.5px solid rgba(255,255,255,0.5)", borderRadius: 100 }}>{cta} →</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 64px 44px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{handle}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "50px solid rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: 130, right: 40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      </div>
    ),
    size
  );
}

// ── Layout 3: Quote ──
function renderQuote({ title, hook, handle }: TemplateProps, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0f0f1a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, color: "#f5f5f5", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 40, left: 40, right: 40, bottom: 40, border: "1px solid rgba(201,169,110,0.15)", display: "flex" }} />
        <div style={{ position: "absolute", top: 35, left: 35, width: 30, height: 30, borderTop: "2px solid #c9a96e", borderLeft: "2px solid #c9a96e", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 35, right: 35, width: 30, height: 30, borderBottom: "2px solid #c9a96e", borderRight: "2px solid #c9a96e", display: "flex" }} />
        <div style={{ position: "absolute", top: 60, fontSize: 20, fontWeight: 700, color: "#c9a96e", letterSpacing: 4, textTransform: "uppercase" as const, display: "flex" }}>GECAPS</div>
        <div style={{ position: "absolute", top: 120, left: 80, fontSize: 180, fontWeight: 900, color: "rgba(201,169,110,0.1)", lineHeight: 1, display: "flex" }}>&ldquo;</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: "#f5f5f5", lineHeight: 1.3, marginBottom: 40, maxWidth: 800, display: "flex", textAlign: "center" }}>{title}</div>
        <div style={{ width: 60, height: 2, background: "#c9a96e", marginBottom: 30, display: "flex" }} />
        {hook ? <div style={{ fontSize: 18, color: "rgba(245,245,245,0.6)", letterSpacing: 2, marginBottom: 20, display: "flex" }}>{hook}</div> : null}
        <div style={{ position: "absolute", bottom: 60, fontSize: 15, fontWeight: 600, color: "#c9a96e", letterSpacing: 2, display: "flex" }}>{handle}</div>
      </div>
    ),
    size
  );
}

// ── Layout 4: Foto Premium (overlay verde sobre fundo escuro) ──
function renderFoto({ title, hook, pilar, cta, handle }: TemplateProps, size: Size) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1a2e1a 0%, #0d1f0d 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        {/* Simulated photo area (top half - dark with texture) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "60%", background: "linear-gradient(135deg, #2a3a2a 0%, #1a2a1a 30%, #0f1f0f 60%, #1a2e1a 100%)", display: "flex" }} />
        {/* Green gradient overlay from bottom */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, rgba(27,94,32,0.0) 0%, rgba(27,94,32,0.05) 20%, rgba(27,94,32,0.3) 40%, rgba(27,94,32,0.75) 55%, rgba(27,94,32,0.92) 70%, rgba(21,71,24,0.97) 100%)", display: "flex" }} />
        {/* Top overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 120, background: "linear-gradient(180deg, rgba(21,71,24,0.6) 0%, transparent 100%)", display: "flex" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 60px 0", position: "relative", zIndex: 3 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>GECAPS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1B5E20", background: "rgba(255,255,255,0.92)", padding: "7px 20px", borderRadius: 100, letterSpacing: 2, textTransform: "uppercase" as const }}>{pilar}</div>
        </div>

        {/* Content - pushed to bottom */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 60px", position: "relative", zIndex: 3 }}>
          {hook ? <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 14 }}>{hook.split(" ").slice(0, 6).join(" ").toUpperCase()}</div> : null}
          <div style={{ width: 48, height: 3, background: "#66BB6A", borderRadius: 2, marginBottom: 24 }} />
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1.12, letterSpacing: -1, marginBottom: 18 }}>{title}</div>
          {cta ? (
            <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" as const, padding: "14px 28px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 100, background: "rgba(255,255,255,0.06)", marginBottom: 70 }}>{cta} →</div>
          ) : (
            <div style={{ marginBottom: 70, display: "flex" }} />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 60px 40px", position: "relative", zIndex: 3 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#66BB6A" }}>{handle}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>

        {/* Decorative circle */}
        <div style={{ position: "absolute", bottom: 200, right: -40, width: 200, height: 200, borderRadius: "50%", border: "40px solid rgba(255,255,255,0.03)", display: "flex" }} />
      </div>
    ),
    size
  );
}
