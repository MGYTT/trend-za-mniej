"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  buildSuggestedProductSlug,
  findAvailableProductSlug,
  getProductSlugIssues,
  isProductSlugAvailable,
  sanitizeProductSlug,
  type ProductSlugReservation,
} from "@/lib/product-slug";

import type {
  SeoQualityAudit,
  SeoQualityIssue,
  SeoQualityStatus,
} from "@/lib/seo-quality";

import {
  createClient,
} from "@/lib/supabase/client";

export type AdminSeoAuditProduct =
  SeoQualityAudit & {
    canManage: boolean;
  };

type Filter =
  | "all"
  | "critical"
  | "warning"
  | "good"
  | "hidden";

export default function AdminSeoQualityManager({
  products,
  slugReservations,
}: {
  products:
    AdminSeoAuditProduct[];

  slugReservations:
    ProductSlugReservation[];
}) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<Filter>(
    "all"
  );

  const [
    reservations,
    setReservations,
  ] = useState<
    ProductSlugReservation[]
  >(
    slugReservations
  );

  const [
    currentSlugs,
    setCurrentSlugs,
  ] = useState<
    Record<
      string,
      string
    >
  >(
    () =>
      Object.fromEntries(
        products.map(
          (
            product
          ) => [
            product.id,
            product.slug,
          ]
        )
      )
  );

  useEffect(
    () => {
      setReservations(
        slugReservations
      );
    },
    [
      slugReservations,
    ]
  );

  useEffect(
    () => {
      setCurrentSlugs(
        Object.fromEntries(
          products.map(
            (
              product
            ) => [
              product.id,
              product.slug,
            ]
          )
        )
      );
    },
    [
      products,
    ]
  );

  const publicProducts =
    useMemo(
      () =>
        products.filter(
          (
            product
          ) =>
            product.active
        ),
      [products]
    );

  const hiddenProducts =
    products.length -
    publicProducts.length;

  const criticalCount =
    publicProducts.filter(
      (
        product
      ) =>
        product.status ===
        "critical"
    ).length;

  const warningCount =
    publicProducts.filter(
      (
        product
      ) =>
        product.status ===
        "warning"
    ).length;

  const goodCount =
    publicProducts.filter(
      (
        product
      ) =>
        product.status ===
        "good"
    ).length;

  const averageScore =
    publicProducts.length >
    0
      ? Math.round(
          publicProducts.reduce(
            (
              sum,
              product
            ) =>
              sum +
              product.score,
            0
          ) /
            publicProducts.length
        )
      : 100;

  const topIssues =
    useMemo(
      () => {
        const counts =
          new Map<
            string,
            {
              issue:
                SeoQualityIssue;

              count:
                number;
            }
          >();

        for (
          const product
          of publicProducts
        ) {
          for (
            const issue
            of product.issues
          ) {
            const current =
              counts.get(
                issue.id
              );

            counts.set(
              issue.id,
              {
                issue,

                count:
                  (
                    current?.count ??
                    0
                  ) +
                  1,
              }
            );
          }
        }

        return Array.from(
          counts.values()
        )
          .sort(
            (
              first,
              second
            ) =>
              second.count -
              first.count
          )
          .slice(
            0,
            3
          );
      },
      [publicProducts]
    );

  const visibleProducts =
    useMemo(
      () => {
        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              "pl"
            );

        return products
          .filter(
            (
              product
            ) => {
              if (
                filter ===
                "hidden"
              ) {
                return !product.active;
              }

              if (
                !product.active
              ) {
                return false;
              }

              if (
                filter ===
                "all"
              ) {
                return true;
              }

              return (
                product.status ===
                filter
              );
            }
          )
          .filter(
            (
              product
            ) => {
              if (
                !normalizedQuery
              ) {
                return true;
              }

              const currentSlug =
                currentSlugs[
                  product.id
                ] ??
                product.slug;

              return [
                product.name,
                product.shortName,
                product.category,
                currentSlug,
              ].some(
                (
                  value
                ) =>
                  value
                    .toLocaleLowerCase(
                      "pl"
                    )
                    .includes(
                      normalizedQuery
                    )
              );
            }
          )
          .sort(
            (
              first,
              second
            ) => {
              if (
                first.active !==
                second.active
              ) {
                return first.active
                  ? -1
                  : 1;
              }

              if (
                first.score !==
                second.score
              ) {
                return (
                  first.score -
                  second.score
                );
              }

              return first.shortName.localeCompare(
                second.shortName,
                "pl"
              );
            }
          );
      },
      [
        currentSlugs,
        filter,
        products,
        query,
      ]
    );

  function handleSlugChanged({
    productId,
    oldSlug,
    newSlug,
  }: {
    productId: string;
    oldSlug: string;
    newSlug: string;
  }) {
    setCurrentSlugs(
      (
        current
      ) => ({
        ...current,

        [productId]:
          newSlug,
      })
    );

    setReservations(
      (
        current
      ) => {
        const next =
          current.filter(
            (
              reservation
            ) =>
              !(
                reservation.productId ===
                  productId &&
                (
                  reservation.slug ===
                    oldSlug ||
                  reservation.slug ===
                    newSlug
                )
              )
          );

        return [
          ...next,

          {
            slug:
              oldSlug,

            productId,

            kind:
              "redirect",
          },

          {
            slug:
              newSlug,

            productId,

            kind:
              "current",
          },
        ];
      }
    );
  }

  return (
    <div>
      <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600 sm:text-xs">
              SEO Quality
            </p>

            <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em] text-stone-950 sm:text-4xl">
              Audyt stron produktów
            </h1>

            <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
              Sprawdź jakość nazw,
              opisów, adresów URL,
              obrazów i unikalności
              publicznych stron.
              W tej zakładce możesz
              też bezpiecznie zmieniać
              stały adres produktu.
              Stare adresy są
              zachowywane jako
              przekierowania.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-stone-200 bg-white px-4 text-xs font-black text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Sitemap ↗
            </Link>

            <Link
              href="/admin/nowa-oferta"
              className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-stone-950 px-4 text-xs font-black text-white transition hover:bg-stone-800"
            >
              + Nowa oferta
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard
          label="Publiczne"
          value={
            publicProducts.length
          }
          helper="stron produktów"
          tone="neutral"
        />

        <SummaryCard
          label="Średni wynik"
          value={
            averageScore
          }
          helper="na 100 punktów"
          tone={
            averageScore >=
            90
              ? "good"
              : averageScore >=
                  70
                ? "warning"
                : "critical"
          }
        />

        <SummaryCard
          label="Pilne"
          value={
            criticalCount
          }
          helper="warto poprawić najpierw"
          tone="critical"
        />

        <SummaryCard
          label="Do poprawy"
          value={
            warningCount
          }
          helper="drobniejsze problemy"
          tone="warning"
        />

        <SummaryCard
          label="Dobre"
          value={
            goodCount
          }
          helper="bez istotnych uwag"
          tone="good"
        />
      </section>

      <section className="mt-4 overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Priorytety
              </p>

              <h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-stone-950 sm:text-xl">
                Najczęstsze problemy
              </h2>
            </div>

            <span className="text-[10px] font-bold text-stone-400">
              tylko publiczne
            </span>
          </div>
        </div>

        {topIssues.length >
        0 ? (
          <div className="grid divide-y divide-stone-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            {topIssues.map(
              (
                item
              ) => (
                <div
                  key={
                    item.issue.id
                  }
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <IssueSeverityBadge
                      severity={
                        item.issue
                          .severity
                      }
                    />

                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-black text-stone-600">
                      {item.count}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-black leading-5 text-stone-900">
                    {
                      item.issue
                        .title
                    }
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-stone-500 sm:text-xs">
                    {
                      item.issue
                        .recommendation
                    }
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm font-black text-emerald-700">
              Wszystkie publiczne
              produkty wyglądają
              dobrze.
            </p>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
            Znajdź produkt
          </span>

          <div className="relative mt-2">
            <SearchIcon />

            <input
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
              placeholder="Nazwa, kategoria lub slug…"
              className="h-12 w-full rounded-[15px] border border-stone-200 bg-stone-50 pl-11 pr-4 text-[16px] font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
            />
          </div>
        </label>

        <div className="horizontal-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterButton
            active={
              filter ===
              "all"
            }
            onClick={() =>
              setFilter(
                "all"
              )
            }
          >
            Publiczne ({
              publicProducts.length
            })
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "critical"
            }
            onClick={() =>
              setFilter(
                "critical"
              )
            }
          >
            Pilne ({
              criticalCount
            })
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "warning"
            }
            onClick={() =>
              setFilter(
                "warning"
              )
            }
          >
            Do poprawy ({
              warningCount
            })
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "good"
            }
            onClick={() =>
              setFilter(
                "good"
              )
            }
          >
            Dobre ({
              goodCount
            })
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "hidden"
            }
            onClick={() =>
              setFilter(
                "hidden"
              )
            }
          >
            Ukryte ({
              hiddenProducts
            })
          </FilterButton>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-black text-stone-700">
            {
              visibleProducts.length
            }{" "}
            produktów
          </p>

          <p className="text-[10px] font-semibold text-stone-400">
            najsłabsze wyniki
            pierwsze
          </p>
        </div>

        {visibleProducts.length ===
        0 ? (
          <div className="rounded-[22px] border border-stone-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black text-stone-800">
              Brak produktów
            </p>

            <p className="mt-1 text-xs leading-5 text-stone-400">
              Zmień filtr lub
              wyszukiwaną frazę.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleProducts.map(
              (
                product
              ) => {
                const currentSlug =
                  currentSlugs[
                    product.id
                  ] ??
                  product.slug;

                return (
                  <SeoProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    currentSlug={
                      currentSlug
                    }
                    reservations={
                      reservations
                    }
                    onSlugChanged={
                      handleSlugChanged
                    }
                  />
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: number;
  helper: string;

  tone:
    | "neutral"
    | "good"
    | "warning"
    | "critical";
}) {
  const valueClass =
    tone ===
    "good"
      ? "text-emerald-700"
      : tone ===
          "warning"
        ? "text-amber-700"
        : tone ===
            "critical"
          ? "text-red-700"
          : "text-stone-950";

  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-3xl font-black tracking-[-0.05em]",
          valueClass,
        ].join(
          " "
        )}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-stone-400 sm:text-[10px]">
        {helper}
      </p>
    </div>
  );
}

