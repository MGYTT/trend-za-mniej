import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { slugifyCategory } from "@/lib/categories";
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

type DiscountInfo = {
  percent: number;
  saving: number;
};

export const revalidate = 60;

function buildMetaDescription(shortName: string) {
  const description =
    `Zobacz ${shortName} w Trend za Mniej. Strona afiliacyjna z opisem, ceną zapisaną przy publikacji i linkiem do aktualnej oferty w SHEIN. Zakup odbywa się w SHEIN.`;

  return description.length > 160
    ? `${description.slice(0, 157)}...`
    : description;
}

function getDiscountInfo(
  price: number,
  oldPrice: number | null
): DiscountInfo | null {
  if (
    oldPrice === null ||
    !Number.isFinite(price) ||
    !Number.isFinite(oldPrice) ||
    oldPrice <= price ||
    oldPrice <= 0
  ) {
    return null;
  }

  return {
    percent: Math.max(
      1,
      Math.min(
        99,
        Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      )
    ),

    saving:
      oldPrice - price,
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

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
  } = await params;

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

  const discount =
    getDiscountInfo(
      product.price,
      product.oldPrice
    );

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
    <main className="min-h-screen bg-[#f7f7f8] pb-28 text-stone-950 md:pb-0">
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

      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6 lg:px-8">
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

        <section className="mt-4 overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_18px_70px_rgba(28,25,23,0.06)] sm:mt-6 sm:rounded-[32px]">
          <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
            <div className="border-b border-black/[0.06] lg:border-b-0 lg:border-r">
              <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f7f8] via-white to-[#ececef] p-3 sm:min-h-[600px] sm:p-7 lg:min-h-[720px] lg:p-10">
                <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-rose-100/70 blur-3xl" />

                <div className="pointer-events-none absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-stone-200/70 blur-3xl" />

                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] border border-white/80 bg-white/70 p-3 shadow-[0_18px_55px_rgba(28,25,23,0.08)] sm:rounded-[28px] sm:p-6">
                  <img
                    src={
                      product.image
                    }
                    alt={
                      product.name
                    }
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="max-h-[390px] w-full object-contain sm:max-h-[540px] lg:max-h-[650px]"
                  />
                </div>

                <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-8 sm:top-8">
                  {product.featured && (
                    <span className="inline-flex min-h-9 items-center rounded-full border border-white/80 bg-white/95 px-3.5 text-[11px] font-black text-rose-700 shadow-sm">
                      🔥 Gorąca okazja
                    </span>
                  )}

                  {discount && (
                    <span className="inline-flex min-h-9 items-center rounded-full bg-stone-950 px-3.5 text-[11px] font-black text-white shadow-sm">
                      -
                      {
                        discount.percent
                      }
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-black/[0.05] bg-white px-4 py-3.5 text-[11px] leading-5 text-stone-400 sm:px-6 sm:py-4 sm:text-xs sm:leading-6">
                <ImageIcon />

                <p>
                  Zdjęcie
                  przedstawia
                  prezentowany
                  produkt. Kolor,
                  proporcje i detale
                  mogą wyglądać
                  nieco inaczej
                  zależnie od ekranu
                  i materiałów
                  udostępnionych
                  przez sklep.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-7 lg:p-8 xl:p-10">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/kategoria/${categorySlug}`}
                  className="inline-flex min-h-9 items-center rounded-full bg-rose-50 px-3.5 text-[11px] font-black text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                >
                  {
                    product.category
                  }
                </Link>

                <span className="inline-flex min-h-9 items-center rounded-full bg-stone-100 px-3.5 text-[11px] font-black text-stone-600">
                  Link afiliacyjny
                </span>

                {product.sold && (
                  <span className="inline-flex min-h-9 items-center rounded-full bg-emerald-50 px-3.5 text-[11px] font-black text-emerald-700">
                    {
                      product.sold
                    }
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-balance text-[32px] font-black leading-[1.02] tracking-[-0.05em] text-stone-950 sm:text-[42px] lg:text-[44px] xl:text-[50px]">
                {
                  product.name
                }
              </h1>

              <p className="mt-4 text-pretty text-[15px] leading-7 text-stone-500 sm:text-base sm:leading-8">
                {
                  product.description
                }
              </p>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-black/[0.07] bg-[#fafafa]">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">
                        Cena zapisana
                        przy publikacji
                      </p>

                      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                        <span className="text-[38px] font-black leading-none tracking-[-0.055em] text-stone-950 sm:text-[46px]">
                          {formatPrice(
                            product.price
                          )}
                        </span>

                        {product.oldPrice !==
                          null && (
                          <span className="pb-1 text-base font-bold text-stone-400 line-through sm:text-lg">
                            {formatPrice(
                              product.oldPrice
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {discount && (
                      <div className="shrink-0 rounded-[16px] bg-rose-600 px-3 py-2.5 text-center text-white shadow-sm">
                        <p className="text-lg font-black leading-none">
                          -
                          {
                            discount.percent
                          }
                          %
                        </p>

                        <p className="mt-1 text-[8px] font-black uppercase tracking-[0.08em] text-white/75">
                          rabat
                        </p>
                      </div>
                    )}
                  </div>

                  {discount && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                      <span
                        aria-hidden="true"
                      >
                        ↓
                      </span>

                      Różnica względem
                      starej ceny:{" "}
                      {formatPrice(
                        discount.saving
                      )}
                    </div>
                  )}

                  <div className="mt-5 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-amber-700 shadow-sm">
                        i
                      </span>

                      <p className="text-[11px] leading-5 text-amber-900/80 sm:text-xs sm:leading-6">
                        Cena,
                        dostępność,
                        kolory,
                        rozmiary
                        i promocje
                        mogą się
                        zmienić.
                        Przed zakupem
                        sprawdź
                        aktualne
                        informacje
                        bezpośrednio
                        w SHEIN.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/go/${product.id}`}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-5 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-rose-600 px-5 text-center text-[15px] font-black text-white shadow-[0_12px_30px_rgba(225,29,72,0.20)] transition hover:bg-rose-700 hover:shadow-[0_16px_36px_rgba(225,29,72,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 active:scale-[0.99] sm:text-base"
                  >
                    Sprawdź aktualną
                    ofertę w SHEIN

                    <ExternalArrowIcon />
                  </a>

                  <p className="mt-2.5 text-center text-[10px] font-semibold leading-5 text-stone-400">
                    Otworzymy
                    zewnętrzną
                    stronę SHEIN
                    w nowej karcie.
                  </p>
                </div>

                <div className="grid grid-cols-3 border-t border-black/[0.05] bg-white">
                  <TrustMetric
                    icon="check"
                    title="Cena"
                    text="potwierdź w SHEIN"
                  />

                  <TrustMetric
                    icon="size"
                    title="Rozmiar"
                    text="sprawdź tabelę"
                  />

                  <TrustMetric
                    icon="external"
                    title="Zakup"
                    text="odbywa się w SHEIN"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <InfoCard
                  icon="shield"
                  title="Jasne zasady"
                  text="Trend za Mniej pokazuje wybrane produkty i kieruje do zewnętrznego sklepu. Nie realizujemy zamówień."
                />

                <InfoCard
                  icon="affiliate"
                  title="Link afiliacyjny"
                  text="Możemy otrzymać prowizję za kwalifikujący się zakup. Nie zwiększa to ceny po naszej stronie."
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-rose-100 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black text-stone-950">
                    Sprawdzasz też
                    kupony i promocje?
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-stone-600">
                    Aktualne kampanie
                    SHEIN zebraliśmy
                    w jednym miejscu.
                  </p>
                </div>

                <Link
                  href="/promocje-shein"
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-xs font-black text-rose-700 shadow-sm transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                >
                  Zobacz promocje →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-black/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(350px,0.75fr)] lg:gap-12 lg:px-8">
          <div>
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-600">
                O produkcie
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-950 sm:text-4xl">
                Najważniejsze
                informacje przed
                przejściem do sklepu
              </h2>

              <p className="mt-5 text-[15px] leading-8 text-stone-600 sm:text-base">
                {
                  product.description
                }
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FeatureTile
                icon="price"
                title="Cena może się zmienić"
                text="Pokazujemy cenę zapisaną podczas publikacji oferty. Aktualną wartość zawsze potwierdź w sklepie."
              />

              <FeatureTile
                icon="sizes"
                title="Sprawdź wariant"
                text="Dostępność konkretnego koloru i rozmiaru może różnić się od momentu dodania produktu."
              />

              <FeatureTile
                icon="returns"
                title="Warunki sklepu"
                text="Płatność, dostawa, zwroty i reklamacje odbywają się zgodnie z zasadami SHEIN."
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href={`/kategoria/${categorySlug}`}
                className="inline-flex min-h-11 items-center rounded-[14px] bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200"
              >
                Więcej:{" "}
                {
                  product.category
                }{" "}
                →
              </Link>

              <Link
                href="/okazje"
                className="inline-flex min-h-11 items-center rounded-[14px] border border-black/[0.08] bg-white px-4 text-sm font-black text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-100"
              >
                Wszystkie produkty
              </Link>
            </div>
          </div>

          <aside className="rounded-[26px] border border-black/[0.07] bg-[#f7f7f8] p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-emerald-600 shadow-sm">
                <CheckIcon />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                  Szybka lista
                </p>

                <h2 className="mt-0.5 text-lg font-black tracking-[-0.03em] text-stone-950">
                  Sprawdź przed
                  zakupem
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <ChecklistItem>
                Aktualną cenę
                produktu
                bezpośrednio
                na stronie
                lub w aplikacji
                SHEIN.
              </ChecklistItem>

              <ChecklistItem>
                Dostępność
                wybranego koloru,
                wariantu
                i rozmiaru.
              </ChecklistItem>

              <ChecklistItem>
                Tabelę wymiarów
                konkretnego
                produktu.
              </ChecklistItem>

              <ChecklistItem>
                Dostępne kupony,
                kampanie
                i promocje.
              </ChecklistItem>

              <ChecklistItem>
                Koszt dostawy,
                termin wysyłki
                oraz aktualne
                warunki zwrotu.
              </ChecklistItem>
            </div>

            <a
              href={`/go/${product.id}`}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200"
            >
              Przejdź do produktu
              w SHEIN

              <ExternalArrowIcon />
            </a>

            <p className="mt-3 text-center text-[10px] leading-5 text-stone-400">
              Trend za Mniej
              nie prowadzi
              sprzedaży ani
              realizacji zamówień.
            </p>
          </aside>
        </div>
      </section>

      {relatedProducts.length >
        0 && (
        <section className="border-b border-black/[0.06] bg-[#f7f7f8]">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-600">
                  Może Ci się spodobać
                </p>

                <h2 className="mt-1.5 text-3xl font-black tracking-[-0.04em] text-stone-950 sm:text-4xl">
                  Podobne produkty
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Więcej propozycji
                  z kategorii{" "}
                  <strong className="font-black text-stone-700">
                    {
                      product.category
                    }
                  </strong>
                  .
                </p>
              </div>

              <Link
                href={`/kategoria/${categorySlug}`}
                className="hidden shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-rose-600 shadow-sm transition hover:text-rose-700 sm:inline-flex"
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
              className="mt-5 flex min-h-12 items-center justify-center rounded-[16px] border border-black/[0.07] bg-white px-4 text-center text-sm font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:hidden"
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
        <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] bg-stone-950 p-6 text-white shadow-[0_18px_50px_rgba(28,25,23,0.12)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />

            <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-300">
                  Jeszcze więcej okazji
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                  Sprawdź aktualne
                  promocje SHEIN
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
                  Kupony,
                  wyprzedaże,
                  bestsellery
                  i inne kampanie
                  zebraliśmy na
                  jednej stronie,
                  żeby łatwiej było
                  sprawdzić aktualne
                  możliwości.
                </p>
              </div>

              <Link
                href="/promocje-shein"
                className="flex min-h-12 items-center justify-center rounded-[16px] bg-rose-600 px-6 text-sm font-black text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/40 md:min-w-[220px]"
              >
                🔥 Zobacz promocje
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/95 px-3 pt-2.5 shadow-[0_-10px_30px_rgba(28,25,23,0.10)] backdrop-blur-xl md:hidden">
        <div
          className="mx-auto flex max-w-xl items-center gap-3"
          style={{
            paddingBottom:
              "max(0.65rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold text-stone-400">
              {
                product.shortName
              }
            </p>

            <div className="mt-0.5 flex items-baseline gap-1.5">
              <p className="text-lg font-black leading-none tracking-[-0.04em] text-stone-950">
                {formatPrice(
                  product.price
                )}
              </p>

              {discount && (
                <span className="text-[9px] font-black text-rose-600">
                  -
                  {
                    discount.percent
                  }
                  %
                </span>
              )}
            </div>

            <p className="mt-0.5 text-[8px] font-semibold text-stone-400">
              cena zapisana
              przy publikacji
            </p>
          </div>

          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-[15px] bg-rose-600 px-4 text-center text-xs font-black text-white shadow-[0_8px_22px_rgba(225,29,72,0.22)] active:scale-[0.99]"
          >
            Sprawdź w SHEIN

            <ExternalArrowIcon />
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
  category:
    string;

  categorySlug:
    string;

  shortName:
    string;
}) {
  return (
    <nav
      aria-label="Okruszki"
      className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-[11px] font-bold text-stone-400 sm:text-xs"
    >
      <Link
        href="/"
        className="transition hover:text-rose-600"
      >
        Start
      </Link>

      <BreadcrumbSeparator />

      <Link
        href="/okazje"
        className="transition hover:text-rose-600"
      >
        Produkty
      </Link>

      <BreadcrumbSeparator />

      <Link
        href={`/kategoria/${categorySlug}`}
        className="transition hover:text-rose-600"
      >
        {
          category
        }
      </Link>

      <BreadcrumbSeparator />

      <span className="max-w-[220px] truncate text-stone-600 sm:max-w-[320px]">
        {
          shortName
        }
      </span>
    </nav>
  );
}

function BreadcrumbSeparator() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-3 w-3 shrink-0 text-stone-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

function TrustMetric({
  icon,
  title,
  text,
}: {
  icon:
    | "check"
    | "size"
    | "external";

  title:
    string;

  text:
    string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center px-2 py-3.5 text-center first:border-r last:border-l first:border-black/[0.05] last:border-black/[0.05] sm:px-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-stone-100 text-stone-700">
        <MiniIcon
          type={
            icon
          }
        />
      </span>

      <p className="mt-2 text-[10px] font-black text-stone-800 sm:text-[11px]">
        {
          title
        }
      </p>

      <p className="mt-0.5 text-[8px] leading-4 text-stone-400 sm:text-[9px]">
        {
          text
        }
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon:
    | "shield"
    | "affiliate";

  title:
    string;

  text:
    string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-black/[0.06] bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-stone-100 text-stone-700">
        {icon ===
        "shield" ? (
          <ShieldIcon />
        ) : (
          <AffiliateIcon />
        )}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-black text-stone-900">
          {
            title
          }
        </p>

        <p className="mt-1 text-[10px] leading-5 text-stone-500">
          {
            text
          }
        </p>

        {icon ===
          "affiliate" && (
          <Link
            href="/afiliacja"
            className="mt-1.5 inline-flex text-[10px] font-black text-rose-600 transition hover:text-rose-700"
          >
            Jak działa
            afiliacja →
          </Link>
        )}
      </div>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  text,
}: {
  icon:
    | "price"
    | "sizes"
    | "returns";

  title:
    string;

  text:
    string;
}) {
  return (
    <article className="rounded-[20px] border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-white text-rose-600 shadow-sm">
        <FeatureIcon
          type={
            icon
          }
        />
      </span>

      <h3 className="mt-4 text-sm font-black tracking-[-0.02em] text-stone-900">
        {
          title
        }
      </h3>

      <p className="mt-1.5 text-[11px] leading-5 text-stone-500 sm:text-xs sm:leading-6">
        {
          text
        }
      </p>
    </article>
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
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
        ✓
      </span>

      <p className="text-sm leading-6 text-stone-600">
        {
          children
        }
      </p>
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
      <CheckIcon />
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
    <ExternalArrowIcon />
  );
}

function FeatureIcon({
  type,
}: {
  type:
    | "price"
    | "sizes"
    | "returns";
}) {
  if (
    type ===
    "price"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12 12 20 4 12l8-8Z" />

        <circle
          cx="9"
          cy="9"
          r="1"
        />

        <circle
          cx="15"
          cy="15"
          r="1"
        />

        <path d="m15 9-6 6" />
      </svg>
    );
  }

  if (
    type ===
    "sizes"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7h16v10H4z" />

        <path d="M8 7v4" />

        <path d="M12 7v2" />

        <path d="M16 7v4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h13" />

      <path d="m6 4-3 3 3 3" />

      <path d="M21 17H8" />

      <path d="m18 14 3 3-3 3" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
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
  );
}

function CheckIcon() {
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

function ExternalArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
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

function ShieldIcon() {
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
      <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AffiliateIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />

      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </svg>
  );
}