
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { slugifyCategory } from "@/lib/categories";
import {
  getProducts,
  getFeaturedProducts,
  formatPrice,
  type Product,
} from "@/lib/products";
import {
  SHEIN_PROMOTIONS,
  type SheinPromotion,
} from "@/lib/shein-promotions";

export const revalidate = 60;

const FEATURED_LIMIT = 8;
const LATEST_LIMIT = 4;
const CATEGORY_LIMIT = 8;

type CategoryLink = {
  name: string;
  href: string;
};

/* ======================================================
   PRZYGOTOWANIE DANYCH
====================================================== */

function uniqueById(products: Product[]): Product[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function getHomeCategories(
  products: Product[]
): CategoryLink[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const category = product.category?.trim();

    if (!category) continue;

    counts.set(
      category,
      (counts.get(category) ?? 0) + 1
    );
  }

  return [...counts.entries()]
    .sort(
      (a, b) =>
        b[1] - a[1] ||
        a[0].localeCompare(b[0], "pl")
    )
    .slice(0, CATEGORY_LIMIT)
    .map(([name]) => ({
      name,
      href: `/kategoria/${slugifyCategory(name)}`,
    }));
}

/* ======================================================
   STRONA GŁÓWNA
====================================================== */

export default async function Home() {
  const [allProducts, featuredProducts] =
    await Promise.all([
      getProducts(),
      getFeaturedProducts(),
    ]);

  const featured = uniqueById([
    ...featuredProducts,
    ...allProducts,
  ]).slice(0, FEATURED_LIMIT);

  const featuredIds = new Set(
    featured.map((product) => product.id)
  );

  const latest = allProducts
    .filter(
      (product) => !featuredIds.has(product.id)
    )
    .slice(0, LATEST_LIMIT);

  const categories =
    getHomeCategories(allProducts);

  const heroProduct = featured.find(
    (product) => Boolean(product.image?.trim())
  );

  const promotions =
    SHEIN_PROMOTIONS.slice(0, 2);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <Hero product={heroProduct} />

      <Categories categories={categories} />

      <ProductSection
        id="polecane"
        eyebrow="Wybrane dla Ciebie"
        title="Odkryj coś dla siebie"
        subtitle="Modne znaleziska z naszego katalogu."
        products={featured}
        background="white"
        emptyText="Pierwsze znaleziska pojawią się tutaj po dodaniu produktów."
      />

      <DiscoveryShortcuts />

      <ProductSection
        id="najnowsze"
        eyebrow="Nowości"
        title="Jeszcze więcej inspiracji"
        subtitle="Kolejne produkty, które możesz sprawdzić."
        products={latest}
        background="stone"
        emptyText="Na razie to wszystkie dostępne znaleziska. Sprawdź pełny katalog."
      />

      <Promotions promotions={promotions} />

      <HowItWorks />

      <SiteFooter />
    </main>
  );
}

/* ======================================================
   HERO - GÓRNA CZĘŚĆ STRONY
====================================================== */

