"use client";

import {
  useState,
} from "react";

import type {
  AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/client";

type Props = {
  productId: string;

  ownerId:
    | string
    | null;

  members:
    AdminTeamMember[];

  onOwnerChange:
    (
      ownerId:
        string
    ) => void;

  onCommitted:
    () => void;
};

export default function AdminProductOwnerSelect({
  productId,
  ownerId,
  members,
  onOwnerChange,
  onCommitted,
}: Props) {
  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );

  const currentValue =
    ownerId ??
    "";

  async function changeOwner(
    value:
      string
  ) {
    if (
      loading ||
      !value ||
      value ===
        currentValue
    ) {
      return;
    }

    const member =
      members.find(
        (
          item
        ) =>
          item.userId ===
          value
      );

    if (
      !member
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Przypisać tę ofertę do administratora „${member.displayName}”? Od tego momentu ta osoba będzie właścicielem oferty.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    const previousOwner =
      currentValue;

    /*
     * Natychmiast aktualizujemy
     * kartę produktu.
     */
    onOwnerChange(
      value
    );

    setLoading(
      true
    );

    const {
      error,
    } =
      await supabase.rpc(
        "assign_product_owner",
        {
          p_product_id:
            productId,

          p_new_owner_id:
            value,
        }
      );

    if (
      error
    ) {
      /*
       * Cofnięcie optimistic UI
       * przy błędzie.
       */
      onOwnerChange(
        previousOwner
      );

      setLoading(
        false
      );

      console.error(
        "Błąd zmiany właściciela:",
        error
      );

      window.alert(
        "Nie udało się zmienić właściciela oferty."
      );

      return;
    }

    setLoading(
      false
    );

    onCommitted();
  }

  return (
    <div className="mt-2">
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
        Właściciel oferty
      </label>

      <div className="relative">
        <select
          value={
            currentValue
          }
          disabled={
            loading
          }
          onChange={(
            event
          ) =>
            changeOwner(
              event.target
                .value
            )
          }
          className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-2.5 pr-8 text-xs font-bold text-stone-700 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
        >
          {!ownerId && (
            <option value="">
              Nieprzypisana
            </option>
          )}

          {members.map(
            (
              member
            ) => (
              <option
                key={
                  member.userId
                }
                value={
                  member.userId
                }
              >
                {
                  member.displayName
                }

                {member.role ===
                "owner"
                  ? " • właściciel"
                  : ""}
              </option>
            )
          )}
        </select>

        {loading && (
          <span className="pointer-events-none absolute right-8 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-rose-500 border-r-transparent" />
        )}
      </div>

      {loading && (
        <p className="mt-1 text-[9px] font-semibold text-stone-400">
          Synchronizacja w tle…
        </p>
      )}
    </div>
  );
}