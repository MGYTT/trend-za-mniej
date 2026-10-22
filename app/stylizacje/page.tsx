import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OutfitExplorer from "@/components/OutfitExplorer";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { resolveLooks } from "@/lib/stylizacje";
import { getSiteUrl } from "@/lib/site";
import type { OutfitPreview } from "@/lib/outfit-filters";
import { STYLE_GUIDES } from "@/lib/poradniki";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Stylizacje damskie do 100, 150 i 200 zł – gotowe zestawy",
  description:
    "Gotowe stylizacje damskie na co dzień, do pracy i na weekend. Wybierz budżet, porównaj skład i sumę zapisanych cen oraz sprawdź poszczególne oferty w SHEIN.",
  alternates: { canonical: "/stylizacje" },
  openGraph: {
    type: "website",
    title: "Gotowe stylizacje damskie na każdą okazję | Trend za Mniej",
    description: "Pięć ręcznie dobranych zestawów z podanymi elementami i kosztem zapisanym w katalogu. Wybierz okazję i swój budżet.",
    url: "/stylizacje",
  },
};

export default async function LooksPage() {
  const looks = resolveLooks(await getProducts()).filter((look) => look.available);
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

      <div className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16 lg:py-20">
          <div>
            <nav aria-label="Okruszki" className="flex items-center gap-2 text-xs text-stone-300">
              <Link href="/" className="hover:text-white focus-visible:outline-2 focus-visible:outline-rose-300">Start</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-white">Stylizacje</span>
            </nav>
            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.2em] text-rose-300">
              Mniej szukania. Więcej pomysłów.
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.6rem,5.4vw,5rem)] font-black leading-[1.05] tracking-[-0.055em]">
              Gotowe stylizacje damskie <span className="text-rose-300">w Twoim budżecie</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200 sm:text-lg">
              Nie musisz kompletować stroju od zera. Porównaj gotowe zestawy na co dzień,
              do pracy i na weekend. Widzisz, co do siebie pasuje, co wchodzi w skład
              zestawu i ile wynosi suma cen zapisanych w naszym katalogu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#wybierz-stylizacje" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-500 px-6 text-sm font-black text-white transition hover:bg-rose-400 focus-visible:outline-2 focus-visible:outline-rose-300">
                Wybierz zestaw ↓
              </a>
              <a href="#poradnik-stylizacji" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 px-6 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-rose-300">
                Jak dobrze wybrać?
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-stone-300 sm:text-sm">
              <li>✓ Budżety do 100–200 zł</li>
              <li>✓ Prawdziwe produkty w zestawach</li>
              <li>✓ Zakup osobno w SHEIN</li>
            </ul>
          </div>

          {featured && (
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white text-stone-950 shadow-2xl">
              <div className="grid h-64 grid-cols-2 bg-stone-100 sm:h-80 lg:h-72 xl:h-80">
                {featured.products.slice(0, 2).map((product, index) => (
                  <div key={product.id} className="relative overflow-hidden border-r border-stone-100 last:border-r-0">
                    <ProductPhoto
                      src={product.image}
                      alt={product.name}
                      sizes="(max-width: 1023px) 48vw, 18vw"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-widest text-rose-700">Zobacz zestaw z najniższą sumą cen</p>
                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{featured.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {featured.products.length} elementy · {featured.occasion.toLowerCase()} · bez kosztów dostawy
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-stone-500">Suma cen w katalogu</p>
                    <p className="text-2xl font-black">{formatPrice(featured.total)}</p>
                  </div>
                  <Link href={"/stylizacje/" + featured.slug} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-950 px-4 text-sm font-extrabold text-white transition hover:bg-stone-800">
                    Zobacz zestaw →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section id="wybierz-stylizacje" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="choose-title">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Znajdź coś dla siebie</p>
            <h2 id="choose-title" className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
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
          <OutfitExplorer looks={previews} />
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

      <section id="poradnik-stylizacji" aria-labelledby="guide-title" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Poradnik kupowania z głową</p>
          <h2 id="guide-title" className="mt-3 max-w-3xl text-balance text-3xl font-black tracking-tight sm:text-4xl">
            Jak skompletować stylizację, nie kupując niepotrzebnych rzeczy?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
            Dobry zestaw ma pasować do Twojego dnia i rzeczy, które już masz w szafie.
            Dlatego pokazujemy nie tylko zdjęcia, ale także skład i ograniczenia każdego kompletu.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-stone-200 p-6">
              <span className="text-xs font-black tracking-widest text-rose-700">01 / OKAZJA</span>
              <h3 className="mt-3 text-xl font-black">Zacznij od tego, dokąd idziesz</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Do pracy wybierz neutralną bazę i sprawdź wymagania dotyczące stroju. Na weekend postaw na wygodne kroje i materiał odpowiedni do pogody.
              </p>
            </article>
            <article className="rounded-3xl border border-stone-200 p-6">
              <span className="text-xs font-black tracking-widest text-rose-700">02 / KOSZT</span>
              <h3 className="mt-3 text-xl font-black">Policz wszystkie potrzebne elementy</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Suma na stronie dotyczy produktów z zestawu. Sprawdź, czy masz już buty i dodatki, a u sprzedawcy dolicz dostawę i ewentualne opłaty.
              </p>
            </article>
            <article className="rounded-3xl border border-stone-200 p-6">
              <span className="text-xs font-black tracking-widest text-rose-700">03 / ROZMIAR</span>
              <h3 className="mt-3 text-xl font-black">Zweryfikuj każdą ofertę</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Sprawdź tabelę rozmiarów, skład, wariant kolorystyczny, dostępność i aktualną cenę. Każdy produkt otwierasz i kupujesz osobno w SHEIN.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="outfits-faq" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Przed zakupem</p>
          <h2 id="outfits-faq" className="mt-3 text-3xl font-black tracking-tight">Ważne pytania o zestawy</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Przejrzystość jest ważniejsza niż obietnica najniższej ceny. Nie testujemy fizycznie każdej rzeczy i nie sprzedajemy produktów bezpośrednio.
          </p>
          <Link href="/afiliacja" className="mt-5 inline-flex min-h-11 items-center text-sm font-black text-rose-700 hover:underline">
            Jak zarabiamy na afiliacji? →
          </Link>
        </div>
        <div className="space-y-3">
          <details className="group rounded-2xl border border-stone-200 bg-white p-5">
            <summary className="cursor-pointer font-black">Czy cena obejmuje całą stylizację?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Sumujemy ceny elementów podanych na karcie zestawu. Buty, torba, dodatki lub dostawa nie są wliczone, jeśli nie wymieniono ich w składzie. Każda podstrona wskazuje wyłączenia.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5">
            <summary className="cursor-pointer font-black">Czy cena i rozmiary w SHEIN będą identyczne?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Niekoniecznie. Ceny na naszej stronie są zapisane w katalogu i mogą różnić się od aktualnych ofert. Przed zakupem sprawdź cenę, kolor, rozmiar, koszty dostawy i warunki u sprzedawcy.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5">
            <summary className="cursor-pointer font-black">Czy kupuję cały zestaw jednym kliknięciem?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Nie. To propozycja połączenia konkretnych elementów garderoby. Otwierasz oddzielnie każdą ofertę w SHEIN i samodzielnie wybierasz produkty.
            </p>
          </details>
          <details className="group rounded-2xl border border-stone-200 bg-white p-5">
            <summary className="cursor-pointer font-black">Czy linki są afiliacyjne?</summary>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Tak, możemy otrzymać prowizję za kwalifikowany zakup dokonany poprzez link partnera. Nie oznacza to, że każdy klik lub zakup generuje prowizję.
            </p>
          </details>
        </div>
      </section>
      <section aria-labelledby="outfit-editorial-title" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Inspiracje i praktyczne wskazówki</p>
          <h2 id="outfit-editorial-title" className="mt-2 text-3xl font-black tracking-tight">
            Wybierz zestaw z większą pewnością
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Nie musisz kupować wszystkiego. Przeczytaj, jak dobrać fasony,
            skorzystać z ubrań, które już masz, i zweryfikować realny koszt zakupów.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {STYLE_GUIDES.map((guide) => (
              <Link key={guide.slug} href={"/poradniki/" + guide.slug}
                className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-stone-50 p-5 transition hover:border-rose-200 hover:bg-rose-50">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{guide.category}</p>
                <h3 className="mt-2 text-lg font-black group-hover:text-rose-700">{guide.title}</h3>
                <span className="mt-auto pt-5 text-sm font-black text-rose-700">Sprawdź poradnik →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
