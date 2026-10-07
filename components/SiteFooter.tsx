import type {
  ReactNode,
} from "react";

import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";

const discoveryLinks = [
  {
    label:
      "Wszystkie okazje",
    href:
      "/okazje",
  },
  {
    label:
      "Kategorie",
    href:
      "/#kategorie",
  },
  {
    label:
      "Najnowsze",
    href:
      "/#najnowsze",
  },
  {
    label:
      "O Trend za Mniej",
    href:
      "/o-nas",
  },
];

const informationLinks = [
  {
    label:
      "Jak wybieramy okazje",
    href:
      "/o-nas",
  },
  {
    label:
      "Informacja o afiliacji",
    href:
      "/afiliacja",
  },
  {
    label:
      "Polityka prywatności",
    href:
      "/polityka-prywatnosci",
  },
  {
    label:
      "Kontakt",
    href:
      "/kontakt",
  },
];

export default function SiteFooter() {
  const year =
    new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white text-stone-600">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-9 lg:grid-cols-[1.45fr_0.8fr_0.9fr] lg:gap-12">
          <div>
            <BrandLogo
              compact
            />

            <p className="mt-4 max-w-md text-sm leading-7 text-stone-500">
              Wybrane ubrania,
              dodatki i ciekawe
              znaleziska zebrane
              w jednym miejscu,
              żeby łatwiej znaleźć
              coś interesującego
              bez przeglądania
              setek ofert.
            </p>

            <div className="mt-5 max-w-lg rounded-[18px] border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm text-rose-600 shadow-sm">
                  i
                </span>

                <p className="text-xs leading-6 text-stone-500">
                  Część linków ma
                  charakter
                  afiliacyjny.
                  Możemy otrzymać
                  prowizję po
                  zakupie bez
                  dodatkowych
                  kosztów dla
                  kupującego.
                  Ceny i dostępność
                  mogą się zmieniać.
                </p>
              </div>
            </div>
          </div>

          <FooterColumn
            title="Odkrywaj"
          >
            {discoveryLinks.map(
              (item) => (
                <FooterLink
                  key={
                    item.href +
                    item.label
                  }
                  href={
                    item.href
                  }
                >
                  {
                    item.label
                  }
                </FooterLink>
              )
            )}
          </FooterColumn>

          <FooterColumn
            title="Informacje"
          >
            {informationLinks.map(
              (item) => (
                <FooterLink
                  key={
                    item.href +
                    item.label
                  }
                  href={
                    item.href
                  }
                >
                  {
                    item.label
                  }
                </FooterLink>
              )
            )}
          </FooterColumn>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-stone-100 pt-6 text-xs leading-5 text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Trend za
            Mniej
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>
              Moda i okazje
            </span>

            <span>
              •
            </span>

            <span>
              Ceny sprawdzaj
              przed zakupem
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-black text-stone-900">
        {title}
      </p>

      <nav className="mt-3 grid gap-1">
        {children}
      </nav>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-10 w-fit items-center rounded-lg py-1 text-sm font-semibold text-stone-500 transition hover:text-rose-600"
    >
      {children}
    </Link>
  );
}