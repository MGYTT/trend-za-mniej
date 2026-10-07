import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";

export default function SiteFooter() {
  const year =
    new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white text-stone-600">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLogo compact />

            <p className="mt-5 max-w-md text-sm leading-7 text-stone-500">
              Modne ubrania,
              dodatki i ciekawe
              znaleziska wybrane w
              jednym miejscu.
            </p>

            <div className="mt-5 max-w-xl rounded-2xl bg-rose-50/70 p-4 text-xs leading-6 text-stone-500">
              Część linków jest
              afiliacyjna. Możemy
              otrzymać prowizję od
              zakupu bez dodatkowych
              kosztów dla kupującego.
              Cena i dostępność mogą
              się zmieniać — przed
              zakupem sprawdź
              aktualne warunki w
              sklepie.
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-stone-900">
              Odkrywaj
            </p>

            <nav className="mt-4 grid gap-1">
              <FooterLink
                href="/okazje"
              >
                Wszystkie okazje
              </FooterLink>

              <FooterLink
                href="/#kategorie"
              >
                Kategorie
              </FooterLink>

              <FooterLink
                href="/#najnowsze"
              >
                Najnowsze
              </FooterLink>

              <FooterLink
                href="/#o-nas"
              >
                O Trend za Mniej
              </FooterLink>
            </nav>
          </div>

          <div>
            <p className="text-sm font-black text-stone-900">
              Informacje
            </p>

            <nav className="mt-4 grid gap-1">
              <FooterLink
                href="/afiliacja"
              >
                Informacja o
                afiliacji
              </FooterLink>

              <FooterLink
                href="/polityka-prywatnosci"
              >
                Polityka
                prywatności
              </FooterLink>

              <FooterLink
                href="/kontakt"
              >
                Kontakt
              </FooterLink>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-stone-100 pt-6 text-xs leading-5 text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Trend za
            Mniej
          </p>

          <p>
            Moda i okazje w jednym
            miejscu
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition hover:bg-rose-50 hover:text-rose-700"
    >
      {children}
    </Link>
  );
}