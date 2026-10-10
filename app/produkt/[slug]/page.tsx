import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  formatPrice,
  getProductBySlug,
  getProducts,
} from "@/lib/products";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate =
  60;

function buildMetaDescription(
  shortName: string
) {
  const description =
    `Zobacz ${shortName} w Trend za Mniej. Strona afiliacyjna z opisem, ceną zapisaną przy publikacji i linkiem do aktualnej oferty w SHEIN. Zakup odbywa się w SHEIN.`;

  return description.length >
    160
    ? `${description.slice(
        0,
        157
      )}...`
    : description;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const product =
    await getProductBySlug(
      slug
    );

  if (
    !product
  ) {
    return {
      title:
        "Produkt nie został znaleziony",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const productUrl =
    `/produkt/${product.slug}`;

  const title =
    `${product.shortName} – cena zapisana i link do SHEIN`;

  const description =
    buildMetaDescription(
      product.shortName
    );

  return {
    title,

    description,

    alternates: {
      canonical:
        productUrl,
    },

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type:
        "website",

      locale:
        SITE_LANGUAGE,

      url:
        productUrl,

      siteName:
        SITE_NAME,

      title:
        `${product.name} | ${SITE_NAME}`,

      description,

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
        `${product.name} | ${SITE_NAME}`,

      description,

      images: [
        product.image,
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const {
    slug,
  } =
    await params;

  const product =
    await getProductBySlug(
      slug
    );

  if (
    !product
  ) {
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
        (
          item
        ) =>
          item.id !==
          product.id
      )
      .slice(
        0,
        4
      );

  const siteUrl =
    getSiteUrl();

  const productUrl =
    `${siteUrl}/produkt/${product.slug}`;

  const categorySlug =
    slugifyCategory(
      product.category
    );

  const categoryUrl =
    `${siteUrl}/kategoria/${categorySlug}`;

  /*
   * WAŻNE:
   *
   * Celowo NIE używamy tutaj:
   *
   * - Product
   * - Offer
   * - AggregateOffer
   * - MerchantReturnPolicy
   * - OfferShippingDetails
   * - AggregateRating
   * - Review
   *
   * Trend za Mniej nie jest sklepem
   * ani sprzedawcą produktu.
   *
   * Strona opisuje produkt i kieruje
   * użytkownika przez link afiliacyjny
   * do SHEIN, gdzie odbywa się
   * właściwy zakup.
   *
   * Dzięki temu nie deklarujemy
   * Google, że Trend za Mniej
   * jest merchantem.
   */
  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "WebPage",

        "@id":
          `${productUrl}#webpage`,

        url:
          productUrl,

        name:
          product.name,

        description:
          buildMetaDescription(
            product.shortName
          ),

        inLanguage:
          SITE_LANGUAGE,

        isPartOf: {
          "@id":
            `${siteUrl}/#website`,
        },

        publisher: {
          "@id":
            `${siteUrl}/#organization`,
        },

        breadcrumb: {
          "@id":
            `${productUrl}#breadcrumb`,
        },

        primaryImageOfPage: {
          "@id":
            `${productUrl}#primaryimage`,
        },

        about: {
          "@id":
            `${productUrl}#topic`,
        },
      },

      {
        "@type":
          "ImageObject",

        "@id":
          `${productUrl}#primaryimage`,

        url:
          product.image,

        contentUrl:
          product.image,

        caption:
          product.name,

        representativeOfPage:
          true,
      },

      {
        /*
         * "Thing" opisuje temat strony
         * bez deklarowania obiektu
         * jako produktu sprzedawanego
         * przez Trend za Mniej.
         */
        "@type":
          "Thing",

        "@id":
          `${productUrl}#topic`,

        name:
          product.name,

        description:
          product.description,

        image: {
          "@id":
            `${productUrl}#primaryimage`,
        },

        url:
          productUrl,
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${productUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Strona główna",

            item:
              siteUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              2,

            name:
              "Okazje",

            item:
              `${siteUrl}/okazje`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              product.category,

            item:
              categoryUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              4,

            name:
              product.shortName,

            item:
              productUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-32 text-stone-900 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-7">
        <ProductBreadcrumbs
          category={
            product.category
          }
          categorySlug={
            categorySlug
          }
          shortName={
            product.shortName
          }
        />

        <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.85fr)] lg:gap-12">
          <section>
            <div className="relative overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-sm">
              <div className="flex min-h-[420px] items-center justify-center bg-stone-100 p-3 sm:min-h-[560px] sm:p-6 lg:min-h-[650px]">
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
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-2 text-xs font-black text-rose-700 shadow-sm backdrop-blur">
                  🔥 Gorąca okazja
                </div>
              )}
            </div>

            <div className="mt-3 flex items-start gap-3 px-1 text-xs leading-6 text-stone-400">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />

                <circle
                  cx="8.5"
                  cy="10"
                  r="1.5"
                />

                <path d="m21 15-5-5L5 19" />
              </svg>

              <p>
                Zdjęcie przedstawia
                prezentowany produkt.
                Kolor może wyglądać
                nieco inaczej zależnie
                od ekranu oraz
                materiałów
                udostępnionych przez
                sklep.
              </p>
            </div>
          </section>

          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/kategoria/${categorySlug}`}
                className="inline-flex min-h-9 items-center rounded-full bg-rose-50 px-3.5 text-xs font-black text-rose-700 transition hover:bg-rose-100"
              >
                {
                  product.category
                }
              </Link>

              <span className="inline-flex min-h-9 items-center rounded-full bg-stone-100 px-3.5 text-xs font-black text-stone-600">
                Link afiliacyjny
              </span>

              {product.featured && (
                <span className="inline-flex min-h-9 items-center rounded-full bg-orange-50 px-3.5 text-xs font-black text-orange-700">
                  Popularny wybór
                </span>
              )}
            </div>

            <h1 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.04em] text-stone-900 sm:text-4xl lg:text-[42px]">
              {
                product.name
              }
            </h1>

            <p className="mt-4 text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
              {
                product.description
              }
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <FlowStep
                number="1"
                label="Zobacz produkt"
              />

              <FlowStep
                number="2"
                label="Przejdź do SHEIN"
              />

              <FlowStep
                number="3"
                label="Kup w sklepie"
              />
            </div>

            {product.sold && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-500">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8h12l1 12H5L6 8Z" />

                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>

                {
                  product.sold
                }
              </div>
            )}

            <div className="mt-6 rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-stone-400">
                Cena zapisana
                w Trend za Mniej
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-4xl font-black tracking-[-0.04em] text-stone-900 sm:text-5xl">
                  {formatPrice(
                    product.price
                  )}
                </span>

                {product.oldPrice !==
                  null && (
                  <span className="text-base font-semibold text-stone-400 line-through sm:text-lg">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-sm"
                >
                  ℹ️
                </span>

                <p className="text-[11px] leading-5 text-amber-800">
                  To cena zapisana
                  przez nas przy
                  publikacji oferty.
                  Aktualna cena,
                  dostępność,
                  warianty, rozmiary
                  i promocje mogą się
                  zmienić. Sprawdź je
                  bezpośrednio
                  w SHEIN.
                </p>
              </div>

              <a
                href={`/go/${product.id}`}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-rose-600 px-5 text-center text-base font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md sm:text-lg"
              >
                Sprawdź aktualną
                ofertę w SHEIN

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="ml-2 h-5 w-5 shrink-0"
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

              <p className="mt-2 text-center text-[10px] font-semibold leading-5 text-stone-400">
                Link prowadzi do
                zewnętrznego sklepu
                SHEIN
              </p>
            </div>

            <div className="mt-3 rounded-[18px] border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-700 shadow-sm">
                  i
                </span>

                <div>
                  <p className="text-sm font-black text-blue-950">
                    Trend za Mniej
                    nie jest sprzedawcą
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-800 sm:text-xs sm:leading-6">
                    Prezentujemy
                    wybrane produkty
                    i kierujemy do
                    zewnętrznego sklepu
                    przez link
                    afiliacyjny. Zakup,
                    płatność, dostawa,
                    dostępność,
                    reklamacje
                    i zwroty odbywają
                    się zgodnie
                    z warunkami
                    sklepu SHEIN.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border border-rose-100 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm"
                >
                  🎟️
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-stone-900">
                    Sprawdzasz też
                    promocje i kody?
                  </p>

                  <p className="mt-1 text-xs leading-6 text-stone-600">
                    Zobacz aktualne
                    kampanie SHEIN,
                    kupony i kody
                    zebrane w jednym
                    miejscu.
                  </p>

                  <Link
                    href="/promocje-shein"
                    className="mt-2 inline-flex text-xs font-black text-rose-700 transition hover:text-rose-800"
                  >
                    Zobacz promocje
                    SHEIN →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <MiniFeature
                icon="check"
                title="Cena"
                text="potwierdź w SHEIN"
              />

              <MiniFeature
                icon="size"
                title="Rozmiar"
                text="sprawdź w SHEIN"
              />

              <MiniFeature
                icon="external"
                title="Zakup"
                text="odbywa się w SHEIN"
              />
            </div>

            <div className="mt-4 rounded-[18px] border border-stone-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-xs font-black text-rose-600">
                  i
                </span>

                <div>
                  <p className="text-xs font-black text-stone-800">
                    Informacja
                    afiliacyjna
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-stone-500">
                    Trend za Mniej
                    jest serwisem
                    afiliacyjnym,
                    a nie sklepem.
                    Możemy otrzymać
                    prowizję, jeśli
                    dokonasz
                    kwalifikującego
                    się zakupu po
                    przejściu przez
                    nasz link.
                    Nie doliczamy
                    z tego powodu
                    dodatkowej opłaty.
                  </p>

                  <Link
                    href="/afiliacja"
                    className="mt-2 inline-flex text-[11px] font-black text-rose-600 transition hover:text-rose-700"
                  >
                    Jak działa
                    afiliacja →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:gap-14">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              O produkcie
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
              Najważniejsze
              informacje
            </h2>

            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
              {
                product.description
              }
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/kategoria/${categorySlug}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Więcej:{" "}
                {
                  product.category
                }{" "}
                →
              </Link>

              <Link
                href="/okazje"
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
              >
                Wszystkie produkty
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                ✓
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-600">
                  Przed przejściem
                  do sklepu
                </p>

                <h2 className="text-lg font-black text-stone-900">
                  Sprawdź w SHEIN
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <ChecklistItem>
                Aktualną cenę
                produktu
                bezpośrednio na
                stronie lub
                w aplikacji SHEIN.
              </ChecklistItem>

              <ChecklistItem>
                Dostępność wybranego
                koloru oraz rozmiaru.
              </ChecklistItem>

              <ChecklistItem>
                Tabelę wymiarów
                konkretnego produktu.
              </ChecklistItem>

              <ChecklistItem>
                Dostępne kupony
                i promocje.
              </ChecklistItem>

              <ChecklistItem>
                Koszt dostawy,
                termin wysyłki
                i warunki zwrotu
                obowiązujące
                w SHEIN.
              </ChecklistItem>
            </div>

            <a
              href={`/go/${product.id}`}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-rose-600"
            >
              Przejdź do produktu
              w SHEIN ↗
            </a>

            <p className="mt-3 text-center text-[10px] leading-5 text-stone-400">
              Trend za Mniej
              nie prowadzi
              sprzedaży ani
              realizacji zamówień.
            </p>
          </div>
        </div>
      </section>

      {relatedProducts.length >
        0 && (
        <section className="border-b border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                  Nie kończ
                  przeglądania
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                  Podobne produkty
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Więcej propozycji
                  z kategorii{" "}
                  <strong className="text-stone-700">
                    {
                      product.category
                    }
                  </strong>
                  .
                </p>
              </div>

              <Link
                href={`/kategoria/${categorySlug}`}
                className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
              >
                Wszystkie →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
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
              href={`/kategoria/${categorySlug}`}
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:hidden"
            >
              Więcej z kategorii{" "}
              {
                product.category
              }{" "}
              →
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <div className="grid gap-5 rounded-[26px] bg-stone-900 p-6 text-white sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-300">
                Szukasz okazji?
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                Sprawdź też aktualne
                promocje SHEIN
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
                Kupony, wyprzedaże,
                bestsellery i inne
                kampanie zebraliśmy
                na jednej stronie.
              </p>
            </div>

            <Link
              href="/promocje-shein"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white transition hover:bg-rose-500 md:min-w-[220px]"
            >
              🔥 Zobacz promocje
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/97 px-4 pt-3 shadow-[0_-6px_24px_rgba(28,25,23,0.09)] backdrop-blur-xl md:hidden">
        <div
          className="mx-auto flex max-w-xl items-center gap-3"
          style={{
            paddingBottom:
              "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold text-stone-500">
              {
                product.shortName
              }
            </p>

            <p className="mt-0.5 text-lg font-black text-stone-900">
              {formatPrice(
                product.price
              )}
            </p>

            <p className="text-[8px] text-stone-400">
              cena zapisana
              przy publikacji
            </p>
          </div>

          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 px-4 text-center text-xs font-black text-white shadow-sm"
          >
            Sprawdź w SHEIN
          </a>
        </div>
      </div>
    </main>
  );
}

function ProductBreadcrumbs({
  category,
  categorySlug,
  shortName,
}: {
  category: string;

  categorySlug: string;

  shortName: string;
}) {
  return (
    <nav
      aria-label="Okruszki"
      className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold text-stone-400 sm:text-sm"
    >
      <Link
        href="/"
        className="transition hover:text-rose-600"
      >
        Start
      </Link>

      <span
        aria-hidden="true"
        className="text-stone-300"
      >
        /
      </span>

      <Link
        href="/okazje"
        className="transition hover:text-rose-600"
      >
        Okazje
      </Link>

      <span
        aria-hidden="true"
        className="text-stone-300"
      >
        /
      </span>

      <Link
        href={`/kategoria/${categorySlug}`}
        className="transition hover:text-rose-600"
      >
        {
          category
        }
      </Link>

      <span
        aria-hidden="true"
        className="text-stone-300"
      >
        /
      </span>

      <span className="max-w-[220px] truncate text-stone-600">
        {
          shortName
        }
      </span>
    </nav>
  );
}

function FlowStep({
  number,
  label,
}: {
  number: string;

  label: string;
}) {
  return (
    <div className="rounded-[16px] border border-stone-200 bg-white p-3 text-center shadow-sm">
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-[10px] font-black text-rose-700">
        {number}
      </span>

      <p className="mt-2 text-[10px] font-black leading-4 text-stone-600">
        {label}
      </p>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  text,
}: {
  icon:
    | "check"
    | "size"
    | "external";

  title: string;

  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-stone-200 bg-white p-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-rose-600">
        <MiniIcon
          type={
            icon
          }
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-stone-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-5 text-stone-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniIcon({
  type,
}: {
  type:
    | "check"
    | "size"
    | "external";
}) {
  if (
    type ===
    "check"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (
    type ===
    "size"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6h16v12H4z" />

        <path d="M8 6v4" />

        <path d="M12 6v2" />

        <path d="M16 6v4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />

      <path d="M10 14 19 5" />

      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function ChecklistItem({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">
        ✓
      </span>

      <p className="text-sm leading-6 text-stone-600">
        {children}
      </p>
    </div>
  );
}