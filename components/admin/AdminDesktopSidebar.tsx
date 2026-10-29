"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { label: string; href: string; path: string };
const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "01 · Sterowanie",
    items: [
      { label: "Centrum Autopilota", href: "/admin/autopilot", path: "M3 12h3l2-6 4 12 2-6h7M3 3h18v18H3z" },
      { label: "Pulpit i katalog", href: "/admin", path: "M3 3h8v8H3zM13 3h8v5h-8zM3 13h8v8H3zM13 10h8v11h-8z" },
      { label: "Terminy promocji", href: "/admin/terminy-promocji", path: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM8 14h3M8 18h3M14 14h3" },
    ],
  },
  {
    title: "02 · Katalog i publikacja",
    items: [
      { label: "Wszystkie oferty", href: "/admin#admin-offers", path: "M4 5h16v14H4zM8 9h8M8 13h8M8 17h5" },
      { label: "Dodaj ofertę", href: "/admin/nowa-oferta", path: "M4 4h16v16H4zM12 7v10M7 12h10" },
      { label: "Kreator stylizacji", href: "/admin/stylizacje", path: "m8 4-2 5-3 2 2 9h14l2-9-3-2-2-5H8ZM8 4v4l4 2 4-2V4M8 15h8" },
      { label: "Promocje SHEIN", href: "/admin/promocje-shein", path: "M3 8V4h18v4M5 8h14v12H5zM9 12h6M9 16h4" },
      { label: "Kody wielu sklepów", href: "/admin/kody-rabatowe", path: "M3 8V4h18v4M5 8h14v12H5zM9 12h6M9 16h4" },
    ],
  },
  {
    title: "03 · Marketing",
    items: [
      { label: "Oferta powitalna SHEIN", href: "/admin/oferta-powitalna", path: "M12 3 2 8l10 6 10-6-10-5ZM4 10v9h16v-9M12 14v5" },
      { label: "Social Media", href: "/admin/social", path: "M7 2h10v20H7zM10 5h4M11 19h2" },
      { label: "TikTok", href: "/admin/tiktok", path: "M4 5h16v14H4zM10 9l6 3-6 3z" },
    ],
  },
  {
    title: "04 · Wyniki i jakość",
    items: [
      { label: "Skuteczność kanałów", href: "/admin/skutecznosc", path: "M3 18l6-6 4 3 8-9M3 6v4M3 18v3M9 12v9M15 15v6M21 6v15" },
      { label: "Statystyki", href: "/admin/statystyki", path: "M3 21V12M9 21V5M15 21v-9M21 21H2" },
      { label: "Kontrola SEO", href: "/admin/seo", path: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 5 5M8 10l2 2 3-4" },
      { label: "Widoczność Google", href: "/admin/widocznosc", path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18" },
      { label: "Zespół", href: "/admin/zespol", path: "M12 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 20v-2a6 6 0 0 1 12 0v2M17 6a3 3 0 0 1 0 6M18 14c2 1 3 3 3 6" },
    ],
  },
];

export default function AdminDesktopSidebar() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin" && hash !== "#admin-offers";
    if (href === "/admin#admin-offers") return pathname === "/admin" && hash === "#admin-offers";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="admin-desktop-sidebar" aria-label="Boczne menu administratora">
      <div className="flex items-center gap-3 px-7 pt-7">
        <div aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-xl font-black text-white">T</div>
        <div className="min-w-0">
          <p className="text-[15px] font-black tracking-tight text-stone-950">Trend Admin</p>
          <p className="mt-0.5 text-[11px] font-semibold text-stone-500">Centrum zarządzania</p>
        </div>
      </div>

      <nav aria-label="Sekcje panelu" className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {groups.map((group) => (
          <section key={group.title} aria-label={group.title} className="mt-7">
            <h2 className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">{group.title}</h2>
            <div className="mt-2 grid gap-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} prefetch
                    onClick={() => setHash(item.href.includes("#") ? "#admin-offers" : "")}
                    aria-current={active ? "page" : undefined}
                    className={["admin-desktop-nav-item group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-bold transition",
                      active ? "is-active" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"].join(" ")}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={item.path} />
                    </svg>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose-600" />}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
      <div className="border-t border-stone-100 px-4 py-4">
        <Link href="/" target="_blank" rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-between rounded-xl px-3 text-[13px] font-bold text-stone-600 hover:bg-stone-100 hover:text-rose-700">
          Otwórz stronę publiczną <span aria-hidden="true">↗</span>
        </Link>
        <p className="mt-2 px-3 text-[10px] font-semibold text-stone-400">Trend za Mniej · Administracja</p>
      </div>
    </aside>
  );
}
