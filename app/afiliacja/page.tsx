import type { Metadata } from "next";

import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Informacja o afiliacji",
  description:
    "Zasady działania linków afiliacyjnych w serwisie Trend za Mniej.",
  alternates: {
    canonical: "/afiliacja",
  },
};

export default function AffiliatePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <BrandLogo />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Transparentność
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Informacja o afiliacji
        </h1>

        <div className="mt-10 space-y-10 text-base leading-8 text-stone-600">
          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Czym są linki afiliacyjne?
            </h2>

            <p className="mt-3">
              Część linków publikowanych w Trend za
              Mniej to linki afiliacyjne. Jeśli
              użytkownik przejdzie przez taki link i
              dokona zakupu, możemy otrzymać
              prowizję od sklepu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Czy użytkownik płaci więcej?
            </h2>

            <p className="mt-3">
              Nie. Samo użycie linku afiliacyjnego
              nie powinno zwiększać ceny produktu
              dla kupującego. Wynagrodzenie
              afiliacyjne jest rozliczane pomiędzy
              sklepem a wydawcą linku.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Ceny, rabaty i dostępność
            </h2>

            <p className="mt-3">
              Ceny podane na stronie są cenami
              zaobserwowanymi w chwili publikacji
              lub aktualizacji oferty. Mogą się
              później zmienić. Kupony, rabaty i
              promocje mogą zależeć od konta,
              kraju, czasu lub statusu klienta.
              Zawsze sprawdź aktualne warunki
              bezpośrednio w sklepie przed zakupem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Kto jest sprzedawcą?
            </h2>

            <p className="mt-3">
              Trend za Mniej nie jest sprzedawcą
              prezentowanych produktów. Zakup,
              płatność, dostawa, reklamacje i zwroty
              odbywają się na zasadach sklepu, do
              którego prowadzi dana oferta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-stone-900">
              Oznaczenia na stronie
            </h2>

            <p className="mt-3">
              Przy linkach prowadzących do ofert
              stosujemy informację „Reklama / link
              afiliacyjny”, aby jasno wskazać
              komercyjny charakter odnośnika.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
