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

type SlideType = "cover" | "product" | "outro";
type TemplateType = "minimal" | "fashion" | "deal";
type ImageFit = "contain" | "cover";
type ImageStatus = "idle" | "loading" | "ready" | "fallback" | "error";

type SlideTitles = Record<SlideType, string>;

type StudioDraft = {
  version: 3;
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
  page: string;
  panel: string;
  panelStrong: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  pill: string;
  logo: string;
  cta: string;
  imageSurface: string;
  exportBackground: string;
};

const DEFAULT_COVER_TITLE = "Modowe znalezisko warte uwagi";
const DEFAULT_OUTRO_TITLE =
  "Więcej modowych okazji znajdziesz na Trend za Mniej";

const MAX_NORMALIZED_IMAGE_SIDE = 2048;

const EXPORT_ORDER: SlideType[] = [
  "cover",
  "product",
  "outro",
];

const SLIDE_LABELS: Record<
  SlideType,
  string
> = {
  cover: "Okładka",
  product: "Produkt",
  outro: "Koniec",
};

const SLIDE_DESCRIPTIONS: Record<
  SlideType,
  string
> = {
  cover:
    "Mocny pierwszy slajd, który zatrzymuje uwagę.",

  product:
    "Najważniejsze informacje o produkcie i cenie.",

  outro:
    "Czytelne zakończenie z adresem strony.",
};

function formatPrice(
  value: number | string
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

function getDiscountPercent(
  price: number | string,
  oldPrice:
    | number
    | string
    | null
) {
  const current =
    Number(
      price
    );

  const previous =
    oldPrice ===
      null
      ? NaN
      : Number(
          oldPrice
        );

  if (
    !Number.isFinite(
      current
    ) ||
    !Number.isFinite(
      previous
    ) ||
    previous <= 0 ||
    previous <=
      current
  ) {
    return null;
  }

  return Math.max(
    1,
    Math.min(
      99,
      Math.round(
        (
          (
            previous -
            current
          ) /
          previous
        ) *
          100
      )
    )
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
  return `trend-za-mniej:social-studio:v3:${productId}`;
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

function isIOSWebKit() {
  if (
    typeof navigator ===
      "undefined"
  ) {
    return false;
  }

  return (
    /iPad|iPhone|iPod/i.test(
      navigator.userAgent
    ) ||
    (
      navigator.platform ===
        "MacIntel" &&
      navigator.maxTouchPoints >
        1
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
            () =>
              resolve()
          );
        }
      );
    }
  );
}

async function waitForExportPaint() {
  await waitForPaint();

  if (
    isIOSWebKit()
  ) {
    await new Promise<void>(
      (
        resolve
      ) => {
        window.setTimeout(
          resolve,
          140
        );
      }
    );
  }

  await waitForPaint();
}

function loadImage(
  source:
    string
) {
  return new Promise<HTMLImageElement>(
    (
      resolve,
      reject
    ) => {
      const image =
        new Image();

      let settled =
        false;

      const timeout =
        window.setTimeout(
          () => {
            if (
              settled
            ) {
              return;
            }

            settled =
              true;

            reject(
              new Error(
                "Przekroczono czas ładowania zdjęcia."
              )
            );
          },
          12000
        );

      const finish = (
        success:
          boolean
      ) => {
        if (
          settled
        ) {
          return;
        }

        settled =
          true;

        window.clearTimeout(
          timeout
        );

        if (
          success &&
          image.naturalWidth >
            0 &&
          image.naturalHeight >
            0
        ) {
          resolve(
            image
          );

          return;
        }

        reject(
          new Error(
            "Nie udało się załadować zdjęcia produktu."
          )
        );
      };

      image.loading =
        "eager";

      image.decoding =
        "async";

      image.onload =
        () =>
          finish(
            true
          );

      image.onerror =
        () =>
          finish(
            false
          );

      image.src =
        source;
    }
  );
}

