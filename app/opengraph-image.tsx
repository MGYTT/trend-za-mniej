import {
  ImageResponse,
} from "next/og";

export const runtime =
  "nodejs";

export const alt =
  "Trend za Mniej - Moda i okazje";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems:
            "center",
          justifyContent:
            "center",
          overflow:
            "hidden",
          background:
            "linear-gradient(135deg, #ffe4e6 0%, #fdf2f8 48%, #ffedd5 100%)",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position:
              "absolute",
            width: 420,
            height: 420,
            borderRadius:
              "9999px",
            background:
              "rgba(251, 113, 133, 0.18)",
            left: -100,
            top: -120,
          }}
        />

        <div
          style={{
            position:
              "absolute",
            width: 380,
            height: 380,
            borderRadius:
              "9999px",
            background:
              "rgba(251, 146, 60, 0.15)",
            right: -80,
            bottom: -120,
          }}
        />

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            textAlign:
              "center",
            padding:
              "70px",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display:
                "flex",
              padding:
                "14px 26px",
              borderRadius:
                "999px",
              background:
                "rgba(255,255,255,0.8)",
              fontSize: 25,
              fontWeight:
                700,
              color:
                "#be123c",
              marginBottom:
                32,
            }}
          >
            ✨ Moda • okazje • znaleziska
          </div>

          <div
            style={{
              display:
                "flex",
              fontSize: 82,
              lineHeight: 1,
              fontWeight:
                900,
              letterSpacing:
                "-4px",
              color:
                "#1c1917",
            }}
          >
            Trend za Mniej
          </div>

          <div
            style={{
              display:
                "flex",
              marginTop:
                26,
              fontSize: 38,
              fontWeight:
                700,
              color:
                "#e11d48",
            }}
          >
            Modne rzeczy bez przepłacania
          </div>

          <div
            style={{
              display:
                "flex",
              marginTop:
                26,
              fontSize: 25,
              color:
                "#57534e",
            }}
          >
            Codziennie nowe modne perełki
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}