import {
  ImageResponse,
} from "next/og";

import {
  formatPrice,
  getProductBySlug,
} from "@/lib/products";

import {
  SITE_NAME,
} from "@/lib/site";

export const alt =
  "Produkt - Trend za Mniej";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export const revalidate =
  300;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Image({
  params,
}: Props) {
  const {
    slug,
  } =
    await params;

  const product =
    await getProductBySlug(
      slug
    );

  if (!product) {
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
              "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 55%, #fff7ed 100%)",

            fontFamily:
              "Arial, sans-serif",
          }}
        >
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
            }}
          >
            <div
              style={{
                display:
                  "flex",

                fontSize:
                  72,

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
                  24,

                fontSize:
                  30,

                fontWeight:
                  700,

                color:
                  "#e11d48",
              }}
            >
              Moda i okazje
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const price =
    formatPrice(
      product.price
    );

  const oldPrice =
    product.oldPrice !==
    null
      ? formatPrice(
          product.oldPrice
        )
      : null;

  const title =
    product.shortName
      .trim()
      .slice(
        0,
        86
      );

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

          position:
            "relative",

          overflow:
            "hidden",

          background:
            "#fafaf9",

          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width:
              "47%",

            height:
              "100%",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            background:
              "#f5f5f4",

            position:
              "relative",

            overflow:
              "hidden",
          }}
        >
          <img
            src={
              product.image
            }
            alt=""
            width="564"
            height="630"
            style={{
              width:
                "100%",

              height:
                "100%",

              objectFit:
                "cover",
            }}
          />

          <div
            style={{
              position:
                "absolute",

              inset:
                0,

              display:
                "flex",

              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,0.18) 100%)",
            }}
          />

          {product.featured && (
            <div
              style={{
                position:
                  "absolute",

                top:
                  28,

                left:
                  28,

                display:
                  "flex",

                padding:
                  "12px 20px",

                borderRadius:
                  999,

                background:
                  "rgba(255,255,255,0.94)",

                fontSize:
                  21,

                fontWeight:
                  800,

                color:
                  "#be123c",
              }}
            >
              🔥 Gorąca okazja
            </div>
          )}
        </div>

        <div
          style={{
            width:
              "53%",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "space-between",

            padding:
              "54px 56px 42px",
          }}
        >
          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  padding:
                    "9px 16px",

                  borderRadius:
                    999,

                  background:
                    "#fff1f2",

                  color:
                    "#be123c",

                  fontSize:
                    19,

                  fontWeight:
                    800,
                }}
              >
                {
                  product.category
                }
              </div>

              <div
                style={{
                  display:
                    "flex",

                  color:
                    "#e11d48",

                  fontSize:
                    20,

                  fontWeight:
                    900,
                }}
              >
                {
                  SITE_NAME
                }
              </div>
            </div>

            <div
              style={{
                display:
                  "flex",

                marginTop:
                  34,

                fontSize:
                  title.length >
                  55
                    ? 44
                    : 52,

                lineHeight:
                  1.08,

                letterSpacing:
                  "-2px",

                fontWeight:
                  900,

                color:
                  "#1c1917",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "baseline",

                marginTop:
                  34,
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  fontSize:
                    54,

                  fontWeight:
                    900,

                  color:
                    "#e11d48",

                  letterSpacing:
                    "-2px",
                }}
              >
                {price}
              </div>

              {oldPrice && (
                <div
                  style={{
                    display:
                      "flex",

                    marginLeft:
                      18,

                    fontSize:
                      24,

                    fontWeight:
                      700,

                    color:
                      "#a8a29e",

                    textDecoration:
                      "line-through",
                  }}
                >
                  {oldPrice}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              paddingTop:
                24,

              borderTop:
                "1px solid #e7e5e4",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                fontSize:
                  20,

                fontWeight:
                  700,

                color:
                  "#57534e",
              }}
            >
              Wybrane znalezisko • sprawdź aktualną ofertę
            </div>

            <div
              style={{
                display:
                  "flex",

                marginTop:
                  8,

                fontSize:
                  16,

                color:
                  "#a8a29e",
              }}
            >
              Cena widoczna w chwili publikacji lub aktualizacji.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}