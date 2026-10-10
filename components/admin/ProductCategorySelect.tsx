"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getProductCategoryGroup,
  getProductCategoryHelp,
  PRODUCT_CATEGORY,
  PRODUCT_CATEGORY_HELP,
  searchProductCategories,
} from "@/lib/product-categories";

type Props = {
  value: string;

  onChange:
    (
      value: string
    ) => void;

  disabled?: boolean;

  label?: string;
};

export default function ProductCategorySelect({
  value,
  onChange,
  disabled = false,
  label = "Kategoria",
}: Props) {
  const [
    open,
    setOpen,
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

  const groups =
    useMemo(
      () =>
        searchProductCategories(
          query
        ),
      [
        query,
      ]
    );

  const selectedGroup =
    getProductCategoryGroup(
      value
    );

  const selectedHelp =
    getProductCategoryHelp(
      value
    );

  useEffect(
    () => {
      if (
        !open
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
          setOpen(
            false
          );

          setQuery(
            ""
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
      open,
    ]
  );

  function close() {
    setOpen(
      false
    );

    setQuery(
      ""
    );
  }

  function selectCategory(
    category: string
  ) {
    onChange(
      category
    );

    close();
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-stone-700 sm:text-sm">
        {label}
      </label>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={() =>
          setOpen(
            true
          )
        }
        className="flex min-h-[54px] w-full items-center gap-3 rounded-[15px] border border-stone-200 bg-white px-3.5 text-left outline-none transition hover:border-rose-200 active:bg-stone-50 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-60"
      >
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-lg",
            value
              ? "bg-rose-50"
              : "bg-stone-100",
          ].join(
            " "
          )}
        >
          {selectedGroup
            ?.icon ??
            "🏷️"}
        </span>

        <span className="min-w-0 flex-1">
          {value ? (
            <>
              <span className="block truncate text-sm font-black text-stone-900">
                {value}
              </span>

              <span className="mt-0.5 block truncate text-[10px] font-semibold text-stone-400">
                {selectedGroup
                  ?.label ??
                  "Wybrana kategoria"}
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-black text-stone-500">
                Wybierz kategorię
              </span>

              <span className="mt-0.5 block text-[10px] font-semibold text-stone-400">
                Znajdź dokładny typ
                produktu
              </span>
            </>
          )}
        </span>

        <span className="shrink-0 text-xl text-stone-300">
          ›
        </span>
      </button>

      {selectedHelp && (
        <p className="mt-1.5 px-1 text-[10px] leading-5 text-stone-400">
          {selectedHelp}
        </p>
      )}

      {open && (
        <>
          <button
            type="button"
            aria-label="Zamknij wybór kategorii"
            onClick={
              close
            }
            className="fixed inset-0 z-[110] bg-stone-950/35 backdrop-blur-[3px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Wybierz kategorię produktu"
            className="fixed inset-x-0 bottom-0 z-[120] mx-auto flex max-h-[92dvh] max-w-2xl flex-col overflow-hidden rounded-t-[30px] border border-stone-200 bg-[#f7f7f8] shadow-[0_-24px_80px_rgba(28,25,23,0.22)] sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:w-[min(720px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[30px]"
            style={{
              paddingBottom:
                "env(safe-area-inset-bottom)",
            }}
          >
            <div className="shrink-0 border-b border-stone-200 bg-white/95 px-4 pb-4 pt-3 backdrop-blur-2xl sm:px-5">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300 sm:hidden" />

              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600">
                    Produkt
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-stone-950">
                    Wybierz kategorię
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    close
                  }
                  aria-label="Zamknij"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg font-black text-stone-500 transition active:scale-95"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 flex min-h-12 items-center gap-3 rounded-[15px] border border-stone-200 bg-stone-50 px-3.5 focus-within:border-rose-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-100">
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
                      event.target.value
                    )
                  }
                  placeholder="Np. koszulka, jeansy, marynarka..."
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-stone-800 outline-none placeholder:text-stone-400 sm:text-sm"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuery(
                        ""
                      )
                    }
                    aria-label="Wyczyść wyszukiwanie"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-black text-stone-500"
                  >
                    ×
                  </button>
                )}
              </div>

              {!query && (
                <div className="mt-3 rounded-[15px] bg-rose-50 px-3.5 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-rose-700">
                    Szybkie rozróżnienie
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-rose-700/80">
                    <strong>
                      Koszulka
                    </strong>
                    {" → "}
                    Koszulki i T-shirty
                    {" • "}

                    <strong>
                      bluzka
                    </strong>
                    {" → "}
                    Bluzki
                    {" • "}

                    <strong>
                      crop top
                    </strong>
                    {" → "}
                    Topy
                    {" • "}

                    <strong>
                      koszula
                    </strong>
                    {" → "}
                    Koszule
                  </p>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              {groups.length >
              0 ? (
                <div className="space-y-3">
                  {groups.map(
                    (
                      group
                    ) => (
                      <section
                        key={
                          group.id
                        }
                        className="overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
                          <span className="text-lg">
                            {
                              group.icon
                            }
                          </span>

                          <p className="text-xs font-black text-stone-800">
                            {
                              group.label
                            }
                          </p>

                          <span className="ml-auto rounded-full bg-stone-100 px-2 py-1 text-[9px] font-black text-stone-400">
                            {
                              group.categories
                                .length
                            }
                          </span>
                        </div>

                        <div className="divide-y divide-stone-100">
                          {group.categories.map(
                            (
                              category
                            ) => (
                              <CategoryButton
                                key={
                                  category
                                }
                                category={
                                  category
                                }
                                help={
                                  PRODUCT_CATEGORY_HELP[
                                    category
                                  ]
                                }
                                selected={
                                  value ===
                                  category
                                }
                                onClick={() =>
                                  selectCategory(
                                    category
                                  )
                                }
                              />
                            )
                          )}
                        </div>
                      </section>
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
                  <span className="text-3xl">
                    🔎
                  </span>

                  <p className="mt-3 text-sm font-black text-stone-800">
                    Nie znaleziono
                    kategorii
                  </p>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-stone-400">
                    Spróbuj krótszej
                    nazwy, np.
                    „koszulka”,
                    „spodnie”,
                    „buty” albo
                    „torebka”.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setQuery(
                        ""
                      )
                    }
                    className="mt-4 min-h-10 rounded-xl bg-stone-950 px-4 text-xs font-black text-white"
                  >
                    Pokaż wszystkie
                  </button>
                </div>
              )}

              {!query && (
                <section className="mt-3 overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm">
                  <div className="flex items-start gap-3 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-stone-100 text-lg">
                      📦
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-stone-900">
                        Nadal nie pasuje?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-400">
                        „Inne” zostawiamy
                        jako kategorię
                        awaryjną. Wybierz
                        ją dopiero wtedy,
                        gdy produkt
                        naprawdę nie
                        pasuje do żadnej
                        dokładniejszej
                        kategorii.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          selectCategory(
                            PRODUCT_CATEGORY.other
                          )
                        }
                        className={[
                          "mt-3 min-h-9 rounded-xl px-4 text-xs font-black",
                          value ===
                          PRODUCT_CATEGORY.other
                            ? "bg-rose-600 text-white"
                            : "bg-stone-100 text-stone-600",
                        ].join(
                          " "
                        )}
                      >
                        {value ===
                        PRODUCT_CATEGORY.other
                          ? "✓ Wybrano Inne"
                          : "Wybierz Inne"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <div className="h-3" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CategoryButton({
  category,
  help,
  selected,
  onClick,
}: {
  category: string;
  help: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-stone-50",
        selected
          ? "bg-rose-50/70"
          : "bg-white",
      ].join(
        " "
      )}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black",
          selected
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-stone-200 bg-stone-50 text-transparent",
        ].join(
          " "
        )}
      >
        ✓
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-sm font-black",
            selected
              ? "text-rose-700"
              : "text-stone-900",
          ].join(
            " "
          )}
        >
          {category}
        </span>

        <span className="mt-1 block text-[10px] leading-4 text-stone-400">
          {help}
        </span>
      </span>

      <span
        className={[
          "shrink-0 text-lg",
          selected
            ? "text-rose-500"
            : "text-stone-200",
        ].join(
          " "
        )}
      >
        ›
      </span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
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