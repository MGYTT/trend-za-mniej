import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { slugifyCategory } from "@/lib/categories";
import {
  getFeaturedProducts,
  getProducts,
  formatPrice,
  type Product,
} from "@/lib/products";
import {
  SHEIN_PROMOTIONS,
  type SheinPromotion,
} from "@/lib/shein-promotions";

// Zachowujemy odświeżanie danych strony głównej co 60 sekund.
export const revalidate = 60;

const MAX_FEATURED_PRODUCTS = 8;
const MAX_LATEST_PRODUCTS = 8;
const MAX_HOME_CATEGORIES = 9;

type HomeCategory = {
  name: string;
  href: string;
};

function uniqueProducts(products: Product[]): Product[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

export default async function Home() {
  const [products, featuredProducts] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ]);

  // Wyróżnione produkty mają pierwszeństwo. Resztę dobieramy z katalogu.
  const selectedProducts = uniqueProducts([
    ...featuredProducts,
    ...products,
  ]).slice(0, MAX_FEATURED_PRODUCTS);

  // Nie pokazujemy tych samych produktów dwukrotnie na stronie głównej.
  const selectedIds = new Set(selectedProducts.map((product) => product.id));
  const latestProducts = products
    .filter((product) => !selectedIds.has(product.id))
    .slice(0, MAX_LATEST_PRODUCTS);

  const categories: HomeCategory[] = [
    ...new Set(
      products
        .map((product) => product.category?.trim())
        .filter((name): name is string => Boolean(name))
    ),
  ]
    .slice(0, MAX_HOME_CATEGORIES)
    .map((name) => ({
      name,
      href: `/kategoria/${slugifyCategory(name)}`,
    }));

  const showcaseProducts = selectedProducts
    .filter((product) => Boolean(product.image?.trim()))
    .slice(0, 3);

  const promotions = SHEIN_PROMOTIONS.slice(0, 3);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <Hero showcaseProducts={showcaseProducts} />
      <CategoryShortcuts categories={categories} />

      <ProductSection
        id="polecane"
        eyebrow="Wybrane znaleziska"
        title="Odkryj coś dla siebie"
        description="Ubrania, dodatki i inne propozycje, które warto obejrzeć."
        products={selectedProducts}
        href="/okazje"
        linkLabel="Zobacz wszystkie produkty"
      />

      <BudgetShortcuts />
      <PromotionsSection promotions={promotions} />

      <ProductSection
        id="najnowsze"
        eyebrow="Świeżo w katalogu"
        title="Najnowsze znaleziska"
        description="Kolejne inspiracje dodane do Trend za Mniej."
        products={latestProducts}
        href="/okazje?sort=newest"
        linkLabel="Przeglądaj najnowsze"
        muted
        emptyText={
          products.length > 0
            ? "To na razie wszystkie dostępne znaleziska. Zajrzyj do pełnego katalogu."
            : "Nowe znaleziska pojawią się tutaj po dodaniu ich do katalogu."
        }
      />

      <HowItWorks />
      <SiteFooter />
    </main>
  );
}

function Hero({ showcaseProducts }: { showcaseProducts: Product[] }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-stone-200 bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 -top-32 h-96 w-96 rounded-full bg-rose-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-12 h-96 w-96 rounded-full bg-orange-50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:pb-20 lg:pt-18">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3.5 py-2 text-xs font-extrabold text-rose-700">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-rose-500" />
            Trend za Mniej · styl, inspiracje, okazje
          </div>

          <h1 className="mt-5 max-w-[660px] text-balance text-[clamp(2.65rem,6.8vw,4.75rem)] font-black leading-[1.06] tracking-[-0.055em] text-stone-950">
            Modne rzeczy.
            <br />
            <span className="text-rose-600">Dobre okazje.</span>
            <br />
            Twój wybór.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            Odkrywaj modne produkty, inspiracje i promocje SHEIN bez
            przeszukiwania setek stron. Znajdź to, co pasuje do Twojego stylu
            i budżetu.
          </p>

          <form
            action="/okazje"
            method="get"
            role="search"
            className="mt-7 max-w-xl rounded-[22px] border border-stone-200 bg-white p-2 shadow-[0_14px_40px_rgba(28,25,23,0.08)]"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="home-product-search" className="sr-only">
                  Szukaj produktu w katalogu
                </label>
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  id="home-product-search"
                  type="search"
                  name="q"
                  placeholder="Czego szukasz? Np. swetra..."
                  enterKeyHint="search"
                  className="min-h-12 w-full rounded-2xl border-0 bg-stone-50 py-3 pl-12 pr-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-rose-200 sm:min-h-14"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-7 text-sm font-extrabold text-white transition hover:bg-rose-700 active:scale-[0.99] sm:min-h-14"
              >
                Szukaj <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href="/okazje"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              Przeglądaj produkty <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/promocje-shein"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Promocje SHEIN
            </Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-stone-500">
            Bez rejestracji · Ceny i dostępność potwierdzisz w sklepie.
          </p>
        </div>

        <HeroShowcase products={showcaseProducts} />
      </div>
    </section>
  );
}

