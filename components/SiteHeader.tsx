"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import BrandLogo from "@/components/BrandLogo";
import MobileBottomNav from "@/components/MobileBottomNav";

type NavigationItem = {
  label: string;

  description: string;

  href: string;

  type:
    | "offers"
    | "promotions"
    | "categories"
    | "about";
};

const navigation:
  NavigationItem[] = [
  {
    label:
      "Produkty",

    description:
      "Przeglądaj wszystkie okazje",

    href:
      "/okazje",

    type:
      "offers",
  },

  {
    label:
      "Promocje SHEIN",

    description:
      "Kupony, kody i kampanie",

    href:
      "/promocje-shein",

    type:
      "promotions",
  },

  {
    label:
      "Kategorie",

    description:
      "Przeglądaj wszystkie kategorie",

    href:
      "/kategorie",

    type:
      "categories",
  },

  {
    label:
      "O nas",

    description:
      "Jak działa Trend za Mniej",

    href:
      "/o-nas",

    type:
      "about",
  },
];

export default function SiteHeader() {
  const pathname =
    usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(
      false
    );

  useEffect(() => {
    setMenuOpen(
      false
    );
  }, [
    pathname,
  ]);

  useEffect(() => {
    if (
      !menuOpen
    ) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setMenuOpen(
          false
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    menuOpen,
  ]);

  function isActive(
    item:
      NavigationItem
  ) {
    if (
      item.type ===
      "offers"
    ) {
      return (
        pathname ===
          "/okazje" ||
        pathname.startsWith(
          "/produkt/"
        )
      );
    }

    if (
      item.type ===
      "promotions"
    ) {
      return (
        pathname ===
        "/promocje-shein"
      );
    }

    if (
      item.type ===
      "categories"
    ) {
      return (
        pathname ===
          "/kategorie" ||
        pathname.startsWith(
          "/kategoria/"
        )
      );
    }

    if (
      item.type ===
      "about"
    ) {
      return (
        pathname ===
        "/o-nas"
      );
    }

    return false;
  }

  function closeMenu() {
    setMenuOpen(
      false
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandLogo
            compact
          />

          <nav
            aria-label="Główna nawigacja"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigation.map(
              (
                item
              ) => {
                const active =
                  isActive(
                    item
                  );

                return (
                  <Link
                    key={
                      item.type
                    }
                    href={
                      item.href
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={[
                      "relative flex min-h-10 items-center rounded-xl px-3.5 text-sm font-bold transition",
                      active
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                    ].join(
                      " "
                    )}
                  >
                    {
                      item.label
                    }

                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-rose-600"
                      />
                    )}
                  </Link>
                );
              }
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/okazje"
              className="hidden min-h-10 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 sm:inline-flex"
            >
              Znajdź produkt
            </Link>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-expanded={
                menuOpen
              }
              aria-controls="mobile-navigation"
              aria-label={
                menuOpen
                  ? "Zamknij menu"
                  : "Otwórz menu"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50 lg:hidden"
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6l12 12" />

                  <path d="M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 7h16" />

                  <path d="M4 12h16" />

                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Zamknij menu"
              onClick={
                closeMenu
              }
              className="fixed inset-0 top-[64px] z-40 bg-stone-950/20 backdrop-blur-[2px] lg:hidden"
            />

            <div
              id="mobile-navigation"
              className="absolute inset-x-0 top-full z-50 border-t border-stone-100 bg-white shadow-xl lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                <div className="mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                    Gdzie chcesz
                    przejść?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-stone-400">
                    Wybierz to,
                    czego teraz
                    szukasz.
                  </p>
                </div>

                <nav
                  aria-label="Menu mobilne"
                  className="grid gap-2"
                >
                  {navigation.map(
                    (
                      item
                    ) => {
                      const active =
                        isActive(
                          item
                        );

                      return (
                        <Link
                          key={
                            item.type
                          }
                          href={
                            item.href
                          }
                          onClick={
                            closeMenu
                          }
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                          className={[
                            "flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                            active
                              ? "border-rose-100 bg-rose-50"
                              : "border-stone-100 bg-stone-50 hover:border-rose-100 hover:bg-rose-50",
                          ].join(
                            " "
                          )}
                        >
                          <div className="min-w-0">
                            <p
                              className={[
                                "text-sm font-black",
                                active
                                  ? "text-rose-700"
                                  : "text-stone-800",
                              ].join(
                                " "
                              )}
                            >
                              {
                                item.label
                              }
                            </p>

                            <p className="mt-0.5 truncate text-[10px] leading-5 text-stone-400">
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className={[
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm",
                              active
                                ? "text-rose-600"
                                : "text-stone-400",
                            ].join(
                              " "
                            )}
                          >
                            →
                          </span>
                        </Link>
                      );
                    }
                  )}
                </nav>

                <div className="mt-4 border-t border-stone-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400">
                    Szybkie przejścia
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link
                      href="/okazje?maxPrice=50"
                      onClick={
                        closeMenu
                      }
                      className="flex min-h-11 items-center justify-center rounded-xl bg-stone-50 px-3 text-center text-xs font-black text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      💸 Do 50 zł
                    </Link>

                    <Link
                      href="/okazje?sort=newest"
                      onClick={
                        closeMenu
                      }
                      className="flex min-h-11 items-center justify-center rounded-xl bg-stone-50 px-3 text-center text-xs font-black text-stone-600 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      🆕 Najnowsze
                    </Link>

                    <Link
                      href="/afiliacja"
                      onClick={
                        closeMenu
                      }
                      className="flex min-h-11 items-center justify-center rounded-xl bg-stone-50 px-3 text-center text-xs font-bold text-stone-500 transition hover:bg-stone-100"
                    >
                      Afiliacja
                    </Link>

                    <Link
                      href="/kontakt"
                      onClick={
                        closeMenu
                      }
                      className="flex min-h-11 items-center justify-center rounded-xl bg-stone-50 px-3 text-center text-xs font-bold text-stone-500 transition hover:bg-stone-100"
                    >
                      Kontakt
                    </Link>
                  </div>
                </div>

                <Link
                  href="/promocje-shein"
                  onClick={
                    closeMenu
                  }
                  className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  <span
                    aria-hidden="true"
                  >
                    🔥
                  </span>

                  Zobacz promocje
                  SHEIN
                </Link>

                <p className="mt-3 text-center text-[9px] leading-5 text-stone-400">
                  Produkty,
                  promocje
                  i kody zebrane
                  w jednym miejscu.
                </p>
              </div>
            </div>
          </>
        )}
      </header>

      <MobileBottomNav />
    </>
  );
}