async function normalizeRemoteImage(
  source:
    string
) {
  const response =
    await fetch(
      source,
      {
        cache:
          "no-store",

        mode:
          "cors",

        credentials:
          "omit",
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Nie udało się pobrać zdjęcia (${response.status}).`
    );
  }

  const blob =
    await response.blob();

  if (
    !blob.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Pobrany plik nie jest obrazem."
    );
  }

  const objectUrl =
    URL.createObjectURL(
      blob
    );

  try {
    const image =
      await loadImage(
        objectUrl
      );

    if (
      typeof image.decode ===
        "function"
    ) {
      try {
        await image.decode();
      } catch {
        // Safari potrafi odrzucić decode() mimo poprawnego onload.
      }
    }

    const longestSide =
      Math.max(
        image.naturalWidth,
        image.naturalHeight
      );

    const scale =
      longestSide >
      MAX_NORMALIZED_IMAGE_SIDE
        ? MAX_NORMALIZED_IMAGE_SIDE /
          longestSide
        : 1;

    const width =
      Math.max(
        1,
        Math.round(
          image.naturalWidth *
            scale
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          image.naturalHeight *
            scale
        )
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
        {
          alpha:
            false,
        }
      );

    if (
      !context
    ) {
      throw new Error(
        "Nie udało się przygotować obrazu do eksportu."
      );
    }

    context.imageSmoothingEnabled =
      true;

    context.imageSmoothingQuality =
      "high";

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      width,
      height
    );

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.94
    );
  } finally {
    URL.revokeObjectURL(
      objectUrl
    );
  }
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
      async (
        image
      ) => {
        if (
          !image.complete ||
          image.naturalWidth <=
            0
        ) {
          await new Promise<void>(
            (
              resolve,
              reject
            ) => {
              const timeout =
                window.setTimeout(
                  () => {
                    cleanup();

                    reject(
                      new Error(
                        "Zdjęcie nie zdążyło się załadować."
                      )
                    );
                  },
                  10000
                );

              const cleanup =
                () => {
                  window.clearTimeout(
                    timeout
                  );

                  image.removeEventListener(
                    "load",
                    handleLoad
                  );

                  image.removeEventListener(
                    "error",
                    handleError
                  );
                };

              const handleLoad =
                () => {
                  cleanup();
                  resolve();
                };

              const handleError =
                () => {
                  cleanup();

                  reject(
                    new Error(
                      "Nie udało się załadować zdjęcia do slajdu."
                    )
                  );
                };

              image.addEventListener(
                "load",
                handleLoad,
                {
                  once:
                    true,
                }
              );

              image.addEventListener(
                "error",
                handleError,
                {
                  once:
                    true,
                }
              );
            }
          );
        }

        if (
          typeof image.decode ===
            "function"
        ) {
          try {
            await image.decode();
          } catch {
            // onload jest wystarczającym fallbackiem dla WebKit.
          }
        }

        if (
          image.naturalWidth <=
            0 ||
          image.naturalHeight <=
            0
        ) {
          throw new Error(
            "Obraz nie został poprawnie zdekodowany."
          );
        }
      }
    )
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

async function downloadDataUrl(
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

  const objectUrl =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    objectUrl;

  link.download =
    fileName;

  link.rel =
    "noopener";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        objectUrl
      ),
    1000
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
    preparedImageUrl,
    setPreparedImageUrl,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    imageStatus,
    setImageStatus,
  ] =
    useState<ImageStatus>(
      "idle"
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

  const displayProduct =
    useMemo(
      () => ({
        ...product,

        imageUrl:
          preparedImageUrl ??
          product.imageUrl,
      }),
      [
        preparedImageUrl,
        product,
      ]
    );

  useEffect(
    () => {
      let disposed =
        false;

      setPreparedImageUrl(
        null
      );

      setImageStatus(
        "loading"
      );

      void (
        async () => {
          try {
            const normalized =
              await normalizeRemoteImage(
                product.imageUrl
              );

            if (
              disposed
            ) {
              return;
            }

            setPreparedImageUrl(
              normalized
            );

            setImageStatus(
              "ready"
            );
          } catch (
            error
          ) {
            console.warn(
              "Social Media Studio: nie udało się znormalizować zdjęcia. Używam oryginalnego adresu.",
              error
            );

            if (
              disposed
            ) {
              return;
            }

            setPreparedImageUrl(
              null
            );

            setImageStatus(
              "fallback"
            );
          }
        }
      )();

      return () => {
        disposed =
          true;
      };
    },
    [
      product.imageUrl,
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
          ) as Partial<StudioDraft>;

        if (
          parsed.version !==
          3
        ) {
          setDraftReady(
            true
          );

          return;
        }

        if (
          parsed.template ===
            "minimal" ||
          parsed.template ===
            "fashion" ||
          parsed.template ===
            "deal"
        ) {
          setTemplate(
            parsed.template
          );
        }

        if (
          parsed.imageFit ===
            "contain" ||
          parsed.imageFit ===
            "cover"
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
          "Nie udało się przywrócić Social Media Studio:",
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
                3,

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
                () =>
                  setDraftSaved(
                    false
                  ),
                1100
              );
            } catch (
              error
            ) {
              console.warn(
                "Nie udało się zapisać Social Media Studio:",
                error
              );
            }
          },
          300
        );

      return () =>
        window.clearTimeout(
          timeout
        );
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
        "Przywrócić domyślne ustawienia tego projektu?"
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
      // localStorage może być niedostępny w niektórych trybach prywatnych.
    }
  }

  async function prepareImageForExport() {
    if (
      preparedImageUrl
        ?.startsWith(
          "data:image/"
        )
    ) {
      return preparedImageUrl;
    }

    setImageStatus(
      "loading"
    );

    try {
      const normalized =
        await normalizeRemoteImage(
          product.imageUrl
        );

      setPreparedImageUrl(
        normalized
      );

      setImageStatus(
        "ready"
      );

      await waitForExportPaint();

      return normalized;
    } catch (
      error
    ) {
      console.warn(
        "Social Media Studio: eksport użyje oryginalnego zdjęcia.",
        error
      );

      setImageStatus(
        "fallback"
      );

      return product.imageUrl;
    }
  }

  async function renderSlideToPng(
    type:
      SlideType,
    imageSource:
      string
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

    const productImages =
      Array.from(
        node.querySelectorAll<HTMLImageElement>(
          '[data-social-product-image="true"]'
        )
      );

    for (
      const image
      of productImages
    ) {
      if (
        image.getAttribute(
          "src"
        ) !==
        imageSource
      ) {
        image.src =
          imageSource;
      }

      image.loading =
        "eager";

      image.decoding =
        "sync";
    }

    await waitForImages(
      node
    );

    if (
      document.fonts
    ) {
      await document.fonts.ready;
    }

    await waitForExportPaint();

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
          false,

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
      const imageSource =
        await prepareImageForExport();

      const dataUrl =
        await renderSlideToPng(
          type,
          imageSource
        );

      await downloadDataUrl(
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
        "Błąd eksportu Social Media Studio:",
        error
      );

      setImageStatus(
        (
          current
        ) =>
          current ===
          "ready"
            ? current
            : "error"
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się utworzyć PNG. Odśwież Studio i spróbuj ponownie.",
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
      const imageSource =
        await prepareImageForExport();

      const fileName =
        getSlideFileName(
          product,
          type
        );

      const dataUrl =
        await renderSlideToPng(
          type,
          imageSource
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

      await downloadDataUrl(
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
        "Błąd udostępniania Social Media Studio:",
        error
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się udostępnić pliku. Spróbuj pobrać PNG.",
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
      const imageSource =
        await prepareImageForExport();

      const files:
        File[] = [];

      const rendered:
        Array<{
          dataUrl:
            string;

          fileName:
            string;
        }> = [];

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
            type,
            imageSource
          );

        const fileName =
          getSlideFileName(
            product,
            type
          );

        rendered.push({
          dataUrl,
          fileName,
        });

        files.push(
          await dataUrlToFile(
            dataUrl,
            fileName
          )
        );
      }

      if (
        typeof navigator.share ===
          "function" &&
        (
          !navigator.canShare ||
          navigator.canShare({
            files,
          })
        )
      ) {
        try {
          await navigator.share({
            files,

            title:
              "Trend za Mniej — 3 slajdy",
          });

          setExportState({
            active:
              false,

            message:
              "✓ Zestaw 3 slajdów gotowy",

            error:
              null,
          });

          return;
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
        }
      }

      for (
        const item
        of rendered
      ) {
        await downloadDataUrl(
          item.dataUrl,
          item.fileName
        );

        await new Promise<void>(
          (
            resolve
          ) =>
            window.setTimeout(
              resolve,
              180
            )
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
        "Błąd eksportu zestawu Social Media Studio:",
        error
      );

      setExportState({
        active:
          false,

        message:
          "",

        error:
          "Nie udało się przygotować całego zestawu.",
      });
    }
  }

  const previewSlide =
    (
      <SocialSlide
        product={
          displayProduct
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
      <div className="mx-auto max-w-[1480px] px-3 pb-28 pt-4 sm:px-5 sm:pb-14 sm:pt-6">
        <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-stone-950 text-base font-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.14)]">
                T
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-black tracking-[-0.04em] text-stone-950 sm:text-[22px]">
                    Social Media Studio
                  </h1>

                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-stone-500">
                    Studio 9:16
                  </span>
                </div>

                <p className="mt-1 max-w-[620px] truncate text-[11px] font-semibold text-stone-400 sm:text-xs">
                  {
                    product.shortName
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusChip>
                9:16
              </StatusChip>

              <StatusChip>
                1080 × 1920
              </StatusChip>

              <StatusChip
                success={
                  imageStatus ===
                  "ready"
                }
              >
                {imageStatus ===
                "loading"
                  ? "Zdjęcie…"
                  : imageStatus ===
                      "ready"
                    ? "Zdjęcie gotowe"
                    : imageStatus ===
                        "fallback"
                      ? "Tryb zgodności"
                      : imageStatus ===
                          "error"
                        ? "Sprawdź zdjęcie"
                        : "Zdjęcie"}
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
                className="inline-flex min-h-9 items-center justify-center rounded-[12px] border border-black/[0.07] bg-white px-3 text-[10px] font-black text-stone-500 transition hover:bg-stone-50"
              >
                Reset
              </button>

              <Link
                href="/admin"
                className="inline-flex min-h-9 items-center justify-center rounded-[12px] bg-stone-950 px-3.5 text-[10px] font-black text-white transition hover:bg-black"
              >
                Wróć do ofert
              </Link>
            </div>
          </div>

          <div className="border-t border-black/[0.05] bg-[#fafafa] px-4 py-2.5 sm:px-5">
            <p className="text-[9px] font-bold leading-4 text-stone-400">
              Czyste slajdy 9:16 · PNG 1080 × 1920 · bez technicznych napisów w gotowej grafice
            </p>
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)] xl:items-start">
          <aside className="order-2 space-y-3 xl:order-1">
            <ControlGroup
              title="Slajd"
              subtitle="Wybierz część publikacji"
            >
              <SegmentedControl
                value={
                  slideType
                }
                options={
                  EXPORT_ORDER.map(
                    (
                      type
                    ) => ({
                      value:
                        type,

                      label:
                        SLIDE_LABELS[
                          type
                        ],
                    })
                  )
                }
                onChange={(
                  value
                ) =>
                  setSlideType(
                    value as
                      SlideType
                  )
                }
              />

              <p className="mt-2.5 px-1 text-[10px] leading-4 text-stone-400">
                {
                  SLIDE_DESCRIPTIONS[
                    slideType
                  ]
                }
              </p>
            </ControlGroup>

            <ControlGroup
              title="Styl"
              subtitle="Jeden spójny motyw dla wszystkich slajdów"
            >
              <div className="grid grid-cols-3 gap-2">
                <StyleButton
                  active={
                    template ===
                    "minimal"
                  }
                  title="Clean"
                  subtitle="jasny"
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
                  title="Editorial"
                  subtitle="ciepły"
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
                  title="Night"
                  subtitle="kontrast"
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
              title={`Tekst · ${currentSlideLabel}`}
              subtitle="Krótko, konkretnie i czytelnie na telefonie"
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
                className="w-full resize-none rounded-[16px] border border-black/[0.07] bg-[#f5f5f7] px-3.5 py-3 text-sm font-bold leading-5 text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-stone-300 focus:bg-white focus:ring-4 focus:ring-stone-100"
              />

              <div className="mt-2 flex items-center justify-between px-1">
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

            {(slideType ===
              "product" ||
              slideType ===
                "cover") && (
              <ControlGroup
                title="Zdjęcie produktu"
                subtitle="Kadrowanie zoptymalizowane pod pionowy format"
              >
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

                <div className="mt-3 rounded-[15px] border border-black/[0.05] bg-[#f7f7f9] px-3.5 py-3">
                  <p className="text-[10px] font-black text-stone-700">
                    {imageFit ===
                    "contain"
                      ? "Bez obcinania produktu"
                      : "Mocniejszy kadr"}
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-stone-400">
                    {imageFit ===
                    "contain"
                      ? "Zdjęcie zachowuje pełny produkt i dostaje eleganckie tło zamiast pustych pasów."
                      : "Obraz wypełnia całą kartę. Najlepiej działa na zdjęciach z produktem blisko środka."}
                  </p>
                </div>
              </ControlGroup>
            )}

            {slideType ===
              "product" && (
              <ControlGroup
                title="Informacje produktu"
                subtitle="Kontroluj ilość informacji na slajdzie"
              >
                <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                  <SwitchRow
                    label="Cena"
                    description="Pokaż aktualną cenę"
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
                    label="Stara cena i rabat"
                    description={
                      product.oldPrice ===
                      null
                        ? "Produkt nie ma zapisanej starej ceny"
                        : "Pokaż starą cenę oraz procent obniżki"
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
                    description="Pokaż kategorię nad nazwą produktu"
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
                    description="Pokaż oznaczenie źródła przy zdjęciu"
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
              </ControlGroup>
            )}

            {slideType ===
              "cover" && (
              <ControlGroup
                title="Okładka"
                subtitle="Dodatkowe informacje na pierwszym slajdzie"
              >
                <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                  <SwitchRow
                    label="Źródło SHEIN"
                    description="Pokaż źródło produktu na zdjęciu"
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
              </ControlGroup>
            )}

            <ControlGroup
              title="Bezpieczne marginesy"
              subtitle="Pomocniczy podgląd elementów interfejsu aplikacji"
            >
              <div className="overflow-hidden rounded-[17px] border border-black/[0.06] bg-white">
                <SwitchRow
                  label="Pokaż marginesy"
                  description="Wyświetla tylko w podglądzie obszary, których lepiej nie zasłaniać treścią"
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

              <div className="mt-3 rounded-[15px] bg-amber-50 px-3.5 py-3">
                <p className="text-[10px] font-black text-amber-900">
                  Materiał reklamowy
                </p>

                <p className="mt-1 text-[9px] leading-4 text-amber-700/70">
                  Każdy slajd ma widoczne oznaczenie „Materiał reklamowy · SHEIN”.
                </p>
              </div>
            </ControlGroup>

            <ControlGroup
              title="Eksport"
              subtitle="PNG 1080 × 1920"
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
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-50"
              >
                <DownloadIcon />

                {exportState.active
                  ? "Przygotowuję…"
                  : "Pobierz aktualny slajd"}
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
                  className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-black/[0.07] bg-white px-3 text-[11px] font-black text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
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
                  className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-black/[0.07] bg-white px-3 text-[11px] font-black text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                >
                  <StackIcon />

                  Całe 3 slajdy
                </button>
              </div>

              {exportState.message && (
                <p className="mt-3 rounded-[13px] bg-emerald-50 px-3 py-2.5 text-center text-[10px] font-black text-emerald-700">
                  {
                    exportState.message
                  }
                </p>
              )}

              {exportState.error && (
                <p className="mt-3 rounded-[13px] bg-red-50 px-3 py-2.5 text-center text-[10px] font-bold leading-4 text-red-700">
                  {
                    exportState.error
                  }
                </p>
              )}
            </ControlGroup>
          </aside>

          <section className="order-1 xl:order-2 xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-[#e9e9ed] shadow-[0_20px_70px_rgba(15,23,42,0.10)]">
              <div className="flex flex-col gap-3 border-b border-black/[0.05] bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400">
                    Podgląd publikacji
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-black text-stone-900">
                      {
                        currentSlideLabel
                      }
                    </p>

                    <span className="h-1 w-1 rounded-full bg-stone-300" />

                    <p className="text-[10px] font-semibold text-stone-400">
                      {
                        SLIDE_DESCRIPTIONS[
                          slideType
                        ]
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <span className="rounded-full border border-black/[0.05] bg-white px-2.5 py-1.5 text-[9px] font-black text-stone-500 shadow-sm">
                    1080 × 1920
                  </span>

                  <span className="rounded-full bg-stone-950 px-2.5 py-1.5 text-[9px] font-black text-white">
                    9:16
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-5 lg:p-7">
                <div className="flex justify-center">
                  <div className="w-full max-w-[390px]">
                    <div className="rounded-[42px] bg-[#151517] p-[5px] shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
                      <div className="overflow-hidden rounded-[37px] bg-white">
                        {
                          previewSlide
                        }
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
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
                                "rounded-[15px] border px-2 py-2.5 text-center transition",

                                active
                                  ? "border-stone-950 bg-stone-950 text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                                  : "border-white bg-white/85 text-stone-500 hover:bg-white",
                              ].join(
                                " "
                              )}
                            >
                              <span className="block text-[8px] font-black opacity-45">
                                0
                                {
                                  index +
                                  1
                                }
                              </span>

                              <span className="mt-0.5 block text-[10px] font-black">
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
                  displayProduct
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
        theme.page,
      ].join(
        " "
      )}
    >
      <SlideBackground
        template={
          template
        }
      />

      <div className="relative z-10 h-full px-[5.2cqw] pb-[6.2cqw] pt-[5cqw]">
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

function ProductImageStage({
  product,
  imageFit,
  template,
  featured,
  showSheinSource,
  discountPercent,
  compact = false,
}: {
  product:
    SocialProduct;

  imageFit:
    ImageFit;

  template:
    TemplateType;

  featured:
    boolean;

  showSheinSource:
    boolean;

  discountPercent:
    number | null;

  compact?:
    boolean;
}) {
  const theme =
    getSlideTheme(
      template
    );

  return (
    <div
      className={[
        "relative h-full w-full overflow-hidden",

        compact
          ? "rounded-[4.4cqw]"
          : "rounded-[4.8cqw]",

        theme.imageSurface,
      ].join(
        " "
      )}
    >
      {imageFit ===
        "contain" && (
        <div className="absolute inset-0">
          <div
            className={[
              "absolute inset-0",

              template ===
              "deal"
                ? "bg-gradient-to-br from-[#29292f] via-[#18181b] to-[#101012]"
                : template ===
                    "fashion"
                  ? "bg-gradient-to-br from-[#fffaf7] via-[#f4e9e3] to-[#eadbd3]"
                  : "bg-gradient-to-br from-white via-[#f6f6f8] to-[#e9e9ee]",
            ].join(
              " "
            )}
          />

          <div className="absolute inset-[8%] rounded-[4cqw] border border-white/35 bg-white/10" />
        </div>
      )}

      <img
        data-social-product-image="true"
        src={
          product.imageUrl
        }
        alt={
          product.name
        }
        loading="eager"
        decoding="async"
        draggable={
          false
        }
        fetchPriority="high"
        className={[
          "relative z-[1] block h-full w-full select-none",

          imageFit ===
          "cover"
            ? "object-cover object-center"
            : compact
              ? "object-contain p-[3.4cqw]"
              : "object-contain p-[4.2cqw]",
        ].join(
          " "
        )}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[30%] bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="absolute left-[2.5cqw] top-[2.5cqw] z-[3] flex max-w-[78%] flex-wrap gap-[1.1cqw]">
        {featured && (
          <span className="rounded-full border border-white/55 bg-white px-[2.35cqw] py-[1cqw] text-[1.65cqw] font-black text-stone-900 shadow-[0_1cqw_3cqw_rgba(0,0,0,0.10)]">
            🔥 Wybrane
          </span>
        )}

        {discountPercent !==
          null && (
          <span className="rounded-full bg-[#ff375f] px-[2.35cqw] py-[1cqw] text-[1.65cqw] font-black text-white shadow-[0_1cqw_3cqw_rgba(0,0,0,0.10)]">
            -
            {
              discountPercent
            }
            %
          </span>
        )}
      </div>

      {showSheinSource && (
        <div className="absolute bottom-[2.5cqw] left-[2.5cqw] z-[3]">
          <span className="inline-flex items-center gap-[1cqw] rounded-full bg-black/72 px-[2.5cqw] py-[1.1cqw] text-[1.65cqw] font-black text-white">
            <span className="h-[0.9cqw] w-[0.9cqw] rounded-full bg-[#ff6b81]" />

            Znalezisko z SHEIN
          </span>
        </div>
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

  const discountPercent =
    showOldPrice
      ? getDiscountPercent(
          product.price,
          product.oldPrice
        )
      : null;

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
          "mt-[3.2cqw] h-[86cqw] rounded-[6.2cqw] border p-[1.7cqw] shadow-[0_4cqw_13cqw_rgba(0,0,0,0.10)]",

          theme.panelStrong,
          theme.border,
        ].join(
          " "
        )}
      >
        <ProductImageStage
          product={
            product
          }
          imageFit={
            imageFit
          }
          template={
            template
          }
          featured={
            product.featured
          }
          showSheinSource={
            showSheinSource
          }
          discountPercent={
            discountPercent
          }
        />
      </div>

      <div
        className={[
          "mt-[3cqw] rounded-[5cqw] border px-[4.1cqw] py-[3.5cqw] shadow-[0_2cqw_7cqw_rgba(0,0,0,0.055)]",

          theme.panel,
          theme.border,
        ].join(
          " "
        )}
      >
        {showCategory && (
          <div className="flex items-center gap-[1.35cqw]">
            <span className="h-[1cqw] w-[1cqw] rounded-full bg-[#ff375f]" />

            <p
              className={[
                "max-w-[62cqw] truncate text-[1.8cqw] font-black uppercase tracking-[0.12em]",

                theme.accent,
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

        <div className="mt-[1.65cqw] flex items-start gap-[3.2cqw]">
          <div className="min-w-0 flex-1">
            <h2
              className={[
                "line-clamp-2 text-[5.35cqw] font-black leading-[0.98] tracking-[-0.055em]",

                theme.text,
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
                "mt-[1.55cqw] text-[1.55cqw] font-semibold leading-[1.35]",

                theme.muted,
              ].join(
                " "
              )}
            >
              Cena i dostępność mogą zmienić się po przejściu do SHEIN.
            </p>
          </div>

          {showPrice && (
            <div className="shrink-0 text-right">
              <p
                className={[
                  "whitespace-nowrap text-[4.9cqw] font-black tracking-[-0.055em]",

                  theme.text,
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
                  <div className="mt-[0.45cqw] flex items-center justify-end gap-[0.9cqw]">
                    <p className="text-[1.9cqw] font-bold text-stone-400 line-through">
                      {formatPrice(
                        product.oldPrice
                      )}
                    </p>

                    {discountPercent !==
                      null && (
                      <span className="rounded-full bg-[#ff375f]/10 px-[1.2cqw] py-[0.45cqw] text-[1.35cqw] font-black text-[#ff375f]">
                        -
                        {
                          discountPercent
                        }
                        %
                      </span>
                    )}
                  </div>
                )}

              <p
                className={[
                  "mt-[0.6cqw] text-[1.35cqw] font-semibold",

                  theme.muted,
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

      <div className="mt-auto pt-[2.7cqw]">
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

  const discountPercent =
    getDiscountPercent(
      product.price,
      product.oldPrice
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

      <div className="mt-[3cqw]">
        <p
          className={[
            "text-[1.8cqw] font-black uppercase tracking-[0.15em]",

            theme.accent,
          ].join(
            " "
          )}
        >
          Dzisiejsze znalezisko
        </p>

        <h2
          className={[
            "mt-[1.5cqw] max-w-[84cqw] text-[7.1cqw] font-black leading-[0.93] tracking-[-0.062em]",

            theme.text,
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
            "mt-[2cqw] max-w-[73cqw] text-[1.9cqw] font-semibold leading-[1.45]",

            theme.muted,
          ].join(
            " "
          )}
        >
          Produkt, który zwrócił naszą uwagę — zobacz cenę i szczegóły na kolejnym slajdzie.
        </p>
      </div>

      <div
        className={[
          "relative mt-[3.5cqw] h-[91cqw] rounded-[6.3cqw] border p-[1.7cqw] shadow-[0_5cqw_16cqw_rgba(0,0,0,0.12)]",

          theme.panelStrong,
          theme.border,
        ].join(
          " "
        )}
      >
        <ProductImageStage
          product={
            product
          }
          imageFit={
            imageFit
          }
          template={
            template
          }
          featured={
            product.featured
          }
          showSheinSource={
            false
          }
          discountPercent={
            discountPercent
          }
          compact
        />

        <div className="absolute inset-x-[4.2cqw] bottom-[4.2cqw] z-[5] flex items-end justify-between gap-[2cqw]">
          {showSheinSource && (
            <span className="inline-flex items-center gap-[0.8cqw] rounded-full bg-black/[0.72] px-[2.2cqw] py-[0.95cqw] text-[1.45cqw] font-black text-white">
              <span className="h-[0.8cqw] w-[0.8cqw] rounded-full bg-[#ff6b81]" />

              SHEIN
            </span>
          )}

          <p className="ml-auto rounded-full bg-white px-[2.6cqw] py-[1.15cqw] text-[1.65cqw] font-black text-stone-950 shadow-[0_1cqw_4cqw_rgba(0,0,0,0.14)]">
            Cena i szczegóły →
          </p>
        </div>
      </div>

      <div className="mt-auto pt-[2.8cqw]">
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
            "w-full rounded-[7cqw] border px-[6cqw] py-[7.5cqw] text-center shadow-[0_5cqw_16cqw_rgba(0,0,0,0.08)]",

            theme.panel,
            theme.border,
          ].join(
            " "
          )}
        >
          <div
            className={[
              "mx-auto flex h-[14cqw] w-[14cqw] items-center justify-center rounded-[4.4cqw] text-[5cqw] font-black shadow-[0_2cqw_6cqw_rgba(0,0,0,0.10)]",

              theme.logo,
            ].join(
              " "
            )}
          >
            T
          </div>

          <p
            className={[
              "mt-[4cqw] text-[1.8cqw] font-black uppercase tracking-[0.17em]",

              theme.accent,
            ].join(
              " "
            )}
          >
            Trend za Mniej
          </p>

          <h2
            className={[
              "mx-auto mt-[2.5cqw] max-w-[78cqw] text-[6.9cqw] font-black leading-[0.95] tracking-[-0.06em]",

              theme.text,
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
              "mx-auto mt-[3cqw] max-w-[66cqw] text-[1.95cqw] font-semibold leading-[1.5]",

              theme.muted,
            ].join(
              " "
            )}
          >
            Selekcjonujemy modowe produkty i okazje, żeby szybciej znaleźć rzeczy warte uwagi.
          </p>

          <div
            className={[
              "mx-auto mt-[5cqw] flex min-h-[10.5cqw] max-w-[64cqw] items-center justify-between rounded-full pl-[4cqw] pr-[1.4cqw] shadow-[0_2cqw_7cqw_rgba(0,0,0,0.08)]",

              theme.cta,
            ].join(
              " "
            )}
          >
            <span className="text-[2.25cqw] font-black">
              Zobacz więcej
            </span>

            <span className="flex h-[7.7cqw] w-[7.7cqw] items-center justify-center rounded-full bg-white/15 text-[3.4cqw] font-black">
              →
            </span>
          </div>

          <p
            className={[
              "mt-[4.2cqw] text-[3cqw] font-black tracking-[-0.035em]",

              theme.text,
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
        "flex min-h-[10cqw] items-center justify-between rounded-[4cqw] border px-[3cqw] shadow-[0_1.5cqw_5cqw_rgba(0,0,0,0.045)]",

        theme.panel,
        theme.border,
      ].join(
        " "
      )}
    >
      <div className="flex min-w-0 items-center gap-[2cqw]">
        <div
          className={[
            "flex h-[6.6cqw] w-[6.6cqw] shrink-0 items-center justify-center rounded-[2cqw] text-[2.45cqw] font-black",

            theme.logo,
          ].join(
            " "
          )}
        >
          T
        </div>

        <p
          className={[
            "truncate text-[2.35cqw] font-black tracking-[-0.03em]",

            theme.text,
          ].join(
            " "
          )}
        >
          Trend za Mniej
        </p>
      </div>

      <span
        className={[
          "text-[1.55cqw] font-black",

          theme.muted,
        ].join(
          " "
        )}
      >
        trendzamniej.pl
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
        "inline-flex items-center gap-[0.9cqw] rounded-full border px-[2.15cqw] py-[0.9cqw] text-[1.42cqw] font-black uppercase tracking-[0.075em]",

        theme.panel,
        theme.border,
        theme.text,
      ].join(
        " "
      )}
    >
      <span className="h-[0.85cqw] w-[0.85cqw] rounded-full bg-[#ff375f]" />

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
        "flex min-h-[10cqw] items-center justify-between rounded-[4cqw] border px-[3.4cqw] shadow-[0_1.5cqw_5cqw_rgba(0,0,0,0.04)]",

        theme.panel,
        theme.border,
      ].join(
        " "
      )}
    >
      <div className="min-w-0">
        <p
          className={[
            "text-[1.35cqw] font-semibold",

            theme.muted,
          ].join(
            " "
          )}
        >
          Więcej wybranych okazji
        </p>

        <p
          className={[
            "mt-[0.2cqw] text-[2.35cqw] font-black tracking-[-0.03em]",

            theme.text,
          ].join(
            " "
          )}
        >
          trendzamniej.pl
        </p>
      </div>

      <div className="flex items-center gap-[1.3cqw]">
        <span
          className={[
            "rounded-full px-[2cqw] py-[0.85cqw] text-[1.4cqw] font-black",

            theme.pill,
          ].join(
            " "
          )}
        >
          Sprawdź
        </span>

        <span
          className={[
            "flex h-[6.8cqw] w-[6.8cqw] items-center justify-center rounded-full text-[2.9cqw] font-black",

            theme.cta,
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
  template,
}: {
  template:
    TemplateType;
}) {
  if (
    template ===
    "deal"
  ) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1f23] via-[#121214] to-[#09090a]" />

        <div className="absolute -left-[18cqw] top-[21cqh] h-[65cqw] w-[65cqw] rounded-full bg-[#ff375f]/[0.08] blur-[36px]" />

        <div className="absolute -right-[24cqw] bottom-[8cqh] h-[70cqw] w-[70cqw] rounded-full bg-white/[0.035] blur-[40px]" />
      </>
    );
  }

  if (
    template ===
    "fashion"
  ) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fcf8f5] via-[#f5ebe5] to-[#eadbd3]" />

        <div className="absolute -left-[18cqw] top-[21cqh] h-[68cqw] w-[68cqw] rounded-full bg-[#d8bfb4]/45 blur-[40px]" />

        <div className="absolute -right-[18cqw] bottom-[6cqh] h-[60cqw] w-[60cqw] rounded-full bg-white/60 blur-[40px]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfc] via-[#f3f3f6] to-[#e8e8ed]" />

      <div className="absolute -right-[18cqw] top-[15cqh] h-[68cqw] w-[68cqw] rounded-full bg-white/80 blur-[38px]" />

      <div className="absolute -left-[18cqw] bottom-[7cqh] h-[55cqw] w-[55cqw] rounded-full bg-[#dcdce4]/50 blur-[38px]" />
    </>
  );
}

function SafeAreaOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 [container-type:size]">
      <div className="absolute bottom-[18cqh] left-[4cqw] right-[15cqw] top-[7cqh] rounded-[4cqw] border border-dashed border-[#ff375f]/55" />

      <div className="absolute bottom-0 left-0 right-0 h-[17cqh] bg-[#ff375f]/[0.035]" />

      <div className="absolute bottom-[17cqh] right-0 top-[14cqh] w-[14cqw] bg-[#ff375f]/[0.035]" />
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
      page:
        "bg-[#111113]",

      panel:
        "bg-[#1f1f23]",

      panelStrong:
        "bg-[#25252a]",

      border:
        "border-white/[0.10]",

      text:
        "text-white",

      muted:
        "text-white/50",

      accent:
        "text-[#ff9bad]",

      pill:
        "bg-white/[0.08] text-white/72",

      logo:
        "bg-white text-stone-950",

      cta:
        "bg-white text-stone-950",

      imageSurface:
        "bg-[#171719]",

      exportBackground:
        "#111113",
    };
  }

  if (
    template ===
    "fashion"
  ) {
    return {
      page:
        "bg-[#f5ebe5]",

      panel:
        "bg-[#fffaf7]",

      panelStrong:
        "bg-[#fff7f2]",

      border:
        "border-[#d9c7be]/55",

      text:
        "text-[#2d2421]",

      muted:
        "text-[#8e7b73]",

      accent:
        "text-[#a45d50]",

      pill:
        "bg-[#eadad2] text-[#835147]",

      logo:
        "bg-[#2d2421] text-white",

      cta:
        "bg-[#2d2421] text-white",

      imageSurface:
        "bg-[#fffdfb]",

      exportBackground:
        "#f5ebe5",
    };
  }

  return {
    page:
      "bg-[#f2f2f5]",

    panel:
      "bg-white",

    panelStrong:
      "bg-[#fafafa]",

    border:
      "border-black/[0.07]",

    text:
      "text-[#1c1c1e]",

    muted:
      "text-[#8e8e93]",

    accent:
      "text-[#5f5f64]",

    pill:
      "bg-[#e9e9ee] text-[#5f5f64]",

    logo:
      "bg-[#1c1c1e] text-white",

    cta:
      "bg-[#1c1c1e] text-white",

    imageSurface:
      "bg-white",

    exportBackground:
      "#f2f2f5",
  };
}

function ControlGroup({
  title,
  subtitle,
  children,
}: {
  title:
    string;

  subtitle?:
    string;

  children:
    ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-black/[0.055] bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="px-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-500">
          {
            title
          }
        </h2>

        {subtitle && (
          <p className="mt-1 text-[9px] leading-4 text-stone-400">
            {
              subtitle
            }
          </p>
        )}
      </div>

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
      className="grid gap-1 rounded-[14px] bg-[#e9e9ee] p-1"
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
                "min-h-9 rounded-[11px] px-2 text-[10px] font-black transition",

                active
                  ? "bg-white text-stone-950 shadow-[0_1px_5px_rgba(0,0,0,0.13)]"
                  : "text-stone-500 hover:text-stone-700",
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
      ? "bg-gradient-to-br from-white via-[#f4f4f6] to-[#dedee4]"
      : preview ===
          "warm"
        ? "bg-gradient-to-br from-[#fffaf7] via-[#f0e1d9] to-[#d9c0b5]"
        : "bg-gradient-to-br from-[#35353a] via-[#1b1b1e] to-[#09090a]";

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "rounded-[16px] border p-2 text-left transition",

        active
          ? "border-stone-950 bg-stone-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          : "border-black/[0.06] bg-[#f7f7f9] text-stone-700 hover:bg-[#f2f2f5]",
      ].join(
        " "
      )}
    >
      <span
        className={[
          "relative block h-10 overflow-hidden rounded-[10px]",
          previewClass,
        ].join(
          " "
        )}
      >
        <span className="absolute left-2 top-2 h-2 w-5 rounded-full bg-white/70" />

        <span className="absolute bottom-2 left-2 h-3 w-3 rounded-[4px] bg-white/80" />

        <span className="absolute bottom-2 left-6 right-2 h-1.5 rounded-full bg-white/55" />
      </span>

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
        "flex min-h-[60px] w-full items-center gap-3 px-3 text-left transition",

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
          "flex h-[28px] w-[47px] shrink-0 items-center rounded-full p-[2px] transition",

          active &&
          !disabled
            ? "justify-end bg-[#34c759]"
            : "justify-start bg-[#d1d1d6]",
        ].join(
          " "
        )}
      >
        <span className="h-[24px] w-[24px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.22)]" />
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