function HeroShowcase({ products }: { products: Product[] }) {
  const [primary, secondary, tertiary] = products;

  // Stan pusty nie wyświetla sztucznych zdjęć ani przykładowych cen.
  if (!primary) {
    return (
      <div className="relative hidden min-h-[430px] items-center justify-center overflow-hidden rounded-[36px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-12 lg:flex">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-200/50 blur-2xl" />
        <div className="relative text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Trend za Mniej</p>
          <p className="mt-5 text-5xl font-black leading-tight tracking-[-0.05em] text-stone-900">
            Szukaj.
            <br />
            Odkrywaj.
            <br />
            <span className="text-rose-600">Inspiruj się.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative hidden h-[470px] w-full max-w-[560px] justify-self-end lg:block" aria-label="Wybrane produkty z katalogu">
      <div
        aria-hidden="true"
        className="absolute inset-x-8 bottom-5 top-7 rotate-[-5deg] rounded-[42px] bg-rose-100/90"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-36 w-36 rounded-full border-[18px] border-rose-200/60"
      />

      <Link
        href={`/produkt/${primary.slug}`}
        className="group absolute bottom-8 left-2 top-1 w-[63%] overflow-hidden rounded-[30px] border-[6px] border-white bg-stone-100 shadow-[0_24px_70px_rgba(28,25,23,0.16)] transition duration-300 hover:-translate-y-1"
        aria-label={`Zobacz produkt: ${primary.shortName}`}
      >
        <img
          src={primary.image}
          alt={primary.name}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent px-5 pb-5 pt-20 text-white">
          <span className="text-xs font-bold text-rose-100">Odkryj w katalogu</span>
          <p className="mt-1 line-clamp-2 text-base font-extrabold leading-snug">{primary.shortName}</p>
        </div>
      </Link>

      {secondary && (
        <Link
          href={`/produkt/${secondary.slug}`}
          className="group absolute right-0 top-12 h-[47%] w-[40%] overflow-hidden rounded-[26px] border-[5px] border-white bg-stone-100 shadow-[0_18px_45px_rgba(28,25,23,0.14)] transition duration-300 hover:-translate-y-1"
          aria-label={`Zobacz produkt: ${secondary.shortName}`}
        >
          <img
            src={secondary.image}
            alt={secondary.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
      )}

      {tertiary && (
        <Link
          href={`/produkt/${tertiary.slug}`}
          className="group absolute bottom-1 right-4 h-[38%] w-[36%] overflow-hidden rounded-[26px] border-[5px] border-white bg-stone-100 shadow-[0_18px_45px_rgba(28,25,23,0.14)] transition duration-300 hover:-translate-y-1"
          aria-label={`Zobacz produkt: ${tertiary.shortName}`}
        >
          <img
            src={tertiary.image}
            alt={tertiary.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
      )}

      <div className="pointer-events-none absolute -left-6 bottom-1 rounded-2xl border border-rose-100 bg-white px-5 py-3 shadow-xl shadow-stone-200/70">
        <span className="block text-xs font-black uppercase tracking-[0.12em] text-rose-600">Twój styl</span>
        <span className="mt-0.5 block text-sm font-bold text-stone-800">Twoje odkrycia ✦</span>
      </div>
    </div>
  );
}

function CategoryShortcuts({ categories }: { categories: HomeCategory[] }) {
  return (
    <section className="border-b border-stone-200 bg-white" aria-labelledby="home-category-heading">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="shrink-0">
            <h2 id="home-category-heading" className="text-sm font-extrabold text-stone-900">
              Przeglądaj kategoriami
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">Szybciej znajdź to, co lubisz</p>
          </div>

          <nav aria-label="Kategorie produktów" className="horizontal-scroll -mx-5 flex flex-1 gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-stone-200 bg-stone-50 px-4 text-[13px] font-bold text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/kategorie"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-4 text-[13px] font-extrabold text-rose-700 transition hover:bg-rose-100"
            >
              Wszystkie kategorie <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </nav>
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
  muted = false,
  emptyText = "Pierwsze produkty pojawią się tutaj po dodaniu ich do katalogu.",
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  href: string;
  linkLabel: string;
  muted?: boolean;
  emptyText?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 border-b border-stone-200 ${muted ? "bg-stone-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl px-5 py-11 sm:px-6 sm:py-14">
        <SectionHeading
          id={`${id}-heading`}
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          linkLabel={linkLabel}
        />

        {products.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-5">
            {products.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[24px] border border-dashed border-stone-200 bg-white px-6 py-10 text-center">
            <p className="text-sm leading-7 text-stone-600">{emptyText}</p>
          </div>
        )}

        <Link
          href={href}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 text-sm font-extrabold text-stone-800 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:w-auto"
        >
          {linkLabel} <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function HomeProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_5px_22px_rgba(28,25,23,0.045)] transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_16px_35px_rgba(28,25,23,0.09)]">
      <Link
        href={`/produkt/${product.slug}`}
        aria-label={`Zobacz szczegóły produktu: ${product.shortName || product.name}`}
        className="flex h-full w-full flex-col"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-rose-700 shadow-sm">
              Wybrane
            </span>
          )}
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-700 shadow-sm transition group-hover:bg-rose-600 group-hover:text-white"
          >
            <ArrowIcon className="h-5 w-5" />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <span className="truncate text-xs font-extrabold uppercase tracking-[0.08em] text-rose-700">
            {product.category}
          </span>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug tracking-[-0.02em] text-stone-900 transition group-hover:text-rose-700 sm:text-base">
            {product.shortName || product.name}
          </h3>

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <strong className="text-xl font-black tracking-[-0.035em] text-stone-950 sm:text-2xl">
                {formatPrice(product.price)}
              </strong>
              {product.oldPrice !== null && product.oldPrice > product.price && (
                <span className="text-xs font-semibold text-stone-500 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-stone-500">Cena z chwili publikacji</p>
            <span className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3 text-sm font-extrabold text-rose-700">
              Zobacz produkt <ArrowIcon className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function BudgetShortcuts() {
  return (
    <section className="border-b border-stone-200 bg-stone-50" aria-labelledby="budget-shortcuts-heading">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        <SectionHeading
          id="budget-shortcuts-heading"
          eyebrow="Odkrywaj po swojemu"
          title="Od czego zaczynamy?"
          description="Wybierz budżet albo sprawdź produkty znane z naszych TikToków."
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DiscoveryCard
            href="/okazje?maxPrice=50"
            eyebrow="Mały budżet"
            title="Do 50 zł"
            description="Propozycje w ustalonym limicie."
            background="rose"
            symbol="50"
          />
          <DiscoveryCard
            href="/okazje?maxPrice=100"
            eyebrow="Więcej możliwości"
            title="Do 100 zł"
            description="Znajdź coś na każdą okazję."
            background="cream"
            symbol="100"
          />
          <DiscoveryCard
            href="/tiktok"
            eyebrow="Widziane w social mediach"
            title="Z naszych TikToków"
            description="Wróć do produktów z filmów."
            background="dark"
            symbol="↗"
          />
        </div>
      </div>
    </section>
  );
}

function DiscoveryCard({
  href,
  eyebrow,
  title,
  description,
  background,
  symbol,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  background: "rose" | "cream" | "dark";
  symbol: string;
}) {
  const dark = background === "dark";
  const surface =
    background === "rose"
      ? "border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/70"
      : background === "cream"
        ? "border-orange-100 bg-gradient-to-br from-orange-50 to-white"
        : "border-stone-800 bg-stone-900";

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${surface}`}
    >
      <div aria-hidden="true" className={`absolute -bottom-10 -right-4 text-[120px] font-black leading-none tracking-[-0.1em] opacity-[0.09] ${dark ? "text-white" : "text-rose-900"}`}>
        {symbol}
      </div>
      <div className="relative">
        <span className={`text-xs font-extrabold uppercase tracking-[0.11em] ${dark ? "text-rose-200" : "text-rose-700"}`}>
          {eyebrow}
        </span>
        <h3 className={`mt-2 text-2xl font-black tracking-[-0.035em] ${dark ? "text-white" : "text-stone-900"}`}>
          {title}
        </h3>
        <p className={`mt-1 text-sm leading-6 ${dark ? "text-stone-300" : "text-stone-600"}`}>
          {description}
        </p>
      </div>
      <span className={`relative mt-3 inline-flex items-center gap-1.5 self-start text-sm font-extrabold ${dark ? "text-white" : "text-rose-700"}`}>
        Odkrywaj <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function PromotionsSection({ promotions }: { promotions: SheinPromotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section id="promocje" aria-labelledby="promocje-heading" className="scroll-mt-24 border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-11 sm:px-6 sm:py-14">
        <SectionHeading
          id="promocje-heading"
          eyebrow="Promocje SHEIN"
          title="Zajrzyj do kampanii i kodów"
          description="Wyróżnione akcje w jednym miejscu. Szczegóły i warunki zawsze sprawdzaj w SHEIN."
          href="/promocje-shein"
          linkLabel="Wszystkie kampanie"
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {promotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              highlighted={index === 0}
            />
          ))}
        </div>

        <p className="mt-4 text-xs leading-6 text-stone-500">
          Kody mogą być identyfikatorami kampanii, a nie kuponami do wpisania w koszyku.
          Dostępność i zasady akcji mogą się zmienić.
        </p>

        <Link
          href="/promocje-shein"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 text-sm font-extrabold text-white transition hover:bg-rose-700 sm:w-auto"
        >
          Sprawdź promocje SHEIN <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function PromotionCard({
  promotion,
  highlighted,
}: {
  promotion: SheinPromotion;
  highlighted: boolean;
}) {
  return (
    <Link
      href={`/promocje-shein#${promotion.id}`}
      className={`group flex min-h-[240px] flex-col rounded-[26px] border p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
        highlighted
          ? "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50"
          : "border-stone-200 bg-stone-50"
      }`}
    >
      <span className="self-start rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-extrabold text-rose-700">
        {promotion.badge}
      </span>
      <h3 className="mt-4 line-clamp-3 text-xl font-black leading-snug tracking-[-0.025em] text-stone-900">
        {promotion.title}
      </h3>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div className="min-w-0">
          <span className="block text-xs font-semibold text-stone-500">Kod / identyfikator akcji</span>
          <code className="mt-1 block truncate text-lg font-black tracking-[0.07em] text-stone-900">
            {promotion.code}
          </code>
        </div>
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm transition group-hover:bg-rose-600 group-hover:text-white">
          <ArrowIcon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-11 sm:px-6 sm:py-14">
        <div className="rounded-[30px] border border-stone-200 bg-stone-50 px-5 py-8 sm:px-8 sm:py-10">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">Prosto i przejrzyście</p>
            <h2 id="how-it-works-heading" className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
              Jak działa Trend za Mniej?
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
            <HowStep number="01" title="Znajdź" description="Wybierz kategorię, budżet lub wyszukaj konkretny produkt." />
            <HowStep number="02" title="Porównaj" description="Obejrzyj zdjęcie, opis i cenę zapisaną przy publikacji." />
            <HowStep number="03" title="Sprawdź w sklepie" description="Potwierdź aktualną cenę i warunki bezpośrednio w SHEIN." />
          </div>

          <p className="mx-auto mt-8 max-w-3xl border-t border-stone-200 pt-5 text-center text-xs leading-6 text-stone-500">
            Trend za Mniej nie jest sklepem. Niektóre linki mają charakter afiliacyjny.{" "}
            <Link href="/afiliacja" className="font-bold text-rose-700 underline decoration-rose-200 underline-offset-4 hover:text-rose-800">
              Dowiedz się więcej o afiliacji.
            </Link>
          </p>
        </div>
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
    <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-rose-700 shadow-sm">
        {number}
      </span>
      <div>
        <h3 className="text-base font-black text-stone-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">{eyebrow}</p>
        <h2 id={id} className="mt-2 text-balance text-2xl font-black leading-tight tracking-[-0.035em] text-stone-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
          {description}
        </p>
      </div>

      {href && linkLabel && (
        <Link
          href={href}
          className="hidden min-h-11 shrink-0 items-center gap-2 text-sm font-extrabold text-rose-700 transition hover:text-rose-800 sm:inline-flex"
        >
          {linkLabel} <ArrowIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}