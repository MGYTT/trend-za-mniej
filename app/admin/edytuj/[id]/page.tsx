"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
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
import ProductCategorySelect from "@/components/admin/ProductCategorySelect";
import ProductPreview from "@/components/admin/ProductPreview";

import {
  isProductCategory,
} from "@/lib/product-categories";

import {
  createClient,
} from "@/lib/supabase/client";

const MAX_FILE_SIZE =
  5 *
  1024 *
  1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
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
    false,

  active:
    true,
};

export default function EditProductPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const id =
    typeof params.id ===
    "string"
      ? params.id
      : "";

  const [
    loadingProduct,
    setLoadingProduct,
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving,
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
    success,
    setSuccess,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    slug,
    setSlug,
  ] =
    useState(
      ""
    );

  const [
    currentImageUrl,
    setCurrentImageUrl,
  ] =
    useState(
      ""
    );

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
    useState<
      FormState |
      null
    >(
      null
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
    mobilePreviewOpen,
    setMobilePreviewOpen,
  ] =
    useState(
      false
    );

  const hasChanges =
    useMemo(
      () => {
        if (
          !originalForm
        ) {
          return false;
        }

        if (
          imageFile
        ) {
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
      },
      [
        form,
        originalForm,
        imageFile,
      ]
    );

  const changedSections =
    useMemo(
      () => {
        if (
          !originalForm
        ) {
          return {
            basic:
              false,

            price:
              false,

            image:
              false,

            publication:
              false,
          };
        }

        return {
          basic:
            form.name !==
              originalForm.name ||
            form.shortName !==
              originalForm.shortName ||
            form.description !==
              originalForm.description,

          price:
            form.price !==
              originalForm.price ||
            form.oldPrice !==
              originalForm.oldPrice ||
            form.category !==
              originalForm.category,

          image:
            imageFile !==
            null,

          publication:
            form.affiliateUrl !==
              originalForm.affiliateUrl ||
            form.soldText !==
              originalForm.soldText ||
            form.featured !==
              originalForm.featured ||
            form.active !==
              originalForm.active,
        };
      },
      [
        form,
        originalForm,
        imageFile,
      ]
    );

  const changedSectionsCount =
    Object.values(
      changedSections
    ).filter(
      Boolean
    ).length;

  useEffect(
    () => {
      if (
        !id
      ) {
        return;
      }

      let cancelled =
        false;

      async function loadProduct() {
        setLoadingProduct(
          true
        );

        setError(
          null
        );

        const {
          data,
          error:
            productError,
        } =
          await supabase
            .from(
              "products"
            )
            .select(
              "*"
            )
            .eq(
              "id",
              id
            )
            .maybeSingle();

        if (
          cancelled
        ) {
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
          data as
            unknown as
            ProductRow;

        const nextForm:
          FormState = {
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

      void loadProduct();

      return () => {
        cancelled =
          true;
      };
    },
    [
      id,
      supabase,
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
        !hasChanges
      ) {
        return;
      }

      function handleBeforeUnload(
        event:
          BeforeUnloadEvent
      ) {
        event.preventDefault();
      }

      window.addEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      return () =>
        window.removeEventListener(
          "beforeunload",
          handleBeforeUnload
        );
    },
    [
      hasChanges,
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
        !error ||
        !slug
      ) {
        return;
      }

      const timeout =
        window.setTimeout(
          () => {
            document
              .getElementById(
                "edit-product-error"
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
      slug,
    ]
  );

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
      index ===
      -1
    ) {
      return null;
    }

    return decodeURIComponent(
      imageUrl
        .slice(
          index +
            marker.length
        )
        .split(
          "?"
        )[0]
    );
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

    setError(
      null
    );

    setSuccess(
      null
    );
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
        .from(
          "products"
        )
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
        .limit(
          1
        );

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
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    setError(
      null
    );

    setSuccess(
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

    setImageFile(
      file
    );

    setPreviewUrl(
      URL.createObjectURL(
        file
      )
    );
  }

  function removeNewImage() {
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

    setSuccess(
      null
    );
  }

  function resetChanges() {
    if (
      !originalForm
    ) {
      return;
    }

    if (
      hasChanges &&
      !window.confirm(
        "Cofnąć wszystkie niezapisane zmiany?"
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

    setImageFile(
      null
    );

    setPreviewUrl(
      null
    );

    setForm(
      originalForm
    );

    setError(
      null
    );

    setSuccess(
      null
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      null
    );

    setSuccess(
      null
    );

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
      !category ||
      !isProductCategory(
        category
      )
    ) {
      setError(
        "Wybierz poprawną kategorię produktu."
      );

      return;
    }

    if (
      price ===
        null ||
      price <=
        0
    ) {
      setError(
        "Podaj poprawną cenę większą od 0."
      );

      return;
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

    setSaving(
      true
    );

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

        setSaving(
          false
        );

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

      setSaving(
        false
      );

      return;
    }

    let nextImageUrl =
      currentImageUrl;

    let uploadedPath:
      | string
      | null =
      null;

    if (
      imageFile
    ) {
      uploadedPath =
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

        setSaving(
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
            new Date()
              .toISOString(),
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

      setSaving(
        false
      );

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

      setImageFile(
        null
      );

      setPreviewUrl(
        null
      );
    }

    const savedForm:
      FormState = {
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

    setSaving(
      false
    );

    setMobilePreviewOpen(
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

  if (
    loadingProduct
  ) {
    return (
      <main className="min-h-screen bg-stone-50">
        <AdminHeader />

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
          <div className="animate-pulse motion-reduce:animate-none">
            <div className="h-3 w-24 rounded bg-rose-100" />

            <div className="mt-3 h-8 w-56 rounded-xl bg-stone-200" />

            <div className="mt-2 h-4 w-full max-w-lg rounded bg-stone-100" />

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-3">
                <div className="h-48 rounded-[20px] bg-white" />
                <div className="h-56 rounded-[20px] bg-white" />
                <div className="h-44 rounded-[20px] bg-white" />
              </div>

              <div className="hidden h-[520px] rounded-[20px] bg-white xl:block" />
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

        <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
          <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl">
              ⚠
            </div>

            <h1 className="mt-4 text-xl font-black text-red-900">
              Nie udało się
              otworzyć oferty
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

            <Link
              href="/admin"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-black text-red-700 shadow-sm"
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
      {mobilePreviewOpen && (
        <MobilePreview
          form={
            form
          }
          imageUrl={
            visibleImage
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
        eyebrow="Edycja oferty"
        title="Edytuj produkt"
        description="Zmień potrzebne informacje i zapisz. Adres produktu pozostanie bez zmian."
        mobileBadge="Edycja"
      >
        <EditStatus
          hasChanges={
            hasChanges
          }
          changedSectionsCount={
            changedSectionsCount
          }
          active={
            form.active
          }
          featured={
            form.featured
          }
          onReset={
            resetChanges
          }
        />

        <div className="mt-4 rounded-[18px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-stone-500">
              🔗
            </span>

            <div className="min-w-0">
              <p className="text-xs font-black text-stone-800">
                Stały adres
                produktu
              </p>

              <p className="mt-1 break-all text-xs leading-5 text-stone-500">
                /produkt/
                {slug}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-stone-400">
                Zmiana nazwy lub
                kategorii nie
                zmienia tego adresu.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            id="edit-product-error"
            className="mt-4 rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"
          >
            <span className="font-black">
              Nie można zapisać:
            </span>
            {" "}
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-[18px] border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-green-700 shadow-sm">
                ✓
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black text-green-900">
                  {success}
                </h2>

                <p className="mt-1 text-xs leading-5 text-green-700">
                  Oferta została
                  zaktualizowana.
                </p>

                {form.active && (
                  <Link
                    href={`/produkt/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-green-700 px-3 text-xs font-black text-white"
                  >
                    Zobacz produkt ↗
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-7">
          <div className="min-w-0">
            <form
              id="edit-product-form"
              onSubmit={
                handleSubmit
              }
              className="space-y-3"
            >
              <FormSection
                number="1"
                title="Nazwa i opis"
                description="Edytuj informacje prezentowane użytkownikowi."
                changed={
                  changedSections
                    .basic
                }
              >
                <Input
                  label="Pełna nazwa"
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
                  <FieldLabel>
                    Opis
                  </FieldLabel>

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
                    className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base leading-6 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
                  />

                  <p className="mt-1.5 px-1 text-[10px] leading-5 text-stone-400 sm:text-xs">
                    Unikaj kodów
                    promocyjnych i
                    informacji, które
                    szybko tracą
                    aktualność.
                  </p>
                </div>
              </FormSection>

              <FormSection
                number="2"
                title="Cena i kategoria"
                description="Zaktualizuj cenę lub wybierz dokładniejszą kategorię."
                changed={
                  changedSections
                    .price
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
                    placeholder="Opcjonalnie"
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
                number="3"
                title="Zdjęcie"
                description="Zostaw obecne albo wybierz nowe."
                changed={
                  changedSections
                    .image
                }
              >
                <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 rounded-[18px] border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[135px_minmax(0,1fr)]">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white">
                    <img
                      src={
                        visibleImage
                      }
                      alt="Podgląd produktu"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col justify-between py-1">
                    <div>
                      <p
                        className={[
                          "text-xs font-black",
                          imageFile
                            ? "text-amber-700"
                            : "text-green-700",
                        ].join(
                          " "
                        )}
                      >
                        {imageFile
                          ? "● Nowe zdjęcie"
                          : "✓ Obecne zdjęcie"}
                      </p>

                      {imageFile ? (
                        <>
                          <p className="mt-2 truncate text-xs font-semibold text-stone-700">
                            {
                              imageFile.name
                            }
                          </p>

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
                        </>
                      ) : (
                        <p className="mt-2 text-[10px] leading-5 text-stone-400 sm:text-xs">
                          Zdjęcie
                          pozostanie bez
                          zmian.
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

                      {imageFile ? (
                        <button
                          type="button"
                          onClick={
                            removeNewImage
                          }
                          className="min-h-10 rounded-xl bg-amber-50 px-2 text-xs font-black text-amber-700"
                        >
                          Cofnij
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setMobilePreviewOpen(
                              true
                            )
                          }
                          className="min-h-10 rounded-xl bg-stone-100 px-2 text-xs font-black text-stone-600 xl:hidden"
                        >
                          Podgląd
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                number="4"
                title="Link i widoczność"
                description="Kontroluj link, wyróżnienie i publikację."
                changed={
                  changedSections
                    .publication
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

                <ToggleCard
                  checked={
                    form.active
                  }
                  onChange={(
                    checked
                  ) =>
                    updateField(
                      "active",
                      checked
                    )
                  }
                  title="Widoczna publicznie"
                  description="Wyłącz, jeśli oferta ma być chwilowo ukryta."
                />

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !hasChanges
                  }
                  className="hidden min-h-12 w-full rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 lg:block"
                >
                  {saving
                    ? "Zapisywanie..."
                    : "Zapisz zmiany"}
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
                    visibleImage
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
                  visibleImage
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
                    visibleImage
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
            form="edit-product-form"
            disabled={
              saving ||
              !hasChanges
            }
            className="min-h-12 rounded-[14px] bg-rose-600 px-4 text-sm font-black text-white shadow-sm disabled:opacity-40"
          >
            {saving
              ? "Zapisywanie..."
              : "Zapisz zmiany"}
          </button>
        </div>
      </div>
    </main>
  );
}

function EditStatus({
  hasChanges,
  changedSectionsCount,
  active,
  featured,
  onReset,
}: {
  hasChanges: boolean;
  changedSectionsCount: number;
  active: boolean;
  featured: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[9px] font-black",
                active
                  ? "bg-green-50 text-green-700"
                  : "bg-stone-100 text-stone-500",
              ].join(
                " "
              )}
            >
              {active
                ? "● Aktywna"
                : "● Ukryta"}
            </span>

            {featured && (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-orange-700">
                🔥 Gorąca
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-black text-stone-800">
            {hasChanges
              ? `${changedSectionsCount} ${
                  changedSectionsCount ===
                  1
                    ? "sekcja zmieniona"
                    : "sekcje zmienione"
                }`
              : "Brak niezapisanych zmian"}
          </p>
        </div>

        {hasChanges && (
          <button
            type="button"
            onClick={
              onReset
            }
            className="min-h-10 shrink-0 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-600"
          >
            Cofnij
          </button>
        )}
      </div>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  changed,
  children,
}: {
  number: string;
  title: string;
  description: string;
  changed: boolean;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-stone-100 p-4 sm:p-5">
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] text-xs font-black",
            changed
              ? "bg-amber-100 text-amber-700"
              : "bg-stone-100 text-stone-500",
          ].join(
            " "
          )}
        >
          {changed
            ? "●"
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
  imageUrl: string;
  onClose: () => void;
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

          <div
            className={[
              "mt-3 rounded-xl px-4 py-3 text-xs font-black",
              form.active
                ? "bg-green-50 text-green-700"
                : "bg-stone-200 text-stone-600",
            ].join(
              " "
            )}
          >
            {form.active
              ? "✓ Oferta będzie widoczna publicznie"
              : "Oferta jest ukryta"}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="mt-3 min-h-12 w-full rounded-xl bg-stone-900 px-4 text-sm font-black text-white"
          >
            Wróć do edycji
          </button>
        </div>
      </div>
    </div>
  );
}