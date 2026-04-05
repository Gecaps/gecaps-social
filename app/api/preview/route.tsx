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

    const pilarColor = PILAR_COLORS[pilar] || PILAR_COLORS.educativo;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#f7faf7",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              height: 7,
              background: "linear-gradient(90deg, #2E7D32, #43A047, #66BB6A, #43A047, #2E7D32)",
              width: "100%",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 64px 0",
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#43A047",
                letterSpacing: 2,
              }}
            >
              GECAPS
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                background: pilarColor,
                padding: "8px 24px",
                borderRadius: 100,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
              }}
            >
              {pilar}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 64px",
            }}
          >
            {hook ? (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#43A047",
                  letterSpacing: 5,
                  textTransform: "uppercase" as const,
                  marginBottom: 18,
                }}
              >
                {hook.split(" ").slice(0, 6).join(" ").toUpperCase()}
              </div>
            ) : null}

            <div
              style={{
                width: 56,
                height: 4,
                background: "#43A047",
                borderRadius: 2,
                marginBottom: 32,
              }}
            />

            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: "#1B2A1B",
                lineHeight: 1.12,
                letterSpacing: -1.5,
                marginBottom: 24,
              }}
            >
              {title}
            </div>

            {cta ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#43A047",
                  letterSpacing: 1,
                  textTransform: "uppercase" as const,
                  padding: "16px 32px",
                  border: "2.5px solid #43A047",
                  borderRadius: 100,
                }}
              >
                {cta} →
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 64px 44px",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, color: "#43A047" }}>
              @gecapsbrasil
            </div>
            <div style={{ fontSize: 13, color: "#9CA89C", letterSpacing: 1 }}>
              GECAPS · Cosmeticos & Suplementos
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
      }
    );
  } catch (e) {
    console.error("Preview error:", e);
    return new Response(`Error: ${e instanceof Error ? e.message : "Unknown"}`, {
      status: 500,
    });
  }
}
