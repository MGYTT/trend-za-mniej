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

const navigation: NavigationItem[] = [
  {
    label: "Panel",
    href: "/admin",
    type: "dashboard",
  },

  {
    label: "Dodaj ofertę",
    href: "/admin/nowa-oferta",
    type: "add",
  },

  {
    label: "Social",
    href: "/admin/social",
    type: "social",
  },

  {
    label: "Statystyki",
    href: "/admin/statystyki",
    type: "stats",
  },

  {
    label: "Zespół",
    href: "/admin/zespol",
    type: "team",
  },
];

function getMobileTitle(
  pathname: string
) {
  if (
    pathname ===
    "/admin"
  ) {
    return "Trend Admin";
  }

  if (
    pathname ===
    "/admin/nowa-oferta"
  ) {
    return "Nowa oferta";
  }

  if (
    pathname.startsWith(
      "/admin/edytuj/"
    )
  ) {
    return "Edycja";
  }

  if (
    /^\/admin\/social\/[^/]+$/.test(
      pathname
    )
  ) {
    return "Social Studio";
  }

  if (
    pathname.startsWith(
      "/admin/social"
    )
  ) {
    return "Social";
  }

  if (
    pathname.startsWith(
      "/admin/statystyki"
    )
  ) {
    return "Statystyki";
  }

  if (
    pathname.startsWith(
      "/admin/zespol"
    )
  ) {
    return "Zespół";
  }

  return "Trend Admin";
}

function getBackHref(
  pathname: string
) {
  if (
    /^\/admin\/social\/[^/]+$/.test(
      pathname
    )
  ) {
    return "/admin/social";
  }

  return "/admin";
}

export default function AdminHeader() {
  const pathname =
    usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const mobileTitle =
    getMobileTitle(
      pathname
    );

  const showBack =
    pathname !==
    "/admin";

  useEffect(
    () => {
      setMenuOpen(false);
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
    },
    [
      menuOpen,
    ]
  );

  function isActive(
    item: NavigationItem
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
    <>
      <header className="admin-topbar">
        <div className="admin-mobile-topbar lg:hidden">
          <div className="flex w-[54px] items-center justify-start">
            {showBack ? (
              <Link
                href={
                  getBackHref(
                    pathname
                  )
                }
                prefetch
                aria-label="Wróć"
                className="admin-mobile-back"
              >
                <ChevronLeft />

                <span className="sr-only">
                  Wróć
                </span>
              </Link>
            ) : (
              <Link
                href="/admin"
                aria-label="Trend Admin"
                className="admin-mobile-brand"
              >
                T
              </Link>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-black tracking-[-0.025em] text-stone-950">
              {mobileTitle}
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.11em] text-stone-400">
              Trend za Mniej
            </p>
          </div>

          <div className="flex w-[54px] justify-end">
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
              aria-label="Konto administratora"
              className="admin-mobile-profile"
            >
              <ProfileIcon />
            </button>
          </div>
        </div>

        <div className="mx-auto hidden min-h-[62px] max-w-7xl items-center justify-between gap-3 px-6 lg:flex">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo
              href="/admin"
              compact
            />

            <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-stone-500">
              Admin
            </span>
          </div>

          <nav
            aria-label="Nawigacja administratora"
            className="flex items-center gap-1"
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
                    prefetch
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
                    ].join(" ")}
                  >
                    {item.label}

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
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
            >
              Strona ↗
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
              aria-label="Konto administratora"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-stone-100"
            >
              <ProfileIcon />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <AccountMenu
          onClose={() =>
            setMenuOpen(false)
          }
        />
      )}
    </>
  );
}

function AccountMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Zamknij menu"
        onClick={
          onClose
        }
        className="fixed inset-0 z-[90] bg-stone-950/25 backdrop-blur-[2px]"
      />

      <div className="admin-account-sheet">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300 lg:hidden" />

        <div className="flex items-center gap-3 px-4 pb-3 pt-4 lg:pt-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-stone-950 text-sm font-black text-white">
            T
          </span>

          <div>
            <p className="text-sm font-black text-stone-950">
              Trend Admin
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-stone-400">
              Panel administratora
            </p>
          </div>
        </div>

        <div className="border-t border-stone-100 p-2">
          <Link
            href="/admin/zespol"
            prefetch
            onClick={
              onClose
            }
            className="admin-account-row"
          >
            Zespół i role

            <span>
              ›
            </span>
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={
              onClose
            }
            className="admin-account-row"
          >
            Strona publiczna

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
              className="admin-account-row w-full text-red-600"
            >
              Wyloguj

              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[19px] w-[19px]"
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
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}