function SeoProductCard({
  product,
  currentSlug,
  reservations,
  onSlugChanged,
}: {
  product:
    AdminSeoAuditProduct;

  currentSlug:
    string;

  reservations:
    ProductSlugReservation[];

  onSlugChanged:
    (input: {
      productId: string;
      oldSlug: string;
      newSlug: string;
    }) => void;
}) {
  const [
    urlOpen,
    setUrlOpen,
  ] = useState(
    false
  );

  const shownIssues =
    product.issues.slice(
      0,
      3
    );

  return (
    <article className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {product.imageUrl ? (
            <img
              src={
                product.imageUrl
              }
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[88px] w-[68px] shrink-0 rounded-[15px] bg-stone-100 object-cover sm:h-[104px] sm:w-[80px]"
            />
          ) : (
            <div className="flex h-[88px] w-[68px] shrink-0 items-center justify-center rounded-[15px] bg-stone-100 px-2 text-center text-[9px] font-black text-stone-400 sm:h-[104px] sm:w-[80px]">
              Brak zdjęcia
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {product.active ? (
                <StatusBadge
                  status={
                    product.status
                  }
                />
              ) : (
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black text-stone-500">
                  Ukryta
                </span>
              )}

              <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[9px] font-black text-stone-500">
                SEO {product.score}/100
              </span>
            </div>

            <h2 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-stone-950 sm:text-base sm:leading-6">
              {
                product.shortName
              }
            </h2>

            <p className="mt-1 text-[10px] font-semibold text-stone-400 sm:text-xs">
              {
                product.category
              }
            </p>

            <p className="mt-1 truncate text-[9px] text-stone-400 sm:text-[10px]">
              /produkt/{
                currentSlug
              }
            </p>
          </div>
        </div>

        {product.issues.length ===
        0 ? (
          <div className="mt-4 rounded-[15px] border border-emerald-100 bg-emerald-50 px-3.5 py-3">
            <p className="text-xs font-black text-emerald-800">
              ✓ Bez istotnych uwag
            </p>

            <p className="mt-1 text-[10px] leading-5 text-emerald-700">
              Nazwa, opis, URL,
              obraz i unikalność
              nie wykazały problemów
              objętych tym audytem.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {shownIssues.map(
              (
                issue
              ) => (
                <IssueRow
                  key={
                    issue.id
                  }
                  issue={
                    issue
                  }
                />
              )
            )}

            {product.issues.length >
              shownIssues.length && (
              <details className="rounded-[14px] border border-stone-200 bg-stone-50">
                <summary className="cursor-pointer px-3.5 py-3 text-[10px] font-black text-stone-600">
                  Pokaż pozostałe {product.issues.length - shownIssues.length}
                </summary>

                <div className="space-y-2 border-t border-stone-200 p-2">
                  {product.issues
                    .slice(
                      shownIssues.length
                    )
                    .map(
                      (
                        issue
                      ) => (
                        <IssueRow
                          key={
                            issue.id
                          }
                          issue={
                            issue
                          }
                        />
                      )
                    )}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {urlOpen && (
        <ProductSlugEditor
          product={
            product
          }
          currentSlug={
            currentSlug
          }
          reservations={
            reservations
          }
          onSlugChanged={
            onSlugChanged
          }
        />
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 bg-stone-50/70 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() =>
            setUrlOpen(
              (
                current
              ) =>
                !current
            )
          }
          className={[
            "inline-flex min-h-10 items-center justify-center rounded-[13px] border px-3.5 text-[10px] font-black transition",
            urlOpen
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:text-rose-700",
          ].join(
            " "
          )}
        >
          {urlOpen
            ? "Zamknij URL"
            : "Adres URL"}
        </button>

        {product.active && (
          <Link
            href={`/produkt/${currentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-[13px] border border-stone-200 bg-white px-3.5 text-[10px] font-black text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
          >
            Podgląd ↗
          </Link>
        )}

        {product.canManage ? (
          <Link
            href={`/admin/edytuj/${product.id}`}
            className="inline-flex min-h-10 items-center justify-center rounded-[13px] bg-stone-950 px-4 text-[10px] font-black text-white transition hover:bg-rose-600"
          >
            Popraw produkt
          </Link>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-[13px] bg-stone-100 px-3.5 text-[10px] font-black text-stone-400">
            Tylko podgląd
          </span>
        )}
      </div>
    </article>
  );
}

function ProductSlugEditor({
  product,
  currentSlug,
  reservations,
  onSlugChanged,
}: {
  product:
    AdminSeoAuditProduct;

  currentSlug:
    string;

  reservations:
    ProductSlugReservation[];

  onSlugChanged:
    (input: {
      productId: string;
      oldSlug: string;
      newSlug: string;
    }) => void;
}) {
  const router =
    useRouter();

  const [
    supabase,
  ] = useState(
    () =>
      createClient()
  );

  const [
    draftSlug,
    setDraftSlug,
  ] = useState(
    currentSlug
  );

  const [
    saving,
    setSaving,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState<
    string |
    null
  >(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<
    string |
    null
  >(
    null
  );

  useEffect(
    () => {
      setDraftSlug(
        currentSlug
      );
    },
    [
      currentSlug,
    ]
  );

  const suggestedBase =
    useMemo(
      () =>
        buildSuggestedProductSlug({
          shortName:
            product.shortName,

          name:
            product.name,

          category:
            product.category,
        }),
      [
        product.category,
        product.name,
        product.shortName,
      ]
    );

  const suggestedSlug =
    useMemo(
      () =>
        findAvailableProductSlug({
          baseSlug:
            suggestedBase,

          productId:
            product.id,

          reservations,
        }),
      [
        product.id,
        reservations,
        suggestedBase,
      ]
    );

  const normalizedDraft =
    sanitizeProductSlug(
      draftSlug
    );

  const slugIssues =
    getProductSlugIssues(
      normalizedDraft
    );

  const hasBlockingIssue =
    slugIssues.some(
      (
        issue
      ) =>
        issue.type ===
        "error"
    );

  const available =
    isProductSlugAvailable({
      slug:
        normalizedDraft,

      productId:
        product.id,

      reservations,
    });

  const changed =
    normalizedDraft !==
    currentSlug;

  const historicalCount =
    reservations.filter(
      (
        reservation
      ) =>
        reservation.productId ===
          product.id &&
        reservation.kind ===
          "redirect"
    ).length;

  const canSave =
    product.canManage &&
    changed &&
    Boolean(
      normalizedDraft
    ) &&
    !hasBlockingIssue &&
    available &&
    !saving;

  function applySuggestion() {
    setDraftSlug(
      suggestedSlug
    );

    setError(
      null
    );

    setSuccess(
      null
    );
  }

  async function saveSlug() {
    if (
      !product.canManage
    ) {
      return;
    }

    const nextSlug =
      sanitizeProductSlug(
        draftSlug
      );

    const nextIssues =
      getProductSlugIssues(
        nextSlug
      );

    if (
      nextIssues.some(
        (
          issue
        ) =>
          issue.type ===
          "error"
      )
    ) {
      setError(
        "Popraw adres przed zapisaniem."
      );

      return;
    }

    if (
      !isProductSlugAvailable({
        slug:
          nextSlug,

        productId:
          product.id,

        reservations,
      })
    ) {
      setError(
        "Ten adres jest już używany lub zarezerwowany przez inny produkt."
      );

      return;
    }

    if (
      nextSlug ===
      currentSlug
    ) {
      setError(
        "To jest już aktualny adres produktu."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Zmienić adres produktu?\n\nStary adres:\n/produkt/${currentSlug}\n\nNowy adres:\n/produkt/${nextSlug}\n\nStary URL zostanie zachowany jako stałe przekierowanie do nowego adresu.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setSaving(
      true
    );

    setError(
      null
    );

    setSuccess(
      null
    );

    const {
      data,
      error:
        saveError,
    } =
      await supabase.rpc(
        "change_product_slug",
        {
          p_product_id:
            product.id,

          p_new_slug:
            nextSlug,
        }
      );

    if (
      saveError
    ) {
      console.error(
        "Nie udało się zmienić adresu produktu:",
        saveError
      );

      setError(
        saveError.message ||
          "Nie udało się zmienić adresu produktu."
      );

      setSaving(
        false
      );

      return;
    }

    const savedSlug =
      typeof data ===
        "string" &&
      data
        ? data
        : nextSlug;

    onSlugChanged({
      productId:
        product.id,

      oldSlug:
        currentSlug,

      newSlug:
        savedSlug,
    });

    setDraftSlug(
      savedSlug
    );

    setSuccess(
      "Adres został zmieniony. Stary URL przekieruje użytkownika i Google do nowego adresu."
    );

    setSaving(
      false
    );

    router.refresh();
  }

  return (
    <div className="border-t border-stone-100 bg-white px-4 py-4 sm:px-5 sm:py-5">
      <div className="rounded-[18px] border border-stone-200 bg-stone-50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
              Stały adres produktu
            </p>

            <p className="mt-1 break-all text-sm font-black text-stone-950">
              trendzamniej.pl/produkt/{currentSlug}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-stone-500 sm:text-xs">
              Adres możesz zmienić,
              ale najlepiej robić to
              tylko wtedy, gdy obecny
              URL jest słaby lub zawiera
              cenę. Stary adres nie
              zniknie — zostanie
              przekierowany do nowego.
            </p>
          </div>

          {historicalCount >
            0 && (
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-stone-500 shadow-sm">
              {historicalCount} starych URL
            </span>
          )}
        </div>

        <div className="mt-4 rounded-[16px] border border-emerald-100 bg-emerald-50 p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                Proponowany adres
              </p>

              <p className="mt-1 break-all text-xs font-black leading-5 text-emerald-950 sm:text-sm">
                trendzamniej.pl/produkt/{suggestedSlug || "—"}
              </p>

              <p className="mt-1 text-[9px] leading-4 text-emerald-700 sm:text-[10px] sm:leading-5">
                Bez ceny i określeń
                promocyjnych. Propozycja
                powstaje z nazwy
                produktu i sprawdza
                zajęte adresy.
              </p>
            </div>

            {suggestedSlug && (
              <button
                type="button"
                onClick={
                  applySuggestion
                }
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[13px] bg-white px-4 text-[10px] font-black text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              >
                Użyj propozycji
              </button>
            )}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="text-[10px] font-black text-stone-700">
            Nowy slug
          </span>

          <div className="mt-1.5 flex min-h-12 overflow-hidden rounded-[14px] border border-stone-200 bg-white focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-50">
            <span className="hidden shrink-0 items-center border-r border-stone-100 bg-stone-50 px-3 text-[10px] font-bold text-stone-400 sm:flex">
              /produkt/
            </span>

            <input
              value={
                draftSlug
              }
              onChange={(
                event
              ) => {
                setDraftSlug(
                  sanitizeProductSlug(
                    event.target
                      .value
                  )
                );

                setError(
                  null
                );

                setSuccess(
                  null
                );
              }}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={
                false
              }
              maxLength={
                90
              }
              className="min-w-0 flex-1 bg-transparent px-3.5 text-[16px] font-bold text-stone-900 outline-none sm:text-sm"
              placeholder="sukienka-midi-z-falbana"
            />
          </div>
        </label>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {!available &&
          normalizedDraft ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black text-red-700">
              Adres zajęty
            </span>
          ) : normalizedDraft ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
              Adres dostępny
            </span>
          ) : null}

          {normalizedDraft ===
            suggestedSlug &&
            normalizedDraft && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-black text-rose-700">
              Rekomendowany
            </span>
          )}

          {normalizedDraft ===
            currentSlug && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black text-stone-500">
              Aktualny
            </span>
          )}
        </div>

        {slugIssues.length >
          0 && (
          <div className="mt-3 space-y-2">
            {slugIssues.map(
              (
                issue,
                index
              ) => (
                <div
                  key={`${issue.type}-${index}`}
                  className={[
                    "rounded-[13px] border px-3 py-2.5 text-[10px] font-semibold leading-5",
                    issue.type ===
                    "error"
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-amber-100 bg-amber-50 text-amber-700",
                  ].join(
                    " "
                  )}
                >
                  {issue.message}
                </div>
              )
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-[13px] border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold leading-5 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-[13px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] font-bold leading-5 text-emerald-700">
            ✓ {success}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] leading-4 text-stone-400 sm:max-w-xl sm:text-[10px] sm:leading-5">
            Po zmianie nowy adres
            staje się canonicalem.
            Wszystkie wcześniejsze
            adresy tego produktu
            pozostają w historii i
            prowadzą do aktualnego URL.
          </p>

          {product.canManage ? (
            <button
              type="button"
              onClick={() =>
                void saveSlug()
              }
              disabled={
                !canSave
              }
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[14px] bg-rose-600 px-5 text-xs font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
              {saving
                ? "Zapisywanie…"
                : "Zmień adres"}
            </button>
          ) : (
            <span className="text-[10px] font-black text-stone-400">
              Nie masz uprawnień do
              zmiany tej oferty.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    SeoQualityStatus;
}) {
  if (
    status ===
    "good"
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
        Dobre
      </span>
    );
  }

  if (
    status ===
    "warning"
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-700">
        Do poprawy
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black text-red-700">
      Pilne
    </span>
  );
}

function IssueSeverityBadge({
  severity,
}: {
  severity:
    SeoQualityIssue["severity"];
}) {
  const label =
    severity ===
    "high"
      ? "Ważne"
      : severity ===
          "medium"
        ? "Do poprawy"
        : "Sugestia";

  const classes =
    severity ===
    "high"
      ? "bg-red-50 text-red-700"
      : severity ===
          "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-stone-100 text-stone-600";

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-[9px] font-black",
        classes,
      ].join(
        " "
      )}
    >
      {label}
    </span>
  );
}

function IssueRow({
  issue,
}: {
  issue:
    SeoQualityIssue;
}) {
  const container =
    issue.severity ===
    "high"
      ? "border-red-100 bg-red-50/70"
      : issue.severity ===
          "medium"
        ? "border-amber-100 bg-amber-50/70"
        : "border-stone-200 bg-stone-50";

  return (
    <div
      className={[
        "rounded-[14px] border p-3",
        container,
      ].join(
        " "
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="mt-0.5 text-xs"
        >
          {issue.severity ===
          "high"
            ? "!"
            : issue.severity ===
                "medium"
              ? "•"
              : "i"}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-black leading-5 text-stone-800 sm:text-xs">
            {issue.title}
          </p>

          <p className="mt-0.5 text-[9px] leading-4 text-stone-500 sm:text-[10px] sm:leading-5">
            {
              issue.message
            }
          </p>

          <p className="mt-1 text-[9px] font-bold leading-4 text-stone-600 sm:text-[10px] sm:leading-5">
            Zalecenie: {issue.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;

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
        "min-h-9 shrink-0 rounded-full px-3.5 text-[10px] font-black transition",
        active
          ? "bg-stone-950 text-white"
          : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800",
      ].join(
        " "
      )}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
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
    </svg>
  );
}