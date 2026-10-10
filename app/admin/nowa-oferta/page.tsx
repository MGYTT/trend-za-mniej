"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import AdminFormShell from "@/components/admin/AdminFormShell";
import AdminHeader from "@/components/admin/AdminHeader";
import OfferQualityChecks from "@/components/admin/OfferQualityChecks";
import ProductCategorySelect from "@/components/admin/ProductCategorySelect";
import ProductPreview from "@/components/admin/ProductPreview";
import PublishConfirmation from "@/components/admin/PublishConfirmation";
import QuickStartAssistant from "@/components/admin/QuickStartAssistant";

import {
  buildSuggestedDescription,
  getOfferAssistantFields,
  getRequiredAssistantCompletion,
} from "@/lib/offer-assistant";

import {
  enhanceParsedOfferCategory,
} from "@/lib/enhance-parsed-category";

import {
  parseOfferText,
  type ParsedOffer,
} from "@/lib/offer-parser";

import {
  createDuplicateCandidate,
  createEmptyProductDuplicateCheck,
  extractSheinProductIdentity,
  findSimilarProducts,
  type ComparableProduct,
  type ProductDuplicateCheck,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

import {
  isProductCategory,
} from "@/lib/product-categories";

import {
  resolveSheinProductIdentityForAdmin,
} from "@/lib/resolve-shein-product-client";

import {
  createClient,
} from "@/lib/supabase/client";

const MAX_FILE_SIZE =
  5 *
  1024 *
  1024;

const DRAFT_KEY =
  "trend-za-mniej:new-offer-draft:v3";

const LEGACY_DRAFT_KEY =
  "trend-za-mniej:new-offer-draft:v2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DUPLICATE_SELECT =
  "id, slug, name, short_name, category, image_url, affiliate_url, shein_product_key, price, active";

type FormState = {
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice: string;
  category: string;
  affiliateUrl: string;
  soldText: string;
  featured: boolean;
};

type ValidatedProduct = {
  name: string;
  shortName: string;
  description: string;
  price: number;
  oldPrice:
    | number
    | null;
  category: string;
  affiliateUrl: string;
  soldText: string;
  featured: boolean;
};

type SavedDraft = {
  form: FormState;
  rawOffer: string;
  updatedAt: string;
};

type DuplicateProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  category: string;
  image_url: string;
  affiliate_url: string;

  shein_product_key:
    | string
    | null;

  price:
    | number
    | string;

  active: boolean;
};

type DuplicateCheckInput = {
  sourceText: string;
  affiliateUrl: string;
  name: string;
  shortName: string;
  category: string;
};

type ParsedFormField =
  | "name"
  | "shortName"
  | "price"
  | "oldPrice"
  | "category"
  | "affiliateUrl"
  | "soldText";

const INITIAL_FORM:
  FormState = {
  name:
    "",

  shortName:
    "",

  description:
    "",

  price:
    "",

  oldPrice:
    "",

  category:
    "",

  affiliateUrl:
    "",

  soldText:
    "",

  featured:
    true,
};

function hasDraftContent(
  form: FormState,
  rawOffer: string
) {
  return Boolean(
    rawOffer.trim() ||
      form.name.trim() ||
      form.shortName.trim() ||
      form.description.trim() ||
      form.price.trim() ||
      form.oldPrice.trim() ||
      form.category.trim() ||
      form.affiliateUrl.trim() ||
      form.soldText.trim()
  );
}

function toComparableProduct(
  row:
    DuplicateProductRow
): ComparableProduct {
  return {
    id:
      row.id,

    slug:
      row.slug,

    name:
      row.name,

    shortName:
      row.short_name,

    category:
      row.category,

    imageUrl:
      row.image_url,

    affiliateUrl:
      row.affiliate_url,

    sheinProductKey:
      row.shein_product_key,

    price:
      row.price,

    active:
      row.active,
  };
}

