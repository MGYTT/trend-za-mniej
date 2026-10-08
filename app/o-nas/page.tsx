import type {
  Metadata,
} from "next";

import Link from "next/link";

import InfoPageLayout, {
  InfoNotice,
  InfoSection,
} from "@/components/InfoPageLayout";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title:
    "O nas – poznaj Trend za Mniej",

  description:
    "Dowiedz się, czym jest Trend za Mniej, jak wybieramy produkty, prezentujemy ceny i pomagamy szybciej znaleźć ciekawe okazje.",

  alternates: {
    canonical:
      "/o-nas",
  },

  openGraph: {
    type:
      "website",

    locale:
      "pl_PL",

    url:
      "/o-nas",

    siteName:
      SITE_NAME,

    title:
      "O nas – Trend za Mniej",

    description:
      "Poznaj Trend za Mniej i zasady, według których wybieramy oraz prezentujemy produkty.",
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
      "Informacje o serwisie Trend za Mniej, wyborze produktów, cenach i zasadach działania.",

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
    <InfoPageLayout
      eyebrow="Poznaj nas"
      title="Mniej szukania. Więcej ciekawych znalezisk."
      lead="Trend za Mniej pomaga szybciej przeglądać wybrane ubrania, dodatki i inne ciekawe produkty bez konieczności przekopywania się przez ogromne katalogi sklepów."
      activePath="/o-nas"
      structuredData={
        structuredData
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <article>
          <InfoSection title="Czym jest Trend za Mniej?">
            <p>
              Trend za Mniej jest
              serwisem
              informacyjno-afiliacyjnym,
              który zbiera wybrane
              produkty w jednym
              miejscu.
            </p>

            <p>
              Naszym celem nie jest
              kopiowanie całego
              katalogu sklepu.
              Chcemy pokazywać
              mniejszą, bardziej
              uporządkowaną liczbę
              produktów, które można
              szybko przejrzeć,
              porównać i sprawdzić
              bezpośrednio w sklepie.
            </p>
          </InfoSection>

          <InfoSection title="Jak wybieramy produkty?">
            <p>
              Produkty dodajemy
              ręcznie. Przy wyborze
              zwracamy uwagę między
              innymi na wygląd,
              praktyczność, kategorię,
              cenę i to, czy dana
              propozycja może być
              interesująca dla osób
              szukających rzeczy
              w rozsądnym budżecie.
            </p>

            <p>
              Nie publikujemy
              automatycznie całego
              katalogu SHEIN ani nie
              pobieramy automatycznie
              ofert ze stron sklepu.
            </p>
          </InfoSection>

          <InfoSection title="Jak prezentujemy ceny?">
            <p>
              Cena widoczna przy
              produkcie jest ceną
              zapisaną w chwili
              publikacji lub
              aktualizacji danej
              oferty.
            </p>

            <p>
              Ceny, dostępność,
              warianty, kupony
              i promocje w sklepie
              mogą zmieniać się
              w czasie. Dlatego
              aktualne warunki należy
              zawsze sprawdzić
              bezpośrednio w sklepie
              przed zakupem.
            </p>

            <p>
              Nie chcemy tworzyć
              sztucznych promocji.
              Informacje o poprzedniej
              cenie lub obniżce
              powinny być pokazywane
              tylko wtedy, gdy mamy
              podstawę do ich
              wiarygodnego
              przedstawienia.
            </p>
          </InfoSection>

          <InfoSection title="Transparentność afiliacji">
            <p>
              Część linków
              prowadzących do sklepów
              ma charakter
              afiliacyjny. Oznacza to,
              że możemy otrzymać
              prowizję, jeśli
              użytkownik przejdzie
              przez taki link
              i dokona zakupu.
            </p>

            <p>
              Informujemy o tym
              wprost, ponieważ
              użytkownik powinien
              wiedzieć, kiedy korzysta
              z linku o charakterze
              komercyjnym.
            </p>

            <Link
              href="/afiliacja"
              className="inline-flex font-black text-rose-600 transition hover:text-rose-700"
            >
              Dowiedz się więcej
              o afiliacji →
            </Link>
          </InfoSection>

          <InfoSection title="Trend za Mniej nie jest sklepem">
            <p>
              Nie sprzedajemy
              prezentowanych
              produktów, nie
              przyjmujemy płatności
              i nie realizujemy
              zamówień.
            </p>

            <p>
              Po przejściu do oferty
              zakupu dokonujesz
              bezpośrednio
              w zewnętrznym sklepie.
              To sklep odpowiada
              za płatność, realizację
              zamówienia, dostawę,
              zwroty i reklamacje.
            </p>
          </InfoSection>

          <InfoSection title="Pomóż nam utrzymywać aktualne informacje">
            <p>
              Oferty internetowe
              zmieniają się szybko.
              Jeżeli zauważysz
              niedziałający link,
              nieaktualną informację
              albo inny problem,
              możesz nam go zgłosić.
            </p>

            <Link
              href="/kontakt"
              className="inline-flex font-black text-rose-600 transition hover:text-rose-700"
            >
              Przejdź do kontaktu →
            </Link>
          </InfoSection>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <InfoNotice
            title="Najważniejsze zasady"
            tone="rose"
          >
            <div className="space-y-3">
              <p>
                ✓ Produkty wybieramy
                ręcznie.
              </p>

              <p>
                ✓ Pokazujemy cenę
                zapisaną przy
                publikacji lub
                aktualizacji.
              </p>

              <p>
                ✓ Jasno informujemy
                o linkach
                afiliacyjnych.
              </p>

              <p>
                ✓ Zakup odbywa się
                bezpośrednio
                w sklepie.
              </p>
            </div>
          </InfoNotice>

          <InfoNotice title="Chcesz przejrzeć produkty?">
            <p>
              Przejdź do katalogu
              i skorzystaj
              z wyszukiwarki,
              kategorii oraz filtrów.
            </p>

            <Link
              href="/okazje"
              className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-5 font-black text-white transition hover:bg-rose-700"
            >
              Zobacz okazje
            </Link>
          </InfoNotice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}