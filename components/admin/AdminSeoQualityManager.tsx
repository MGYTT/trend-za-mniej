"use client";

import Link from "next/link";

import {
  type ReactNode,
  useMemo,
  useState,
} from "react";

import type {
  SeoQualityAudit,
  SeoQualityIssue,
  SeoQualityStatus,
} from "@/lib/seo-quality";

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
}: {
  products:
    AdminSeoAuditProduct[];
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

              return [
                product.name,
                product.shortName,
                product.category,
                product.slug,
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
        filter,
        products,
        query,
      ]
    );

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
              Audyt niczego nie
              blokuje — wskazuje
              produkty, które warto
              poprawić przed kolejnym
              crawlem Google.
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
              ) => (
                <SeoProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                />
              )
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
}: {
  product:
    AdminSeoAuditProduct;
}) {
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
                product.slug
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

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 bg-stone-50/70 px-4 py-3 sm:px-5">
        {product.active && (
          <Link
            href={`/produkt/${product.slug}`}
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