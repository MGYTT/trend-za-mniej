"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type Props = {
  id: string;
  active: boolean;
  imageUrl: string;
};

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

export default function AdminProductActions({
  id,
  active,
  imageUrl,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState<
    "toggle" |
      "delete" |
      null
  >(null);

  const [
    supabase,
  ] = useState(
    () => createClient()
  );

  async function toggleActive() {
    setLoading(
      "toggle"
    );

    const { error } =
      await supabase
        .from("products")
        .update({
          active:
            !active,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      alert(
        "Nie udało się zmienić widoczności produktu."
      );

      console.error(
        error
      );

      setLoading(null);

      return;
    }

    setLoading(null);
    router.refresh();
  }

  async function deleteProduct() {
    const confirmed =
      window.confirm(
        "Czy na pewno chcesz usunąć tę ofertę? Produkt i jego zdjęcie zostaną usunięte. Tej operacji nie można cofnąć."
      );

    if (!confirmed) {
      return;
    }

    setLoading(
      "delete"
    );

    const { error } =
      await supabase
        .from("products")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      alert(
        "Nie udało się usunąć produktu."
      );

      console.error(
        error
      );

      setLoading(null);

      return;
    }

    const storagePath =
      getStoragePath(
        imageUrl
      );

    if (storagePath) {
      const {
        error:
          storageError,
      } =
        await supabase.storage
          .from(
            "product-images"
          )
          .remove([
            storagePath,
          ]);

      if (
        storageError
      ) {
        console.error(
          "Nie udało się usunąć zdjęcia:",
          storageError
        );
      }
    }

    setLoading(null);
    router.refresh();
  }

  const disabled =
    loading !== null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      <Link
        href={`/admin/edytuj/${id}`}
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-50"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>

        Edytuj
      </Link>

      <button
        type="button"
        onClick={
          toggleActive
        }
        disabled={
          disabled
        }
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ===
        "toggle"
          ? "Zapisywanie..."
          : active
            ? "Ukryj"
            : "Opublikuj"}
      </button>

      <button
        type="button"
        onClick={
          deleteProduct
        }
        disabled={
          disabled
        }
        className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1"
      >
        {loading ===
        "delete"
          ? "Usuwanie..."
          : "Usuń"}
      </button>
    </div>
  );
}