"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

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
  price: number | string;
  old_price:
    | number
    | string
    | null;
  category: string;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  sold_text: string | null;
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
    typeof params.id === "string"
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
  ] = useState<FormState>(
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
      } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
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

      setSlug(
        product.slug
      );

      setCurrentImageUrl(
        product.image_url
      );

      setForm({
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
      });

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
      Number(normalized);

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

  function getStoragePath(
    imageUrl: string
  ) {
    const marker =
      "/storage/v1/object/public/product-images/";

    const index =
      imageUrl.indexOf(
        marker
      );

    if (index === -1) {
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

  function isValidHttpUrl(
    value: string
  ) {
    try {
      const url =
        new URL(value);

      return (
        url.protocol ===
          "http:" ||
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
    setSuccess(null);
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

  function removeNewImage() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

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

    if (!description) {
      setError(
        "Dodaj opis produktu."
      );

      return;
    }

    if (!category) {
      setError(
        "Wybierz kategorię."
      );

      return;
    }

    if (
      price === null ||
      price < 0
    ) {
      setError(
        "Podaj poprawną cenę. Możesz użyć przecinka, np. 38,35."
      );

      return;
    }

    if (
      form.oldPrice.trim() &&
      (
        oldPrice === null ||
        oldPrice < 0
      )
    ) {
      setError(
        "Stara cena jest niepoprawna."
      );

      return;
    }

    if (
      oldPrice !== null &&
      oldPrice <= price
    ) {
      setError(
        "Stara cena powinna być wyższa od aktualnej ceny."
      );

      return;
    }

    if (
      !affiliateUrl ||
      !isValidHttpUrl(
        affiliateUrl
      )
    ) {
      setError(
        "Podaj poprawny link afiliacyjny rozpoczynający się od https://"
      );

      return;
    }

    setSaving(true);

    let nextImageUrl =
      currentImageUrl;

    let uploadedPath:
      | string
      | null = null;

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
      } = await supabase.storage
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

      if (uploadError) {
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
      } = supabase.storage
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
    } = await supabase
      .from("products")
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
      .eq("id", id);

    if (updateError) {
      console.error(
        "Błąd zapisu produktu:",
        updateError
      );

      if (uploadedPath) {
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

      if (oldStoragePath) {
        const {
          error:
            deleteImageError,
        } = await supabase.storage
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

      setCurrentImageUrl(
        nextImageUrl
      );

      removeNewImage();
    }

    setSuccess(
      "Zmiany zostały zapisane."
    );

    setSaving(false);

    router.refresh();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (
    loadingProduct
  ) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-4xl">
            ⏳
          </div>

          <p className="mt-4 font-bold text-stone-600">
            Ładowanie oferty...
          </p>
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
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <div className="text-4xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-black text-red-800">
              Nie udało się
              otworzyć oferty
            </h1>

            <p className="mt-3 text-red-700">
              {error}
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-bold text-red-700 shadow-sm"
            >
              ← Wróć do panelu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-2xl font-black">
              Trend za Mniej
            </p>

            <p className="text-sm text-stone-500">
              Edycja oferty
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-bold transition hover:border-rose-300 hover:text-rose-600"
          >
            ← Panel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p className="font-bold text-rose-600">
            ✏️ Edycja produktu
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Zmień ofertę
          </h1>

          <p className="mt-2 leading-7 text-stone-500">
            Możesz zmienić nazwę,
            opis, cenę, kategorię,
            link afiliacyjny oraz
            zdjęcie produktu.
          </p>

          <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-stone-500 shadow-sm">
            <span className="font-bold text-stone-800">
              Adres produktu:
            </span>{" "}
            /produkt/{slug}
          </div>
        </div>

        {success && (
          <div className="mb-7 rounded-3xl border border-green-200 bg-green-50 p-6">
            <p className="text-lg font-black text-green-800">
              ✅ {success}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {form.active && (
                <Link
                  href={`/produkt/${slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Zobacz produkt →
                </Link>
              )}

              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-bold text-green-800 transition hover:bg-green-100"
              >
                Wróć do panelu
              </Link>
            </div>
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6 rounded-3xl border border-rose-100 bg-white p-7 shadow-sm"
        >
          <Input
            label="Pełna nazwa produktu"
            name="name"
            value={
              form.name
            }
            onChange={(event) =>
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
            name="shortName"
            value={
              form.shortName
            }
            onChange={(event) =>
              updateField(
                "shortName",
                event.target
                  .value
              )
            }
            required
          />

          <div>
            <label className="mb-2 block text-sm font-bold">
              Opis
            </label>

            <textarea
              name="description"
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
              className="w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />

            <p className="mt-2 text-xs leading-5 text-stone-400">
              Nie wpisuj
              krótkotrwałych
              kuponów ani rabatów,
              jeśli mogą szybko
              stracić ważność.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Cena"
              name="price"
              type="text"
              inputMode="decimal"
              value={
                form.price
              }
              onChange={(event) =>
                updateField(
                  "price",
                  event.target
                    .value
                )
              }
              required
            />

            <Input
              label="Stara cena (opcjonalnie)"
              name="oldPrice"
              type="text"
              inputMode="decimal"
              value={
                form.oldPrice
              }
              onChange={(event) =>
                updateField(
                  "oldPrice",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Kategoria
            </label>

            <select
              name="category"
              required
              value={
                form.category
              }
              onChange={(event) =>
                updateField(
                  "category",
                  event.target
                    .value
                )
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            >
              <option
                value=""
                disabled
              >
                Wybierz kategorię
              </option>

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
                (category) => (
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

          <div>
            <label className="mb-2 block text-sm font-bold">
              Zdjęcie produktu
            </label>

            <div className="overflow-hidden rounded-3xl border border-rose-100 bg-stone-100">
              <img
                src={
                  previewUrl ??
                  currentImageUrl
                }
                alt="Podgląd produktu"
                className="mx-auto max-h-[520px] w-full object-contain"
              />
            </div>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-6 py-8 text-center transition hover:border-rose-400 hover:bg-rose-50">
              <div className="text-3xl">
                📷
              </div>

              <p className="mt-2 font-bold">
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

            {imageFile && (
              <div className="mt-3 rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-700">
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
                    className="shrink-0 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 transition hover:border-red-200 hover:text-red-600"
                  >
                    Anuluj zmianę
                  </button>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs leading-5 text-stone-400">
              Jeśli nie wybierzesz
              nowego zdjęcia,
              obecne pozostanie bez
              zmian.
            </p>
          </div>

          <Input
            label="Link afiliacyjny SHEIN"
            name="affiliateUrl"
            type="url"
            value={
              form.affiliateUrl
            }
            onChange={(event) =>
              updateField(
                "affiliateUrl",
                event.target
                  .value
              )
            }
            required
          />

          <Input
            label="Informacja o sprzedaży (opcjonalnie)"
            name="soldText"
            value={
              form.soldText
            }
            onChange={(event) =>
              updateField(
                "soldText",
                event.target
                  .value
              )
            }
            placeholder="np. 200+ sprzedanych"
          />

          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <input
              type="checkbox"
              checked={
                form.featured
              }
              onChange={(event) =>
                updateField(
                  "featured",
                  event.target
                    .checked
                )
              }
              className="mt-0.5 h-5 w-5 shrink-0 accent-rose-600"
            />

            <div>
              <p className="font-bold">
                🔥 Gorąca okazja
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Produkt pojawi się
                w sekcji „Gorące
                okazje” na stronie
                głównej.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-4">
            <input
              type="checkbox"
              checked={
                form.active
              }
              onChange={(event) =>
                updateField(
                  "active",
                  event.target
                    .checked
                )
              }
              className="mt-0.5 h-5 w-5 shrink-0 accent-green-600"
            />

            <div>
              <p className="font-bold">
                ✅ Oferta
                opublikowana
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Po odznaczeniu
                produkt zostanie
                ukryty na publicznej
                stronie, ale
                pozostanie w panelu.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={
                saving
              }
              className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-4 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Zapisywanie..."
                : "Zapisz zmiany"}
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-7 py-4 font-bold text-stone-600 transition hover:border-rose-300 hover:text-rose-600"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </main>
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
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
      />
    </div>
  );
}