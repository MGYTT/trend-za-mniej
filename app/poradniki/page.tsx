import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GuideExplorer, { type GuideTeaser } from "@/components/guides/GuideExplorer";
import { getProducts } from "@/lib/products";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { STYLE_GUIDES } from "@/lib/poradniki";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Poradniki modowe: rozmiary, stylizacje i zakupy z głową",
  description: "Jak dobrać rozmiar ubrań online, łączyć kolory i ubrać się do 100 lub 150 zł? Krótkie instrukcje, checklisty i praktyczne poradniki Trend za Mniej.",
  alternates: { canonical: "/poradniki" },
  openGraph: {
    type: "website",
    title: "Praktyczne poradniki modowe i zakupowe | Trend za Mniej",
    description: "Szybkie odpowiedzi, konkretne kroki i checklisty zamiast długiego szukania. Moda, rozmiary i budżet.",
    url: "/poradniki",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Trend za Mniej – poradniki modowe" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function GuideIndexPage() {
  const eligibleLooks = (await getAllResolvedLooks(await getProducts())).filter((look) => look.available);
  const cards: GuideTeaser[] = STYLE_GUIDES.map((guide) => {
    const related = eligibleLooks.find((look) => guide.relatedLookSlugs.includes(look.slug));
    const image = related?.products[0];
    return {
      slug: guide.slug, title: guide.title, summary: guide.summary,
      category: guide.category, topic: guide.topic, readMinutes: guide.readMinutes,
      quickSteps: guide.quickSteps,
      image: image ? { src: image.image, alt: image.name } : null,
    };
  });
  const siteUrl = getSiteUrl();
  const url = siteUrl + "/poradniki";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Poradniki", item: url },
        ],
      },
      {
        "@type": "CollectionPage", name: "Poradniki modowe i zakupowe",
        description: "Praktyczne instrukcje o rozmiarach ubrań, stylizacjach, kolorach i rozsądnych zakupach.",
        url, inLanguage: "pl-PL",
        mainEntity: { "@id": url + "#guide-list" },
      },
      {
        "@type": "ItemList", "@id": url + "#guide-list",
        name: "Poradniki modowe Trend za Mniej",
        numberOfItems: STYLE_GUIDES.length,
        itemListElement: STYLE_GUIDES.map((guide, index) => ({
          "@type": "ListItem", position: index + 1,
          name: guide.title, url: url + "/" + guide.slug,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#fbf9f9] text-stone-950">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>
      <SiteHeader />
      <header className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-br from-[#fff5f5] via-white to-[#fff0ef]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-rose-100/60 blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
          <nav aria-label="Okruszki" className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-rose-700">Start</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-rose-700">Poradniki</span>
          </nav>
          <div className="mt-9 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
            <div>
              <p className="inline-flex rounded-full border border-rose-200 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.13em] text-rose-700">
                Mała zmiana, lepszy zakup
              </p>
              <h1 className="mt-5 max-w-4xl text-balance text-[clamp(2.5rem,5.7vw,4.7rem)] font-black leading-[1.05] tracking-[-0.06em]">
                Mniej czytania.<br/><span className="text-rose-700">Więcej konkretów.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                Nie wiesz, jaki rozmiar wybrać, jak połączyć ubrania albo zmieścić się w budżecie?
                Znajdź odpowiedź, wykonaj trzy kroki i skorzystaj z checklisty.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#znajdz-poradnik"
                  className="inline-flex min-h-12 items-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-[0_10px_30px_rgba(225,29,72,0.17)] hover:bg-rose-700">
                  Wybierz swój problem ↓
                </Link>
                <Link href="/stylizacje"
                  className="inline-flex min-h-12 items-center rounded-2xl border border-rose-200 bg-white px-6 text-sm font-black text-rose-800 hover:bg-rose-50">
                  Zobacz stylizacje ↗
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-stone-600">
                <span>✓ Odpowiedź na start</span>
                <span>✓ 3 proste kroki</span>
                <span>✓ Lista przed zakupem</span>
              </div>
            </div>
            <aside aria-label="Popularne pytania" className="rounded-[30px] border border-white bg-white/90 p-5 shadow-[0_20px_50px_rgba(110,30,52,0.07)] backdrop-blur-sm sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">
                Od czego zacząć?
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight">Trzy przydatne pytania</h2>
              <div className="mt-5 divide-y divide-stone-100">
                {[
                  { label: "Jaki rozmiar wybrać przez internet?", href: "/poradniki/jak-dobrac-rozmiar-ubran-przez-internet", icon: "01" },
                  { label: "Jak złożyć zestaw do 100 zł?", href: "/poradniki/jak-skompletowac-stylizacje-do-100-zl", icon: "02" },
                  { label: "Jak łączyć kolory ubrań?", href: "/poradniki/jak-laczyc-kolory-ubran-w-stylizacji", icon: "03" },
                ].map((item) => (
                  <Link href={item.href} key={item.href}
                    className="flex min-h-16 items-center gap-3 py-3 text-sm font-bold text-stone-900 transition hover:text-rose-700">
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xs font-black text-rose-700">{item.icon}</span>
                    <span className="min-w-0 flex-1">{item.label}</span>
                    <span className="text-rose-600" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-500">
                Konkretne porady bez deklarowania testów produktów, których nie wykonaliśmy.
              </p>
            </aside>
          </div>
        </div>
      </header>

      <GuideExplorer guides={cards} />

      <section className="border-t border-rose-100 bg-white px-4 py-14 sm:px-6" aria-labelledby="guide-to-looks">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[28px] bg-stone-950 p-7 text-white sm:p-9 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-200">Od wiedzy do działania</p>
            <h2 id="guide-to-looks" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Masz pomysł? Dopasuj do niego gotowy zestaw.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
              Zobacz dostępne stylizacje i skład każdego zestawu. Przed zakupem porównaj aktualną
              cenę, rozmiar i warunki dostawy w sklepie partnera.
            </p>
          </div>
          <Link href="/stylizacje"
            className="inline-flex min-h-12 shrink-0 items-center rounded-xl bg-white px-6 text-sm font-black text-stone-950 hover:bg-rose-50">
            Przeglądaj stylizacje ↗
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
