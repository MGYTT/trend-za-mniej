"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = "home" | "outfits" | "guides" | "offers";
type TabItem = { type: Tab; label: string; href: string };

const TABS: TabItem[] = [
  { type: "home", label: "Start", href: "/" },
  { type: "outfits", label: "Stylizacje", href: "/stylizacje" },
  { type: "guides", label: "Poradniki", href: "/poradniki" },
  { type: "offers", label: "Produkty", href: "/okazje" },
];

function activeTab(pathname: string, type: Tab) {
  if (type === "home") return pathname === "/";
  if (type === "outfits") return pathname === "/stylizacje" || pathname.startsWith("/stylizacje/");
  if (type === "guides") return pathname === "/poradniki" || pathname.startsWith("/poradniki/");
  return pathname === "/okazje" || pathname.startsWith("/kategoria/") || pathname === "/kategorie" || pathname.startsWith("/kategorie/");
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  // Na stronie produktu osobny przycisk prowadzi do SHEIN.
  const visible =
    pathname === "/" ||
    pathname === "/okazje" ||
    pathname === "/stylizacje" || pathname.startsWith("/stylizacje/") ||
    pathname === "/poradniki" || pathname.startsWith("/poradniki/") ||
    pathname === "/tiktok" || pathname === "/promocje-shein" ||
    pathname === "/kategorie" || pathname.startsWith("/kategoria/");

  useEffect(() => {
    document.body.classList.toggle("has-mobile-bottom-nav", visible);
    return () => document.body.classList.remove("has-mobile-bottom-nav");
  }, [visible]);

  if (!visible) return null;

  return (
    <nav aria-label="Szybka nawigacja mobilna"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 shadow-[0_-6px_24px_rgba(28,25,23,0.09)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2.5 pt-1.5"
        style={{ paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))" }}>
        {TABS.map((item) => {
          const active = activeTab(pathname, item.type);
          return (
            <Link key={item.type} href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${active ? "bg-rose-50 text-rose-700" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}>
              <TabIcon type={item.type} />
              <span className="truncate text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ type }: { type: Tab }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="h-[22px] w-[22px] shrink-0">
      {type === "home" && <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>}
      {type === "outfits" && <path d="m7 3 5 2 5-2 4 4-3 4-2-1v11H8V10l-2 1-3-4 4-4Z" />}
      {type === "guides" && <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 6v12M7 8h3M14 8h3M7 12h3M14 12h3" /></>}
      {type === "offers" && <><rect x="4" y="6" width="16" height="15" rx="2" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>}
    </svg>
  );
}
