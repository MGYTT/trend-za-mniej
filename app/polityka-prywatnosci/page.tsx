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
    "Polityka prywatności – Trend za Mniej",

  description:
    "Polityka prywatności Trend za Mniej: informacje o danych technicznych, statystykach kliknięć, dostawcach infrastruktury i prawach użytkowników.",

  alternates: {
    canonical:
      "/polityka-prywatnosci",
  },

  openGraph: {
    type:
      "website",

    locale:
      "pl_PL",

    url:
      "/polityka-prywatnosci",

    siteName:
      SITE_NAME,

    title:
      "Polityka prywatności | Trend za Mniej",

    description:
      "Dowiedz się, jakie informacje mogą być przetwarzane podczas korzystania z Trend za Mniej.",
  },
};

export default function PrivacyPage() {
  const contactEmail =
    process.env
      .NEXT_PUBLIC_CONTACT_EMAIL
      ?.trim();

  const legalName =
    process.env
      .NEXT_PUBLIC_LEGAL_NAME
      ?.trim();

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/polityka-prywatnosci`;

  const operatorName =
    legalName ||
    "operator serwisu Trend za Mniej";

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
      "Polityka prywatności",

    description:
      "Informacje dotyczące prywatności i przetwarzania danych w serwisie Trend za Mniej.",

    inLanguage:
      SITE_LANGUAGE,

    isPartOf: {
      "@id":
        `${siteUrl}/#website`,
    },
  };

  return (
    <InfoPageLayout
      eyebrow="Prywatność"
      title="Polityka prywatności"
      lead="Poniżej wyjaśniamy, jakie informacje mogą być przetwarzane podczas korzystania z Trend za Mniej, w jakim celu są wykorzystywane i jakie prawa przysługują użytkownikowi."
      activePath="/polityka-prywatnosci"
      structuredData={
        structuredData
      }
    >
      <div className="mb-8 flex flex-col gap-2 rounded-[20px] border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Ostatnia aktualizacja
        </span>

        <strong className="text-stone-900">
          8 października 2026 r.
        </strong>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <article>
          <InfoSection title="1. Administrator i kontakt">
            <p>
              Za funkcjonowanie
              serwisu oraz
              przetwarzanie danych
              związanych z jego
              działaniem odpowiada{" "}
              <strong className="font-bold text-stone-800">
                {operatorName}
              </strong>
              .
            </p>

            {contactEmail ? (
              <p>
                W sprawach dotyczących
                prywatności można
                skontaktować się pod
                adresem{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-bold text-rose-600 hover:text-rose-700"
                >
                  {contactEmail}
                </a>
                .
              </p>
            ) : (
              <p>
                W sprawach dotyczących
                prywatności można
                skorzystać ze strony{" "}
                <Link
                  href="/kontakt"
                  className="font-bold text-rose-600 hover:text-rose-700"
                >
                  Kontakt
                </Link>
                .
              </p>
            )}
          </InfoSection>

          <InfoSection title="2. Korzystanie z publicznej części serwisu">
            <p>
              Przeglądanie publicznej
              części Trend za Mniej
              nie wymaga zakładania
              konta ani logowania.
            </p>

            <p>
              Serwis może przetwarzać
              podstawowe dane
              techniczne niezbędne
              do prawidłowego
              i bezpiecznego
              dostarczenia strony,
              takie jak informacje
              związane z żądaniem
              sieciowym, urządzeniem,
              przeglądarką lub
              zdarzeniami
              technicznymi.
            </p>

            <p>
              Część takich informacji
              może być przetwarzana
              również przez
              dostawców infrastruktury
              wykorzystywanej do
              działania serwisu.
            </p>
          </InfoSection>

          <InfoSection title="3. Statystyki kliknięć w oferty">
            <p>
              Gdy użytkownik wybiera
              link prowadzący do
              zewnętrznej oferty,
              Trend za Mniej zapisuje
              identyfikator klikniętego
              produktu. Baza danych
              może również zapisywać
              czas utworzenia takiego
              zdarzenia.
            </p>

            <p>
              Informacje te służą
              do tworzenia
              podstawowych statystyk
              popularności produktów
              oraz oceny działania
              serwisu.
            </p>

            <p>
              Mechanizm Trend za Mniej
              nie zapisuje przy takim
              zdarzeniu imienia,
              nazwiska ani adresu
              e-mail użytkownika.
            </p>
          </InfoSection>

          <InfoSection title="4. Kontakt z nami">
            <p>
              Jeżeli użytkownik
              kontaktuje się z nami
              pocztą elektroniczną,
              możemy przetwarzać dane
              przekazane w wiadomości,
              w szczególności adres
              e-mail oraz treść
              korespondencji.
            </p>

            <p>
              Dane te są wykorzystywane
              w celu udzielenia
              odpowiedzi, rozwiązania
              zgłoszonego problemu
              lub prowadzenia
              korespondencji związanej
              z serwisem.
            </p>
          </InfoSection>

          <InfoSection title="5. Cele i podstawy przetwarzania">
            <p>
              Dane mogą być
              przetwarzane w zakresie
              niezbędnym do
              zapewnienia działania
              serwisu, jego
              bezpieczeństwa,
              obsługi zgłoszeń
              oraz prowadzenia
              podstawowych statystyk.
            </p>

            <p>
              Jeżeli informacje
              stanowią dane osobowe,
              podstawą przetwarzania
              może być uzasadniony
              interes związany
              z prowadzeniem,
              bezpieczeństwem
              i ulepszaniem serwisu
              oraz obsługą
              korespondencji,
              zgodnie z art. 6 ust. 1
              lit. f RODO.
            </p>

            <p>
              W zależności od
              charakteru konkretnej
              sprawy podstawą może być
              również podjęcie działań
              na żądanie osoby,
              której dane dotyczą.
            </p>
          </InfoSection>

          <InfoSection title="6. Dostawcy infrastruktury">
            <p>
              Trend za Mniej korzysta
              między innymi z usług
              Vercel do hostingu
              aplikacji oraz Supabase
              do obsługi bazy danych,
              przechowywania danych
              i mechanizmów
              administracyjnych.
            </p>

            <p>
              Dostawcy ci mogą
              przetwarzać dane
              techniczne w zakresie
              niezbędnym do
              świadczenia swoich
              usług, zgodnie
              z własnymi zasadami
              bezpieczeństwa,
              prywatności oraz
              obowiązującymi
              przepisami.
            </p>
          </InfoSection>

          <InfoSection title="7. Linki afiliacyjne i strony zewnętrzne">
            <p>
              Po kliknięciu linku
              prowadzącego do
              zewnętrznego sklepu
              użytkownik opuszcza
              Trend za Mniej.
            </p>

            <p>
              Od tego momentu
              przetwarzanie danych,
              wykorzystanie cookies,
              prowadzenie konta,
              płatność i realizacja
              zamówienia podlegają
              zasadom obowiązującym
              w zewnętrznym serwisie.
            </p>

            <Link
              href="/afiliacja"
              className="inline-flex font-black text-rose-600 hover:text-rose-700"
            >
              Więcej o afiliacji →
            </Link>
          </InfoSection>

          <InfoSection title="8. Cookies i profilowanie">
            <p>
              Publiczna część Trend
              za Mniej nie wymaga
              konta użytkownika
              i nie wykorzystuje
              własnego mechanizmu
              profilowania reklamowego
              użytkowników.
            </p>

            <p>
              Funkcje administracyjne
              serwisu mogą korzystać
              z technicznych
              mechanizmów
              uwierzytelniania
              wymaganych do
              zabezpieczenia panelu
              administratora.
            </p>

            <p>
              Jeżeli w przyszłości
              zostaną wdrożone
              dodatkowe narzędzia
              analityczne lub
              marketingowe wymagające
              zmian w zasadach
              prywatności, dokument
              zostanie odpowiednio
              zaktualizowany.
            </p>
          </InfoSection>

          <InfoSection title="9. Okres przechowywania">
            <p>
              Dane są przechowywane
              przez okres potrzebny
              do realizacji celu,
              dla którego zostały
              zebrane, a następnie
              usuwane lub
              anonimizowane, chyba że
              dalsze przechowywanie
              wynika z obowiązku
              prawnego, potrzeby
              bezpieczeństwa albo
              ochrony przed
              roszczeniami.
            </p>

            <p>
              Podstawowe statystyki
              ofert mogą być
              przechowywane tak długo,
              jak pozostają potrzebne
              do analizy działania
              serwisu.
            </p>
          </InfoSection>

          <InfoSection title="10. Prawa użytkownika">
            <p>
              Jeżeli przetwarzamy dane
              osobowe dotyczące
              konkretnej osoby,
              może ona — w przypadkach
              przewidzianych przez
              prawo — żądać dostępu
              do danych, ich
              sprostowania, usunięcia,
              ograniczenia
              przetwarzania lub
              wnieść sprzeciw.
            </p>

            <p>
              Osobie, której dane
              dotyczą, przysługuje
              również prawo wniesienia
              skargi do właściwego
              organu nadzorczego,
              w Polsce do Prezesa
              Urzędu Ochrony Danych
              Osobowych.
            </p>

            <p>
              W przypadku danych,
              które nie pozwalają nam
              na identyfikację
              konkretnego użytkownika,
              możemy nie mieć
              technicznej możliwości
              przypisania konkretnego
              zapisu do danej osoby.
            </p>
          </InfoSection>

          <InfoSection title="11. Zmiany polityki prywatności">
            <p>
              Polityka może być
              aktualizowana wraz
              z rozwojem Trend za
              Mniej, zmianą
              wykorzystywanych usług
              lub zmianą sposobu
              przetwarzania danych.
            </p>

            <p>
              Aktualna wersja
              dokumentu jest zawsze
              publikowana pod tym
              adresem.
            </p>
          </InfoSection>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <InfoNotice
            title="Najważniejsze informacje"
            tone="rose"
          >
            <div className="space-y-3">
              <p>
                Publiczna część strony
                nie wymaga konta.
              </p>

              <p>
                Zapisujemy podstawowe
                statystyki kliknięć
                produktów.
              </p>

              <p>
                Korzystamy z Vercel
                i Supabase jako
                dostawców
                infrastruktury.
              </p>

              <p>
                Po przejściu do
                sklepu obowiązuje jego
                polityka prywatności.
              </p>
            </div>
          </InfoNotice>

          <InfoNotice title="Masz pytanie dotyczące danych?">
            <Link
              href="/kontakt"
              className="inline-flex font-black text-rose-600 hover:text-rose-700"
            >
              Skontaktuj się z nami →
            </Link>
          </InfoNotice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}