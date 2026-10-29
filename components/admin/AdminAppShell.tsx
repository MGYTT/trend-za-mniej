"use client";

import Link from "next/link";
import AdminDesktopSidebar from "@/components/admin/AdminDesktopSidebar";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

type BeforeInstallPromptEvent =
  Event & {
    prompt: () =>
      Promise<void>;

    userChoice:
      Promise<{
        outcome:
          | "accepted"
          | "dismissed";

        platform:
          string;
      }>;
  };

export default function AdminAppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const [
    moreOpen,
    setMoreOpen,
  ] =
    useState(false);

  const [
    installHelpOpen,
    setInstallHelpOpen,
  ] =
    useState(false);

  const [
    installPrompt,
    setInstallPrompt,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null
    );

  const [
    standalone,
    setStandalone,
  ] =
    useState(false);

  const [
    isIOS,
    setIsIOS,
  ] =
    useState(false);

  const [activeHash, setActiveHash] = useState("");
  const moreSheetRef = useRef<HTMLDivElement>(null);

  const immersiveRoute =
    useMemo(
      () => {
        if (
          pathname ===
          "/admin/nowa-oferta"
        ) {
          return true;
        }

        if (
          pathname.startsWith(
            "/admin/edytuj/"
          )
        ) {
          return true;
        }

        if (
          /^\/admin\/social\/[^/]+$/.test(
            pathname
          )
        ) {
          return true;
        }

        return false;
      },
      [
        pathname,
      ]
    );

  useEffect(
    () => {
      const navigatorWithStandalone =
        navigator as Navigator & {
          standalone?: boolean;
        };

      const detectStandalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches ||
        navigatorWithStandalone.standalone ===
          true;

      setStandalone(
        detectStandalone
      );

      setIsIOS(
        /iPhone|iPad|iPod/i.test(
          navigator.userAgent
        )
      );

      function handleInstallPrompt(
        event: Event
      ) {
        event.preventDefault();

        setInstallPrompt(
          event as BeforeInstallPromptEvent
        );
      }

      function handleInstalled() {
        setStandalone(
          true
        );

        setInstallPrompt(
          null
        );

        setInstallHelpOpen(
          false
        );
      }

      window.addEventListener(
        "beforeinstallprompt",
        handleInstallPrompt
      );

      window.addEventListener(
        "appinstalled",
        handleInstalled
      );

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleInstallPrompt
        );

        window.removeEventListener(
          "appinstalled",
          handleInstalled
        );
      };
    },
    []
  );

  useEffect(
    () => {
      if (
        !(
          "serviceWorker" in
          navigator
        )
      ) {
        return;
      }

      navigator.serviceWorker
        .register(
          "/admin-sw.js?v=2",
          {
            scope:
              "/admin",

            updateViaCache:
              "none",
          }
        )
        .catch(
          (
            error
          ) => {
            console.warn(
              "Nie udało się zarejestrować trybu aplikacji administratora:",
              error
            );
          }
        );
    },
    []
  );

  useEffect(
    () => {
      const body =
        document.body;

      body.classList.add(
        "admin-app-shell"
      );

      if (
        pathname ===
        "/admin/nowa-oferta"
      ) {
        body.classList.add(
          "admin-new-offer-app"
        );
      }

      if (
        pathname.startsWith(
          "/admin/edytuj/"
        )
      ) {
        body.classList.add(
          "admin-edit-offer-app"
        );
      }

      if (
        /^\/admin\/social\/[^/]+$/.test(
          pathname
        )
      ) {
        body.classList.add(
          "admin-social-studio-app"
        );
      }

      return () => {
        body.classList.remove(
          "admin-app-shell"
        );

        body.classList.remove(
          "admin-new-offer-app"
        );

        body.classList.remove(
          "admin-edit-offer-app"
        );

        body.classList.remove(
          "admin-social-studio-app"
        );
      };
    },
    [
      pathname,
      immersiveRoute,
    ]
  );

  useEffect(
    () => {
      setMoreOpen(
        false
      );

      setInstallHelpOpen(
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
        !moreOpen
      ) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      const previousFocus = document.activeElement as HTMLElement | null;
      const dialog = moreSheetRef.current;
      document.body.style.overflow = "hidden";
      dialog?.focus();

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          setMoreOpen(false);
          return;
        }
        if (event.key !== "Tab" || !dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));
        if (!focusables.length) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
          return;
        }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener("keydown", handleKeyDown);
        previousFocus?.focus();
      };
    },
    [
      moreOpen,
    ]
  );

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  async function installApp() {
    if (
      standalone
    ) {
      return;
    }

    if (
      installPrompt
    ) {
      await installPrompt.prompt();

      const choice =
        await installPrompt
          .userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setInstallPrompt(
          null
        );
      }

      return;
    }

    setInstallHelpOpen(
      true
    );
  }

  return (
    <div
      className={[
        "admin-app-root min-h-screen min-w-0 xl:pl-[252px]",
        immersiveRoute
          ? ""
          : "pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-0",
      ].join(
        " "
      )}
    >
      <AdminDesktopSidebar />
      {children}

      {!immersiveRoute && (
        <MobileBottomNavigation
          pathname={pathname}
          activeHash={activeHash}
          onHashChange={setActiveHash}
          moreOpen={moreOpen}
          onMore={() =>
            setMoreOpen(
              true
            )
          }
        />
      )}

      {!immersiveRoute &&
        moreOpen && (
        <MoreSheet
          dialogRef={moreSheetRef}
          pathname={pathname}
          standalone={
            standalone
          }
          isIOS={
            isIOS
          }
          installHelpOpen={
            installHelpOpen
          }
          onInstall={() =>
            void installApp()
          }
          onClose={() =>
            setMoreOpen(
              false
            )
          }
        />
      )}
    </div>
  );
}

