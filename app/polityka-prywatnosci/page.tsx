import type { Metadata } from "next";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Informacje o prywatności i przetwarzaniu danych w serwisie Trend za Mniej.",
  alternates: {
    canonical:
      "/polityka-prywatnosci",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Informacje prawne
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Polityka prywatności
        </h1>

        <p className="mt-5 text-stone-500">
          Ostatnia aktualizacja:
          7 października 2026 r.
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-stone-600">
          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Jak działa serwis
            </h2>

            <p className="mt-3">
              Trend za Mniej prezentuje
              wybrane oferty, informacje
              o cenach i linki prowadzące
              do zewnętrznych sklepów.
              Publiczne korzystanie z
              serwisu nie wymaga
              zakładania konta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Statystyki kliknięć
            </h2>

            <p className="mt-3">
              Gdy użytkownik wybiera
              przycisk prowadzący do
              oferty zewnętrznej, serwis
              zapisuje identyfikator
              klikniętego produktu oraz
              czas kliknięcia.
            </p>

            <p className="mt-3">
              Dane te służą wyłącznie do
              podstawowych statystyk
              popularności ofert i nie są
              wykorzystywane do
              identyfikowania konkretnego
              użytkownika.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Dostawcy infrastruktury
            </h2>

            <p className="mt-3">
              Serwis korzysta z usług
              infrastrukturalnych, w
              szczególności Vercel do
              hostingu aplikacji oraz
              Supabase do przechowywania
              danych ofert i podstawowych
              statystyk.
            </p>

            <p className="mt-3">
              Dostawcy infrastruktury mogą
              przetwarzać dane techniczne
              związane z obsługą
              połączenia zgodnie z
              własnymi zasadami
              prywatności, zabezpieczeń
              oraz obowiązującymi
              przepisami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Linki afiliacyjne i strony
              zewnętrzne
            </h2>

            <p className="mt-3">
              Po kliknięciu linku
              afiliacyjnego użytkownik
              opuszcza Trend za Mniej i
              przechodzi do zewnętrznego
              sklepu, np. SHEIN.
            </p>

            <p className="mt-3">
              Od tego momentu zasady
              dotyczące danych, cookies,
              kont użytkownika, płatności
              oraz zamówień określa
              zewnętrzny serwis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Linki afiliacyjne
            </h2>

            <p className="mt-3">
              Część odnośników
              publikowanych w serwisie to
              linki afiliacyjne. Możemy
              otrzymać prowizję, jeśli
              użytkownik dokona zakupu po
              przejściu przez taki link.
            </p>

            <p className="mt-3">
              Korzystanie z linku
              afiliacyjnego nie powinno
              powodować dodatkowych
              kosztów dla kupującego.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Panel administratora
            </h2>

            <p className="mt-3">
              Logowanie do panelu
              administratora jest
              dostępne wyłącznie dla
              uprawnionych kont i
              wykorzystuje mechanizmy
              uwierzytelniania Supabase.
            </p>

            <p className="mt-3">
              Panel administratora nie
              jest przeznaczony dla
              zwykłych odwiedzających
              serwis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Zmiany polityki prywatności
            </h2>

            <p className="mt-3">
              Polityka prywatności może
              być aktualizowana wraz z
              rozwojem serwisu, zmianą
              wykorzystywanych usług lub
              sposobu przetwarzania
              danych.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Kontakt
            </h2>

            <p className="mt-3">
              W sprawach dotyczących
              prywatności, danych lub
              działania serwisu można
              skorzystać ze strony
              Kontakt dostępnej w stopce
              witryny.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}