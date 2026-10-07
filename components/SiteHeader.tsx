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

const navigation = [
  {
    label: "Okazje",
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
  const pathname =
    usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
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
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="relative">
          <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:min-h-[76px] sm:px-6">
            <BrandLogo
              compact
            />

            <nav
              aria-label="Główna nawigacja"
              className="hidden items-center gap-1 lg:flex"
            >
              {navigation.map(
                (item) => {
                  const active =
                    item.href ===
                      "/okazje" &&
                    pathname ===
                      "/okazje";

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      className={[
                        "rounded-full px-4 py-2.5 text-sm font-bold transition",
                        active
                          ? "bg-rose-50 text-rose-700"
                          : "text-stone-600 hover:bg-stone-50 hover:text-rose-600",
                      ].join(
                        " "
                      )}
                    >
                      {
                        item.label
                      }
                    </Link>
                  );
                }
              )}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/okazje"
                className="hidden min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
              >
                Znajdź okazję
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
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 lg:hidden"
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
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-6 w-6"
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
                className="fixed inset-0 top-[68px] z-40 bg-stone-950/25 backdrop-blur-[2px] sm:top-[76px] lg:hidden"
              />

              <div
                id="mobile-navigation"
                className="absolute left-0 right-0 top-full z-50 border-t border-rose-100 bg-white p-4 shadow-xl lg:hidden"
              >
                <nav
                  aria-label="Menu mobilne"
                  className="mx-auto grid max-w-7xl gap-2"
                >
                  {navigation.map(
                    (item) => (
                      <Link
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        onClick={
                          closeMenu
                        }
                        className="flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 font-bold text-stone-700 transition hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100"
                      >
                        <span>
                          {
                            item.label
                          }
                        </span>

                        <span
                          aria-hidden="true"
                          className="text-stone-300"
                        >
                          →
                        </span>
                      </Link>
                    )
                  )}

                  <div className="my-1 border-t border-stone-100" />

                  <Link
                    href="/afiliacja"
                    onClick={
                      closeMenu
                    }
                    className="flex min-h-12 items-center rounded-2xl px-4 py-3 font-semibold text-stone-600 transition hover:bg-stone-50 active:bg-stone-100"
                  >
                    Informacja o
                    afiliacji
                  </Link>

                  <Link
                    href="/kontakt"
                    onClick={
                      closeMenu
                    }
                    className="flex min-h-12 items-center rounded-2xl px-4 py-3 font-semibold text-stone-600 transition hover:bg-stone-50 active:bg-stone-100"
                  >
                    Kontakt
                  </Link>

                  <Link
                    href="/okazje"
                    onClick={
                      closeMenu
                    }
                    className="mt-2 flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 font-black text-white shadow-sm"
                  >
                    Zobacz wszystkie
                    okazje
                  </Link>
                </nav>
              </div>
            </>
          )}
        </div>
      </header>

      <MobileBottomNav />
    </>
  );
}