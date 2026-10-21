import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { getProducts, formatPrice } from "@/lib/products";
import { LOOKS, resolveLooks } from "@/lib/stylizacje";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return LOOKS.map((look) => ({ slug: look.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const look = LOOKS.find((item) => item.slug === slug);
  if (!look) return { title: "Nie znaleziono stylizacji", robots: { index: false } };
  return {
    title: look.title,
    description: `${look.intro} Odkryj produkty i cenę całego zestawu w Trend za Mniej.`,
    alternates: { canonical: `/stylizacje/${look.slug}` },
  };
}

export default async function LookPage({ params }: Props) {
  const { slug } = await params;
  const look = resolveLooks(await getProducts()).find((item) => item.slug === slug);
  if (!look || !look.available) notFound();
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <nav className="mb-8 text-sm text-stone-600"><Link href="/stylizacje" className="font-bold text-rose-700 hover:underline">← Wszystkie stylizacje</Link></nav>
        <header className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-rose-700">{look.occasion} · {look.style}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{look.title}</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">{look.intro}</p>
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4">
            <p className="text-sm font-medium text-rose-800">Łączna cena {look.products.length} produktów w katalogu</p>
            <p className="mt-1 text-3xl font-black text-rose-900">{formatPrice(look.total)}</p>
          </div>
        </header>
        <h2 className="mb-5 mt-12 text-2xl font-black">Elementy stylizacji</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {look.products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        <aside className="mt-12 max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black">Wskazówka przed zakupem</h2>
          <p className="mt-3 leading-7 text-stone-700">{look.tip}</p>
          <p className="mt-4 text-sm leading-6 text-stone-500">Suma obejmuje tylko pokazane produkty, bez kosztów dostawy. Ceny zapisano przy publikacji ofert — rzeczywiste ceny, rozmiary i dostępność sprawdź w sklepie przed zakupem. Linki do sklepów mogą być afiliacyjne; nie prowadzimy sprzedaży.</p>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}
