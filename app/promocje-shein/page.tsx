import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SheinPromotionsExplorer from "@/components/SheinPromotionsExplorer";
import { getPublishedSheinCampaigns } from "@/lib/shein-campaigns";
import { getSiteUrl, SITE_LANGUAGE, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Promocje SHEIN i kody kampanii – znajdź ofertę",
  description:
    "Znajdź kampanie i kody SHEIN bez długiego szukania. Filtruj kategorię, skopiuj kod i przejdź do sklepu, aby sprawdzić aktualne warunki.",
  alternates: { canonical: "/promocje-shein" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/promocje-shein",
    siteName: SITE_NAME,
    title: "Promocje SHEIN i kody kampanii | Trend za Mniej",
    description: "Kody, kampanie i wyprzedaże SHEIN w przejrzystej wyszukiwarce.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promocje SHEIN i kody kampanii",
    description: "Wybierz kategorię, skopiuj kod kampanii i sprawdź ofertę w SHEIN.",
    images: ["/opengraph-image"],
  },
};

const FAQ = [
  {
    question: "Czy każdy kod to rabat w koszyku?",
    answer:
      "Nie. Większość zapisanych tu kodów to oznaczenia kampanii, które możesz wyszukać w SHEIN. Nie są automatycznie kuponami zmniejszającymi wartość koszyka.",
  },
  {
    question: "Jak skorzystać z oferty?",
    answer:
      "Wybierz kampanię, skopiuj jej kod, jeśli jest potrzebny, i otwórz ofertę w SHEIN. Tam sprawdź obowiązujące zasady, uprawnienia do kuponu, cenę i datę ważności.",
  },
  {
    question: "Co, jeśli kod nie działa?",
    answer:
      "Sprawdź, czy jest przeznaczony do wyszukiwarki kampanii czy do koszyka, a następnie zweryfikuj ograniczenia i dostępność u sprzedawcy. Nasze kody nie są testowane na żywo.",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function SheinPromotionsPage() {
  const { promotions, updatedAt, unavailable } = await getPublishedSheinCampaigns();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/promocje-shein`;
  const updatedAtLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date(updatedAt));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Promocje SHEIN i kody kampanii",
        description: "Zestawienie kodów do wyszukiwania kampanii i ofert SHEIN.",
        inLanguage: SITE_LANGUAGE,
        dateModified: updatedAt,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Promocje SHEIN", item: pageUrl },
        ],
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

      <section className="relative overflow-hidden border-b border-rose-100 bg-[#fff8f7]" aria-labelledby="promotion-hero-title">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full bg-rose-100/80 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-9 pt-7 sm:px-8 sm:pb-12 sm:pt-10">
          <nav aria-label="Okruszki" className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Link href="/" className="hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400">Start</Link>
            <span aria-hidden="true" className="text-stone-400">/</span>
            <span aria-current="page" className="text-rose-700">Promocje SHEIN</span>
          </nav>

          <div className="mt-4 grid min-w-0 items-center gap-7 sm:mt-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
            <div className="min-w-0">
              <p className="hidden max-w-full items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-[11px] font-black uppercase leading-5 tracking-[0.12em] text-rose-700 sm:inline-flex">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                Kody i kampanie w jednym miejscu
              </p>
              <h1 id="promotion-hero-title" className="mt-1 max-w-3xl text-pretty text-[clamp(2.1rem,7.3vw,4.6rem)] font-black leading-[1.08] tracking-[-0.055em] text-stone-950 sm:mt-5">
                Promocje SHEIN. <span className="block text-rose-600">Znajdź je szybciej.</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:mt-4 sm:text-lg sm:leading-8">
                Wybierz kategorię lub wpisz kod. Skopiuj go i sprawdź warunki oferty w SHEIN — bez długiego szukania.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-6">
                <a href="#znajdz-promocje"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,29,72,0.16)] transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400">
                  Znajdź promocję ↓
                </a>
                <span className="text-xs font-semibold text-stone-600">
                  {promotions.length} kampanii w katalogu
                </span>
              </div>
            </div>
            <div className="hidden rounded-[28px] border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(136,19,55,0.09)] lg:block">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-700">Prosto do oferty</p>
              <div className="mt-5 space-y-4">
                {[
                  ["01", "Wybierz kategorię", "Moda, beauty, dodatki lub wyprzedaże"],
                  ["02", "Skopiuj kod", "Bez przepisywania ciągu znaków"],
                  ["03", "Sprawdź w SHEIN", "Warunki i ceny zawsze u sprzedawcy"],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-700">{number}</span>
                    <div>
                      <p className="text-sm font-black text-stone-950">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="znajdz-promocje" aria-labelledby="search-promotions-title" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-9 sm:px-8 sm:pb-16 sm:pt-12">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
            <div>
              <p className="hidden text-xs font-black uppercase tracking-[0.12em] text-rose-700 sm:block">Bez zbędnego przewijania</p>
              <h2 id="search-promotions-title" className="text-pretty text-[clamp(1.5rem,5vw,2.3rem)] font-black leading-tight tracking-[-0.04em] sm:mt-2">
                Której promocji szukasz?
              </h2>
            </div>
            <p className="text-xs leading-6 text-stone-500">
              Wpisy zaktualizowano <time dateTime={updatedAt}>{updatedAtLabel}</time>
            </p>
          </div>
          {unavailable && (
             <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900">
               Lista kampanii jest chwilowo niedostępna. Spróbuj ponownie później.
             </div>
           )}
           <SheinPromotionsExplorer promotions={promotions} />
          <p className="mt-7 rounded-2xl border border-rose-100 bg-white px-5 py-4 text-xs leading-6 text-stone-600">
            <strong className="text-stone-900">Ważne:</strong> kody z katalogu nie są weryfikowane w czasie rzeczywistym.
            Większość to oznaczenia kampanii, a nie kupony do koszyka. Ceny, ważność i warunki sprawdzaj bezpośrednio w SHEIN.
          </p>
        </div>
      </section>

      <section aria-labelledby="help-promotions-title" className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">Krótka pomoc</p>
            <h2 id="help-promotions-title" className="mt-2 text-[clamp(1.7rem,5vw,2.4rem)] font-black leading-tight tracking-[-0.04em] text-stone-950">
              Kod kampanii czy kupon?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
              Kod kampanii pomaga znaleźć ofertę w SHEIN. Kupon rabatowy działa na określonych zasadach.
              Nie są tym samym — dlatego zawsze sprawdzaj wymagania w sklepie.
            </p>
            <Link href="/afiliacja" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-rose-700 hover:underline">
              Jak działają linki afiliacyjne? →
            </Link>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-stone-200 bg-[#faf8f7] p-5">
                <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-3 text-sm font-black leading-6 text-stone-950 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span aria-hidden="true" className="text-xl text-rose-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 border-t border-stone-200 pt-3 text-sm leading-7 text-stone-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-[#faf8f7]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-5 rounded-[26px] bg-stone-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-300">Więcej do odkrycia</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Szukasz ubrań w konkretnym budżecie?</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-stone-300">Odkryj gotowe stylizacje i produkty z katalogu Trend za Mniej.</p>
            </div>
            <Link href="/stylizacje" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-black text-stone-950 hover:bg-rose-50">
              Odkryj stylizacje →
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