function Hero({
  product,
}: {
  product?: Product;
}) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-rose-100/80 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-0 h-72 w-72 rounded-full bg-orange-50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-7 pt-7 sm:px-6 sm:pb-12 sm:pt-12 lg:grid-cols-[minmax(0,1.07fr)_minmax(0,0.93fr)] lg:gap-14 lg:pb-16 lg:pt-16">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-extrabold text-rose-700 sm:text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-rose-500"
            />

            Moda, inspiracje i okazje
          </p>

          <h1 className="mt-4 max-w-[680px] text-balance text-[clamp(2.3rem,5vw,4.4rem)] font-black leading-[1.09] tracking-[-0.055em] text-stone-950 sm:mt-5">
            Dobry styl.

            <span className="block text-rose-600">
              Za mniej.
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600 sm:mt-5 sm:text-base sm:leading-8">
            Ubrania, dodatki i ciekawe znaleziska
            w jednym miejscu. Szukaj tego, co
            pasuje do Ciebie i Twojego budżetu.
          </p>

          {/* WYSZUKIWARKA */}

          <form
            action="/okazje"
            method="get"
            role="search"
            className="mt-5 flex max-w-xl items-center gap-2 rounded-[17px] border border-stone-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(28,25,23,0.08)] sm:mt-7 sm:p-2"
          >
            <label
              htmlFor="home-search"
              className="sr-only"
            >
              Szukaj produktów w katalogu
            </label>

            <span
              aria-hidden="true"
              className="ml-2 hidden shrink-0 text-stone-400 min-[360px]:inline-flex"
            >
              <SearchIcon />
            </span>

            <input
              id="home-search"
              type="search"
              name="q"
              maxLength={120}
              enterKeyHint="search"
              placeholder="Np. sukienka, torebka..."
              className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-rose-200 sm:min-h-12 sm:text-base"
            />

            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 sm:min-h-12 sm:px-6"
            >
              Szukaj
            </button>
          </form>

          {/* SZYBKIE PRZEJŚCIA */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-stone-500">
              Na skróty:
            </span>

            <Link
              href="/okazje?maxPrice=50"
              className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              Do 50 zł
            </Link>

            <Link
              href="/okazje?maxPrice=100"
              className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              Do 100 zł
            </Link>

            <Link
              href="/tiktok"
              className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              Z TikToka
            </Link>
          </div>
        </div>

        <HeroVisual product={product} />
      </div>
    </section>
  );
}

/* ======================================================
   ZDJĘCIE HERO NA KOMPUTERZE
====================================================== */

