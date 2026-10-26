import type { Metadata } from "next";
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
      <StoreDirectory stores={stores} unavailable={unavailable} />
      <SiteFooter />
    </main>
  );
}
