import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fb7185 0%, #ec4899 55%, #f97316 100%)",
        }}
      >
        <div
          style={{
            width: 410,
            height: 410,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderRadius: 112,
            background: "#fff7f7",
            border: "18px solid rgba(255,255,255,0.35)",
            boxShadow:
              "0 28px 70px rgba(136, 19, 55, 0.28)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 275,
              height: 275,
              borderRadius: 82,
              background:
                "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)",
            }}
          >
            <span
              style={{
                fontSize: 250,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -18,
                color: "#be123c",
                transform: "translateX(-6px)",
              }}
            >
              T
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              right: 48,
              bottom: 54,
              width: 126,
              height: 92,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 28,
              background: "#e11d48",
              border: "8px solid #fff7f7",
              transform: "rotate(-10deg)",
            }}
          >
            <span
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: "white",
              }}
            >
              ♥
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 52,
              top: 58,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#fbbf24",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}