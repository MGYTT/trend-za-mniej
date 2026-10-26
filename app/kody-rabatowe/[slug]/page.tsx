import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CouponCatalog from "@/components/CouponCatalog";
import { getPublicShopDirectory } from "@/lib/stores";
import { isStoreSlug } from "@/lib/store-validation";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isStoreSlug(slug)) return { title: "Sklep nie istnieje" };
  const { stores } = await getPublicShopDirectory();
  const store = stores.find(s => s.slug === slug);
  if (!store) return { title: "Sklep nie istnieje" };
  return {
    title: store.name + " — kody i promocje | Trend za Mniej",
    description: "Zobacz aktualne kupony, kody kampanii i promocje w sklepie " + store.name,
    alternates: { canonical: "/kody-rabatowe/" + slug },
  };
}
export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  if (!isStoreSlug(slug)) notFound();
  const { stores, offers, unavailable } = await getPublicShopDirectory();
  const store = stores.find(s => s.slug === slug);
  if (!store) notFound();
  const shopOffers = offers.filter(o => o.storeSlug === slug);
  const coupons = shopOffers.filter(o => o.type === "coupon");
  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <div className="border-b border-rose-100 bg-gradient-to-br from-rose-50 to-white">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <nav aria-label="Okruszki" className="text-xs font-bold">
            <Link href="/kody-rabatowe" className="text-rose-700 hover:underline">Wszystkie sklepy</Link>
            <span className="mx-2">/</span>{store.name}
          </nav>
          <div className="mt-7 flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-rose-100 text-3xl font-black text-rose-700">{store.name[0]}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-700">{store.category}</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight">{store.name} — promocje</h1>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">{store.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4"><p className="text-xs text-stone-600">Kupony do koszyka</p><p className="mt-1 text-2xl font-black">{coupons.length}</p></div>
            <div className="rounded-2xl bg-white p-4"><p className="text-xs text-stone-600">Kampanie i promocje</p><p className="mt-1 text-2xl font-black">{shopOffers.length - coupons.length}</p></div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs text-stone-600">Wszystkie widoczne oferty</p>
              <p className="mt-1 text-2xl font-black">{shopOffers.length}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {slug === "shein" ? (
              <Link href="/promocje-shein" className="inline-flex min-h-12 items-center rounded-xl bg-stone-950 px-5 text-sm font-black text-white">Przeglądaj kampanie SHEIN →</Link>
            ) : (
              <a href={store.websiteUrl} target="_blank" rel="nofollow noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-xl bg-stone-950 px-5 text-sm font-black text-white">Otwórz oficjalny sklep ↗</a>
            )}
            <span className="text-xs text-stone-600">Warunki promocji sprawdź u sprzedawcy.</span>
          </div>
        </div>
      </div>
      {unavailable && <p className="mx-auto max-w-6xl px-5 pt-6 text-sm text-amber-900">Nie wszystkie oferty są teraz dostępne.</p>}
      {shopOffers.length > 0 ? <CouponCatalog offers={shopOffers} /> : (
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-xl font-black">Aktualne oferty</h2>
          <p className="mt-2 text-sm text-stone-600">Na razie nie mamy opublikowanych kodów dla tego sklepu.</p>
        </section>
      )}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-black">Jak korzystać?</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Zwróć uwagę, czy kod jest kuponem do koszyka, oznaczeniem kampanii czy promocją bez kodu.
            Przed zakupem sprawdź aktualne warunki u sprzedawcy. Nie testujemy kuponów na żywo.
            Część linków ma charakter afiliacyjny, więc możemy otrzymać prowizję od zakupu.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
