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

const priceFormatter =
  new Intl.NumberFormat(
    "pl-PL",
    {
      style: "currency",
      currency: "PLN",
    }
  );

function formatPrice(
  price:
    | number
    | string
) {
  return priceFormatter.format(
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
    <div className="admin-mobile-dashboard lg:hidden">
      <section className="px-1 pb-1 pt-2">
        <p className="text-[11px] font-semibold text-stone-400">
          Witaj,
        </p>

        <div className="mt-1 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-[30px] font-black leading-none tracking-[-0.055em] text-stone-950">
              {displayName}
            </h1>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[9px] font-black",
                  currentRole ===
                  "owner"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-700",
                ].join(" ")}
              >
                {currentRole ===
                "owner"
                  ? "👑 Właściciel"
                  : "Administrator"}
              </span>

              {ownerModeActive && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-700">
                  ✓ Własność ofert
                </span>
              )}
            </div>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-stone-950 text-lg font-black text-white shadow-sm">
            T
          </div>
        </div>
      </section>

      <Link
        href="/admin/nowa-oferta"
        prefetch
        className="admin-primary-action mt-4"
      >
        <span className="admin-primary-action-icon">
          <PlusIcon />
        </span>

        <span className="min-w-0 flex-1">
          <strong className="block text-[15px] font-black">
            Dodaj nową ofertę
          </strong>

          <small className="mt-0.5 block text-[10px] font-semibold text-white/65">
            Szybki start, zdjęcie
            i publikacja
          </small>
        </span>

        <span className="text-2xl text-white/45">
          ›
        </span>
      </Link>

      <section className="mt-4 grid grid-cols-2 gap-2.5">
        <MetricCard
          label="Kliknięcia dziś"
          value={
            todayClicks
          }
          helper="dzisiaj"
          icon="today"
          prominent
        />

        <MetricCard
          label="Aktywne oferty"
          value={
            activeProducts
          }
          helper={`${totalProducts} wszystkich`}
          icon="products"
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
          label="Gorące"
          value={
            featuredProducts
          }
          helper="wyróżnione"
          icon="featured"
        />
      </section>

      <section className="mt-5">
        <SectionHeader
          title="Szybki dostęp"
        />

        <div className="admin-ios-group mt-2">
          <QuickRow
            href="/admin/social"
            icon="social"
            title="Social Media"
            description="Twórz materiały 9:16"
          />

          <div className="admin-ios-divider" />

          <QuickRow
            href="/admin/statystyki"
            icon="stats"
            title="Statystyki"
            description="Kliknięcia i wyniki"
          />

          <div className="admin-ios-divider" />

          <QuickRow
            href="/admin#admin-offers"
            icon="offers"
            title="Wszystkie oferty"
            description={`${totalProducts} produktów • ${hiddenProducts} ukrytych`}
          />
        </div>
      </section>

      <section className="mt-5">
        <SectionHeader
          title="System"
        />

        <div className="admin-ios-group mt-2">
          <div className="flex min-h-[68px] items-center gap-3 px-4">
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]",
                duplicateConflicts >
                0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700",
              ].join(" ")}
            >
              <ShieldIcon />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-black text-stone-900">
                Ochrona duplikatów
              </p>

              <p className="mt-0.5 text-[11px] text-stone-400">
                {duplicateConflicts >
                0
                  ? `${duplicateConflicts} ${
                      duplicateConflicts ===
                      1
                        ? "konflikt do sprawdzenia"
                        : "konflikty do sprawdzenia"
                    }`
                  : "Aktywna • wszystko w porządku"}
              </p>
            </div>

            <span
              className={[
                "h-2.5 w-2.5 shrink-0 rounded-full",
                duplicateConflicts >
                0
                  ? "bg-amber-500"
                  : "bg-emerald-500",
              ].join(" ")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader
          title="Ostatnie oferty"
          action={
            <a
              href="#admin-offers"
              className="text-[12px] font-bold text-rose-600"
            >
              Wszystkie
            </a>
          }
        />

        {recentProducts.length >
        0 ? (
          <div className="admin-ios-group mt-2 overflow-hidden">
            {recentProducts.map(
              (
                product,
                index
              ) => (
                <div
                  key={
                    product.id
                  }
                >
                  {index >
                    0 && (
                    <div className="ml-[88px] border-t border-stone-100" />
                  )}

                  <article className="flex gap-3 p-3">
                    <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-[15px] bg-stone-100">
                      <img
                        src={
                          product.imageUrl
                        }
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />

                      {product.featured && (
                        <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/92 text-[10px] shadow-sm">
                          🔥
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={[
                            "h-2 w-2 shrink-0 rounded-full",
                            product.active
                              ? "bg-emerald-500"
                              : "bg-stone-300",
                          ].join(" ")}
                        />

                        <p className="truncate text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
                          {product.category}
                        </p>
                      </div>

                      <h3 className="mt-1.5 line-clamp-2 text-[13px] font-black leading-5 text-stone-900">
                        {product.shortName}
                      </h3>

                      <p className="mt-0.5 text-[13px] font-black text-stone-700">
                        {formatPrice(
                          product.price
                        )}
                      </p>

                      <div className="mt-auto flex items-center gap-2 pt-1.5">
                        {product.canManage && (
                          <Link
                            href={`/admin/edytuj/${product.id}`}
                            prefetch
                            className="text-[10px] font-black text-rose-600"
                          >
                            Edytuj
                          </Link>
                        )}

                        <Link
                          href={`/admin/social/${product.id}`}
                          prefetch
                          className="text-[10px] font-black text-violet-600"
                        >
                          Social
                        </Link>
                      </div>
                    </div>

                    <span className="self-center text-xl text-stone-300">
                      ›
                    </span>
                  </article>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="admin-ios-group mt-2 px-5 py-8 text-center">
            <p className="text-sm font-black text-stone-700">
              Brak ofert
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Dodaj pierwszy produkt.
            </p>
          </div>
        )}
      </section>

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-stone-200/80">
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
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;

  action?:
    React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <h2 className="text-[13px] font-black uppercase tracking-[0.04em] text-stone-500">
        {title}
      </h2>

      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  prominent = false,
}: {
  label: string;
  value: number;
  helper: string;

  icon:
    | "products"
    | "today"
    | "clicks"
    | "featured";

  prominent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[20px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.025)] ring-1",
        prominent
          ? "bg-rose-600 text-white ring-rose-600"
          : "bg-white text-stone-950 ring-stone-200/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-[12px]",
            prominent
              ? "bg-white/15 text-white"
              : "bg-stone-100 text-stone-700",
          ].join(" ")}
        >
          <MetricIcon
            type={
              icon
            }
          />
        </span>

        <span className="text-[26px] font-black leading-none tracking-[-0.055em]">
          {value}
        </span>
      </div>

      <p
        className={[
          "mt-3 text-[12px] font-black",
          prominent
            ? "text-white"
            : "text-stone-700",
        ].join(" ")}
      >
        {label}
      </p>

      <p
        className={[
          "mt-0.5 text-[9px] font-semibold",
          prominent
            ? "text-white/65"
            : "text-stone-400",
        ].join(" ")}
      >
        {helper}
      </p>
    </div>
  );
}

function QuickRow({
  href,
  icon,
  title,
  description,
}: {
  href: string;

  icon:
    | "social"
    | "stats"
    | "offers";

  title: string;
  description: string;
}) {
  return (
    <Link
      href={
        href
      }
      prefetch
      className="admin-ios-row"
    >
      <span
        className={[
          "admin-ios-row-icon",
          icon ===
          "social"
            ? "bg-violet-100 text-violet-700"
            : icon ===
                "stats"
              ? "bg-blue-100 text-blue-700"
              : "bg-rose-100 text-rose-700",
        ].join(" ")}
      >
        {icon ===
        "social" ? (
          <PhoneIcon />
        ) : icon ===
          "stats" ? (
          <StatsIcon />
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
        ›
      </span>
    </Link>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border-r border-stone-100 px-2 py-3 text-center last:border-r-0">
      <p className="text-[17px] font-black tracking-[-0.04em] text-stone-900">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.06em] text-stone-400">
        {label}
      </p>
    </div>
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

function PhoneIcon() {
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