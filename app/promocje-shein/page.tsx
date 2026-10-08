import type {
  Metadata,
} from "next";

import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import {
  SHEIN_PROMOTIONS,
  SHEIN_PROMOTIONS_UPDATED_AT,
  type SheinPromotion,
} from "@/lib/shein-promotions";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Promocje SHEIN i kody rabatowe – aktualne oferty",

  description:
    "Sprawdź promocje SHEIN, kody rabatowe, kupony dla nowych użytkowników, wybrane produkty i bestsellery. Zobacz aktualne kampanie zebrane przez Trend za Mniej.",

  alternates: {
    canonical:
      "/promocje-shein",
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  openGraph: {
    type:
      "website",

    locale:
      "pl_PL",

    url:
      "/promocje-shein",

    siteName:
      SITE_NAME,

    title:
      "Promocje SHEIN i kody rabatowe",

    description:
      "Aktualne promocje SHEIN, kupony dla nowych użytkowników, kody kampanii, bestsellery i wybrane okazje w jednym miejscu.",

    images: [
      {
        url:
          "/opengraph-image",

        width:
          1200,

        height:
          630,

        alt:
          "Promocje SHEIN i kody rabatowe - Trend za Mniej",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Promocje SHEIN i kody rabatowe",

    description:
      "Sprawdź aktualne promocje, kupony i kampanie SHEIN zebrane przez Trend za Mniej.",

    images: [
      "/opengraph-image",
    ],
  },
};

const FAQ = [
  {
    question:
      "Czy na Trend za Mniej znajdę aktualne kody rabatowe SHEIN?",

    answer:
      "Publikujemy wybrane kampanie, kody do wyszukania w aplikacji oraz informacje o kuponach, które otrzymujemy w aktualnych materiałach kampanii afiliacyjnych. Warunki promocji mogą się zmieniać, dlatego przed zakupem zawsze warto potwierdzić je bezpośrednio w SHEIN.",
  },

  {
    question:
      "Jak skorzystać z kodu SHEIN?",

    answer:
      "Przy każdej promocji pokazujemy kod podany w materiale kampanii. Możesz wyszukać go w aplikacji SHEIN albo skorzystać z przycisku prowadzącego bezpośrednio do odpowiedniej kampanii.",
  },

  {
    question:
      "Czy każdy kod SHEIN jest kodem rabatowym?",

    answer:
      "Nie. Niektóre oznaczenia służą do wyszukania konkretnej kampanii lub kolekcji w aplikacji, a inne mogą dotyczyć kuponu rabatowego. Dlatego przy każdej promocji opisujemy jej charakter zamiast nazywać każdy kod kuponem.",
  },

  {
    question:
      "Czy kupon 60% SHEIN działa dla każdego?",

    answer:
      "W kampaniach widocznych obecnie w naszym zestawieniu kupon 60% jest opisywany jako oferta dla nowych użytkowników. Ostateczna kwalifikacja, zakres rabatu i warunki wykorzystania są ustalane przez SHEIN.",
  },

  {
    question:
      "Czy Trend za Mniej jest sklepem SHEIN?",

    answer:
      "Nie. Trend za Mniej jest niezależnym serwisem informacyjno-afiliacyjnym. Nie sprzedajemy produktów i nie realizujemy zamówień. Po kliknięciu promocji przechodzisz do SHEIN, gdzie możesz sprawdzić aktualne warunki i dokonać zakupu.",
  },

  {
    question:
      "Czy linki do promocji są afiliacyjne?",

    answer:
      "Tak. Część linków prowadzących do SHEIN ma charakter afiliacyjny. Jeśli po przejściu przez taki link dokonasz kwalifikującego się zakupu, Trend za Mniej może otrzymać prowizję bez doliczania przez nas dodatkowej opłaty do ceny produktu.",
  },
] as const;

export default function SheinPromotionsPage() {
  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/promocje-shein`;

  const updatedAt =
    new Date(
      SHEIN_PROMOTIONS_UPDATED_AT
    );

  const updatedAtLabel =
    new Intl.DateTimeFormat(
      "pl-PL",
      {
        day:
          "numeric",

        month:
          "long",

        year:
          "numeric",
      }
    ).format(
      updatedAt
    );

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${pageUrl}#webpage`,

        url:
          pageUrl,

        name:
          "Promocje SHEIN i kody rabatowe",

        description:
          "Aktualne promocje SHEIN, kody, kupony dla nowych użytkowników, bestsellery i wybrane kampanie.",

        inLanguage:
          SITE_LANGUAGE,

        dateModified:
          SHEIN_PROMOTIONS_UPDATED_AT,

        isPartOf: {
          "@id":
            `${siteUrl}/#website`,
        },

        breadcrumb: {
          "@id":
            `${pageUrl}#breadcrumb`,
        },

        mainEntity: {
          "@id":
            `${pageUrl}#promotions`,
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${pageUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Trend za Mniej",

            item:
              siteUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              2,

            name:
              "Promocje SHEIN",

            item:
              pageUrl,
          },
        ],
      },

      {
        "@type":
          "ItemList",

        "@id":
          `${pageUrl}#promotions`,

        name:
          "Aktualne promocje SHEIN",

        numberOfItems:
          SHEIN_PROMOTIONS.length,

        itemListElement:
          SHEIN_PROMOTIONS.map(
            (
              promotion,
              index
            ) => ({
              "@type":
                "ListItem",

              position:
                index +
                1,

              name:
                promotion.title,

              url:
                `${pageUrl}#${promotion.id}`,
            })
          ),
      },
    ],
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

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700">
                <span
                  aria-hidden="true"
                  className="text-base"
                >
                  🔥
                </span>

                Aktualne promocje SHEIN
              </span>
            </div>

            <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.045em] text-stone-900 sm:text-5xl lg:text-[58px]">
              Promocje SHEIN
              i{" "}
              <span className="text-rose-600">
                kody rabatowe
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
              Szukasz aktualnej
              promocji SHEIN,
              kodu, kuponu dla
              nowego użytkownika
              albo wyróżnionej
              kampanii? Zbieramy
              wybrane akcje
              w jednym miejscu
              i opisujemy je
              w prosty sposób.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-500">
              <span className="rounded-full bg-stone-100 px-3 py-1.5">
                {
                  SHEIN_PROMOTIONS.length
                }{" "}
                kampanii
              </span>

              <span className="rounded-full bg-stone-100 px-3 py-1.5">
                Aktualizacja:{" "}
                {
                  updatedAtLabel
                }
              </span>

              <span className="rounded-full bg-stone-100 px-3 py-1.5">
                Aktualizacja ręczna
              </span>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <a
                href="#promocje"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
              >
                Zobacz promocje
              </a>

              <a
                href="#kody-rabatowe"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Jak działają kody?
              </a>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-[20px] border border-amber-100 bg-amber-50 p-4 text-left sm:p-5">
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm"
              >
                i
              </span>

              <div>
                <p className="text-sm font-black text-amber-950">
                  Ważne przed
                  skorzystaniem
                  z promocji
                </p>

                <p className="mt-1 text-xs leading-6 text-amber-800 sm:text-sm">
                  Kampanie, ceny,
                  kupony i warunki
                  mogą zmieniać się
                  w czasie. Przed
                  zakupem zawsze
                  sprawdź aktualne
                  informacje
                  bezpośrednio
                  w SHEIN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="promocje"
        className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              Sprawdź teraz
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-stone-900 sm:text-4xl">
              Aktualne promocje
              SHEIN
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-500 sm:text-base">
              Poniżej znajdziesz
              kampanie, które
              otrzymaliśmy
              w materiałach
              afiliacyjnych.
              Nie kopiujemy
              całego katalogu —
              wybieramy akcje,
              które mogą być
              przydatne podczas
              szukania okazji.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {SHEIN_PROMOTIONS.map(
              (
                promotion
              ) => (
                <PromotionCard
                  key={
                    promotion.id
                  }
                  promotion={
                    promotion
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      <section
        id="kody-rabatowe"
        className="scroll-mt-24 border-b border-stone-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              Warto wiedzieć
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-stone-900">
              Kody rabatowe SHEIN
              – jak je rozumieć?
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-8 text-stone-600">
              <p>
                W materiałach
                promocyjnych SHEIN
                mogą pojawiać się
                zarówno kupony
                rabatowe, jak
                i specjalne kody
                służące do
                wyszukania konkretnej
                kampanii w aplikacji.
              </p>

              <p>
                Dlatego nie
                nazywamy każdego
                ciągu znaków
                „kodem rabatowym”.
                Przy promocjach
                pokazujemy dokładnie
                ten kod, który został
                podany w materiale
                kampanii, oraz
                wyjaśniamy, czego
                dotyczy dana akcja.
              </p>

              <p>
                Jeśli kampania
                informuje o kuponie
                dla nowych
                użytkowników,
                oznaczamy to
                wyraźnie. Nie
                zakładamy jednak,
                że promocja będzie
                dostępna dla każdego
                konta lub przez
                nieograniczony czas.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 sm:p-6">
            <p className="text-sm font-black text-stone-900">
              Jak skorzystać?
            </p>

            <div className="mt-4 space-y-4">
              <Step
                number="1"
                title="Wybierz promocję"
              >
                Sprawdź opis
                kampanii i informację,
                dla kogo jest
                przeznaczona.
              </Step>

              <Step
                number="2"
                title="Użyj kodu lub linku"
              >
                Wyszukaj kod
                w aplikacji SHEIN
                albo kliknij
                przygotowany link.
              </Step>

              <Step
                number="3"
                title="Sprawdź warunki"
              >
                Zweryfikuj aktualny
                rabat, cenę,
                dostępność
                i wymagania promocji.
              </Step>

              <Step
                number="4"
                title="Podejmij decyzję"
              >
                Zakupu dokonujesz
                bezpośrednio
                w SHEIN.
              </Step>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon="🎟️"
              title="Kupony i promocje"
            >
              Zbieramy wybrane
              akcje, zamiast
              publikować przypadkową
              listę niezweryfikowanych
              kodów znalezionych
              w internecie.
            </InfoCard>

            <InfoCard
              icon="🛍️"
              title="Produkty i bestsellery"
            >
              Niektóre kampanie
              prowadzą do całych
              kolekcji, popularnych
              produktów albo
              specjalnie wybranych
              ofert.
            </InfoCard>

            <InfoCard
              icon="🔎"
              title="Warunki sprawdzasz w SHEIN"
            >
              Trend za Mniej pomaga
              znaleźć promocję,
              ale ostateczna cena
              i możliwość
              skorzystania z akcji
              są określane przez
              SHEIN.
            </InfoCard>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
            FAQ
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-stone-900 sm:text-4xl">
            Promocje SHEIN –
            najczęstsze pytania
          </h2>

          <div className="mt-7 space-y-3">
            {FAQ.map(
              (
                item
              ) => (
                <details
                  key={
                    item.question
                  }
                  className="group rounded-[18px] border border-stone-200 bg-stone-50"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-black text-stone-900 sm:px-5 sm:text-base">
                    <span>
                      {
                        item.question
                      }
                    </span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-stone-400 transition group-open:rotate-45 group-open:text-rose-600">
                      +
                    </span>
                  </summary>

                  <div className="border-t border-stone-200 px-4 py-4 text-sm leading-7 text-stone-600 sm:px-5">
                    {
                      item.answer
                    }
                  </div>
                </details>
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-5 rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                Trend za Mniej
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
                Szukasz konkretnych
                produktów?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                Oprócz kampanii
                SHEIN zbieramy
                również pojedyncze
                ubrania, dodatki
                i inne okazje,
                które możesz
                przeglądać według
                kategorii i ceny.
              </p>
            </div>

            <Link
              href="/okazje"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white transition hover:bg-rose-700"
            >
              Zobacz wszystkie
              okazje
            </Link>
          </div>

          <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-stone-400">
            Trend za Mniej jest
            serwisem
            informacyjno-afiliacyjnym
            i nie jest sklepem
            SHEIN. Część linków
            ma charakter
            afiliacyjny, co
            oznacza, że możemy
            otrzymać prowizję
            po kwalifikującym się
            zakupie.{" "}
            <Link
              href="/afiliacja"
              className="font-bold text-stone-500 underline decoration-stone-300 underline-offset-2 transition hover:text-rose-600"
            >
              Dowiedz się więcej.
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function PromotionCard({
  promotion,
}: {
  promotion:
    SheinPromotion;
}) {
  return (
    <article
      id={
        promotion.id
      }
      className="scroll-mt-24 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-rose-700">
            {
              promotion.badge
            }
          </span>

          <span className="text-[10px] font-bold text-stone-400">
            Kampania SHEIN
          </span>
        </div>

        <h3 className="mt-4 text-xl font-black leading-tight tracking-[-0.025em] text-stone-900 sm:text-2xl">
          {
            promotion.title
          }
        </h3>

        <p className="mt-3 text-sm leading-7 text-stone-500">
          {
            promotion.description
          }
        </p>

        <div className="mt-5 rounded-[16px] border border-stone-200 bg-stone-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Kod do wyszukania
            w aplikacji
          </p>

          <div className="mt-2 flex items-center gap-3">
            <code className="rounded-xl bg-white px-4 py-2.5 text-lg font-black tracking-[0.08em] text-stone-900 shadow-sm">
              {
                promotion.code
              }
            </code>

            <span className="text-[10px] leading-5 text-stone-400">
              SHEIN
            </span>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-stone-400">
          {
            promotion.note
          }
        </p>
      </div>

      <div className="border-t border-stone-100 bg-stone-50 p-4 sm:px-6">
        <a
          href={
            promotion.affiliateUrl
          }
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-center text-sm font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
        >
          {
            promotion.ctaLabel
          }

          <span
            aria-hidden="true"
          >
            ↗
          </span>
        </a>

        <p className="mt-2 text-center text-[9px] font-semibold text-stone-400">
          Link afiliacyjny •
          otworzy SHEIN
        </p>
      </div>
    </article>
  );
}

function Step({
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
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-rose-600 shadow-sm">
        {number}
      </span>

      <div>
        <p className="text-sm font-black text-stone-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-6 text-stone-500">
          {children}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;

  title: string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-5">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-lg"
      >
        {icon}
      </span>

      <h3 className="mt-4 text-lg font-black text-stone-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-stone-500">
        {children}
      </p>
    </div>
  );
}