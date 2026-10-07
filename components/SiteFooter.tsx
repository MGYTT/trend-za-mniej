import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rose-100 bg-white text-stone-500">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <BrandLogo compact />

            <p className="mt-4 max-w-md text-sm leading-6">
              Modne ubrania, dodatki i okazje
              wybrane w jednym miejscu.
            </p>

            <p className="mt-3 max-w-xl text-xs leading-5 text-stone-400">
              Część linków na stronie to linki
              afiliacyjne. Możemy otrzymać prowizję
              od zakupu bez dodatkowych kosztów
              dla kupującego.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold sm:grid-cols-4 md:grid-cols-2">
            <Link
              href="/okazje"
              className="transition hover:text-rose-600"
            >
              Okazje
            </Link>

            <Link
              href="/afiliacja"
              className="transition hover:text-rose-600"
            >
              Afiliacja
            </Link>

            <Link
              href="/polityka-prywatnosci"
              className="transition hover:text-rose-600"
            >
              Prywatność
            </Link>

            <Link
              href="/kontakt"
              className="transition hover:text-rose-600"
            >
              Kontakt
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-100 pt-6 text-xs text-stone-400">
          © {year} Trend za Mniej. Wszelkie prawa
          zastrzeżone.
        </div>
      </div>
    </footer>
  );
}