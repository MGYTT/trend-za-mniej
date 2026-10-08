"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type SocialProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  imageUrl: string;

  price:
    | number
    | string;

  oldPrice:
    | number
    | string
    | null;

  featured: boolean;
  active: boolean;
};

type SlideType =
  | "product"
  | "cover"
  | "outro";

type TemplateType =
  | "fashion"
  | "minimal"
  | "deal";

type ImageFit =
  | "cover"
  | "contain";

const DEFAULT_COVER_TITLE =
  "Trendowe ubrania w niższych cenach";

const DEFAULT_OUTRO_TITLE =
  "Więcej okazji i promocji znajdziesz na Trend za Mniej ✨";

function formatPrice(
  value:
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
      value
    )
  );
}

export default function SocialMediaStudio({
  product,
}: {
  product:
    SocialProduct;
}) {
  const [
    slideType,
    setSlideType,
  ] =
    useState<SlideType>(
      "product"
    );

  const [
    template,
    setTemplate,
  ] =
    useState<TemplateType>(
      "fashion"
    );

  const [
    imageFit,
    setImageFit,
  ] =
    useState<ImageFit>(
      "contain"
    );

  const [
    showPrice,
    setShowPrice,
  ] =
    useState(
      true
    );

  const [
    showOldPrice,
    setShowOldPrice,
  ] =
    useState(
      false
    );

  const [
    showSheinSource,
    setShowSheinSource,
  ] =
    useState(
      true
    );

  const [
    showCategory,
    setShowCategory,
  ] =
    useState(
      true
    );

  const [
    showSafeArea,
    setShowSafeArea,
  ] =
    useState(
      false
    );

  const [
    customTitle,
    setCustomTitle,
  ] =
    useState(
      product.shortName
    );

  const [
    screenshotMode,
    setScreenshotMode,
  ] =
    useState(
      false
    );

  const title =
    useMemo(
      () => {
        const cleaned =
          customTitle.trim();

        if (
          cleaned
        ) {
          return cleaned;
        }

        if (
          slideType ===
          "cover"
        ) {
          return DEFAULT_COVER_TITLE;
        }

        if (
          slideType ===
          "outro"
        ) {
          return DEFAULT_OUTRO_TITLE;
        }

        return product.shortName;
      },
      [
        customTitle,
        product.shortName,
        slideType,
      ]
    );

  useEffect(
    () => {
      if (
        slideType ===
        "product"
      ) {
        setCustomTitle(
          product.shortName
        );

        return;
      }

      if (
        slideType ===
        "cover"
      ) {
        setCustomTitle(
          DEFAULT_COVER_TITLE
        );

        return;
      }

      setCustomTitle(
        DEFAULT_OUTRO_TITLE
      );
    },
    [
      product.shortName,
      slideType,
    ]
  );

  useEffect(
    () => {
      function handleKeyDown(
        event:
          KeyboardEvent
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setScreenshotMode(
            false
          );
        }
      }

      function handleFullscreenChange() {
        if (
          !document.fullscreenElement
        ) {
          setScreenshotMode(
            false
          );
        }
      }

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      document.addEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );

        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    },
    []
  );

  async function enterScreenshotMode() {
    setScreenshotMode(
      true
    );

    try {
      if (
        !document.fullscreenElement
      ) {
        await document.documentElement
          .requestFullscreen();
      }
    } catch (
      error
    ) {
      console.warn(
        "Tryb pełnoekranowy nie jest dostępny:",
        error
      );
    }
  }

  async function exitScreenshotMode() {
    setScreenshotMode(
      false
    );

    try {
      if (
        document.fullscreenElement
      ) {
        await document
          .exitFullscreen();
      }
    } catch (
      error
    ) {
      console.warn(
        "Nie udało się wyjść z trybu pełnoekranowego:",
        error
      );
    }
  }

  const slide = (
    <SocialSlide
      product={
        product
      }
      slideType={
        slideType
      }
      template={
        template
      }
      imageFit={
        imageFit
      }
      showPrice={
        showPrice
      }
      showOldPrice={
        showOldPrice
      }
      showSheinSource={
        showSheinSource
      }
      showCategory={
        showCategory
      }
      showSafeArea={
        showSafeArea &&
        !screenshotMode
      }
      title={
        title
      }
    />
  );

  if (
    screenshotMode
  ) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width:
              "min(100vw, 56.25svh)",

            aspectRatio:
              "9 / 16",
          }}
        >
          {slide}
        </div>

        <button
          type="button"
          onClick={() =>
            void exitScreenshotMode()
          }
          className="fixed right-3 top-3 z-[10000] flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg font-medium text-white opacity-20 backdrop-blur-xl transition hover:opacity-100"
          aria-label="Wyjdź z trybu screenshot"
          title="Wyjdź z trybu screenshot"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-stone-600 shadow-sm">
              Social Media Studio
            </span>

            <span className="rounded-full bg-stone-900 px-3 py-1.5 text-[10px] font-black text-white">
              9:16
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-stone-900 sm:text-4xl">
            Studio social media
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
            Przygotuj okładkę,
            slajd produktu
            i zakończenie
            w jednym spójnym
            stylu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-600 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
          >
            ← Oferty
          </Link>

          {product.active && (
            <Link
              href={`/produkt/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-600 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
            >
              Produkt ↗
            </Link>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)] xl:items-start">
        <aside className="space-y-3 xl:sticky xl:top-24">
          <ControlCard
            title="Rodzaj slajdu"
          >
            <div className="grid grid-cols-3 gap-2">
              <ChoiceButton
                active={
                  slideType ===
                  "product"
                }
                onClick={() =>
                  setSlideType(
                    "product"
                  )
                }
              >
                Produkt
              </ChoiceButton>

              <ChoiceButton
                active={
                  slideType ===
                  "cover"
                }
                onClick={() =>
                  setSlideType(
                    "cover"
                  )
                }
              >
                Okładka
              </ChoiceButton>

              <ChoiceButton
                active={
                  slideType ===
                  "outro"
                }
                onClick={() =>
                  setSlideType(
                    "outro"
                  )
                }
              >
                Koniec
              </ChoiceButton>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <SlideStep
                active={
                  slideType ===
                  "cover"
                }
                number="1"
                label="Start"
              />

              <SlideStep
                active={
                  slideType ===
                  "product"
                }
                number="2"
                label="Produkt"
              />

              <SlideStep
                active={
                  slideType ===
                  "outro"
                }
                number="3"
                label="CTA"
              />
            </div>
          </ControlCard>

          <ControlCard
            title="Wygląd"
          >
            <div className="grid grid-cols-3 gap-2">
              <TemplateButton
                active={
                  template ===
                  "fashion"
                }
                onClick={() =>
                  setTemplate(
                    "fashion"
                  )
                }
                name="Warm"
                description="Ciepły"
              />

              <TemplateButton
                active={
                  template ===
                  "minimal"
                }
                onClick={() =>
                  setTemplate(
                    "minimal"
                  )
                }
                name="Light"
                description="Jasny"
              />

              <TemplateButton
                active={
                  template ===
                  "deal"
                }
                onClick={() =>
                  setTemplate(
                    "deal"
                  )
                }
                name="Dark"
                description="Ciemny"
              />
            </div>
          </ControlCard>

          <ControlCard
            title="Nagłówek"
          >
            <textarea
              value={
                customTitle
              }
              onChange={(
                event
              ) =>
                setCustomTitle(
                  event.target.value
                )
              }
              rows={
                3
              }
              maxLength={
                80
              }
              className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-800 outline-none transition focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-100"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-stone-400">
                Krótki tekst wygląda
                najlepiej.
              </p>

              <p className="text-[10px] font-bold text-stone-400">
                {
                  customTitle.length
                }
                /80
              </p>
            </div>
          </ControlCard>

          {slideType ===
            "product" && (
            <ControlCard
              title="Elementy produktu"
            >
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton
                  active={
                    showPrice
                  }
                  onClick={() =>
                    setShowPrice(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  Cena
                </ToggleButton>

                <ToggleButton
                  active={
                    showCategory
                  }
                  onClick={() =>
                    setShowCategory(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  Kategoria
                </ToggleButton>

                <ToggleButton
                  active={
                    showSheinSource
                  }
                  onClick={() =>
                    setShowSheinSource(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  SHEIN
                </ToggleButton>

                <ToggleButton
                  active={
                    showOldPrice
                  }
                  disabled={
                    product.oldPrice ===
                    null
                  }
                  onClick={() =>
                    setShowOldPrice(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  Stara cena
                </ToggleButton>
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
                Zdjęcie
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <ChoiceButton
                  active={
                    imageFit ===
                    "contain"
                  }
                  onClick={() =>
                    setImageFit(
                      "contain"
                    )
                  }
                >
                  Całe
                </ChoiceButton>

                <ChoiceButton
                  active={
                    imageFit ===
                    "cover"
                  }
                  onClick={() =>
                    setImageFit(
                      "cover"
                    )
                  }
                >
                  Wypełnij
                </ChoiceButton>
              </div>
            </ControlCard>
          )}

          {(slideType ===
            "cover" ||
            slideType ===
              "product") && (
            <ControlCard
              title="Źródło oferty"
            >
              <ToggleButton
                active={
                  showSheinSource
                }
                onClick={() =>
                  setShowSheinSource(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >
                Pokazuj SHEIN
              </ToggleButton>

              <p className="mt-2 text-[10px] leading-5 text-stone-400">
                Używamy tekstu
                „Znalezisko z SHEIN”
                zamiast dużego logo.
              </p>
            </ControlCard>
          )}

          <ControlCard
            title="Podgląd TikTok"
          >
            <ToggleButton
              active={
                showSafeArea
              }
              onClick={() =>
                setShowSafeArea(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >
              Bezpieczna strefa
            </ToggleButton>

            <p className="mt-2 text-[10px] leading-5 text-stone-400">
              Pokazuje obszar,
              w którym warto trzymać
              najważniejsze elementy.
              Nie pojawi się
              na screenshotcie.
            </p>
          </ControlCard>

          <button
            type="button"
            onClick={() =>
              void enterScreenshotMode()
            }
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 text-sm font-black text-white shadow-lg shadow-stone-300/40 transition hover:bg-black"
          >
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
              <path d="M4 7h3l2-2h6l2 2h3v12H4Z" />

              <circle
                cx="12"
                cy="13"
                r="3"
              />
            </svg>

            Tryb screenshot
          </button>

          <p className="text-center text-[10px] leading-5 text-stone-400">
            ESC zamyka
            tryb pełnoekranowy.
          </p>
        </aside>

        <section className="rounded-[28px] border border-stone-200 bg-[#f4f4f6] p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400">
                Podgląd
              </p>

              <p className="mt-1 text-sm font-black text-stone-900">
                TikTok / Reels / Shorts
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-black text-stone-500">
                9:16
              </span>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[34px] border border-white/80 shadow-[0_24px_70px_rgba(28,25,23,0.16)]">
              {slide}
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-[390px] rounded-[20px] border border-white bg-white/80 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
                <span className="text-xs">
                  ✓
                </span>
              </div>

              <div>
                <p className="text-xs font-black text-stone-800">
                  Gotowe pod pionowy
                  format
                </p>

                <p className="mt-1 text-[10px] leading-5 text-stone-400">
                  Najważniejsze elementy
                  są odsunięte od
                  krawędzi i skalują
                  się razem z płótnem.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SocialSlide({
  product,
  slideType,
  template,
  imageFit,
  showPrice,
  showOldPrice,
  showSheinSource,
  showCategory,
  showSafeArea,
  title,
}: {
  product:
    SocialProduct;

  slideType:
    SlideType;

  template:
    TemplateType;

  imageFit:
    ImageFit;

  showPrice:
    boolean;

  showOldPrice:
    boolean;

  showSheinSource:
    boolean;

  showCategory:
    boolean;

  showSafeArea:
    boolean;

  title:
    string;
}) {
  return (
    <div
      className={[
        "relative aspect-[9/16] w-full overflow-hidden [container-type:size]",
        getSlideBackground(
          template
        ),
      ].join(
        " "
      )}
    >
      <SlideBackdrop
        product={
          product
        }
        template={
          template
        }
      />

      <div className="relative z-10 h-full p-[5cqw]">
        {slideType ===
          "product" && (
          <ProductSlide
            product={
              product
            }
            template={
              template
            }
            imageFit={
              imageFit
            }
            showPrice={
              showPrice
            }
            showOldPrice={
              showOldPrice
            }
            showSheinSource={
              showSheinSource
            }
            showCategory={
              showCategory
            }
            title={
              title
            }
          />
        )}

        {slideType ===
          "cover" && (
          <CoverSlide
            product={
              product
            }
            template={
              template
            }
            imageFit={
              imageFit
            }
            showSheinSource={
              showSheinSource
            }
            title={
              title
            }
          />
        )}

        {slideType ===
          "outro" && (
          <OutroSlide
            template={
              template
            }
            title={
              title
            }
          />
        )}
      </div>

      {showSafeArea && (
        <SafeAreaOverlay />
      )}
    </div>
  );
}

function ProductSlide({
  product,
  template,
  imageFit,
  showPrice,
  showOldPrice,
  showSheinSource,
  showCategory,
  title,
}: {
  product:
    SocialProduct;

  template:
    TemplateType;

  imageFit:
    ImageFit;

  showPrice:
    boolean;

  showOldPrice:
    boolean;

  showSheinSource:
    boolean;

  showCategory:
    boolean;

  title:
    string;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-[3cqw]">
      <IOSHeader
        template={
          template
        }
      />

      <div className="relative min-h-0 overflow-hidden rounded-[6cqw] border border-white/50 bg-white/55 p-[2.4cqw] shadow-[0_5cqw_12cqw_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        <div
          className={[
            "relative h-full overflow-hidden rounded-[4.5cqw]",
            template ===
            "deal"
              ? "bg-stone-900"
              : "bg-white",
          ].join(
            " "
          )}
        >
          <img
            src={
              product.imageUrl
            }
            alt={
              product.name
            }
            className={[
              "h-full w-full",
              imageFit ===
              "cover"
                ? "object-cover"
                : "object-contain p-[4cqw]",
            ].join(
              " "
            )}
          />

          <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-black/25 to-transparent" />

          {product.featured && (
            <span className="absolute left-[3cqw] top-[3cqw] rounded-full border border-white/50 bg-white/85 px-[3cqw] py-[1.4cqw] text-[2.5cqw] font-black text-stone-900 shadow-sm backdrop-blur-xl">
              🔥 Wybrane
            </span>
          )}

          {showSheinSource && (
            <span className="absolute bottom-[3cqw] right-[3cqw] rounded-full border border-white/30 bg-black/55 px-[3cqw] py-[1.5cqw] text-[2.35cqw] font-black text-white shadow-sm backdrop-blur-xl">
              Znalezisko z SHEIN
            </span>
          )}
        </div>
      </div>

      <div
        className={[
          "rounded-[5cqw] border p-[4cqw] shadow-[0_2cqw_8cqw_rgba(0,0,0,0.07)] backdrop-blur-2xl",
          theme.card,
        ].join(
          " "
        )}
      >
        <div className="flex items-start justify-between gap-[3cqw]">
          <div className="min-w-0 flex-1">
            {showCategory && (
              <p
                className={[
                  "truncate text-[2.35cqw] font-black uppercase tracking-[0.15em]",
                  theme.mutedAccent,
                ].join(
                  " "
                )}
              >
                {
                  product.category
                }
              </p>
            )}

            <h2
              className={[
                "mt-[1.4cqw] line-clamp-2 text-[5.8cqw] font-black leading-[0.98] tracking-[-0.045em]",
                theme.primaryText,
              ].join(
                " "
              )}
            >
              {
                title
              }
            </h2>
          </div>

          {showPrice && (
            <div className="shrink-0 text-right">
              <p
                className={[
                  "whitespace-nowrap text-[5.2cqw] font-black tracking-[-0.045em]",
                  theme.primaryText,
                ].join(
                  " "
                )}
              >
                {formatPrice(
                  product.price
                )}
              </p>

              {showOldPrice &&
                product.oldPrice !==
                  null && (
                  <p className="mt-[0.5cqw] text-[2.5cqw] font-bold text-stone-400 line-through">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </p>
                )}

              <p
                className={[
                  "mt-[0.6cqw] text-[1.9cqw] font-semibold",
                  theme.secondaryText,
                ].join(
                  " "
                )}
              >
                cena zapisana
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={[
          "flex min-h-[13cqw] items-center justify-between gap-[3cqw] rounded-[5cqw] border px-[4cqw] shadow-[0_2cqw_8cqw_rgba(0,0,0,0.06)] backdrop-blur-2xl",
          theme.card,
        ].join(
          " "
        )}
      >
        <div className="min-w-0">
          <p
            className={[
              "text-[2.15cqw] font-semibold",
              theme.secondaryText,
            ].join(
              " "
            )}
          >
            Więcej okazji
          </p>

          <p
            className={[
              "mt-[0.6cqw] truncate text-[3.1cqw] font-black",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            trendzamniej.pl
          </p>
        </div>

        <div
          className={[
            "flex h-[9cqw] w-[9cqw] shrink-0 items-center justify-center rounded-full text-[4.3cqw] font-semibold shadow-sm",
            theme.action,
          ].join(
            " "
          )}
        >
          →
        </div>
      </div>
    </div>
  );
}

function CoverSlide({
  product,
  template,
  imageFit,
  showSheinSource,
  title,
}: {
  product:
    SocialProduct;

  template:
    TemplateType;

  imageFit:
    ImageFit;

  showSheinSource:
    boolean;

  title:
    string;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-[3cqw]">
      <IOSHeader
        template={
          template
        }
      />

      <div
        className={[
          "rounded-[6cqw] border px-[5cqw] py-[4.5cqw] shadow-[0_3cqw_10cqw_rgba(0,0,0,0.08)] backdrop-blur-2xl",
          theme.card,
        ].join(
          " "
        )}
      >
        <div className="flex items-center justify-between gap-[3cqw]">
          <p
            className={[
              "text-[2.15cqw] font-black uppercase tracking-[0.18em]",
              theme.mutedAccent,
            ].join(
              " "
            )}
          >
            Nowe znaleziska
          </p>

          <span
            className={[
              "flex h-[7cqw] w-[7cqw] items-center justify-center rounded-full text-[3cqw]",
              theme.pill,
            ].join(
              " "
            )}
          >
            ✦
          </span>
        </div>

        <h2
          className={[
            "mt-[3cqw] line-clamp-3 text-[7.4cqw] font-black leading-[0.95] tracking-[-0.06em]",
            theme.primaryText,
          ].join(
            " "
          )}
        >
          {
            title
          }
        </h2>

        <div className="mt-[4cqw] flex flex-wrap gap-[1.5cqw]">
          {showSheinSource && (
            <span
              className={[
                "rounded-full px-[3cqw] py-[1.4cqw] text-[2.2cqw] font-black",
                theme.pill,
              ].join(
                " "
              )}
            >
              Znaleziska z SHEIN
            </span>
          )}

          <span
            className={[
              "rounded-full px-[3cqw] py-[1.4cqw] text-[2.2cqw] font-black",
              theme.pill,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </span>
        </div>
      </div>

      <div className="relative min-h-0 overflow-hidden rounded-[7cqw] border border-white/50 bg-white/55 p-[2.5cqw] shadow-[0_5cqw_14cqw_rgba(0,0,0,0.13)] backdrop-blur-2xl">
        <div
          className={[
            "relative h-full overflow-hidden rounded-[5cqw]",
            template ===
            "deal"
              ? "bg-stone-900"
              : "bg-white",
          ].join(
            " "
          )}
        >
          <img
            src={
              product.imageUrl
            }
            alt=""
            className={[
              "h-full w-full",
              imageFit ===
              "cover"
                ? "object-cover"
                : "object-contain p-[5cqw]",
            ].join(
              " "
            )}
          />

          <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          <div className="absolute bottom-[4cqw] left-[4cqw] right-[4cqw] flex items-end justify-between gap-[3cqw]">
            <div>
              <p className="text-[2.1cqw] font-bold uppercase tracking-[0.15em] text-white/65">
                Trend za Mniej
              </p>

              <p className="mt-[1cqw] text-[4.5cqw] font-black tracking-[-0.04em] text-white">
                Moda w dobrych cenach
              </p>
            </div>

            <div className="flex h-[9cqw] w-[9cqw] shrink-0 items-center justify-center rounded-full bg-white text-[4cqw] font-black text-stone-950 shadow-lg">
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutroSlide({
  template,
  title,
}: {
  template:
    TemplateType;

  title:
    string;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-[3cqw]">
      <IOSHeader
        template={
          template
        }
      />

      <div className="flex min-h-0 items-center justify-center">
        <div
          className={[
            "w-full rounded-[8cqw] border px-[6cqw] py-[7cqw] text-center shadow-[0_5cqw_16cqw_rgba(0,0,0,0.11)] backdrop-blur-2xl",
            theme.card,
          ].join(
            " "
          )}
        >
          <div
            className={[
              "mx-auto flex h-[13cqw] w-[13cqw] items-center justify-center rounded-[4.2cqw] text-[5cqw] font-black shadow-sm",
              theme.logo,
            ].join(
              " "
            )}
          >
            T
          </div>

          <div
            className={[
              "mx-auto mt-[4cqw] w-fit rounded-full px-[3cqw] py-[1.4cqw] text-[2.1cqw] font-black uppercase tracking-[0.12em]",
              theme.pill,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </div>

          <h2
            className={[
              "mx-auto mt-[4cqw] line-clamp-4 max-w-[94%] text-[7cqw] font-black leading-[0.97] tracking-[-0.055em]",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            {
              title
            }
          </h2>

          <p
            className={[
              "mx-auto mt-[3cqw] max-w-[75%] text-[2.35cqw] font-semibold leading-[1.45]",
              theme.secondaryText,
            ].join(
              " "
            )}
          >
            Odkrywaj produkty,
            promocje i modne
            znaleziska w jednym
            miejscu.
          </p>

          <div
            className={[
              "mx-auto mt-[6cqw] flex min-h-[11cqw] max-w-[72%] items-center justify-between rounded-full pl-[4cqw] pr-[1.5cqw] shadow-sm",
              theme.action,
            ].join(
              " "
            )}
          >
            <span className="text-[2.8cqw] font-black">
              Sprawdź teraz
            </span>

            <span className="flex h-[8cqw] w-[8cqw] items-center justify-center rounded-full bg-white/15 text-[3.8cqw]">
              →
            </span>
          </div>

          <p
            className={[
              "mt-[5cqw] text-[3.5cqw] font-black tracking-[0.04em]",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            trendzamniej.pl
          </p>
        </div>
      </div>

      <div
        className={[
          "flex items-center justify-center rounded-full border px-[4cqw] py-[2.4cqw] text-[2.15cqw] font-semibold shadow-sm backdrop-blur-2xl",
          theme.card,
          theme.secondaryText,
        ].join(
          " "
        )}
      >
        Moda • okazje • inspiracje
      </div>
    </div>
  );
}

function IOSHeader({
  template,
}: {
  template:
    TemplateType;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div
      className={[
        "flex min-h-[11cqw] items-center justify-between rounded-full border px-[2.3cqw] py-[1.8cqw] shadow-[0_1.5cqw_5cqw_rgba(0,0,0,0.06)] backdrop-blur-2xl",
        theme.card,
      ].join(
        " "
      )}
    >
      <div className="flex min-w-0 items-center gap-[2cqw]">
        <div
          className={[
            "flex h-[7cqw] w-[7cqw] shrink-0 items-center justify-center rounded-full text-[2.8cqw] font-black",
            theme.logo,
          ].join(
            " "
          )}
        >
          T
        </div>

        <div className="min-w-0">
          <p
            className={[
              "truncate text-[2.8cqw] font-black leading-none",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </p>

          <p
            className={[
              "mt-[0.8cqw] truncate text-[1.85cqw] font-bold uppercase tracking-[0.13em]",
              theme.secondaryText,
            ].join(
              " "
            )}
          >
            Moda i okazje
          </p>
        </div>
      </div>

      <span
        className={[
          "ml-[2cqw] shrink-0 rounded-full px-[2.5cqw] py-[1.2cqw] text-[1.9cqw] font-black",
          theme.pill,
        ].join(
          " "
        )}
      >
        9:16
      </span>
    </div>
  );
}

function SafeAreaOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 [container-type:size]">
      <div className="absolute left-[5cqw] right-[15cqw] top-[8cqh] bottom-[18cqh] rounded-[4cqw] border border-dashed border-rose-500/60">
        <span className="absolute left-[2cqw] top-[2cqw] rounded-full bg-rose-500/80 px-[2cqw] py-[0.8cqw] text-[1.8cqw] font-black text-white">
          safe area
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[15cqh] bg-rose-500/[0.05]" />

      <div className="absolute bottom-[18cqh] right-0 top-[18cqh] w-[13cqw] bg-rose-500/[0.05]" />
    </div>
  );
}

function SlideBackdrop({
  product,
  template,
}: {
  product:
    SocialProduct;

  template:
    TemplateType;
}) {
  if (
    template ===
    "deal"
  ) {
    return (
      <>
        <img
          src={
            product.imageUrl
          }
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-[35px]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/85 to-black/95" />
      </>
    );
  }

  return (
    <>
      <img
        src={
          product.imageUrl
        }
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-[0.07] blur-[42px]"
      />

      <div
        className={[
          "absolute inset-0",
          template ===
          "minimal"
            ? "bg-gradient-to-b from-[#f8f9fa]/95 via-[#f3f4f6]/96 to-[#eceef2]/98"
            : "bg-gradient-to-b from-[#faf6f1]/94 via-[#f5eee8]/96 to-[#eee4dd]/98",
        ].join(
          " "
        )}
      />
    </>
  );
}

function getSlideBackground(
  template:
    TemplateType
) {
  if (
    template ===
    "deal"
  ) {
    return "bg-stone-950";
  }

  if (
    template ===
    "minimal"
  ) {
    return "bg-[#f4f5f7]";
  }

  return "bg-[#f3ebe5]";
}

function getSlideTheme(
  template:
    TemplateType
) {
  if (
    template ===
    "deal"
  ) {
    return {
      card:
        "border-white/10 bg-white/10",

      primaryText:
        "text-white",

      secondaryText:
        "text-white/55",

      mutedAccent:
        "text-rose-200",

      pill:
        "bg-white/10 text-white/70",

      action:
        "bg-white text-stone-950",

      logo:
        "bg-white text-stone-950",
    };
  }

  if (
    template ===
    "minimal"
  ) {
    return {
      card:
        "border-white/80 bg-white/72",

      primaryText:
        "text-stone-950",

      secondaryText:
        "text-stone-400",

      mutedAccent:
        "text-stone-500",

      pill:
        "bg-stone-100 text-stone-500",

      action:
        "bg-stone-950 text-white",

      logo:
        "bg-stone-950 text-white",
    };
  }

  return {
    card:
      "border-white/80 bg-white/67",

    primaryText:
      "text-[#261d19]",

    secondaryText:
      "text-[#8e817b]",

    mutedAccent:
      "text-[#a76457]",

    pill:
      "bg-[#efe2dc] text-[#8f574c]",

    action:
      "bg-[#2d211d] text-white",

    logo:
      "bg-[#2d211d] text-white",
  };
}

function ControlCard({
  title,
  children,
}: {
  title:
    string;

  children:
    ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-stone-200/80 bg-white/90 p-4 shadow-[0_8px_30px_rgba(28,25,23,0.05)] backdrop-blur-xl">
      <h2 className="text-xs font-black uppercase tracking-[0.1em] text-stone-500">
        {title}
      </h2>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}

function SlideStep({
  active,
  number,
  label,
}: {
  active:
    boolean;

  number:
    string;

  label:
    string;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-2 py-2 text-center transition",
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-100 bg-stone-50 text-stone-400",
      ].join(
        " "
      )}
    >
      <p className="text-[9px] font-black">
        {number}
      </p>

      <p className="mt-0.5 text-[9px] font-bold">
        {label}
      </p>
    </div>
  );
}

function ChoiceButton({
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
        "min-h-10 rounded-xl border px-2 text-xs font-black transition",
        active
          ? "border-stone-900 bg-stone-900 text-white shadow-sm"
          : "border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100",
      ].join(
        " "
      )}
    >
      {children}
    </button>
  );
}

function TemplateButton({
  active,
  onClick,
  name,
  description,
}: {
  active:
    boolean;

  onClick:
    () => void;

  name:
    string;

  description:
    string;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "rounded-xl border p-2.5 text-left transition",
        active
          ? "border-stone-900 bg-stone-900 text-white shadow-sm"
          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100",
      ].join(
        " "
      )}
    >
      <span className="block text-xs font-black">
        {name}
      </span>

      <span
        className={[
          "mt-0.5 block text-[9px] font-semibold",
          active
            ? "text-white/55"
            : "text-stone-400",
        ].join(
          " "
        )}
      >
        {
          description
        }
      </span>
    </button>
  );
}

function ToggleButton({
  active,
  disabled = false,
  onClick,
  children,
}: {
  active:
    boolean;

  disabled?:
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
      disabled={
        disabled
      }
      className={[
        "flex min-h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-black transition",
        disabled
          ? "cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300"
          : active
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-200 bg-stone-50 text-stone-500",
      ].join(
        " "
      )}
    >
      <span>
        {children}
      </span>

      <span
        className={[
          "flex h-5 w-8 items-center rounded-full p-0.5 transition",
          active &&
          !disabled
            ? "justify-end bg-white/25"
            : "justify-start bg-stone-200",
        ].join(
          " "
        )}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}