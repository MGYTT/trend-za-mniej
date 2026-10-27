import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { LOOKS } from "@/lib/stylizacje";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { getSiteUrl } from "@/lib/site";
import { getGuidesForLook } from "@/lib/poradniki";
import { OUTFIT_CATEGORIES, getOutfitCategory, matchesOutfitCategory } from "@/lib/outfit-landing-categories";
import OutfitCategoryLanding from "@/components/OutfitCategoryLanding";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...LOOKS.map((look) => ({ slug: look.slug })), ...OUTFIT_CATEGORIES.map((category) => ({ slug: category.slug }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getOutfitCategory(slug);
  if (category) {
    const matching = (await getAllResolvedLooks(await getProducts()))
      .filter((item) => item.available && matchesOutfitCategory(category, item));
    if (!matching.length) return { title: "Kategoria stylizacji niedostępna", robots: { index: false, follow: false } };
    return {
      title: category.heading,
      description: category.description,
      alternates: { canonical: "/stylizacje/" + category.slug },
      openGraph: {
        type: "website",
        title: category.heading + " | Trend za Mniej",
        description: category.description,
        url: "/stylizacje/" + category.slug,
      },
    };
  }
  const look = (await getAllResolvedLooks(await getProducts())).find((item) => item.slug === slug);
  if (!look?.available) {
    return { title: "Stylizacja niedostępna", robots: { index: false, follow: false } };
  }
  return {
    title: look.title + " – skład i suma cen",
    description: look.intro + " Sprawdź skład stylizacji, sumę zapisanych cen i czego nie obejmuje komplet. Aktualne ceny i rozmiary potwierdź w SHEIN.",
    alternates: { canonical: "/stylizacje/" + look.slug },
    openGraph: {
      type: "website",
      url: "/stylizacje/" + look.slug,
      title: look.title,
      description: look.intro,
      images: look.products[0]?.image
        ? [{ url: look.products[0].image, alt: look.products[0].name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: look.title,
      description: look.intro,
      images: look.products[0]?.image ? [look.products[0].image] : undefined,
    },
  };
}

export default async function LookPage({ params }: Props) {
  const { slug } = await params;
  const eligibleLooks = (await getAllResolvedLooks(await getProducts())).filter((item) => item.available);
  const category = getOutfitCategory(slug);
  if (category) {
    const matching = eligibleLooks.filter((item) => matchesOutfitCategory(category, item));
    if (!matching.length) notFound();
    return <OutfitCategoryLanding category={category} looks={matching} />;
  }
  const look = eligibleLooks.find((item) => item.slug === slug);
  if (!look) notFound();
  const matchingCategories = OUTFIT_CATEGORIES.filter((category) => matchesOutfitCategory(category, look));

  const siteUrl = getSiteUrl();
  const url = siteUrl + "/stylizacje/" + look.slug;
  // Prefer alternatives for the same occasion, then a comparable catalog budget.
  const otherLooks = eligibleLooks
    .filter((item) => item.slug !== look.slug)
    .sort((a, b) =>
      Number(b.occasion === look.occasion) - Number(a.occasion === look.occasion) ||
      Math.abs(a.total - look.total) - Math.abs(b.total - look.total)
    )
    .slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Stylizacje", item: siteUrl + "/stylizacje" },
          { "@type": "ListItem", position: 3, name: look.title, item: url },
        ],
      },
      {
        "@type": "ItemList",
        name: "Elementy stylizacji: " + look.title,
        numberOfItems: look.products.length,
        itemListElement: look.products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: siteUrl + "/produkt/" + product.slug,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <article className="mx-auto max-w-7xl px-6 py-8 sm:px-8 sm:py-16">
        <nav aria-label="Okruszki" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold leading-6 sm:text-sm">
          <Link href="/" className="text-stone-600 hover:text-rose-700">Start</Link>
          <span aria-hidden="true" className="text-stone-400">/</span>
          <Link href="/stylizacje" className="font-bold text-rose-700 hover:underline">Stylizacje</Link>
          <span aria-hidden="true" className="text-stone-400">/</span>
          <span className="break-words text-stone-700">{look.title}</span>
        </nav>

        <header className="mt-8 grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase leading-5 tracking-[0.15em] text-rose-700">
              {look.occasion} · {look.style}
            </p>
            <h1 className="mt-3 text-pretty text-[clamp(2rem,6.7vw,3.8rem)] font-black leading-[1.09] tracking-[-0.05em] text-stone-950">
              {look.title}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-stone-600 sm:text-lg">
              {look.intro}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-stone-700 sm:text-sm">
              <li className="rounded-full border border-rose-100 bg-rose-50 px-4 py-2">{look.products.length} elementy zestawu</li>
              <li className="rounded-full border border-stone-200 bg-white px-4 py-2">Na okazję: {look.occasion.toLowerCase()}</li>
              <li className="rounded-full border border-stone-200 bg-white px-4 py-2">Budżet do {formatPrice(look.maxBudget)}</li>
            </ul>
            <div className="mt-7 rounded-[26px] border border-rose-200 bg-white p-5 shadow-[0_14px_38px_rgba(136,19,55,0.07)] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.11em] text-rose-700">
                Suma cen {look.products.length} elementów zapisanych w katalogu
              </p>
              <p className="mt-2 text-[clamp(2rem,7vw,3rem)] font-black leading-tight tracking-[-0.05em] text-stone-950">
                {formatPrice(look.total)}
              </p>
              <p className="mt-3 text-xs leading-6 text-stone-600">
                Zapisane ceny bez dostawy i elementów niewymienionych w składzie.
                Aktualne kwoty i dostępność potwierdź w SHEIN.
              </p>
              <a
                href="#sklad-stylizacji"
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-rose-600 px-4 text-center text-sm font-black text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-500"
              >
                Zobacz skład i oferty ↓
              </a>
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_16px_45px_rgba(28,25,23,0.07)]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">Zobacz elementy looku</span>
              <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">Do {look.maxBudget} zł</span>
            </div>
            <div className="grid h-[225px] grid-cols-2 gap-2 bg-rose-50 p-3 min-[400px]:h-[300px] sm:h-[360px] lg:h-[300px]">
              {look.products.slice(0, 2).map((product, index) => (
                <Link
                  key={product.id}
                  href={"/produkt/" + product.slug}
                  aria-label={"Zobacz produkt: " + product.name}
                  className="group relative min-w-0 overflow-hidden rounded-[20px] bg-white focus-visible:outline-2 focus-visible:outline-rose-500"
                >
                  <ProductPhoto
                    src={product.image}
                    alt={product.name}
                    sizes="(max-width: 639px) 42vw, (max-width: 1023px) 42vw, 19vw"
                    priority={index === 0}
                    className="p-3 transition duration-500 motion-safe:group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
            <p className="px-5 py-4 text-xs leading-6 text-stone-500">
              Kompozycja z produktów dostępnych w naszym katalogu. Kolory i rozmiary sprawdź w sklepie.
            </p>
          </div>
        </header>

        {matchingCategories.length > 0 && (
          <nav aria-label="Kategorie tej stylizacji" className="mt-10">
            <p className="mb-3 text-sm font-black text-stone-700">Przeglądaj podobne inspiracje</p>
            <div className="flex flex-wrap gap-2">
              {matchingCategories.map((category) => (
                <Link key={category.slug} href={"/stylizacje/" + category.slug}
                  className="inline-flex min-h-11 items-center rounded-full border border-rose-200 bg-white px-4 text-xs font-bold text-rose-700 hover:bg-rose-50">
                  {category.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <section id="sklad-stylizacji" aria-labelledby="outfit-items-title" className="mt-12 scroll-mt-24 lg:mt-16">
          <div className="max-w-3xl">
            <h2 id="outfit-items-title" className="text-2xl font-black tracking-tight sm:text-3xl">
              Co wchodzi w skład stylizacji?
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Każdy produkt możesz obejrzeć dokładniej albo przejść bezpośrednio do oferty w SHEIN.
              Nie ma jednego wspólnego koszyka dla całego zestawu. Każdy link do SHEIN
              jest partnerski; kliknięcie nie oznacza zakupu.
            </p>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {look.products.map((product) => (
              <article key={product.id} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_8px_28px_rgba(28,25,23,0.05)] transition hover:border-rose-200 hover:shadow-lg">
                <Link href={"/produkt/" + product.slug} className="block focus-visible:outline-2 focus-visible:outline-rose-600" aria-label={"Szczegóły: " + product.name}>
                  <div className="relative aspect-[5/4] bg-gradient-to-br from-rose-50 to-stone-100 sm:aspect-[4/5]">
                    <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 87vw, (max-width: 1279px) 43vw, 28vw" className="p-4 transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" />
                  </div>
                </Link>
                <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-rose-700">{product.category}</p>
                  <h3 className="mt-2 line-clamp-3 text-lg font-black leading-snug tracking-tight text-stone-950">{product.shortName || product.name}</h3>
                  <p className="mt-auto pt-5 text-2xl font-black tracking-tight text-stone-950">{formatPrice(product.price)}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Cena zapisana przy publikacji · bez dostawy</p>
                  <div className="mt-5 grid grid-cols-1 gap-2">
                    <a
                      href={"/go/" + product.id + "?origin=outfit&look=" + encodeURIComponent(look.slug)}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-center text-sm font-extrabold leading-6 text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600"
                    >
                      Sprawdź aktualną ofertę w SHEIN ↗
                    </a>
                    <Link
                      href={"/produkt/" + product.slug}
                      className="flex min-h-11 items-center justify-center rounded-xl border border-stone-200 px-4 text-center text-sm font-bold text-stone-700 hover:border-rose-200 hover:bg-rose-50"
                    >
                      Szczegóły produktu
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="why-this-outfit" className="mt-12 max-w-5xl rounded-[26px] border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Pomoc w wyborze</p>
          <h2 id="why-this-outfit" className="mt-2 text-2xl font-black tracking-tight">
            Dlaczego te elementy do siebie pasują?
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {look.whyItWorks.map((reason) => (
              <li key={reason} className="rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-stone-700">
                <span aria-hidden="true" className="mr-2 font-black text-rose-700">✓</span>
                {reason}
              </li>
            ))}
          </ul>
          <h3 className="mt-7 text-lg font-black text-stone-900">Czego nie obejmuje cena?</h3>
          <p className="mt-2 text-sm leading-7 text-stone-600">{look.excluded}</p>
        </section>

        <aside className="mt-6 max-w-5xl rounded-[26px] border border-rose-100 bg-rose-50/70 p-6 sm:p-8">
          <h2 className="text-xl font-black">Wskazówka przed zakupem</h2>
          <p className="mt-3 leading-7 text-stone-700">{look.tip}</p>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Przed zakupem sprawdź w SHEIN aktualną cenę, rozmiar i dostępność każdego elementu.
            Wskazany koszt to suma cen z naszego katalogu, bez dostawy i ewentualnych opłat.
            Trend za Mniej nie prowadzi sprzedaży. Jeśli skorzystasz z linków do sklepu, możemy otrzymać prowizję afiliacyjną.
          </p>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Sprawdź również, czy masz już w szafie elementy niewliczone w komplet.
            Nasz opis jest propozycją stylizacji, nie opinią po fizycznym przetestowaniu każdego produktu.
          </p>
          <Link href="/afiliacja" className="mt-4 inline-flex min-h-10 items-center text-sm font-extrabold text-rose-700 hover:underline">
            Jak działają linki afiliacyjne? →
          </Link>
        </aside>

        {getGuidesForLook(look.slug).length > 0 && (
          <section aria-labelledby="look-guides-title" className="mt-12">
            <h2 id="look-guides-title" className="text-2xl font-black tracking-tight">
              Dowiedz się, jak nosić tę stylizację
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Poznaj praktyczne wskazówki o fasonach, budżecie i sprawdzaniu ofert
              przed zakupem.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {getGuidesForLook(look.slug).map((guide) => (
                <Link key={guide.slug} href={"/poradniki/" + guide.slug}
                  className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-rose-200 hover:shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-rose-700">{guide.category}</span>
                  <h3 className="mt-2 text-lg font-black">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{guide.summary}</p>
                  <span className="mt-4 inline-flex text-sm font-black text-rose-700">Przeczytaj poradnik →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherLooks.length > 0 && (
          <section aria-labelledby="other-outfits-title" className="mt-12">
            <h2 id="other-outfits-title" className="text-2xl font-black tracking-tight">
              Zobacz też inne stylizacje
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherLooks.map((other) => (
                <Link
                  key={other.slug}
                  href={"/stylizacje/" + other.slug}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-rose-600 motion-reduce:transform-none"
                >
                  <div className="grid h-36 grid-cols-2 gap-2 bg-rose-50 p-2">
                    {other.products.slice(0, 2).map((product) => (
                      <div key={product.id} className="relative min-w-0 overflow-hidden rounded-2xl bg-white">
                        <ProductPhoto
                          src={product.image}
                          alt={product.name}
                          sizes="(max-width: 639px) 42vw, (max-width: 1023px) 22vw, 16vw"
                          className="p-2 transition-transform duration-500 motion-safe:group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{other.occasion}</p>
                    <h3 className="mt-2 text-lg font-black leading-snug text-stone-950">{other.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{other.intro}</p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 sm:mt-5">
                      <strong className="text-xl font-black tracking-tight text-stone-950">{formatPrice(other.total)}</strong>
                      <span className="text-sm font-black text-rose-700">Zobacz zestaw →</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-500">Suma zapisanych cen, bez dostawy</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
