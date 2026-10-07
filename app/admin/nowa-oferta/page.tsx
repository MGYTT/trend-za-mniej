"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getExtension(file: File) {
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

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError(null);

    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);

      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Dozwolone są tylko pliki JPG, PNG i WebP."
      );

      event.target.value = "";

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Zdjęcie może mieć maksymalnie 5 MB."
      );

      event.target.value = "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
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

    if (!imageFile) {
      setError(
        "Dodaj zdjęcie produktu."
      );

      return;
    }

    setLoading(true);
    setError(null);

    const form = new FormData(
      event.currentTarget
    );

    const name = String(
      form.get("name") ?? ""
    ).trim();

    const shortName = String(
      form.get("shortName") ?? ""
    ).trim();

    const description = String(
      form.get("description") ?? ""
    ).trim();

    const category = String(
      form.get("category") ?? ""
    ).trim();

    const affiliateUrl = String(
      form.get("affiliateUrl") ?? ""
    ).trim();

    const soldText = String(
      form.get("soldText") ?? ""
    ).trim();

    const price = Number(
      form.get("price")
    );

    const oldPriceRaw = String(
      form.get("oldPrice") ?? ""
    ).trim();

    const oldPrice =
      oldPriceRaw === ""
        ? null
        : Number(oldPriceRaw);

    const featured =
      form.get("featured") === "on";

    if (!name || !shortName) {
      setError(
        "Uzupełnij nazwę produktu."
      );

      setLoading(false);

      return;
    }

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      setError(
        "Podaj poprawną cenę."
      );

      setLoading(false);

      return;
    }

    if (
      oldPrice !== null &&
      (Number.isNaN(oldPrice) ||
        oldPrice < 0)
    ) {
      setError(
        "Stara cena jest niepoprawna."
      );

      setLoading(false);

      return;
    }

    const slug = slugify(
      shortName || name
    );

    const supabase = createClient();

    const extension =
      getExtension(imageFile);

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
          shortName,
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
        .remove([filePath]);

      setError(
        insertError.code ===
          "23505"
          ? "Produkt o podobnej nazwie już istnieje."
          : "Nie udało się dodać produktu."
      );

      setLoading(false);

      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
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

          <p className="mt-2 text-stone-500">
            Dodaj zdjęcie, cenę i link afiliacyjny.
            Po zapisaniu oferta pojawi się na stronie.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6 rounded-3xl border border-rose-100 bg-white p-7 shadow-sm"
        >
          <Input
            label="Pełna nazwa produktu"
            name="name"
            placeholder="Senya damski puszysty sweter..."
            required
          />

          <Input
            label="Krótka nazwa"
            name="shortName"
            placeholder="Puszysty sweter na jesień"
            required
          />

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
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Cena"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="85.63"
              required
            />

            <Input
              label="Stara cena (opcjonalnie)"
              name="oldPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="99.99"
            />
          </div>

          <Input
            label="Kategoria"
            name="category"
            placeholder="Swetry"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-bold">
              Zdjęcie produktu
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-6 py-10 text-center transition hover:border-rose-400 hover:bg-rose-50">
              <div className="text-4xl">
                📷
              </div>

              <p className="mt-3 font-bold">
                Kliknij i wybierz zdjęcie
              </p>

              <p className="mt-1 text-sm text-stone-500">
                JPG, PNG lub WebP • maks. 5 MB
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
                  src={
                    previewUrl
                  }
                  alt="Podgląd produktu"
                  className="mx-auto max-h-[500px] w-full object-contain"
                />
              </div>
            )}

            {imageFile && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                <span className="truncate font-medium text-stone-700">
                  {
                    imageFile.name
                  }
                </span>

                <span className="ml-4 shrink-0 text-stone-400">
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
          </div>

          <Input
            label="Twój link afiliacyjny SHEIN"
            name="affiliateUrl"
            type="url"
            placeholder="https://onelink.shein.com/..."
            required
          />

          <Input
            label="Informacja o sprzedaży (opcjonalnie)"
            name="soldText"
            placeholder="200+ sprzedanych"
          />

          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <input
              type="checkbox"
              name="featured"
              className="h-5 w-5 accent-rose-600"
            />

            <div>
              <p className="font-bold">
                🔥 Gorąca okazja
              </p>

              <p className="text-sm text-stone-500">
                Produkt pojawi się również w sekcji
                „Gorące okazje”.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-4 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Publikowanie..."
              : "Opublikuj ofertę"}
          </button>
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
} & React.InputHTMLAttributes<HTMLInputElement>) {
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