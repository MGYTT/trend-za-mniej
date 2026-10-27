import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OutfitExplorer from "@/components/OutfitExplorer";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { getSiteUrl } from "@/lib/site";
import type { OutfitPreview } from "@/lib/outfit-filters";
import { OUTFIT_CATEGORIES, matchesOutfitCategory } from "@/lib/outfit-landing-categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Stylizacje damskie do 100, 150 i 200 zł",
  description:
    "Gotowe stylizacje damskie na co dzień, do pracy i na weekend. Poznaj skład i sumę cen zapisanych w katalogu. Aktualne oferty sprawdzaj w SHEIN.",
  alternates: { canonical: "/stylizacje" },
  openGraph: {
    type: "website",
    title: "Stylizacje damskie do 100, 150 i 200 zł | Trend za Mniej",
    description: "Gotowe zestawy na co dzień, do pracy i na weekend. Wybierz okazję, poznaj skład i sumę zapisanych cen.",
    url: "/stylizacje",
  },
};

type SearchParams = {
  budzet?: string | string[];
  okazja?: string | string[];
};

export default async function LooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawBudget = Array.isArray(params.budzet) ? params.budzet[0] : params.budzet;
  const rawOccasion = Array.isArray(params.okazja) ? params.okazja[0] : params.okazja;

  const looks = (await getAllResolvedLooks(await getProducts())).filter((look) => look.available);
  const previews: OutfitPreview[] = looks.map((look) => ({
    slug: look.slug,
    title: look.title,
    occasion: look.occasion,
    style: look.style,
    intro: look.intro,
    total: look.total,
    maxBudget: look.maxBudget,
    productCount: look.products.length,
    photos: look.products.slice(0, 2).map((product) => ({
      id: product.id,
      image: product.image,
      alt: product.name,
    })),
  }));

  const visibleCategories = OUTFIT_CATEGORIES.filter((category) => looks.some((look) => matchesOutfitCategory(category, look)));

  const featured = looks.length
    ? looks.reduce((cheapest, current) => current.total < cheapest.total ? current : cheapest)
    : null;
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Stylizacje", item: siteUrl + "/stylizacje" },
        ],
      },
      {
        "@type": "ItemList",
        name: "Gotowe stylizacje damskie",
        numberOfItems: looks.length,
        itemListElement: looks.map((look, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: look.title,
          url: siteUrl + "/stylizacje/" + look.slug,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />

      <div className="relative overflow-hidden border-b border-rose-100 bg-[#fff8f7] text-stone-950">
        <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-9 px-6 py-11 sm:gap-10 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:py-20">
          <div>
            <nav aria-label="Okruszki" className="flex flex-wrap items-center gap-2 text-xs font-bold text-stone-600">
              <Link href="/" className="hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-300">Start</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-rose-700">Stylizacje</span>
            </nav>
            <p className="mt-8 inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-[11px] font-black uppercase leading-5 tracking-[0.13em] text-rose-700 sm:mt-10">
              Pomysły na look w Twoim budżecie
            </p>
            <h1 className="mt-6 max-w-3xl text-pretty text-[clamp(2.3rem,7.5vw,5rem)] font-black leading-[1.09] tracking-[-0.055em]">
              Gotowe stylizacje. <span className="block text-rose-600">Twój styl za mniej.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">
              Nie musisz kompletować stroju od zera. Przeglądaj gotowe połączenia ubrań na co dzień,
              do pracy, na weekend i na wieczór. Zobacz zdjęcia elementów, poznaj cenę zestawu
              zapisaną w katalogu i odkryj nowe inspiracje.
            </p>
            <div className="mt-7 grid gap-3 min-[440px]:flex min-[440px]:flex-wrap">
              <a href="#wybierz-stylizacje" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,29,72,0.15)] transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400">
                Odkryj stylizacje ↓
              </a>
              <a href="#poradnik-stylizacji" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-white px-6 text-sm font-bold text-rose-800 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-300">
                Jak dobrze wybrać?
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold leading-6 text-stone-600 sm:text-sm">
              <li>✓ Budżety do 100–200 zł</li>
              <li>✓ Produkty z katalogu</li>
              <li>✓ Oferty osobno w SHEIN</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-2" aria-label="Wybierz budżet stylizacji">
              {[100, 150, 200].map((budget) => (
                <Link
                  key={budget}
                  href={`/stylizacje/do-${budget}-zl`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-rose-200 bg-white px-4 text-xs font-black text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-400"
                >
                  Do {budget} zł →
                </Link>
              ))}
            </div>
          </div>

          {featured && (
            <div className="min-w-0 overflow-hidden rounded-[28px] border border-rose-100 bg-white text-stone-950 shadow-[0_22px_55px_rgba(136,19,55,0.12)] sm:rounded-[30px]">
              <div className="grid h-56 grid-cols-2 gap-2 bg-rose-50 p-3 min-[400px]:h-64 sm:h-80 lg:h-72 xl:h-80">
                {featured.products.slice(0, 2).map((product, index) => (
                  <div key={product.id} className="relative min-w-0 overflow-hidden rounded-[20px] bg-white">
                    <ProductPhoto
                      src={product.image}
                      alt={product.name}
                      sizes="(max-width: 1023px) 44vw, 19vw"
                      className="p-2"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-widest text-rose-700">Stylizacja na dobry początek</p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{featured.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {featured.products.length} elementy · {featured.occasion.toLowerCase()} · bez kosztów dostawy
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-stone-500">Suma cen w katalogu</p>
                    <p className="text-2xl font-black">{formatPrice(featured.total)}</p>
                  </div>
                  <Link href={"/stylizacje/" + featured.slug} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white transition hover:bg-rose-700">
                    Zobacz zestaw →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {visibleCategories.length > 0 && (
        <section aria-labelledby="outfit-categories-title" className="mx-auto max-w-7xl px-6 pt-12 sm:px-8 sm:pt-16">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Inspiracje na konkretną okazję</p>
          <h2 id="outfit-categories-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Stylizacje według budżetu i okazji
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Odkryj osobne kolekcje na randkę, imprezę, do pracy i na codzienne wyjścia. Każda prowadzi do zestawów ze sprawdzoną sumą cen.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <Link key={category.slug} href={"/stylizacje/" + category.slug}
                className="inline-flex min-h-11 items-center rounded-full border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-400">
                {category.label} →
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="wybierz-stylizacje" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-12 sm:px-8 sm:py-16" aria-labelledby="choose-title">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Znajdź coś dla siebie</p>
            <h2 id="choose-title" className="mt-2 text-pretty text-[clamp(1.75rem,5.2vw,2.4rem)] font-black leading-[1.14] tracking-[-0.04em]">
              Wybierz stylizację na swoją okazję
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Filtruj według faktycznej sumy zapisanych cen. Zobacz, co kupujesz i czego nie ma w zestawie.
            </p>
          </div>
          <p className="text-xs font-semibold text-stone-500">
            {looks.length} {looks.length === 1 ? "kompletny zestaw" : "kompletnych zestawów"} w katalogu
          </p>
        </div>
        {previews.length > 0 ? (
          <OutfitExplorer
          looks={previews}
          initialBudget={["100", "150", "200"].includes(rawBudget ?? "") ? rawBudget! : "all"}
          initialOccasion={looks.some((look) => look.occasion === rawOccasion) ? rawOccasion! : "all"}
        />
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
            <h3 className="text-2xl font-black">Przygotowujemy nowe stylizacje</h3>
            <p className="mt-3 text-stone-600">Pokazujemy tylko kompletne zestawy z aktywnymi produktami, które mieszczą się w wybranym budżecie.</p>
            <Link href="/okazje" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rose-600 px-5 font-bold text-white">
              Przeglądaj produkty
            </Link>
          </div>
        )}
      </section>

      <section id="poradnik-stylizacji" aria-labelledby="guide-title"
        className="scroll-mt-24 border-y border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-11 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Twój styl, Twoje zasady</p>
            <h2 id="guide-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Nie wiesz, od czego zacząć?
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              W poradnikach podpowiadamy, jak dobrać fason, budżet i rozmiar,
              zanim przejdziesz do konkretnych ofert.
            </p>
          </div>
          <Link href="/poradniki"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-stone-950 px-6 text-sm font-black text-white hover:bg-stone-800">
            Przejdź do poradników →
          </Link>
        </div>
      </section>

      <section aria-labelledby="outfits-faq" className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Przed zakupem</p>
          <h2 id="outfits-faq" className="mt-3 text-[clamp(1.7rem,5vw,2.25rem)] font-black tracking-tight">Ważne pytania o zestawy</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Przejrzystość jest ważniejsza niż obietnica najniższej ceny. Nie testujemy fizycznie każdej rzeczy i nie sprzedajemy produktów bezpośrednio.
          </p>
          <Link href="/afiliacja" className="mt-5 inline-flex min-h-11 items-center text-sm font-black text-rose-700 hover:underline">
            Jak zarabiamy na afiliacji? →
          </Link>
        </div>
        <div className="space-y-3">
          <details className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black leading-6 text-stone-950 marker:text-rose-600">Czy cena obejmuje całą stylizację?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Sumujemy ceny elementów podanych na karcie zestawu. Buty, torba, dodatki lub dostawa nie są wliczone, jeśli nie wymieniono ich w składzie. Każda podstrona wskazuje wyłączenia.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black leading-6 text-stone-950 marker:text-rose-600">Czy cena i rozmiary w SHEIN będą identyczne?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Niekoniecznie. Ceny na naszej stronie są zapisane w katalogu i mogą różnić się od aktualnych ofert. Przed zakupem sprawdź cenę, kolor, rozmiar, koszty dostawy i warunki u sprzedawcy.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black leading-6 text-stone-950 marker:text-rose-600">Czy kupuję cały zestaw jednym kliknięciem?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Nie. To propozycja połączenia konkretnych elementów garderoby. Otwierasz oddzielnie każdą ofertę w SHEIN i samodzielnie wybierasz produkty.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-black leading-6 text-stone-950 marker:text-rose-600">Czy linki są afiliacyjne?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Tak, możemy otrzymać prowizję za kwalifikowany zakup dokonany poprzez link partnera. Nie oznacza to, że każdy klik lub zakup generuje prowizję.
            </p>
          </details>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
