import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-5 py-16 text-center sm:px-6">
        <div className="w-full">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-rose-100 to-orange-100 text-4xl shadow-sm">
            🔎
          </div>

          <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-rose-600">
            Błąd 404
          </p>

          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Nie znaleźliśmy tej
            strony
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-500">
            Oferta mogła zostać
            ukryta, usunięta albo
            adres jest niepoprawny.
            Możesz wrócić do strony
            głównej lub przejrzeć
            aktualne okazje.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/okazje"
              className="flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Zobacz aktualne okazje
            </Link>

            <Link
              href="/"
              className="flex min-h-13 items-center justify-center rounded-2xl border border-stone-200 bg-white px-7 font-black text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
            >
              Wróć na stronę główną
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <QuickLink
              href="/okazje?category=Swetry"
              icon="🧥"
              label="Swetry"
            />

            <QuickLink
              href="/okazje?category=Bluzy"
              icon="🧶"
              label="Bluzy"
            />

            <QuickLink
              href="/okazje?maxPrice=100"
              icon="💸"
              label="Do 100 zł"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 font-bold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      <span>
        {icon}
      </span>

      <span>
        {label}
      </span>
    </Link>
  );
}