import type { Metadata } from "next";

import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Informacje o prywatności i przetwarzaniu danych w serwisie Trend za Mniej.",
  alternates: {
    canonical: "/polityka-prywatnosci",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <BrandLogo />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Informacje prawne
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Polityka prywatności
        </h1>

        <p className="mt-5 text-stone-500">
          Ostatnia aktualizacja: 7 października 2026 r.
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-stone-600">
          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Jak działa serwis
            </h2>

            <p className="mt-3">
              Trend za Mniej prezentuje wybrane
              oferty, informacje o cenach i linki
              prowadzące do zewnętrznych sklepów.
              Publiczne korzystanie z serwisu nie
              wymaga zakładania konta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Dane techniczne i statystyki kliknięć
            </h2>

            <p className="mt-3">
              Gdy użytkownik wybiera przycisk
              prowadzący do oferty zewnętrznej,
              serwis może zapisać identyfikator
              produktu, czas kliknięcia, adres
              strony odsyłającej oraz informacje
              techniczne przekazywane przez
              przeglądarkę, takie jak user-agent.
              Dane te służą do podstawowych
              statystyk działania serwisu i nie są
              wykorzystywane do tworzenia profilu
              konkretnej osoby.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Dostawcy infrastruktury
            </h2>

            <p className="mt-3">
              Serwis korzysta z usług
              infrastrukturalnych, w szczególności
              Vercel do hostingu aplikacji oraz
              Supabase do przechowywania danych
              ofert i statystyk. Dostawcy ci mogą
              przetwarzać dane techniczne zgodnie
              z własnymi zasadami prywatności i
              wymaganiami bezpieczeństwa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Linki afiliacyjne i strony zewnętrzne
            </h2>

            <p className="mt-3">
              Po kliknięciu linku afiliacyjnego
              użytkownik opuszcza Trend za Mniej i
              przechodzi do zewnętrznego sklepu,
              np. SHEIN. Od tego momentu zasady
              dotyczące danych, cookies, płatności
              i kont użytkownika określa dany
              zewnętrzny serwis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Panel administratora
            </h2>

            <p className="mt-3">
              Logowanie do panelu administratora
              jest dostępne wyłącznie dla
              uprawnionych kont i wykorzystuje
              mechanizmy uwierzytelniania Supabase.
              Dane logowania nie są przeznaczone
              dla zwykłych odwiedzających.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Kontakt w sprawach prywatności
            </h2>

            <p className="mt-3">
              W sprawach dotyczących prywatności,
              danych lub działania serwisu skorzystaj
              ze strony Kontakt dostępnej w stopce.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
