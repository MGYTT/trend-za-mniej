"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminProductActions from "@/components/admin/AdminProductActions";
import AdminProductOwnerSelect from "@/components/admin/AdminProductOwnerSelect";

import {
  canManageOffer,
  type AdminRole,
  type AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/client";

type AdminProduct = {
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
};

type ProductStatRow = {
  product_id: string;

  clicks:
    | number
    | string;
};

type StatusFilter =
  | "all"
  | "active"
  | "hidden"
  | "featured";

type OwnershipFilter =
  | "all"
  | "mine"
  | "others"
  | "unassigned";

type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name";

type Props = {
  products:
    AdminProduct[];

  currentUserId:
    string;

  currentRole:
    AdminRole;

  ownerModeActive:
    boolean;

  teamMembers:
    AdminTeamMember[];
};

const PAGE_SIZE =
  20;

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

export default function AdminProductList({
  products,
  currentUserId,
  currentRole,
  ownerModeActive,
  teamMembers,
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

  /*
   * Lokalne produkty pozwalają
   * aktualizować interfejs
   * natychmiast bez czekania
   * na router.refresh().
   */
  const [
    localProducts,
    setLocalProducts,
  ] =
    useState<
      AdminProduct[]
    >(
      products
    );

  const [
    productStats,
    setProductStats,
  ] =
    useState<
      Record<
        string,
        number
      >
    >(
      {}
    );

  const [
    statsLoaded,
    setStatsLoaded,
  ] =
    useState(
      false
    );

  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      "all"
    );

  const [
    ownership,
    setOwnership,
  ] =
    useState<OwnershipFilter>(
      "all"
    );

  const [
    category,
    setCategory,
  ] =
    useState(
      "all"
    );

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "newest"
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(
      false
    );

  const [
    visibleLimit,
    setVisibleLimit,
  ] =
    useState(
      PAGE_SIZE
    );

  /*
   * Gdy Next.js zakończy
   * synchronizację w tle,
   * przyjmujemy świeże dane
   * z serwera.
   */
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

  /*
   * Statystyki kliknięć nie
   * blokują już pierwszego
   * renderu panelu.
   */
  useEffect(
    () => {
      let cancelled =
        false;

      async function loadStats() {
        const {
          data,
          error,
        } =
          await supabase.rpc(
            "get_product_click_stats",
            {
              p_days:
                30,
            }
          );

        if (
          cancelled
        ) {
          return;
        }

        if (
          error
        ) {
          console.error(
            "Nie udało się pobrać statystyk produktów:",
            error
          );

          setStatsLoaded(
            true
          );

          return;
        }

        const nextStats =
          (
            (
              data ??
              []
            ) as
              ProductStatRow[]
          ).reduce<
            Record<
              string,
              number
            >
          >(
            (
              result,
              item
            ) => {
              result[
                item.product_id
              ] =
                Number(
                  item.clicks
                ) ||
                0;

              return result;
            },
            {}
          );

        setProductStats(
          nextStats
        );

        setStatsLoaded(
          true
        );
      }

      void loadStats();

      return () => {
        cancelled =
          true;
      };
    },
    [
      supabase,
    ]
  );

  /*
   * Po zmianie filtrów wracamy
   * do pierwszych 20 ofert.
   */
  useEffect(
    () => {
      setVisibleLimit(
        PAGE_SIZE
      );
    },
    [
      query,
      status,
      ownership,
      category,
      sort,
    ]
  );

  function refreshInBackground() {
    startRefreshTransition(
      () => {
        router.refresh();
      }
    );
  }

  function updateProduct(
    id:
      string,
    patch:
      Partial<AdminProduct>
  ) {
    setLocalProducts(
      (
        current
      ) =>
        current.map(
          (
            product
          ) =>
            product.id ===
            id
              ? {
                  ...product,
                  ...patch,
                }
              : product
        )
    );
  }

  function removeProduct(
    id:
      string
  ) {
    setLocalProducts(
      (
        current
      ) =>
        current.filter(
          (
            product
          ) =>
            product.id !==
            id
        )
    );
  }

  function restoreProduct(
    product:
      AdminProduct
  ) {
    setLocalProducts(
      (
        current
      ) => {
        if (
          current.some(
            (
              item
            ) =>
              item.id ===
              product.id
          )
        ) {
          return current;
        }

        return [
          ...current,
          product,
        ];
      }
    );
  }

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

  const membersById =
    useMemo(
      () =>
        new Map(
          teamMembers.map(
            (
              member
            ) => [
              member.userId,
              member,
            ]
          )
        ),
      [
        teamMembers,
      ]
    );

  const activeCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            product.active
        ).length,
      [
        localProducts,
      ]
    );

  const hiddenCount =
    localProducts.length -
    activeCount;

  const featuredCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            product.featured
        ).length,
      [
        localProducts,
      ]
    );

  const mineCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            product.created_by ===
            currentUserId
        ).length,
      [
        localProducts,
        currentUserId,
      ]
    );

  const othersCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            Boolean(
              product.created_by
            ) &&
            product.created_by !==
              currentUserId
        ).length,
      [
        localProducts,
        currentUserId,
      ]
    );

  const unassignedCount =
    useMemo(
      () =>
        localProducts.filter(
          (
            product
          ) =>
            !product.created_by
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

        const result =
          localProducts.filter(
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

              let matchesStatus =
                true;

              if (
                status ===
                "active"
              ) {
                matchesStatus =
                  product.active;
              }

              if (
                status ===
                "hidden"
              ) {
                matchesStatus =
                  !product.active;
              }

              if (
                status ===
                "featured"
              ) {
                matchesStatus =
                  product.featured;
              }

              let matchesOwnership =
                true;

              if (
                ownership ===
                "mine"
              ) {
                matchesOwnership =
                  product.created_by ===
                  currentUserId;
              }

              if (
                ownership ===
                "others"
              ) {
                matchesOwnership =
                  Boolean(
                    product.created_by
                  ) &&
                  product.created_by !==
                    currentUserId;
              }

              if (
                ownership ===
                "unassigned"
              ) {
                matchesOwnership =
                  !product.created_by;
              }

              return (
                matchesQuery &&
                matchesCategory &&
                matchesStatus &&
                matchesOwnership
              );
            }
          );

        result.sort(
          (
            first,
            second
          ) => {
            switch (
              sort
            ) {
              case "oldest":
                return (
                  new Date(
                    first.created_at
                  ).getTime() -
                  new Date(
                    second.created_at
                  ).getTime()
                );

              case "price-asc":
                return (
                  Number(
                    first.price
                  ) -
                  Number(
                    second.price
                  )
                );

              case "price-desc":
                return (
                  Number(
                    second.price
                  ) -
                  Number(
                    first.price
                  )
                );

              case "name":
                return first.short_name.localeCompare(
                  second.short_name,
                  "pl"
                );

              default:
                return (
                  new Date(
                    second.created_at
                  ).getTime() -
                  new Date(
                    first.created_at
                  ).getTime()
                );
            }
          }
        );

        return result;
      },
      [
        localProducts,
        query,
        status,
        ownership,
        category,
        sort,
        currentUserId,
      ]
    );

  const visibleProducts =
    useMemo(
      () =>
        filteredProducts.slice(
          0,
          visibleLimit
        ),
      [
        filteredProducts,
        visibleLimit,
      ]
    );

  const hasMoreProducts =
    visibleProducts.length <
    filteredProducts.length;

  const hasFilters =
    query.trim() !==
      "" ||
    status !==
      "all" ||
    ownership !==
      "all" ||
    category !==
      "all" ||
    sort !==
      "newest";

  function clearFilters() {
    setQuery(
      ""
    );

    setStatus(
      "all"
    );

    setOwnership(
      "all"
    );

    setCategory(
      "all"
    );

    setSort(
      "newest"
    );

    setFiltersOpen(
      false
    );
  }

  function getOwnerLabel(
    product:
      AdminProduct
  ) {
    if (
      !product.created_by
    ) {
      return "Nieprzypisana";
    }

    if (
      product.created_by ===
      currentUserId
    ) {
      return "Twoja oferta";
    }

    if (
      currentRole !==
      "owner"
    ) {
      return "Inny administrator";
    }

    return (
      membersById.get(
        product.created_by
      )?.displayName ??
      "Administrator"
    );
  }

  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              Zarządzanie ofertami
            </p>

            {isRefreshing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-1 text-[8px] font-black text-stone-400">
                <span className="h-2 w-2 animate-spin rounded-full border border-stone-400 border-r-transparent" />

                synchronizacja
              </span>
            )}
          </div>

          <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
            Oferty
          </h2>

          <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
            Zmiany widoczności,
            usuwanie i przypisanie
            właściciela działają
            natychmiast. Synchronizacja
            odbywa się w tle.
          </p>
        </div>

        <Link
          href="/admin/statystyki?days=30"
          className="hidden text-sm font-black text-rose-600 hover:text-rose-700 sm:block"
        >
          Analityka →
        </Link>
      </div>

      <div className="mt-4 rounded-[20px] border border-stone-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
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
              placeholder="Szukaj oferty..."
              className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (
                  current
                ) =>
                  !current
              )
            }
            aria-expanded={
              filtersOpen
            }
            className={[
              "flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-black transition lg:hidden",
              filtersOpen ||
              hasFilters
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-stone-200 bg-white text-stone-600",
            ].join(
              " "
            )}
          >
            <FilterIcon />

            Filtry
          </button>
        </div>

        <div className="horizontal-scroll -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          <StatusChip
            active={
              status ===
              "all"
            }
            onClick={() =>
              setStatus(
                "all"
              )
            }
          >
            Wszystkie{" "}
            {
              localProducts.length
            }
          </StatusChip>

          <StatusChip
            active={
              status ===
              "active"
            }
            onClick={() =>
              setStatus(
                "active"
              )
            }
          >
            Aktywne{" "}
            {
              activeCount
            }
          </StatusChip>

          <StatusChip
            active={
              status ===
              "hidden"
            }
            onClick={() =>
              setStatus(
                "hidden"
              )
            }
          >
            Ukryte{" "}
            {
              hiddenCount
            }
          </StatusChip>

          <StatusChip
            active={
              status ===
              "featured"
            }
            onClick={() =>
              setStatus(
                "featured"
              )
            }
          >
            🔥{" "}
            {
              featuredCount
            }
          </StatusChip>
        </div>

        {ownerModeActive && (
          <div className="horizontal-scroll -mx-3 mt-2 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            <StatusChip
              active={
                ownership ===
                "all"
              }
              onClick={() =>
                setOwnership(
                  "all"
                )
              }
            >
              Wszyscy
            </StatusChip>

            <StatusChip
              active={
                ownership ===
                "mine"
              }
              onClick={() =>
                setOwnership(
                  "mine"
                )
              }
            >
              Moje{" "}
              {
                mineCount
              }
            </StatusChip>

            <StatusChip
              active={
                ownership ===
                "others"
              }
              onClick={() =>
                setOwnership(
                  "others"
                )
              }
            >
              Innych{" "}
              {
                othersCount
              }
            </StatusChip>

            {unassignedCount >
              0 && (
              <StatusChip
                active={
                  ownership ===
                  "unassigned"
                }
                onClick={() =>
                  setOwnership(
                    "unassigned"
                  )
                }
              >
                Nieprzypisane{" "}
                {
                  unassignedCount
                }
              </StatusChip>
            )}
          </div>
        )}

        <div
          className={[
            "mt-3 gap-3 border-t border-stone-100 pt-3",
            filtersOpen
              ? "grid"
              : "hidden",
            "lg:grid lg:grid-cols-2",
          ].join(
            " "
          )}
        >
          <FilterSelect
            label="Kategoria"
            value={
              category
            }
            onChange={
              setCategory
            }
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
          </FilterSelect>

          <FilterSelect
            label="Sortowanie"
            value={
              sort
            }
            onChange={(
              value
            ) =>
              setSort(
                value as
                  SortOption
              )
            }
          >
            <option value="newest">
              Najnowsze
            </option>

            <option value="oldest">
              Najstarsze
            </option>

            <option value="price-asc">
              Cena: rosnąco
            </option>

            <option value="price-desc">
              Cena: malejąco
            </option>

            <option value="name">
              Nazwa A–Z
            </option>
          </FilterSelect>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <p className="text-xs text-stone-500">
            <strong className="font-black text-stone-900">
              {
                filteredProducts.length
              }
            </strong>{" "}
            z{" "}
            {
              localProducts.length
            }
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="rounded-full px-3 py-1.5 text-xs font-black text-rose-600 transition hover:bg-rose-50"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {localProducts.length ===
      0 ? (
        <EmptyProducts />
      ) : filteredProducts.length ===
        0 ? (
        <EmptyFilters
          onClear={
            clearFilters
          }
        />
      ) : (
        <>
          <div className="mt-4 grid gap-3">
            {visibleProducts.map(
              (
                product
              ) => {
                const clicks =
                  productStats[
                    product.id
                  ] ??
                  0;

                const canManage =
                  canManageOffer({
                    currentUserId,
                    currentRole,
                    ownerModeActive,

                    productOwnerId:
                      product.created_by,
                  });

                const ownerLabel =
                  getOwnerLabel(
                    product
                  );

                return (
                  <article
                    key={
                      product.id
                    }
                    className="overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4 sm:p-4 lg:grid-cols-[120px_minmax(0,1fr)_210px]">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-stone-100">
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

                        {product.featured && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black text-orange-700 shadow-sm">
                            🔥
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 py-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge
                            active={
                              product.active
                            }
                          />

                          <span className="max-w-full truncate rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black text-stone-600 sm:text-[10px]">
                            {
                              product.category
                            }
                          </span>

                          <span
                            className={[
                              "max-w-full truncate rounded-full px-2.5 py-1 text-[9px] font-black sm:text-[10px]",
                              product.created_by ===
                              currentUserId
                                ? "bg-blue-50 text-blue-700"
                                : !product.created_by
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-violet-50 text-violet-700",
                            ].join(
                              " "
                            )}
                          >
                            {product.created_by ===
                            currentUserId
                              ? "👤 Moja"
                              : !product.created_by
                                ? "⚠ Nieprzypisana"
                                : `👤 ${ownerLabel}`}
                          </span>
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-stone-900 sm:text-lg sm:leading-6">
                          {
                            product.short_name
                          }
                        </h3>

                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-base font-black text-stone-900 sm:text-xl">
                            {formatPrice(
                              product.price
                            )}
                          </span>

                          {product.old_price !==
                            null && (
                            <span className="text-[10px] font-semibold text-stone-400 line-through sm:text-xs">
                              {formatPrice(
                                product.old_price
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-stone-400 sm:text-xs">
                          <span>
                            🖱️{" "}
                            <strong className="text-stone-700">
                              {statsLoaded
                                ? clicks
                                : "…"}
                            </strong>
                          </span>

                          <span>
                            {formatDate(
                              product.created_at
                            )}
                          </span>

                          {product.active && (
                            <Link
                              href={`/produkt/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-black text-rose-600"
                            >
                              Podgląd ↗
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 border-t border-stone-100 pt-3 lg:col-span-1 lg:flex lg:items-center lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        <div className="w-full">
                          <AdminProductActions
                            id={
                              product.id
                            }
                            slug={
                              product.slug
                            }
                            active={
                              product.active
                            }
                            imageUrl={
                              product.image_url
                            }
                            canManage={
                              canManage
                            }
                            onActiveChange={(
                              nextActive
                            ) =>
                              updateProduct(
                                product.id,
                                {
                                  active:
                                    nextActive,

                                  updated_at:
                                    new Date()
                                      .toISOString(),
                                }
                              )
                            }
                            onDeleteOptimistic={() =>
                              removeProduct(
                                product.id
                              )
                            }
                            onDeleteRollback={() =>
                              restoreProduct(
                                product
                              )
                            }
                            onCommitted={
                              refreshInBackground
                            }
                          />

                          {currentRole ===
                            "owner" &&
                            ownerModeActive && (
                            <AdminProductOwnerSelect
                              productId={
                                product.id
                              }
                              ownerId={
                                product.created_by
                              }
                              members={
                                teamMembers
                              }
                              onOwnerChange={(
                                ownerId
                              ) =>
                                updateProduct(
                                  product.id,
                                  {
                                    created_by:
                                      ownerId ||
                                      null,

                                    updated_at:
                                      new Date()
                                        .toISOString(),
                                  }
                                )
                              }
                              onCommitted={
                                refreshInBackground
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {hasMoreProducts && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleLimit(
                    (
                      current
                    ) =>
                      current +
                      PAGE_SIZE
                  )
                }
                className="min-h-11 rounded-xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700 active:scale-[0.98]"
              >
                Pokaż kolejne{" "}
                {
                  Math.min(
                    PAGE_SIZE,
                    filteredProducts.length -
                      visibleProducts.length
                  )
                }

                <span className="ml-1 text-stone-400">
                  (
                  {
                    visibleProducts.length
                  }
                  /
                  {
                    filteredProducts.length
                  }
                  )
                </span>
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href="/admin/statystyki?days=30"
        className="mt-4 flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-black text-stone-700 sm:hidden"
      >
        Pełna analityka →
      </Link>
    </section>
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

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function StatusChip({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black transition active:scale-[0.98]",
        active
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-stone-200 bg-white text-stone-500",
      ].join(
        " "
      )}
    >
      {children}
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
    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-black text-green-700 sm:text-[10px]">
      ● Aktywna
    </span>
  ) : (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black text-stone-600 sm:text-[10px]">
      ● Ukryta
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-stone-500">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
      >
        {children}
      </select>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="mt-4 rounded-[20px] border border-dashed border-stone-200 bg-white px-5 py-12 text-center">
      <div className="text-3xl">
        🛍️
      </div>

      <h3 className="mt-3 text-lg font-black">
        Brak ofert
      </h3>

      <p className="mt-1 text-sm text-stone-500">
        Dodaj pierwszy produkt.
      </p>

      <Link
        href="/admin/nowa-oferta"
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-rose-600 px-5 text-sm font-black text-white"
      >
        + Dodaj ofertę
      </Link>
    </div>
  );
}

function EmptyFilters({
  onClear,
}: {
  onClear:
    () => void;
}) {
  return (
    <div className="mt-4 rounded-[20px] border border-dashed border-stone-200 bg-white px-5 py-12 text-center">
      <div className="text-3xl">
        🔎
      </div>

      <h3 className="mt-3 text-lg font-black">
        Brak pasujących ofert
      </h3>

      <p className="mt-1 text-sm text-stone-500">
        Zmień wyszukiwanie albo
        wyczyść filtry.
      </p>

      <button
        type="button"
        onClick={
          onClear
        }
        className="mt-5 min-h-11 rounded-xl bg-rose-50 px-5 text-sm font-black text-rose-700"
      >
        Wyczyść filtry
      </button>
    </div>
  );
}