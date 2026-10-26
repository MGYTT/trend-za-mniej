import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CouponCatalog from "@/components/CouponCatalog";
import { getPublicShopDirectory } from "@/lib/stores";
import { isStoreSlug } from "@/lib/store-validation";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { offerCountLabel } from "@/lib/store-directory-utils";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isStoreSlug(slug)) return { title: "Sklep nie istnieje", robots: { index: false } };
  const { stores, offers } = await getPublicShopDirectory();
  const store = stores.find(item => item.slug === slug);
  if (!store) return { title: "Sklep nie istnieje", robots: { index: false } };
  const hasOffers = offers.some(item => item.storeSlug === slug);
  const description = hasOffers
    ? "Kody, kampanie i promocje sklepu " + store.name + ". Sprawdź rodzaj oferty i warunki u sprzedawcy."
    : "Informacje o sklepie " + store.name + " w katalogu Trend za Mniej. Obecnie brak opublikowanych promocji.";
  return {
    title: store.name + " — kody i promocje | Trend za Mniej",
    description,
    alternates: { canonical: "/kody-rabatowe/" + slug },
    // Avoid promoting empty merchant pages as search landing pages.
    robots: { index: hasOffers, follow: true },
    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: "/kody-rabatowe/" + slug,
      siteName: SITE_NAME,
      title: store.name + " — kody i promocje",
      description,
    },
  };
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  if (!isStoreSlug(slug)) notFound();
  const { stores, offers, unavailable } = await getPublicShopDirectory();
  const store = stores.find(item => item.slug === slug);
  if (!store) notFound();

  const shopOffers = offers.filter(offer => offer.storeSlug === slug);
  const couponCount = shopOffers.filter(offer => offer.type === "coupon").length;
  const campaignCount = shopOffers.filter(offer => offer.type === "campaign").length;
  const promotionCount = shopOffers.filter(offer => offer.type === "promotion").length;
  const otherStores = stores.filter(item => item.slug !== slug && item.offerCount > 0).slice(0, 3);
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": siteUrl + "/kody-rabatowe/" + store.slug + "#webpage",
        url: siteUrl + "/kody-rabatowe/" + store.slug,
        name: store.name + " — kody i promocje",
        description: store.description,
        inLanguage: "pl-PL",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trend za Mniej", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Kody rabatowe", item: siteUrl + "/kody-rabatowe" },
          { "@type": "ListItem", position: 3, name: store.name, item: siteUrl + "/kody-rabatowe/" + store.slug },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <header className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-6xl px-5 py-11 sm:py-14">
          <nav aria-label="Ścieżka strony" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-rose-700">Trend za Mniej</Link>
            <span>/</span>
            <Link href="/kody-rabatowe" className="hover:text-rose-700">Kody rabatowe</Link>
            <span>/</span>
            <span aria-current="page" className="text-stone-800">{store.name}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span aria-hidden="true" className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-rose-100 bg-white text-4xl font-black text-rose-700 shadow-sm">
              {store.name.slice(0, 1).toLocaleUpperCase("pl")}
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-700">
                {store.category}
              </span>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight tracking-tight">
                {store.name} — kody i promocje
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-8 text-stone-600">{store.description}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white/90 p-4">
              <p className="text-xs font-semibold text-stone-500">Kupony do koszyka</p>
              <p className="mt-2 text-3xl font-black tabular-nums">{couponCount}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-4">
              <p className="text-xs font-semibold text-stone-500">Kody kampanii</p>
              <p className="mt-2 text-3xl font-black tabular-nums">{campaignCount}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-4">
              <p className="text-xs font-semibold text-stone-500">Promocje bez kodu</p>
              <p className="mt-2 text-3xl font-black tabular-nums">{promotionCount}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {shopOffers.length > 0 && (
              <a href="#oferty" className="inline-flex min-h-12 items-center rounded-xl bg-stone-950 px-5 text-sm font-black text-white hover:bg-rose-700">
                Zobacz {offerCountLabel(shopOffers.length)} ↓
              </a>
            )}
            {slug === "shein" ? (
              <Link href="/promocje-shein"
                className="inline-flex min-h-12 items-center rounded-xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-800 hover:border-rose-400">
                Pełna wyszukiwarka kampanii SHEIN →
              </Link>
            ) : (
              <a href={store.websiteUrl} target="_blank" rel="nofollow noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-800 hover:border-rose-300">
                Oficjalna strona sklepu ↗
              </a>
            )}
          </div>
          <p className="mt-4 text-xs leading-6 text-stone-500">
            Liczba wpisów nie gwarantuje zniżki. Przed zakupem sprawdź cenę i warunki bezpośrednio u sprzedawcy.
          </p>
        </div>
      </header>

      {unavailable && (
        <p role="status" className="mx-auto max-w-6xl px-5 pt-6 text-sm text-amber-900">
          Nie wszystkie dane są obecnie dostępne. Spróbuj ponownie później.
        </p>
      )}
      {shopOffers.length > 0 ? (
        <CouponCatalog offers={shopOffers} />
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10">
            <span aria-hidden="true" className="text-3xl">⌕</span>
            <h2 className="mt-3 text-2xl font-black">Brak opublikowanych kodów dla {store.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Nie podajemy niezweryfikowanych kodów. Na tej stronie pojawią się oferty, gdy zostaną opublikowane w katalogu.
              W międzyczasie możesz sprawdzić inne sklepy.
            </p>
            <Link href="/kody-rabatowe"
              className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-stone-950 px-5 text-sm font-black text-white hover:bg-rose-700">
              Wróć do katalogu sklepów →
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="store-help-heading" className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Pomoc</p>
            <h2 id="store-help-heading" className="mt-2 text-2xl font-black">Jak korzystać z kodów {store.name}?</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Sprawdź oznaczenie przy każdej ofercie: kupon może działać w koszyku,
              a kod kampanii służy często do odnalezienia wybranych produktów.
              Nie każdy kod jest rabatem procentowym.
            </p>
          </div>
          <div>
            <h3 className="font-black">O czym warto pamiętać?</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Ceny, ograniczenia i daty ważności mogą się zmieniać. Nie testujemy kodów w koszyku na żywo.
              Część linków ma charakter afiliacyjny — Trendzamniej może otrzymać prowizję od zakupu.
            </p>
            <Link href="/kontakt" className="mt-4 inline-block text-sm font-bold text-rose-700 hover:underline">
              Zgłoś nieaktualną ofertę →
            </Link>
          </div>
        </div>
        {otherStores.length > 0 && (
          <div className="mt-9">
            <h2 className="text-xl font-black">Sprawdź także sklepy z ofertami</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {otherStores.map(item => (
                <Link key={item.slug} href={"/kody-rabatowe/" + item.slug}
                  className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-800 hover:border-rose-300">
                  {item.name} · {offerCountLabel(item.offerCount)} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </main>
  );
}
