"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type Props = {
  id: string;
  slug: string;
  active: boolean;
  imageUrl: string;
  canManage: boolean;

  onActiveChange:
    (
      active:
        boolean
    ) => void;

  onDeleteOptimistic:
    () => void;

  onDeleteRollback:
    () => void;

  onCommitted:
    () => void;
};

function getStoragePath(
  imageUrl:
    string
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

export default function AdminProductActions({
  id,
  slug,
  active,
  imageUrl,
  canManage,
  onActiveChange,
  onDeleteOptimistic,
  onDeleteRollback,
  onCommitted,
}: Props) {
  const [
    loading,
    setLoading,
  ] =
    useState<
      | "toggle"
      | "delete"
      | null
    >(
      null
    );

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  async function toggleActive() {
    if (
      !canManage ||
      loading
    ) {
      return;
    }

    const previousActive =
      active;

    const nextActive =
      !active;

    /*
     * Zmieniamy UI natychmiast.
     *
     * Użytkownik nie czeka na
     * Supabase ani pełne
     * odświeżenie panelu.
     */
    setLoading(
      "toggle"
    );

    onActiveChange(
      nextActive
    );

    const {
      error,
    } =
      await supabase
        .from(
          "products"
        )
        .update({
          active:
            nextActive,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      /*
       * Jeśli zapis się nie udał,
       * przywracamy poprzedni stan.
       */
      onActiveChange(
        previousActive
      );

      setLoading(
        null
      );

      console.error(
        "Błąd zmiany widoczności produktu:",
        error
      );

      window.alert(
        "Nie udało się zmienić widoczności produktu."
      );

      return;
    }

    setLoading(
      null
    );

    /*
     * Pełne dane panelu
     * synchronizujemy dopiero
     * w tle.
     */
    onCommitted();
  }

  async function deleteProduct() {
    if (
      !canManage ||
      loading
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Czy na pewno chcesz usunąć tę ofertę? Produkt i jego zdjęcie zostaną usunięte. Tej operacji nie można cofnąć."
      );

    if (
      !confirmed
    ) {
      return;
    }

    setLoading(
      "delete"
    );

    /*
     * Oferta znika z listy
     * natychmiast.
     */
    onDeleteOptimistic();

    const {
      error,
    } =
      await supabase
        .from(
          "products"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      /*
       * W razie błędu przywracamy
       * produkt na listę.
       */
      onDeleteRollback();

      console.error(
        "Błąd usuwania produktu:",
        error
      );

      window.alert(
        "Nie udało się usunąć produktu."
      );

      return;
    }

    /*
     * Usunięcie zdjęcia nie powinno
     * blokować interfejsu.
     */
    const storagePath =
      getStoragePath(
        imageUrl
      );

    if (
      storagePath
    ) {
      void supabase.storage
        .from(
          "product-images"
        )
        .remove([
          storagePath,
        ])
        .then(
          ({
            error:
              storageError,
          }) => {
            if (
              storageError
            ) {
              console.error(
                "Nie udało się usunąć zdjęcia produktu:",
                storageError
              );
            }
          }
        );
    }

    onCommitted();
  }

  if (
    !canManage
  ) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-stone-500">
            🔒 Oferta innego
            administratora
          </p>

          <p className="mt-1 text-[10px] leading-4 text-stone-400">
            Możesz ją zobaczyć
            i przygotować grafikę
            social media, ale nie
            możesz zmieniać danych
            produktu.
          </p>
        </div>

        <Link
          href={`/admin/social/${id}`}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100"
        >
          <PhoneIcon />

          Social media
        </Link>

        {active && (
          <Link
            href={`/produkt/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-600"
          >
            Zobacz ofertę ↗
          </Link>
        )}
      </div>
    );
  }

  const disabled =
    loading !==
    null;

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
      <Link
        href={`/admin/edytuj/${id}`}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-black text-white transition hover:bg-rose-700 active:scale-[0.98] sm:text-sm"
      >
        <EditIcon />

        Edytuj
      </Link>

      <Link
        href={`/admin/social/${id}`}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100 active:scale-[0.98] sm:text-sm"
      >
        <PhoneIcon />

        Social media
      </Link>

      <button
        type="button"
        onClick={
          toggleActive
        }
        disabled={
          disabled
        }
        className={[
          "flex min-h-11 items-center justify-center rounded-xl border px-2 text-xs font-black transition active:scale-[0.98] disabled:cursor-not-allowed sm:text-sm",
          active
            ? "border-stone-200 bg-white text-stone-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
          disabled
            ? "opacity-60"
            : "",
        ].join(
          " "
        )}
      >
        {loading ===
        "toggle"
          ? (
            <span className="flex items-center gap-2">
              <Spinner />

              Zapisuję
            </span>
          )
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
        className="flex min-h-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-2 text-xs font-black text-red-700 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
      >
        {loading ===
        "delete"
          ? "Usuwam…"
          : "Usuń"}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="3"
      />

      <path d="M9 6h6" />

      <circle
        cx="12"
        cy="18"
        r="1"
      />
    </svg>
  );
}