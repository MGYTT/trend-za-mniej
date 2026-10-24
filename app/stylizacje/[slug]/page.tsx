import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { LOOKS, resolveLooks } from "@/lib/stylizacje";
import { getSiteUrl } from "@/lib/site";
import { getGuidesForLook } from "@/lib/poradniki";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LOOKS.map((look) => ({ slug: look.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const look = resolveLooks(await getProducts()).find((item) => item.slug === slug);
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
  const eligibleLooks = resolveLooks(await getProducts()).filter((item) => item.available);
  const look = eligibleLooks.find((item) => item.slug === slug);
  if (!look) notFound();

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
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <nav aria-label="Okruszki" className="text-sm">
          <Link href="/" className="text-stone-600 hover:text-rose-700">Start</Link>
          <span aria-hidden="true" className="mx-2 text-stone-400">/</span>
          <Link href="/stylizacje" className="font-bold text-rose-700 hover:underline">Stylizacje</Link>
          <span aria-hidden="true" className="mx-2 text-stone-400">/</span>
          <span className="text-stone-700">{look.title}</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-rose-700">{look.occasion} · {look.style}</p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-6xl">{look.title}</h1>
          <p className="mt-5 text-base leading-8 text-stone-600 sm:text-lg">{look.intro}</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-stone-700 sm:text-sm">
            <li className="rounded-full border border-stone-200 bg-white px-4 py-2">{look.products.length} {look.products.length === 2 ? "elementy" : "elementy"} garderoby</li>
            <li className="rounded-full border border-stone-200 bg-white px-4 py-2">Na okazję: {look.occasion.toLowerCase()}</li>
            <li className="rounded-full border border-stone-200 bg-white px-4 py-2">Budżet: do {formatPrice(look.maxBudget)}</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-900">Suma cen {look.products.length} elementów zapisanych w katalogu</p>
            <p className="mt-1 text-3xl font-black text-stone-950">{formatPrice(look.total)}</p>
            <p className="mt-2 text-xs leading-5 text-stone-600">Do założonego limitu {formatPrice(look.maxBudget)}. Bez dostawy; aktualną cenę sprawdź w sklepie.</p>
          </div>
          <a href="#sklad-stylizacji" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-stone-800">
            Zobacz ceny i oferty wszystkich elementów ↓
          </a>
        </header>

        <section id="sklad-stylizacji" aria-labelledby="outfit-items-title" className="mt-12 scroll-mt-24">
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {look.products.map((product) => (
              <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <Link href={"/produkt/" + product.slug} className="block focus-visible:outline-2 focus-visible:outline-rose-600" aria-label={"Szczegóły: " + product.name}>
                  <div className="relative aspect-[4/5] bg-stone-100">
                    <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 95vw, (max-width: 1023px) 46vw, 30vw" />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-rose-700">{product.category}</p>
                  <h3 className="mt-2 line-clamp-3 text-lg font-black leading-snug text-stone-950">{product.shortName || product.name}</h3>
                  <p className="mt-auto pt-4 text-2xl font-black tracking-tight">{formatPrice(product.price)}</p>
                  <p className="mt-1 text-xs text-stone-500">Cena zapisana przy publikacji</p>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <a
                      href={"/go/" + product.id + "?origin=outfit&look=" + encodeURIComponent(look.slug)}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600"
                    >
                      Sprawdź aktualną ofertę w SHEIN ↗
                    </a>
                    <Link
                      href={"/produkt/" + product.slug}
                      className="flex min-h-11 items-center justify-center rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-700 hover:bg-stone-50"
                    >
                      Szczegóły produktu
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="why-this-outfit" className="mt-12 max-w-5xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
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

        <aside className="mt-6 max-w-5xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
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
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-rose-200 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{other.occasion}</p>
                    <h3 className="mt-2 text-lg font-black">{other.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{other.intro}</p>
                  </div>
                  <div className="mt-4 border-t border-stone-100 pt-4 font-black text-rose-700">
                    {formatPrice(other.total)} · Zobacz zestaw →
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
