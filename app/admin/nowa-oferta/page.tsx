"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import AdminFormShell from "@/components/admin/AdminFormShell";
import AdminHeader from "@/components/admin/AdminHeader";
import OfferQualityChecks from "@/components/admin/OfferQualityChecks";
import ProductPreview from "@/components/admin/ProductPreview";
import PublishConfirmation from "@/components/admin/PublishConfirmation";

import {
  parseOfferText,
} from "@/lib/offer-parser";

import {
  createClient,
} from "@/lib/supabase/client";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const CATEGORIES = [
  "Bluzy",
  "Swetry",
  "Topy",
  "Koszule",
  "Kardigany",
  "Sukienki",
  "Spodnie",
  "Spódnice",
  "Kurtki i płaszcze",
  "Buty",
  "Torebki",
  "Biżuteria",
  "Akcesoria",
  "Akcesoria kosmetyczne",
  "Uroda",
  "Dom i lifestyle",
  "Inne",
];

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
  oldPrice: number | null;
  category: string;
  affiliateUrl: string;
  soldText: string;
  featured: boolean;
};

const INITIAL_FORM: FormState = {
  name: "",
  shortName: "",
  description: "",
  price: "",
  oldPrice: "",
  category: "",
  affiliateUrl: "",
  soldText: "",
  featured: true,
};

