"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

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

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [successSlug, setSuccessSlug] =
    useState<string | null>(null);

  const [shortName, setShortName] =
    useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function parsePrice(
    value: FormDataEntryValue | null
  ) {
    const normalized = String(
      value ?? ""
    )
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

    if (!normalized) {
      return null;
    }

    const parsed =
      Number(normalized);

    return Number.isFinite(parsed)
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

  function isValidHttpUrl(
    value: string
  ) {
    try {
      const url =
        new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  async function createUniqueSlug(
    baseSlug: string
  ) {
    const supabase =
      createClient();

    let candidate =
      baseSlug;

    let counter = 2;

    while (true) {
      const {
        data,
        error: slugError,
      } = await supabase
        .from("products")
        .select("id")
        .eq("slug", candidate)
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

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError(null);
    setSuccessSlug(null);

    const file =
      event.target.files?.[0] ??
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

      event.target.value = "";

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "Zdjęcie może mieć maksymalnie 5 MB."
      );

      event.target.value = "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const localPreview =
      URL.createObjectURL(file);

    setImageFile(file);
    setPreviewUrl(localPreview);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formElement =
      event.currentTarget;

    setError(null);
    setSuccessSlug(null);

    if (!imageFile) {
      setError(
        "Dodaj zdjęcie produktu."
      );

      return;
    }

    setLoading(true);

    const form =
      new FormData(
        formElement
      );

    const name =
      String(
        form.get("name") ?? ""
      ).trim();

    const submittedShortName =
      String(
        form.get("shortName") ??
          ""
      ).trim();

    const description =
      String(
        form.get(
          "description"
        ) ?? ""
      ).trim();

    const category =
      String(
        form.get("category") ??
          ""
      ).trim();

    const affiliateUrl =
      String(
        form.get(
          "affiliateUrl"
        ) ?? ""
      ).trim();

    const soldText =
      String(
        form.get("soldText") ??
          ""
      ).trim();

    const price =
      parsePrice(
        form.get("price")
      );

    const oldPriceRaw =
      String(
        form.get("oldPrice") ??
          ""
      ).trim();

    const oldPrice =
      oldPriceRaw
        ? parsePrice(oldPriceRaw)
        : null;

    const featured =
      form.get("featured") ===
      "on";

    if (
      !name ||
      !submittedShortName
    ) {
      setError(
        "Uzupełnij pełną i krótką nazwę produktu."
      );

      setLoading(false);

      return;
    }

    if (!description) {
      setError(
        "Dodaj opis produktu."
      );

      setLoading(false);

      return;
    }

    if (!category) {
      setError(
        "Wybierz kategorię."
      );

      setLoading(false);

      return;
    }

    if (
      price === null ||
      price < 0
    ) {
      setError(
        "Podaj poprawną cenę. Możesz użyć przecinka, np. 38,35."
      );

      setLoading(false);

      return;
    }

    if (
      oldPriceRaw &&
      (oldPrice === null ||
        oldPrice < 0)
    ) {
      setError(
        "Stara cena jest niepoprawna."
      );

      setLoading(false);

      return;
    }

    if (
      oldPrice !== null &&
      oldPrice <= price
    ) {
      setError(
        "Stara cena powinna być wyższa od aktualnej ceny."
      );

      setLoading(false);

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

      setLoading(false);

      return;
    }

    const baseSlug =
      slugify(
        submittedShortName ||
          name
      );

    if (!baseSlug) {
      setError(
        "Nie udało się utworzyć adresu produktu z podanej nazwy."
      );

      setLoading(false);

      return;
    }

    const supabase =
      createClient();

    let slug: string;

    try {
      slug =
        await createUniqueSlug(
          baseSlug
        );
    } catch (slugError) {
      console.error(
        "Błąd sprawdzania sluga:",
        slugError
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
      error: uploadError,
    } = await supabase.storage
      .from("product-images")
      .upload(
        filePath,
        imageFile,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            imageFile.type,
        }
      );

    if (uploadError) {
      console.error(
        "Błąd uploadu:",
        uploadError
      );

      setError(
        "Nie udało się przesłać zdjęcia do Supabase."
      );

      setLoading(false);

      return;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageUrl =
      publicUrlData.publicUrl;

    const {
      error: insertError,
    } = await supabase
      .from("products")
      .insert({
        slug,
        name,
        short_name:
          submittedShortName,
        description,
        price,
        old_price:
          oldPrice,
        category,
        image_url:
          imageUrl,
        affiliate_url:
          affiliateUrl,
        featured,
        sold_text:
          soldText || null,
        active: true,
      });

    if (insertError) {
      console.error(
        "Błąd dodawania produktu:",
        insertError
      );

      await supabase.storage
        .from("product-images")
        .remove([
          filePath,
        ]);

      setError(
        insertError.code ===
          "23505"
          ? "Produkt o takim adresie już istnieje."
          : "Nie udało się dodać produktu."
      );

      setLoading(false);

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    formElement.reset();

    setShortName("");
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
    slugify(shortName);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-2xl font-black">
              Trend za Mniej
            </p>

            <p className="text-sm text-stone-500">
              Dodawanie oferty
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
            🛍️ Nowa okazja
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Dodaj produkt
          </h1>

          <p className="mt-2 leading-7 text-stone-500">
            Dodaj zdjęcie, opis,
            cenę i link afiliacyjny.
            Cena może być wpisana
            zarówno jako 38,35,
            jak i 38.35.
          </p>
        </div>

        {successSlug && (
          <div className="mb-7 rounded-3xl border border-green-200 bg-green-50 p-6">
            <p className="text-lg font-black text-green-800">
              ✅ Oferta została
              opublikowana
            </p>

            <p className="mt-2 text-sm leading-6 text-green-700">
              Produkt jest już
              zapisany i aktywny.
              Formularz został
              wyczyszczony, więc
              możesz od razu dodać
              kolejną ofertę.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/produkt/${successSlug}`}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Zobacz produkt →
              </Link>

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
            placeholder="Attitoon damska bordowa bluza z kapturem oversize"
            required
          />

          <div>
            <Input
              label="Krótka nazwa"
              name="shortName"
              placeholder="Bordowa bluza oversize z kapturem"
              value={shortName}
              onChange={(event) =>
                setShortName(
                  event.target.value
                )
              }
              required
            />

            <div className="mt-2 rounded-xl bg-stone-50 px-4 py-3 text-xs text-stone-500">
              <span className="font-bold text-stone-700">
                Adres produktu:
              </span>{" "}
              {slugPreview
                ? `/produkt/${slugPreview}`
                : "/produkt/..."}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Opis
            </label>

            <textarea
              name="description"
              required
              rows={5}
              placeholder="Opisz produkt, jego styl, zastosowanie i najważniejsze cechy..."
              className="w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />

            <p className="mt-2 text-xs leading-5 text-stone-400">
              Nie wpisuj
              krótkotrwałych kuponów
              ani procentu rabatu,
              jeśli nie chcesz później
              aktualizować oferty.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Cena"
              name="price"
              type="text"
              inputMode="decimal"
              placeholder="38,35"
              required
            />

            <Input
              label="Stara cena (opcjonalnie)"
              name="oldPrice"
              type="text"
              inputMode="decimal"
              placeholder="59,99"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Kategoria
            </label>

            <select
              name="category"
              required
              defaultValue=""
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            >
              <option
                value=""
                disabled
              >
                Wybierz kategorię
              </option>

              {CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Zdjęcie produktu
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-6 py-10 text-center transition hover:border-rose-400 hover:bg-rose-50">
              <div className="text-4xl">
                📷
              </div>

              <p className="mt-3 font-bold">
                Kliknij i wybierz
                zdjęcie
              </p>

              <p className="mt-1 text-sm text-stone-500">
                JPG, PNG lub WebP •
                maks. 5 MB
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
              <div className="mt-5 overflow-hidden rounded-3xl border border-rose-100 bg-stone-100">
                <img
                  src={previewUrl}
                  alt="Podgląd produktu"
                  className="mx-auto max-h-[500px] w-full object-contain"
                />
              </div>
            )}

            {imageFile && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                <span className="truncate font-medium text-stone-700">
                  {imageFile.name}
                </span>

                <span className="ml-4 shrink-0 text-stone-400">
                  {(
                    imageFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Twój link afiliacyjny SHEIN"
              name="affiliateUrl"
              type="url"
              placeholder="https://onelink.shein.com/..."
              required
            />

            <p className="mt-2 text-xs leading-5 text-stone-400">
              Wklej pełny link
              afiliacyjny wygenerowany
              dla produktu.
            </p>
          </div>

          <Input
            label="Informacja o sprzedaży (opcjonalnie)"
            name="soldText"
            placeholder="np. 200+ sprzedanych"
          />

          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <input
              type="checkbox"
              name="featured"
              defaultChecked
              className="mt-0.5 h-5 w-5 shrink-0 accent-rose-600"
            />

            <div>
              <p className="font-bold">
                🔥 Gorąca okazja
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                Produkt pojawi się
                również w sekcji
                „Gorące okazje” na
                stronie głównej.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-4 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Publikowanie..."
              : "Opublikuj ofertę"}
          </button>

          <p className="text-center text-xs leading-5 text-stone-400">
            Po publikacji oferta jest
            od razu oznaczona jako
            aktywna.
          </p>
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