export default function NewProductPage() {
  const router =
    useRouter();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );

  const [
    checking,
    setChecking,
  ] =
    useState(
      false
    );

  const [
    clipboardLoading,
    setClipboardLoading,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    successSlug,
    setSuccessSlug,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    rawOffer,
    setRawOffer,
  ] =
    useState(
      ""
    );

  const [
    analysis,
    setAnalysis,
  ] =
    useState<
      ParsedOffer |
      null
    >(
      null
    );

  const [
    parserMessage,
    setParserMessage,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    parserWarnings,
    setParserWarnings,
  ] =
    useState<
      string[]
    >(
      []
    );

  const [
    parserConfidence,
    setParserConfidence,
  ] =
    useState<
      | "high"
      | "medium"
      | "low"
      | null
    >(
      null
    );

  const [
    duplicateCheck,
    setDuplicateCheck,
  ] =
    useState<ProductDuplicateCheck>(
      () =>
        createEmptyProductDuplicateCheck()
    );

  const [
    confirmOpen,
    setConfirmOpen,
  ] =
    useState(
      false
    );

  const [
    mobilePreviewOpen,
    setMobilePreviewOpen,
  ] =
    useState(
      false
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [
    imageFile,
    setImageFile,
  ] =
    useState<
      File |
      null
    >(
      null
    );

  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    draftReady,
    setDraftReady,
  ] =
    useState(
      false
    );

  const [
    draftRestored,
    setDraftRestored,
  ] =
    useState(
      false
    );

  const [
    draftSavedAt,
    setDraftSavedAt,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  useEffect(
    () => {
      try {
        const saved =
          window.localStorage.getItem(
            DRAFT_KEY
          ) ??
          window.localStorage.getItem(
            LEGACY_DRAFT_KEY
          );

        if (
          !saved
        ) {
          return;
        }

        const draft =
          JSON.parse(
            saved
          ) as
            Partial<SavedDraft>;

        if (
          !draft.form &&
          !draft.rawOffer
        ) {
          return;
        }

        const restoredForm:
          FormState = {
          ...INITIAL_FORM,
          ...(
            draft.form ??
            {}
          ),
        };

        const restoredRawOffer =
          draft.rawOffer ??
          "";

        if (
          hasDraftContent(
            restoredForm,
            restoredRawOffer
          )
        ) {
          setForm(
            restoredForm
          );

          setRawOffer(
            restoredRawOffer
          );

          setDraftSavedAt(
            draft.updatedAt ??
              null
          );

          setDraftRestored(
            true
          );
        }
      } catch (
        draftError
      ) {
        console.error(
          "Nie udało się przywrócić szkicu:",
          draftError
        );

        window.localStorage.removeItem(
          DRAFT_KEY
        );

        window.localStorage.removeItem(
          LEGACY_DRAFT_KEY
        );
      } finally {
        setDraftReady(
          true
        );
      }
    },
    []
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
            if (
              !hasDraftContent(
                form,
                rawOffer
              )
            ) {
              window.localStorage.removeItem(
                DRAFT_KEY
              );

              window.localStorage.removeItem(
                LEGACY_DRAFT_KEY
              );

              setDraftSavedAt(
                null
              );

              return;
            }

            const updatedAt =
              new Date()
                .toISOString();

            const draft:
              SavedDraft = {
              form,
              rawOffer,
              updatedAt,
            };

            try {
              window.localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify(
                  draft
                )
              );

              window.localStorage.removeItem(
                LEGACY_DRAFT_KEY
              );

              setDraftSavedAt(
                updatedAt
              );
            } catch (
              draftError
            ) {
              console.error(
                "Nie udało się zapisać szkicu:",
                draftError
              );
            }
          },
          450
        );

      return () =>
        window.clearTimeout(
          timeout
        );
    },
    [
      draftReady,
      form,
      rawOffer,
    ]
  );

  useEffect(
    () => {
      return () => {
        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      };
    },
    [
      previewUrl,
    ]
  );

  useEffect(
    () => {
      if (
        !mobilePreviewOpen
      ) {
        return;
      }

      const previousOverflow =
        document.body.style
          .overflow;

      document.body.style.overflow =
        "hidden";

      function handleKeyDown(
        event:
          KeyboardEvent
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setMobilePreviewOpen(
            false
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
      mobilePreviewOpen,
    ]
  );

  useEffect(
    () => {
      if (
        !error
      ) {
        return;
      }

      const timeout =
        window.setTimeout(
          () => {
            document
              .getElementById(
                "new-product-error"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "center",
              });
          },
          100
        );

      return () =>
        window.clearTimeout(
          timeout
        );
    },
    [
      error,
    ]
  );

  function slugify(
    value: string
  ) {
    return value
      .toLowerCase()
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /ł/g,
        "l"
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  }

  function parsePrice(
    value: string
  ) {
    const normalized =
      value
        .trim()
        .replace(
          /\s/g,
          ""
        )
        .replace(
          ",",
          "."
        );

    if (
      !normalized
    ) {
      return null;
    }

    const parsed =
      Number(
        normalized
      );

    return Number.isFinite(
      parsed
    )
      ? parsed
      : null;
  }

  function getExtension(
    file: File
  ) {
    if (
      file.type ===
      "image/png"
    ) {
      return "png";
    }

    if (
      file.type ===
      "image/webp"
    ) {
      return "webp";
    }

    return "jpg";
  }

  function isValidHttpsUrl(
    value: string
  ) {
    try {
      return (
        new URL(
          value
        ).protocol ===
        "https:"
      );
    } catch {
      return false;
    }
  }

  function resetDuplicateCheck() {
    setDuplicateCheck(
      createEmptyProductDuplicateCheck()
    );
  }

  function updateField<
    Key extends
      keyof FormState,
  >(
    key: Key,
    value:
      FormState[Key]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [key]:
          value,
      })
    );

    if (
      key ===
        "name" ||
      key ===
        "shortName" ||
      key ===
        "category" ||
      key ===
        "affiliateUrl"
    ) {
      resetDuplicateCheck();
    }

    setError(
      null
    );

    setSuccessSlug(
      null
    );
  }

  async function createUniqueSlug(
    baseSlug: string
  ) {
    let candidate =
      baseSlug;

    let counter =
      2;

    while (
      true
    ) {
      const {
        data,
        error:
          slugError,
      } =
        await supabase
          .from(
            "products"
          )
          .select(
            "id"
          )
          .eq(
            "slug",
            candidate
          )
          .maybeSingle();

      if (
        slugError
      ) {
        throw slugError;
      }

      if (
        !data
      ) {
        return candidate;
      }

      candidate =
        `${baseSlug}-${counter}`;

      counter +=
        1;
    }
  }

  async function resolveIdentitySafely({
    sourceText,
    affiliateUrl,
  }: {
    sourceText: string;
    affiliateUrl: string;
  }) {
    try {
      /*
       * Analizujemy wyłącznie dane
       * podane przez administratora.
       *
       * Nie pobieramy stron SHEIN
       * i nie rozwijamy OneLinków
       * przez request do sklepu.
       */
      return await resolveSheinProductIdentityForAdmin({
        sourceText,
        affiliateUrl,
      });
    } catch (
      resolveError
    ) {
      console.error(
        "Nie udało się ustalić ID produktu SHEIN:",
        resolveError
      );

      return null;
    }
  }

  async function runDuplicateCheck({
    sourceText,
    affiliateUrl,
    name,
    shortName,
    category,
  }: DuplicateCheckInput):
    Promise<ProductDuplicateCheck> {
    const immediateIdentity =
      extractSheinProductIdentity(
        `${affiliateUrl}\n${sourceText}`
      );

    const checkingState:
      ProductDuplicateCheck =
      {
        status:
          "checking",

        identity:
          immediateIdentity,

        exactMatch:
          null,

        similarMatches:
          [],

        blockingReason:
          null,
      };

    setDuplicateCheck(
      checkingState
    );

    const identity =
      await resolveIdentitySafely({
        sourceText,
        affiliateUrl,
      });

    if (
      identity
    ) {
      setDuplicateCheck({
        ...checkingState,
        identity,
      });
    }

    try {
      if (
        identity
      ) {
        const {
          data,
          error:
            identityError,
        } =
          await supabase
            .from(
              "products"
            )
            .select(
              DUPLICATE_SELECT
            )
            .eq(
              "shein_product_key",
              identity.key
            )
            .limit(
              1
            );

        if (
          identityError
        ) {
          throw identityError;
        }

        const row =
          (
            data ??
            []
          )[0] as
            | DuplicateProductRow
            | undefined;

        if (
          row
        ) {
          const result:
            ProductDuplicateCheck =
            {
              status:
                "blocked",

              identity,

              exactMatch:
                createDuplicateCandidate(
                  toComparableProduct(
                    row
                  )
                ),

              similarMatches:
                [],

              blockingReason:
                "shein-key",
            };

          setDuplicateCheck(
            result
          );

          return result;
        }
      }

      const cleanAffiliateUrl =
        affiliateUrl.trim();

      if (
        cleanAffiliateUrl &&
        isValidHttpsUrl(
          cleanAffiliateUrl
        )
      ) {
        const {
          data,
          error:
            affiliateError,
        } =
          await supabase
            .from(
              "products"
            )
            .select(
              DUPLICATE_SELECT
            )
            .eq(
              "affiliate_url",
              cleanAffiliateUrl
            )
            .limit(
              1
            );

        if (
          affiliateError
        ) {
          throw affiliateError;
        }

        const row =
          (
            data ??
            []
          )[0] as
            | DuplicateProductRow
            | undefined;

        if (
          row
        ) {
          const result:
            ProductDuplicateCheck =
            {
              status:
                "blocked",

              identity,

              exactMatch:
                createDuplicateCandidate(
                  toComparableProduct(
                    row
                  )
                ),

              similarMatches:
                [],

              blockingReason:
                "affiliate-url",
            };

          setDuplicateCheck(
            result
          );

          return result;
        }
      }

      const {
        data:
          candidatesData,
        error:
          candidatesError,
      } =
        await supabase
          .from(
            "products"
          )
          .select(
            DUPLICATE_SELECT
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(
            300
          );

      if (
        candidatesError
      ) {
        throw candidatesError;
      }

      const comparable =
        (
          (
            candidatesData ??
            []
          ) as
            DuplicateProductRow[]
        ).map(
          toComparableProduct
        );

      if (
        identity
      ) {
        const historicalMatch =
          comparable.find(
            (
              product
            ) => {
              if (
                product.sheinProductKey ===
                identity.key
              ) {
                return true;
              }

              const derived =
                extractSheinProductIdentity(
                  product.affiliateUrl
                );

              return (
                derived?.key ===
                identity.key
              );
            }
          );

        if (
          historicalMatch
        ) {
          const result:
            ProductDuplicateCheck =
            {
              status:
                "blocked",

              identity,

              exactMatch:
                createDuplicateCandidate(
                  historicalMatch
                ),

              similarMatches:
                [],

              blockingReason:
                "shein-key",
            };

          setDuplicateCheck(
            result
          );

          return result;
        }
      }

      const similarMatches =
        findSimilarProducts({
          name,
          shortName,
          category,
          products:
            comparable,
          limit:
            3,
        });

      const result:
        ProductDuplicateCheck =
        {
          status:
            similarMatches.length >
            0
              ? "warning"
              : "clear",

          identity,

          exactMatch:
            null,

          similarMatches,

          blockingReason:
            null,
        };

      setDuplicateCheck(
        result
      );

      return result;
    } catch (
      duplicateError
    ) {
      console.error(
        "Błąd kontroli duplikatów:",
        duplicateError
      );

      const result:
        ProductDuplicateCheck =
        {
          status:
            "error",

          identity,

          exactMatch:
            null,

          similarMatches:
            [],

          blockingReason:
            null,
        };

      setDuplicateCheck(
        result
      );

      return result;
    }
  }

  function shouldReplaceParsedValue(
    currentValue: string,
    previousParsedValue: string
  ) {
    const current =
      currentValue.trim();

    const previous =
      previousParsedValue.trim();

    return (
      !current ||
      Boolean(
        previous &&
        current ===
          previous
      )
    );
  }

  async function analyzeOffer(
    sourceText: string
  ) {
    const cleanText =
      sourceText.trim();

    setError(
      null
    );

    setParserMessage(
      null
    );

    setParserWarnings(
      []
    );

    setParserConfidence(
      null
    );

    if (
      !cleanText
    ) {
      setParserMessage(
        "Najpierw wklej treść oferty SHEIN."
      );

      return;
    }

    /*
     * Najpierw działa Szybki start 2.0,
     * następnie dokładniejszy system
     * kategorii.
     */
    const parsed =
      enhanceParsedOfferCategory(
        parseOfferText(
          cleanText
        ),
        cleanText
      );

    const previous =
      analysis;

    const previousDescription =
      previous
        ? buildSuggestedDescription(
            previous
          )
        : "";

    const suggestedDescription =
      buildSuggestedDescription(
        parsed
      );

    const nextForm = {
      ...form,
    };

    function applyParsed(
      key:
        ParsedFormField,
      newValue: string,
      previousValue: string
    ) {
      const currentValue =
        nextForm[key];

      const parserOwned =
        shouldReplaceParsedValue(
          currentValue,
          previousValue
        );

      if (
        newValue &&
        parserOwned
      ) {
        nextForm[key] =
          newValue;

        return;
      }

      if (
        !newValue &&
        previousValue &&
        currentValue.trim() ===
          previousValue.trim()
      ) {
        nextForm[key] =
          "";
      }
    }

    applyParsed(
      "name",
      parsed.name,
      previous?.name ??
        ""
    );

    applyParsed(
      "shortName",
      parsed.shortName,
      previous?.shortName ??
        ""
    );

    applyParsed(
      "price",
      parsed.price,
      previous?.price ??
        ""
    );

    applyParsed(
      "oldPrice",
      parsed.oldPrice,
      previous?.oldPrice ??
        ""
    );

    applyParsed(
      "category",
      parsed.category,
      previous?.category ??
        ""
    );

    applyParsed(
      "affiliateUrl",
      parsed.affiliateUrl,
      previous?.affiliateUrl ??
        ""
    );

    applyParsed(
      "soldText",
      parsed.soldText,
      previous?.soldText ??
        ""
    );

    if (
      suggestedDescription &&
      (
        !nextForm.description.trim() ||
        (
          previousDescription &&
          nextForm.description.trim() ===
            previousDescription.trim()
        )
      )
    ) {
      nextForm.description =
        suggestedDescription;
    }

    setForm(
      nextForm
    );

    setAnalysis(
      parsed
    );

    setParserConfidence(
      parsed.confidence
    );

    setParserWarnings(
      parsed.warnings
    );

    const fields =
      getOfferAssistantFields(
        parsed
      );

    const completion =
      getRequiredAssistantCompletion(
        fields
      );

    if (
      completion.detected ===
        completion.total &&
      completion.review ===
        0
    ) {
      setParserMessage(
        "Kluczowe dane zostały rozpoznane z dobrą pewnością i wpisane do formularza."
      );
    } else if (
      completion.detected ===
      completion.total
    ) {
      setParserMessage(
        `Wszystkie kluczowe dane znaleziono. ${completion.review} ${
          completion.review ===
          1
            ? "element wymaga"
            : "elementy wymagają"
        } szybkiego sprawdzenia.`
      );
    } else {
      setParserMessage(
        `Rozpoznano ${completion.detected} z ${completion.total} kluczowych danych. Brakujące informacje uzupełnij niżej.`
      );
    }

    await runDuplicateCheck({
      sourceText:
        cleanText,

      affiliateUrl:
        nextForm.affiliateUrl,

      name:
        nextForm.name,

      shortName:
        nextForm.shortName,

      category:
        nextForm.category,
    });
  }

  function handleRawOfferChange(
    value: string
  ) {
    setRawOffer(
      value
    );

    setParserMessage(
      null
    );

    setError(
      null
    );

    resetDuplicateCheck();
  }

  async function handlePasteAndAnalyze() {
    setClipboardLoading(
      true
    );

    setError(
      null
    );

    try {
      if (
        !navigator.clipboard
          ?.readText
      ) {
        setParserMessage(
          "Ta przeglądarka nie pozwala automatycznie odczytać schowka. Wklej tekst ręcznie w pole poniżej."
        );

        return;
      }

      const text =
        await navigator.clipboard.readText();

      if (
        !text.trim()
      ) {
        setParserMessage(
          "Schowek jest pusty."
        );

        return;
      }

      setRawOffer(
        text
      );

      await analyzeOffer(
        text
      );
    } catch (
      clipboardError
    ) {
      console.error(
        "Błąd schowka:",
        clipboardError
      );

      setParserMessage(
        "Nie udało się odczytać schowka. Przytrzymaj pole tekstowe i wybierz „Wklej”."
      );
    } finally {
      setClipboardLoading(
        false
      );
    }
  }

  function applySuggestedDescription() {
    if (
      !analysis
    ) {
      return;
    }

    const description =
      buildSuggestedDescription(
        analysis
      );

    if (
      !description
    ) {
      return;
    }

    updateField(
      "description",
      description
    );

    document
      .getElementById(
        "section-basic"
      )
      ?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });
  }

  function handleImageChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    setError(
      null
    );

    setSuccessSlug(
      null
    );

    const file =
      event.target
        .files?.[0] ??
      null;

    if (
      !file
    ) {
      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Dozwolone są tylko pliki JPG, PNG i WebP."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "Zdjęcie może mieć maksymalnie 5 MB."
      );

      event.target.value =
        "";

      return;
    }

    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const localPreview =
      URL.createObjectURL(
        file
      );

    setImageFile(
      file
    );

    setPreviewUrl(
      localPreview
    );
  }

  function removeImage() {
    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(
      null
    );

    setPreviewUrl(
      null
    );

    setError(
      null
    );
  }

  function clearOffer() {
    if (
      hasDraftContent(
        form,
        rawOffer
      ) &&
      !window.confirm(
        "Wyczyścić obecną ofertę i rozpocząć od nowa?"
      )
    ) {
      return;
    }

    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setForm(
      INITIAL_FORM
    );

    setRawOffer(
      ""
    );

    setAnalysis(
      null
    );

    setParserMessage(
      null
    );

    setParserWarnings(
      []
    );

    setParserConfidence(
      null
    );

    resetDuplicateCheck();

    setImageFile(
      null
    );

    setPreviewUrl(
      null
    );

    setError(
      null
    );

    setSuccessSlug(
      null
    );

    setDraftRestored(
      false
    );

    setDraftSavedAt(
      null
    );

    window.localStorage.removeItem(
      DRAFT_KEY
    );

    window.localStorage.removeItem(
      LEGACY_DRAFT_KEY
    );

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  function validateProduct():
    | {
        data:
          ValidatedProduct;
        error: null;
      }
    | {
        data: null;
        error: string;
      } {
    if (
      !imageFile
    ) {
      return {
        data:
          null,

        error:
          "Dodaj zdjęcie produktu.",
      };
    }

    const name =
      form.name.trim();

    const shortName =
      form.shortName.trim();

    const description =
      form.description.trim();

    const category =
      form.category.trim();

    const affiliateUrl =
      form.affiliateUrl.trim();

    const soldText =
      form.soldText.trim();

    const price =
      parsePrice(
        form.price
      );

    const oldPrice =
      form.oldPrice.trim()
        ? parsePrice(
            form.oldPrice
          )
        : null;

    if (
      !name ||
      !shortName
    ) {
      return {
        data:
          null,

        error:
          "Uzupełnij pełną i krótką nazwę produktu.",
      };
    }

    if (
      !description
    ) {
      return {
        data:
          null,

        error:
          "Dodaj opis produktu.",
      };
    }

    if (
      !category ||
      !isProductCategory(
        category
      )
    ) {
      return {
        data:
          null,

        error:
          "Wybierz poprawną kategorię produktu.",
      };
    }

    if (
      price ===
        null ||
      price <=
        0
    ) {
      return {
        data:
          null,

        error:
          "Podaj poprawną cenę większą od 0.",
      };
    }

    if (
      form.oldPrice.trim() &&
      (
        oldPrice ===
          null ||
        oldPrice <=
          0
      )
    ) {
      return {
        data:
          null,

        error:
          "Stara cena jest niepoprawna.",
      };
    }

    if (
      oldPrice !==
        null &&
      oldPrice <=
        price
    ) {
      return {
        data:
          null,

        error:
          "Stara cena powinna być wyższa od aktualnej ceny.",
      };
    }

    if (
      !affiliateUrl ||
      !isValidHttpsUrl(
        affiliateUrl
      )
    ) {
      return {
        data:
          null,

        error:
          "Podaj poprawny link afiliacyjny rozpoczynający się od https://",
      };
    }

    return {
      data: {
        name,
        shortName,
        description,
        price,
        oldPrice,
        category,
        affiliateUrl,
        soldText,

        featured:
          form.featured,
      },

      error:
        null,
    };
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      null
    );

    setSuccessSlug(
      null
    );

    const validation =
      validateProduct();

    if (
      validation.error ||
      !validation.data
    ) {
      setError(
        validation.error ??
          "Nie udało się sprawdzić formularza."
      );

      return;
    }

    setChecking(
      true
    );

    const duplicateResult =
      await runDuplicateCheck({
        sourceText:
          rawOffer,

        affiliateUrl:
          validation.data
            .affiliateUrl,

        name:
          validation.data
            .name,

        shortName:
          validation.data
            .shortName,

        category:
          validation.data
            .category,
      });

    setChecking(
      false
    );

    if (
      duplicateResult.status ===
      "blocked"
    ) {
      setError(
        "Ten produkt znajduje się już w bazie. Nie można opublikować drugiej oferty tego samego produktu."
      );

      return;
    }

    if (
      duplicateResult.status ===
      "error"
    ) {
      setError(
        "Nie udało się bezpiecznie sprawdzić bazy pod kątem duplikatów. Spróbuj ponownie za chwilę."
      );

      return;
    }

    setConfirmOpen(
      true
    );
  }

  const closeConfirmation =
    useCallback(
      () => {
        if (
          !loading
        ) {
          setConfirmOpen(
            false
          );
        }
      },
      [
        loading,
      ]
    );

  async function publishProduct() {
    const validation =
      validateProduct();

    if (
      validation.error ||
      !validation.data ||
      !imageFile
    ) {
      setConfirmOpen(
        false
      );

      setError(
        validation.error ??
          "Nie udało się przygotować produktu."
      );

      return;
    }

    const product =
      validation.data;

    setLoading(
      true
    );

    const duplicateResult =
      await runDuplicateCheck({
        sourceText:
          rawOffer,

        affiliateUrl:
          product.affiliateUrl,

        name:
          product.name,

        shortName:
          product.shortName,

        category:
          product.category,
      });

    if (
      duplicateResult.status ===
      "blocked"
    ) {
      setConfirmOpen(
        false
      );

      setError(
        "Publikacja została zatrzymana, ponieważ ten produkt znajduje się już w bazie."
      );

      setLoading(
        false
      );

      return;
    }

    if (
      duplicateResult.status ===
      "error"
    ) {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się ponownie sprawdzić duplikatów. Produkt nie został opublikowany — spróbuj ponownie."
      );

      setLoading(
        false
      );

      return;
    }

    const productIdentity:
      SheinProductIdentity |
      null =
      duplicateResult.identity;

    const baseSlug =
      slugify(
        product.shortName ||
          product.name
      );

    if (
      !baseSlug
    ) {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się utworzyć adresu produktu."
      );

      setLoading(
        false
      );

      return;
    }

    let slug:
      string;

    try {
      slug =
        await createUniqueSlug(
          baseSlug
        );
    } catch {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się przygotować adresu produktu."
      );

      setLoading(
        false
      );

      return;
    }

    const filePath =
      `products/${crypto.randomUUID()}.${getExtension(
        imageFile
      )}`;

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          "product-images"
        )
        .upload(
          filePath,
          imageFile,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              imageFile.type,
          }
        );

    if (
      uploadError
    ) {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się przesłać zdjęcia."
      );

      setLoading(
        false
      );

      return;
    }

    const {
      data:
        publicUrlData,
    } =
      supabase.storage
        .from(
          "product-images"
        )
        .getPublicUrl(
          filePath
        );

    const imageUrl =
      publicUrlData.publicUrl;

    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "products"
        )
        .insert({
          slug,

          name:
            product.name,

          short_name:
            product.shortName,

          description:
            product.description,

          price:
            product.price,

          old_price:
            product.oldPrice,

          category:
            product.category,

          image_url:
            imageUrl,

          affiliate_url:
            product.affiliateUrl,

          shein_product_key:
            productIdentity
              ?.key ??
            null,

          featured:
            product.featured,

          sold_text:
            product.soldText ||
            null,

          active:
            true,
        });

    if (
      insertError
    ) {
      await supabase.storage
        .from(
          "product-images"
        )
        .remove([
          filePath,
        ]);

      const errorText =
        [
          insertError.message,
          insertError.details,
          insertError.hint,
        ]
          .filter(
            Boolean
          )
          .join(
            " "
          );

      const duplicateViolation =
        insertError.code ===
          "23505" &&
        /products_shein_product_key_unique|products_affiliate_url_unique/i.test(
          errorText
        );

      if (
        duplicateViolation
      ) {
        await runDuplicateCheck({
          sourceText:
            rawOffer,

          affiliateUrl:
            product.affiliateUrl,

          name:
            product.name,

          shortName:
            product.shortName,

          category:
            product.category,
        });

        setConfirmOpen(
          false
        );

        setError(
          "Inny administrator opublikował już ten produkt. Publikacja duplikatu została automatycznie zablokowana."
        );

        setLoading(
          false
        );

        return;
      }

      console.error(
        "Błąd publikacji produktu:",
        insertError
      );

      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się dodać produktu."
      );

      setLoading(
        false
      );

      return;
    }

    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    window.localStorage.removeItem(
      DRAFT_KEY
    );

    window.localStorage.removeItem(
      LEGACY_DRAFT_KEY
    );

    setConfirmOpen(
      false
    );

    setMobilePreviewOpen(
      false
    );

    setForm(
      INITIAL_FORM
    );

    setRawOffer(
      ""
    );

    setAnalysis(
      null
    );

    setParserMessage(
      null
    );

    setParserWarnings(
      []
    );

    setParserConfidence(
      null
    );

    resetDuplicateCheck();

    setImageFile(
      null
    );

    setPreviewUrl(
      null
    );

    setDraftRestored(
      false
    );

    setDraftSavedAt(
      null
    );

    setSuccessSlug(
      slug
    );

    setLoading(
      false
    );

    router.refresh();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  const slugPreview =
    slugify(
      form.shortName
    );

  const validPrice =
    (
      parsePrice(
        form.price
      ) ??
      0
    ) >
    0;

  const basicComplete =
    Boolean(
      form.name.trim() &&
      form.shortName.trim() &&
      form.description.trim()
    );

  const priceComplete =
    Boolean(
      validPrice &&
      form.category.trim() &&
      isProductCategory(
        form.category
      )
    );

  const imageComplete =
    imageFile !==
    null;

  const linkComplete =
    Boolean(
      form.affiliateUrl.trim() &&
      isValidHttpsUrl(
        form.affiliateUrl.trim()
      )
    );

  const completedSections =
    [
      basicComplete,
      priceComplete,
      imageComplete,
      linkComplete,
    ].filter(
      Boolean
    ).length;

  const completionPercent =
    completedSections *
    25;

  const assistantFields =
    useMemo(
      () =>
        analysis
          ? getOfferAssistantFields(
              analysis
            )
          : [],
      [
        analysis,
      ]
    );

  const assistantCompletion =
    useMemo(
      () =>
        getRequiredAssistantCompletion(
          assistantFields
        ),
      [
        assistantFields,
      ]
    );

  const nextMissing =
    !basicComplete
      ? {
          id:
            "section-basic",

          label:
            "nazwę i opis",
        }
      : !priceComplete
        ? {
            id:
              "section-price",

            label:
              "cenę i kategorię",
          }
        : !imageComplete
          ? {
              id:
                "section-image",

              label:
                "zdjęcie",
            }
          : !linkComplete
            ? {
                id:
                  "section-link",

                label:
                  "link",
              }
            : null;

  function goToMissing() {
    if (
      !nextMissing
    ) {
      return;
    }

    document
      .getElementById(
        nextMissing.id
      )
      ?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });
  }

  return (
    <main className="min-h-screen bg-stone-50 pb-28 text-stone-900 lg:pb-0">
      <PublishConfirmation
        open={
          confirmOpen
        }
        loading={
          loading
        }
        name={
          form.name
        }
        shortName={
          form.shortName
        }
        description={
          form.description
        }
        price={
          form.price
        }
        oldPrice={
          form.oldPrice
        }
        category={
          form.category
        }
        affiliateUrl={
          form.affiliateUrl
        }
        featured={
          form.featured
        }
        imageUrl={
          previewUrl
        }
        onClose={
          closeConfirmation
        }
        onConfirm={
          publishProduct
        }
      />

      {mobilePreviewOpen && (
        <MobilePreview
          form={
            form
          }
          imageUrl={
            previewUrl
          }
          onClose={() =>
            setMobilePreviewOpen(
              false
            )
          }
        />
      )}

      <AdminHeader />

      <AdminFormShell
        eyebrow="Nowa oferta"
        title="Dodaj produkt"
        description="Szybki start rozpoznaje dane, dokładny typ produktu i kategorię, a przed publikacją automatycznie sprawdza duplikaty."
        mobileBadge="Autozapis"
      >
        {successSlug && (
          <div className="mb-5 rounded-[20px] border border-green-200 bg-green-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-black text-green-700 shadow-sm">
                ✓
              </div>

              <div className="min-w-0">
                <h2 className="font-black text-green-900">
                  Oferta została
                  opublikowana
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Produkt jest już
                  aktywny na stronie.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/produkt/${successSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-xl bg-green-700 px-4 text-xs font-black text-white sm:text-sm"
                  >
                    Zobacz produkt ↗
                  </Link>

                  <Link
                    href="/admin"
                    className="inline-flex min-h-10 items-center rounded-xl border border-green-200 bg-white px-4 text-xs font-black text-green-800 sm:text-sm"
                  >
                    Panel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProgressCard
          completedSections={
            completedSections
          }
          completionPercent={
            completionPercent
          }
        />

        {error && (
          <div
            id="new-product-error"
            className="mt-4 rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"
          >
            <span className="font-black">
              Nie można
              kontynuować:
            </span>
            {" "}
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-7">
          <div className="min-w-0">
            <QuickStartAssistant
              rawOffer={
                rawOffer
              }
              onRawOfferChange={
                handleRawOfferChange
              }
              onAnalyze={() =>
                analyzeOffer(
                  rawOffer
                )
              }
              onPasteAndAnalyze={
                handlePasteAndAnalyze
              }
              clipboardLoading={
                clipboardLoading
              }
              analysis={
                analysis
              }
              fields={
                assistantFields
              }
              detectedFields={
                assistantCompletion
                  .detected
              }
              totalFields={
                assistantCompletion
                  .total
              }
              analysisPercent={
                assistantCompletion
                  .percent
              }
              parserMessage={
                parserMessage
              }
              parserWarnings={
                parserWarnings
              }
              parserConfidence={
                parserConfidence
              }
              duplicateCheck={
                duplicateCheck
              }
              onGenerateDescription={
                applySuggestedDescription
              }
              onGoToMissing={
                goToMissing
              }
              nextMissingLabel={
                nextMissing
                  ?.label ??
                null
              }
              onClear={
                clearOffer
              }
              draftRestored={
                draftRestored
              }
              draftSavedAt={
                draftSavedAt
              }
            />

            <form
              id="new-product-form"
              onSubmit={
                handleSubmit
              }
              className="mt-4 space-y-3"
            >
              <FormSection
                id="section-basic"
                number="1"
                title="Nazwa i opis"
                description="Sprawdź dane przygotowane przez Szybki start."
                complete={
                  basicComplete
                }
              >
                <Input
                  label="Pełna nazwa"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "name",
                      event.target
                        .value
                    )
                  }
                  placeholder="Pełna nazwa produktu"
                  required
                />

                <div>
                  <Input
                    label="Krótka nazwa"
                    name="shortName"
                    value={
                      form.shortName
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "shortName",
                        event.target
                          .value
                      )
                    }
                    placeholder="Nazwa widoczna na kafelku"
                    required
                  />

                  {slugPreview && (
                    <p className="mt-1.5 truncate px-1 text-[10px] text-stone-400 sm:text-xs">
                      /produkt/
                      {
                        slugPreview
                      }
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <FieldLabel>
                      Opis
                    </FieldLabel>

                    {analysis && (
                      <button
                        type="button"
                        onClick={
                          applySuggestedDescription
                        }
                        className="shrink-0 text-[10px] font-black text-violet-600 hover:text-violet-700"
                      >
                        ✨ Przygotuj
                        ponownie
                      </button>
                    )}
                  </div>

                  <textarea
                    required
                    rows={
                      5
                    }
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Krótki, rzeczowy opis produktu..."
                    className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
                  />

                  <p className="mt-1.5 px-1 text-[10px] leading-5 text-stone-400">
                    Automatyczny opis
                    jest celowo
                    ostrożny i nie
                    dopisuje
                    właściwości,
                    których nie da się
                    potwierdzić z
                    wklejonej treści.
                  </p>
                </div>
              </FormSection>

              <FormSection
                id="section-price"
                number="2"
                title="Cena i kategoria"
                description="Wybierz dokładny rodzaj produktu zamiast szerokiej kategorii."
                complete={
                  priceComplete
                }
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Cena"
                    type="text"
                    inputMode="decimal"
                    value={
                      form.price
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "price",
                        event.target
                          .value
                      )
                    }
                    placeholder="38,35"
                    required
                  />

                  <Input
                    label="Stara cena"
                    optional
                    type="text"
                    inputMode="decimal"
                    value={
                      form.oldPrice
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "oldPrice",
                        event.target
                          .value
                      )
                    }
                    placeholder="np. 59,99"
                  />
                </div>

                <ProductCategorySelect
                  value={
                    form.category
                  }
                  onChange={(
                    category
                  ) =>
                    updateField(
                      "category",
                      category
                    )
                  }
                />
              </FormSection>

              <FormSection
                id="section-image"
                number="3"
                title="Zdjęcie"
                description="Dodaj główne zdjęcie produktu."
                complete={
                  imageComplete
                }
              >
                {!previewUrl ? (
                  <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-rose-200 bg-rose-50/40 px-5 py-7 text-center transition active:bg-rose-50 sm:hover:border-rose-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      📷
                    </div>

                    <p className="mt-3 text-sm font-black">
                      Wybierz zdjęcie
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      JPG, PNG lub
                      WebP • maks.
                      5 MB
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 rounded-[18px] border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[130px_minmax(0,1fr)]">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white">
                      <img
                        src={
                          previewUrl
                        }
                        alt="Wybrane zdjęcie produktu"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-between py-1">
                      <div>
                        <p className="text-xs font-black text-green-700">
                          ✓ Zdjęcie
                          dodane
                        </p>

                        <p className="mt-2 truncate text-xs font-semibold text-stone-700">
                          {
                            imageFile
                              ?.name
                          }
                        </p>

                        {imageFile && (
                          <p className="mt-1 text-[10px] text-stone-400">
                            {(
                              imageFile.size /
                              1024 /
                              1024
                            ).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <label className="flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-white px-2 text-xs font-black text-stone-700 ring-1 ring-stone-200">
                          Zmień

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                              handleImageChange
                            }
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          className="min-h-10 rounded-xl bg-red-50 px-2 text-xs font-black text-red-700"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection
                id="section-link"
                number="4"
                title="Link i publikacja"
                description="Sprawdź link afiliacyjny i ustaw wyróżnienie produktu."
                complete={
                  linkComplete
                }
              >
                <Input
                  label="Link afiliacyjny SHEIN"
                  type="url"
                  inputMode="url"
                  value={
                    form.affiliateUrl
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "affiliateUrl",
                      event.target
                        .value
                    )
                  }
                  placeholder="https://..."
                  required
                />

                <Input
                  label="Informacja o sprzedaży"
                  optional
                  value={
                    form.soldText
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "soldText",
                      event.target
                        .value
                    )
                  }
                  placeholder="Tylko jeśli dane są zweryfikowane"
                />

                <ToggleCard
                  checked={
                    form.featured
                  }
                  onChange={(
                    checked
                  ) =>
                    updateField(
                      "featured",
                      checked
                    )
                  }
                  title="🔥 Gorąca okazja"
                  description="Pokaż produkt w wyróżnionej sekcji strony głównej."
                />

                <button
                  type="submit"
                  disabled={
                    checking ||
                    loading ||
                    duplicateCheck
                      .status ===
                      "blocked"
                  }
                  className="hidden min-h-12 w-full rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 lg:block"
                >
                  {checking
                    ? "Sprawdzanie..."
                    : "Sprawdź i publikuj"}
                </button>
              </FormSection>
            </form>

            <div className="mt-4 xl:hidden">
              <OfferQualityChecks
                name={
                  form.name
                }
                shortName={
                  form.shortName
                }
                description={
                  form.description
                }
                price={
                  form.price
                }
                oldPrice={
                  form.oldPrice
                }
                affiliateUrl={
                  form.affiliateUrl
                }
                soldText={
                  form.soldText
                }
                imageSelected={
                  Boolean(
                    imageFile
                  )
                }
              />
            </div>
          </div>

          <aside className="hidden min-w-0 space-y-4 xl:block">
            <div className="sticky top-5 space-y-4">
              <ProductPreview
                name={
                  form.name
                }
                shortName={
                  form.shortName
                }
                description={
                  form.description
                }
                price={
                  form.price
                }
                oldPrice={
                  form.oldPrice
                }
                category={
                  form.category
                }
                featured={
                  form.featured
                }
                imageUrl={
                  previewUrl
                }
              />

              <OfferQualityChecks
                name={
                  form.name
                }
                shortName={
                  form.shortName
                }
                description={
                  form.description
                }
                price={
                  form.price
                }
                oldPrice={
                  form.oldPrice
                }
                affiliateUrl={
                  form.affiliateUrl
                }
                soldText={
                  form.soldText
                }
                imageSelected={
                  Boolean(
                    imageFile
                  )
                }
              />
            </div>
          </aside>
        </div>
      </AdminFormShell>

      <div
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-stone-200 bg-white/95 px-3 pt-2 shadow-[0_-10px_35px_rgba(28,25,23,0.10)] backdrop-blur-xl lg:hidden"
        style={{
          paddingBottom:
            "max(0.6rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-[110px_minmax(0,1fr)] gap-2">
          <button
            type="button"
            onClick={() =>
              setMobilePreviewOpen(
                true
              )
            }
            className="min-h-12 rounded-[14px] border border-stone-200 bg-white px-3 text-xs font-black text-stone-700"
          >
            Podgląd
          </button>

          <button
            type="submit"
            form="new-product-form"
            disabled={
              checking ||
              loading ||
              duplicateCheck
                .status ===
                "blocked"
            }
            className="min-h-12 rounded-[14px] bg-rose-600 px-4 text-sm font-black text-white shadow-sm disabled:opacity-40"
          >
            {checking
              ? "Sprawdzanie..."
              : "Sprawdź i publikuj"}
          </button>
        </div>
      </div>
    </main>
  );
}

function ProgressCard({
  completedSections,
  completionPercent,
}: {
  completedSections:
    number;

  completionPercent:
    number;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black text-stone-900">
            Gotowość oferty
          </p>

          <p className="mt-1 text-[10px] text-stone-400 sm:text-xs">
            {
              completedSections
            }{" "}
            z 4 sekcji
            gotowych
          </p>
        </div>

        <p className="text-xl font-black tracking-[-0.04em] text-rose-600">
          {
            completionPercent
          }
          %
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-rose-600 transition-all"
          style={{
            width:
              `${completionPercent}%`,
          }}
        />
      </div>
    </div>
  );
}

function FormSection({
  id,
  number,
  title,
  description,
  complete,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={
        id
      }
      className="scroll-mt-5 overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-stone-100 p-4 sm:p-5">
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] text-xs font-black",
            complete
              ? "bg-green-100 text-green-700"
              : "bg-stone-100 text-stone-500",
          ].join(
            " "
          )}
        >
          {complete
            ? "✓"
            : number}
        </span>

        <div>
          <h2 className="text-base font-black tracking-[-0.02em] text-stone-900">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-stone-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

function FieldLabel({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <label className="mb-1.5 block text-xs font-black text-stone-700 sm:text-sm">
      {children}
    </label>
  );
}

function Input({
  label,
  optional = false,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-black text-stone-700 sm:text-sm">
        {label}

        {optional && (
          <span className="text-[9px] font-bold text-stone-400">
            opcjonalne
          </span>
        )}
      </span>

      <input
        {...props}
        className={[
          "min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-base outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm",
          className,
        ].join(
          " "
        )}
      />
    </label>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;

  onChange:
    (
      checked:
        boolean
    ) => void;

  title: string;

  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-stone-200 bg-stone-50 p-3.5">
      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .checked
          )
        }
        className="h-5 w-5 shrink-0 accent-rose-600"
      />

      <span className="min-w-0">
        <span className="block text-sm font-black text-stone-900">
          {title}
        </span>

        <span className="mt-1 block text-[10px] leading-5 text-stone-400">
          {description}
        </span>
      </span>
    </label>
  );
}

function MobilePreview({
  form,
  imageUrl,
  onClose,
}: {
  form: FormState;

  imageUrl:
    | string
    | null;

  onClose:
    () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-stone-950/45 backdrop-blur-sm xl:hidden">
      <button
        type="button"
        aria-label="Zamknij podgląd"
        onClick={
          onClose
        }
        className="absolute inset-0"
      />

      <div className="relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-[28px] bg-stone-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-rose-600">
              Podgląd
            </p>

            <p className="text-sm font-black">
              Jak wygląda oferta
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600"
          >
            ✕
          </button>
        </div>

        <div
          className="mx-auto max-w-sm p-4"
          style={{
            paddingBottom:
              "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          <ProductPreview
            name={
              form.name
            }
            shortName={
              form.shortName
            }
            description={
              form.description
            }
            price={
              form.price
            }
            oldPrice={
              form.oldPrice
            }
            category={
              form.category
            }
            featured={
              form.featured
            }
            imageUrl={
              imageUrl
            }
          />

          <button
            type="button"
            onClick={
              onClose
            }
            className="mt-3 min-h-12 w-full rounded-xl bg-stone-900 px-4 text-sm font-black text-white"
          >
            Wróć do formularza
          </button>
        </div>
      </div>
    </div>
  );
}