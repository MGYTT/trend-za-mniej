import {
  ImageResponse,
} from "next/og";

export const runtime =
  "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width:
            "100%",

          height:
            "100%",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "linear-gradient(135deg, #fb7185 0%, #ec4899 55%, #f97316 100%)",
        }}
      >
        <div
          style={{
            width:
              154,

            height:
              154,

            position:
              "relative",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              42,

            background:
              "#fff7f7",

            border:
              "6px solid rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              width:
                104,

              height:
                104,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                30,

              background:
                "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)",
            }}
          >
            <span
              style={{
                fontSize:
                  92,

                lineHeight:
                  1,

                fontWeight:
                  900,

                letterSpacing:
                  -7,

                color:
                  "#be123c",

                transform:
                  "translateX(-2px)",
              }}
            >
              T
            </span>
          </div>

          <div
            style={{
              position:
                "absolute",

              right:
                15,

              bottom:
                17,

              width:
                47,

              height:
                35,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                11,

              background:
                "#e11d48",

              border:
                "3px solid #fff7f7",

              transform:
                "rotate(-10deg)",
            }}
          >
            <span
              style={{
                fontSize:
                  20,

                fontWeight:
                  900,

                color:
                  "white",
              }}
            >
              ♥
            </span>
          </div>

          <div
            style={{
              position:
                "absolute",

              left:
                17,

              top:
                20,

              width:
                13,

              height:
                13,

              borderRadius:
                999,

              background:
                "#fbbf24",
            }}
          />
        </div>
      </div>
    ),
    {
      width:
        192,

      height:
        192,
    }
  );
}