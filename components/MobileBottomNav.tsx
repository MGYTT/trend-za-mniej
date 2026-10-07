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
    | "categories";
};

const navigation: NavigationItem[] = [
  {
    label: "Start",
    href: "/",
    type: "home",
  },
  {
    label: "Okazje",
    href: "/okazje",
    type: "offers",
  },
  {
    label: "Kategorie",
    href: "/#kategorie",
    type: "categories",
  },
];

export default function MobileBottomNav() {
  const pathname =
    usePathname();

  const [
    currentHash,
    setCurrentHash,
  ] = useState("");

  const visible =
    pathname === "/" ||
    pathname === "/okazje";

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
  }, [pathname]);

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
  }, [visible]);

  if (!visible) {
    return null;
  }

  function isActive(
    item: NavigationItem
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
      "categories"
    ) {
      return (
        pathname === "/" &&
        currentHash ===
          "#kategorie"
      );
    }

    return (
      pathname === "/" &&
      currentHash !==
        "#kategorie"
    );
  }

  return (
    <nav
      aria-label="Nawigacja mobilna"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/80 bg-white/95 shadow-[0_-8px_30px_rgba(28,25,23,0.08)] backdrop-blur-xl lg:hidden"
    >
      <div
        className="mx-auto grid max-w-lg grid-cols-3 px-2 pt-2"
        style={{
          paddingBottom:
            "max(0.5rem, env(safe-area-inset-bottom))",
        }}
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
                  "group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5",
                  "text-[11px] font-bold transition",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100",
                  active
                    ? "bg-rose-50 text-rose-700"
                    : "text-stone-500 active:bg-stone-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-xl transition",
                    active
                      ? "text-rose-600"
                      : "text-stone-500",
                  ].join(" ")}
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
    | "categories";
}) {
  if (
    type === "home"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6"
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
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2h9l5 5-9 9-7-7V2Z" />

        <path d="M9 6h.01" />

        <path d="m14 11 4 4" />

        <path d="m18 11-4 4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
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