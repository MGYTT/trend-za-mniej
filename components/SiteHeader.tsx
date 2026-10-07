"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import BrandLogo from "@/components/BrandLogo";

const navigation = [
  {
    label: "Wszystkie okazje",
    href: "/okazje",
  },
  {
    label: "Kategorie",
    href: "/#kategorie",
  },
  {
    label: "Najnowsze",
    href: "/#najnowsze",
  },
  {
    label: "O nas",
    href: "/#o-nas",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <BrandLogo />

        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {navigation.map((item) => {
            const active =
              item.href === "/okazje" &&
              pathname === "/okazje";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "transition",
                  active
                    ? "text-rose-600"
                    : "text-stone-700 hover:text-rose-600",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/okazje"
            className="hidden rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
          >
            🔥 Okazje
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current
              )
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              menuOpen
                ? "Zamknij menu"
                : "Otwórz menu"
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-xl font-bold text-rose-700 transition hover:bg-rose-100 lg:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-rose-100 bg-white lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-600"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/afiliacja"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Informacja o afiliacji
            </Link>

            <Link
              href="/kontakt"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Kontakt
            </Link>

            <Link
              href="/okazje"
              onClick={closeMenu}
              className="mt-2 flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 font-black text-white shadow-sm"
            >
              🔥 Zobacz okazje
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}