import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OutfitExplorer from "@/components/OutfitExplorer";
import { getProducts } from "@/lib/products";
import { resolveLooks } from "@/lib/stylizacje";
import type { OutfitPreview } from "@/lib/outfit-filters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gotowe stylizacje do 100, 150 i 200 zł",
  description:
    "Gotowe zestawy ubrań z sumą cen. Wybierz budżet i okazję, sprawdź elementy stylizacji oraz przejdź do ofert w sklepie.",
  alternates: { canonical: "/stylizacje" },
};

export default async function LooksPage() {
  const looks = resolveLooks(await getProducts()).filter((look) => look.available);
  const previews: OutfitPreview[] = looks.map((look) => ({
    slug: look.slug,
    title: look.title,
    occasion: look.occasion,
    style: look.style,
    intro: look.intro,
    total: look.total,
    maxBudget: look.maxBudget,
    productCount: look.products.length,
    photos: look.products.slice(0, 2).map((product) => ({
      id: product.id,
      image: product.image,
      alt: product.name,
    })),
  }));

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-widest text-rose-700">
            Moda dopasowana do portfela
          </p>
          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-black tracking-tight sm:text-6xl">
            Gotowe stylizacje. <span className="text-rose-600">Bez przekraczania budżetu.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            Zamiast przeglądać setki ubrań, wybierz okazję i kwotę. Zobacz
            przygotowane zestawy, ich elementy i sumę cen zapisanych w naszym katalogu.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#wybierz-stylizacje" className="inline-flex min-h-12 items-center rounded-xl bg-rose-600 px-6 text-sm font-extrabold text-white hover:bg-rose-700">
              Wybierz stylizację ↓
            </a>
            <Link href="/okazje" className="inline-flex min-h-12 items-center rounded-xl border border-stone-200 px-6 text-sm font-bold text-stone-700 hover:bg-stone-50">
              Przeglądaj produkty
            </Link>
          </div>
        </div>
      </section>

      <section id="wybierz-stylizacje" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14" aria-label="Wybierz stylizację">
        {previews.length > 0 ? (
          <OutfitExplorer looks={previews} />
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-black">Przygotowujemy nowe stylizacje</h2>
            <p className="mt-3 text-stone-600">Zestawy będą dostępne po aktualizacji ofert w katalogu.</p>
            <Link href="/okazje" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rose-600 px-5 font-bold text-white">
              Zobacz produkty
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="how-it-works" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 id="how-it-works" className="text-2xl font-black tracking-tight sm:text-3xl">
            Jak korzystać z gotowych stylizacji?
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-2xl bg-stone-50 p-5">
              <span className="text-sm font-black text-rose-700">01 / Wybierz</span>
              <h3 className="mt-2 font-black">Budżet i okazję</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Wskaż kwotę, którą chcesz przeznaczyć na produkty.</p>
            </li>
            <li className="rounded-2xl bg-stone-50 p-5">
              <span className="text-sm font-black text-rose-700">02 / Porównaj</span>
              <h3 className="mt-2 font-black">Zestawy i ceny</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Sprawdź elementy, koszt łączny i podpowiedzi przed zakupem.</p>
            </li>
            <li className="rounded-2xl bg-stone-50 p-5">
              <span className="text-sm font-black text-rose-700">03 / Sprawdź</span>
              <h3 className="mt-2 font-black">Ofertę w sklepie</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Każdy element kupujesz osobno u sprzedawcy, po potwierdzeniu ceny i rozmiaru.</p>
            </li>
          </ol>
          <p className="mt-7 max-w-4xl text-sm leading-6 text-stone-600">
            Podane sumy obejmują wyłącznie wskazane produkty, bez kosztów dostawy i ewentualnych opłat.
            Ceny oraz dostępność mogą zmieniać się w SHEIN. Trend za Mniej nie jest sklepem;
            linki prowadzące do partnera mogą być afiliacyjne.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
