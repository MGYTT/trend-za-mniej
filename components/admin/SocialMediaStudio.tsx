"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SocialProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  imageUrl: string;
  price: number | string;
  oldPrice: number | string | null;
  featured: boolean;
  active: boolean;
};

type SlideType =
  | "cover"
  | "product"
  | "outro";

type TemplateType =
  | "fashion"
  | "minimal"
  | "deal";

type ImageFit =
  | "contain"
  | "cover";

type SlideTitles =
  Record<
    SlideType,
    string
  >;

type StudioDraft = {
  version: 2;
  template: TemplateType;
  imageFit: ImageFit;
  showPrice: boolean;
  showOldPrice: boolean;
  showSheinSource: boolean;
  showCategory: boolean;
  titles: SlideTitles;
};

type ExportState = {
  active: boolean;
  message: string;
  error: string | null;
};

type SlideTheme = {
  background: string;
  surface: string;
  strongSurface: string;
  imageSurface: string;
  border: string;
  primaryText: string;
  secondaryText: string;
  accentText: string;
  pill: string;
  logo: string;
  button: string;
  exportBackground: string;
};

const DEFAULT_COVER_TITLE =
  "Modowe znalezisko warte uwagi";

const DEFAULT_OUTRO_TITLE =
  "Więcej modowych okazji czeka na Trend za Mniej";

const EXPORT_ORDER:
  SlideType[] = [
    "cover",
    "product",
    "outro",
  ];

const SLIDE_LABELS:
  Record<
    SlideType,
    string
  > = {
  cover: "Okładka",
  product: "Produkt",
  outro: "Koniec",
};

function formatPrice(
  value:
    | number
    | string
) {
  const numericValue =
    Number(
      value
    );

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "pl-PL",
    {
      style:
        "currency",

      currency:
        "PLN",

      maximumFractionDigits:
        2,
    }
  ).format(
    numericValue
  );
}

function getDefaultTitles(
  product:
    SocialProduct
): SlideTitles {
  return {
    cover:
      DEFAULT_COVER_TITLE,

    product:
      product.shortName,

    outro:
      DEFAULT_OUTRO_TITLE,
  };
}

function getStorageKey(
  productId:
    string
) {
  return `trend-za-mniej:social-studio:v2:${productId}`;
}

function getSlideFileName(
  product:
    SocialProduct,
  slideType:
    SlideType
) {
  const suffix =
    slideType ===
    "cover"
      ? "01-okladka"
      : slideType ===
          "product"
        ? "02-produkt"
        : "03-koniec";

  const safeSlug =
    product.slug
      .trim()
      .toLowerCase()
      .normalize(
        "NFKD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "produkt";

  return `trend-za-mniej-${safeSlug}-${suffix}.png`;
}

function dataUrlFromBlob(
  blob:
    Blob
) {
  return new Promise<string>(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(
              reader.result
            );

            return;
          }

          reject(
            new Error(
              "Nie udało się przygotować zdjęcia."
            )
          );
        };

      reader.onerror =
        () => {
          reject(
            new Error(
              "Nie udało się odczytać zdjęcia."
            )
          );
        };

      reader.readAsDataURL(
        blob
      );
    }
  );
}

async function dataUrlToFile(
  dataUrl:
    string,
  fileName:
    string
) {
  const response =
    await fetch(
      dataUrl
    );

  const blob =
    await response.blob();

  return new File(
    [
      blob,
    ],
    fileName,
    {
      type:
        "image/png",

      lastModified:
        Date.now(),
    }
  );
}

async function waitForImages(
  node:
    HTMLElement
) {
  const images =
    Array.from(
      node.querySelectorAll(
        "img"
      )
    );

  await Promise.all(
    images.map(
      (
        image
      ) => {
        if (
          image.complete &&
          image.naturalWidth >
            0
        ) {
          return Promise.resolve();
        }

        return new Promise<void>(
          (
            resolve
          ) => {
            const finish =
              () => {
                image.removeEventListener(
                  "load",
                  finish
                );

                image.removeEventListener(
                  "error",
                  finish
                );

                resolve();
              };

            image.addEventListener(
              "load",
              finish,
              {
                once:
                  true,
              }
            );

            image.addEventListener(
              "error",
              finish,
              {
                once:
                  true,
              }
            );
          }
        );
      }
    )
  );
}

function waitForPaint() {
  return new Promise<void>(
    (
      resolve
    ) => {
      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              resolve();
            }
          );
        }
      );
    }
  );
}

