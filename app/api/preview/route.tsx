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

    const pilarColor = PILAR_COLORS[pilar] || PILAR_COLORS.educativo;

    if (layout === "verde") return renderVerde({ title, hook, pilar, cta, pilarColor });
    if (layout === "quote") return renderQuote({ title, hook, cta });
    return renderBranco({ title, hook, pilar, cta, pilarColor });
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
}

function renderBranco({ title, hook, pilar, cta, pilarColor }: TemplateProps) {
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
          <div style={{ fontSize: 17, fontWeight: 700, color: "#43A047" }}>@gecapsbrasil</div>
          <div style={{ fontSize: 13, color: "#9CA89C", letterSpacing: 1 }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
        <div style={{ position: "absolute", top: -70, right: -70, width: 300, height: 300, borderRadius: "50%", border: "50px solid rgba(67,160,71,0.06)" }} />
        <div style={{ position: "absolute", bottom: 140, right: 50, width: 180, height: 180, borderRadius: "50%", background: "rgba(67,160,71,0.04)" }} />
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}

function renderVerde({ title, hook, pilar, cta, pilarColor }: TemplateProps) {
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
          <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>@gecapsbrasil</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>GECAPS · Cosmeticos & Suplementos</div>
        </div>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "50px solid rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: 130, right: 40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}

function renderQuote({ title, hook, cta }: TemplateProps) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0f0f1a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, color: "#f5f5f5", position: "relative", overflow: "hidden", textAlign: "center" }}>
        {/* Gold frame */}
        <div style={{ position: "absolute", top: 40, left: 40, right: 40, bottom: 40, border: "1px solid rgba(201,169,110,0.15)", display: "flex" }} />
        {/* Corner decorations */}
        <div style={{ position: "absolute", top: 35, left: 35, width: 30, height: 30, borderTop: "2px solid #c9a96e", borderLeft: "2px solid #c9a96e", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 35, right: 35, width: 30, height: 30, borderBottom: "2px solid #c9a96e", borderRight: "2px solid #c9a96e", display: "flex" }} />
        {/* Brand */}
        <div style={{ position: "absolute", top: 60, fontSize: 20, fontWeight: 700, color: "#c9a96e", letterSpacing: 4, textTransform: "uppercase" as const, display: "flex" }}>GECAPS</div>
        {/* Big quote mark */}
        <div style={{ position: "absolute", top: 120, left: 80, fontSize: 180, fontWeight: 900, color: "rgba(201,169,110,0.1)", lineHeight: 1, display: "flex" }}>&ldquo;</div>
        {/* Quote text */}
        <div style={{ fontSize: 46, fontWeight: 700, color: "#f5f5f5", lineHeight: 1.3, marginBottom: 40, maxWidth: 800, display: "flex", textAlign: "center" }}>{title}</div>
        {/* Divider */}
        <div style={{ width: 60, height: 2, background: "#c9a96e", marginBottom: 30, display: "flex" }} />
        {/* Subtitle / hook */}
        {hook ? <div style={{ fontSize: 18, color: "rgba(245,245,245,0.6)", letterSpacing: 2, marginBottom: 20, display: "flex" }}>{hook}</div> : null}
        {/* Handle */}
        <div style={{ position: "absolute", bottom: 60, fontSize: 15, fontWeight: 600, color: "#c9a96e", letterSpacing: 2, display: "flex" }}>@gecapsbrasil</div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
