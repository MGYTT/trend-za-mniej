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

type NavigationItem = {
  label: string;
  href: string;

  type:
    | "dashboard"
    | "add"
    | "social"
    | "stats"
    | "team";
};

const navigation:
  NavigationItem[] = [
  {
    label:
      "Panel",

    href:
      "/admin",

    type:
      "dashboard",
  },

  {
    label:
      "Dodaj ofertę",

    href:
      "/admin/nowa-oferta",

    type:
      "add",
  },

  {
    label:
      "Social",

    href:
      "/admin/social",

    type:
      "social",
  },

  {
    label:
      "Statystyki",

    href:
      "/admin/statystyki",

    type:
      "stats",
  },

  {
    label:
      "Zespół",

    href:
      "/admin/zespol",

    type:
      "team",
  },
];

export default function AdminHeader() {
  const pathname =
    usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      setMenuOpen(
        false
      );
    },
    [
      pathname,
    ]
  );

  useEffect(
    () => {
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
    },
    [
      menuOpen,
    ]
  );

  function isActive(
    item:
      NavigationItem
  ) {
    if (
      item.type ===
      "dashboard"
    ) {
      return pathname ===
        "/admin";
    }

    if (
      item.type ===
      "add"
    ) {
      return pathname ===
        "/admin/nowa-oferta";
    }

    if (
      item.type ===
      "social"
    ) {
      return pathname.startsWith(
        "/admin/social"
      );
    }

    if (
      item.type ===
      "stats"
    ) {
      return pathname.startsWith(
        "/admin/statystyki"
      );
    }

    if (
      item.type ===
      "team"
    ) {
      return pathname.startsWith(
        "/admin/zespol"
      );
    }

    return false;
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/92 backdrop-blur-2xl"
      style={{
        paddingTop:
          "env(safe-area-inset-top)",
      }}
    >
      <div className="mx-auto flex min-h-[58px] max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[62px] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            href="/admin"
            compact
          />

          <span className="hidden rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-stone-500 sm:inline-flex">
            Admin
          </span>
        </div>

        <nav
          aria-label="Nawigacja administratora"
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
                      ? "bg-stone-100 text-stone-950"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-950",
                  ].join(
                    " "
                  )}
                >
                  {
                    item.label
                  }

                  {active && (
                    <span className="absolute inset-x-4 -bottom-[12px] h-0.5 rounded-full bg-rose-600" />
                  )}
                </Link>
              );
            }
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700 md:inline-flex"
          >
            Strona ↗
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
            aria-controls="admin-account-menu"
            aria-label={
              menuOpen
                ? "Zamknij menu"
                : "Otwórz menu"
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 transition active:scale-95 hover:bg-stone-100"
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
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3"
                />

                <path d="M5 21a7 7 0 0 1 14 0" />
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
            className="fixed inset-0 z-40 bg-stone-950/20 backdrop-blur-[2px]"
          />

          <div
            id="admin-account-menu"
            className="absolute right-3 z-50 w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-[22px] border border-stone-200 bg-white p-2 shadow-xl sm:right-6"
            style={{
              top:
                "calc(58px + env(safe-area-inset-top))",
            }}
          >
            <div className="px-3 py-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                Administrator
              </p>

              <p className="mt-1 text-sm font-bold text-stone-700">
                Trend za Mniej
              </p>
            </div>

            <div className="border-t border-stone-100 pt-2">
              <Link
                href="/admin/social"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50 lg:hidden"
              >
                <span>
                  Social Media
                </span>

                <span>
                  →
                </span>
              </Link>

              <Link
                href="/admin/zespol"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50"
              >
                <span>
                  Zespół i role
                </span>

                <span>
                  →
                </span>
              </Link>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50"
              >
                <span>
                  Strona publiczna
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
                  className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
                >
                  Wyloguj
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
}