function MobileBottomNavigation({
  pathname,
  activeHash,
  onHashChange,
  moreOpen,
  onMore,
}: {
  pathname: string;
  activeHash: string;
  onHashChange: (value: string) => void;
  moreOpen: boolean;
  onMore: () => void;
}) {
  const onDashboard = pathname === "/admin";
  const offersActive = onDashboard && activeHash === "#admin-offers";
  const moreActive =
    moreOpen ||
    pathname.startsWith("/admin/autopilot") ||
    pathname.startsWith("/admin/tiktok") ||
    pathname.startsWith("/admin/seo") ||
    pathname.startsWith("/admin/statystyki") ||
    pathname.startsWith("/admin/skutecznosc") ||
    pathname.startsWith("/admin/promocje-shein") ||
    pathname.startsWith("/admin/kody-rabatowe") ||
    pathname.startsWith("/admin/widocznosc") ||
    pathname.startsWith("/admin/zespol");

  return (
    <div className="admin-tabbar-wrap lg:hidden">
      <nav aria-label="Nawigacja aplikacji administratora" className="admin-ios-tabbar">
        <BottomNavLink
          href="/admin"
          label="Panel"
          icon="home"
          active={onDashboard && !offersActive}
          onClick={() => onHashChange("")}
        />
        <BottomNavLink
          href="/admin#admin-offers"
          label="Oferty"
          icon="offers"
          active={offersActive}
          onClick={() => onHashChange("#admin-offers")}
        />
        <BottomNavLink
          href="/admin/stylizacje"
          label="Stylizacje"
          icon="looks"
          active={pathname.startsWith("/admin/stylizacje")}
        />
        <BottomNavLink
          href="/admin/social"
          label="Social"
          icon="social"
          active={pathname.startsWith("/admin/social")}
        />
        <button
          type="button"
          onClick={onMore}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          aria-controls="admin-more-sheet"
          aria-label="Otwórz pozostałe narzędzia"
          className={["admin-tabbar-item", moreActive ? "is-active" : ""].join(" ")}
        >
          <BottomIcon type="more" />
          <span>Więcej</span>
        </button>
      </nav>
    </div>
  );
}

function BottomNavLink({
  href, label, icon, active, onClick,
}: {
  href: string;
  label: string;
  icon: "home" | "social" | "offers" | "looks";
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={["admin-tabbar-item", active ? "is-active" : ""].join(" ")}
    >
      <BottomIcon type={icon} />
      <span>{label}</span>
    </Link>
  );
}


type MoreIcon = "tiktok" | "seo" | "add" | "stats" | "offers" | "team" |
  "website" | "looks" | "social" | "autopilot" | "calendar";

type MoreTool = { href: string; icon: MoreIcon; title: string; description: string; external?: boolean };
type MoreCategory = { id: string; title: string; subtitle: string; icon: MoreIcon; items: MoreTool[] };

