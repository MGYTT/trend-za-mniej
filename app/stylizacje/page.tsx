import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductPhoto from "@/components/ProductPhoto";
import { getProducts, formatPrice } from "@/lib/products";
import { resolveLooks } from "@/lib/stylizacje";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Gotowe stylizacje w Twoim budżecie",
  description: "Znajdź gotowe zestawy ubrań do 100, 150 i 200 zł. Sprawdź ceny poszczególnych produktów i wybierz zestaw dla siebie.",
  alternates: { canonical: "/stylizacje" },
};

export default async function LooksPage() {
  const looks = resolveLooks(await getProducts()).filter((look) => look.available);
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <section className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-widest text-rose-700">Trend za Mniej poleca</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Stylizacje dopasowane do budżetu</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">Nie szukaj każdego elementu osobno. Zobacz starannie dobrane zestawy i ich łączną cenę zapisaną w naszym katalogu.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {looks.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => (
              <Link key={look.slug} href={`/stylizacje/${look.slug}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-rose-600">
                <div className="grid aspect-[1.8] grid-cols-2 overflow-hidden bg-stone-100">
                  {look.products.slice(0, 2).map((product) => (
                    <div key={product.id} className="relative overflow-hidden">
                      <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 640px) 45vw, 25vw" />
                    </div>
                  ))}
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">{look.occasion} · {look.style}</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">{look.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{look.intro}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                    <span className="text-sm text-stone-600">{look.products.length} produkty</span>
                    <strong className="text-xl font-black">{formatPrice(look.total)}</strong>
                  </div>
                  <span className="mt-4 block rounded-xl bg-rose-600 px-4 py-3 text-center text-sm font-bold text-white group-hover:bg-rose-700">Zobacz zestaw →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-black">Przygotowujemy nowe stylizacje</h2>
            <p className="mt-3 text-stone-600">Dostępne zestawy pojawią się tutaj po aktualizacji katalogu.</p>
            <Link href="/okazje" className="mt-6 inline-block rounded-xl bg-rose-600 px-5 py-3 font-bold text-white">Zobacz produkty</Link>
          </div>
        )}
        <p className="mt-8 max-w-4xl text-sm leading-6 text-stone-600">Pokazane sumy obejmują wyłącznie wymienione produkty, bez dostawy i ewentualnych opłat. Ceny i dostępność mogą się zmienić w sklepie. Nie prowadzimy sprzedaży; linki do sklepów mogą być afiliacyjne.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
