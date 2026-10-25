
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import ProductPhoto from "@/components/ProductPhoto";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { slugifyCategory } from "@/lib/categories";
import { getCurrentSlugForOldProductSlug } from "@/lib/product-redirect";
import { getLooksForProduct } from "@/lib/stylizacje";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import {
  formatPrice,
  getProductBySlug,
  getProducts,
  type Product,
} from "@/lib/products";
import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

/* ======================================================
   DANE I FUNKCJE POMOCNICZE
====================================================== */

function normalizeText(
  value: string | null | undefined
) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(product: Product) {
  return (
    normalizeText(product.name) ||
    normalizeText(product.shortName) ||
    "Produkt"
  );
}

function shortText(
  value: string,
  limit: number
) {
  if (value.length <= limit) {
    return value;
  }

  const cut = value.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");

  return `${
    (
      lastSpace > limit * 0.65
        ? cut.slice(0, lastSpace)
        : cut
    )
      .trim()
      .replace(/[.,;:!?-]+$/, "")
  }…`;
}

function metaDescription(
  product: Product
) {
  return shortText(
    `${displayName(product)} – ${
      normalizeText(product.category)
    }. ${
      normalizeText(product.description)
    } Cena zapisana: ${
      formatPrice(product.price)
    }. Sprawdź ofertę w SHEIN.`,
    160
  );
}

function getPriceDifference(
  product: Product
) {
  const { price, oldPrice } = product;

  if (
    oldPrice === null ||
    !Number.isFinite(price) ||
    !Number.isFinite(oldPrice) ||
    price < 0 ||
    oldPrice <= price ||
    oldPrice <= 0
  ) {
    return null;
  }

  return { oldPrice };
}

/* ======================================================
   SEO
====================================================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    const currentSlug =
      await getCurrentSlugForOldProductSlug(slug);

    if (currentSlug) {
      permanentRedirect(`/produkt/${currentSlug}`);
    }

    return {
      title: "Produkt nie został znaleziony",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    `${displayName(product)} – cena i oferta SHEIN`;

  const description =
    metaDescription(product);

  const url =
    `${getSiteUrl()}/produkt/${product.slug}`;

  const image = product.image?.trim();

  return {
    title,
    description,
    category: product.category,

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: SITE_LANGUAGE,
      siteName: SITE_NAME,
      url,
      title: `${
        displayName(product)
      } | ${SITE_NAME}`,
      description,
      images: image
        ? [
            {
              url: image,
              alt: product.name,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: `${
        displayName(product)
      } | ${SITE_NAME}`,
      description,
      images: image
        ? [image]
        : undefined,
    },
  };
}

/* ======================================================
   STRONA PRODUKTU
====================================================== */