const MORE_CATEGORIES: MoreCategory[] = [
  {
    id: "catalog", title: "Katalog i oferty", subtitle: "Produkty, zestawy i promocje", icon: "offers",
    items: [
      { href: "/admin#admin-offers", icon: "offers", title: "Wszystkie oferty", description: "Przeglądaj i edytuj katalog" },
      { href: "/admin/nowa-oferta", icon: "add", title: "Dodaj ofertę", description: "Nowy produkt w katalogu" },
      { href: "/admin/stylizacje", icon: "looks", title: "Kreator stylizacji", description: "Twórz i publikuj zestawy" },
      { href: "/admin/promocje-shein", icon: "offers", title: "Promocje SHEIN", description: "Kampanie i kody SHEIN" },
      { href: "/admin/kody-rabatowe", icon: "offers", title: "Kody wielu sklepów", description: "Promocje innych partnerów" },
      { href: "/admin/terminy-promocji", icon: "calendar", title: "Terminy promocji", description: "Ważność i weryfikacja ofert" },
    ],
  },
  {
    id: "marketing", title: "Marketing i treści", subtitle: "Materiały i kanały społecznościowe", icon: "social",
    items: [
      { href: "/admin/social", icon: "social", title: "Social Media", description: "Grafiki i materiały do publikacji" },
      { href: "/admin/tiktok", icon: "tiktok", title: "TikTok", description: "Produkty z naszych filmów" },
    ],
  },
  {
    id: "insights", title: "Wyniki i widoczność", subtitle: "Statystyki, SEO i indeksowanie", icon: "stats",
    items: [
      { href: "/admin/statystyki", icon: "stats", title: "Statystyki", description: "Kliknięcia i wyniki produktów" },
      { href: "/admin/skutecznosc", icon: "stats", title: "Skuteczność kanałów", description: "Produkty, stylizacje i kampanie" },
      { href: "/admin/seo", icon: "seo", title: "Kontrola SEO", description: "Jakość kart produktowych" },
      { href: "/admin/widocznosc", icon: "seo", title: "Widoczność Google", description: "IndexNow i wyszukiwarki" },
    ],
  },
  {
    id: "system", title: "System i administracja", subtitle: "Autopilot i dostęp do panelu", icon: "autopilot",
    items: [
      { href: "/admin/autopilot", icon: "autopilot", title: "Centrum Autopilota", description: "Automatyzacje i zadania do kontroli" },
      { href: "/admin/zespol", icon: "team", title: "Zespół", description: "Administratorzy i uprawnienia" },
      { href: "/", icon: "website", title: "Strona publiczna", description: "Otwórz Trend za Mniej", external: true },
    ],
  },
];

