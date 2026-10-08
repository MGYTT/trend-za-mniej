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
    "Afiliacja – jak działają linki afiliacyjne",

  description:
    "Dowiedz się, jak działają linki afiliacyjne w Trend za Mniej, kiedy możemy otrzymać prowizję i kto odpowiada za zakup.",

  alternates: {
    canonical:
      "/afiliacja",
  },

  openGraph: {
    type:
      "website",

    locale:
      "pl_PL",

    url:
      "/afiliacja",

    siteName:
      SITE_NAME,

    title:
      "Jak działa afiliacja | Trend za Mniej",

    description:
      "Przejrzyste informacje o linkach afiliacyjnych, cenach i zakupach prezentowanych w Trend za Mniej.",
  },
};

export default function AffiliatePage() {
  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/afiliacja`;

  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "WebPage",

    "@id":
      `${pageUrl}#webpage`,

    url:
      pageUrl,

    name:
      "Informacja o afiliacji",

    description:
      "Informacje o zasadach działania linków afiliacyjnych w Trend za Mniej.",

    inLanguage:
      SITE_LANGUAGE,

    isPartOf: {
      "@id":
        `${siteUrl}/#website`,
    },
  };

  return (
    <InfoPageLayout
      eyebrow="Transparentność"
      title="Jak działa afiliacja?"
      lead="Chcemy jasno pokazywać, w jaki sposób Trend za Mniej może otrzymywać wynagrodzenie i co oznacza kliknięcie linku prowadzącego do zewnętrznego sklepu."
      activePath="/afiliacja"
      structuredData={
        structuredData
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <article>
          <InfoSection title="Czym jest link afiliacyjny?">
            <p>
              Link afiliacyjny to
              odnośnik prowadzący
              do zewnętrznego sklepu,
              który może zawierać
              informację pozwalającą
              sklepowi lub sieci
              afiliacyjnej rozpoznać,
              że użytkownik trafił
              do oferty z Trend za
              Mniej.
            </p>

            <p>
              Jeżeli po przejściu
              przez taki link zostanie
              dokonany kwalifikujący
              się zakup, możemy
              otrzymać prowizję.
            </p>
          </InfoSection>

          <InfoSection title="Czy zapłacisz więcej?">
            <p>
              Sam fakt skorzystania
              z linku afiliacyjnego
              nie oznacza doliczenia
              przez Trend za Mniej
              dodatkowej opłaty do
              ceny produktu.
            </p>

            <p>
              Ostateczna cena,
              dostępne rabaty,
              kupony, koszty dostawy
              i inne warunki zakupu
              są ustalane przez sklep
              i należy je sprawdzić
              przed złożeniem
              zamówienia.
            </p>
          </InfoSection>

          <InfoSection title="Jak oznaczamy linki?">
            <p>
              Przy przyciskach
              prowadzących do
              zewnętrznego sklepu
              stosujemy informację
              o reklamowym lub
              afiliacyjnym
              charakterze linku.
            </p>

            <p>
              Dzięki temu jeszcze
              przed opuszczeniem
              Trend za Mniej możesz
              rozpoznać, że odnośnik
              ma charakter
              komercyjny.
            </p>
          </InfoSection>

          <InfoSection title="Ceny i dostępność">
            <p>
              Ceny prezentowane
              w Trend za Mniej
              odpowiadają informacjom
              zapisanym w chwili
              publikacji lub
              aktualizacji produktu.
            </p>

            <p>
              Nie możemy zagwarantować,
              że ta sama cena,
              wariant, rozmiar,
              kolor albo promocja
              będą nadal dostępne
              w momencie przejścia
              do sklepu.
            </p>

            <p>
              Decydujące są zawsze
              aktualne informacje
              prezentowane przez
              sprzedawcę przed
              zakupem.
            </p>
          </InfoSection>

          <InfoSection title="Kto odpowiada za zakup?">
            <p>
              Trend za Mniej nie jest
              sprzedawcą prezentowanych
              produktów.
            </p>

            <p>
              Umowę sprzedaży
              zawierasz ze sklepem,
              do którego prowadzi
              oferta. Płatność,
              realizacja zamówienia,
              dostawa, zwroty,
              reklamacje i obsługa
              posprzedażowa odbywają
              się zgodnie z zasadami
              tego sklepu.
            </p>
          </InfoSection>

          <InfoSection title="Dlaczego korzystamy z afiliacji?">
            <p>
              Afiliacja może pomagać
              finansować utrzymanie
              i rozwój serwisu,
              jednocześnie pozwalając
              użytkownikom korzystać
              z Trend za Mniej bez
              konieczności zakładania
              płatnego konta.
            </p>

            <p>
              Zależy nam jednak,
              aby komercyjny charakter
              takich linków był
              komunikowany w sposób
              czytelny.
            </p>
          </InfoSection>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <InfoNotice
            title="W skrócie"
            tone="rose"
          >
            <div className="space-y-3">
              <p>
                Klikasz produkt
                w Trend za Mniej.
              </p>

              <p>
                ↓
              </p>

              <p>
                Przechodzisz do
                zewnętrznego sklepu.
              </p>

              <p>
                ↓
              </p>

              <p>
                Jeśli dokonasz
                kwalifikującego się
                zakupu, możemy
                otrzymać prowizję.
              </p>
            </div>
          </InfoNotice>

          <InfoNotice
            title="Przed zakupem"
            tone="amber"
          >
            <p>
              Sprawdź w sklepie
              aktualną cenę,
              rozmiar, dostępność,
              dostawę i warunki
              zwrotu.
            </p>
          </InfoNotice>

          <Link
            href="/okazje"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700"
          >
            Zobacz okazje
          </Link>
        </aside>
      </div>
    </InfoPageLayout>
  );
}