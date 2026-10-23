import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { STYLE_GUIDES, getGuideBySlug } from "@/lib/poradniki";
import { resolveLooks } from "@/lib/stylizacje";
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
      type: "article",
      title: guide.seoTitle,
      description: guide.summary,
      url: "/poradniki/" + guide.slug,
      images: [{ url: "/opengraph-image", width: 1200, height: 630,
        alt: "Trend za Mniej – poradniki i stylizacje" }]
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const availableLooks = resolveLooks(await getProducts()).filter((look) =>
    look.available && guide.relatedLookSlugs.includes(look.slug)
  );
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
          { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl }
        ]
      },
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.summary,
        mainEntityOfPage: pageUrl,
        inLanguage: "pl-PL",
        author: { "@type": "Organization", name: "Trend za Mniej" },
        publisher: { "@type": "Organization", name: "Trend za Mniej" }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <article className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
        <nav aria-label="Okruszki" className="flex flex-wrap items-center gap-2 text-xs text-stone-500 sm:text-sm">
          <Link href="/" className="hover:text-rose-700">Start</Link>
          <span aria-hidden="true">/</span>
          <Link href="/poradniki" className="hover:text-rose-700">Poradniki</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-stone-900">{guide.category}</span>
        </nav>
        <header className="mt-9 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">
            Praktyczny poradnik · {guide.category}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-700">{guide.lead}</p>
          <p className="mt-4 text-xs text-stone-500">Opracowanie redakcyjne: Trend za Mniej · Bez fizycznych testów produktów</p>
        </header>

        <div className="mt-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <div className="space-y-10">
            {guide.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={section.id + "-title"} className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-widest text-rose-700">Krok {index + 1}</p>
                <h2 id={section.id + "-title"} className="mt-3 text-2xl font-black tracking-tight">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-stone-700">{paragraph}</p>
                ))}
                <div className="mt-6 rounded-2xl bg-rose-50 p-5">
                  <h3 className="text-sm font-black text-rose-900">Na co zwrócić uwagę?</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-stone-700">
                    {section.tips.map((tip) => <li key={tip}>{tip}</li>)}
                  </ul>
                </div>
              </section>
            ))}
          </div>
          <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-black">Przed zakupem sprawdź</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
              {guide.checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-black text-rose-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-stone-100 pt-4 text-xs leading-6 text-stone-500">
              Linki do produktów mogą być afiliacyjne. Nie prowadzimy sprzedaży.
              Ceny w naszych zestawach są zapisane w katalogu i mogą różnić się od cen u partnera.
            </p>
            <Link href="/afiliacja" className="mt-3 inline-flex min-h-10 items-center text-sm font-bold text-rose-700 hover:underline">
              Zasady afiliacji →
            </Link>
          </aside>
        </div>

        <section aria-labelledby="related-outfits-title" className="mt-14">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Od teorii do inspiracji</p>
          <h2 id="related-outfits-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Zestawy pasujące do tego poradnika
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Przykłady opierają się na aktywnych produktach. Pokazane ceny to sumy zapisane
            w katalogu, bez dostawy i elementów wyłączonych z zestawu. Sprawdź ceny,
            dostępność i rozmiary każdego produktu bezpośrednio w SHEIN.
          </p>
          {availableLooks.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {availableLooks.map((look) => (
                <Link key={look.slug} href={"/stylizacje/" + look.slug}
                  className="group overflow-hidden rounded-3xl border border-stone-200 bg-white transition hover:border-rose-200 hover:shadow-md">
                  <div className="grid aspect-[2.6] grid-cols-2 overflow-hidden bg-stone-100">
                    {look.products.slice(0, 2).map((product) => (
                      <div key={product.id} className="relative">
                        <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 45vw, 20vw" />
                      </div>
                    ))}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{look.occasion}</p>
                    <h3 className="mt-2 text-lg font-black group-hover:text-rose-700">{look.title}</h3>
                    <p className="mt-3 text-sm font-bold text-stone-950">
                      {formatPrice(look.total)} <span className="font-normal text-stone-500">· suma zapisanych cen, bez dostawy</span>
                    </p>
                    <span className="mt-4 inline-flex text-sm font-black text-rose-700">Sprawdź skład stylizacji →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-stone-600">Nie mamy teraz kompletnego zestawu pasującego do tego poradnika.</p>
              <Link href="/stylizacje" className="mt-4 inline-flex min-h-10 items-center font-black text-rose-700 hover:underline">
                Zobacz inne dostępne stylizacje →
              </Link>
            </div>
          )}
        </section>
        <section className="mt-12 rounded-3xl bg-stone-950 px-6 py-9 text-white sm:px-9" aria-labelledby="guide-next-heading">
          <h2 id="guide-next-heading" className="text-2xl font-black">Masz ochotę na więcej inspiracji?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
            Zamiast kupować w ciemno, porównaj inne zestawy lub przeczytaj kolejny poradnik.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/poradniki" className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-black text-stone-950">
              Pozostałe poradniki →
            </Link>
            <Link href="/stylizacje" className="inline-flex min-h-11 items-center rounded-xl border border-stone-500 px-5 text-sm font-black text-white hover:bg-stone-800">
              Wszystkie stylizacje →
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
