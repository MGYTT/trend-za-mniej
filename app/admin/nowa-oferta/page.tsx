"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
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
            "link afiliacyjny"
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
      )}. Pewność parsera: ${confidenceLabel}.`
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
      setImageFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl(null);

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

    setForm(
      INITIAL_FORM
    );

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

      <AdminHeader />

      <AdminFormShell
        eyebrow="Nowa oferta"
        title="Dodaj produkt"
        description="Wklej dane oferty, uzupełnij brakujące informacje i sprawdź podgląd przed publikacją."
      >
        {successSlug && (
          <div className="mb-6 rounded-[28px] border border-green-200 bg-green-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                ✓
              </div>

              <div>
                <h2 className="text-lg font-black text-green-900">
                  Oferta została
                  opublikowana
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Produkt jest już
                  aktywny na stronie.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/produkt/${successSlug}`}
                    target="_blank"
                    className="inline-flex min-h-11 items-center rounded-xl bg-green-700 px-5 text-sm font-black text-white"
                  >
                    Zobacz produkt ↗
                  </Link>

                  <Link
                    href="/admin"
                    className="inline-flex min-h-11 items-center rounded-xl border border-green-200 bg-white px-5 text-sm font-black text-green-800"
                  >
                    Panel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <div className="min-w-0">
            <section className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 to-rose-50 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  ✨
                </div>

                <div>
                  <h2 className="text-lg font-black sm:text-xl">
                    Wklej ofertę
                    SHEIN
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Możesz wkleić nawet
                    cały tekst
                    skopiowany ze strony
                    produktu. Parser
                    spróbuje odrzucić
                    menu, reklamy,
                    rabaty, dostawę i
                    inne niepotrzebne
                    elementy.
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
                rows={9}
                placeholder={`Wklej tutaj tekst skopiowany z produktu SHEIN.

Możesz wkleić całość, np. nazwę produktu, cenę, informacje ze strony i link afiliacyjny.

Parser spróbuje sam odnaleźć właściwą nazwę, cenę, kategorię i link.`}
                className="mt-5 w-full resize-y rounded-2xl border border-violet-100 bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={
                  handleParseOffer
                }
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-5 font-black text-violet-700 shadow-sm ring-1 ring-violet-100 transition hover:shadow-md"
              >
                ✨ Inteligentnie
                rozpoznaj ofertę
              </button>

              {parserMessage && (
                <div className="mt-4 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-stone-800">
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
                    <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
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

                  <p className="mt-3 text-xs leading-5 text-stone-400">
                    Zawsze sprawdź
                    nazwę, cenę i link
                    przed publikacją.
                    Parser pomaga
                    przygotować dane,
                    ale nie publikuje
                    produktu
                    automatycznie.
                  </p>
                </div>
              )}
            </section>

            <form
              id="new-product-form"
              onSubmit={
                handleSubmit
              }
              className="mt-6 space-y-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <FormSection
                number="1"
                title="Podstawowe informacje"
              >
                <Input
                  label="Pełna nazwa produktu"
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

                  <div className="mt-2 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-500">
                    <span className="font-bold text-stone-700">
                      Adres:
                    </span>{" "}
                    {slugPreview
                      ? `/produkt/${slugPreview}`
                      : "/produkt/..."}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Opis
                  </label>

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
                    placeholder="Krótko opisz styl, fason i najważniejsze cechy produktu..."
                    className="w-full resize-y rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </FormSection>

              <FormSection
                number="2"
                title="Cena i kategoria"
              >
                <div className="grid gap-4 sm:grid-cols-2">
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
                    placeholder="Opcjonalnie"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Kategoria
                  </label>

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
                    className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
                title="Zdjęcie produktu"
              >
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-5 py-9 text-center transition hover:border-rose-400 hover:bg-rose-50">
                  <div className="text-4xl">
                    📷
                  </div>

                  <p className="mt-3 font-black">
                    Wybierz zdjęcie
                  </p>

                  <p className="mt-1 text-sm text-stone-500">
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

                {previewUrl && (
                  <div className="mt-4 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
                    <img
                      src={
                        previewUrl
                      }
                      alt="Podgląd wybranego produktu"
                      className="mx-auto max-h-[460px] w-full object-contain"
                    />
                  </div>
                )}

                {imageFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate font-semibold">
                      {
                        imageFile.name
                      }
                    </span>

                    <span className="shrink-0 text-stone-400">
                      {(
                        imageFile.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </span>
                  </div>
                )}
              </FormSection>

              <FormSection
                number="4"
                title="Link i publikacja"
              >
                <Input
                  label="Link afiliacyjny SHEIN"
                  type="url"
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
                  placeholder="Opcjonalnie, tylko jeśli zweryfikowane"
                />

                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
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
                    <p className="font-black">
                      🔥 Gorąca okazja
                    </p>

                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Pokaż produkt
                      również w
                      wyróżnionej
                      sekcji strony
                      głównej.
                    </p>
                  </div>
                </label>
              </FormSection>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  checking
                }
                className="hidden min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
              >
                {checking
                  ? "Sprawdzanie..."
                  : "Sprawdź ofertę →"}
              </button>
            </form>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
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

            <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                  Podgląd
                </p>

                <h2 className="mt-1 text-xl font-black">
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(28,25,23,0.10)] backdrop-blur-xl lg:hidden">
        <div
          className="mx-auto flex max-w-xl gap-3"
          style={{
            paddingBottom:
              "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <Link
            href="/admin"
            className="flex min-h-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 font-black text-stone-600"
          >
            ←
          </Link>

          <button
            type="submit"
            form="new-product-form"
            disabled={
              loading ||
              checking
            }
            className="flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking
              ? "Sprawdzanie..."
              : "Sprawdź ofertę →"}
          </button>
        </div>
      </div>
    </main>
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
      <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black text-green-700">
        ✓ wysoka pewność
      </span>
    );
  }

  if (
    confidence === "medium"
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
        ~ średnia pewność
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-700">
      ! sprawdź dane
    </span>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-700">
          {number}
        </span>

        <h2 className="text-lg font-black text-stone-900">
          {title}
        </h2>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  ...props
}: {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-stone-800">
        {label}
      </label>

      <input
        {...props}
        className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
      />
    </div>
  );
}