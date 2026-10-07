import type { Metadata } from "next";

import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt z serwisem Trend za Mniej.",
  alternates: {
    canonical: "/kontakt",
  },
};

export default function ContactPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <BrandLogo />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Napisz do nas
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Kontakt
        </h1>

        <p className="mt-5 text-lg leading-8 text-stone-600">
          Masz pytanie o ofertę, zauważyłeś
          nieaktualną cenę albo chcesz zgłosić
          problem z linkiem? Skontaktuj się z nami.
        </p>

        <div className="mt-10 rounded-3xl border border-rose-100 bg-white p-7 shadow-sm">
          {contactEmail ? (
            <>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-600">
                E-mail
              </p>

              <a
                href={`mailto:${contactEmail}`}
                className="mt-3 inline-flex text-xl font-black text-stone-900 transition hover:text-rose-600"
              >
                {contactEmail}
              </a>
            </>
          ) : (
            <>
              <p className="text-lg font-black">
                Adres kontaktowy w przygotowaniu
              </p>

              <p className="mt-3 leading-7 text-stone-600">
                Do czasu uruchomienia dedykowanego
                adresu e-mail możesz skontaktować
                się z Trend za Mniej przez oficjalny
                profil społecznościowy, z którego
                trafiłeś na stronę.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-100/70 p-6 text-sm leading-6 text-stone-600">
          W sprawach dotyczących zamówień, płatności,
          dostawy, zwrotów lub reklamacji skontaktuj
          się bezpośrednio ze sklepem, w którym
          dokonano zakupu. Trend za Mniej nie jest
          sprzedawcą prezentowanych produktów.
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