function triggerDownload(
  dataUrl:
    string,
  fileName:
    string
) {
  const link =
    document.createElement(
      "a"
    );

  link.href =
    dataUrl;

  link.download =
    fileName;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();
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
      "minimal"
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
    titles,
    setTitles,
  ] =
    useState<SlideTitles>(
      () =>
        getDefaultTitles(
          product
        )
    );

  const [
    draftReady,
    setDraftReady,
  ] =
    useState(
      false
    );

  const [
    draftSaved,
    setDraftSaved,
  ] =
    useState(
      false
    );

  const [
    exportImageUrl,
    setExportImageUrl,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    exportState,
    setExportState,
  ] =
    useState<ExportState>({
      active:
        false,

      message:
        "",

      error:
        null,
    });

  const exportNodes =
    useRef<
      Record<
        SlideType,
        HTMLDivElement | null
      >
    >({
      cover:
        null,

      product:
        null,

      outro:
        null,
    });

  const currentTitle =
    titles[
      slideType
    ];

  const currentSlideLabel =
    SLIDE_LABELS[
      slideType
    ];

  const exportProduct =
    useMemo(
      () => ({
        ...product,

        imageUrl:
          exportImageUrl ??
          product.imageUrl,
      }),
      [
        exportImageUrl,
        product,
      ]
    );

  useEffect(
    () => {
      try {
        const saved =
          window.localStorage
            .getItem(
              getStorageKey(
                product.id
              )
            );

        if (
          !saved
        ) {
          setDraftReady(
            true
          );

          return;
        }

        const parsed =
          JSON.parse(
            saved
          ) as
            Partial<StudioDraft>;

        if (
          parsed.version !==
          2
        ) {
          setDraftReady(
            true
          );

          return;
        }

        if (
          parsed.template ===
            "fashion" ||
          parsed.template ===
            "minimal" ||
          parsed.template ===
            "deal"
        ) {
          setTemplate(
            parsed.template
          );
        }

        if (
          parsed.imageFit ===
            "cover" ||
          parsed.imageFit ===
            "contain"
        ) {
          setImageFit(
            parsed.imageFit
          );
        }

        if (
          typeof parsed.showPrice ===
          "boolean"
        ) {
          setShowPrice(
            parsed.showPrice
          );
        }

        if (
          typeof parsed.showOldPrice ===
          "boolean"
        ) {
          setShowOldPrice(
            parsed.showOldPrice
          );
        }

        if (
          typeof parsed.showSheinSource ===
          "boolean"
        ) {
          setShowSheinSource(
            parsed.showSheinSource
          );
        }

        if (
          typeof parsed.showCategory ===
          "boolean"
        ) {
          setShowCategory(
            parsed.showCategory
          );
        }

        if (
          parsed.titles
        ) {
          setTitles({
            cover:
              parsed.titles.cover ??
              DEFAULT_COVER_TITLE,

            product:
              parsed.titles.product ??
              product.shortName,

            outro:
              parsed.titles.outro ??
              DEFAULT_OUTRO_TITLE,
          });
        }
      } catch (
        error
      ) {
        console.warn(
          "Nie udało się przywrócić projektu Social Studio:",
          error
        );
      } finally {
        setDraftReady(
          true
        );
      }
    },
    [
      product.id,
      product.shortName,
    ]
  );

  useEffect(
    () => {
      if (
        !draftReady
      ) {
        return;
      }

      const timeout =
        window.setTimeout(
          () => {
            const draft:
              StudioDraft = {
              version:
                2,

              template,

              imageFit,

              showPrice,

              showOldPrice,

              showSheinSource,

              showCategory,

              titles,
            };

            try {
              window.localStorage
                .setItem(
                  getStorageKey(
                    product.id
                  ),
                  JSON.stringify(
                    draft
                  )
                );

              setDraftSaved(
                true
              );

              window.setTimeout(
                () => {
                  setDraftSaved(
                    false
                  );
                },
                1100
              );
            } catch (
              error
            ) {
              console.warn(
                "Nie udało się zapisać projektu Social Studio:",
                error
              );
            }
          },
          300
        );

      return () => {
        window.clearTimeout(
          timeout
        );
      };
    },
    [
      draftReady,
      imageFit,
      product.id,
      showCategory,
      showOldPrice,
      showPrice,
      showSheinSource,
      template,
      titles,
    ]
  );

  function updateCurrentTitle(
    value:
      string
  ) {
    setTitles(
      (
        current
      ) => ({
        ...current,

        [slideType]:
          value,
      })
    );
  }

  function resetStudio() {
    const confirmed =
      window.confirm(
        "Przywrócić domyślny wygląd tego projektu?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setTemplate(
      "minimal"
    );

    setImageFit(
      "contain"
    );

    setShowPrice(
      true
    );

    setShowOldPrice(
      false
    );

    setShowSheinSource(
      true
    );

    setShowCategory(
      true
    );

    setShowSafeArea(
      false
    );

    setTitles(
      getDefaultTitles(
        product
      )
    );

    setExportState({
      active:
        false,

      message:
        "",

      error:
        null,
    });

    try {
      window.localStorage
        .removeItem(
          getStorageKey(
            product.id
          )
        );
    } catch {
      // localStorage może być niedostępny.
    }
  }

  async function prepareImageForExport() {
    if (
      exportImageUrl
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          product.imageUrl,
          {
            cache:
              "no-store",
          }
        );

      if (
        !response.ok
      ) {
        throw new Error(
          "Nie udało się pobrać zdjęcia produktu."
        );
      }

      const blob =
        await response.blob();

      const dataUrl =
        await dataUrlFromBlob(
          blob
        );

      setExportImageUrl(
        dataUrl
      );

      await waitForPaint();
    } catch (
      error
    ) {
      console.warn(
        "Nie udało się osadzić zdjęcia przed eksportem. Używamy oryginalnego adresu.",
        error
      );
    }
  }

  async function renderSlideToPng(
    type:
      SlideType
  ) {
    const node =
      exportNodes.current[
        type
      ];

    if (
      !node
    ) {
      throw new Error(
        "Nie udało się przygotować slajdu do eksportu."
      );
    }

    await waitForImages(
      node
    );

    if (
      document.fonts
    ) {
      await document
        .fonts
        .ready;
    }

    await waitForPaint();

    const {
      toPng,
    } =
      await import(
        "html-to-image"
      );

    const theme =
      getSlideTheme(
        template
      );

    return toPng(
      node,
      {
        width:
          1080,

        height:
          1920,

        canvasWidth:
          1080,

        canvasHeight:
          1920,

        pixelRatio:
          1,

        cacheBust:
          true,

        backgroundColor:
          theme.exportBackground,
      }
    );
  }

  async function exportSingleSlide(
    type:
      SlideType
  ) {
    if (
      exportState.active
    ) {
      return;
    }

    setExportState({
      active:
        true,

      message:
        "Przygotowuję PNG 1080 × 1920…",

      error:
        null,
    });

    try {
      await prepareImageForExport();

      await waitForPaint();

      const dataUrl =
        await renderSlideToPng(
          type
        );

      triggerDownload(
        dataUrl,
        getSlideFileName(
          product,
          type
        )
      );

      setExportState({
        active:
          false,

        message:
          "✓ PNG gotowy",

        error:
          null,
      });
    } catch (
      error
    ) {
      console.error(
        "Błąd eksportu Social Studio:",
        error
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się utworzyć PNG. Sprawdź zdjęcie produktu i spróbuj ponownie.",
      });
    }
  }

  async function shareSingleSlide(
    type:
      SlideType
  ) {
    if (
      exportState.active
    ) {
      return;
    }

    setExportState({
      active:
        true,

      message:
        "Przygotowuję plik…",

      error:
        null,
    });

    try {
      await prepareImageForExport();

      await waitForPaint();

      const fileName =
        getSlideFileName(
          product,
          type
        );

      const dataUrl =
        await renderSlideToPng(
          type
        );

      const file =
        await dataUrlToFile(
          dataUrl,
          fileName
        );

      if (
        typeof navigator.share ===
          "function" &&
        (
          !navigator.canShare ||
          navigator.canShare({
            files: [
              file,
            ],
          })
        )
      ) {
        await navigator.share({
          files: [
            file,
          ],

          title:
            "Trend za Mniej",
        });

        setExportState({
          active:
            false,

          message:
            "✓ Otworzono udostępnianie",

          error:
            null,
        });

        return;
      }

      triggerDownload(
        dataUrl,
        fileName
      );

      setExportState({
        active:
          false,

        message:
          "✓ Pobrano PNG",

        error:
          null,
      });
    } catch (
      error
    ) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        setExportState({
          active:
            false,

          message:
            "",

          error:
            null,
        });

        return;
      }

      console.error(
        "Błąd udostępniania:",
        error
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się udostępnić pliku. Pobierz PNG.",
      });
    }
  }

  async function exportFullPack() {
    if (
      exportState.active
    ) {
      return;
    }

    setExportState({
      active:
        true,

      message:
        "Przygotowuję zestaw 1/3…",

      error:
        null,
    });

    try {
      await prepareImageForExport();

      await waitForPaint();

      for (
        let index =
          0;
        index <
          EXPORT_ORDER.length;
        index +=
          1
      ) {
        const type =
          EXPORT_ORDER[
            index
          ];

        setExportState({
          active:
            true,

          message:
            `Eksport ${index + 1}/3…`,

          error:
            null,
        });

        const dataUrl =
          await renderSlideToPng(
            type
          );

        triggerDownload(
          dataUrl,
          getSlideFileName(
            product,
            type
          )
        );

        await new Promise<void>(
          (
            resolve
          ) => {
            window.setTimeout(
              resolve,
              220
            );
          }
        );
      }

      setExportState({
        active:
          false,

        message:
          "✓ Zestaw 3 slajdów gotowy",

        error:
          null,
      });
    } catch (
      error
    ) {
      console.error(
        "Błąd eksportu zestawu:",
        error
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się pobrać całego zestawu.",
      });
    }
  }

  const previewSlide =
    (
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
          showSafeArea
        }
        title={
          titles[
            slideType
          ]
        }
      />
    );

  return (
    <>
      <div className="mx-auto max-w-[1320px] px-3 pb-28 pt-4 sm:px-5 sm:pb-12 sm:pt-6">
        <section className="rounded-[24px] border border-black/[0.055] bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.045)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-stone-950 text-sm font-black text-white">
                T
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-black tracking-[-0.035em] text-stone-950 sm:text-xl">
                    Social Media Studio
                  </h1>

                  <span className="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-[9px] font-black text-stone-500">
                    2.0
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[11px] font-semibold text-stone-400">
                  {
                    product.shortName
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusChip>
                TikTok 9:16
              </StatusChip>

              <StatusChip>
                1080 × 1920
              </StatusChip>

              <StatusChip
                success={
                  draftSaved
                }
              >
                {draftSaved
                  ? "Zapisano"
                  : "Autozapis"}
              </StatusChip>

              <button
                type="button"
                onClick={
                  resetStudio
                }
                className="min-h-9 rounded-[12px] border border-black/[0.07] bg-white px-3 text-[10px] font-black text-stone-500"
              >
                Reset
              </button>

              <Link
                href="/admin"
                className="inline-flex min-h-9 items-center justify-center rounded-[12px] border border-black/[0.07] bg-white px-3 text-[10px] font-black text-stone-600"
              >
                Oferty
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          <aside className="order-2 space-y-3 xl:order-1">
            <ControlGroup
              title="Slajd"
            >
              <SegmentedControl
                value={
                  slideType
                }
                options={[
                  {
                    value:
                      "cover",

                    label:
                      "Okładka",
                  },

                  {
                    value:
                      "product",

                    label:
                      "Produkt",
                  },

                  {
                    value:
                      "outro",

                    label:
                      "Koniec",
                  },
                ]}
                onChange={(
                  value
                ) =>
                  setSlideType(
                    value as
                      SlideType
                  )
                }
              />
            </ControlGroup>

            <ControlGroup
              title="Styl"
            >
              <div className="grid grid-cols-3 gap-2">
                <StyleButton
                  active={
                    template ===
                    "minimal"
                  }
                  title="Light"
                  subtitle="premium"
                  preview="light"
                  onClick={() =>
                    setTemplate(
                      "minimal"
                    )
                  }
                />

                <StyleButton
                  active={
                    template ===
                    "fashion"
                  }
                  title="Warm"
                  subtitle="fashion"
                  preview="warm"
                  onClick={() =>
                    setTemplate(
                      "fashion"
                    )
                  }
                />

                <StyleButton
                  active={
                    template ===
                    "deal"
                  }
                  title="Dark"
                  subtitle="contrast"
                  preview="dark"
                  onClick={() =>
                    setTemplate(
                      "deal"
                    )
                  }
                />
              </div>
            </ControlGroup>

            <ControlGroup
              title={`Tekst • ${currentSlideLabel}`}
            >
              <textarea
                value={
                  currentTitle
                }
                onChange={(
                  event
                ) =>
                  updateCurrentTitle(
                    event.target.value
                  )
                }
                rows={
                  3
                }
                maxLength={
                  90
                }
                className="w-full resize-none rounded-[15px] border border-black/[0.07] bg-[#f5f5f7] px-3.5 py-3 text-sm font-bold leading-5 text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-100"
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] font-semibold text-stone-400">
                  Edycja na żywo
                </span>

                <span className="text-[9px] font-black text-stone-400">
                  {
                    currentTitle.length
                  }
                  /90
                </span>
              </div>
            </ControlGroup>

            {slideType ===
              "product" && (
              <ControlGroup
                title="Informacje produktu"
              >
                <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                  <SwitchRow
                    label="Cena"
                    description="Pokaż cenę produktu"
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
                  />

                  <Divider />

                  <SwitchRow
                    label="Stara cena"
                    description={
                      product.oldPrice ===
                      null
                        ? "Brak starej ceny"
                        : "Pokaż starą cenę"
                    }
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
                  />

                  <Divider />

                  <SwitchRow
                    label="Kategoria"
                    description="Pokaż kategorię produktu"
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
                  />

                  <Divider />

                  <SwitchRow
                    label="Źródło SHEIN"
                    description="Znalezisko z SHEIN"
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
                  />
                </div>

                <p className="mb-2 mt-4 text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                  Zdjęcie
                </p>

                <SegmentedControl
                  value={
                    imageFit
                  }
                  options={[
                    {
                      value:
                        "contain",

                      label:
                        "Cały produkt",
                    },

                    {
                      value:
                        "cover",

                      label:
                        "Wypełnij",
                    },
                  ]}
                  onChange={(
                    value
                  ) =>
                    setImageFit(
                      value as
                        ImageFit
                    )
                  }
                />
              </ControlGroup>
            )}

            {slideType ===
              "cover" && (
              <ControlGroup
                title="Okładka"
              >
                <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                  <SwitchRow
                    label="Źródło SHEIN"
                    description="Pokaż źródło produktu"
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
                  />
                </div>

                <p className="mb-2 mt-4 text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
                  Zdjęcie
                </p>

                <SegmentedControl
                  value={
                    imageFit
                  }
                  options={[
                    {
                      value:
                        "contain",

                      label:
                        "Cały produkt",
                    },

                    {
                      value:
                        "cover",

                      label:
                        "Wypełnij",
                    },
                  ]}
                  onChange={(
                    value
                  ) =>
                    setImageFit(
                      value as
                        ImageFit
                    )
                  }
                />
              </ControlGroup>
            )}

            <ControlGroup
              title="TikTok"
            >
              <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                <SwitchRow
                  label="Bezpieczna strefa"
                  description="Pokaż obszar interfejsu TikTok"
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
                />
              </div>

              <div className="mt-3 rounded-[15px] bg-[#f5f5f7] px-3.5 py-3">
                <p className="text-[10px] font-black text-stone-700">
                  Oznaczenie reklamowe
                </p>

                <p className="mt-1 text-[9px] leading-4 text-stone-400">
                  Każdy slajd zawiera
                  oznaczenie materiału
                  reklamowego i SHEIN.
                </p>
              </div>
            </ControlGroup>

            <ControlGroup
              title="Eksport"
            >
              <button
                type="button"
                disabled={
                  exportState.active
                }
                onClick={() =>
                  void exportSingleSlide(
                    slideType
                  )
                }
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[15px] bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-black disabled:opacity-50"
              >
                <DownloadIcon />

                {exportState.active
                  ? "Przygotowuję…"
                  : "Pobierz PNG"}
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={
                    exportState.active
                  }
                  onClick={() =>
                    void shareSingleSlide(
                      slideType
                    )
                  }
                  className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-black/[0.07] bg-white px-3 text-[11px] font-black text-stone-700 disabled:opacity-50"
                >
                  <ShareIcon />

                  Udostępnij
                </button>

                <button
                  type="button"
                  disabled={
                    exportState.active
                  }
                  onClick={() =>
                    void exportFullPack()
                  }
                  className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-black/[0.07] bg-white px-3 text-[11px] font-black text-stone-700 disabled:opacity-50"
                >
                  <StackIcon />

                  3 slajdy
                </button>
              </div>

              <div className="mt-3 rounded-[13px] bg-[#f5f5f7] px-3 py-2 text-center">
                <p className="text-[9px] font-black text-stone-500">
                  PNG • 1080 × 1920
                </p>
              </div>

              {exportState.message && (
                <p className="mt-3 text-center text-[10px] font-black text-emerald-600">
                  {
                    exportState.message
                  }
                </p>
              )}

              {exportState.error && (
                <p className="mt-3 rounded-[13px] bg-red-50 px-3 py-2 text-center text-[10px] font-bold leading-4 text-red-700">
                  {
                    exportState.error
                  }
                </p>
              )}
            </ControlGroup>
          </aside>

          <section className="order-1 xl:order-2 xl:sticky xl:top-24">
            <div className="rounded-[26px] border border-black/[0.055] bg-[#ededf1] p-3 shadow-[0_14px_50px_rgba(15,23,42,0.07)] sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400">
                    Podgląd publikacji
                  </p>

                  <p className="mt-0.5 text-xs font-black text-stone-800">
                    {
                      currentSlideLabel
                    }
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <span className="rounded-full bg-white px-2.5 py-1.5 text-[9px] font-black text-stone-500 shadow-sm">
                    1080 × 1920
                  </span>

                  <span className="rounded-full bg-stone-950 px-2.5 py-1.5 text-[9px] font-black text-white">
                    9:16
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[355px]">
                  <div className="rounded-[36px] bg-[#1c1c1e] p-[4px] shadow-[0_26px_70px_rgba(0,0,0,0.20)]">
                    <div className="overflow-hidden rounded-[32px] bg-white">
                      {
                        previewSlide
                      }
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {EXPORT_ORDER.map(
                      (
                        type,
                        index
                      ) => {
                        const active =
                          slideType ===
                          type;

                        return (
                          <button
                            key={
                              type
                            }
                            type="button"
                            onClick={() =>
                              setSlideType(
                                type
                              )
                            }
                            className={[
                              "rounded-[14px] border px-2 py-2.5 text-center transition",
                              active
                                ? "border-stone-950 bg-stone-950 text-white"
                                : "border-white bg-white/80 text-stone-500",
                            ].join(
                              " "
                            )}
                          >
                            <span className="block text-[8px] font-black opacity-50">
                              0{
                                index +
                                1
                              }
                            </span>

                            <span className="mt-0.5 block text-[9px] font-black">
                              {
                                SLIDE_LABELS[
                                  type
                                ]
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-20000px] top-0"
      >
        {EXPORT_ORDER.map(
          (
            type
          ) => (
            <div
              key={
                type
              }
              ref={(
                node
              ) => {
                exportNodes.current[
                  type
                ] =
                  node;
              }}
              style={{
                width:
                  "1080px",

                height:
                  "1920px",
              }}
            >
              <SocialSlide
                product={
                  exportProduct
                }
                slideType={
                  type
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
                  false
                }
                title={
                  titles[
                    type
                  ]
                }
              />
            </div>
          )
        )}
      </div>
    </>
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
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div
      className={[
        "relative aspect-[9/16] h-full w-full overflow-hidden [container-type:size]",
        theme.background,
      ].join(
        " "
      )}
    >
      <SlideBackground
        product={
          product
        }
        template={
          template
        }
      />

      <div className="relative z-10 h-full px-[5.5cqw] pb-[7cqw] pt-[5cqw]">
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
    <div className="flex h-full flex-col">
      <SlideHeader
        template={
          template
        }
      />

      <div className="mt-[2cqw] flex items-center justify-between gap-[2cqw]">
        <DisclosureBadge
          template={
            template
          }
        />

        {showSheinSource && (
          <span
            className={[
              "rounded-full px-[2.3cqw] py-[1.05cqw] text-[1.7cqw] font-black",
              theme.pill,
            ].join(
              " "
            )}
          >
            SHEIN
          </span>
        )}
      </div>

      <div className="mt-[3.5cqw]">
        <div
          className={[
            "relative h-[81cqw] overflow-hidden rounded-[6cqw] border p-[1.8cqw] shadow-[0_5cqw_15cqw_rgba(0,0,0,0.11)]",
            theme.strongSurface,
            theme.border,
          ].join(
            " "
          )}
        >
          <div
            className={[
              "relative h-full overflow-hidden rounded-[4.6cqw]",
              theme.imageSurface,
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
                  : "object-contain p-[3.5cqw]",
              ].join(
                " "
              )}
            />

            <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-black/32 via-black/[0.08] to-transparent" />

            {product.featured && (
              <span className="absolute left-[2.7cqw] top-[2.7cqw] rounded-full border border-white/60 bg-white/92 px-[2.5cqw] py-[1.1cqw] text-[1.9cqw] font-black text-stone-900 shadow-sm">
                🔥 Wybrane
              </span>
            )}

            {showSheinSource && (
              <span className="absolute bottom-[2.7cqw] left-[2.7cqw] rounded-full bg-black/60 px-[2.6cqw] py-[1.15cqw] text-[1.8cqw] font-black text-white backdrop-blur-xl">
                Znalezisko z SHEIN
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-[3.5cqw] rounded-[5cqw] border px-[4.2cqw] py-[3.7cqw] shadow-[0_2cqw_8cqw_rgba(0,0,0,0.06)] backdrop-blur-2xl",
          theme.surface,
          theme.border,
        ].join(
          " "
        )}
      >
        {showCategory && (
          <div className="flex items-center gap-[1.5cqw]">
            <span className="h-[1.15cqw] w-[1.15cqw] rounded-full bg-rose-500" />

            <p
              className={[
                "text-[1.95cqw] font-black uppercase tracking-[0.13em]",
                theme.accentText,
              ].join(
                " "
              )}
            >
              {
                product.category
              }
            </p>
          </div>
        )}

        <div className="mt-[1.8cqw] flex items-start justify-between gap-[4cqw]">
          <div className="min-w-0 flex-1">
            <h2
              className={[
                "line-clamp-2 text-[5.7cqw] font-black leading-[0.98] tracking-[-0.05em]",
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
                "mt-[1.7cqw] line-clamp-1 text-[1.8cqw] font-semibold",
                theme.secondaryText,
              ].join(
                " "
              )}
            >
              Wybrany produkt •
              Trend za Mniej
            </p>
          </div>

          {showPrice && (
            <div className="shrink-0 text-right">
              <p
                className={[
                  "whitespace-nowrap text-[5.1cqw] font-black tracking-[-0.05em]",
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
                  <p className="mt-[0.4cqw] text-[2.2cqw] font-bold text-stone-400 line-through">
                    {formatPrice(
                      product.oldPrice
                    )}
                  </p>
                )}

              <p
                className={[
                  "mt-[0.6cqw] text-[1.55cqw] font-semibold",
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

        <div className="mt-[3cqw] flex items-center gap-[1.5cqw]">
          <span
            className={[
              "rounded-full px-[2.4cqw] py-[1.05cqw] text-[1.65cqw] font-black",
              theme.pill,
            ].join(
              " "
            )}
          >
            Moda
          </span>

          <span
            className={[
              "rounded-full px-[2.4cqw] py-[1.05cqw] text-[1.65cqw] font-black",
              theme.pill,
            ].join(
              " "
            )}
          >
            Okazje
          </span>

          <span
            className={[
              "rounded-full px-[2.4cqw] py-[1.05cqw] text-[1.65cqw] font-black",
              theme.pill,
            ].join(
              " "
            )}
          >
            Inspiracje
          </span>
        </div>
      </div>

      <div className="mt-auto pt-[3cqw]">
        <SlideFooter
          template={
            template
          }
        />
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
    <div className="flex h-full flex-col">
      <SlideHeader
        template={
          template
        }
      />

      <div className="mt-[2cqw]">
        <DisclosureBadge
          template={
            template
          }
        />
      </div>

      <div
        className={[
          "mt-[3.8cqw] rounded-[5.5cqw] border px-[4.3cqw] py-[3.7cqw] shadow-[0_2cqw_8cqw_rgba(0,0,0,0.055)] backdrop-blur-xl",
          theme.surface,
          theme.border,
        ].join(
          " "
        )}
      >
        <p
          className={[
            "text-[1.9cqw] font-black uppercase tracking-[0.15em]",
            theme.accentText,
          ].join(
            " "
          )}
        >
          Nowe znalezisko
        </p>

        <h2
          className={[
            "mt-[1.7cqw] max-w-[80cqw] text-[6.6cqw] font-black leading-[0.96] tracking-[-0.058em]",
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
            "mt-[2cqw] max-w-[70cqw] text-[2cqw] font-semibold leading-[1.45]",
            theme.secondaryText,
          ].join(
            " "
          )}
        >
          Sprawdzamy modowe
          produkty i wybieramy
          te, które warto zobaczyć.
        </p>
      </div>

      <div
        className={[
          "relative mt-[3.8cqw] h-[78cqw] overflow-hidden rounded-[6.5cqw] border p-[1.8cqw] shadow-[0_5cqw_15cqw_rgba(0,0,0,0.11)]",
          theme.strongSurface,
          theme.border,
        ].join(
          " "
        )}
      >
        <div
          className={[
            "relative h-full overflow-hidden rounded-[5cqw]",
            theme.imageSurface,
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

          <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

          <div className="absolute inset-x-[3cqw] bottom-[3cqw]">
            <div className="flex items-end justify-between gap-[3cqw]">
              <div>
                {showSheinSource && (
                  <p className="text-[1.8cqw] font-black uppercase tracking-[0.11em] text-white/70">
                    Znalezisko z SHEIN
                  </p>
                )}

                <p className="mt-[0.8cqw] text-[3.5cqw] font-black tracking-[-0.04em] text-white">
                  Zobacz szczegóły
                  produktu
                </p>
              </div>

              <span className="flex h-[8cqw] w-[8cqw] shrink-0 items-center justify-center rounded-full bg-white text-[3.7cqw] font-black text-stone-950">
                →
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-[3cqw]">
        <SlideFooter
          template={
            template
          }
        />
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
    <div className="flex h-full flex-col">
      <SlideHeader
        template={
          template
        }
      />

      <div className="mt-[2cqw]">
        <DisclosureBadge
          template={
            template
          }
        />
      </div>

      <div className="flex flex-1 items-center justify-center py-[4cqw]">
        <div
          className={[
            "w-full rounded-[7cqw] border px-[6cqw] py-[7cqw] text-center shadow-[0_5cqw_16cqw_rgba(0,0,0,0.08)] backdrop-blur-2xl",
            theme.surface,
            theme.border,
          ].join(
            " "
          )}
        >
          <div
            className={[
              "mx-auto flex h-[14cqw] w-[14cqw] items-center justify-center rounded-[4.2cqw] text-[5cqw] font-black shadow-[0_2cqw_6cqw_rgba(0,0,0,0.10)]",
              theme.logo,
            ].join(
              " "
            )}
          >
            T
          </div>

          <p
            className={[
              "mt-[4cqw] text-[1.9cqw] font-black uppercase tracking-[0.16em]",
              theme.accentText,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </p>

          <h2
            className={[
              "mx-auto mt-[2.8cqw] max-w-[75cqw] text-[6.8cqw] font-black leading-[0.97] tracking-[-0.058em]",
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
              "mx-auto mt-[3cqw] max-w-[66cqw] text-[2.1cqw] font-semibold leading-[1.5]",
              theme.secondaryText,
            ].join(
              " "
            )}
          >
            Wybrane produkty,
            modne inspiracje
            i szybkie przejście
            do aktualnych ofert.
          </p>

          <div className="mx-auto mt-[5cqw] grid max-w-[68cqw] grid-cols-3 gap-[1.3cqw]">
            <MiniFeature
              template={
                template
              }
              label="Moda"
            />

            <MiniFeature
              template={
                template
              }
              label="Okazje"
            />

            <MiniFeature
              template={
                template
              }
              label="Inspiracje"
            />
          </div>

          <div
            className={[
              "mx-auto mt-[5cqw] flex min-h-[10.5cqw] max-w-[61cqw] items-center justify-between rounded-full pl-[4cqw] pr-[1.4cqw]",
              theme.button,
            ].join(
              " "
            )}
          >
            <span className="text-[2.4cqw] font-black">
              Zobacz więcej
            </span>

            <span className="flex h-[7.7cqw] w-[7.7cqw] items-center justify-center rounded-full bg-white/15 text-[3.5cqw]">
              →
            </span>
          </div>

          <p
            className={[
              "mt-[4cqw] text-[3cqw] font-black",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            trendzamniej.pl
          </p>
        </div>
      </div>

      <SlideFooter
        template={
          template
        }
      />
    </div>
  );
}

function MiniFeature({
  template,
  label,
}: {
  template:
    TemplateType;

  label:
    string;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div
      className={[
        "rounded-[3cqw] px-[1cqw] py-[2cqw] text-center text-[1.75cqw] font-black",
        theme.pill,
      ].join(
        " "
      )}
    >
      {
        label
      }
    </div>
  );
}

function SlideHeader({
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
        "flex min-h-[10cqw] items-center justify-between rounded-[4cqw] border px-[3cqw] shadow-[0_1.5cqw_6cqw_rgba(0,0,0,0.045)] backdrop-blur-xl",
        theme.surface,
        theme.border,
      ].join(
        " "
      )}
    >
      <div className="flex min-w-0 items-center gap-[2.1cqw]">
        <div
          className={[
            "flex h-[6.7cqw] w-[6.7cqw] shrink-0 items-center justify-center rounded-[2.1cqw] text-[2.5cqw] font-black",
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
              "truncate text-[2.45cqw] font-black tracking-[-0.03em]",
              theme.primaryText,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </p>

          <p
            className={[
              "mt-[0.25cqw] text-[1.5cqw] font-semibold",
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
          "rounded-full px-[2.3cqw] py-[1cqw] text-[1.55cqw] font-black",
          theme.pill,
        ].join(
          " "
        )}
      >
        ✦ daily finds
      </span>
    </div>
  );
}

function DisclosureBadge({
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
    <span
      className={[
        "inline-flex items-center gap-[1cqw] rounded-full border px-[2.2cqw] py-[0.95cqw] text-[1.5cqw] font-black uppercase tracking-[0.075em]",
        theme.surface,
        theme.border,
        theme.primaryText,
      ].join(
        " "
      )}
    >
      <span className="h-[0.9cqw] w-[0.9cqw] rounded-full bg-rose-500" />

      Materiał reklamowy
      <span className="opacity-30">
        •
      </span>
      SHEIN
    </span>
  );
}

function SlideFooter({
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
        "flex min-h-[10.5cqw] items-center justify-between rounded-[4cqw] border px-[3.5cqw] shadow-[0_1.5cqw_6cqw_rgba(0,0,0,0.04)] backdrop-blur-xl",
        theme.surface,
        theme.border,
      ].join(
        " "
      )}
    >
      <div className="min-w-0">
        <p
          className={[
            "text-[1.5cqw] font-semibold",
            theme.secondaryText,
          ].join(
            " "
          )}
        >
          Więcej modowych
          okazji
        </p>

        <p
          className={[
            "mt-[0.2cqw] text-[2.45cqw] font-black",
            theme.primaryText,
          ].join(
            " "
          )}
        >
          trendzamniej.pl
        </p>
      </div>

      <div className="flex items-center gap-[1.5cqw]">
        <span
          className={[
            "rounded-full px-[2.2cqw] py-[0.9cqw] text-[1.5cqw] font-black",
            theme.pill,
          ].join(
            " "
          )}
        >
          Sprawdź
        </span>

        <span
          className={[
            "flex h-[7cqw] w-[7cqw] items-center justify-center rounded-full text-[3cqw] font-black",
            theme.button,
          ].join(
            " "
          )}
        >
          →
        </span>
      </div>
    </div>
  );
}

function SlideBackground({
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
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-[0.10] blur-[55px]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d20] via-[#121214] to-[#09090a]" />

        <div className="absolute -left-[20cqw] top-[25cqh] h-[65cqw] w-[65cqw] rounded-full bg-rose-500/[0.07] blur-[38px]" />
      </>
    );
  }

  if (
    template ===
    "fashion"
  ) {
    return (
      <>
        <img
          src={
            product.imageUrl
          }
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-[0.05] blur-[55px]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#fbf6f3] via-[#f7efeb] to-[#eee3dd]" />

        <div className="absolute -left-[16cqw] top-[23cqh] h-[70cqw] w-[70cqw] rounded-full bg-[#e8d3ca]/45 blur-[42px]" />

        <div className="absolute -right-[20cqw] bottom-[8cqh] h-[60cqw] w-[60cqw] rounded-full bg-white/55 blur-[45px]" />
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
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-[0.035] blur-[60px]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#fafafb] via-[#f5f5f7] to-[#ebebef]" />

      <div className="absolute -right-[18cqw] top-[17cqh] h-[70cqw] w-[70cqw] rounded-full bg-white/80 blur-[40px]" />

      <div className="absolute -left-[20cqw] bottom-[8cqh] h-[55cqw] w-[55cqw] rounded-full bg-[#e4e4ea]/50 blur-[40px]" />
    </>
  );
}

function SafeAreaOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 [container-type:size]">
      <div className="absolute bottom-[17cqh] left-[4cqw] right-[14cqw] top-[6cqh] rounded-[4cqw] border border-dashed border-rose-500/65">
        <span className="absolute left-[2cqw] top-[2cqw] rounded-full bg-rose-500 px-[2cqw] py-[0.7cqw] text-[1.45cqw] font-black text-white">
          TikTok safe
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[16cqh] bg-rose-500/[0.045]" />

      <div className="absolute bottom-[16cqh] right-0 top-[15cqh] w-[13cqw] bg-rose-500/[0.045]" />
    </div>
  );
}

function getSlideTheme(
  template:
    TemplateType
): SlideTheme {
  if (
    template ===
    "deal"
  ) {
    return {
      background:
        "bg-[#111113]",

      surface:
        "bg-white/[0.09]",

      strongSurface:
        "bg-white/[0.12]",

      imageSurface:
        "bg-[#1c1c1e]",

      border:
        "border-white/[0.12]",

      primaryText:
        "text-white",

      secondaryText:
        "text-white/50",

      accentText:
        "text-rose-200",

      pill:
        "bg-white/[0.09] text-white/70",

      logo:
        "bg-white text-stone-950",

      button:
        "bg-white text-stone-950",

      exportBackground:
        "#111113",
    };
  }

  if (
    template ===
    "fashion"
  ) {
    return {
      background:
        "bg-[#f6efeb]",

      surface:
        "bg-white/68",

      strongSurface:
        "bg-white/78",

      imageSurface:
        "bg-[#fffdfc]",

      border:
        "border-white/80",

      primaryText:
        "text-[#29201d]",

      secondaryText:
        "text-[#94847d]",

      accentText:
        "text-[#a15e51]",

      pill:
        "bg-[#eee0da] text-[#87554a]",

      logo:
        "bg-[#2d2421] text-white",

      button:
        "bg-[#2d2421] text-white",

      exportBackground:
        "#f6efeb",
    };
  }

  return {
    background:
      "bg-[#f4f4f6]",

    surface:
      "bg-white/72",

    strongSurface:
      "bg-white/82",

    imageSurface:
      "bg-white",

    border:
      "border-white/85",

    primaryText:
      "text-[#1c1c1e]",

    secondaryText:
      "text-[#8e8e93]",

    accentText:
      "text-[#5f5f64]",

    pill:
      "bg-[#e9e9ee] text-[#5f5f64]",

    logo:
      "bg-[#1c1c1e] text-white",

    button:
      "bg-[#1c1c1e] text-white",

    exportBackground:
      "#f4f4f6",
  };
}

function ControlGroup({
  title,
  children,
}: {
  title:
    string;

  children:
    ReactNode;
}) {
  return (
    <section className="rounded-[21px] border border-black/[0.055] bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <h2 className="px-1 text-[9px] font-black uppercase tracking-[0.12em] text-stone-400">
        {
          title
        }
      </h2>

      <div className="mt-2.5">
        {
          children
        }
      </div>
    </section>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value:
    string;

  options:
    Array<{
      value:
        string;

      label:
        string;
    }>;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <div
      className="grid gap-1 rounded-[13px] bg-[#e9e9ee] p-1"
      style={{
        gridTemplateColumns:
          `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map(
        (
          option
        ) => {
          const active =
            value ===
            option.value;

          return (
            <button
              key={
                option.value
              }
              type="button"
              onClick={() =>
                onChange(
                  option.value
                )
              }
              className={[
                "min-h-9 rounded-[10px] px-2 text-[10px] font-black transition",
                active
                  ? "bg-white text-stone-950 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                  : "text-stone-500",
              ].join(
                " "
              )}
            >
              {
                option.label
              }
            </button>
          );
        }
      )}
    </div>
  );
}

function StyleButton({
  active,
  title,
  subtitle,
  preview,
  onClick,
}: {
  active:
    boolean;

  title:
    string;

  subtitle:
    string;

  preview:
    | "light"
    | "warm"
    | "dark";

  onClick:
    () => void;
}) {
  const previewClass =
    preview ===
    "light"
      ? "bg-gradient-to-br from-white to-[#e4e4e9]"
      : preview ===
          "warm"
        ? "bg-gradient-to-br from-[#faf2ed] to-[#dfcdc5]"
        : "bg-gradient-to-br from-[#29292d] to-[#09090a]";

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "rounded-[15px] border p-2 text-left transition",
        active
          ? "border-stone-950 bg-stone-950 text-white"
          : "border-black/[0.06] bg-[#f7f7f9] text-stone-700",
      ].join(
        " "
      )}
    >
      <span
        className={[
          "block h-9 rounded-[10px] border border-white/30",
          previewClass,
        ].join(
          " "
        )}
      />

      <span className="mt-1.5 block text-[10px] font-black">
        {
          title
        }
      </span>

      <span
        className={[
          "mt-0.5 block text-[8px] font-semibold",
          active
            ? "text-white/50"
            : "text-stone-400",
        ].join(
          " "
        )}
      >
        {
          subtitle
        }
      </span>
    </button>
  );
}

function SwitchRow({
  label,
  description,
  active,
  disabled = false,
  onClick,
}: {
  label:
    string;

  description:
    string;

  active:
    boolean;

  disabled?:
    boolean;

  onClick:
    () => void;
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
        "flex min-h-[58px] w-full items-center gap-3 px-3 text-left transition",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-[#f7f7f9]",
      ].join(
        " "
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-black text-stone-900">
          {
            label
          }
        </span>

        <span className="mt-0.5 block text-[9px] leading-4 text-stone-400">
          {
            description
          }
        </span>
      </span>

      <span
        className={[
          "flex h-[27px] w-[46px] shrink-0 items-center rounded-full p-[2px] transition",
          active &&
          !disabled
            ? "justify-end bg-[#34c759]"
            : "justify-start bg-[#d1d1d6]",
        ].join(
          " "
        )}
      >
        <span className="h-[23px] w-[23px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.22)]" />
      </span>
    </button>
  );
}

function Divider() {
  return (
    <div className="ml-3 h-px bg-black/[0.055]" />
  );
}

function StatusChip({
  children,
  success = false,
}: {
  children:
    ReactNode;

  success?:
    boolean;
}) {
  return (
    <span
      className={[
        "inline-flex min-h-8 items-center rounded-full border px-2.5 text-[9px] font-black",
        success
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-black/[0.06] bg-[#f5f5f7] text-stone-500",
      ].join(
        " "
      )}
    >
      {
        children
      }
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 12v8h14v-8" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}