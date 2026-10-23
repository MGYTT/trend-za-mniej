import { ImageResponse } from "next/og";

// Jedna, kontrastowa litera marki – czytelna także w wyniku Google.
export const runtime = "nodejs";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e11d48",
        borderRadius: 28,
        fontFamily: "Arial, sans-serif",
      }}>
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 128,
          fontWeight: 900,
          letterSpacing: -9,
          lineHeight: 1,
          color: "#ffffff",
          transform: "translateX(-3px)",
        }}>T</span>
      </div>
    ),
    size
  );
}
