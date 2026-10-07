import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
            width: 148,
            height: 148,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderRadius: 42,
            background: "#fff7f7",
          }}
        >
          <span
            style={{
              fontSize: 112,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: -8,
              color: "#be123c",
              transform: "translateX(-3px)",
            }}
          >
            T
          </span>

          <div
            style={{
              position: "absolute",
              right: 13,
              bottom: 14,
              width: 47,
              height: 35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "#e11d48",
              border: "3px solid #fff7f7",
              transform: "rotate(-10deg)",
            }}
          >
            <span
              style={{
                fontSize: 19,
                fontWeight: 900,
                color: "white",
              }}
            >
              ♥
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
