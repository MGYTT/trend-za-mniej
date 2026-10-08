"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
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
      "Okazje",

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
      "/#kategorie",

    type:
      "categories",
  },
];

export default function MobileBottomNav() {
  const pathname =
    usePathname();

  const [
    currentHash,
    setCurrentHash,
  ] =
    useState("");

  const visible =
    pathname ===
      "/" ||
    pathname ===
      "/okazje" ||
    pathname ===
      "/promocje-shein" ||
    pathname.startsWith(
      "/kategoria/"
    ) ||
    pathname ===
      "/o-nas";

  useEffect(() => {
    function updateHash() {
      setCurrentHash(
        window.location.hash
      );
    }

    updateHash();

    window.addEventListener(
      "hashchange",
      updateHash
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        updateHash
      );
    };
  }, [
    pathname,
  ]);

  useEffect(() => {
    if (!visible) {
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

  if (!visible) {
    return null;
  }

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

    if (
      item.type ===
      "categories"
    ) {
      return (
        pathname.startsWith(
          "/kategoria/"
        ) ||
        (
          pathname ===
            "/" &&
          currentHash ===
            "#kategorie"
        )
      );
    }

    return (
      pathname ===
        "/" &&
      currentHash !==
        "#kategorie"
    );
  }

  return (
    <nav
      aria-label="Nawigacja mobilna"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/97 shadow-[0_-5px_20px_rgba(28,25,23,0.06)] backdrop-blur-xl lg:hidden"
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
                onClick={() => {
                  if (
                    item.type !==
                    "categories"
                  ) {
                    setCurrentHash(
                      ""
                    );
                  }
                }}
                className={[
                  "group relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1",
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
                    "flex h-7 w-7 items-center justify-center transition",
                    active
                      ? "text-rose-600"
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
        className="h-[22px] w-[22px]"
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
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />

        <path d="M2 7h20" />

        <path d="M5 3h14l3 4H2l3-4Z" />

        <path d="M12 7v14" />
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
        className="h-[22px] w-[22px]"
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
      className="h-[22px] w-[22px]"
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