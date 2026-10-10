"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useMemo,
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
        setStandalone(true);
        setInstallPrompt(null);
        setInstallHelpOpen(false);
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
        !immersiveRoute
      ) {
        body.classList.add(
          "has-mobile-bottom-nav"
        );
      }

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
          "has-mobile-bottom-nav"
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
      setMoreOpen(false);
      setInstallHelpOpen(false);
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
          setMoreOpen(false);
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
      moreOpen,
    ]
  );

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
        await installPrompt.userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setInstallPrompt(null);
      }

      return;
    }

    setInstallHelpOpen(true);
  }

  return (
    <div
      className={[
        "admin-app-root min-h-screen",
        immersiveRoute
          ? ""
          : "pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0",
      ].join(" ")}
    >
      {children}

      {!immersiveRoute && (
        <MobileBottomNavigation
          pathname={
            pathname
          }
          onMore={() =>
            setMoreOpen(true)
          }
        />
      )}

      {!immersiveRoute &&
        moreOpen && (
        <MoreSheet
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
            setMoreOpen(false)
          }
        />
      )}
    </div>
  );
}

function MobileBottomNavigation({
  pathname,
  onMore,
}: {
  pathname: string;

  onMore: () => void;
}) {
  return (
    <div className="admin-tabbar-wrap lg:hidden">
      <nav
        aria-label="Nawigacja aplikacji administratora"
        className="admin-ios-tabbar"
      >
        <BottomNavLink
          href="/admin"
          label="Panel"
          icon="home"
          active={
            pathname ===
            "/admin"
          }
        />

        <BottomNavLink
          href="/admin/social"
          label="Social"
          icon="social"
          active={
            pathname.startsWith(
              "/admin/social"
            )
          }
        />

        <Link
          href="/admin/nowa-oferta"
          prefetch
          aria-label="Dodaj ofertę"
          className="admin-add-tab"
        >
          <span className="admin-add-tab-icon">
            <PlusIcon />
          </span>

          <span className="admin-add-tab-label">
            Dodaj
          </span>
        </Link>

        <BottomNavLink
          href="/admin/statystyki"
          label="Statystyki"
          icon="stats"
          active={
            pathname.startsWith(
              "/admin/statystyki"
            )
          }
        />

        <button
          type="button"
          onClick={
            onMore
          }
          className={[
            "admin-tabbar-item",
            pathname.startsWith(
              "/admin/zespol"
            )
              ? "is-active"
              : "",
          ].join(" ")}
        >
          <BottomIcon
            type="more"
          />

          <span>
            Więcej
          </span>
        </button>
      </nav>
    </div>
  );
}

function BottomNavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;

  icon:
    | "home"
    | "social"
    | "stats";

  active: boolean;
}) {
  return (
    <Link
      href={
        href
      }
      prefetch
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={[
        "admin-tabbar-item",
        active
          ? "is-active"
          : "",
      ].join(" ")}
    >
      <BottomIcon
        type={
          icon
        }
      />

      <span>
        {label}
      </span>
    </Link>
  );
}

function MoreSheet({
  standalone,
  isIOS,
  installHelpOpen,
  onInstall,
  onClose,
}: {
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

      <div className="admin-ios-sheet lg:hidden">
        <div className="admin-sheet-handle" />

        <div className="admin-sheet-header">
          <div>
            <p className="admin-sheet-eyebrow">
              Trend Admin
            </p>

            <h2 className="admin-sheet-title">
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

          <section className="admin-ios-group">
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
      <span className="admin-ios-row-icon">
        {icon ===
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