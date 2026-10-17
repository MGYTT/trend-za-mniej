
import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SheinPromotionsExplorer from "@/components/SheinPromotionsExplorer";

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
  title: "Promocje SHEIN, kody i kupony",
  description:
    "Przeglądaj kampanie promocyjne SHEIN, wyszukuj kody, sprawdzaj wyprzedaże i propozycje dla nowych użytkowników. Wszystko w Trend za Mniej.",

  alternates: {
    canonical: "/promocje-shein",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/promocje-shein",
    siteName: SITE_NAME,
    title: "Promocje SHEIN i kody | Trend za Mniej",
    description:
      "Odkrywaj kampanie, wyszukuj kody i sprawdzaj promocje SHEIN.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Promocje SHEIN i kody",
    description:
      "Kampanie, kupony i wyprzedaże SHEIN w jednym miejscu.",
    images: ["/opengraph-image"],
  },
};

const FEATURED_IDS = [
  "kupon-60-nowi-uzytkownicy",
  "produkty-ponizej-4-99",
  "sheglam-super-wyprzedaz",
];

const FAQ = [
  {
    question: "Czy każdy kod SHEIN daje rabat?",
    answer:
      "Nie. Niektóre kody umożliwiają wyszukanie kampanii lub kolekcji produktów w SHEIN. Nie muszą być kuponami do wpisania w koszyku.",
  },
  {
    question: "Jak skopiować kod?",
    answer:
      "Wybierz interesującą Cię kampanię i naciśnij „Kopiuj kod”. Następnie możesz wyszukać go w SHEIN, jeśli taka jest metoda skorzystania z kampanii.",
  },
  {
    question: "Czy kupon 60% jest dla wszystkich?",
    answer:
      "W materiałach prezentowanej kampanii kupon 60% jest opisywany jako oferta dla nowych użytkowników. Ostateczną kwalifikację i warunki sprawdź bezpośrednio w SHEIN.",
  },
  {
    question: "Czy ceny i promocje mogą się zmieniać?",
    answer:
      "Tak. Dostępność produktów, ceny, terminy i warunki poszczególnych kampanii mogą się zmieniać. Informacje prezentowane na stronie nie stanowią gwarancji bieżącej oferty.",
  },
  {
    question: "Czy Trend za Mniej sprzedaje produkty?",
    answer:
      "Nie. Trend za Mniej jest niezależnym serwisem informacyjno-afiliacyjnym. Zakupy, płatności, dostawa i zwroty odbywają się w zewnętrznym sklepie.",
  },
  {
    question: "Czy linki do SHEIN są afiliacyjne?",
    answer:
      "Tak, część linków może mieć charakter afiliacyjny. Możemy otrzymać prowizję od kwalifikującego się zakupu, bez doliczania przez nas dodatkowej opłaty.",
  },
];

/* ======================================================
   STRONA GŁÓWNA PROMOCJI
====================================================== */

