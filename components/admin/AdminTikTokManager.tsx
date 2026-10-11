"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

type TikTokAdminProduct = {
  id: string;
  slug: string;
  name: string;
  short_name: string;

  price:
    | number
    | string;

  old_price:
    | number
    | string
    | null;

  category: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;

  created_by:
    | string
    | null;

  tiktok_featured:
    boolean;

  tiktok_featured_at:
    | string
    | null;

  canManage:
    boolean;
};

type Props = {
  products:
    TikTokAdminProduct[];
};

type ViewFilter =
  | "all"
  | "tiktok"
  | "available"
  | "hidden";

const priceFormatter =
  new Intl.NumberFormat(
    "pl-PL",
    {
      style:
        "currency",

      currency:
        "PLN",
    }
  );

const dateFormatter =
  new Intl.DateTimeFormat(
    "pl-PL",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );

export default function AdminTikTokManager({
  products,
}: Props) {
  const router =
    useRouter();

  const [
    isRefreshing,
    startRefreshTransition,
  ] =
    useTransition();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    localProducts,
    setLocalProducts,
  ] =
    useState<
      TikTokAdminProduct[]
    >(
      products
    );

  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

  const [
    category,
    setCategory,
  ] =
    useState(
      "all"
    );

  const [
    view,
    setView,
  ] =
    useState<ViewFilter>(
      "all"
    );

  const [
    savingId,
    setSavingId,
  ] =
    useState<
      string | null
    >(
      null
    );

  useEffect(
    () => {
      setLocalProducts(
        products
      );
    },
    [
      products,
    ]
  );

  const categories =
    useMemo(
      () => [
        ...new Set(
          localProducts
            .map(
              (
                product
              ) =>
                product.category
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (
          first,
          second
        ) =>
          first.localeCompare(
            second,
            "pl"
          )
      ),
      [
        localProducts,
      ]
    );

  const tiktokCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            product.active &&
            product.tiktok_featured
        ).length,
      [
        localProducts,
      ]
    );

  const hiddenTikTokCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            !product.active &&
            product.tiktok_featured
        ).length,
      [
        localProducts,
      ]
    );

  const availableCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            product.active &&
            product.canManage &&
            !product.tiktok_featured
        ).length,
      [
        localProducts,
      ]
    );

  const filteredProducts =
    useMemo(
      () => {
        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              "pl"
            );

        return localProducts
          .filter(
            (
              product
            ) => {
              const haystack =
                [
                  product.name,
                  product.short_name,
                  product.category,
                ]
                  .join(
                    " "
                  )
                  .toLocaleLowerCase(
                    "pl"
                  );

              const matchesQuery =
                !normalizedQuery ||
                haystack.includes(
                  normalizedQuery
                );

              const matchesCategory =
                category ===
                  "all" ||
                product.category ===
                  category;

              let matchesView =
                true;

              if (
                view ===
                "tiktok"
              ) {
                matchesView =
                  product.tiktok_featured;
              }

              if (
                view ===
                "available"
              ) {
                matchesView =
                  product.active &&
                  !product.tiktok_featured;
              }

              if (
                view ===
                "hidden"
              ) {
                matchesView =
                  !product.active;
              }

              return (
                matchesQuery &&
                matchesCategory &&
                matchesView
              );
            }
          )
          .sort(
            (
              first,
              second
            ) => {
              if (
                first.tiktok_featured !==
                second.tiktok_featured
              ) {
                return first.tiktok_featured
                  ? -1
                  : 1;
              }

              const firstTikTokTime =
                first.tiktok_featured_at
                  ? new Date(
                      first.tiktok_featured_at
                    ).getTime()
                  : 0;

              const secondTikTokTime =
                second.tiktok_featured_at
                  ? new Date(
                      second.tiktok_featured_at
                    ).getTime()
                  : 0;

              if (
                firstTikTokTime !==
                secondTikTokTime
              ) {
                return (
                  secondTikTokTime -
                  firstTikTokTime
                );
              }

              return (
                new Date(
                  second.created_at
                ).getTime() -
                new Date(
                  first.created_at
                ).getTime()
              );
            }
          );
      },
      [
        category,
        localProducts,
        query,
        view,
      ]
    );

  function refreshInBackground() {
    startRefreshTransition(
      () => {
        router.refresh();
      }
    );
  }

  async function toggleTikTok(
    product:
      TikTokAdminProduct
  ) {
    if (
      savingId ||
      !product.canManage
    ) {
      return;
    }

    if (
      !product.active &&
      !product.tiktok_featured
    ) {
      window.alert(
        "Najpierw opublikuj produkt. Ukryta oferta nie może zostać dodana do publicznej strony /tiktok."
      );

      return;
    }

    const previousFeatured =
      product.tiktok_featured;

    const previousFeaturedAt =
      product.tiktok_featured_at;

    const nextFeatured =
      !previousFeatured;

    const now =
      new Date()
        .toISOString();

    const nextFeaturedAt =
      nextFeatured
        ? now
        : null;

    setSavingId(
      product.id
    );

    setLocalProducts(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            product.id
              ? {
                  ...item,

                  tiktok_featured:
                    nextFeatured,

                  tiktok_featured_at:
                    nextFeaturedAt,

                  updated_at:
                    now,
                }
              : item
        )
    );

    const {
      error,
    } =
      await supabase
        .from(
          "products"
        )
        .update({
          tiktok_featured:
            nextFeatured,

          tiktok_featured_at:
            nextFeaturedAt,

          updated_at:
            now,
        })
        .eq(
          "id",
          product.id
        );

    if (
      error
    ) {
      console.error(
        "Nie udało się zmienić widoczności produktu na /tiktok:",
        error
      );

      setLocalProducts(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              product.id
                ? {
                    ...item,

                    tiktok_featured:
                      previousFeatured,

                    tiktok_featured_at:
                      previousFeaturedAt,
                  }
                : item
          )
      );

      setSavingId(
        null
      );

      window.alert(
        "Nie udało się zapisać zmiany. Spróbuj ponownie."
      );

      return;
    }

    setSavingId(
      null
    );

    refreshInBackground();
  }

  return (
    <>
      <div className="lg:hidden">
        <section className="px-1 pb-1 pt-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-400">
                Social commerce
              </p>

              <div className="mt-1 flex items-center gap-2">
                <h1 className="text-[30px] font-black leading-none tracking-[-0.055em] text-stone-950">
                  TikTok
                </h1>

                {isRefreshing && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-300 border-r-rose-500" />
                )}
              </div>

              <p className="mt-2 max-w-[290px] text-[11px] leading-5 text-stone-400">
                Włączaj produkty widoczne
                na publicznej stronie
                /tiktok.
              </p>
            </div>

            <Link
              href="/tiktok"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-rose-600 shadow-sm ring-1 ring-stone-200/80 active:scale-[0.96]"
              aria-label="Otwórz publiczną stronę TikTok"
            >
              <ExternalIcon />
            </Link>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-stone-200/80">
          <MobileStat
            label="Na TikToku"
            value={
              tiktokCount
            }
          />

          <MobileStat
            label="Do dodania"
            value={
              availableCount
            }
          />

          <MobileStat
            label="Wszystkie"
            value={
              localProducts.length
            }
          />
        </section>

        {hiddenTikTokCount >
          0 && (
          <div className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 px-3.5 py-3">
            <p className="text-[11px] font-black text-amber-800">
              {
                hiddenTikTokCount
              }{" "}
              ukrytych produktów
              z flagą TikTok
            </p>

            <p className="mt-1 text-[10px] leading-4 text-amber-700/80">
              Nie są widoczne
              publicznie, dopóki
              oferta pozostaje ukryta.
            </p>
          </div>
        )}

        <section className="mt-5">
          <MobileSectionHeader
            title="Znajdź produkt"
            helper={`${filteredProducts.length} wyników`}
          />

          <div className="admin-ios-group mt-2 p-3">
            <div className="relative">
              <SearchIcon />

              <input
                type="search"
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Nazwa produktu lub kategoria"
                className="min-h-[48px] w-full rounded-[13px] border-0 bg-[#f2f2f7] py-2 pl-11 pr-3 text-[16px] font-semibold text-stone-900 outline-none placeholder:font-medium placeholder:text-[#8e8e93] focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <select
              value={
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event.target
                    .value
                )
              }
              aria-label="Kategoria"
              className="mt-2 min-h-[46px] w-full rounded-[13px] border-0 bg-[#f2f2f7] px-3 text-[14px] font-bold text-stone-700 outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="all">
                Wszystkie kategorie
              </option>

              {categories.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="horizontal-scroll -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            <FilterChip
              active={
                view ===
                "all"
              }
              onClick={() =>
                setView(
                  "all"
                )
              }
            >
              Wszystkie
            </FilterChip>

            <FilterChip
              active={
                view ===
                "tiktok"
              }
              onClick={() =>
                setView(
                  "tiktok"
                )
              }
            >
              Na /tiktok{" "}
              {
                tiktokCount +
                hiddenTikTokCount
              }
            </FilterChip>

            <FilterChip
              active={
                view ===
                "available"
              }
              onClick={() =>
                setView(
                  "available"
                )
              }
            >
              Do dodania{" "}
              {
                availableCount
              }
            </FilterChip>

            <FilterChip
              active={
                view ===
                "hidden"
              }
              onClick={() =>
                setView(
                  "hidden"
                )
              }
            >
              Ukryte
            </FilterChip>
          </div>
        </section>

        <section className="mt-5">
          <MobileSectionHeader
            title="Produkty"
            helper={`${filteredProducts.length} z ${localProducts.length}`}
          />

          {filteredProducts.length >
          0 ? (
            <div className="admin-ios-group mt-2 overflow-hidden">
              {filteredProducts.map(
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
                      <div className="ml-[92px] border-t border-stone-100" />
                    )}

                    <MobileProductRow
                      product={
                        product
                      }
                      saving={
                        savingId ===
                        product.id
                      }
                      onToggle={() =>
                        void toggleTikTok(
                          product
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="admin-ios-group mt-2 px-5 py-10 text-center">
              <div className="text-3xl">
                🔎
              </div>

              <p className="mt-3 text-sm font-black text-stone-800">
                Brak pasujących produktów
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-400">
                Zmień wyszukiwanie,
                kategorię albo filtr.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="hidden lg:block">
        <section className="rounded-[26px] border border-black/[0.06] bg-white p-7 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-600">
                  Promocja z social media
                </p>

                {isRefreshing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-[8px] font-black text-stone-400">
                    <span className="h-2 w-2 animate-spin rounded-full border border-stone-400 border-r-transparent" />

                    synchronizacja
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-stone-950">
                Produkty z TikToka
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
                Włącz produkty, które
                aktualnie pokazujecie
                w materiałach. Aktywne
                oferty pojawią się
                automatycznie na publicznej
                stronie /tiktok.
              </p>
            </div>

            <Link
              href="/tiktok"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-[15px] bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-black"
            >
              Otwórz /tiktok ↗
            </Link>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-4 gap-3">
          <StatCard
            label="Na /tiktok"
            value={
              tiktokCount
            }
            helper="widoczne publicznie"
            accent="rose"
          />

          <StatCard
            label="Do dodania"
            value={
              availableCount
            }
            helper="aktywne i edytowalne"
            accent="green"
          />

          <StatCard
            label="Wszystkie"
            value={
              localProducts.length
            }
            helper="produkty w bazie"
            accent="stone"
          />

          <StatCard
            label="Ukryte z flagą"
            value={
              hiddenTikTokCount
            }
            helper="nie są publiczne"
            accent="amber"
          />
        </section>

        <section className="mt-4 rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-sm">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="admin-tiktok-search"
                className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-stone-400"
              >
                Szukaj produktu
              </label>

              <div className="relative">
                <SearchIcon />

                <input
                  id="admin-tiktok-search"
                  type="search"
                  value={
                    query
                  }
                  onChange={(
                    event
                  ) =>
                    setQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Nazwa albo kategoria..."
                  className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] py-2 pl-11 pr-3 text-sm font-semibold outline-none transition focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
                />
              </div>
            </div>

            <div className="w-[240px]">
              <label
                htmlFor="admin-tiktok-category"
                className="mb-1.5 block px-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-stone-400"
              >
                Kategoria
              </label>

              <select
                id="admin-tiktok-category"
                value={
                  category
                }
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
                className="min-h-12 w-full rounded-[15px] border border-black/[0.07] bg-[#f7f7f8] px-3 text-sm font-bold text-stone-800 outline-none focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
              >
                <option value="all">
                  Wszystkie kategorie
                </option>

                {categories.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {
                        item
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
            <FilterChip
              active={
                view ===
                "all"
              }
              onClick={() =>
                setView(
                  "all"
                )
              }
            >
              Wszystkie{" "}
              {
                localProducts.length
              }
            </FilterChip>

            <FilterChip
              active={
                view ===
                "tiktok"
              }
              onClick={() =>
                setView(
                  "tiktok"
                )
              }
            >
              Na TikToku{" "}
              {
                tiktokCount +
                hiddenTikTokCount
              }
            </FilterChip>

            <FilterChip
              active={
                view ===
                "available"
              }
              onClick={() =>
                setView(
                  "available"
                )
              }
            >
              Do dodania{" "}
              {
                availableCount
              }
            </FilterChip>

            <FilterChip
              active={
                view ===
                "hidden"
              }
              onClick={() =>
                setView(
                  "hidden"
                )
              }
            >
              Ukryte
            </FilterChip>
          </div>

          <div className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
            <strong className="font-black text-stone-900">
              {
                filteredProducts.length
              }
            </strong>{" "}
            pasujących produktów
          </div>
        </section>

        {filteredProducts.length >
        0 ? (
          <section className="mt-4 grid gap-3">
            {filteredProducts.map(
              (
                product
              ) => (
                <DesktopProductRow
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  saving={
                    savingId ===
                    product.id
                  }
                  onToggle={() =>
                    void toggleTikTok(
                      product
                    )
                  }
                />
              )
            )}
          </section>
        ) : (
          <div className="mt-4 rounded-[22px] border border-dashed border-stone-200 bg-white px-5 py-12 text-center">
            <div className="text-3xl">
              🔎
            </div>

            <h2 className="mt-3 text-lg font-black text-stone-950">
              Brak pasujących produktów
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Zmień wyszukiwanie,
              kategorię albo filtr.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MobileProductRow({
  product,
  saving,
  onToggle,
}: {
  product:
    TikTokAdminProduct;

  saving:
    boolean;

  onToggle:
    () => void;
}) {
  const publiclyVisible =
    product.active &&
    product.tiktok_featured;

  const disabled =
    saving ||
    !product.canManage ||
    (
      !product.active &&
      !product.tiktok_featured
    );

  return (
    <article className="flex min-h-[112px] items-center gap-3 px-3 py-3">
      <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-[15px] bg-stone-100">
        <img
          src={
            product.image_url
          }
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />

        {publiclyVisible && (
          <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm">
            <VideoIcon />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={[
              "h-2 w-2 shrink-0 rounded-full",
              product.active
                ? "bg-emerald-500"
                : "bg-stone-300",
            ].join(" ")}
          />

          <p className="truncate text-[9px] font-black uppercase tracking-[0.07em] text-stone-400">
            {
              product.category
            }
          </p>
        </div>

        <h2 className="mt-1.5 line-clamp-2 text-[13px] font-black leading-[18px] text-stone-900">
          {
            product.short_name
          }
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[12px] font-black text-stone-700">
            {formatPrice(
              product.price
            )}
          </span>

          {publiclyVisible && (
            <span className="text-[9px] font-black text-rose-600">
              Na /tiktok
            </span>
          )}

          {!product.active &&
            product.tiktok_featured && (
            <span className="text-[9px] font-black text-amber-700">
              Ukryty
            </span>
          )}
        </div>

        {product.tiktok_featured_at && (
          <p className="mt-1 text-[9px] text-stone-400">
            Dodano{" "}
            {formatDate(
              product.tiktok_featured_at
            )}
          </p>
        )}

        {!product.canManage && (
          <p className="mt-1 text-[9px] font-semibold text-stone-400">
            Oferta innego administratora
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={
            product.tiktok_featured
          }
          aria-label={
            product.tiktok_featured
              ? `Usuń ${product.short_name} z /tiktok`
              : `Dodaj ${product.short_name} do /tiktok`
          }
          onClick={
            onToggle
          }
          disabled={
            disabled
          }
          className={[
            "relative h-[31px] w-[51px] rounded-full p-[2px] transition-colors duration-150 active:scale-[0.96] disabled:cursor-not-allowed",
            product.tiktok_featured
              ? "bg-[#34c759]"
              : "bg-[#d1d1d6]",
            disabled
              ? "opacity-45"
              : "",
          ].join(" ")}
        >
          <span
            className={[
              "block h-[27px] w-[27px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-transform duration-150",
              product.tiktok_featured
                ? "translate-x-5"
                : "translate-x-0",
              saving
                ? "animate-pulse"
                : "",
            ].join(" ")}
          />
        </button>

        {product.active && (
          <Link
            href={`/produkt/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-black text-rose-600"
          >
            Podgląd ↗
          </Link>
        )}
      </div>
    </article>
  );
}

function DesktopProductRow({
  product,
  saving,
  onToggle,
}: {
  product:
    TikTokAdminProduct;

  saving:
    boolean;

  onToggle:
    () => void;
}) {
  const publiclyVisible =
    product.active &&
    product.tiktok_featured;

  return (
    <article className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-sm">
      <div className="grid grid-cols-[120px_minmax(0,1fr)_220px] gap-4 p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[15px] bg-stone-100">
          <img
            src={
              product.image_url
            }
            alt={
              product.name
            }
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          {product.tiktok_featured && (
            <span className="absolute left-2 top-2 rounded-full bg-stone-950 px-2.5 py-1 text-[8px] font-black text-white shadow-sm">
              TikTok
            </span>
          )}
        </div>

        <div className="min-w-0 py-0.5">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge
              active={
                product.active
              }
            />

            {publiclyVisible && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-black text-rose-700">
                ● Na /tiktok
              </span>
            )}

            {!product.active &&
              product.tiktok_featured && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-700">
                Flaga zachowana
              </span>
            )}
          </div>

          <p className="mt-2 truncate text-[9px] font-black uppercase tracking-[0.09em] text-rose-600 sm:text-[10px]">
            {
              product.category
            }
          </p>

          <h2 className="mt-1 line-clamp-2 text-lg font-black leading-6 text-stone-950">
            {
              product.short_name
            }
          </h2>

          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-black text-stone-950">
              {formatPrice(
                product.price
              )}
            </span>

            {product.old_price !==
              null && (
              <span className="text-xs font-semibold text-stone-400 line-through">
                {formatPrice(
                  product.old_price
                )}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-400">
            {product.active && (
              <Link
                href={`/produkt/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-rose-600"
              >
                Produkt ↗
              </Link>
            )}

            {product.tiktok_featured_at && (
              <span>
                Dodano:{" "}
                {formatDate(
                  product.tiktok_featured_at
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center border-l border-stone-100 pl-4">
          <div className="w-full">
            {product.canManage ? (
              <button
                type="button"
                onClick={
                  onToggle
                }
                disabled={
                  saving ||
                  (
                    !product.active &&
                    !product.tiktok_featured
                  )
                }
                className={[
                  "flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] px-4 text-sm font-black transition active:scale-[0.99] disabled:cursor-not-allowed",
                  product.tiktok_featured
                    ? "border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : product.active
                      ? "bg-stone-950 text-white hover:bg-black"
                      : "border border-stone-200 bg-stone-100 text-stone-400",
                ].join(" ")}
              >
                {saving ? (
                  <>
                    <Spinner />

                    Zapisuję
                  </>
                ) : product.tiktok_featured ? (
                  "Usuń z /tiktok"
                ) : product.active ? (
                  "+ Dodaj do /tiktok"
                ) : (
                  "Najpierw opublikuj"
                )}
              </button>
            ) : (
              <div className="rounded-[15px] border border-stone-200 bg-stone-50 px-4 py-3 text-center">
                <p className="text-[10px] font-black text-stone-500">
                  🔒 Brak uprawnień
                </p>

                <p className="mt-1 text-[9px] leading-4 text-stone-400">
                  Ta oferta należy
                  do innego administratora.
                </p>
              </div>
            )}

            {!product.active &&
              product.tiktok_featured &&
              product.canManage && (
              <p className="mt-2 text-center text-[9px] leading-4 text-amber-700">
                Produkt jest ukryty,
                więc nie wyświetla się
                publicznie na /tiktok.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MobileSectionHeader({
  title,
  helper,
}: {
  title:
    string;

  helper:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <h2 className="text-[13px] font-black uppercase tracking-[0.04em] text-stone-500">
        {
          title
        }
      </h2>

      <span className="text-[10px] font-bold text-stone-400">
        {
          helper
        }
      </span>
    </div>
  );
}

function MobileStat({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="border-r border-stone-100 px-2 py-3 text-center last:border-r-0">
      <p className="text-[18px] font-black tracking-[-0.04em] text-stone-900">
        {
          value
        }
      </p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.05em] text-stone-400">
        {
          label
        }
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  accent,
}: {
  label:
    string;

  value:
    number;

  helper:
    string;

  accent:
    | "rose"
    | "green"
    | "stone"
    | "amber";
}) {
  const accentClass =
    accent ===
    "rose"
      ? "bg-rose-50 text-rose-700"
      : accent ===
          "green"
        ? "bg-emerald-50 text-emerald-700"
        : accent ===
            "amber"
          ? "bg-amber-50 text-amber-700"
          : "bg-stone-100 text-stone-700";

  return (
    <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-sm">
      <span
        className={[
          "inline-flex rounded-full px-2.5 py-1 text-[9px] font-black",
          accentClass,
        ].join(" ")}
      >
        {
          label
        }
      </span>

      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-stone-950">
        {
          value
        }
      </p>

      <p className="mt-1 text-[10px] font-semibold text-stone-400">
        {
          helper
        }
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-black transition active:scale-[0.97]",
        active
          ? "border-stone-950 bg-stone-950 text-white"
          : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50",
      ].join(" ")}
    >
      {
        children
      }
    </button>
  );
}

function StatusBadge({
  active,
}: {
  active:
    boolean;
}) {
  return active ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
      ● Aktywna
    </span>
  ) : (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black text-stone-600">
      ● Ukryta
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 8 7 4-7 4Z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function formatPrice(
  value:
    | number
    | string
) {
  return priceFormatter.format(
    Number(
      value
    )
  );
}

function formatDate(
  value:
    string
) {
  return dateFormatter.format(
    new Date(
      value
    )
  );
}