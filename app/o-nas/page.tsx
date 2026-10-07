import type {
  Metadata,
} from "next";

import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title:
    "O nas – jak wybieramy okazje",

  description:
    "Dowiedz się, czym jest Trend za Mniej, jak wybieramy produkty, aktualizujemy ceny i oznaczamy linki afiliacyjne.",

  alternates: {
    canonical:
      "/o-nas",
  },

  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/o-nas",
    siteName:
      SITE_NAME,

    title:
      "O Trend za Mniej – jak wybieramy okazje",

    description:
      "Poznaj zasady wyboru produktów, aktualizacji cen oraz działania linków afiliacyjnych w Trend za Mniej.",
  },
};

export default function AboutPage() {
  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/o-nas`;

  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "AboutPage",

    "@id":
      `${pageUrl}#webpage`,

    url:
      pageUrl,

    name:
      "O Trend za Mniej",

    description:
      "Informacje o Trend za Mniej, sposobie wyboru produktów, cenach i afiliacji.",

    inLanguage:
      SITE_LANGUAGE,

    isPartOf: {
      "@id":
        `${siteUrl}/#website`,
    },

    about: {
      "@id":
        `${siteUrl}/#organization`,
    },
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <SiteHeader />

      <section className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-600">
            O Trend za Mniej
          </p>

          <h1 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Pomagamy szybciej znaleźć
            ciekawe modowe okazje
          </h1>

          <p className="mt-5 max-w-3xl text-pretty text-base leading-8 text-stone-600 sm:text-lg">
            Trend za Mniej to serwis
            zbierający wybrane ubrania,
            dodatki i inne ciekawe
            produkty w jednym miejscu.
            Celem jest ograniczenie
            czasu potrzebnego na
            przeglądanie dużej liczby
            ofert.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="space-y-12">
          <ContentSection
            number="01"
            title="Jak wybieramy produkty?"
          >
            <p>
              Produkty prezentowane w
              Trend za Mniej są wybierane
              i dodawane ręcznie. Nie
              publikujemy automatycznie
              całego katalogu sklepu.
            </p>

            <p>
              Przy wyborze zwracamy
              uwagę między innymi na
              wygląd produktu,
              praktyczność, cenę oraz to,
              czy dana oferta może być
              interesująca dla osób
              szukających modnych rzeczy
              w rozsądnym budżecie.
            </p>
          </ContentSection>

          <ContentSection
            number="02"
            title="Jak traktujemy ceny?"
          >
            <p>
              Cena prezentowana przy
              produkcie jest ceną
              zaobserwowaną w chwili
              publikacji lub aktualizacji
              oferty.
            </p>

            <p>
              Sklepy internetowe mogą
              zmieniać ceny, dostępność,
              kupony i warunki promocji.
              Dlatego przed zakupem
              zawsze warto sprawdzić
              aktualną cenę bezpośrednio
              na stronie sklepu.
            </p>

            <p>
              Nie pokazujemy starej ceny
              ani informacji o obniżce,
              jeśli nie mamy podstaw do
              ich wiarygodnego
              potwierdzenia.
            </p>
          </ContentSection>

          <ContentSection
            number="03"
            title="Linki afiliacyjne"
          >
            <p>
              Część odnośników
              prowadzących do sklepów ma
              charakter afiliacyjny.
              Oznacza to, że możemy
              otrzymać prowizję, jeśli
              użytkownik dokona zakupu
              po przejściu przez taki
              link.
            </p>

            <p>
              Korzystanie z linku
              afiliacyjnego nie powinno
              powodować dodatkowych
              kosztów dla kupującego.
              Informację o afiliacji
              pokazujemy również przy
              ofertach oraz na osobnej
              stronie informacyjnej.
            </p>

            <Link
              href="/afiliacja"
              className="mt-2 inline-flex font-black text-rose-600 hover:text-rose-700"
            >
              Zobacz zasady afiliacji →
            </Link>
          </ContentSection>

          <ContentSection
            number="04"
            title="Nie jesteśmy sprzedawcą"
          >
            <p>
              Trend za Mniej nie prowadzi
              sprzedaży prezentowanych
              produktów i nie obsługuje
              płatności ani zamówień.
            </p>

            <p>
              Zakup, płatność, dostawa,
              zwroty i reklamacje
              odbywają się bezpośrednio
              w sklepie, do którego
              prowadzi dana oferta.
            </p>
          </ContentSection>

          <ContentSection
            number="05"
            title="Aktualność i poprawki"
          >
            <p>
              Oferta internetowa zmienia
              się szybko. Jeśli
              zauważysz nieaktualną cenę,
              niedziałający link albo
              inną nieścisłość, możesz
              nas o tym poinformować.
            </p>

            <Link
              href="/kontakt"
              className="mt-2 inline-flex font-black text-rose-600 hover:text-rose-700"
            >
              Przejdź do kontaktu →
            </Link>
          </ContentSection>
        </div>

        <div className="mt-14 rounded-[30px] border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 sm:p-8">
          <h2 className="text-2xl font-black">
            Zacznij przeglądać okazje
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            Zobacz najnowsze produkty,
            przejdź do wybranej kategorii
            albo skorzystaj z filtrów.
          </p>

          <Link
            href="/okazje"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 font-black text-white shadow-sm"
          >
            Zobacz wszystkie okazje →
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

function ContentSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-[60px_minmax(0,1fr)]">
      <div className="text-sm font-black text-rose-500">
        {number}
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h2>

        <div className="mt-4 space-y-4 text-base leading-8 text-stone-600">
          {children}
        </div>
      </div>
    </section>
  );
}