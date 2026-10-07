import type {
  Metadata,
} from "next";

import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  formatPrice,
  getProductBySlug,
  getProducts,
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
      locale: "pl_PL",
      url: productUrl,
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

  const relatedProducts =
    (
      await getProducts({
        category:
          product.category,
      })
    )
      .filter(
        (item) =>
          item.id !==
          product.id
      )
      .slice(0, 4);

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
    <main className="min-h-screen bg-stone-50 pb-28 text-stone-900 md:pb-0">
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

      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8 lg:py-10">
        <nav
          aria-label="Okruszki"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500"
        >
          <Link
            href="/"
            className="font-semibold transition hover:text-rose-600"
          >
            Strona główna
          </Link>

          <span
            aria-hidden="true"
            className="text-stone-300"
          >
            /
          </span>

          <Link
            href="/okazje"
            className="font-semibold transition hover:text-rose-600"
          >
            Okazje
          </Link>

          <span
            aria-hidden="true"
            className="text-stone-300"
          >
            /
          </span>

          <span className="max-w-[220px] truncate font-semibold text-stone-700 sm:max-w-md">
            {
              product.shortName
            }
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-12">
          <section>
            <div className="relative overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-sm sm:rounded-[36px]">
              <div className="flex min-h-[420px] items-center justify-center bg-gradient-to-br from-stone-50 to-rose-50 p-3 sm:min-h-[560px] sm:p-6 lg:min-h-[650px]">
                <img
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                  className="max-h-[760px] w-full object-contain"
                />
              </div>

              {product.featured && (
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-rose-700 shadow-md backdrop-blur sm:left-6 sm:top-6 sm:text-sm">
                  🔥 Gorąca okazja
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-xs leading-6 text-stone-500 sm:text-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100">
                📷
              </div>

              <p>
                Zdjęcie przedstawia
                prezentowany produkt.
                Kolor może nieznacznie
                różnić się w
                zależności od ekranu
                i materiałów sklepu.
              </p>
            </div>
          </section>

          <section className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/okazje?category=${encodeURIComponent(
                  product.category
                )}`}
                className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 sm:text-sm"
              >
                {
                  product.category
                }
              </Link>

              {product.featured && (
                <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 sm:text-sm">
                  Popularny wybór
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[44px]">
              {
                product.name
              }
            </h1>

            <p className="mt-5 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              {
                product.description
              }
            </p>

            {product.sold && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600">
                <span>
                  🛍️
                </span>

                {
                  product.sold
                }
              </div>
            )}

            <div className="mt-7 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Cena w chwili
                publikacji
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-4xl font-black tracking-tight text-rose-600 sm:text-5xl">
                  {formatPrice(
                    product.price
                  )}
                </span>

                {product.oldPrice !==
                  null && (
                  <span className="text-lg font-semibold text-stone-400 line-through">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoBox
                  icon="✓"
                  title="Aktualną cenę"
                  text="sprawdzisz w sklepie"
                />

                <InfoBox
                  icon="↗"
                  title="Zakup i dostawa"
                  text="odbywają się w SHEIN"
                />
              </div>

              <a
                href={`/go/${product.id}`}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 text-base font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:text-lg"
              >
                Sprawdź na SHEIN
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </a>

              <p className="mt-3 text-center text-xs leading-5 text-stone-400">
                Link otworzy ofertę
                w zewnętrznym
                sklepie.
              </p>
            </div>

            <div className="mt-5 rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  ℹ️
                </div>

                <div>
                  <p className="text-sm font-black text-stone-800">
                    Reklama / link
                    afiliacyjny
                  </p>

                  <p className="mt-1 text-xs leading-6 text-stone-600 sm:text-sm">
                    Możemy otrzymać
                    prowizję, jeśli
                    dokonasz zakupu po
                    przejściu przez ten
                    link. Nie powinno
                    to zwiększać ceny
                    produktu dla
                    kupującego.
                  </p>

                  <Link
                    href="/afiliacja"
                    className="mt-2 inline-flex text-xs font-black text-rose-600 hover:text-rose-700 sm:text-sm"
                  >
                    Więcej informacji
                    →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-5">
              <h2 className="font-black text-stone-900">
                Przed zakupem
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                <CheckItem>
                  Sprawdź aktualną
                  cenę i dostępność
                  rozmiaru w SHEIN.
                </CheckItem>

                <CheckItem>
                  Zweryfikuj tabelę
                  rozmiarów przed
                  złożeniem
                  zamówienia.
                </CheckItem>

                <CheckItem>
                  Kupony i promocje
                  mogą różnić się w
                  zależności od konta
                  i czasu.
                </CheckItem>
              </div>
            </div>
          </section>
        </div>
      </div>

      {relatedProducts.length >
        0 && (
        <section className="mt-4 border-y border-stone-100 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
                  Zobacz również
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Podobne produkty
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Więcej ofert z
                  kategorii{" "}
                  <strong className="text-stone-700">
                    {
                      product.category
                    }
                  </strong>
                  .
                </p>
              </div>

              <Link
                href={`/okazje?category=${encodeURIComponent(
                  product.category
                )}`}
                className="hidden text-sm font-black text-rose-600 hover:text-rose-700 sm:block"
              >
                Wszystkie →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(
                (
                  relatedProduct
                ) => (
                  <ProductCard
                    key={
                      relatedProduct.id
                    }
                    product={
                      relatedProduct
                    }
                  />
                )
              )}
            </div>

            <Link
              href={`/okazje?category=${encodeURIComponent(
                product.category
              )}`}
              className="mt-6 flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 font-black text-rose-700 sm:hidden"
            >
              Więcej z tej kategorii
              →
            </Link>
          </div>
        </section>
      )}

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col items-center justify-between gap-5 rounded-[28px] border border-stone-200 bg-white p-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-lg font-black">
                Chcesz zobaczyć
                więcej?
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Przeglądaj wszystkie
                kategorie i najnowsze
                znaleziska.
              </p>
            </div>

            <Link
              href="/okazje"
              className="flex min-h-12 w-full shrink-0 items-center justify-center rounded-2xl bg-rose-50 px-6 font-black text-rose-700 transition hover:bg-rose-100 sm:w-auto"
            >
              Wszystkie okazje →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden">
        <div
          className="mx-auto flex max-w-xl items-center gap-3"
          style={{
            paddingBottom:
              "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-500">
              {
                product.shortName
              }
            </p>

            <p className="mt-0.5 text-lg font-black text-rose-600">
              {formatPrice(
                product.price
              )}
            </p>
          </div>

          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 font-black text-white shadow-md"
          >
            Sprawdź na SHEIN
          </a>
        </div>
      </div>
    </main>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-rose-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-sm font-black text-stone-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-stone-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function CheckItem({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-[11px] font-black text-green-700">
        ✓
      </span>

      <p>
        {children}
      </p>
    </div>
  );
}