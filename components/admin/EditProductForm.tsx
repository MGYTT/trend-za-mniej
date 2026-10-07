"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type Product = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  oldPrice: number | null;
  category: string;
  imageUrl: string;
  affiliateUrl: string;
  featured: boolean;
  soldText: string | null;
  active: boolean;
};

type Props = {
  product: Product;
};

function slugify(value: string) {
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

function getStoragePath(
  imageUrl: string
) {
  const marker =
    "/storage/v1/object/public/product-images/";

  const index =
    imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl
      .slice(index + marker.length)
      .split("?")[0]
  );
}

export default function EditProductForm({
  product,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState(product.imageUrl);

  useEffect(() => {
    return () => {
      if (
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError(null);

    const file =
      event.target.files?.[0] ??
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
        "Dozwolone są tylko JPG, PNG i WebP."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      setError(
        "Zdjęcie może mieć maksymalnie 5 MB."
      );

      event.target.value = "";

      return;
    }

    if (
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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
      form.get("affiliateUrl") ??
        ""
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
      form.get("featured") ===
      "on";

    const active =
      form.get("active") === "on";

    const slug = slugify(
      shortName || name
    );

    const supabase =
      createClient();

    let imageUrl =
      product.imageUrl;

    let newStoragePath:
      | string
      | null = null;

    if (imageFile) {
      const extension =
        getExtension(imageFile);

      newStoragePath =
        `products/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          newStoragePath,
          imageFile,
          {
            cacheControl:
              "3600",
            upsert: false,
            contentType:
              imageFile.type,
          }
        );

      if (uploadError) {
        console.error(
          uploadError
        );

        setError(
          "Nie udało się przesłać nowego zdjęcia."
        );

        setLoading(false);

        return;
      }

      const {
        data: urlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(
          newStoragePath
        );

      imageUrl =
        urlData.publicUrl;
    }

    const {
      error: updateError,
    } = await supabase
      .from("products")
      .update({
        slug,
        name,
        short_name: shortName,
        description,
        price,
        old_price: oldPrice,
        category,
        image_url: imageUrl,
        affiliate_url:
          affiliateUrl,
        featured,
        sold_text:
          soldText || null,
        active,
      })
      .eq("id", product.id);

    if (updateError) {
      console.error(
        updateError
      );

      if (newStoragePath) {
        await supabase.storage
          .from("product-images")
          .remove([
            newStoragePath,
          ]);
      }

      setError(
        updateError.code ===
          "23505"
          ? "Inny produkt ma już taką nazwę lub adres."
          : "Nie udało się zapisać zmian."
      );

      setLoading(false);

      return;
    }

    if (
      imageFile &&
      newStoragePath
    ) {
      const oldStoragePath =
        getStoragePath(
          product.imageUrl
        );

      if (oldStoragePath) {
        await supabase.storage
          .from("product-images")
          .remove([
            oldStoragePath,
          ]);
      }
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-rose-100 bg-white p-7 shadow-sm"
    >
      <Input
        label="Pełna nazwa produktu"
        name="name"
        defaultValue={
          product.name
        }
        required
      />

      <Input
        label="Krótka nazwa"
        name="shortName"
        defaultValue={
          product.shortName
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
          rows={5}
          defaultValue={
            product.description
          }
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
          defaultValue={
            product.price
          }
          required
        />

        <Input
          label="Stara cena"
          name="oldPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={
            product.oldPrice ??
            ""
          }
        />
      </div>

      <Input
        label="Kategoria"
        name="category"
        defaultValue={
          product.category
        }
        required
      />

      <div>
        <label className="mb-2 block text-sm font-bold">
          Zdjęcie produktu
        </label>

        <div className="overflow-hidden rounded-3xl border border-rose-100 bg-stone-50">
          <img
            src={previewUrl}
            alt="Podgląd"
            className="mx-auto max-h-[500px] w-full object-contain"
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50 px-6 py-5 text-center font-bold text-rose-700 transition hover:border-rose-400">
          📷 Zmień zdjęcie

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleImageChange
            }
            className="hidden"
          />
        </label>
      </div>

      <Input
        label="Link afiliacyjny SHEIN"
        name="affiliateUrl"
        type="url"
        defaultValue={
          product.affiliateUrl
        }
        required
      />

      <Input
        label="Informacja o sprzedaży"
        name="soldText"
        defaultValue={
          product.soldText ??
          ""
        }
        placeholder="200+ sprzedanych"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl bg-rose-50 p-4">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={
              product.featured
            }
            className="h-5 w-5 accent-rose-600"
          />

          <div>
            <p className="font-bold">
              🔥 Gorąca okazja
            </p>

            <p className="text-sm text-stone-500">
              Pokaż w wyróżnionych.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-4 rounded-2xl bg-green-50 p-4">
          <input
            type="checkbox"
            name="active"
            defaultChecked={
              product.active
            }
            className="h-5 w-5 accent-green-600"
          />

          <div>
            <p className="font-bold">
              ✅ Opublikowana
            </p>

            <p className="text-sm text-stone-500">
              Produkt widoczny publicznie.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-4 text-lg font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
      >
        {loading
          ? "Zapisywanie..."
          : "Zapisz zmiany"}
      </button>
    </form>
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