export default function NewProductPage() {
  const router =
    useRouter();

  const [supabase] =
    useState(
      () => createClient()
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checking,
    setChecking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    successSlug,
    setSuccessSlug,
  ] = useState<
    string | null
  >(null);

  const [
    rawOffer,
    setRawOffer,
  ] = useState("");

  const [
    parserMessage,
    setParserMessage,
  ] = useState<
    string | null
  >(null);

  const [
    parserWarnings,
    setParserWarnings,
  ] = useState<
    string[]
  >([]);

  const [
    parserConfidence,
    setParserConfidence,
  ] = useState<
    | "high"
    | "medium"
    | "low"
    | null
  >(null);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    mobilePreviewOpen,
    setMobilePreviewOpen,
  ] = useState(false);

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
  ] = useState<File | null>(
    null
  );

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!mobilePreviewOpen) {
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
  }, [mobilePreviewOpen]);

  useEffect(() => {
    if (!error) {
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

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [error]);

  function slugify(
    value: string
  ) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/ł/g, "l")
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
        .replace(/\s/g, "")
        .replace(",", ".");

    if (!normalized) {
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
    switch (file.type) {
      case "image/jpeg":
        return "jpg";

      case "image/png":
        return "png";

      case "image/webp":
        return "webp";

      default:
        return "jpg";
    }
  }

  function isValidHttpsUrl(
    value: string
  ) {
    try {
      const url =
        new URL(value);

      return (
        url.protocol ===
        "https:"
      );
    } catch {
      return false;
    }
  }

  function updateField<
    Key extends keyof FormState,
  >(
    key: Key,
    value: FormState[Key]
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    setError(null);
    setSuccessSlug(null);
  }

  async function createUniqueSlug(
    baseSlug: string
  ) {
    let candidate =
      baseSlug;

    let counter = 2;

    while (true) {
      const {
        data,
        error:
          slugError,
      } =
        await supabase
          .from("products")
          .select("id")
          .eq(
            "slug",
            candidate
          )
          .maybeSingle();

      if (slugError) {
        throw slugError;
      }

      if (!data) {
        return candidate;
      }

      candidate =
        `${baseSlug}-${counter}`;

      counter += 1;
    }
  }

  function validateProduct():
    | {
        data: ValidatedProduct;
        error: null;
      }
    | {
        data: null;
        error: string;
      } {
    if (!imageFile) {
      return {
        data: null,
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
        data: null,
        error:
          "Uzupełnij pełną i krótką nazwę produktu.",
      };
    }

    if (!description) {
      return {
        data: null,
        error:
          "Dodaj opis produktu.",
      };
    }

    if (!category) {
      return {
        data: null,
        error:
          "Wybierz kategorię.",
      };
    }

    if (
      price === null ||
      price <= 0
    ) {
      return {
        data: null,
        error:
          "Podaj poprawną cenę większą od 0.",
      };
    }

    if (
      form.oldPrice.trim() &&
      (
        oldPrice === null ||
        oldPrice <= 0
      )
    ) {
      return {
        data: null,
        error:
          "Stara cena jest niepoprawna.",
      };
    }

    if (
      oldPrice !== null &&
      oldPrice <= price
    ) {
      return {
        data: null,
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
        data: null,
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

      error: null,
    };
  }

  async function checkDuplicateAffiliateUrl(
    affiliateUrl: string
  ) {
    const {
      data,
      error:
        duplicateError,
    } =
      await supabase
        .from("products")
        .select(
          "id, short_name"
        )
        .eq(
          "affiliate_url",
          affiliateUrl.trim()
        )
        .limit(1);

    if (duplicateError) {
      throw duplicateError;
    }

    if (
      data &&
      data.length > 0
    ) {
      return {
        duplicate:
          true,

        productName:
          data[0]
            .short_name,
      };
    }

    return {
      duplicate:
        false,

      productName:
        null,
    };
  }

  function handleParseOffer() {
    setError(null);
    setParserMessage(null);
    setParserWarnings([]);
    setParserConfidence(null);

    if (!rawOffer.trim()) {
      setParserMessage(
        "Najpierw wklej treść oferty SHEIN."
      );

      return;
    }

    const parsed =
      parseOfferText(
        rawOffer
      );

    const found: string[] =
      [];

    setForm(
      (current) => {
        const next = {
          ...current,
        };

        if (parsed.name) {
          next.name =
            parsed.name;

          found.push(
            "pełną nazwę"
          );
        }

        if (
          parsed.shortName
        ) {
          next.shortName =
            parsed.shortName;

          found.push(
            "krótką nazwę"
          );
        }

        if (
          parsed.price
        ) {
          next.price =
            parsed.price;

          found.push(
            "cenę"
          );
        }

        if (
          parsed.oldPrice
        ) {
          next.oldPrice =
            parsed.oldPrice;

          found.push(
            "starą cenę"
          );
        }

        if (
          parsed.affiliateUrl
        ) {
          next.affiliateUrl =
            parsed.affiliateUrl;

          found.push(
            "link"
          );
        }

        if (
          parsed.category
        ) {
          next.category =
            parsed.category;

          found.push(
            "kategorię"
          );
        }

        if (
          parsed.soldText &&
          !current.soldText
        ) {
          next.soldText =
            parsed.soldText;

          found.push(
            "sprzedaż"
          );
        }

        return next;
      }
    );

    setParserConfidence(
      parsed.confidence
    );

    setParserWarnings(
      parsed.warnings
    );

    if (
      found.length === 0
    ) {
      setParserMessage(
        "Nie udało się automatycznie rozpoznać danych produktu."
      );

      return;
    }

    const confidenceLabel =
      parsed.confidence ===
      "high"
        ? "wysoka"
        : parsed.confidence ===
            "medium"
          ? "średnia"
          : "niska";

    setParserMessage(
      `Rozpoznano: ${found.join(
        ", "
      )}. Pewność: ${confidenceLabel}.`
    );
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError(null);
    setSuccessSlug(null);

    const file =
      event.target
        .files?.[0] ??
      null;

    if (!file) {
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

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const localPreview =
      URL.createObjectURL(
        file
      );

    setImageFile(file);

    setPreviewUrl(
      localPreview
    );
  }

  function removeImage() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccessSlug(null);

    const validation =
      validateProduct();

    if (
      validation.error ||
      !validation.data
    ) {
      setError(
        validation.error
      );

      return;
    }

    setChecking(true);

    try {
      const duplicate =
        await checkDuplicateAffiliateUrl(
          validation.data
            .affiliateUrl
        );

      if (
        duplicate.duplicate
      ) {
        setError(
          `Ten link afiliacyjny jest już używany przez produkt „${duplicate.productName ?? "bez nazwy"}”.`
        );

        setChecking(false);

        return;
      }
    } catch {
      setError(
        "Nie udało się sprawdzić duplikatu linku."
      );

      setChecking(false);

      return;
    }

    setChecking(false);
    setConfirmOpen(true);
  }

  const closeConfirmation =
    useCallback(() => {
      if (!loading) {
        setConfirmOpen(
          false
        );
      }
    }, [loading]);

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

    setLoading(true);

    try {
      const duplicate =
        await checkDuplicateAffiliateUrl(
          product.affiliateUrl
        );

      if (
        duplicate.duplicate
      ) {
        setConfirmOpen(
          false
        );

        setError(
          `Ten link afiliacyjny jest już używany przez produkt „${duplicate.productName ?? "bez nazwy"}”.`
        );

        setLoading(false);

        return;
      }
    } catch {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się ponownie sprawdzić linku afiliacyjnego."
      );

      setLoading(false);

      return;
    }

    const baseSlug =
      slugify(
        product.shortName ||
          product.name
      );

    if (!baseSlug) {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się utworzyć adresu produktu."
      );

      setLoading(false);

      return;
    }

    let slug: string;

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

      setLoading(false);

      return;
    }

    const extension =
      getExtension(
        imageFile
      );

    const filePath =
      `products/${crypto.randomUUID()}.${extension}`;

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

    if (uploadError) {
      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się przesłać zdjęcia."
      );

      setLoading(false);

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
        .from("products")
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

          featured:
            product.featured,

          sold_text:
            product.soldText ||
            null,

          active: true,
        });

    if (insertError) {
      await supabase.storage
        .from(
          "product-images"
        )
        .remove([
          filePath,
        ]);

      setConfirmOpen(
        false
      );

      setError(
        "Nie udało się dodać produktu."
      );

      setLoading(false);

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setConfirmOpen(false);
    setMobilePreviewOpen(false);
    setForm(INITIAL_FORM);
    setRawOffer("");
    setParserMessage(null);
    setParserWarnings([]);
    setParserConfidence(null);
    setImageFile(null);
    setPreviewUrl(null);
    setSuccessSlug(slug);
    setLoading(false);

    router.refresh();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
      ) ?? 0
    ) > 0;

  const basicComplete =
    Boolean(
      form.name.trim() &&
        form.shortName.trim() &&
        form.description.trim()
    );

  const priceComplete =
    Boolean(
      validPrice &&
        form.category.trim()
    );

  const imageComplete =
    imageFile !== null;

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
    ].filter(Boolean).length;

  const completionPercent =
    completedSections * 25;

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
          form={form}
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
        description="Wklej ofertę SHEIN, sprawdź rozpoznane dane, dodaj zdjęcie i opublikuj produkt."
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
          basicComplete={
            basicComplete
          }
          priceComplete={
            priceComplete
          }
          imageComplete={
            imageComplete
          }
          linkComplete={
            linkComplete
          }
        />

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-7">
          <div className="min-w-0">
            <section className="rounded-[20px] border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg">
                  ✨
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-violet-600">
                    Szybki start
                  </p>

                  <h2 className="mt-0.5 text-lg font-black">
                    Wklej ofertę
                    SHEIN
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
                    Wklej nawet cały
                    tekst produktu.
                    Parser spróbuje
                    znaleźć nazwę,
                    cenę, kategorię
                    i link.
                  </p>
                </div>
              </div>

              <textarea
                value={
                  rawOffer
                }
                onChange={(
                  event
                ) => {
                  setRawOffer(
                    event.target
                      .value
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
                }}
                rows={7}
                placeholder="Wklej tutaj tekst skopiowany z produktu SHEIN..."
                className="mt-4 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:text-sm"
              />

              <button
                type="button"
                onClick={
                  handleParseOffer
                }
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-violet-700"
              >
                ✨ Rozpoznaj i uzupełnij
              </button>

              {parserMessage && (
                <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold leading-5 text-stone-700 sm:text-sm">
                      {
                        parserMessage
                      }
                    </p>

                    {parserConfidence && (
                      <ParserConfidenceBadge
                        confidence={
                          parserConfidence
                        }
                      />
                    )}
                  </div>

                  {parserWarnings.length >
                    0 && (
                    <div className="mt-3 space-y-1.5 border-t border-stone-200 pt-3">
                      {parserWarnings.map(
                        (
                          warning
                        ) => (
                          <p
                            key={
                              warning
                            }
                            className="flex gap-2 text-xs leading-5 text-amber-700"
                          >
                            <span>
                              ⚠
                            </span>

                            <span>
                              {
                                warning
                              }
                            </span>
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            <form
              id="new-product-form"
              onSubmit={
                handleSubmit
              }
              className="mt-4 space-y-3"
            >
              <FormSection
                number="1"
                title="Nazwa i opis"
                description="Sprawdź dane rozpoznane z oferty."
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
                  <FieldLabel>
                    Opis
                  </FieldLabel>

                  <textarea
                    required
                    rows={5}
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
                    placeholder="Opisz krótko styl, fason i najważniejsze cechy..."
                    className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
                  />
                </div>
              </FormSection>

              <FormSection
                number="2"
                title="Cena i kategoria"
                description="Najważniejsze dane widoczne na karcie produktu."
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

                <div>
                  <FieldLabel>
                    Kategoria
                  </FieldLabel>

                  <select
                    required
                    value={
                      form.category
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "category",
                        event.target
                          .value
                      )
                    }
                    className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-base outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Wybierz kategorię
                    </option>

                    {CATEGORIES.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </FormSection>

              <FormSection
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
                      JPG, PNG lub WebP
                      • maks. 5 MB
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
                          ✓ Zdjęcie dodane
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
                number="4"
                title="Link i publikacja"
                description="Sprawdź link i zdecyduj, czy wyróżnić ofertę."
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
                  placeholder="https://onelink.shein.com/..."
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

                <label className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-orange-100 bg-orange-50/70 p-3.5">
                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "featured",
                        event.target
                          .checked
                      )
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-rose-600"
                  />

                  <div>
                    <p className="text-sm font-black">
                      🔥 Gorąca okazja
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      Produkt pojawi
                      się również w
                      wyróżnionej
                      sekcji strony
                      głównej.
                    </p>
                  </div>
                </label>
              </FormSection>

              {error && (
                <div
                  id="new-product-error"
                  className="rounded-[16px] border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-red-600">
                      !
                    </span>

                    <div>
                      <p className="text-sm font-black text-red-800">
                        Sprawdź ofertę
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    checking
                  }
                  className="flex min-h-14 w-full items-center justify-center rounded-xl bg-rose-600 px-7 text-base font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checking
                    ? "Sprawdzanie..."
                    : "Sprawdź ofertę przed publikacją →"}
                </button>
              </div>
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
                  imageFile !==
                  null
                }
              />
            </div>
          </div>

          <aside className="hidden space-y-4 xl:sticky xl:top-24 xl:block xl:self-start">
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
                imageFile !== null
              }
            />

            <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600">
                  Podgląd
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Widok produktu
                </h2>
              </div>

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
            </div>
          </aside>
        </div>
      </AdminFormShell>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/96 px-3 pt-2.5 shadow-[0_-6px_24px_rgba(28,25,23,0.10)] backdrop-blur-xl lg:hidden">
        <div
          className="mx-auto grid max-w-xl grid-cols-[110px_minmax(0,1fr)] gap-2"
          style={{
            paddingBottom:
              "max(0.65rem, env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setMobilePreviewOpen(
                true
              )
            }
            className="flex min-h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-700"
          >
            Podgląd
          </button>

          <button
            type="submit"
            form="new-product-form"
            disabled={
              loading ||
              checking
            }
            className="flex min-h-12 min-w-0 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking
              ? "Sprawdzanie..."
              : completedSections ===
                  4
                ? "Sprawdź i publikuj →"
                : `Sprawdź ofertę (${completedSections}/4)`}
          </button>
        </div>
      </div>
    </main>
  );
}

function ProgressCard({
  completedSections,
  completionPercent,
  basicComplete,
  priceComplete,
  imageComplete,
  linkComplete,
}: {
  completedSections: number;
  completionPercent: number;
  basicComplete: boolean;
  priceComplete: boolean;
  imageComplete: boolean;
  linkComplete: boolean;
}) {
  return (
    <section className="rounded-[18px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black text-stone-900">
            Postęp oferty
          </p>

          <p className="mt-0.5 text-[10px] text-stone-400 sm:text-xs">
            {completedSections} z 4
            sekcji gotowe
          </p>
        </div>

        <span className="text-sm font-black text-rose-600">
          {completionPercent}%
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-rose-600 transition-all duration-300"
          style={{
            width:
              `${completionPercent}%`,
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <ProgressStep
          label="Dane"
          complete={
            basicComplete
          }
        />

        <ProgressStep
          label="Cena"
          complete={
            priceComplete
          }
        />

        <ProgressStep
          label="Zdjęcie"
          complete={
            imageComplete
          }
        />

        <ProgressStep
          label="Link"
          complete={
            linkComplete
          }
        />
      </div>
    </section>
  );
}

function ProgressStep({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div
      className={[
        "flex min-h-8 items-center justify-center rounded-lg px-1 text-[9px] font-black sm:text-[10px]",
        complete
          ? "bg-green-50 text-green-700"
          : "bg-stone-50 text-stone-400",
      ].join(
        " "
      )}
    >
      {complete
        ? "✓ "
        : ""}
      {label}
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  complete,
  children,
}: {
  number: string;
  title: string;
  description: string;
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black",
            complete
              ? "bg-green-50 text-green-700"
              : "bg-rose-50 text-rose-700",
          ].join(
            " "
          )}
        >
          {complete
            ? "✓"
            : number}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-stone-900 sm:text-lg">
            {title}
          </h2>

          <p className="mt-0.5 text-xs leading-5 text-stone-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  optional = false,
  ...props
}: {
  label: string;
  optional?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <FieldLabel
        optional={
          optional
        }
      >
        {label}
      </FieldLabel>

      <input
        {...props}
        className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-base outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
      />
    </div>
  );
}

function FieldLabel({
  optional = false,
  children,
}: {
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-black text-stone-700 sm:text-sm">
      <span>
        {children}
      </span>

      {optional && (
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-stone-400">
          opcjonalne
        </span>
      )}
    </label>
  );
}

function ParserConfidenceBadge({
  confidence,
}: {
  confidence:
    | "high"
    | "medium"
    | "low";
}) {
  if (
    confidence === "high"
  ) {
    return (
      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700">
        ✓ wysoka
      </span>
    );
  }

  if (
    confidence === "medium"
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
        ~ średnia
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700">
      ! sprawdź
    </span>
  );
}

function MobilePreview({
  form,
  imageUrl,
  onClose,
}: {
  form: FormState;
  imageUrl: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-stone-950/45 backdrop-blur-sm xl:hidden">
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
            className="mt-4 min-h-12 w-full rounded-xl bg-stone-900 px-4 text-sm font-black text-white"
          >
            Wróć do edycji
          </button>
        </div>
      </div>
    </div>
  );
}