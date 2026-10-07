"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminFormShell from "@/components/admin/AdminFormShell";
import AdminHeader from "@/components/admin/AdminHeader";
import OfferQualityChecks from "@/components/admin/OfferQualityChecks";
import ProductPreview from "@/components/admin/ProductPreview";

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

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  price:
    | number
    | string;
  old_price:
    | number
    | string
    | null;
  category: string;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  sold_text:
    | string
    | null;
  active: boolean;
};

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
  active: boolean;
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
  featured: false,
  active: true,
};

export default function EditProductPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const [supabase] =
    useState(
      () => createClient()
    );

  const id =
    typeof params.id ===
    "string"
      ? params.id
      : "";

  const [
    loadingProduct,
    setLoadingProduct,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  const [
    slug,
    setSlug,
  ] = useState("");

  const [
    currentImageUrl,
    setCurrentImageUrl,
  ] = useState("");

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [
    originalForm,
    setOriginalForm,
  ] =
    useState<FormState | null>(
      null
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

  const hasChanges =
    useMemo(() => {
      if (
        !originalForm
      ) {
        return false;
      }

      if (imageFile) {
        return true;
      }

      return (
        JSON.stringify(
          form
        ) !==
        JSON.stringify(
          originalForm
        )
      );
    }, [
      form,
      originalForm,
      imageFile,
    ]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled =
      false;

    async function loadProduct() {
      setLoadingProduct(
        true
      );

      setError(null);

      const {
        data,
        error:
          productError,
      } =
        await supabase
          .from("products")
          .select("*")
          .eq(
            "id",
            id
          )
          .maybeSingle();

      if (cancelled) {
        return;
      }

      if (
        productError ||
        !data
      ) {
        console.error(
          "Błąd pobierania produktu:",
          productError
        );

        setError(
          "Nie udało się znaleźć produktu."
        );

        setLoadingProduct(
          false
        );

        return;
      }

      const product =
        data as unknown as ProductRow;

      const nextForm: FormState = {
        name:
          product.name,

        shortName:
          product.short_name,

        description:
          product.description,

        price:
          String(
            product.price
          ).replace(
            ".",
            ","
          ),

        oldPrice:
          product.old_price ===
          null
            ? ""
            : String(
                product.old_price
              ).replace(
                ".",
                ","
              ),

        category:
          product.category,

        affiliateUrl:
          product.affiliate_url,

        soldText:
          product.sold_text ??
          "",

        featured:
          product.featured,

        active:
          product.active,
      };

      setSlug(
        product.slug
      );

      setCurrentImageUrl(
        product.image_url
      );

      setForm(
        nextForm
      );

      setOriginalForm(
        nextForm
      );

      setLoadingProduct(
        false
      );
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    supabase,
  ]);

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
    if (!hasChanges) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      event.preventDefault();
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasChanges]);

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
    switch (
      file.type
    ) {
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

  function getStoragePath(
    imageUrl: string
  ) {
    const marker =
      "/storage/v1/object/public/product-images/";

    const index =
      imageUrl.indexOf(
        marker
      );

    if (
      index === -1
    ) {
      return null;
    }

    return decodeURIComponent(
      imageUrl
        .slice(
          index +
            marker.length
        )
        .split("?")[0]
    );
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
        [key]:
          value,
      })
    );

    setError(null);
    setSuccess(null);
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
        .neq(
          "id",
          id
        )
        .limit(1);

    if (
      duplicateError
    ) {
      throw duplicateError;
    }

    if (
      data &&
      data.length >
        0
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

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError(null);
    setSuccess(null);

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

    setImageFile(
      file
    );

    setPreviewUrl(
      localPreview
    );
  }

  function removeNewImage() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (
      !hasChanges
    ) {
      setError(
        "Nie wprowadzono żadnych zmian."
      );

      return;
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
      setError(
        "Uzupełnij pełną i krótką nazwę produktu."
      );

      return;
    }

    if (
      !description
    ) {
      setError(
        "Dodaj opis produktu."
      );

      return;
    }

    if (
      !category
    ) {
      setError(
        "Wybierz kategorię."
      );

      return;
    }

    if (
      price === null ||
      price <= 0
    ) {
      setError(
        "Podaj poprawną cenę większą od 0."
      );

      return;
    }

    if (
      form.oldPrice.trim() &&
      (
        oldPrice === null ||
        oldPrice <= 0
      )
    ) {
      setError(
        "Stara cena jest niepoprawna."
      );

      return;
    }

    if (
      oldPrice !==
        null &&
      oldPrice <=
        price
    ) {
      setError(
        "Stara cena powinna być wyższa od aktualnej ceny."
      );

      return;
    }

    if (
      !affiliateUrl ||
      !isValidHttpsUrl(
        affiliateUrl
      )
    ) {
      setError(
        "Podaj poprawny link afiliacyjny rozpoczynający się od https://"
      );

      return;
    }

    setSaving(true);

    try {
      const duplicate =
        await checkDuplicateAffiliateUrl(
          affiliateUrl
        );

      if (
        duplicate.duplicate
      ) {
        setError(
          `Ten link afiliacyjny jest już używany przez produkt „${duplicate.productName ?? "bez nazwy"}”.`
        );

        setSaving(false);

        return;
      }
    } catch (
      duplicateError
    ) {
      console.error(
        "Błąd sprawdzania linku:",
        duplicateError
      );

      setError(
        "Nie udało się sprawdzić linku afiliacyjnego."
      );

      setSaving(false);

      return;
    }

    let nextImageUrl =
      currentImageUrl;

    let uploadedPath:
      | string
      | null =
      null;

    if (imageFile) {
      const extension =
        getExtension(
          imageFile
        );

      uploadedPath =
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
            uploadedPath,
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
        console.error(
          "Błąd uploadu zdjęcia:",
          uploadError
        );

        setError(
          "Nie udało się przesłać nowego zdjęcia."
        );

        setSaving(false);

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
            uploadedPath
          );

      nextImageUrl =
        publicUrlData.publicUrl;
    }

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "products"
        )
        .update({
          name,

          short_name:
            shortName,

          description,

          price,

          old_price:
            oldPrice,

          category,

          image_url:
            nextImageUrl,

          affiliate_url:
            affiliateUrl,

          featured:
            form.featured,

          sold_text:
            soldText ||
            null,

          active:
            form.active,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (
      updateError
    ) {
      console.error(
        "Błąd zapisu produktu:",
        updateError
      );

      if (
        uploadedPath
      ) {
        await supabase.storage
          .from(
            "product-images"
          )
          .remove([
            uploadedPath,
          ]);
      }

      setError(
        "Nie udało się zapisać zmian."
      );

      setSaving(false);

      return;
    }

    if (
      imageFile &&
      nextImageUrl !==
        currentImageUrl
    ) {
      const oldStoragePath =
        getStoragePath(
          currentImageUrl
        );

      if (
        oldStoragePath
      ) {
        const {
          error:
            deleteImageError,
        } =
          await supabase.storage
            .from(
              "product-images"
            )
            .remove([
              oldStoragePath,
            ]);

        if (
          deleteImageError
        ) {
          console.error(
            "Nie udało się usunąć starego zdjęcia:",
            deleteImageError
          );
        }
      }

      if (
        previewUrl
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setCurrentImageUrl(
        nextImageUrl
      );

      setImageFile(null);
      setPreviewUrl(null);
    }

    const savedForm: FormState = {
      name,
      shortName,
      description,
      price:
        form.price,
      oldPrice:
        form.oldPrice,
      category,
      affiliateUrl,
      soldText,
      featured:
        form.featured,
      active:
        form.active,
    };

    setForm(
      savedForm
    );

    setOriginalForm(
      savedForm
    );

    setSuccess(
      "Zmiany zostały zapisane."
    );

    setSaving(false);

    router.refresh();

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  if (
    loadingProduct
  ) {
    return (
      <main className="min-h-screen bg-stone-50">
        <AdminHeader />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="animate-pulse rounded-[30px] border border-stone-200 bg-white p-6 motion-reduce:animate-none">
            <div className="h-4 w-28 rounded bg-rose-100" />

            <div className="mt-4 h-10 w-72 max-w-full rounded-xl bg-stone-200" />

            <div className="mt-3 h-5 w-full max-w-xl rounded bg-stone-100" />

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="h-[560px] rounded-[28px] bg-stone-100" />

              <div className="h-[460px] rounded-[28px] bg-stone-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (
    error &&
    !slug
  ) {
    return (
      <main className="min-h-screen bg-stone-50">
        <AdminHeader />

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-[30px] border border-red-100 bg-red-50 p-8 text-center">
            <div className="text-4xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-black text-red-800">
              Nie udało się
              otworzyć oferty
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-700">
              {error}
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-white px-6 font-black text-red-700 shadow-sm"
            >
              ← Wróć do panelu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const visibleImage =
    previewUrl ??
    currentImageUrl;

  return (
    <main className="min-h-screen bg-stone-50 pb-28 text-stone-900 lg:pb-0">
      <AdminHeader />

      <AdminFormShell
        eyebrow="Edycja oferty"
        title="Edytuj produkt"
        description="Zaktualizuj dane produktu, zdjęcie, cenę i widoczność. Adres produktu pozostaje bez zmian."
      >
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {hasChanges ? (
            <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
              ● Niezapisane zmiany
            </span>
          ) : (
            <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
              ✓ Wszystko zapisane
            </span>
          )}

          {form.active ? (
            <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
              Oferta aktywna
            </span>
          ) : (
            <span className="rounded-full bg-stone-200 px-4 py-2 text-xs font-black text-stone-600">
              Oferta ukryta
            </span>
          )}

          {form.featured && (
            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-700">
              🔥 Gorąca okazja
            </span>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm leading-6 text-stone-500 shadow-sm">
          <p>
            <strong className="text-stone-800">
              Adres produktu:
            </strong>{" "}
            /produkt/{slug}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Adres pozostaje
            niezmieniony podczas
            edycji, aby wcześniejsze
            linki nadal działały.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-[28px] border border-green-200 bg-green-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                ✓
              </div>

              <div>
                <h2 className="text-lg font-black text-green-900">
                  {success}
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Oferta została
                  zaktualizowana.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {form.active && (
                    <Link
                      href={`/produkt/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-xl bg-green-700 px-5 text-sm font-black text-white"
                    >
                      Zobacz produkt ↗
                    </Link>
                  )}

                  <Link
                    href="/admin"
                    className="inline-flex min-h-11 items-center rounded-xl border border-green-200 bg-white px-5 text-sm font-black text-green-800"
                  >
                    Wróć do panelu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <form
            id="edit-product-form"
            onSubmit={
              handleSubmit
            }
            className="space-y-7 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <FormSection
              number="1"
              title="Podstawowe informacje"
            >
              <Input
                label="Pełna nazwa produktu"
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
                required
              />

              <Input
                label="Krótka nazwa"
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
                required
              />

              <div>
                <label className="mb-2 block text-sm font-black text-stone-800">
                  Opis
                </label>

                <textarea
                  required
                  rows={6}
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
                  className="w-full resize-y rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />

                <p className="mt-2 text-xs leading-5 text-stone-400">
                  Unikaj
                  krótkotrwałych
                  kodów i promocji,
                  które szybko mogą
                  stracić ważność.
                </p>
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
                <label className="mb-2 block text-sm font-black text-stone-800">
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
                  {!CATEGORIES.includes(
                    form.category
                  ) &&
                    form.category && (
                      <option
                        value={
                          form.category
                        }
                      >
                        {
                          form.category
                        }
                      </option>
                    )}

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
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
                <img
                  src={
                    visibleImage
                  }
                  alt="Podgląd produktu"
                  className="mx-auto max-h-[520px] w-full object-contain"
                />
              </div>

              {imageFile && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-900">
                    Nowe zdjęcie
                    zostanie zapisane
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-700">
                        {
                          imageFile.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        {(
                          imageFile.size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        removeNewImage
                      }
                      className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-black text-amber-800 shadow-sm"
                    >
                      Cofnij
                    </button>
                  </div>
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-5 py-8 text-center transition hover:border-rose-400 hover:bg-rose-50">
                <div className="text-3xl">
                  📷
                </div>

                <p className="mt-2 font-black">
                  Zmień zdjęcie
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
            </FormSection>

            <FormSection
              number="4"
              title="Link i widoczność"
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
                    Produkt pojawi
                    się również w
                    wyróżnionej
                    sekcji strony
                    głównej.
                  </p>
                </div>
              </label>

              <label
                className={[
                  "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition",
                  form.active
                    ? "border-green-100 bg-green-50"
                    : "border-stone-200 bg-stone-100",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={
                    form.active
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "active",
                      event.target
                        .checked
                    )
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-green-600"
                />

                <div>
                  <p className="font-black">
                    {form.active
                      ? "✅ Oferta opublikowana"
                      : "🙈 Oferta ukryta"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    {form.active
                      ? "Produkt jest widoczny dla użytkowników."
                      : "Produkt pozostaje w panelu, ale nie jest widoczny publicznie."}
                  </p>
                </div>
              </label>
            </FormSection>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                {error}
              </div>
            )}

            <div className="hidden gap-3 lg:flex">
              <button
                type="submit"
                disabled={
                  saving ||
                  !hasChanges
                }
                className="flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving
                  ? "Zapisywanie..."
                  : hasChanges
                    ? "Zapisz zmiany"
                    : "Brak zmian"}
              </button>

              <Link
                href="/admin"
                className="flex min-h-14 items-center justify-center rounded-2xl border border-stone-200 bg-white px-7 font-black text-stone-600 transition hover:border-rose-200 hover:text-rose-700"
              >
                Anuluj
              </Link>
            </div>
          </form>

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
                Boolean(
                  visibleImage
                )
              }
            />

            <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                    Podgląd
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Widok produktu
                  </h2>
                </div>

                {form.active && (
                  <Link
                    href={`/produkt/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black text-rose-600 hover:text-rose-700"
                  >
                    Otwórz ↗
                  </Link>
                )}
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
                  visibleImage
                }
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs leading-6 text-stone-500">
              <strong className="text-stone-800">
                Ważne:
              </strong>{" "}
              zmiana nazwy nie
              zmienia adresu URL
              produktu. Dzięki temu
              opublikowane wcześniej
              linki nadal prowadzą
              do tej samej oferty.
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
            form="edit-product-form"
            disabled={
              saving ||
              !hasChanges
            }
            className="flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving
              ? "Zapisywanie..."
              : hasChanges
                ? "Zapisz zmiany"
                : "Brak zmian"}
          </button>
        </div>
      </div>
    </main>
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