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
  shortLabel: string;
  href: string;
  type:
    | "dashboard"
    | "add"
    | "stats";
};

const navigation: NavigationItem[] = [
  {
    label: "Panel",
    shortLabel: "Panel",
    href: "/admin",
    type: "dashboard",
  },
  {
    label: "Dodaj ofertę",
    shortLabel: "Dodaj",
    href: "/admin/nowa-oferta",
    type: "add",
  },
  {
    label: "Statystyki",
    shortLabel: "Statystyki",
    href: "/admin/statystyki",
    type: "stats",
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

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setMenuOpen(false);
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

  function isActive(
    item: NavigationItem
  ) {
    if (
      item.type ===
      "dashboard"
    ) {
      return (
        pathname ===
        "/admin"
      );
    }

    if (
      item.type === "add"
    ) {
      return (
        pathname ===
        "/admin/nowa-oferta"
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

    return false;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[62px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
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
            (item) => {
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
                    "relative flex min-h-10 items-center rounded-xl px-4 text-sm font-bold transition",
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50"
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

      <nav
        aria-label="Szybka nawigacja administratora"
        className="border-t border-stone-100 bg-white lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-1 px-3 py-1.5">
          {navigation.map(
            (item) => {
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
                    "flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-black transition sm:text-xs",
                    active
                      ? "bg-rose-50 text-rose-700"
                      : "text-stone-500 active:bg-stone-100",
                  ].join(
                    " "
                  )}
                >
                  <AdminNavIcon
                    type={
                      item.type
                    }
                  />

                  <span>
                    {
                      item.shortLabel
                    }
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </nav>

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
            className="absolute right-3 top-[58px] z-50 w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-[20px] border border-stone-200 bg-white p-2 shadow-xl sm:right-6"
          >
            <div className="px-3 py-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                Administrator
              </p>

              <p className="mt-1 text-sm font-bold text-stone-700">
                Zarządzanie Trend za
                Mniej
              </p>
            </div>

            <div className="border-t border-stone-100 pt-2">
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
                  Zobacz publiczną
                  stronę
                </span>

                <span>
                  ↗
                </span>
              </Link>

              <Link
                href="/admin"
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50 lg:hidden"
              >
                Panel główny
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

function AdminNavIcon({
  type,
}: {
  type:
    | "dashboard"
    | "add"
    | "stats";
}) {
  if (
    type ===
    "dashboard"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="2"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="2"
        />
      </svg>
    );
  }

  if (
    type === "add"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </svg>
  );
}