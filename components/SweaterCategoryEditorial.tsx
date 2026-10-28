import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

/**
 * Original, product-backed guidance for the existing sweater category.
 * Counts and price limits are calculated from the same active catalog rows as the grid.
 * No scraped shop prices, reviews or unverified sale claims.
 */
export default function SweaterCategoryEditorial({
  products,
  hasCardigans,
  hasTrousers,
}: {
  products: readonly Product[];
  hasCardigans: boolean;
  hasTrousers: boolean;
}) {
  const prices = products
    .map((product) => product.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <section aria-labelledby="sweater-buying-guide" className="border-y border-rose-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">
              Praktyczny przewodnik zakupowy
            </p>
            <h2 id="sweater-buying-guide" className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
              Swetry damskie SHEIN: jak wybrać fason i sprawdzić cenę?
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-base">
              Gładki sweter dobrze sprawdza się jako baza codziennego zestawu.
              Luźniejszy krój daje więcej miejsca na warstwę pod spodem, ale przed zakupem
              warto porównać szerokość w ramionach i długość z ubraniem, które już masz.
              W przypadku dzianin zwróć uwagę także na skład, grubość i sposób prania.
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              W naszym katalogu znajduje się obecnie <strong>{products.length}</strong> ofert
              z kategorii swetrów SHEIN. To wybór produktów zapisanych w Trend za Mniej,
              a nie pełny asortyment sklepu. Niektóre modele mogą być oznaczone jako
              młodzieżowe — sprawdź grupę rozmiarową i tabelę wymiarów u sprzedawcy.
            </p>
          </div>
          <aside className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 sm:p-6">
            <h3 className="text-lg font-black text-stone-950">Ceny swetrów w katalogu</h3>
            {minPrice !== null && maxPrice !== null ? (
              <p className="mt-3 text-2xl font-black tracking-tight text-rose-700">
                {formatPrice(minPrice)} – {formatPrice(maxPrice)}
              </p>
            ) : (
              <p className="mt-3 font-bold text-stone-700">Sprawdź ceny na kartach produktów.</p>
            )}
            <p className="mt-3 text-xs leading-6 text-stone-600">
              Zakres cen pochodzi z widocznych produktów w bazie Trend za Mniej.
              Nie potwierdza aktualnych cen, wariantów ani dostępności w SHEIN.
              Przed zakupem sprawdź cenę końcową wraz z dostawą.
            </p>
            <Link
              href="/okazje?category=Swetry"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-rose-700 px-4 text-sm font-black text-white transition hover:bg-rose-800"
            >
              Filtruj swetry w katalogu →
            </Link>
          </aside>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-base font-black text-stone-950">Sweter dopasowany czy oversize?</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Dopasowany łatwiej włożyć pod marynarkę lub płaszcz. Przy swetrze oversize
              porównaj długość rękawów i szerokość na wysokości klatki piersiowej;
              sama literka rozmiaru nie opisuje faktycznego kroju.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-base font-black text-stone-950">Szukasz swetra rozpinanego?</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Modele rozpinane łatwiej założyć jako dodatkową warstwę.
              {hasCardigans ? (
                <> Zobacz także <Link href="/kategoria/kardigany" className="font-bold text-rose-700 underline-offset-2 hover:underline">kardigany damskie SHEIN</Link> — mają osobną kategorię.</>
              ) : (
                <> Sprawdź dostępne modele i zdjęcia produktów przed wyborem.</>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-base font-black text-stone-950">Z czym połączyć sweter?</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Beżowy lub jednokolorowy sweter można zestawić z ciemnym dołem.
              {hasTrousers && (
                <> Porównaj <Link href="/kategoria/spodnie" className="font-bold text-rose-700 underline-offset-2 hover:underline">spodnie z katalogu</Link>,</>
              )}
              {" "}a po pomysły na gotowe zestawy zajrzyj do <Link href="/stylizacje" className="font-bold text-rose-700 underline-offset-2 hover:underline">stylizacji w budżecie</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
