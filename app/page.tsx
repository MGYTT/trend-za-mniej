import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeLanding from "@/components/HomeLanding";
import WelcomeSheinOffer from "@/components/WelcomeSheinOffer";
import { getProducts, getFeaturedProducts, type Product } from "@/lib/products";
import { getAllResolvedLooks } from "@/lib/editorial-outfits";
import { getPublicWelcomeSheinOffer } from "@/lib/welcome-shein-public";

export const revalidate = 60;

function uniqueById(products: readonly Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

export default async function Home() {
  const [allProducts, featuredProducts, welcomeOffer] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
    getPublicWelcomeSheinOffer(),
  ]);
  // Lead with parts of complete looks, not an unrelated random product.
  const looks = (await getAllResolvedLooks(allProducts)).filter((look) => look.available);
  const selectedProducts = uniqueById([
    ...looks.flatMap((look) => look.products),
    ...featuredProducts,
    ...allProducts,
  ]).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <HomeLanding looks={looks} products={selectedProducts} />
      {welcomeOffer && <WelcomeSheinOffer settings={welcomeOffer} />}
      <SiteFooter />
    </main>
  );
}
