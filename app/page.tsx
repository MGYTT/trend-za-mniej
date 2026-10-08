import type {
  ReactNode,
} from "react";

import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  slugifyCategory,
} from "@/lib/categories";

import {
  getFeaturedProducts,
  getProducts,
  type Product,
} from "@/lib/products";

import {
  SHEIN_PROMOTIONS,
  type SheinPromotion,
} from "@/lib/shein-promotions";

export const revalidate =
  60;

type HomeCategory = {
  name: string;
  href: string;
};

export default async function Home() {
  const [
    products,
    featuredProducts,
  ] =
    await Promise.all([
      getProducts(),
      getFeaturedProducts(),
    ]);

  const hotProducts =
    (
      featuredProducts.length >
      0
        ? featuredProducts
        : products
    ).slice(
      0,
      4
    );

  const latestProducts =
    products.slice(
      0,
      4
    );

  const featuredPromotions =
    SHEIN_PROMOTIONS.slice(
      0,
      4
    );

  const categoryNames = [
    ...new Set(
      products
        .map(
          (
            product
          ) =>
            product.category
        )
        .filter(
          Boolean
        )
    ),
  ];

  const categories:
    HomeCategory[] =
    categoryNames
      .map(
        (
          category
        ) => ({
          name:
            category,

          href:
            `/kategoria/${slugifyCategory(
              category
            )}`,
        })
      )
      .slice(
        0,
        10
      );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <Hero
        productsCount={
          products.length
        }
        promotionsCount={
          SHEIN_PROMOTIONS.length
        }
      />

      <ChoosePath />

      <PromotionSection
        promotions={
          featuredPromotions
        }
      />

      <CategoryBar
        categories={
          categories
        }
      />

      <ProductSection
        eyebrow="Wybrane dla Ciebie"
        title="Gorące okazje"
        description="Wybrane produkty, które warto sprawdzić w pierwszej kolejności."
        products={
          hotProducts
        }
        href="/okazje"
        linkLabel="Wszystkie okazje"
      />

      <ProductSection
        id="najnowsze"
        eyebrow="Ostatnio dodane"
        title="Najnowsze znaleziska"
        description="Najświeższe produkty dodane do Trend za Mniej."
        products={
          latestProducts
        }
        href="/okazje?sort=newest"
        linkLabel="Zobacz najnowsze"
        alternate
      />

      <HowItWorks />

      <FinalCallToAction />

      <SiteFooter />
    </main>
  );
}

function Hero({
  productsCount,
  promotionsCount,
}: {
  productsCount: number;
  promotionsCount: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-rose-100/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-[11px] font-black text-rose-700 sm:text-xs">
              <span
                aria-hidden="true"
              >
                ✨
              </span>

              Moda, promocje
              i okazje SHEIN
            </span>
          </div>

          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.03] tracking-[-0.05em] text-stone-900 sm:text-5xl lg:text-[60px]">
            Promocje SHEIN,
            kody i modne{" "}
            <span className="text-rose-600">
              okazje
            </span>{" "}
            w jednym miejscu
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
            Szybciej znajdź
            aktualne kampanie,
            wybrane produkty
            i rzeczy w swoim
            budżecie bez
            przeglądania setek
            ofert.
          </p>

          <form
            action="/okazje"
            method="get"
            className="mx-auto mt-7 max-w-2xl"
          >
            <div className="rounded-[22px] border border-stone-200 bg-white p-2 shadow-lg shadow-stone-200/40">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />

                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="search"
                    name="q"
                    placeholder="Szukaj sukienki, swetra, torebki..."
                    aria-label="Szukaj produktów"
                    className="min-h-[54px] w-full rounded-2xl border-0 bg-stone-50 py-3 pl-12 pr-4 text-base outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[54px] rounded-2xl bg-rose-600 px-7 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
                >
                  Szukaj
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/promocje-shein"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800"
            >
              <span
                aria-hidden="true"
              >
                🔥
              </span>

              Promocje SHEIN
            </Link>

            <Link
              href="/okazje"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Przeglądaj produkty
            </Link>

            <Link
              href="/okazje?maxPrice=50"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Do 50 zł
            </Link>
          </div>

          <div className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-stone-400 sm:text-xs">
            <span>
              {
                productsCount
              }{" "}
              {getProductWord(
                productsCount
              )}
            </span>

            <span
              aria-hidden="true"
            >
              •
            </span>

            <span>
              {
                promotionsCount
              }{" "}
              kampanie SHEIN
            </span>

            <span
              aria-hidden="true"
            >
              •
            </span>

            <span>
              Bez zakładania konta
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChoosePath() {
  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
            Zacznij tutaj
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl">
            Czego dzisiaj
            szukasz?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Wybierz najprostszą
            drogę i przejdź
            od razu do tego,
            czego potrzebujesz.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <PathCard
            href="/promocje-shein"
            icon="🔥"
            eyebrow="Promocje i kody"
            title="Chcę sprawdzić promocje SHEIN"
            description="Kupony, kampanie, wyprzedaże i wyróżnione akcje zebrane w jednym miejscu."
            buttonLabel="Zobacz promocje"
            featured
          />

          <PathCard
            href="/okazje"
            icon="🛍️"
            eyebrow="Produkty"
            title="Szukam konkretnej rzeczy"
            description="Przeglądaj ubrania, dodatki, beauty, produkty do domu i inne znaleziska."
            buttonLabel="Przeglądaj produkty"
          />

          <PathCard
            href="/okazje?maxPrice=50"
            icon="💸"
            eyebrow="Budżet"
            title="Chcę znaleźć coś taniego"
            description="Przejdź bezpośrednio do produktów w cenie do 50 zł."
            buttonLabel="Zobacz do 50 zł"
          />
        </div>
      </div>
    </section>
  );
}

function PathCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  buttonLabel,
  featured = false,
}: {
  href: string;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className={[
        "group flex min-h-[250px] flex-col rounded-[24px] border p-5 shadow-sm transition sm:p-6",
        featured
          ? "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 hover:border-rose-300 hover:shadow-md"
          : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md",
      ].join(
        " "
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
        {icon}
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-black leading-tight tracking-[-0.025em] text-stone-900">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-stone-500">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-black text-stone-900 transition group-hover:text-rose-700">
          {buttonLabel}
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-rose-100 group-hover:text-rose-700">
          →
        </span>
      </div>
    </Link>
  );
}

function PromotionSection({
  promotions,
}: {
  promotions:
    SheinPromotion[];
}) {
  if (
    promotions.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="promocje"
      className="scroll-mt-24 border-b border-stone-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <SectionHeader
          eyebrow="Promocje SHEIN"
          title="Warto sprawdzić teraz"
          description="Wybrane kampanie, kupony i akcje dostępne w naszym aktualnym zestawieniu."
          href="/promocje-shein"
          linkLabel="Wszystkie promocje"
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promotions.map(
            (
              promotion
            ) => (
              <HomePromotionCard
                key={
                  promotion.id
                }
                promotion={
                  promotion
                }
              />
            )
          )}
        </div>

        <Link
          href="/promocje-shein"
          className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800 sm:hidden"
        >
          Zobacz wszystkie promocje
          <span className="ml-2">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

function HomePromotionCard({
  promotion,
}: {
  promotion:
    SheinPromotion;
}) {
  return (
    <Link
      href={`/promocje-shein#${promotion.id}`}
      className="group flex min-h-[220px] flex-col rounded-[20px] border border-stone-200 bg-stone-50 p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/40 hover:shadow-sm"
    >
      <div>
        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-rose-700 shadow-sm">
          {
            promotion.badge
          }
        </span>

        <h3 className="mt-3 text-base font-black leading-snug tracking-[-0.02em] text-stone-900">
          {
            promotion.title
          }
        </h3>
      </div>

      <div className="mt-auto pt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
          Kod kampanii
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <code className="text-sm font-black tracking-[0.05em] text-stone-800">
            {
              promotion.code
            }
          </code>

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-stone-400 shadow-sm transition group-hover:text-rose-700">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryBar({
  categories,
}: {
  categories:
    HomeCategory[];
}) {
  if (
    categories.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="kategorie"
      className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
    >
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Przeglądaj szybciej
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-stone-900 sm:text-2xl">
              Popularne kategorie
            </h2>
          </div>

          <Link
            href="/okazje"
            className="hidden shrink-0 text-xs font-black text-rose-600 transition hover:text-rose-700 sm:block"
          >
            Wszystkie →
          </Link>
        </div>

        <div className="horizontal-scroll -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map(
            (
              category
            ) => (
              <Link
                key={
                  category.name
                }
                href={
                  category.href
                }
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                {
                  category.name
                }
              </Link>
            )
          )}

          <Link
            href="/okazje"
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-rose-100 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 sm:hidden"
          >
            Wszystkie →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  id,
  eyebrow,
  title,
  description,
  products,
  href,
  linkLabel,
  alternate = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  href: string;
  linkLabel: string;
  alternate?: boolean;
}) {
  return (
    <section
      id={
        id
      }
      className={[
        "scroll-mt-24 border-b border-stone-200",
        alternate
          ? "bg-white"
          : "bg-stone-50",
      ].join(
        " "
      )}
    >
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <SectionHeader
          eyebrow={
            eyebrow
          }
          title={
            title
          }
          description={
            description
          }
          href={
            href
          }
          linkLabel={
            linkLabel
          }
        />

        {products.length >
        0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {products.map(
                (
                  product
                ) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />
                )
              )}
            </div>

            <Link
              href={
                href
              }
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:hidden"
            >
              {
                linkLabel
              }{" "}
              →
            </Link>
          </>
        ) : (
          <EmptyBox>
            Brak produktów
            do wyświetlenia.
          </EmptyBox>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          {description}
        </p>
      </div>

      <Link
        href={
          href
        }
        className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
            Bez komplikacji
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl">
            Jak działa Trend
            za Mniej?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-stone-500">
            My porządkujemy
            produkty i promocje.
            Ty wybierasz to,
            co naprawdę Cię
            interesuje.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-3 md:grid-cols-3">
          <HowStep
            number="1"
            title="Znajdź"
            description="Wyszukaj produkt albo przejdź do promocji, kategorii lub wybranego budżetu."
          />

          <HowStep
            number="2"
            title="Sprawdź"
            description="Zobacz opis, cenę zapisaną przy publikacji, kod kampanii i najważniejsze informacje."
          />

          <HowStep
            number="3"
            title="Przejdź do SHEIN"
            description="Aktualną cenę, dostępność, warianty i warunki promocji potwierdzasz bezpośrednio w SHEIN."
          />
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-6 text-stone-400">
          Trend za Mniej
          nie jest sklepem.
          Część linków ma
          charakter afiliacyjny.{" "}
          <Link
            href="/afiliacja"
            className="font-bold text-stone-500 underline decoration-stone-300 underline-offset-2 transition hover:text-rose-600"
          >
            Jak działa afiliacja?
          </Link>
        </p>
      </div>
    </section>
  );
}

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-5 text-center shadow-sm">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-700">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-black text-stone-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-stone-500">
        {description}
      </p>
    </div>
  );
}

function FinalCallToAction() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-[28px] bg-stone-900 p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-300">
                Nie wiesz od czego
                zacząć?
              </p>

              <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                Zacznij od aktualnych
                promocji albo przejrzyj
                wszystkie okazje.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                Nie musisz znać
                konkretnego produktu.
                Możesz po prostu
                przeglądać i znaleźć
                coś ciekawego.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
              <Link
                href="/promocje-shein"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-500"
              >
                🔥 Promocje SHEIN
              </Link>

              <Link
                href="/okazje"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-stone-900 transition hover:bg-stone-100"
              >
                Wszystkie okazje
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyBox({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[20px] border border-dashed border-stone-200 bg-white px-5 py-10 text-center text-sm leading-6 text-stone-500">
      {children}
    </div>
  );
}

function getProductWord(
  count: number
) {
  if (
    count ===
    1
  ) {
    return "produkt";
  }

  const lastTwo =
    count %
    100;

  const last =
    count %
    10;

  if (
    lastTwo >=
      12 &&
    lastTwo <=
      14
  ) {
    return "produktów";
  }

  if (
    last >=
      2 &&
    last <=
      4
  ) {
    return "produkty";
  }

  return "produktów";
}