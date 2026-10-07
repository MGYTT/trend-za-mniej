import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  formatPrice,
  getProductBySlug,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_NAME,
} from "@/lib/site";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate =
  60;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const product =
    await getProductBySlug(
      slug
    );

  if (!product) {
    return {
      title:
        "Produkt nie został znaleziony",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productUrl =
    `/produkt/${product.slug}`;

  return {
    title:
      product.shortName,

    description:
      product.description,

    alternates: {
      canonical:
        productUrl,
    },

    openGraph: {
      type: "website",

      locale:
        "pl_PL",

      url:
        productUrl,

      siteName:
        SITE_NAME,

      title:
        product.name,

      description:
        product.description,

      images: [
        {
          url:
            product.image,

          alt:
            product.name,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        product.name,

      description:
        product.description,

      images: [
        product.image,
      ],
    },

    other: {
      "product:price:amount":
        product.price.toFixed(
          2
        ),

      "product:price:currency":
        "PLN",
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } =
    await params;

  const product =
    await getProductBySlug(
      slug
    );

  if (!product) {
    notFound();
  }

  const siteUrl =
    getSiteUrl();

  const productUrl =
    `${siteUrl}/produkt/${product.slug}`;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    name:
      product.name,

    description:
      product.description,

    image: [
      product.image,
    ],

    url:
      productUrl,

    category:
      product.category,

    offers: {
      "@type":
        "Offer",

      url:
        productUrl,

      priceCurrency:
        "PLN",

      price:
        product.price.toFixed(
          2
        ),
    },
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/">
            <div>
              <p className="text-2xl font-black">
                Trend za Mniej
              </p>

              <p className="text-xs text-stone-500">
                Moda i okazje
              </p>
            </div>
          </Link>

          <Link
            href="/okazje"
            className="text-sm font-semibold transition hover:text-rose-600"
          >
            ← Wróć do okazji
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <img
              src={
                product.image
              }
              alt={
                product.name
              }
              className="aspect-[4/5] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/okazje?category=${encodeURIComponent(
                  product.category
                )}`}
                className="inline-flex rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-200"
              >
                {
                  product.category
                }
              </Link>

              {product.featured && (
                <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                  🔥 Gorąca okazja
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              {
                product.name
              }
            </h1>

            <p className="mt-6 text-lg leading-8 text-stone-600">
              {
                product.description
              }
            </p>

            {product.sold && (
              <p className="mt-5 text-sm font-semibold text-stone-500">
                🛍️{" "}
                {
                  product.sold
                }
              </p>
            )}

            <div className="mt-8 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">
                Cena w chwili publikacji
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="text-4xl font-black text-rose-600">
                  {formatPrice(
                    product.price
                  )}
                </span>

                {product.oldPrice !==
                  null && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs leading-5 text-stone-400">
                Cena i
                dostępność mogą
                zmienić się po
                publikacji.
                Aktualną cenę
                zawsze sprawdź na
                stronie sklepu.
              </p>
            </div>

            <a
              href={`/go/${product.id}`}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-5 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Sprawdź na SHEIN →
            </a>

            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-xs leading-5 text-stone-500">
              <strong className="text-stone-700">
                Reklama / link afiliacyjny
              </strong>

              <br />

              Możemy otrzymać
              prowizję, jeśli
              dokonasz zakupu po
              przejściu przez
              powyższy link. Nie
              zwiększa to ceny
              produktu.
            </div>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <p className="text-sm font-bold">
                Szukasz czegoś
                podobnego?
              </p>

              <Link
                href={`/okazje?category=${encodeURIComponent(
                  product.category
                )}`}
                className="mt-3 inline-flex font-bold text-rose-600 hover:text-rose-700"
              >
                Zobacz więcej z
                kategorii{" "}
                {
                  product.category
                }{" "}
                →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}