function MoreSheet({
  dialogRef, pathname, standalone, isIOS, installHelpOpen, onInstall, onClose,
}: {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  pathname: string;
  standalone: boolean;
  isIOS: boolean;
  installHelpOpen: boolean;
  onInstall: () => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set(["catalog"]));
  const query = search.trim().toLocaleLowerCase("pl-PL");
  const visibleCategories = MORE_CATEGORIES.map((group) => {
    const matchesCategory = [group.title, group.subtitle]
      .some((value) => value.toLocaleLowerCase("pl-PL").includes(query));
    return {
      ...group,
      items: group.items.filter((item) =>
        !query || matchesCategory ||
        [item.title, item.description].some((value) => value.toLocaleLowerCase("pl-PL").includes(query))
      ),
    };
  }).filter((group) => group.items.length > 0);

  function toggleCategory(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <button type="button" aria-label="Zamknij menu" onClick={onClose}
        className="admin-sheet-backdrop admin-more-backdrop lg:hidden" />
      <div id="admin-more-sheet" ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby="admin-more-title" tabIndex={-1}
        className="admin-ios-sheet admin-more-sheet lg:hidden">
        <div className="admin-sheet-handle" />
        <div className="admin-more-heading">
          <div>
            <p className="admin-sheet-eyebrow">TREND ADMIN · TWOJE CENTRUM</p>
            <h2 id="admin-more-title" className="admin-sheet-title">Więcej</h2>
            <p className="admin-more-intro">Wszystkie narzędzia w jednym miejscu.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij"
            className="admin-sheet-close admin-more-close"><span aria-hidden="true">×</span></button>
        </div>
        <div className="admin-sheet-content admin-more-content">
          <section aria-label="Szybkie akcje">
            <p className="admin-sheet-section-label admin-more-overline">Szybki dostęp</p>
            <div className="admin-more-shortcuts">
              <Link href="/admin/autopilot" onClick={onClose} prefetch className="admin-more-shortcut admin-more-shortcut-featured">
                <span className="admin-more-shortcut-icon"><MoreMenuIcon icon="autopilot" /></span>
                <span>Autopilot</span><small>Stan systemu</small>
              </Link>
              <Link href="/admin/nowa-oferta" onClick={onClose} prefetch className="admin-more-shortcut">
                <span className="admin-more-shortcut-icon"><MoreMenuIcon icon="add" /></span>
                <span>Nowa oferta</span><small>Dodaj produkt</small>
              </Link>
              <Link href="/admin/stylizacje" onClick={onClose} prefetch className="admin-more-shortcut">
                <span className="admin-more-shortcut-icon"><MoreMenuIcon icon="looks" /></span>
                <span>Stylizacje</span><small>Gotowe zestawy</small>
              </Link>
              <Link href="/admin/statystyki" onClick={onClose} prefetch className="admin-more-shortcut">
                <span className="admin-more-shortcut-icon"><MoreMenuIcon icon="stats" /></span>
                <span>Wyniki</span><small>Przegląd danych</small>
              </Link>
            </div>
          </section>
          <div className="admin-more-search-wrap">
            <label htmlFor="admin-more-search" className="sr-only">Szukaj narzędzia</label>
            <span aria-hidden="true" className="admin-more-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
              </svg>
            </span>
            <input id="admin-more-search" type="search" value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off" placeholder="Znajdź narzędzie…" className="admin-more-search" />
          </div>
          <section aria-label="Kategorie narzędzi" className="admin-more-categories">
            <div className="admin-more-categories-heading">
              <p className="admin-sheet-section-label admin-more-overline">Kategorie</p>
              <span>{query ? "Wyniki wyszukiwania" : "Dotknij, aby rozwinąć"}</span>
            </div>
            {visibleCategories.map((group) => {
              const opened = Boolean(query) || expanded.has(group.id);
              return (
                <section key={group.id} className="admin-more-category" aria-labelledby={"admin-more-title-" + group.id}>
                  <button type="button" disabled={Boolean(query)}
                    onClick={() => toggleCategory(group.id)} aria-expanded={opened}
                    aria-controls={"admin-more-panel-" + group.id}
                    className="admin-more-category-toggle">
                    <span className={"admin-more-category-icon admin-more-tone-" + group.id}>
                      <MoreMenuIcon icon={group.icon} />
                    </span>
                    <span className="admin-more-category-copy">
                      <strong id={"admin-more-title-" + group.id}>{group.title}</strong>
                      <small>{group.subtitle}</small>
                    </span>
                    <span className="admin-more-category-count">{group.items.length}</span>
                    <span aria-hidden="true"
                      className={"admin-more-category-chevron " + (opened ? "is-open" : "")}>⌄</span>
                  </button>
                  <div id={"admin-more-panel-" + group.id}
                    className={"admin-more-category-panel " + (opened ? "is-open" : "")}
                    aria-hidden={!opened} inert={!opened}>
                    <div className="admin-more-category-inner">
                      <div className="admin-more-category-links">
                        {group.items.map((item) => (
                          <AppMenuLink key={item.href} {...item}
                            active={!item.external && (
                              pathname === item.href || pathname.startsWith(item.href + "/")
                            )}
                            onClick={onClose} />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
            {visibleCategories.length === 0 && (
              <div className="admin-more-no-results" role="status">
                <p className="font-black text-stone-800">Brak pasujących narzędzi</p>
                <p className="mt-1 text-sm text-stone-500">Wpisz inną nazwę lub kategorię.</p>
                <button type="button" onClick={() => setSearch("")}
                  className="mt-3 min-h-11 rounded-xl bg-rose-50 px-4 text-sm font-bold text-rose-700">
                  Wyczyść wyszukiwanie
                </button>
              </div>
            )}
          </section>
          {!standalone && (
            <section className="admin-more-device" aria-label="Aplikacja mobilna">
              <button type="button" onClick={onInstall} className="admin-ios-row admin-more-install-row">
                <span className="admin-ios-row-icon admin-ios-row-icon-brand"><AppIcon /></span>
                <span className="admin-ios-row-copy">
                  <strong>Zainstaluj Trend Admin</strong>
                  <small>Dodaj panel do ekranu głównego</small>
                </span>
                <span aria-hidden="true" className="admin-ios-chevron">›</span>
              </button>
              {installHelpOpen && (
                <div className="admin-more-install-help">
                  {isIOS ? (
                    <>
                      <p className="text-sm font-black text-stone-800">Na iPhonie</p>
                      <div className="mt-2 grid gap-2">
                        <InstructionStep number="1" text="Otwórz panel w Safari." />
                        <InstructionStep number="2" text="Naciśnij Udostępnij." />
                        <InstructionStep number="3" text="Wybierz „Dodaj do ekranu początkowego”." />
                        <InstructionStep number="4" text="Naciśnij „Dodaj”." />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-stone-600">
                      W menu przeglądarki wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
          <section aria-label="Konto" className="admin-more-account">
            <form action="/auth/signout" method="post">
              <button type="submit" className="admin-ios-row admin-more-logout">
                <span className="admin-ios-row-icon bg-red-50 text-red-600"><LogoutIcon /></span>
                <span className="admin-ios-row-copy"><strong>Wyloguj się</strong></span>
                <span aria-hidden="true" className="admin-ios-chevron">›</span>
              </button>
            </form>
          </section>
          <p className="admin-more-footer">Trend za Mniej · Panel administratora</p>
        </div>
      </div>
    </>
  );
}

function MoreMenuIcon({ icon }: { icon: MoreIcon }) {
  if (icon === "tiktok") return <TikTokIcon />;
  if (icon === "seo") return <SeoIcon />;
  if (icon === "add") return <PlusIcon />;
  if (icon === "stats") return <BottomIcon type="stats" />;
  if (icon === "team") return <TeamIcon />;
  if (icon === "website") return <WebsiteIcon />;
  if (icon === "social") return <BottomIcon type="social" />;
  if (icon === "looks") return <BottomIcon type="looks" />;
  if (icon === "autopilot") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="15" rx="4" />
      <path d="M8 3v2M16 3v2M8 12h2m4 0h2M9 16c2 1.5 4 1.5 6 0" />
    </svg>
  );
  if (icon === "calendar") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v4M17 3v4M3 10h18M8 15h3" />
    </svg>
  );
  return <OffersIcon />;
}

function AppMenuLink({
  href, icon, title, description, external = false, active = false, onClick,
}: MoreTool & { active?: boolean; onClick: () => void }) {
  return (
    <Link href={href} prefetch={!external} target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined} onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={["admin-ios-row admin-more-row", active ? "is-current" : ""].join(" ")}>
      <span className={"admin-ios-row-icon admin-more-tool-icon admin-more-tool-" + icon}>
        <MoreMenuIcon icon={icon} />
      </span>
      <span className="admin-ios-row-copy">
        <strong>{title}</strong><small>{description}</small>
      </span>
      <span aria-hidden="true" className="admin-ios-chevron">{external ? "↗" : "›"}</span>
    </Link>
  );
}

function InstructionStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[10px] font-black text-white">
        {number}
      </span>

      <p className="text-xs font-bold text-stone-600">
        {text}
      </p>
    </div>
  );
}

function BottomIcon({
  type,
}: {
  type:
    | "home"
    | "social"
    | "stats"
    | "offers"
    | "looks"
    | "more";
}) {
  if (
    type ===
    "home"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
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
    "social"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="5"
          y="2"
          width="14"
          height="20"
          rx="3"
        />

        <path d="M9 6h6" />

        <circle
          cx="12"
          cy="18"
          r="1"
        />
      </svg>
    );
  }

  if (type === "offers") {
    return <OffersIcon />;
  }

  if (type === "looks") {
    return (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 4h6l2 4 3 2-2 10H6L4 10l3-2 2-4Z" />
        <path d="M9 4v4l3 2 3-2V4" />
        <path d="M8 15h8" />
      </svg>
    );
  }

  if (
    type ===
    "stats"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 20V10" />

        <path d="M12 20V4" />

        <path d="M19 20v-7" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="currentColor"
    >
      <circle
        cx="5"
        cy="12"
        r="1.6"
      />

      <circle
        cx="12"
        cy="12"
        r="1.6"
      />

      <circle
        cx="19"
        cy="12"
        r="1.6"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />

      <path d="M5 12h14" />
    </svg>
  );
}

function AppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="4"
      />

      <path d="M9 6h6" />

      <path d="M12 17h.01" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 7v10" />

      <path d="M9 9h5a4 4 0 0 0 4-4" />

      <circle
        cx="7"
        cy="17"
        r="3"
      />
    </svg>
  );
}

function SeoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="6"
      />

      <path d="m16 16 4 4" />

      <path d="M8.5 11.5 10.5 13l3.5-4" />
    </svg>
  );
}

function OffersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
      />

      <path d="M8 9h8" />

      <path d="M8 13h8" />

      <path d="M8 17h5" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
      />

      <path d="M3 20a6 6 0 0 1 12 0" />

      <circle
        cx="17"
        cy="9"
        r="2"
      />

      <path d="M16 15a5 5 0 0 1 5 5" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M3 12h18" />

      <path d="M12 3a15 15 0 0 1 0 18" />

      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />

      <path d="M15 12H3" />

      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
  );
}