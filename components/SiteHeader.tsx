
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/BrandLogo";
import MobileBottomNav from "@/components/MobileBottomNav";

type MenuItem = {
  label: string;
  description: string;
  href: string;
};

// Cztery główne decyzje zakupowe; pozostałe miejsca w sekcji pomocniczej.
const MENU: MenuItem[] = [
  { label: "Stylizacje", description: "Gotowe zestawy w budżecie", href: "/stylizacje" },
  { label: "Poradniki", description: "Jak wybrać ubiór?", href: "/poradniki" },
  { label: "Produkty", description: "Przeglądaj wszystkie oferty", href: "/okazje" },
  { label: "Promocje", description: "Kody i kampanie SHEIN", href: "/promocje-shein" },
];

const EXTRA_MENU: MenuItem[] = [
  { label: "Kody rabatowe", description: "Promocje wielu sklepów", href: "/kody-rabatowe" },
  { label: "Kategorie", description: "Przeglądaj produkty według działu", href: "/kategorie" },
  { label: "Z TikToka", description: "Rzeczy z naszych filmów", href: "/tiktok" },
  { label: "O nas", description: "Poznaj Trend za Mniej", href: "/o-nas" },
  { label: "Kontakt", description: "Napisz do nas", href: "/kontakt" },
];

function activeLink(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/okazje") {
    return (
      pathname === "/okazje" ||
      pathname.startsWith("/produkt/")
    );
  }

  if (href === "/stylizacje" || href === "/poradniki") {
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (href === "/kategorie") {
    return (
      pathname === "/kategorie" ||
      pathname.startsWith("/kategoria/")
    );
  }

  return pathname === href;
}

export default function SiteHeader() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuButtonRef =
    useRef<HTMLButtonElement>(null);

  const firstMenuLinkRef =
    useRef<HTMLAnchorElement>(null);

  // Zamknij menu po zmianie podstrony.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Blokada przewijania i obsługa klawiatury.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    firstMenuLinkRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    const desktop = window.matchMedia(
      "(min-width: 1024px)"
    );

    function onDesktopChange() {
      if (desktop.matches) {
        setMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    desktop.addEventListener(
      "change",
      onDesktopChange
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      desktop.removeEventListener(
        "change",
        onDesktopChange
      );
    };
  }, [menuOpen]);

  function closeMenu(restoreFocus = false) {
    setMenuOpen(false);

    if (restoreFocus) {
      menuButtonRef.current?.focus();
    }
  }

  return (
    <>
      {/* GÓRNY NAGŁÓWEK */}

      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-5 sm:px-6">
          <div className="min-w-0 shrink-0">
            <BrandLogo compact />
          </div>

          {/* MENU KOMPUTEROWE */}

          <nav
            aria-label="Nawigacja główna"
            className="hidden items-center gap-0.5 lg:flex"
          >
            {MENU.map((item) => {
              const active = activeLink(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`inline-flex min-h-10 items-center rounded-xl px-3 text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                    active
                      ? "bg-rose-50 text-rose-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* PRZYCISKI PO PRAWEJ */}

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/okazje"
              aria-label="Szukaj produktów"
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-rose-50 hover:text-rose-700 min-[360px]:inline-flex"
            >
              <SearchIcon />
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() =>
                setMenuOpen(
                  (open) => !open
                )
              }
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              aria-label={
                menuOpen
                  ? "Zamknij menu"
                  : "Otwórz menu"
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 lg:hidden"
            >
              {menuOpen ? (
                <CloseIcon />
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* PRZYCIEMNIENIE TŁA */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Zamknij menu"
          onClick={() => closeMenu(true)}
          className="fixed inset-x-0 bottom-0 top-16 z-[55] bg-stone-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* WYSUWANE MENU MOBILNE */}

      <div
        id="site-mobile-menu"
        className={`${
          menuOpen ? "block" : "hidden"
        } fixed inset-x-0 top-16 z-[60] max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain rounded-b-[26px] border-b border-stone-200 bg-white shadow-[0_20px_55px_rgba(28,25,23,0.18)] lg:hidden`}
      >
        <div className="mx-auto max-w-lg px-4 pb-6 pt-5 sm:px-6">
          {/* WYSZUKIWARKA W MENU */}

          <form
            action="/okazje"
            method="get"
            role="search"
            className="flex gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1.5"
          >
            <label
              htmlFor="menu-product-search"
              className="sr-only"
            >
              Szukaj produktu
            </label>

            <input
              id="menu-product-search"
              name="q"
              type="search"
              maxLength={120}
              placeholder="Czego szukasz?"
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-stone-900 outline-none placeholder:text-stone-400"
            />

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white hover:bg-rose-700"
            >
              Szukaj
            </button>
          </form>

          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.12em] text-rose-700">
            Odkrywaj
          </p>

          {/* LINKI MENU */}

          <nav
            aria-label="Menu mobilne"
            className="mt-2 grid grid-cols-2 gap-2"
          >
            {MENU.map((item, index) => {
              const active = activeLink(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  ref={
                    index === 0
                      ? firstMenuLinkRef
                      : undefined
                  }
                  href={item.href}
                  onClick={() =>
                    closeMenu()
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`flex min-h-[76px] min-w-0 flex-col justify-center rounded-2xl border p-3 transition ${
                    active
                      ? "border-rose-200 bg-rose-50"
                      : "border-stone-200 bg-white hover:border-rose-200 hover:bg-stone-50"
                  }`}
                >
                  <span
                    className={`text-sm font-black ${
                      active
                        ? "text-rose-700"
                        : "text-stone-900"
                    }`}
                  >
                    {item.label}
                  </span>

                  <span className="mt-1 line-clamp-2 text-[11px] leading-4 text-stone-500">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Nie mieszaj skrótów zakupowych z nawigacją główną. */}
          <nav aria-label="Pozostałe sekcje" className="mt-5 border-t border-stone-100 pt-4">
            <p className="text-xs font-black uppercase tracking-wide text-stone-500">Pozostałe</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {EXTRA_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeMenu()}
                  aria-current={activeLink(pathname, item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-rose-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}

/* IKONY */

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