export default async function ProductPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    const currentSlug =
      await getCurrentSlugForOldProductSlug(slug);

    if (currentSlug) {
      permanentRedirect(`/produkt/${currentSlug}`);
    }

    notFound();
  }

  const name = displayName(product);

  const category =
    normalizeText(product.category) ||
    "Produkty";

  const categorySlug =
    slugifyCategory(category);

  const categoryHref =
    `/kategoria/${categorySlug}`;

  const image = product.image?.trim();

  const description =
    normalizeText(product.description);

  const intro = description
    ? shortText(description, 155)
    : "";

  const comparison =
    getPriceDifference(product);

  const goHref = `/go/${product.id}`;

  const siteUrl = getSiteUrl();

  const url =
    `${siteUrl}/produkt/${product.slug}`;

  const allProducts = await getProducts();

  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 4);

  // Show only complete outfits containing this active product.
  const matchingLooks = getLooksForProduct(
    await getAllResolvedLooks(allProducts),
    product.slug
  ).slice(0, 3);

  /*
   * SEO:
   * Ceny to wartości zapisane w katalogu.
   * Nie tworzymy niezweryfikowanej bieżącej
   * oferty cenowej w danych strukturalnych.
   */

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: product.name,
        description:
          metaDescription(product),
        inLanguage: SITE_LANGUAGE,
        datePublished:
          product.createdAt,

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
            `${url}#breadcrumb`,
        },

        mainEntity: {
          "@id":
            `${url}#product`,
        },
      },

      ...(image
        ? [
            {
              "@type": "ImageObject",
              "@id":
                `${url}#primaryimage`,
              url: image,
              contentUrl: image,
              caption: product.name,
              representativeOfPage:
                true,
            },
          ]
        : []),

      {
        "@type": "Product",
        "@id": `${url}#product`,
        url,
        name: product.name,
        alternateName:
          product.shortName,
        description,
        category,

        ...(image
          ? { image: [image] }
          : {}),

        mainEntityOfPage: {
          "@id":
            `${url}#webpage`,
        },

        additionalProperty: [
          {
            "@type": "PropertyValue",
            name:
              "Cena zapisana przy publikacji",
            value:
              formatPrice(product.price),
          },

          ...(comparison
            ? [
                {
                  "@type":
                    "PropertyValue",
                  name:
                    "Poprzednia cena zapisana w katalogu",
                  value:
                    formatPrice(
                      comparison.oldPrice
                    ),
                },
              ]
            : []),
        ],
      },

      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Start",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Produkty",
            item:
              `${siteUrl}/okazje`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category,
            item:
              `${siteUrl}${categoryHref}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7] pb-32 text-stone-900 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-5 sm:px-8 sm:pt-7 lg:pb-16">

        {/* OKRUSZKI NAWIGACYJNE */}

        <nav
          aria-label="Okruszki"
          className="horizontal-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-3 text-xs font-semibold text-stone-500"
        >
          <Link
            href="/"
            className="hover:text-rose-700"
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
            className="hover:text-rose-700"
          >
            Produkty
          </Link>

          <span
            aria-hidden="true"
            className="text-stone-300"
          >
            /
          </span>

          <Link
            href={categoryHref}
            className="hover:text-rose-700"
          >
            {category}
          </Link>

          <span
            aria-hidden="true"
            className="text-stone-300"
          >
            /
          </span>

          <span
            aria-current="page"
            className="max-w-36 truncate text-stone-800 sm:max-w-xs"
          >
            {name}
          </span>
        </nav>

        {/* ZDJĘCIE + INFORMACJE */}

        <div className="mt-3 grid min-w-0 items-start gap-5 sm:gap-8 lg:mt-7 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-10 xl:gap-14">

          {/* LEWA KOLUMNA – ZDJĘCIE */}

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[26px] border border-rose-100 bg-white shadow-[0_12px_40px_rgba(28,25,23,0.055)] sm:rounded-[30px]">
              <div className="relative aspect-square w-full bg-gradient-to-br from-rose-50 via-[#F9F6F3] to-stone-100 lg:aspect-[4/5] xl:aspect-square">
                <ProductPhoto
                  src={image}
                  alt={product.name}
                  sizes="(max-width: 639px) 88vw, (max-width: 1023px) 86vw, (max-width: 1279px) 46vw, 40vw"
                  priority
                  className="p-4 sm:p-6"
                />

                {product.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3.5 py-2 text-xs font-extrabold text-rose-700 shadow-sm sm:left-5 sm:top-5">
                    Wybrane znalezisko
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 px-1 text-xs leading-6 text-stone-500">
              Zdjęcie z oferty produktu. Kolor
              i detale sprawdź na stronie
              sklepu.
            </p>
          </div>

          {/* PRAWA KOLUMNA – PRODUKT */}

          <section
            aria-labelledby="product-title"
            className="min-w-0 lg:py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={categoryHref}
                className="inline-flex min-h-9 items-center rounded-full bg-rose-50 px-3.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
              >
                {category}
              </Link>

              {product.sold?.trim() && (
                <span className="max-w-full truncate rounded-full border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600">
                  {product.sold}
                </span>
              )}
            </div>

            {/* NAZWA */}

            <h1
              id="product-title"
              className="mt-4 break-words text-pretty text-[clamp(1.7rem,6.4vw,2.85rem)] font-black leading-[1.15] tracking-[-0.04em] text-stone-950 sm:mt-5"
            >
              {name}
            </h1>

            {/* KRÓTKI OPIS */}

            {intro && (
              <p className="mt-3 max-w-prose text-[15px] leading-[1.8] text-stone-600 sm:mt-4 sm:text-base sm:leading-8">
                {intro}
              </p>
            )}

            {description && (
              <a
                href="#opis-produktu"
                className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-extrabold text-rose-700 underline decoration-rose-200 underline-offset-4 hover:text-rose-800"
              >
                Pełny opis produktu
                <ArrowDownIcon />
              </a>
            )}

            {/* KARTA CENY */}

            <div className="mt-6 min-w-0 rounded-[26px] border border-rose-200 bg-white p-5 shadow-[0_14px_42px_rgba(136,19,55,0.07)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase leading-5 tracking-[0.1em] text-rose-700">
                  Cena zapisana w katalogu
                </p>

                <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                  Sprawdź cenę w SHEIN
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1.5">
                <strong className="break-words text-[clamp(2.1rem,8vw,3.5rem)] font-black leading-tight tracking-[-0.055em] text-stone-950">
                  {formatPrice(product.price)}
                </strong>

                {comparison && (
                  <span className="pb-1 text-xs font-semibold leading-5 text-stone-500">
                    Poprzednia cena w katalogu: {formatPrice(comparison.oldPrice)}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                To cena zapisana w naszym katalogu, nie gwarancja ceny w sklepie.
                Rozmiary, dostępność i ostateczną kwotę sprawdzisz w SHEIN.
              </p>

              {/* PRZEJŚCIE DO SHEIN */}

              <a
                href={goHref}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="mt-5 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-rose-600 px-4 py-3.5 text-center text-[15px] font-black leading-6 text-white shadow-[0_10px_24px_rgba(225,29,72,0.19)] transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 motion-safe:active:scale-[0.99] sm:text-base"
              >
                Sprawdź aktualną ofertę w SHEIN
                <ExternalLinkIcon />
              </a>

              <p className="mt-3 text-center text-xs leading-5 text-stone-600">
                Link afiliacyjny · sklep otworzy się w nowej karcie.
              </p>
            </div>

            {/* DODATKOWE INFORMACJE */}

            <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
              <div className="rounded-[18px] border border-stone-200 bg-white px-5 py-4">
                <p className="text-sm font-extrabold text-stone-900">
                  Rozmiar i kolor
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-600">
                  Wybierasz w sklepie
                </p>
              </div>

              <div className="rounded-[18px] border border-stone-200 bg-white px-5 py-4">
                <p className="text-sm font-extrabold text-stone-900">
                  Dostawa i zwroty
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-600">
                  Według zasad SHEIN
                </p>
              </div>
            </div>

            <Link
              href="/promocje-shein"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-rose-700 transition hover:text-rose-800"
            >
              Sprawdź kampanie i kupony SHEIN
              <ArrowRightIcon />
            </Link>
          </section>
        </div>

        {/* OPIS PRODUKTU */}

        <div className="mt-11 grid min-w-0 gap-5 lg:mt-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.75fr)] lg:gap-6">
          <section
            id="opis-produktu"
            aria-labelledby="description-title"
            className="scroll-mt-28 rounded-[24px] border border-stone-200 bg-white px-5 py-7 sm:px-8 sm:py-9"
          >
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
              Poznaj szczegóły
            </p>

            <h2
              id="description-title"
              className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
            >
              Opis produktu
            </h2>

            <div
              aria-hidden="true"
              className="mt-5 h-1 w-12 rounded-full bg-rose-500"
            />

            {description ? (
              description.length > 550 ? (
                <>
                  <p className="mt-5 max-w-prose text-[15px] leading-8 text-stone-700 sm:text-base">
                    {shortText(description, 320)}
                  </p>

                  <details className="group mt-4">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 [&::-webkit-details-marker]:hidden">
                      Rozwiń cały opis
                      <ChevronIcon />
                    </summary>

                    <p className="mt-4 max-w-prose whitespace-pre-line break-words text-[15px] leading-8 text-stone-700 sm:text-base">
                      {product.description}
                    </p>
                  </details>
                </>
              ) : (
                <p className="mt-5 max-w-prose whitespace-pre-line break-words text-[15px] leading-8 text-stone-700 sm:text-base">
                  {product.description}
                </p>
              )
            ) : (
              <p className="mt-5 text-sm leading-7 text-stone-600">
                Szczegóły produktu sprawdzisz
                na stronie sklepu.
              </p>
            )}
          </section>

          {/* INFORMACJE PRZED ZAKUPEM */}

          <aside className="rounded-[24px] border border-rose-100 bg-rose-50/70 px-5 py-7 sm:px-7">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
              Przed zakupem
            </p>

            <h2 className="mt-2 text-xl font-black tracking-tight text-stone-900">
              Co warto sprawdzić?
            </h2>

            <ul className="mt-5 space-y-4">
              <ChecklistItem>
                Aktualną cenę i dostępność produktu
              </ChecklistItem>

              <ChecklistItem>
                Rozmiar, kolor i tabelę wymiarów
              </ChecklistItem>

              <ChecklistItem>
                Koszt dostawy i zasady zwrotów
              </ChecklistItem>

              <ChecklistItem>
                Warunki kodów i promocji
              </ChecklistItem>
            </ul>

            <div className="mt-6 border-t border-rose-200/80 pt-5">
              <p className="text-sm font-bold text-stone-900">
                Przejrzyste zasady
              </p>

              <p className="mt-2 text-sm leading-7 text-stone-700">
                Trend za Mniej prezentuje
                znaleziska, ale nie jest sklepem.
                Link może być afiliacyjny —
                możemy otrzymać prowizję
                za kwalifikujący się zakup.
              </p>

              <Link
                href="/afiliacja"
                className="mt-2 inline-flex min-h-10 items-center text-sm font-extrabold text-rose-700 hover:text-rose-800"
              >
                Dowiedz się więcej
                <ArrowRightIcon />
              </Link>
            </div>
          </aside>
        </div>

        {/* PRAKTYCZNE STYLIZACJE Z TYM PRODUKTEM */}
        {matchingLooks.length > 0 && (
          <section aria-labelledby="product-outfits-title" className="mt-12 lg:mt-16">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                  Pomysł na cały zestaw
                </p>
                <h2 id="product-outfits-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Z czym połączyć ten produkt?
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Gotowe stylizacje z tym elementem — bez samodzielnego dobierania całego zestawu.
                </p>
              </div>
              <Link href="/stylizacje" className="text-sm font-extrabold text-rose-700 hover:underline">
                Wszystkie stylizacje →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matchingLooks.map((look) => (
                <Link
                  key={look.slug}
                  href={`/stylizacje/${look.slug}`}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-rose-600 motion-reduce:transform-none"
                >
                  <div className="grid h-36 grid-cols-2 gap-2 bg-rose-50/70 p-2 sm:h-40">
                    {look.products.slice(0, 2).map((lookProduct) => (
                      <div
                        key={lookProduct.id}
                        className="relative min-w-0 overflow-hidden rounded-2xl bg-white"
                      >
                        <ProductPhoto
                          src={lookProduct.image}
                          alt={lookProduct.name}
                          sizes="(max-width: 639px) 42vw, (max-width: 1023px) 22vw, 15vw"
                          className="p-2 transition-transform duration-300 motion-safe:group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-rose-700">
                      {look.occasion} · {look.style}
                    </span>
                    <h3 className="mt-2 text-lg font-black leading-snug text-stone-950 group-hover:text-rose-700">
                      {look.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{look.intro}</p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-stone-100 pt-4 sm:mt-5">
                      <span className="text-xs leading-5 text-stone-500">
                        {look.products.length} elementy · bez dostawy
                      </span>
                      <span className="text-lg font-black tracking-tight text-stone-900">
                        {formatPrice(look.total)}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 text-sm font-black text-rose-700 group-hover:bg-rose-600 group-hover:text-white">
                      Zobacz cały zestaw <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PODOBNE PRODUKTY */}

        {relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-title"
            className="mt-12 lg:mt-16"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                  Więcej inspiracji
                </p>

                <h2
                  id="related-title"
                  className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
                >
                  Może Ci się spodobać
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Podobne produkty z kategorii{" "}
                  {category}.
                </p>
              </div>

              <Link
                href={categoryHref}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-rose-700 hover:text-rose-800"
              >
                Zobacz kategorię
                <ArrowRightIcon />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(
                (item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* KOŃCOWE PRZEJŚCIE */}

        <div className="mt-10 flex min-w-0 flex-col gap-4 rounded-[24px] bg-stone-900 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-black tracking-[-0.025em] sm:text-2xl">
              Odkrywaj kolejne znaleziska
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
              Zobacz więcej produktów
              i inspiracji w swoim stylu.
            </p>
          </div>

          <Link
            href="/okazje"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-stone-900 transition hover:bg-rose-50"
          >
            Przejrzyj produkty
            <ArrowRightIcon />
          </Link>
        </div>
      </div>

      <SiteFooter />

      {/* MOBILNY PRZYCISK ZAKUPU */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 px-5 pt-2.5 shadow-[0_-7px_28px_rgba(28,25,23,0.09)] backdrop-blur-xl md:hidden">
        <div
          className="mx-auto flex max-w-lg items-center gap-2.5"
          style={{
            paddingBottom:
              "max(0.65rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-stone-500">
              Cena w katalogu
            </p>

            <p className="break-words text-[clamp(1rem,4.5vw,1.25rem)] font-black leading-6 tracking-[-0.04em] text-stone-950">
              {formatPrice(product.price)}
            </p>
          </div>

          <a
            href={goHref}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-sm font-extrabold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 min-[380px]:px-5"
          >
            Sprawdź w SHEIN
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </main>
  );
}

/* ======================================================
   MAŁE KOMPONENTY
====================================================== */

function ChecklistItem({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-rose-700"
      >
        ✓
      </span>

      <span className="text-sm leading-6 text-stone-700">
        {children}
      </span>
    </li>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-1 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 4v16m-6-6 6 6 6-6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition group-open:rotate-180"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
