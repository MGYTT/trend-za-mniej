import type {
  Metadata,
} from "next";

import Link from "next/link";

import InfoPageLayout, {
  InfoNotice,
} from "@/components/InfoPageLayout";

import {
  getSiteUrl,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Kontakt – Trend za Mniej",

  description:
    "Skontaktuj się z Trend za Mniej. Zgłoś niedziałający link, nieaktualną ofertę, problem ze stroną lub pytanie dotyczące serwisu.",

  alternates: {
    canonical:
      "/kontakt",
  },

  openGraph: {
    type:
      "website",

    locale:
      "pl_PL",

    url:
      "/kontakt",

    siteName:
      SITE_NAME,

    title:
      "Kontakt | Trend za Mniej",

    description:
      "Kontakt w sprawie działania serwisu, ofert, prywatności i współpracy.",
  },
};

export default function ContactPage() {
  const contactEmail =
    process.env
      .NEXT_PUBLIC_CONTACT_EMAIL
      ?.trim();

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/kontakt`;

  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "ContactPage",

    "@id":
      `${pageUrl}#webpage`,

    url:
      pageUrl,

    name:
      "Kontakt – Trend za Mniej",

    description:
      "Dane kontaktowe i informacje dotyczące kontaktu z Trend za Mniej.",

    inLanguage:
      SITE_LANGUAGE,

    isPartOf: {
      "@id":
        `${siteUrl}/#website`,
    },
  };

  return (
    <InfoPageLayout
      eyebrow="Kontakt"
      title="Masz pytanie lub chcesz coś zgłosić?"
      lead="Jeżeli zauważysz problem z ofertą, niedziałający link albo chcesz skontaktować się w sprawie serwisu, tutaj znajdziesz właściwą drogę."
      activePath="/kontakt"
      structuredData={
        structuredData
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section>
          <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              Kontakt e-mail
            </p>

            {contactEmail ? (
              <>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900">
                  Napisz do Trend za
                  Mniej
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
                  Najlepiej krótko
                  opisz sprawę
                  i, jeśli dotyczy
                  konkretnego produktu,
                  dodaj link do jego
                  strony w Trend za
                  Mniej.
                </p>

                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-6 flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-rose-600 px-5 font-black text-white transition hover:bg-rose-700 sm:w-fit sm:min-w-[320px]"
                >
                  <span className="min-w-0 break-all">
                    {
                      contactEmail
                    }
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    →
                  </span>
                </a>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900">
                  Kanał kontaktowy
                  jest przygotowywany
                </h2>

                <p className="mt-3 text-sm leading-7 text-stone-500">
                  Dedykowany adres
                  e-mail nie został
                  jeszcze
                  skonfigurowany
                  w serwisie.
                </p>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
              W czym możemy pomóc?
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
              Najczęstsze powody
              kontaktu
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ContactReason
                icon="!"
                title="Nieaktualna oferta"
                text="Zgłoś zmianę ceny, brak produktu lub inną nieścisłość."
              />

              <ContactReason
                icon="↗"
                title="Problem z linkiem"
                text="Daj znać, jeśli przejście do zewnętrznego sklepu nie działa poprawnie."
              />

              <ContactReason
                icon="?"
                title="Pytanie o serwis"
                text="Skontaktuj się w sprawie działania Trend za Mniej."
              />

              <ContactReason
                icon="i"
                title="Prywatność"
                text="Napisz w sprawach związanych z danymi i polityką prywatności."
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <InfoNotice
            title="W sprawie zamówienia"
            tone="amber"
          >
            <p>
              Jeżeli pytanie dotyczy
              płatności, wysyłki,
              dostawy, zwrotu,
              reklamacji albo
              konkretnego zamówienia,
              skontaktuj się
              bezpośrednio ze
              sklepem, w którym
              dokonano zakupu.
            </p>

            <p className="mt-3 font-bold text-stone-700">
              Trend za Mniej nie jest
              sprzedawcą produktów.
            </p>
          </InfoNotice>

          <InfoNotice title="Przydatne strony">
            <div className="grid gap-2">
              <Link
                href="/o-nas"
                className="font-bold text-rose-600 hover:text-rose-700"
              >
                O Trend za Mniej →
              </Link>

              <Link
                href="/afiliacja"
                className="font-bold text-rose-600 hover:text-rose-700"
              >
                Informacja
                o afiliacji →
              </Link>

              <Link
                href="/polityka-prywatnosci"
                className="font-bold text-rose-600 hover:text-rose-700"
              >
                Polityka
                prywatności →
              </Link>
            </div>
          </InfoNotice>
        </aside>
      </div>
    </InfoPageLayout>
  );
}

function ContactReason({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-700">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-stone-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        {text}
      </p>
    </div>
  );
}