function HeroVisual({
  product,
}: {
  product?: Product;
}) {
  if (!product) {
    return (
      <div className="hidden min-h-[390px] items-center justify-center rounded-[28px] border border-rose-100 bg-rose-50 p-10 text-center lg:flex">
        <p className="text-4xl font-black tracking-tight text-rose-700">
          Znajdź swój styl.
        </p>
      </div>
    );
  }

  return (
    <div className="relative hidden w-full max-w-[460px] justify-self-end lg:block">
      <div
        aria-hidden="true"
        className="absolute -right-5 -top-5 h-36 w-36 rounded-full bg-rose-100"
      />

      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz produkt: ${
          product.shortName || product.name
        }`}
        className="group relative block overflow-hidden rounded-[30px] border border-stone-200 bg-[#f6f4f2] shadow-[0_24px_60px_rgba(28,25,23,0.12)] transition hover:-translate-y-1"
      >
        <div className="aspect-[5/4] p-5">
          <img
            src={product.image}
            alt={product.name}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.025]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-rose-700">
              Wybrane znalezisko
            </p>

            <p className="mt-1 truncate text-sm font-extrabold text-stone-900">
              {product.shortName || product.name}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-rose-50 px-3 py-2 text-sm font-black text-rose-700">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ======================================================
   KATEGORIE
====================================================== */

function Categories({
  categories,
}: {
  categories: CategoryLink[];
}) {
  return (
    <section
      aria-labelledby="home-categories-heading"
      className="border-b border-stone-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="home-categories-heading"
            className="text-sm font-extrabold text-stone-900 sm:text-base"
          >
            Przeglądaj kategorie
          </h2>

          <Link
            href="/kategorie"
            className="shrink-0 text-xs font-extrabold text-rose-700 hover:text-rose-800 sm:text-sm"
          >
            Wszystkie
            <span aria-hidden="true"> →</span>
          </Link>
        </div>

        {categories.length > 0 && (
          <nav
            aria-label="Kategorie produktów"
            className="horizontal-scroll -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:min-h-11 sm:px-4 sm:text-sm"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

/* ======================================================
   NAGŁÓWKI SEKCJI
====================================================== */

function SectionTitle({
  id,
  eyebrow,
  title,
  subtitle,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-rose-700 sm:text-xs">
        {eyebrow}
      </p>

      <h2
        id={id}
        className="mt-1.5 text-[23px] font-black leading-tight tracking-[-0.035em] text-stone-950 sm:mt-2 sm:text-3xl"
      >
        {title}
      </h2>

      <p className="mt-1.5 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
        {subtitle}
      </p>
    </div>
  );
}

/* ======================================================
   SEKCJA PRODUKTÓW
====================================================== */

function ProductSection({
  id,
  eyebrow,
  title,
  subtitle,
  products,
  background,
  emptyText,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  background: "white" | "stone";
  emptyText: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 border-b border-stone-200 ${
        background === "white"
          ? "bg-white"
          : "bg-stone-50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle
            id={`${id}-heading`}
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
          />

          <Link
            href="/okazje"
            className="hidden min-h-10 items-center gap-1 text-sm font-extrabold text-rose-700 transition hover:text-rose-800 sm:inline-flex"
          >
            Zobacz wszystkie
            <ArrowIcon />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-white px-5 py-6 text-sm leading-6 text-stone-600">
            {emptyText}
          </div>
        )}

        <Link
          href="/okazje"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-extrabold text-stone-800 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:hidden"
        >
          Przejdź do katalogu
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

/* ======================================================
   KOMPAKTOWA KARTA PRODUKTU
====================================================== */

function HomeProductCard({
  product,
}: {
  product: Product;
}) {
  const name =
    product.shortName?.trim() || product.name;

  const imageUrl = product.image?.trim();

  const hasOldPrice =
    product.oldPrice !== null &&
    Number.isFinite(product.oldPrice) &&
    Number.isFinite(product.price) &&
    product.oldPrice > product.price;

  return (
    <article className="group flex h-full min-w-0 overflow-hidden rounded-[17px] border border-stone-200 bg-white shadow-[0_4px_16px_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md sm:rounded-[23px]">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz szczegóły produktu: ${name}`}
        className="flex h-full w-full min-w-0 flex-col focus-visible:outline-none"
      >
        {/* ZDJĘCIE */}

        <div className="relative aspect-square w-full overflow-hidden bg-[#f6f4f2] md:aspect-[4/5]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold text-stone-500">
              Zdjęcie niedostępne
            </div>
          )}

          {product.featured && (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">
              Wybrane
            </span>
          )}
        </div>

        {/* TREŚĆ */}

        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.06em] text-rose-700 sm:text-xs">
            {product.category}
          </p>

          <h3 className="mt-1.5 line-clamp-2 min-h-[2.55em] text-[13px] font-extrabold leading-[1.28] tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:mt-2 sm:text-base">
            {name}
          </h3>

          {/* CENA */}

          <div className="mt-auto pt-2.5 sm:pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong className="text-[18px] font-black leading-tight tracking-[-0.04em] text-stone-950 sm:text-2xl">
                {formatPrice(product.price)}
              </strong>

              {hasOldPrice &&
                product.oldPrice !== null && (
                  <span className="text-[10px] font-semibold text-stone-500 line-through sm:text-xs">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
            </div>

            <p className="mt-1 hidden text-xs text-stone-500 sm:block">
              Cena zapisana przy publikacji
            </p>

            <span className="mt-2.5 flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-2 text-xs font-extrabold text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white sm:mt-4 sm:min-h-11 sm:rounded-xl sm:text-sm">
              Zobacz produkt
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ======================================================
   SZYBKI WYBÓR BUDŻETU
====================================================== */

function DiscoveryShortcuts() {
  return (
    <section
      aria-labelledby="home-discover-heading"
      className="border-b border-stone-200 bg-rose-50/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="home-discover-heading"
            className="text-lg font-black tracking-tight text-stone-900 sm:text-2xl"
          >
            Odkrywaj po swojemu
          </h2>

          <Link
            href="/okazje"
            className="text-xs font-extrabold text-rose-700 hover:text-rose-800 sm:text-sm"
          >
            Wszystkie okazje →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          <DiscoveryLink
            href="/okazje?maxPrice=50"
            title="Do 50 zł"
            subtitle="Mały budżet"
          />

          <DiscoveryLink
            href="/okazje?maxPrice=100"
            title="Do 100 zł"
            subtitle="Więcej wyboru"
          />

          <DiscoveryLink
            href="/tiktok"
            title="Z TikToka"
            subtitle="Nasze inspiracje"
          />
        </div>
      </div>
    </section>
  );
}

function DiscoveryLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-20 min-w-0 flex-col justify-between rounded-[16px] border border-rose-100 bg-white p-3 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md sm:min-h-28 sm:rounded-[22px] sm:p-5"
    >
      <span
        aria-hidden="true"
        className="self-end text-rose-600 transition group-hover:translate-x-0.5"
      >
        ↗
      </span>

      <span className="min-w-0">
        <strong className="block text-[13px] font-black leading-tight text-stone-900 sm:text-xl">
          {title}
        </strong>

        <span className="mt-1 hidden text-xs text-stone-500 sm:block">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}

/* ======================================================
   PROMOCJE SHEIN
====================================================== */

function Promotions({
  promotions,
}: {
  promotions: SheinPromotion[];
}) {
  if (promotions.length === 0) return null;

  return (
    <section
      aria-labelledby="home-promotions-heading"
      className="border-b border-stone-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle
            id="home-promotions-heading"
            eyebrow="SHEIN"
            title="Kody i kampanie"
            subtitle="Sprawdź możliwości i warunki bezpośrednio w sklepie."
          />

          <Link
            href="/promocje-shein"
            className="hidden min-h-10 items-center gap-1 text-sm font-extrabold text-rose-700 hover:text-rose-800 sm:inline-flex"
          >
            Wszystkie promocje
            <ArrowIcon />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
          {promotions.map((promotion) => (
            <Link
              key={promotion.id}
              href="/promocje-shein"
              className="group rounded-[20px] border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white p-4 transition hover:border-rose-300 hover:shadow-md sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-rose-700 shadow-sm">
                  {promotion.badge}
                </span>

                <ArrowIcon />
              </div>

              <h3 className="mt-3 line-clamp-2 text-lg font-black leading-snug tracking-tight text-stone-900 sm:text-xl">
                {promotion.title}
              </h3>

              <p className="mt-2 line-clamp-2 text-xs leading-6 text-stone-600 sm:text-sm">
                {promotion.description}
              </p>

              {promotion.code && (
                <p className="mt-3 text-xs font-bold text-stone-600">
                  Kod kampanii:{" "}
                  <span className="font-black tracking-wider text-rose-700">
                    {promotion.code}
                  </span>
                </p>
              )}

              <span className="mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-extrabold text-rose-700 group-hover:text-rose-800">
                Zobacz szczegóły
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs leading-5 text-stone-500">
          Kody kampanii nie zawsze oznaczają
          kupony do wpisania w koszyku.
          Aktualne zasady sprawdź w SHEIN.
        </p>

        <Link
          href="/promocje-shein"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 sm:hidden"
        >
          Wszystkie promocje
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

/* ======================================================
   JAK DZIAŁA SERWIS
====================================================== */

function HowItWorks() {
  return (
    <section
      aria-labelledby="home-how-heading"
      className="bg-stone-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="rounded-[24px] bg-stone-900 px-5 py-7 text-white sm:px-8 sm:py-9">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-300">
            Trend za Mniej
          </p>

          <h2
            id="home-how-heading"
            className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
          >
            Prościej szukać. Łatwiej wybierać.
          </h2>

          <div className="mt-5 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3 sm:gap-6">
            <Step
              number="01"
              title="Odkryj"
              description="Przeglądaj produkty i wybierz to, co Cię interesuje."
            />

            <Step
              number="02"
              title="Sprawdź"
              description="Porównaj informacje i przejdź do aktualnej oferty."
            />

            <Step
              number="03"
              title="Zdecyduj"
              description="Cenę, rozmiar i warunki zakupu potwierdź w SHEIN."
            />
          </div>

          <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-stone-300">
            Nie prowadzimy sprzedaży. Niektóre
            linki są afiliacyjne — możemy
            otrzymać prowizję od kwalifikujących
            się zakupów.

            <Link
              href="/afiliacja"
              className="ml-1 font-extrabold text-white underline underline-offset-4 hover:text-rose-200"
            >
              Jak działa afiliacja?
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 sm:block">
      <span className="shrink-0 text-lg font-black text-rose-300 sm:text-xl">
        {number}
      </span>

      <div>
        <h3 className="font-extrabold text-white sm:mt-2">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-stone-300 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ======================================================
   IKONY
====================================================== */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
