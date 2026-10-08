"use client";

import Link from "next/link";

import {
  useEffect,
} from "react";

import {
  usePathname,
} from "next/navigation";

type NavigationItem = {
  label: string;

  href: string;

  type:
    | "home"
    | "offers"
    | "promotions"
    | "categories";
};

const navigation:
  NavigationItem[] = [
  {
    label:
      "Start",

    href:
      "/",

    type:
      "home",
  },

  {
    label:
      "Produkty",

    href:
      "/okazje",

    type:
      "offers",
  },

  {
    label:
      "Promocje",

    href:
      "/promocje-shein",

    type:
      "promotions",
  },

  {
    label:
      "Kategorie",

    href:
      "/kategorie",

    type:
      "categories",
  },
];

export default function MobileBottomNav() {
  const pathname =
    usePathname();

  const visible =
    pathname ===
      "/" ||
    pathname ===
      "/okazje" ||
    pathname ===
      "/promocje-shein" ||
    pathname ===
      "/kategorie" ||
    pathname.startsWith(
      "/kategoria/"
    );

  useEffect(() => {
    if (
      !visible
    ) {
      document.body.classList.remove(
        "has-mobile-bottom-nav"
      );

      return;
    }

    document.body.classList.add(
      "has-mobile-bottom-nav"
    );

    return () => {
      document.body.classList.remove(
        "has-mobile-bottom-nav"
      );
    };
  }, [
    visible,
  ]);

  if (
    !visible
  ) {
    return null;
  }

  function isActive(
    item:
      NavigationItem
  ) {
    if (
      item.type ===
      "home"
    ) {
      return (
        pathname ===
        "/"
      );
    }

    if (
      item.type ===
      "offers"
    ) {
      return (
        pathname ===
        "/okazje"
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

    return (
      pathname ===
        "/kategorie" ||
      pathname.startsWith(
        "/kategoria/"
      )
    );
  }

  return (
    <nav
      aria-label="Nawigacja mobilna"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/97 shadow-[0_-5px_20px_rgba(28,25,23,0.07)] backdrop-blur-xl lg:hidden"
    >
      <div
        className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1.5"
        style={{
          paddingBottom:
            "max(0.5rem, env(safe-area-inset-bottom))",
        }}
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
                  "group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1",
                  "text-[9px] font-black transition sm:text-[10px]",
                  active
                    ? "text-rose-700"
                    : "text-stone-400 active:bg-stone-50",
                ].join(
                  " "
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-[3px] w-8 rounded-full bg-rose-600"
                  />
                )}

                <span
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-lg transition",
                    active
                      ? "bg-rose-50 text-rose-600"
                      : "text-stone-400",
                  ].join(
                    " "
                  )}
                >
                  <NavigationIcon
                    type={
                      item.type
                    }
                  />
                </span>

                <span>
                  {
                    item.label
                  }
                </span>
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}

function NavigationIcon({
  type,
}: {
  type:
    | "home"
    | "offers"
    | "promotions"
    | "categories";
}) {
  if (
    type ===
    "home"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[21px] w-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 11 9-8 9 8" />

        <path d="M5 10v10h14V10" />

        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (
    type ===
    "offers"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[21px] w-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l1 12H5L6 8Z" />

        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (
    type ===
    "promotions"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[21px] w-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12 12 20 4 12l8-8Z" />

        <circle
          cx="9"
          cy="9"
          r="1"
        />

        <circle
          cx="15"
          cy="15"
          r="1"
        />

        <path d="m15 9-6 6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[21px] w-[21px]"
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