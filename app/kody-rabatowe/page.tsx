import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StoreDirectory from "@/components/StoreDirectory";
import { getPublicShopDirectory } from "@/lib/stores";

export const metadata: Metadata = {
  title: "Sklepy i kody rabatowe | Trend za Mniej",
  description: "Wybierz sklep i zobacz dostępne kody i promocje sklepów.",
  alternates: { canonical: "/kody-rabatowe" },
};
export const dynamic = "force-dynamic";
export default async function CouponsPage() {
  const { stores, unavailable } = await getPublicShopDirectory();
  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <header className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Trend za Mniej · Sklepy i promocje</p>
          <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.5rem)] font-black tracking-tight">Znajdź sklep. Sprawdź kody. Oszczędzaj.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Wybierz sklep, sprawdź aktualne kody i poznaj warunki promocji.
            Dostępne oferty są prezentowane osobno dla każdego sprzedawcy.
          </p>
        </div>
      </header>
      <section aria-labelledby="extension-download-heading" className="mx-auto max-w-7xl px-5 pt-9">
        <div className="grid gap-5 rounded-3xl border border-rose-200 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-700">Wersja testowa · Chrome na komputerze</span>
            <h2 id="extension-download-heading" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Kody rabatowe także podczas zakupów</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
              Pobierz rozszerzenie Trendzamniej i sprawdzaj kody w wybranych sklepach.
              Wtyczka pokazuje promocje na stronie tylko po Twoim kliknięciu.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              ZIP wymaga ręcznej instalacji w trybie deweloperskim; to nie jest instalacja jednym kliknięciem z Chrome Web Store.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[260px]">
            <a href="/downloads/trendzamniej-chrome-0.5.0.zip" download="trendzamniej-chrome-0.5.0.zip"
              className="flex min-h-13 items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-rose-700">
              Pobierz wtyczkę Chrome (ZIP) ↓
            </a>
            <Link href="/wtyczka-chrome"
              className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 px-5 text-center text-sm font-black text-stone-800 hover:border-rose-300">
              Instrukcja instalacji i uprawnienia →
            </Link>
          </div>
        </div>
      </section>
      <StoreDirectory stores={stores} unavailable={unavailable} />
      <SiteFooter />
    </main>
  );
}
