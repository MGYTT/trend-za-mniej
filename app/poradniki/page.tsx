import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts } from "@/lib/products";
import { resolveLooks } from "@/lib/stylizacje";
import { STYLE_GUIDES } from "@/lib/poradniki";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Poradniki modowe – jak skompletować stylizację w budżecie",
  description:
    "Praktyczne poradniki: co założyć do pracy, na weekend i jak stworzyć stylizację do 100 zł. Fasony, rozmiary, budżet i sprawdzone zasady zakupów online.",
  alternates: { canonical: "/poradniki" },
  openGraph: {
    type: "website",
    title: "Poradniki modowe i pomysły na gotowe zestawy | Trend za Mniej",
    description: "Dowiedz się, jak wybierać ubrania rozsądnie i znaleźć stylizację odpowiednią do okazji oraz budżetu.",
    url: "/poradniki"
  }
};

export default async function GuideIndexPage() {
  const eligibleLooks = resolveLooks(await getProducts()).filter((look) => look.available);
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Poradniki", item: siteUrl + "/poradniki" }
        ]
      },
      {
        "@type": "ItemList",
        name: "Poradniki modowe Trend za Mniej",
        numberOfItems: STYLE_GUIDES.length,
        itemListElement: STYLE_GUIDES.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: guide.title,
          url: siteUrl + "/poradniki/" + guide.slug
        }))
      }
    ]
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Okruszki" className="text-sm text-stone-500">
            <Link href="/" className="hover:text-rose-700">Start</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="font-semibold text-stone-950">Poradniki</span>
          </nav>
          <p className="mt-9 text-xs font-black uppercase tracking-[0.17em] text-rose-700">
            Mniej przypadkowych zakupów
          </p>
          <h1 className="mt-3 max-w-4xl text-balance text-4xl font-black tracking-tight sm:text-6xl">
            Poradniki modowe, które pomagają wybrać
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600 sm:text-lg">
            Jak ubrać się do pracy, co wybrać na weekend i jak nie przekroczyć budżetu?
            Piszemy o krojach, proporcjach i rzeczywistych potrzebach — bez obietnic
            nieistniejących rabatów ani udawania, że przetestowaliśmy każdą rzecz.
          </p>
          <Link href="/stylizacje"
            className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-rose-600 px-6 text-sm font-black text-white hover:bg-rose-700">
            Zobacz gotowe stylizacje →
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="guide-index-title">
        <h2 id="guide-index-title" className="text-2xl font-black tracking-tight sm:text-3xl">
          Wybierz temat, który Cię interesuje
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {STYLE_GUIDES.map((guide) => {
            const related = eligibleLooks.find((look) => guide.relatedLookSlugs.includes(look.slug));
            const image = related?.products[0];
            return (
              <article key={guide.slug} className="flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                {image && (
                  <Link href={"/poradniki/" + guide.slug} aria-label={"Czytaj: " + guide.title}
                    className="block focus-visible:outline-2 focus-visible:outline-rose-600">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <ProductPhoto src={image.image} alt={image.name}
                        sizes="(max-width: 767px) 100vw, 33vw" />
                    </div>
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700">{guide.category}</p>
                  <h3 className="mt-2 text-xl font-black leading-snug">
                    <Link href={"/poradniki/" + guide.slug} className="hover:text-rose-700">{guide.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{guide.summary}</p>
                  <Link href={"/poradniki/" + guide.slug}
                    className="mt-auto inline-flex min-h-11 items-center pt-6 text-sm font-black text-rose-700 hover:underline">
                    Przeczytaj poradnik →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-7 text-stone-600">
          W poradnikach wykorzystujemy dostępne przykłady z naszego katalogu.
          Jeżeli produkt lub stylizacja przestaną spełniać warunki publikacji,
          nie pokazujemy ich jako dostępnych ofert. Ceny i rozmiary zawsze potwierdzaj w sklepie.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
