import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StoreDirectory from "@/components/StoreDirectory";
import { getPublicShopDirectory } from "@/lib/stores";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kody rabatowe i promocje sklepów | Trend za Mniej",
  description: "Przeglądaj sklepy, filtruj dostępne oferty i sprawdzaj kody rabatowe oraz kampanie. Zobacz szczegóły promocji i warunki u sprzedawcy.",
  alternates: { canonical: "/kody-rabatowe" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/kody-rabatowe",
    siteName: SITE_NAME,
    title: "Kody rabatowe i promocje sklepów | Trend za Mniej",
    description: "Znajdź sklep, wybierz rodzaj promocji i sprawdź opublikowane oferty.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export const dynamic = "force-dynamic";

const questions = [
  {
    question: "Czym różni się kupon rabatowy od kodu kampanii?",
    answer: "Kupon może obniżać kwotę w koszyku po spełnieniu warunków sprzedawcy. Kod kampanii służy często do odnalezienia wybranej promocji lub produktów i nie musi obniżać ceny w koszyku.",
  },
  {
    question: "Dlaczego niektóre sklepy nie mają jeszcze kodów?",
    answer: "Pokazujemy także sklepy, dla których przygotowujemy katalog ofert. Nie dodajemy fikcyjnych kuponów: jeśli nie mamy opublikowanej promocji, informujemy o tym wprost.",
  },
  {
    question: "Czy kod na pewno zadziała?",
    answer: "Nie możemy tego zagwarantować. Nie sprawdzamy kodów na żywo w koszyku. Ważność, ograniczenia, cenę i możliwość łączenia promocji należy potwierdzić na stronie sprzedawcy.",
  },
  {
    question: "Czy korzystanie z Trendzamniej jest płatne?",
    answer: "Przeglądanie katalogu nie wymaga opłaty. Niektóre linki są afiliacyjne: jeśli kupisz produkt po skorzystaniu z takiego linku, Trendzamniej może otrzymać prowizję.",
  },
] as const;

export default async function CouponsPage() {
  const { stores, offers, unavailable } = await getPublicShopDirectory();
  const storesWithOffers = stores.filter(store => store.offerCount > 0).length;
  const coupons = offers.filter(offer => offer.type === "coupon").length;
  const campaigns = offers.filter(offer => offer.type === "campaign").length;
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": siteUrl + "/kody-rabatowe#webpage",
        url: siteUrl + "/kody-rabatowe",
        name: "Kody rabatowe i promocje sklepów",
        description: "Katalog sklepów i opublikowanych kodów rabatowych oraz kampanii.",
        inLanguage: "pl-PL",
        mainEntity: { "@id": siteUrl + "/kody-rabatowe#stores" },
      },
      {
        "@type": "ItemList",
        "@id": siteUrl + "/kody-rabatowe#stores",
        numberOfItems: stores.length,
        itemListElement: stores.map((store, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: store.name,
          url: siteUrl + "/kody-rabatowe/" + store.slug,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <header className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:py-16">
          <nav aria-label="Ścieżka strony" className="text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-rose-700">Trend za Mniej</Link>
            <span className="mx-2">/</span>Kody rabatowe
          </nav>
          <div className="mt-8 max-w-4xl">
            <span className="inline-flex rounded-full border border-rose-200 bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.13em] text-rose-700">
              Sklepy · Kupony · Kampanie
            </span>
            <h1 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[1.07] tracking-tight">
              Znajdź sklep. <span className="text-rose-700">Sprawdź promocje.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600">
              Wszystkie sklepy w jednym katalogu. Wyszukaj ulubioną markę, wybierz rodzaj oferty
              i sprawdź dostępne kody. Wyraźnie rozróżniamy kupony do koszyka od kodów kampanii.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#sklepy" className="inline-flex min-h-12 items-center rounded-xl bg-stone-950 px-6 text-sm font-black text-white transition hover:bg-rose-700">
                Przeglądaj sklepy <span aria-hidden="true" className="ml-2">↓</span>
              </a>
              <Link href="/promocje-shein"
                className="inline-flex min-h-12 items-center rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-800 hover:border-rose-400">
                Zobacz kampanie SHEIN →
              </Link>
            </div>
          </div>
          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white/80 p-4">
              <p className="text-3xl font-black tabular-nums">{stores.length}</p>
              <p className="mt-1 text-xs font-semibold text-stone-600">sklepów w katalogu</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/80 p-4">
              <p className="text-3xl font-black tabular-nums">{storesWithOffers}</p>
              <p className="mt-1 text-xs font-semibold text-stone-600">sklepów z ofertami</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/80 p-4">
              <p className="text-3xl font-black tabular-nums">{offers.length}</p>
              <p className="mt-1 text-xs font-semibold text-stone-600">opublikowanych wpisów</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-stone-500">
            {coupons} kuponów do koszyka · {campaigns} kodów kampanii. Liczniki nie oznaczają gwarantowanej zniżki.
          </p>
        </div>
      </header>

      <StoreDirectory stores={stores} unavailable={unavailable} />

      <section aria-labelledby="how-coupons-work" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Kupuj świadomie</p>
          <h2 id="how-coupons-work" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Jak znaleźć właściwą promocję?</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Wybierz sklep", "Wpisz nazwę, przefiltruj kategorię lub wybierz sklepy z opublikowanymi ofertami."],
              ["02", "Sprawdź rodzaj kodu", "Na stronie sklepu zobacz, czy jest to kupon do koszyka, kod kampanii czy promocja bez kodu."],
              ["03", "Potwierdź warunki", "Skopiuj kod, jeśli jest potrzebny, a cenę, ograniczenia i datę ważności sprawdź u sprzedawcy."],
            ].map(([step, title, description]) => (
              <article key={step} className="rounded-2xl border border-stone-200 bg-[#faf8f7] p-5">
                <span className="text-sm font-black text-rose-700">{step}</span>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="coupon-faq-heading" className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Pomoc</p>
        <h2 id="coupon-faq-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Najczęstsze pytania o kody</h2>
        <div className="mt-6 space-y-3">
          {questions.map(item => (
            <details key={item.question} className="group rounded-2xl border border-stone-200 bg-white p-5 open:border-rose-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-stone-900 marker:hidden">
                {item.question}
                <span aria-hidden="true" className="text-xl font-normal text-rose-700">+</span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-stone-600">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-7 text-sm leading-7 text-stone-600">
          Masz pytanie o konkretną ofertę? <Link href="/kontakt" className="font-bold text-rose-700 underline-offset-4 hover:underline">Napisz do Trend za Mniej</Link>.
        </p>
      </section>
      <SiteFooter />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </main>
  );
}
