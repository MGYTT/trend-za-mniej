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

const navigation = [
  {
    label: "Panel",
    href: "/admin",
  },
  {
    label: "Dodaj ofertę",
    href: "/admin/nowa-oferta",
  },
  {
    label: "Statystyki",
    href: "/admin/statystyki",
  },
];

export default function AdminHeader() {
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

    const oldOverflow =
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
        oldOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  function isActive(
    href: string
  ) {
    if (
      href === "/admin"
    ) {
      return (
        pathname ===
        "/admin"
      );
    }

    return pathname.startsWith(
      href
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:min-h-[76px] sm:px-6">
        <div className="min-w-0">
          <BrandLogo
            href="/admin"
            compact
          />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map(
            (item) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={[
                  "rounded-full px-4 py-2.5 text-sm font-bold transition",
                  isActive(
                    item.href
                  )
                    ? "bg-rose-50 text-rose-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-rose-600",
                ].join(" ")}
              >
                {
                  item.label
                }
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 transition hover:border-rose-200 hover:text-rose-700 sm:inline-flex"
          >
            Zobacz stronę
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current
              )
            }
            aria-expanded={
              menuOpen
            }
            aria-controls="admin-mobile-menu"
            aria-label={
              menuOpen
                ? "Zamknij menu administratora"
                : "Otwórz menu administratora"
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100 lg:hidden"
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
            onClick={() =>
              setMenuOpen(
                false
              )
            }
            className="fixed inset-0 top-[68px] z-40 bg-stone-950/25 backdrop-blur-[2px] sm:top-[76px] lg:hidden"
          />

          <div
            id="admin-mobile-menu"
            className="absolute left-0 right-0 top-full z-50 border-t border-stone-100 bg-white p-4 shadow-xl lg:hidden"
          >
            <nav className="mx-auto grid max-w-7xl gap-2">
              {navigation.map(
                (item) => (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={[
                      "flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 font-bold transition",
                      isActive(
                        item.href
                      )
                        ? "bg-rose-50 text-rose-700"
                        : "text-stone-700 hover:bg-stone-50",
                    ].join(" ")}
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
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 font-semibold text-stone-600 hover:bg-stone-50"
              >
                <span>
                  Zobacz stronę
                </span>

                <span>
                  ↗
                </span>
              </Link>

              <form
                action="/auth/signout"
                method="post"
              >
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center rounded-2xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Wyloguj
                </button>
              </form>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}