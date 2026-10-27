import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { formatPrice } from "@/lib/products";
import { OUTFIT_CATEGORIES, type OutfitCategory } from "@/lib/outfit-landing-categories";
import type { ResolvedLook } from "@/lib/stylizacje";
import { getSiteUrl } from "@/lib/site";

export default function OutfitCategoryLanding({
  category,
  looks,
}: {
  category: OutfitCategory;
  looks: ResolvedLook[];
}) {
  const url = getSiteUrl() + "/stylizacje/" + category.slug;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: getSiteUrl() },
          { "@type": "ListItem", position: 2, name: "Stylizacje", item: getSiteUrl() + "/stylizacje" },
          { "@type": "ListItem", position: 3, name: category.label, item: url },
        ],
      },
      {
        "@type": "ItemList",
        name: category.heading,
        numberOfItems: looks.length,
        itemListElement: looks.map((look, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: look.title,
          url: getSiteUrl() + "/stylizacje/" + look.slug,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <div className="border-b border-rose-100 bg-[#fff8f7]">
        <div className="mx-auto max-w-7xl px-6 py-11 sm:px-8 sm:py-16">
          <nav aria-label="Okruszki" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600">
            <Link href="/" className="hover:text-rose-700">Start</Link>
            <span aria-hidden="true">/</span>
            <Link href="/stylizacje" className="hover:text-rose-700">Stylizacje</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-bold text-rose-700">{category.label}</span>
          </nav>
          <p className="mt-8 text-xs font-black uppercase tracking-widest text-rose-700">Stylizacje • okazje i budżety</p>
          <h1 className="mt-3 max-w-4xl text-pretty text-[clamp(2rem,6vw,4rem)] font-black leading-[1.12] tracking-[-0.05em]">{category.heading}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-stone-700">{category.intro}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-800">
              {looks.length} {looks.length === 1 ? "stylizacja" : looks.length < 5 ? "stylizacje" : "stylizacji"}
            </span>
            <span className="text-sm text-stone-600">Realne produkty • zapisane ceny • bez kosztów dostawy</span>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16" aria-labelledby="category-outfits">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="category-outfits" className="text-2xl font-black tracking-tight sm:text-3xl">Wybrane zestawy</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">Otwórz stylizację, aby zobaczyć pełny skład, osobne produkty i wskazówki dotyczące fasonu.</p>
          </div>
          <Link href="/stylizacje" className="text-sm font-bold text-rose-700 hover:underline">Wszystkie stylizacje →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {looks.map((look) => (
            <article key={look.slug} className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_7px_25px_rgba(28,25,23,0.045)] transition hover:border-rose-200 hover:shadow-lg">
              <Link href={"/stylizacje/" + look.slug} aria-label={"Zobacz stylizację: " + look.title} className="block focus-visible:outline-2 focus-visible:outline-rose-600">
                <div className="relative grid aspect-[1.6] grid-cols-2 gap-2 bg-rose-50 p-3">
                  {look.products.slice(0, 2).map((product) => (
                    <div key={product.id} className="relative min-w-0 overflow-hidden rounded-2xl bg-white">
                      <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 640px) 43vw, (max-width: 1280px) 23vw, 16vw" className="p-2 transition duration-500 motion-safe:group-hover:scale-105" />
                    </div>
                  ))}
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-black text-rose-700 shadow-sm">Do {look.maxBudget} zł</span>
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-wide text-rose-700">{look.occasion} · {look.style}</p>
                <h3 className="mt-2 text-xl font-black leading-snug tracking-tight">
                  <Link href={"/stylizacje/" + look.slug} className="hover:text-rose-700">{look.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">{look.intro}</p>
                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-3 border-t border-stone-100 pt-4">
                    <span className="text-xs text-stone-600">{look.products.length} produkty w zestawie</span>
                    <strong className="text-xl font-black text-stone-950">{formatPrice(look.total)}</strong>
                  </div>
                  <Link href={"/stylizacje/" + look.slug} className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700">
                    Zobacz skład zestawu →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-11 sm:px-8">
          <h2 className="text-2xl font-black tracking-tight">Na co zwrócić uwagę?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-700">{category.advice}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">Trend za Mniej to katalog inspiracji i linków afiliacyjnych, nie sklep. Cena jest sumą zapisanych cen wymienionych elementów. Rozmiar, dostępność, aktualną cenę i dostawę zawsze potwierdź u sprzedawcy.</p>
        </div>
      </section>

      <nav aria-label="Pozostałe kategorie stylizacji" className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <h2 className="text-xl font-black tracking-tight">Sprawdź też inne okazje i budżety</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {OUTFIT_CATEGORIES.filter((entry) => entry.slug !== category.slug).map((entry) => (
            <Link key={entry.slug} href={"/stylizacje/" + entry.slug}
              className="inline-flex min-h-11 items-center rounded-full border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50">
              {entry.label}
            </Link>
          ))}
        </div>
      </nav>
      <SiteFooter />
    </main>
  );
}
