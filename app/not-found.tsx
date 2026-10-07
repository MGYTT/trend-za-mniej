import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <section className="mx-auto flex min-h-[62vh] max-w-4xl items-center justify-center px-5 py-14 text-center sm:px-6 sm:py-20">
        <div className="w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-500 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4" />
            </svg>
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-rose-600">
            Błąd 404
          </p>

          <h1 className="mx-auto mt-2 max-w-2xl text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Nie znaleźliśmy tej strony
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-7 text-stone-500 sm:text-base">
            Oferta mogła zostać
            ukryta lub usunięta albo
            adres jest niepoprawny.
            Możesz wrócić do katalogu
            i zobaczyć aktualne
            produkty.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/okazje"
              className="flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-black text-white shadow-sm transition hover:bg-rose-700"
            >
              Zobacz okazje
            </Link>

            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-6 font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Strona główna
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-2xl border-t border-stone-200 pt-7">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
              Możesz też sprawdzić
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <QuickLink
                href="/kategoria/swetry"
              >
                Swetry
              </QuickLink>

              <QuickLink
                href="/kategoria/bluzy"
              >
                Bluzy
              </QuickLink>

              <QuickLink
                href="/kategoria/topy"
              >
                Topy
              </QuickLink>

              <QuickLink
                href="/okazje?maxPrice=100"
              >
                Do 100 zł
              </QuickLink>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      {children}
    </Link>
  );
}