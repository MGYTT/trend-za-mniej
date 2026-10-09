"use client";

import Link from "next/link";

import type {
  AdminRole,
} from "@/lib/admin-permissions";

type RecentProduct = {
  id: string;
  slug: string;
  shortName: string;
  category: string;
  imageUrl: string;

  price:
    | number
    | string;

  active: boolean;
  featured: boolean;
  canManage: boolean;
};

type Props = {
  displayName: string;
  currentRole: AdminRole;
  ownerModeActive: boolean;

  totalProducts: number;
  activeProducts: number;
  hiddenProducts: number;
  featuredProducts: number;
  totalClicks: number;
  todayClicks: number;

  duplicateConflicts: number;

  recentProducts:
    RecentProduct[];
};

function formatPrice(
  price:
    | number
    | string
) {
  return new Intl.NumberFormat(
    "pl-PL",
    {
      style:
        "currency",

      currency:
        "PLN",
    }
  ).format(
    Number(
      price
    )
  );
}

export default function AdminMobileDashboard({
  displayName,
  currentRole,
  ownerModeActive,
  totalProducts,
  activeProducts,
  hiddenProducts,
  featuredProducts,
  totalClicks,
  todayClicks,
  duplicateConflicts,
  recentProducts,
}: Props) {
  return (
    <div className="lg:hidden">
      <section className="relative overflow-hidden rounded-[28px] bg-stone-950 px-5 pb-5 pt-5 text-white shadow-[0_18px_50px_rgba(28,25,23,0.18)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-500/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                Trend Admin
              </p>

              <h1 className="mt-2 text-[28px] font-black leading-none tracking-[-0.05em]">
                Cześć,
                {" "}
                {displayName}
              </h1>

              <p className="mt-2 text-xs font-medium leading-5 text-white/55">
                Zarządzaj ofertami
                i materiałami
                social z telefonu.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/10 bg-white/10 backdrop-blur-xl">
              <AppMark />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={[
                "rounded-full px-3 py-1.5 text-[10px] font-black",
                currentRole ===
                "owner"
                  ? "bg-amber-300 text-amber-950"
                  : "bg-white/10 text-white/75",
              ].join(
                " "
              )}
            >
              {currentRole ===
              "owner"
                ? "👑 Właściciel"
                : "Administrator"}
            </span>

            {ownerModeActive && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-white/70">
                ✓ Własność ofert
              </span>
            )}
          </div>

          <Link
            href="/admin/nowa-oferta"
            className="mt-5 flex min-h-14 items-center justify-between rounded-[20px] bg-white px-4 text-stone-950 shadow-lg shadow-black/10 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-rose-600 text-white">
                <PlusIcon />
              </span>

              <div>
                <p className="text-sm font-black">
                  Dodaj nową ofertę
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-stone-400">
                  Produkt, zdjęcie
                  i link afiliacyjny
                </p>
              </div>
            </div>

            <span className="text-xl text-stone-300">
              ›
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Aktywne"
            value={
              activeProducts
            }
            helper={`${totalProducts} wszystkich`}
            icon="products"
          />

          <MetricCard
            label="Dzisiaj"
            value={
              todayClicks
            }
            helper="kliknięć"
            icon="today"
          />

          <MetricCard
            label="Kliknięcia"
            value={
              totalClicks
            }
            helper="łącznie"
            icon="clicks"
          />

          <MetricCard
            label="Wybrane"
            value={
              featuredProducts
            }
            helper="gorące oferty"
            icon="featured"
          />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <AppActionCard
          href="/admin/social"
          title="Social"
          description="Twórz grafiki 9:16"
          icon="social"
          accent
        />

        <AppActionCard
          href="/admin/statystyki"
          title="Statystyki"
          description="Wyniki i kliknięcia"
          icon="stats"
        />
      </section>

      <section className="mt-4 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-10 w-10 items-center justify-center rounded-[14px]",
                duplicateConflicts >
                0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700",
              ].join(
                " "
              )}
            >
              <ShieldIcon />
            </span>

            <div>
              <p className="text-sm font-black text-stone-900">
                Ochrona duplikatów
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-stone-400">
                {duplicateConflicts >
                0
                  ? `${duplicateConflicts} do sprawdzenia`
                  : "Aktywna • brak konfliktów"}
              </p>
            </div>
          </div>

          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              duplicateConflicts >
              0
                ? "bg-amber-500"
                : "bg-emerald-500",
            ].join(
              " "
            )}
          />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600">
              Ostatnie
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-stone-950">
              Najnowsze oferty
            </h2>
          </div>

          <a
            href="#admin-offers"
            className="rounded-full bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-600"
          >
            Wszystkie
          </a>
        </div>

        {recentProducts.length >
        0 ? (
          <div className="mt-3 space-y-3">
            {recentProducts.map(
              (
                product
              ) => (
                <article
                  key={
                    product.id
                  }
                  className="overflow-hidden rounded-[22px] border border-stone-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="relative h-[104px] w-[82px] shrink-0 overflow-hidden rounded-[16px] bg-stone-100">
                      <img
                        src={
                          product.imageUrl
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />

                      {product.featured && (
                        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] shadow-sm backdrop-blur">
                          🔥
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "h-2 w-2 shrink-0 rounded-full",
                            product.active
                              ? "bg-emerald-500"
                              : "bg-stone-300",
                          ].join(
                            " "
                          )}
                        />

                        <p className="truncate text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                          {
                            product.category
                          }
                        </p>
                      </div>

                      <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-stone-900">
                        {
                          product.shortName
                        }
                      </h3>

                      <p className="mt-1 text-sm font-black text-stone-700">
                        {formatPrice(
                          product.price
                        )}
                      </p>

                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <Link
                          href={`/admin/social/${product.id}`}
                          className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[13px] bg-stone-950 px-2 text-[10px] font-black text-white"
                        >
                          <PhoneIcon />

                          Social
                        </Link>

                        {product.canManage && (
                          <Link
                            href={`/admin/edytuj/${product.id}`}
                            className="flex min-h-9 flex-1 items-center justify-center rounded-[13px] border border-stone-200 bg-stone-50 px-2 text-[10px] font-black text-stone-600"
                          >
                            Edytuj
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-[22px] border border-dashed border-stone-300 bg-white px-5 py-8 text-center">
            <p className="text-sm font-black text-stone-700">
              Brak ofert
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Dodaj pierwszy produkt.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 grid grid-cols-3 gap-2 rounded-[22px] border border-stone-200 bg-white p-3 shadow-sm">
        <SmallStat
          label="Wszystkie"
          value={
            totalProducts
          }
        />

        <SmallStat
          label="Ukryte"
          value={
            hiddenProducts
          }
        />

        <SmallStat
          label="Gorące"
          value={
            featuredProducts
          }
        />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label:
    string;

  value:
    number;

  helper:
    string;

  icon:
    | "products"
    | "today"
    | "clicks"
    | "featured";
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-stone-100 text-stone-700">
          <MetricIcon
            type={
              icon
            }
          />
        </span>

        <span className="text-2xl font-black tracking-[-0.05em] text-stone-950">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-black text-stone-700">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-stone-400">
        {helper}
      </p>
    </div>
  );
}

function AppActionCard({
  href,
  title,
  description,
  icon,
  accent = false,
}: {
  href:
    string;

  title:
    string;

  description:
    string;

  icon:
    | "social"
    | "stats";

  accent?:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className={[
        "relative overflow-hidden rounded-[24px] border p-4 shadow-sm transition active:scale-[0.99]",
        accent
          ? "border-rose-100 bg-rose-50"
          : "border-stone-200 bg-white",
      ].join(
        " "
      )}
    >
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-[15px]",
          accent
            ? "bg-rose-600 text-white"
            : "bg-stone-950 text-white",
        ].join(
          " "
        )}
      >
        {icon ===
        "social" ? (
          <PhoneLargeIcon />
        ) : (
          <StatsIcon />
        )}
      </span>

      <p className="mt-4 text-sm font-black text-stone-950">
        {title}
      </p>

      <p className="mt-1 text-[10px] font-semibold leading-4 text-stone-400">
        {description}
      </p>

      <span className="absolute right-4 top-4 text-lg text-stone-300">
        ›
      </span>
    </Link>
  );
}

function SmallStat({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-black tracking-[-0.04em] text-stone-900">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
        {label}
      </p>
    </div>
  );
}

function MetricIcon({
  type,
}: {
  type:
    | "products"
    | "today"
    | "clicks"
    | "featured";
}) {
  if (
    type ===
    "today"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  if (
    type ===
    "clicks"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 3 7 17 2.5-6.5L21 11Z" />
      </svg>
    );
  }

  if (
    type ===
    "featured"
  ) {
    return (
      <span className="text-sm">
        🔥
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7 12 3l8 4-8 4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function AppMark() {
  return (
    <span className="text-xl font-black">
      T
    </span>
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

function ShieldIcon() {
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
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />
    </svg>
  );
}

function PhoneLargeIcon() {
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
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />

      <circle
        cx="12"
        cy="18"
        r="1"
      />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
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