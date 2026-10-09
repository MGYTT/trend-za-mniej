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
  children:
    ReactNode;
}) {
  const pathname =
    usePathname();

  const [
    moreOpen,
    setMoreOpen,
  ] =
    useState(
      false
    );

  const [
    installHelpOpen,
    setInstallHelpOpen,
  ] =
    useState(
      false
    );

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
    useState(
      false
    );

  const [
    isIOS,
    setIsIOS,
  ] =
    useState(
      false
    );

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
          standalone?:
            boolean;
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
        event:
          Event
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
            /*
             * "/admin", a nie
             * "/admin/".
             *
             * Dzięki temu worker
             * obejmuje zarówno:
             * /admin
             *
             * jak i wszystkie
             * /admin/...
             */
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

      const previousOverflow =
        document.body.style
          .overflow;

      document.body.style.overflow =
        "hidden";

      function handleKeyDown(
        event:
          KeyboardEvent
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setMoreOpen(
            false
          );
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
        "min-h-screen",
        immersiveRoute
          ? ""
          : "pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0",
      ].join(
        " "
      )}
    >
      {children}

      {!immersiveRoute && (
        <MobileBottomNavigation
          pathname={
            pathname
          }
          onMore={() =>
            setMoreOpen(
              true
            )
          }
        />
      )}

      {!immersiveRoute &&
        moreOpen && (
        <>
          <button
            type="button"
            aria-label="Zamknij menu"
            onClick={() =>
              setMoreOpen(
                false
              )
            }
            className="fixed inset-0 z-[90] bg-stone-950/30 backdrop-blur-[3px] lg:hidden"
          />

          <div
            className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-h-[88dvh] max-w-lg overflow-y-auto rounded-t-[32px] border border-stone-200 bg-[#f7f7f8] shadow-[0_-24px_80px_rgba(28,25,23,0.22)] lg:hidden"
            style={{
              paddingBottom:
                "max(20px, env(safe-area-inset-bottom))",
            }}
          >
            <div className="sticky top-0 z-10 bg-[#f7f7f8]/95 px-5 pb-3 pt-3 backdrop-blur-2xl">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300" />

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">
                    Trend za Mniej
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-stone-950">
                    Więcej
                  </h2>
                </div>

                {standalone && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                    ✓ Aplikacja
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 px-4 pb-4">
              {!standalone && (
                <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      void installApp()
                    }
                    className="flex min-h-[74px] w-full items-center gap-4 px-4 text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
                      <AppIcon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-stone-950">
                        Zainstaluj Trend Admin
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        Uruchamiaj panel
                        jak zwykłą
                        aplikację.
                      </p>
                    </div>

                    <span className="text-xl text-stone-300">
                      →
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
                              text="Naciśnij przycisk Udostępnij."
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
                            Instalacja aplikacji
                          </p>

                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            Otwórz menu
                            przeglądarki
                            i wybierz
                            „Zainstaluj
                            aplikację”
                            albo
                            „Dodaj do ekranu
                            głównego”.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </section>
              )}

              <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
                <AppMenuLink
                  href="/admin/zespol"
                  icon="team"
                  title="Zespół"
                  description="Administratorzy i aktywność"
                />

                <div className="mx-4 border-t border-stone-100" />

                <AppMenuLink
                  href="/"
                  icon="website"
                  title="Strona publiczna"
                  description="Otwórz Trend za Mniej"
                  external
                />
              </section>

              <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
                <form
                  action="/auth/signout"
                  method="post"
                >
                  <button
                    type="submit"
                    className="flex min-h-[60px] w-full items-center gap-3 px-4 text-left text-sm font-black text-red-600"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                      <LogoutIcon />
                    </span>

                    Wyloguj się
                  </button>
                </form>
              </section>

              <p className="px-3 text-center text-[10px] leading-5 text-stone-400">
                Trend Admin korzysta
                z tego samego konta,
                danych i zabezpieczeń
                co panel internetowy.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileBottomNavigation({
  pathname,
  onMore,
}: {
  pathname:
    string;

  onMore:
    () => void;
}) {
  return (
    <nav
      aria-label="Nawigacja aplikacji administratora"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-stone-200/80 bg-white/92 shadow-[0_-8px_30px_rgba(28,25,23,0.08)] backdrop-blur-2xl lg:hidden"
      style={{
        paddingBottom:
          "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-5 items-center px-2">
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
          aria-label="Dodaj ofertę"
          className="group -mt-7 flex flex-col items-center justify-center"
        >
          <span
            className={[
              "flex h-14 w-14 items-center justify-center rounded-[20px] border-4 border-white text-white shadow-[0_8px_28px_rgba(225,29,72,0.35)] transition",
              pathname ===
              "/admin/nowa-oferta"
                ? "bg-rose-700"
                : "bg-rose-600 active:scale-95",
            ].join(
              " "
            )}
          >
            <PlusIcon />
          </span>

          <span className="mt-1 text-[9px] font-black text-stone-600">
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
            "flex h-full flex-col items-center justify-center gap-1 text-[9px] font-black transition",
            pathname.startsWith(
              "/admin/zespol"
            )
              ? "text-rose-600"
              : "text-stone-400",
          ].join(
            " "
          )}
        >
          <BottomIcon
            type="more"
          />

          Więcej
        </button>
      </div>
    </nav>
  );
}

function BottomNavLink({
  href,
  label,
  icon,
  active,
}: {
  href:
    string;

  label:
    string;

  icon:
    | "home"
    | "social"
    | "stats";

  active:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={[
        "flex h-full flex-col items-center justify-center gap-1 text-[9px] font-black transition",
        active
          ? "text-rose-600"
          : "text-stone-400 active:text-stone-700",
      ].join(
        " "
      )}
    >
      <BottomIcon
        type={
          icon
        }
      />

      {label}
    </Link>
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
        strokeWidth="2.2"
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
        strokeWidth="2.1"
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
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        r="1.7"
      />

      <circle
        cx="12"
        cy="12"
        r="1.7"
      />

      <circle
        cx="19"
        cy="12"
        r="1.7"
      />
    </svg>
  );
}

function AppMenuLink({
  href,
  icon,
  title,
  description,
  external = false,
}: {
  href:
    string;

  icon:
    | "team"
    | "website";

  title:
    string;

  description:
    string;

  external?:
    boolean;
}) {
  return (
    <Link
      href={
        href
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
      className="flex min-h-[70px] items-center gap-4 px-4 transition active:bg-stone-50"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-stone-100 text-stone-700">
        {icon ===
        "team" ? (
          <TeamIcon />
        ) : (
          <WebsiteIcon />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-stone-900">
          {title}
        </span>

        <span className="mt-1 block text-xs text-stone-400">
          {description}
        </span>
      </span>

      <span className="text-lg text-stone-300">
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
  number:
    string;

  text:
    string;
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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
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
      className="h-6 w-6"
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