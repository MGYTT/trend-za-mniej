"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  active: boolean;
  imageUrl: string;
};

function getStoragePath(imageUrl: string) {
  const marker =
    "/storage/v1/object/public/product-images/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl
      .slice(index + marker.length)
      .split("?")[0]
  );
}

export default function AdminProductActions({
  id,
  active,
  imageUrl,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState<string | null>(null);

  const supabase = createClient();

  async function toggleActive() {
    setLoading("toggle");

    const { error } = await supabase
      .from("products")
      .update({
        active: !active,
      })
      .eq("id", id);

    if (error) {
      alert(
        "Nie udało się zmienić widoczności produktu."
      );

      console.error(error);

      setLoading(null);

      return;
    }

    setLoading(null);
    router.refresh();
  }

  async function deleteProduct() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę ofertę? Tej operacji nie można cofnąć."
    );

    if (!confirmed) {
      return;
    }

    setLoading("delete");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "Nie udało się usunąć produktu."
      );

      console.error(error);

      setLoading(null);

      return;
    }

    const storagePath =
      getStoragePath(imageUrl);

    if (storagePath) {
      const {
        error: storageError,
      } = await supabase.storage
        .from("product-images")
        .remove([storagePath]);

      if (storageError) {
        console.error(
          "Nie udało się usunąć zdjęcia:",
          storageError
        );
      }
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/edytuj/${id}`}
        className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
      >
        ✏️ Edytuj
      </Link>

      <button
        type="button"
        onClick={toggleActive}
        disabled={loading !== null}
        className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
      >
        {loading === "toggle"
          ? "Zapisywanie..."
          : active
            ? "👁️ Ukryj"
            : "🚀 Opublikuj"}
      </button>

      <button
        type="button"
        onClick={deleteProduct}
        disabled={loading !== null}
        className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
      >
        {loading === "delete"
          ? "Usuwanie..."
          : "🗑️ Usuń"}
      </button>
    </div>
  );
}