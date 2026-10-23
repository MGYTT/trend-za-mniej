import { ImageResponse } from "next/og";

// Jedna, kontrastowa litera marki – czytelna także w wyniku Google.
export const runtime = "nodejs";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e11d48",
        borderRadius: 80,
        fontFamily: "Arial, sans-serif",
      }}>
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 365,
          fontWeight: 900,
          letterSpacing: -25,
          lineHeight: 1,
          color: "#ffffff",
          transform: "translateX(-9px)",
        }}>T</span>
      </div>
    ),
    size
  );
}
