
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab =
  | "home"
  | "offers"
  | "tiktok"
  | "promotions"
  | "categories";

type TabItem = {
  type: Tab;
  label: string;
  href: string;
};

const TABS: TabItem[] = [
  {
    type: "home",
    label: "Start",
    href: "/",
  },
  {
    type: "offers",
    label: "Produkty",
    href: "/okazje",
  },
  {
    type: "tiktok",
    label: "TikTok",
    href: "/tiktok",
  },
  {
    type: "promotions",
    label: "Promocje",
    href: "/promocje-shein",
  },
  {
    type: "categories",
    label: "Kategorie",
    href: "/kategorie",
  },
];

function activeTab(
  pathname: string,
  type: Tab
) {
  if (type === "home") {
    return pathname === "/";
  }

  if (type === "offers") {
    return pathname === "/okazje";
  }

  if (type === "tiktok") {
    return pathname === "/tiktok";
  }

  if (type === "promotions") {
    return pathname === "/promocje-shein";
  }

  return (
    pathname === "/kategorie" ||
    pathname.startsWith("/kategoria/")
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  /*
   * Na stronie produktu działa osobny
   * dolny przycisk przejścia do SHEIN.
   */

  const visible =
    pathname === "/" ||
    pathname === "/okazje" ||
    pathname === "/tiktok" ||
    pathname === "/promocje-shein" ||
    pathname === "/kategorie" ||
    pathname.startsWith("/kategoria/");

  /*
   * Istniejący globals.css dodaje
   * odstęp pod stroną, gdy dolny
   * pasek jest widoczny.
   */

  useEffect(() => {
    document.body.classList.toggle(
      "has-mobile-bottom-nav",
      visible
    );

    return () =>
      document.body.classList.remove(
        "has-mobile-bottom-nav"
      );
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <nav
      aria-label="Szybka nawigacja mobilna"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 shadow-[0_-6px_24px_rgba(28,25,23,0.09)] backdrop-blur-xl lg:hidden"
    >
      <div
        className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1.5 pt-1.5"
        style={{
          paddingBottom:
            "max(0.45rem, env(safe-area-inset-bottom))",
        }}
      >
        {TABS.map((item) => {
          const active = activeTab(
            pathname,
            item.type
          );

          return (
            <Link
              key={item.type}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={`group flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                active
                  ? "bg-rose-50 text-rose-700"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <TabIcon type={item.type} />

              <span className="truncate text-center leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* IKONY NAWIGACJI */

function TabIcon({
  type,
}: {
  type: Tab;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[22px] w-[22px] shrink-0"
    >
      {type === "home" && (
        <>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9M9 20v-6h6v6" />
        </>
      )}

      {type === "offers" && (
        <>
          <rect
            x="4"
            y="6"
            width="16"
            height="15"
            rx="2"
          />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </>
      )}

      {type === "tiktok" && (
        <>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
          />
          <path d="m10 9 5 3-5 3V9Z" />
        </>
      )}

      {type === "promotions" && (
        <>
          <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8Z" />
          <path d="M12 6v12M9 10h.01M15 14h.01" />
        </>
      )}

      {type === "categories" && (
        <>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
        </>
      )}
    </svg>
  );
}
