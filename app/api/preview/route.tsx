import { ImageResponse } from "@vercel/og";

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
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Titulo do post";
  const hook = url.searchParams.get("hook") || "";
  const pilar = url.searchParams.get("pilar") || "educativo";
  const cta = url.searchParams.get("cta") || "";

  const pilarColor = PILAR_COLORS[pilar] || PILAR_COLORS.educativo;

  const interBold = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ90OmRA.ttf")
  ).then((res) => res.arrayBuffer());

  const interRegular = await fetch(
    new URL("https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.ttf")
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1350,
          background: "#f7faf7",
          fontFamily: "Inter",
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
              textTransform: "uppercase",
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
          {hook && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#43A047",
                letterSpacing: 5,
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              {hook.split(" ").slice(0, 6).join(" ").toUpperCase()}
            </div>
          )}

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
              maxWidth: 940,
            }}
          >
            {title}
          </div>

          {cta && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 15,
                fontWeight: 700,
                color: "#43A047",
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "16px 32px",
                border: "2.5px solid #43A047",
                borderRadius: 100,
                width: "fit-content",
                marginTop: 16,
              }}
            >
              {cta} →
            </div>
          )}
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

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "50px solid rgba(67,160,71,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 140,
            right: 50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(67,160,71,0.04)",
          }}
        />
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 800, style: "normal" },
      ],
    }
  );
}