export default function SheinPromotionsPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/promocje-shein`;

  const updatedAt = new Date(
    SHEIN_PROMOTIONS_UPDATED_AT
  );

  const updatedAtLabel =
    new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(updatedAt);

  const featuredPromotions = FEATURED_IDS
    .map((id) =>
      SHEIN_PROMOTIONS.find(
        (promotion) => promotion.id === id
      )
    )
    .filter(
      (promotion): promotion is SheinPromotion =>
        Boolean(promotion)
    );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Promocje SHEIN i kody",
        description:
          "Zestawienie wybranych kampanii i kodów SHEIN.",
        inLanguage: SITE_LANGUAGE,
        dateModified: SHEIN_PROMOTIONS_UPDATED_AT,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${pageUrl}#promotions`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Strona główna",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Promocje SHEIN",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#promotions`,
        name: "Kampanie SHEIN",
        numberOfItems: SHEIN_PROMOTIONS.length,
        itemListElement: SHEIN_PROMOTIONS.map(
          (promotion, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: promotion.title,
            url: `${pageUrl}#${promotion.id}`,
          })
        ),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-900 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <SiteHeader />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-rose-100/80 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10 lg:py-14">
          <nav
            aria-label="Okruszki"
            className="flex items-center gap-2 text-xs font-semibold text-stone-500"
          >
            <Link
              href="/"
              className="hover:text-rose-700"
            >
              Start
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="text-stone-800"
            >
              Promocje SHEIN
            </span>
          </nav>

          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-center lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-rose-500"
                />

                Kampanie i kody SHEIN
              </span>

              <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.3rem,5vw,4rem)] font-black leading-[1.1] tracking-[-0.05em] text-stone-950">
                Odkrywaj promocje.
                <span className="block text-rose-600">
                  Znajdź coś dla siebie.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
                Kupony, wyprzedaże, moda,
                kosmetyki i popularne kampanie
                SHEIN — wygodnie zebrane
                w jednym miejscu.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 sm:mt-7">
                <a
                  href="#wszystkie-promocje"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700"
                >
                  Znajdź promocję
                  <span
                    aria-hidden="true"
                    className="ml-2"
                  >
                    ↓
                  </span>
                </a>

                <a
                  href="#jak-dzialaja-kody"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-extrabold text-stone-700 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Jak działają kody?
                </a>
              </div>
            </div>

            {/* PODSUMOWANIE */}

            <div className="rounded-[24px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                Trend za Mniej
              </p>

              <p className="mt-3 text-[46px] font-black leading-none tracking-[-0.06em] text-stone-950">
                {SHEIN_PROMOTIONS.length}
              </p>

              <p className="mt-2 text-sm font-bold text-stone-800">
                kampanii w zestawieniu
              </p>

              <div className="mt-5 border-t border-rose-100 pt-4">
                <p className="text-xs font-semibold text-stone-500">
                  Ostatnia aktualizacja danych
                </p>

                <time
                  dateTime={SHEIN_PROMOTIONS_UPDATED_AT}
                  className="mt-1 block text-sm font-extrabold text-stone-900"
                >
                  {updatedAtLabel}
                </time>
              </div>

              <p className="mt-4 text-xs leading-6 text-stone-600">
                Warunki kampanii, ceny
                i dostępność mogą się zmienić.
                Zweryfikuj je w SHEIN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WYRÓŻNIONE KAMPANIE */}

      {featuredPromotions.length > 0 && (
        <section
          aria-labelledby="featured-promotions-heading"
          className="border-b border-stone-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
                  Na dobry początek
                </p>

                <h2
                  id="featured-promotions-heading"
                  className="mt-1.5 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
                >
                  Wyróżnione kampanie
                </h2>

                <p className="mt-2 text-sm text-stone-600">
                  Kilka propozycji, od których
                  możesz zacząć.
                </p>
              </div>

              <a
                href="#wszystkie-promocje"
                className="text-sm font-extrabold text-rose-700 hover:text-rose-800"
              >
                Wszystkie kampanie →
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPromotions.map(
                (promotion) => (
                  <FeaturedCard
                    key={promotion.id}
                    promotion={promotion}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* WYSZUKIWARKA I WSZYSTKIE PROMOCJE */}

      <section
        id="wszystkie-promocje"
        aria-labelledby="all-promotions-heading"
        className="scroll-mt-24 border-b border-stone-200 bg-stone-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
              Przeglądaj po swojemu
            </p>

            <h2
              id="all-promotions-heading"
              className="mt-1.5 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
            >
              Wszystkie promocje SHEIN
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
              Wpisz nazwę lub kod kampanii
              albo wybierz kategorię.
              Bez zbędnego przewijania
              niepasujących ofert.
            </p>
          </div>

          <SheinPromotionsExplorer
            promotions={SHEIN_PROMOTIONS}
          />
        </div>
      </section>

      {/* JAK DZIAŁAJĄ KODY */}

      <section
        id="jak-dzialaja-kody"
        aria-labelledby="codes-guide-heading"
        className="scroll-mt-24 border-b border-stone-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
              Warto wiedzieć
            </p>

            <h2
              id="codes-guide-heading"
              className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
            >
              Kod kampanii a kupon rabatowy
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Nie każdy kod wyświetlany
              przy kampanii daje rabat
              w koszyku. Dlatego warto
              rozróżniać te trzy sytuacje.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <GuideCard
              number="01"
              title="Kod kampanii"
              description="Może służyć do odnalezienia konkretnej akcji lub kolekcji w aplikacji SHEIN."
            />

            <GuideCard
              number="02"
              title="Kupon rabatowy"
              description="Może zmniejszać cenę po spełnieniu warunków określonych przez SHEIN."
            />

            <GuideCard
              number="03"
              title="Link do oferty"
              description="Prowadzi bezpośrednio do kampanii, bez konieczności ręcznego wyszukiwania kodu."
            />
          </div>

          <div className="mt-5 rounded-[20px] border border-amber-100 bg-amber-50 px-4 py-4 sm:px-5">
            <p className="text-sm font-extrabold text-amber-950">
              Sprawdź warunki przed zakupem
            </p>

            <p className="mt-1 text-xs leading-6 text-amber-900 sm:text-sm">
              Ostateczna cena, ograniczenia
              promocji, kwalifikacja do kuponu
              i dostępność produktów zależą
              od zasad danej kampanii SHEIN.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section
        id="faq"
        aria-labelledby="promotions-faq-heading"
        className="border-b border-stone-200 bg-stone-50"
      >
        <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-12">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">
            Pomoc
          </p>

          <h2
            id="promotions-faq-heading"
            className="mt-2 text-2xl font-black tracking-[-0.035em] text-stone-950 sm:text-3xl"
          >
            Najczęstsze pytania
          </h2>

          <div className="mt-6 space-y-2.5">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-extrabold text-stone-900 [&::-webkit-details-marker]:hidden sm:px-5">
                  <span>{item.question}</span>

                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-lg text-rose-700 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <p className="border-t border-stone-100 px-4 py-4 text-sm leading-7 text-stone-600 sm:px-5">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* KONIEC STRONY */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="rounded-[24px] bg-stone-900 px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-300">
                  Więcej inspiracji
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Odkryj także nasze produkty
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-7 text-stone-300">
                  Przeglądaj ubrania i dodatki,
                  filtruj według ceny oraz
                  kategorii i znajdź coś
                  dla siebie.
                </p>
              </div>

              <Link
                href="/okazje"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white transition hover:bg-rose-500"
              >
                Przejdź do katalogu →
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-6 text-stone-500">
            Trend za Mniej jest niezależnym
            serwisem informacyjno-afiliacyjnym.
            Część linków może przynosić nam
            prowizję od kwalifikujących się
            zakupów.{" "}
            <Link
              href="/afiliacja"
              className="font-extrabold text-rose-700 underline underline-offset-4"
            >
              Jak działa afiliacja?
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ======================================================
   KARTA WYRÓŻNIONEJ KAMPANII
====================================================== */

function FeaturedCard({
  promotion,
}: {
  promotion: SheinPromotion;
}) {
  return (
    <Link
      href={`#${promotion.id}`}
      className="group flex h-full min-w-0 flex-col rounded-[22px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
    >
      <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-rose-700 shadow-sm">
        {promotion.badge}
      </span>

      <h3 className="mt-4 line-clamp-3 text-lg font-black leading-snug tracking-[-0.02em] text-stone-950">
        {promotion.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
        {promotion.description}
      </p>

      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-rose-700">
        Sprawdź szczegóły
        <ArrowIcon />
      </span>
    </Link>
  );
}

/* ======================================================
   KARTA INSTRUKCJI
====================================================== */

function GuideCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[20px] border border-stone-200 bg-white p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-700">
        {number}
      </span>

      <h3 className="mt-4 text-base font-black text-stone-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-stone-600">
        {description}
      </p>
    </article>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
