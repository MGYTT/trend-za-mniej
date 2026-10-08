import {
  ImageResponse,
} from "next/og";

import {
  findCategoryBySlug,
} from "@/lib/categories";

import {
  getCategories,
  getProducts,
} from "@/lib/products";

import {
  SITE_NAME,
} from "@/lib/site";

export const alt =
  "Kategoria - Trend za Mniej";

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

  const categories =
    await getCategories();

  const category =
    findCategoryBySlug(
      categories,
      slug
    );

  if (!category) {
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
              "linear-gradient(135deg, #fff1f2, #fdf2f8, #fff7ed)",

            fontFamily:
              "Arial, sans-serif",
          }}
        >
          <div
            style={{
              display:
                "flex",

              fontSize:
                74,

              fontWeight:
                900,

              color:
                "#1c1917",
            }}
          >
            {
              SITE_NAME
            }
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const products =
    (
      await getProducts({
        category:
          category.name,

        sort:
          "newest",
      })
    ).slice(
      0,
      3
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
            "linear-gradient(135deg, #fff1f2 0%, #ffffff 56%, #fff7ed 100%)",

          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position:
              "absolute",

            width:
              360,

            height:
              360,

            borderRadius:
              999,

            background:
              "rgba(244,63,94,0.08)",

            left:
              -120,

            top:
              -120,

            display:
              "flex",
          }}
        />

        <div
          style={{
            width:
              "58%",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "center",

            padding:
              "60px 30px 60px 70px",

            zIndex:
              2,
          }}
        >
          <div
            style={{
              display:
                "flex",

              width:
                "fit-content",

              padding:
                "10px 18px",

              borderRadius:
                999,

              background:
                "#ffffff",

              boxShadow:
                "0 8px 30px rgba(28,25,23,0.07)",

              fontSize:
                19,

              fontWeight:
                800,

              color:
                "#e11d48",
            }}
          >
            ✨ Trend za Mniej
          </div>

          <div
            style={{
              display:
                "flex",

              marginTop:
                30,

              fontSize:
                category.name.length >
                22
                  ? 56
                  : 68,

              lineHeight:
                1,

              fontWeight:
                900,

              letterSpacing:
                "-3px",

              color:
                "#1c1917",
            }}
          >
            {
              category.name
            }
          </div>

          <div
            style={{
              display:
                "flex",

              marginTop:
                24,

              maxWidth:
                560,

              fontSize:
                26,

              lineHeight:
                1.35,

              color:
                "#57534e",

              fontWeight:
                600,
            }}
          >
            Modne znaleziska, wybrane produkty i aktualne okazje w jednym miejscu.
          </div>

          <div
            style={{
              display:
                "flex",

              marginTop:
                34,

              fontSize:
                20,

              fontWeight:
                800,

              color:
                "#be123c",
            }}
          >
            {
              products.length
            }{" "}
            {products.length ===
            1
              ? "produkt"
              : "produktów"}{" "}
            w kategorii
          </div>
        </div>

        <div
          style={{
            width:
              "42%",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              "40px 52px 40px 20px",
          }}
        >
          <div
            style={{
              width:
                "100%",

              height:
                500,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                14,

              transform:
                "rotate(2deg)",
            }}
          >
            {products.length >
            0 ? (
              products.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product.id
                    }
                    style={{
                      display:
                        "flex",

                      width:
                        index ===
                        1
                          ? 150
                          : 128,

                      height:
                        index ===
                        1
                          ? 410
                          : 360,

                      borderRadius:
                        24,

                      overflow:
                        "hidden",

                      background:
                        "#ffffff",

                      boxShadow:
                        "0 18px 45px rgba(28,25,23,0.13)",

                      transform:
                        index ===
                        0
                          ? "rotate(-5deg)"
                          : index ===
                              2
                            ? "rotate(5deg)"
                            : "rotate(0deg)",
                    }}
                  >
                    <img
                      src={
                        product.image
                      }
                      alt=""
                      width={
                        index ===
                        1
                          ? "150"
                          : "128"
                      }
                      height={
                        index ===
                        1
                          ? "410"
                          : "360"
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "cover",
                      }}
                    />
                  </div>
                )
              )
            ) : (
              <div
                style={{
                  display:
                    "flex",

                  width:
                    360,

                  height:
                    430,

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  borderRadius:
                    30,

                  background:
                    "#ffffff",

                  boxShadow:
                    "0 18px 45px rgba(28,25,23,0.10)",

                  fontSize:
                    80,
                }}
              >
                🛍️
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}