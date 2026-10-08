import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import Link from "next/link";

import SheinPromotionsExplorer from "@/components/SheinPromotionsExplorer";
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
    "Aktualne promocje SHEIN, kody, kupony dla nowych użytkowników, wyprzedaże, SHEGLAM, bestsellery i kampanie zebrane w jednym miejscu.",

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
      "Sprawdź aktualne kampanie SHEIN, kupony dla nowych użytkowników, wyprzedaże, bestsellery oraz kody do wyszukania w aplikacji.",

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
      "Aktualne kampanie, kody, kupony i wyprzedaże SHEIN w jednym miejscu.",

    images: [
      "/opengraph-image",
    ],
  },
};

const FEATURED_PROMOTION_IDS = [
  "kupon-60-nowi-uzytkownicy",
  "produkty-ponizej-4-99",
  "sheglam-super-wyprzedaz",
  "bestsellery-dla-kobiet",
];

const FAQ = [
  {
    question:
      "Czy na Trend za Mniej znajdę aktualne kody rabatowe SHEIN?",

    answer:
      "Publikujemy wybrane kampanie, kody do wyszukania w aplikacji oraz informacje o kuponach otrzymane w materiałach kampanii afiliacyjnych. Warunki mogą się zmieniać, dlatego przed zakupem należy potwierdzić je bezpośrednio w SHEIN.",
  },

  {
    question:
      "Jak skorzystać z kodu SHEIN?",

    answer:
      "Przy każdej kampanii pokazujemy kod przekazany w materiale promocyjnym. Możesz go skopiować i wyszukać w aplikacji SHEIN albo użyć przycisku prowadzącego bezpośrednio do danej kampanii.",
  },

  {
    question:
      "Czy każdy kod SHEIN daje rabat?",

    answer:
      "Nie. Część kodów służy do odnalezienia określonej kampanii, kolekcji lub zestawienia produktów. Jeżeli materiał wyraźnie informuje o kuponie rabatowym, zaznaczamy to osobno.",
  },

  {
    question:
      "Czy kupon 60% SHEIN jest dla każdego?",

    answer:
      "W prezentowanych kampaniach kupon 60% jest komunikowany przede wszystkim jako oferta dla nowych użytkowników. Ostateczne warunki, kwalifikacja i wysokość rabatu są określane przez SHEIN.",
  },

  {
    question:
      "Czy promocje SHEIN mogą się zmienić?",

    answer:
      "Tak. Ceny, produkty, kupony, terminy i warunki kampanii mogą zmieniać się w czasie. Dlatego decydujące są informacje widoczne bezpośrednio w SHEIN przed zakupem.",
  },

  {
    question:
      "Czy Trend za Mniej jest sklepem SHEIN?",

    answer:
      "Nie. Trend za Mniej jest niezależnym serwisem informacyjno-afiliacyjnym. Nie sprzedajemy produktów i nie realizujemy zamówień. Zakup odbywa się bezpośrednio w SHEIN.",
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

  const featuredPromotions =
    FEATURED_PROMOTION_IDS
      .map(
        (
          id
        ) =>
          SHEIN_PROMOTIONS.find(
            (
              promotion
            ) =>
              promotion.id ===
              id
          )
      )
      .filter(
        (
          promotion
        ): promotion is
          SheinPromotion =>
          Boolean(
            promotion
          )
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
          "Aktualne promocje SHEIN, kody, kupony dla nowych użytkowników, wyprzedaże, bestsellery i kampanie.",

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

      {
        "@type":
          "FAQPage",

        "@id":
          `${pageUrl}#faq`,

        mainEntity:
          FAQ.map(
            (
              item
            ) => ({
              "@type":
                "Question",

              name:
                item.question,

              acceptedAnswer: {
                "@type":
                  "Answer",

                text:
                  item.answer,
              },
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

      <Hero
        promotionsCount={
          SHEIN_PROMOTIONS.length
        }
        updatedAtLabel={
          updatedAtLabel
        }
      />

      <FeaturedPromotions
        promotions={
          featuredPromotions
        }
      />

      <section
        id="wszystkie-promocje"
        className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              Znajdź właściwą
              kampanię
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl">
              Wszystkie promocje
              SHEIN
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-500 sm:text-base">
              Wyszukaj promocję
              po nazwie albo kodzie
              lub wybierz kategorię.
              Dzięki temu nie musisz
              przeglądać wszystkich
              kampanii po kolei.
            </p>
          </div>

          <div className="mt-7">
            <SheinPromotionsExplorer
              promotions={
                SHEIN_PROMOTIONS
              }
            />
          </div>
        </div>
      </section>

      <CodeGuide />

      <TrustSection />

      <FaqSection />

      <FinalSection />

      <SiteFooter />
    </main>
  );
}

function Hero({
  promotionsCount,
  updatedAtLabel,
}: {
  promotionsCount: number;

  updatedAtLabel: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-rose-100/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700">
              <span
                aria-hidden="true"
              >
                🔥
              </span>

              Promocje aktualizowane
              ręcznie
            </span>
          </div>

          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.03] tracking-[-0.05em] text-stone-900 sm:text-5xl lg:text-[60px]">
            Promocje SHEIN
            i{" "}
            <span className="text-rose-600">
              kody rabatowe
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">
            Kupony dla nowych
            użytkowników,
            wyprzedaże, SHEGLAM,
            bestsellery, moda,
            beauty i inne kampanie
            SHEIN — uporządkowane
            w jednym miejscu.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2 min-[460px]:flex-row">
            <a
              href="#wszystkie-promocje"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
            >
              Znajdź promocję
            </a>

            <a
              href="#jak-dzialaja-kody"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 text-sm font-black text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Jak działają kody?
            </a>
          </div>

          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-stone-400 sm:text-xs">
            <span>
              {
                promotionsCount
              }{" "}
              aktualnych kampanii
            </span>

            <span>
              •
            </span>

            <span>
              Aktualizacja:{" "}
              {
                updatedAtLabel
              }
            </span>

            <span>
              •
            </span>

            <span>
              Bez zakładania
              konta w Trend za
              Mniej
            </span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-[20px] border border-amber-100 bg-amber-50 p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-amber-700 shadow-sm">
              i
            </span>

            <div>
              <p className="text-sm font-black text-amber-950">
                Promocje mogą
                zmieniać się szybko
              </p>

              <p className="mt-1 text-xs leading-6 text-amber-800 sm:text-sm">
                Pokazujemy informacje
                otrzymane w materiałach
                kampanii. Aktualną
                cenę, dostępność,
                kwalifikację do
                kuponu i pozostałe
                warunki zawsze
                potwierdź
                bezpośrednio
                w SHEIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedPromotions({
  promotions,
}: {
  promotions:
    SheinPromotion[];
}) {
  if (
    promotions.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Na dobry początek
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-3xl">
              Wyróżnione promocje
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
              Kilka kampanii,
              które warto sprawdzić
              przed przeglądaniem
              całej listy.
            </p>
          </div>

          <a
            href="#wszystkie-promocje"
            className="hidden shrink-0 text-sm font-black text-rose-600 transition hover:text-rose-700 sm:block"
          >
            Wszystkie promocje →
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promotions.map(
            (
              promotion
            ) => (
              <FeaturedCard
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
  );
}

function FeaturedCard({
  promotion,
}: {
  promotion:
    SheinPromotion;
}) {
  return (
    <article className="flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50">
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="w-fit rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-rose-700 shadow-sm">
          {
            promotion.badge
          }
        </span>

        <h3 className="mt-4 text-lg font-black leading-snug tracking-[-0.025em] text-stone-900">
          {
            promotion.title
          }
        </h3>

        <p className="mt-2 line-clamp-3 text-xs leading-6 text-stone-500">
          {
            promotion.description
          }
        </p>

        <div className="mt-auto pt-5">
          <p className="text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
            Kod kampanii
          </p>

          <code className="mt-1 block text-base font-black tracking-[0.07em] text-stone-900">
            {
              promotion.code
            }
          </code>
        </div>
      </div>

      <div className="border-t border-stone-200 bg-white p-3">
        <a
          href={
            promotion.affiliateUrl
          }
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-3 text-center text-xs font-black text-white transition hover:bg-rose-600"
        >
          {
            promotion.ctaLabel
          }{" "}
          ↗
        </a>
      </div>
    </article>
  );
}

function CodeGuide() {
  return (
    <section
      id="jak-dzialaja-kody"
      className="scroll-mt-24 border-b border-stone-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
            Warto wiedzieć
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl">
            Kod SHEIN nie zawsze
            oznacza kupon rabatowy
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
            Na stronie rozróżniamy
            kupony od kodów
            kampanii, żeby od razu
            było wiadomo, czego
            możesz się spodziewać.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-3 md:grid-cols-3">
          <GuideCard
            icon="🎟️"
            title="Kupon rabatowy"
          >
            Gdy materiał kampanii
            wyraźnie informuje
            o kuponie, pokazujemy
            dla kogo jest
            przeznaczony i czego
            dotyczy.
          </GuideCard>

          <GuideCard
            icon="🔎"
            title="Kod kampanii"
          >
            Taki kod może służyć
            do wyszukania konkretnej
            promocji, kolekcji lub
            zestawienia produktów
            w aplikacji SHEIN.
          </GuideCard>

          <GuideCard
            icon="↗️"
            title="Link do kampanii"
          >
            Możesz pominąć ręczne
            wpisywanie kodu
            i przejść bezpośrednio
            do kampanii przez
            przygotowany przycisk.
          </GuideCard>
        </div>

        <div className="mx-auto mt-7 max-w-3xl rounded-[22px] border border-stone-200 bg-stone-50 p-5 sm:p-6">
          <h3 className="text-lg font-black text-stone-900">
            Jak skorzystać
            z promocji?
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Step
              number="1"
              title="Znajdź kampanię"
            >
              Użyj wyszukiwarki
              albo wybierz kategorię.
            </Step>

            <Step
              number="2"
              title="Skopiuj kod"
            >
              Jeśli chcesz,
              skopiuj kod jednym
              kliknięciem.
            </Step>

            <Step
              number="3"
              title="Otwórz SHEIN"
            >
              Kliknij przycisk
              prowadzący bezpośrednio
              do kampanii.
            </Step>

            <Step
              number="4"
              title="Sprawdź warunki"
            >
              Przed zakupem
              potwierdź cenę,
              rabat i kwalifikację
              do promocji.
            </Step>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-3 md:grid-cols-3">
          <GuideCard
            icon="✋"
            title="Wybieramy ręcznie"
          >
            Nie pobieramy
            automatycznie całego
            katalogu SHEIN.
            Publikujemy kampanie,
            które zostały nam
            udostępnione.
          </GuideCard>

          <GuideCard
            icon="👀"
            title="Jasne informacje"
          >
            Staramy się wyraźnie
            pokazać, czy chodzi
            o kupon, kod kampanii,
            wyprzedaż czy
            kolekcję produktów.
          </GuideCard>

          <GuideCard
            icon="🛍️"
            title="Zakup w SHEIN"
          >
            Trend za Mniej
            nie sprzedaje produktów.
            Cena i zakup są
            finalizowane
            bezpośrednio w SHEIN.
          </GuideCard>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
          Najczęstsze pytania
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl">
          Promocje i kody SHEIN
          – FAQ
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
          Najważniejsze informacje
          przed skorzystaniem
          z kampanii lub kuponu.
        </p>

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
  );
}

function FinalSection() {
  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-[28px] bg-stone-900 p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-300">
                Szukasz czegoś
                konkretnego?
              </p>

              <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                Promocje to nie
                wszystko.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                Możesz również
                przeglądać wybrane
                produkty, filtrować
                je według kategorii
                i ceny oraz sprawdzać
                najnowsze znaleziska.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
              <Link
                href="/okazje"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-500"
              >
                Przeglądaj produkty
              </Link>

              <Link
                href="/okazje?maxPrice=50"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-stone-900 transition hover:bg-stone-100"
              >
                Okazje do 50 zł
              </Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-stone-400">
          Część linków ma
          charakter afiliacyjny.
          Możemy otrzymać prowizję
          po kwalifikującym się
          zakupie, bez doliczania
          przez Trend za Mniej
          dodatkowej opłaty.{" "}
          <Link
            href="/afiliacja"
            className="font-bold text-stone-500 underline decoration-stone-300 underline-offset-2 transition hover:text-rose-600"
          >
            Więcej o afiliacji.
          </Link>
        </p>
      </div>
    </section>
  );
}

function GuideCard({
  icon,
  title,
  children,
}: {
  icon: string;

  title: string;

  children:
    ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-lg">
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

function Step({
  number,
  title,
  children,
}: {
  number: string;

  title: string;

  children:
    ReactNode;
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