import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Wtyczka Chrome — wersja testowa | Trend za Mniej",
  description: "Pobierz testową wtyczkę Chrome Trendzamniej i sprawdź instrukcję ręcznej instalacji oraz uprawnienia.",
  alternates: { canonical: "/wtyczka-chrome" },
};

const steps = [
  ["Pobierz ZIP", "Pobierz paczkę wtyczki na komputer. Wersja: 0.5.0."],
  ["Rozpakuj folder", "Rozpakuj archiwum i znajdź folder, w którym znajduje się manifest.json."],
  ["Włącz Tryb dewelopera", "Otwórz w Chrome adres chrome://extensions i włącz Tryb dewelopera."],
  ["Załaduj rozpakowane", "Kliknij „Załaduj rozpakowane”, wybierz folder wtyczki i przypnij jej ikonę."],
] as const;

export default function ExtensionDownloadPage() {
  return (
    <main className="min-h-screen bg-[#faf8f7] text-stone-950">
      <SiteHeader />
      <section className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <Link href="/kody-rabatowe" className="text-sm font-bold text-rose-700 hover:underline">← Kody i sklepy</Link>
          <p className="mt-8 text-xs font-black uppercase tracking-widest text-rose-700">Asystent zakupowy Trendzamniej</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Wtyczka do Chrome</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
            Wyświetla kody pasujące do odwiedzanego sklepu i pozwala je kopiować.
            Panel na stronie otwiera się wyłącznie po kliknięciu użytkownika.
            W tym wydaniu można samodzielnie sprawdzić kupon w koszyku i zanotować wynik tylko w otwartym panelu.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="/downloads/trendzamniej-chrome-0.5.0.zip" download="trendzamniej-chrome-0.5.0.zip"
              className="inline-flex min-h-13 items-center rounded-xl bg-rose-600 px-6 py-3 text-sm font-black text-white hover:bg-rose-700">
              Pobierz wtyczkę ZIP ↓
            </a>
            <span className="text-xs font-semibold text-stone-500">Bezpłatna · wersja testowa · instalacja ręczna</span>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-5 py-11">
        <h2 className="text-2xl font-black">Instrukcja instalacji Chrome</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Rozszerzenie nie jest jeszcze opublikowane w Chrome Web Store. W Chrome standardowa
          instalacja jednym kliknięciem będzie możliwa dopiero po publikacji w oficjalnym sklepie.
          Ręczna instalacja rozpakowanego folderu jest przeznaczona do testów.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {steps.map(([title, description], index) => (
            <li key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-700">{index + 1}</span>
              <h3 className="mt-3 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-xl font-black">Jakie ma uprawnienia?</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              <strong>tabs</strong> odczytuje adres aktualnie odwiedzanego sklepu, by dopasować promocje.
              <strong> activeTab</strong> i <strong>scripting</strong> umożliwiają pokazanie panelu dopiero po Twoim kliknięciu.
              Łączy się z <strong>trendzamniej.pl</strong>, żeby pobrać listę kodów, ale nie przesyła adresów odwiedzanych kart na nasze API.
            </p>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-xl font-black">Jak działa sprawdzanie kodów?</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Skopiuj kod, wklej go ręcznie w koszyku, a następnie zaznacz własny wynik.
              Nie testujemy kuponów automatycznie, nie ingerujemy w koszyk ani nie zmieniamy ciasteczek.
              Własna ocena jest widoczna tylko w bieżącym panelu i nie jest publiczną oceną skuteczności kuponu.
            </p>
          </section>
        </div>
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Przejrzystość afiliacji:</strong> Trendzamniej może otrzymywać prowizję za niektóre zakupy dokonane
          po kliknięciu oznaczonych linków na stronie. Wtyczka nie podmienia linków afiliacyjnych ani kodów automatycznie.
          Włączaj Tryb dewelopera tylko dla kodu, którego źródłu ufasz.
        </div>
        <p className="mt-6 text-sm text-stone-600">
          <Link href="/polityka-prywatnosci" className="font-bold text-rose-700 hover:underline">Polityka prywatności</Link>
          {" · "}
          <Link href="/kontakt" className="font-bold text-rose-700 hover:underline">Kontakt</Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
