import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import GuideChecklist from "@/components/guides/GuideChecklist";
import GuideBudgetPlanner from "@/components/guides/GuideBudgetPlanner";
import { getProducts, formatPrice } from "@/lib/products";
import { STYLE_GUIDES, getGuideBySlug } from "@/lib/poradniki";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STYLE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Poradnik niedostępny", robots: { index: false, follow: false } };
  return {
    title: guide.seoTitle,
    description: guide.summary,
    alternates: { canonical: "/poradniki/" + guide.slug },
    openGraph: {
      type: "article", title: guide.seoTitle,
      description: guide.summary, url: "/poradniki/" + guide.slug,
      images: [{ url: "/opengraph-image", width: 1200, height: 630,
        alt: "Trend za Mniej – poradniki i stylizacje" }],
    },
    twitter: { card: "summary_large_image", title: guide.seoTitle, description: guide.summary },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const availableLooks = (await getAllResolvedLooks(await getProducts())).filter((look) =>
    look.available && guide.relatedLookSlugs.includes(look.slug)
  );
  const relatedGuides = STYLE_GUIDES.filter((item) => item.slug !== guide.slug)
    .sort((a, b) => Number(b.topic === guide.topic) - Number(a.topic === guide.topic))
    .slice(0, 3);
  const budget = /do-(100|150)-zl/.exec(guide.slug);
  const budgetLimit = budget ? Number(budget[1]) : null;
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl + "/poradniki/" + guide.slug;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Poradniki", item: siteUrl + "/poradniki" },
          { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
        ],
      },
      {
        "@type": "Article",
        headline: guide.title, description: guide.summary,
        abstract: guide.quickAnswer, mainEntityOfPage: pageUrl, url: pageUrl,
        articleSection: guide.category, about: { "@type": "Thing", name: guide.topic },
        isPartOf: { "@type": "CollectionPage", name: "Poradniki modowe", url: siteUrl + "/poradniki" },
        inLanguage: "pl-PL",
        author: { "@type": "Organization", name: "Trend za Mniej", url: siteUrl + "/o-nas" },
        publisher: { "@type": "Organization", name: "Trend za Mniej" },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf9f9] text-stone-950">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <article>
        <header className="overflow-hidden border-b border-rose-100 bg-gradient-to-br from-[#fff2f3] via-white to-[#fff8f6]">
          <div className="mx-auto max-w-6xl px-4 pb-11 pt-7 sm:px-6 sm:pb-14 sm:pt-9">
            <nav aria-label="Okruszki" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
              <Link href="/" className="hover:text-rose-700">Start</Link>
              <span aria-hidden="true">/</span>
              <Link href="/poradniki" className="hover:text-rose-700">Poradniki</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-rose-700">{guide.category}</span>
            </nav>
            <div className="mt-7 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                <span className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-rose-700">{guide.category}</span>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-600">ok. {guide.readMinutes} min czytania</span>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-600">3 kroki</span>
              </div>
              <h1 className="mt-5 max-w-4xl text-balance text-[clamp(2.1rem,5.1vw,3.65rem)] font-black leading-[1.1] tracking-[-0.055em]">
                {guide.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600 sm:text-lg">{guide.lead}</p>
              <p className="mt-4 text-xs leading-6 text-stone-500">
                Opracowanie redakcyjne: Trend za Mniej · Bez fizycznych testów produktów.
                Wskazówki pomagają podjąć decyzję, ale nie zastępują sprawdzenia oferty w sklepie.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#szybka-odpowiedz"
                  className="inline-flex min-h-12 items-center rounded-xl bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700">
                  Odpowiedź w 30 sekund ↓
                </a>
                <a href="#lista-zakupowa"
                  className="inline-flex min-h-12 items-center rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-800 hover:bg-rose-50">
                  Lista przed zakupem ↗
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6">
          <section id="szybka-odpowiedz" aria-labelledby="quick-answer-title"
            className="scroll-mt-24 overflow-hidden rounded-[28px] border border-rose-100 bg-white p-6 shadow-[0_15px_38px_rgba(120,28,50,0.045)] sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Najważniejsze od razu</p>
            <h2 id="quick-answer-title" className="mt-2 text-2xl font-black tracking-tight">
              Krótka odpowiedź
            </h2>
            <p className="mt-4 max-w-4xl text-lg font-semibold leading-8 text-stone-800">{guide.quickAnswer}</p>
          </section>

          <section aria-labelledby="quick-steps-title" className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Wprowadź w życie</p>
                <h2 id="quick-steps-title" className="mt-2 text-2xl font-black tracking-tight">Plan w trzech krokach</h2>
              </div>
              <span className="text-xs font-semibold text-stone-500">Bez zbędnego czytania</span>
            </div>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {guide.quickSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-[22px] border border-rose-100 bg-[#fff9fa] p-5">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-sm font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-sm font-bold leading-6 text-stone-800">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1fr)_305px] lg:items-start">
            <div className="min-w-0 space-y-5">
              {budgetLimit === 100 || budgetLimit === 150 ? (
                <GuideBudgetPlanner limit={budgetLimit} />
              ) : null}

              <section aria-labelledby="guide-details-title">
                <div className="mb-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Gdy chcesz wiedzieć więcej</p>
                  <h2 id="guide-details-title" className="mt-2 text-2xl font-black tracking-tight">
                    Jak zrobić to krok po kroku?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Najważniejsze wskazówki są widoczne od razu. Dłuższe wyjaśnienia rozwiń tylko, jeśli ich potrzebujesz.
                  </p>
                </div>
                <div className="space-y-5">
                  {guide.sections.map((section, index) => (
                    <section key={section.id} id={section.id} aria-labelledby={section.id + "-title"}
                      className="scroll-mt-24 rounded-[25px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-700">{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Krok {index + 1}</p>
                          <h3 id={section.id + "-title"} className="mt-1 text-lg font-black leading-snug tracking-tight sm:text-xl">{section.title}</h3>
                        </div>
                      </div>
                      <div className="mt-5 rounded-2xl bg-[#fff6f7] p-4 sm:p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-rose-800">Co zrobić?</p>
                        <ul className="mt-3 space-y-3">
                          {section.tips.map((tip) => (
                            <li key={tip} className="flex gap-3 text-sm leading-6 text-stone-800">
                              <span aria-hidden="true" className="font-black text-rose-700">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <details className="group mt-4 border-t border-stone-100 pt-3">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-2 text-sm font-black text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-rose-500">
                          <span>Dlaczego to ważne? Pokaż wyjaśnienie</span>
                          <span aria-hidden="true" className="text-rose-600 transition group-open:rotate-180">⌄</span>
                        </summary>
                        <div className="px-2 pb-2 pt-2">
                          {section.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="mt-3 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">{paragraph}</p>
                          ))}
                        </div>
                      </details>
                    </section>
                  ))}
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
              <nav aria-label="Spis treści poradnika" className="rounded-[25px] border border-stone-200 bg-white p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-700">Na skróty</p>
                <h2 className="mt-2 text-lg font-black tracking-tight">Przejdź do tematu</h2>
                <ol className="mt-4 space-y-2">
                  {guide.sections.map((section, index) => (
                    <li key={section.id}>
                      <a href={"#" + section.id}
                        className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm font-semibold text-stone-600 hover:bg-rose-50 hover:text-rose-700">
                        <span className="text-xs font-black text-rose-600">{index + 1}.</span>
                        <span>{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div id="lista-zakupowa" className="scroll-mt-24">
                <GuideChecklist items={guide.checklist} />
              </div>
              <p className="px-2 text-xs leading-6 text-stone-500">
                Linki mogą być afiliacyjne. Nie prowadzimy sprzedaży, a ceny oraz
                rozmiary należy potwierdzić bezpośrednio w sklepie.{" "}
                <Link href="/afiliacja" className="font-black text-rose-700 hover:underline">Zasady afiliacji ↗</Link>
              </p>
            </aside>
          </div>

          <section aria-labelledby="related-outfits-title" className="mt-14">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Zobacz w praktyce</p>
            <h2 id="related-outfits-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Zestawy pasujące do tego poradnika
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Przykłady pochodzą z dostępnych stylizacji. Pokazane ceny to sumy zapisane
              w katalogu, bez dostawy i elementów wyłączonych z zestawu.
              Sprawdź cenę, dostępność i rozmiar wybranego wariantu bezpośrednio w SHEIN.
            </p>
            {availableLooks.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {availableLooks.slice(0, 4).map((look) => (
                  <Link key={look.slug} href={"/stylizacje/" + look.slug}
                    className="group overflow-hidden rounded-[25px] border border-stone-200 bg-white transition hover:border-rose-200 hover:shadow-lg">
                    <div className="grid aspect-[2.7] grid-cols-2 overflow-hidden bg-rose-50">
                      {look.products.slice(0, 2).map((product) => (
                        <div key={product.id} className="relative">
                          <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 45vw, 20vw" />
                        </div>
                      ))}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-rose-700">{look.occasion}</p>
                      <h3 className="mt-2 text-lg font-black group-hover:text-rose-700">{look.title}</h3>
                      <p className="mt-2 text-sm font-bold text-stone-900">
                        {formatPrice(look.total)} <span className="font-normal text-stone-500">· suma zapisanych cen, bez dostawy</span>
                      </p>
                      <span className="mt-3 inline-flex text-sm font-black text-rose-700">Sprawdź elementy zestawu ↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6">
                <p className="text-sm leading-7 text-stone-600">Nie mamy teraz kompletnego zestawu pasującego do tego poradnika.</p>
                <Link href="/stylizacje" className="inline-flex min-h-11 items-center font-black text-rose-700 hover:underline">
                  Zobacz inne dostępne stylizacje ↗
                </Link>
              </div>
            )}
          </section>

          <section aria-labelledby="related-guides-title" className="mt-14">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Jeszcze jedna przydatna odpowiedź</p>
            <h2 id="related-guides-title" className="mt-2 text-2xl font-black tracking-tight">Powiązane poradniki</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link href={"/poradniki/" + related.slug} key={related.slug}
                  className="flex min-h-36 flex-col rounded-[22px] border border-stone-200 bg-white p-5 transition hover:border-rose-200 hover:shadow-md">
                  <p className="text-[11px] font-black uppercase tracking-wide text-rose-700">{related.category}</p>
                  <h3 className="mt-2 text-base font-black leading-snug text-stone-900">{related.title}</h3>
                  <span className="mt-auto pt-4 text-xs font-black text-rose-700">Zobacz poradę ↗</span>
                </Link>
              ))}
            </div>
          </section>
          <div className="mt-10 rounded-[25px] bg-stone-950 p-6 text-white sm:p-8">
            <p className="text-lg font-black">Wybieraj świadomie, bez pośpiechu.</p>
            <p className="mt-2 text-sm leading-7 text-stone-300">Przejrzyj inne krótkie porady albo dopasuj dostępny zestaw do własnego budżetu.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/poradniki" className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-black text-stone-950">Wszystkie poradniki ↗</Link>
              <Link href="/stylizacje" className="inline-flex min-h-11 items-center rounded-xl border border-stone-500 px-5 text-sm font-black text-white hover:bg-stone-800">Gotowe stylizacje ↗</Link>
            </div>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
