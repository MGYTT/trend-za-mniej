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
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.getClientRects().length > 0);
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

function MoreSheet({
  dialogRef,
  standalone,
  isIOS,
  installHelpOpen,
  onInstall,
  onClose,
}: {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  standalone: boolean;
  isIOS: boolean;
  installHelpOpen: boolean;

  onInstall:
    () => void;

  onClose:
    () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Zamknij menu"
        onClick={
          onClose
        }
        className="admin-sheet-backdrop lg:hidden"
      />

      <div
          id="admin-more-sheet"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-more-title"
          tabIndex={-1}
          className="admin-ios-sheet lg:hidden"
        >
        <div className="admin-sheet-handle" />

        <div className="admin-sheet-header">
          <div>
            <p className="admin-sheet-eyebrow">
              Trend Admin
            </p>

            <h2 id="admin-more-title" className="admin-sheet-title">
              Więcej
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Zamknij"
            className="admin-sheet-close"
          >
            ×
          </button>
        </div>

        <div className="admin-sheet-content">
          {!standalone && (
            <section className="admin-ios-group">
              <button
                type="button"
                onClick={
                  onInstall
                }
                className="admin-ios-row"
              >
                <span className="admin-ios-row-icon admin-ios-row-icon-brand">
                  <AppIcon />
                </span>

                <span className="admin-ios-row-copy">
                  <strong>
                    Zainstaluj Trend Admin
                  </strong>

                  <small>
                    Otwieraj panel jak
                    zwykłą aplikację
                  </small>
                </span>

                <span className="admin-ios-chevron">
                  ›
                </span>
              </button>

              {installHelpOpen && (
                <div className="border-t border-stone-100 bg-stone-50 px-4 py-4">
                  {isIOS ? (
                    <>
                      <p className="text-xs font-black text-stone-800">
                        Instalacja na
                        iPhone
                      </p>

                      <div className="mt-3 space-y-2">
                        <InstructionStep
                          number="1"
                          text="Otwórz panel w Safari."
                        />

                        <InstructionStep
                          number="2"
                          text="Naciśnij Udostępnij."
                        />

                        <InstructionStep
                          number="3"
                          text="Wybierz „Dodaj do ekranu początkowego”."
                        />

                        <InstructionStep
                          number="4"
                          text="Naciśnij „Dodaj”."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-black text-stone-800">
                        Instalacja
                        aplikacji
                      </p>

                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Otwórz menu
                        przeglądarki
                        i wybierz
                        „Zainstaluj
                        aplikację”
                        albo „Dodaj
                        do ekranu
                        głównego”.
                      </p>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          <p className="admin-sheet-section-label">Centrum i narzędzia</p>
          <section className="admin-ios-group">
            <AppMenuLink
              href="/admin/autopilot"
              icon="stats"
              title="Centrum Autopilota"
              description="Automatyzacje, pilne zadania i porządek"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/terminy-promocji"
              icon="offers"
              title="Terminy promocji"
              description="Sprawdź ważność i ostatnie weryfikacje"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/widocznosc"
              icon="seo"
              title="Indeksowanie i IndexNow"
              description="Zgłoszenia adresów do wyszukiwarek"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/nowa-oferta"
              icon="add"
              title="Nowa oferta"
              description="Dodaj produkt do katalogu"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/statystyki"
              icon="stats"
              title="Statystyki"
              description="Kliknięcia i wyniki produktów"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/skutecznosc"
              icon="stats"
              title="Skuteczność kanałów"
              description="Produkty, stylizacje i promocje"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/tiktok"
              icon="tiktok"
              title="TikTok"
              description="Dodawaj i usuwaj produkty z /tiktok"
              onClick={
                onClose
              }
            />

            <div className="admin-ios-divider" />

            <AppMenuLink
              href="/admin/stylizacje"
              icon="offers"
              title="Kreator stylizacji"
              description="Buduj, zapisuj i publikuj zestawy"
              onClick={onClose}
            />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/promocje-shein"
              icon="offers"
              title="Promocje SHEIN"
              description="Kody, kampanie i publikacja"
              onClick={onClose}
            />
            <AppMenuLink href="/admin/kody-rabatowe" icon="offers" title="Kody wielu sklepów" description="Kupony, daty i publikacja" onClick={onClose} />
            <div className="admin-ios-divider" />
            <AppMenuLink
              href="/admin/seo"
              icon="seo"
              title="SEO Quality"
              description="Sprawdź jakość SEO produktów"
              onClick={
                onClose
              }
            />

            <div className="admin-ios-divider" />

            <AppMenuLink
              href="/admin#admin-offers"
              icon="offers"
              title="Wszystkie oferty"
              description="Przejdź bezpośrednio do produktów"
              onClick={
                onClose
              }
            />

            <div className="admin-ios-divider" />

            <AppMenuLink
              href="/admin/zespol"
              icon="team"
              title="Zespół"
              description="Administratorzy i role"
              onClick={
                onClose
              }
            />

            <div className="admin-ios-divider" />

            <AppMenuLink
              href="/"
              icon="website"
              title="Strona publiczna"
              description="Otwórz Trend za Mniej"
              external
              onClick={
                onClose
              }
            />
          </section>

          <p className="admin-sheet-section-label">Konto</p>
          <section className="admin-ios-group">
            <form
              action="/auth/signout"
              method="post"
            >
              <button
                type="submit"
                className="admin-ios-row text-red-600"
              >
                <span className="admin-ios-row-icon bg-red-50 text-red-600">
                  <LogoutIcon />
                </span>

                <span className="admin-ios-row-copy">
                  <strong className="text-red-600">
                    Wyloguj się
                  </strong>
                </span>
              </button>
            </form>
          </section>

          <p className="px-4 text-center text-[10px] leading-5 text-stone-400">
            Panel administratora
            korzysta z tych samych
            danych i zabezpieczeń
            co wersja internetowa.
          </p>
        </div>
      </div>
    </>
  );
}

function AppMenuLink({
  href,
  icon,
  title,
  description,
  external = false,
  onClick,
}: {
  href: string;

  icon:
    | "tiktok"
    | "seo"
    | "add"
    | "stats"
    | "offers"
    | "team"
    | "website";

  title: string;
  description: string;
  external?: boolean;

  onClick:
    () => void;
}) {
  return (
    <Link
      href={
        href
      }
      prefetch={
        !external
      }
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      onClick={
        onClick
      }
      className="admin-ios-row"
    >
      <span
        className={[
          "admin-ios-row-icon",
          icon ===
          "tiktok"
            ? "bg-stone-950 text-white"
            : "",
        ].join(
          " "
        )}
      >
        {icon ===
        "tiktok" ? (
          <TikTokIcon />
        ) : icon ===
          "seo" ? (
          <SeoIcon />
        ) : icon ===
          "add" ? (
          <PlusIcon />
        ) : icon ===
          "stats" ? (
          <BottomIcon type="stats" />
        ) : icon ===
          "team" ? (
          <TeamIcon />
        ) : icon ===
          "website" ? (
          <WebsiteIcon />
        ) : (
          <OffersIcon />
        )}
      </span>

      <span className="admin-ios-row-copy">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <span className="admin-ios-chevron">
        {external
          ? "↗"
          : "›"}
      </span>
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