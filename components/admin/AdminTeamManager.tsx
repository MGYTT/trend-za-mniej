"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  getAdminRoleLabel,
  type AdminRole,
  type AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/client";

type Props = {
  currentUserId:
    string;

  currentRole:
    AdminRole;

  ownerModeActive:
    boolean;

  members:
    AdminTeamMember[];
};

export default function AdminTeamManager({
  currentUserId,
  currentRole,
  ownerModeActive,
  members,
}: Props) {
  const router =
    useRouter();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    claiming,
    setClaiming,
  ] =
    useState(
      false
    );

  const currentMember =
    members.find(
      (
        member
      ) =>
        member.userId ===
        currentUserId
    );

  async function claimOwner() {
    const confirmed =
      window.confirm(
        "Aktywować to konto jako głównego właściciela systemu? Po aktywacji zwykli administratorzy będą mogli edytować tylko własne oferty."
      );

    if (
      !confirmed
    ) {
      return;
    }

    setClaiming(
      true
    );

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "claim_owner_role"
      );

    if (
      error ||
      !data
    ) {
      console.error(
        error
      );

      alert(
        "Nie udało się aktywować roli właściciela. Możliwe, że właściciel został już aktywowany na innym koncie."
      );

      setClaiming(
        false
      );

      router.refresh();

      return;
    }

    setClaiming(
      false
    );

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!ownerModeActive && (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-xl shadow-sm">
              👑
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                Konfiguracja
              </p>

              <h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-amber-950">
                Ustaw właściciela
              </h2>

              <p className="mt-2 text-xs leading-5 text-amber-800 sm:text-sm sm:leading-6">
                Ten krok wykonaj
                tylko na koncie,
                które ma mieć pełną
                kontrolę nad całym
                projektem.
              </p>

              <button
                type="button"
                onClick={
                  claimOwner
                }
                disabled={
                  claiming
                }
                className="mt-4 min-h-12 w-full rounded-[15px] bg-amber-900 px-5 text-sm font-black text-white shadow-sm disabled:opacity-50 sm:w-auto"
              >
                {claiming
                  ? "Aktywowanie..."
                  : "👑 Aktywuj właściciela"}
              </button>
            </div>
          </div>
        </section>
      )}

      <MyProfileCard
        currentMember={
          currentMember
        }
      />

      {ownerModeActive &&
        currentRole ===
          "owner" && (
          <OwnerTeamSection
            currentUserId={
              currentUserId
            }
            members={
              members
            }
          />
        )}

      {ownerModeActive &&
        currentRole ===
          "editor" && (
          <section className="rounded-[24px] border border-blue-100 bg-blue-50 p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-blue-600 shadow-sm">
                <LockIcon />
              </span>

              <div>
                <p className="text-sm font-black text-blue-900">
                  Twoje uprawnienia
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700 sm:text-sm sm:leading-6">
                  Możesz dodawać
                  produkty i zarządzać
                  własnymi ofertami.
                  Oferty innych osób
                  są chronione przed
                  edycją i usunięciem.
                </p>
              </div>
            </div>
          </section>
        )}
    </div>
  );
}

function MyProfileCard({
  currentMember,
}: {
  currentMember:
    | AdminTeamMember
    | undefined;
}) {
  const router =
    useRouter();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    name,
    setName,
  ] =
    useState(
      currentMember
        ?.displayName ??
        "Administrator"
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  async function save() {
    const clean =
      name.trim();

    if (
      clean.length <
        2 ||
      clean.length >
        60
    ) {
      alert(
        "Nazwa musi mieć od 2 do 60 znaków."
      );

      return;
    }

    setSaving(
      true
    );

    const {
      error,
    } =
      await supabase.rpc(
        "update_my_admin_display_name",
        {
          p_display_name:
            clean,
        }
      );

    if (
      error
    ) {
      console.error(
        error
      );

      alert(
        "Nie udało się zapisać nazwy."
      );

      setSaving(
        false
      );

      return;
    }

    setSaving(
      false
    );

    router.refresh();
  }

  const firstLetter =
    (
      currentMember
        ?.displayName ??
      "A"
    )
      .slice(
        0,
        1
      )
      .toUpperCase();

  return (
    <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-stone-100 p-4 sm:p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-stone-950 text-base font-black text-white">
          {
            firstLetter
          }
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
            Twoje konto
          </p>

          <p className="mt-1 truncate text-lg font-black tracking-[-0.03em] text-stone-950">
            {currentMember
              ?.displayName ??
              "Administrator"}
          </p>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1.5 text-[9px] font-black",
            currentMember
              ?.role ===
              "owner"
              ? "bg-amber-100 text-amber-800"
              : "bg-blue-100 text-blue-700",
          ].join(
            " "
          )}
        >
          {getAdminRoleLabel(
            currentMember
              ?.role ??
              "editor"
          )}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-[16px] bg-stone-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-stone-700">
              Twoje oferty
            </p>

            <p className="text-lg font-black text-stone-950">
              {
                currentMember
                  ?.productCount ??
                0
              }
            </p>
          </div>
        </div>

        <label className="mt-4 block text-xs font-black text-stone-700">
          Nazwa w panelu
        </label>

        <input
          type="text"
          value={
            name
          }
          onChange={(
            event
          ) =>
            setName(
              event.target
                .value
            )
          }
          maxLength={
            60
          }
          className="mt-1.5 min-h-12 w-full rounded-[14px] border border-stone-200 bg-white px-4 text-base outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
        />

        <button
          type="button"
          onClick={
            save
          }
          disabled={
            saving
          }
          className="mt-3 min-h-12 w-full rounded-[15px] bg-stone-950 px-5 text-sm font-black text-white disabled:opacity-50 sm:w-auto"
        >
          {saving
            ? "Zapisywanie..."
            : "Zapisz nazwę"}
        </button>
      </div>
    </section>
  );
}

function OwnerTeamSection({
  currentUserId,
  members,
}: {
  currentUserId:
    string;

  members:
    AdminTeamMember[];
}) {
  const ownerCount =
    members.filter(
      (
        member
      ) =>
        member.role ===
        "owner"
    ).length;

  return (
    <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
          Uprawnienia
        </p>

        <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-stone-900">
          Administratorzy
        </h2>

        <p className="mt-1 text-xs leading-5 text-stone-400">
          Właściciel ma pełną
          kontrolę. Administrator
          zarządza własnymi ofertami.
        </p>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {members.map(
          (
            member
          ) => (
            <TeamMemberCard
              key={
                member.userId
              }
              member={
                member
              }
              currentUserId={
                currentUserId
              }
              ownerCount={
                ownerCount
              }
            />
          )
        )}
      </div>

      <div className="border-t border-stone-100 bg-stone-50 px-4 py-3">
        <p className="text-[10px] leading-5 text-stone-400">
          Usuwania administratorów
          celowo tutaj nie ma.
          Najpierw oferty powinny
          zostać przypisane do innej
          osoby.
        </p>
      </div>
    </section>
  );
}

function TeamMemberCard({
  member,
  currentUserId,
  ownerCount,
}: {
  member:
    AdminTeamMember;

  currentUserId:
    string;

  ownerCount:
    number;
}) {
  const router =
    useRouter();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  const [
    name,
    setName,
  ] =
    useState(
      member.displayName
    );

  const [
    role,
    setRole,
  ] =
    useState<AdminRole>(
      member.role
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const isLastOwner =
    member.role ===
      "owner" &&
    ownerCount ===
      1;

  const changed =
    name.trim() !==
      member.displayName ||
    role !==
      member.role;

  async function save() {
    const clean =
      name.trim();

    if (
      clean.length <
        2 ||
      clean.length >
        60
    ) {
      alert(
        "Nazwa musi mieć od 2 do 60 znaków."
      );

      return;
    }

    if (
      member.role !==
        "owner" &&
      role ===
        "owner"
    ) {
      const confirmed =
        window.confirm(
          `Nadać osobie „${clean}” rolę właściciela? Uzyska pełny dostęp do wszystkich ofert oraz zarządzania zespołem.`
        );

      if (
        !confirmed
      ) {
        return;
      }
    }

    setSaving(
      true
    );

    const {
      error,
    } =
      await supabase.rpc(
        "owner_update_admin_member",
        {
          p_user_id:
            member.userId,

          p_display_name:
            clean,

          p_role:
            role,
        }
      );

    if (
      error
    ) {
      console.error(
        error
      );

      alert(
        error.message.includes(
          "ostatniego właściciela"
        )
          ? "Nie można zdegradować ostatniego właściciela systemu."
          : "Nie udało się zapisać zmian administratora."
      );

      setSaving(
        false
      );

      router.refresh();

      return;
    }

    setSaving(
      false
    );

    router.refresh();
  }

  return (
    <article className="rounded-[20px] border border-stone-200 bg-[#f8f8f9] p-4">
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-sm font-black",
            member.role ===
            "owner"
              ? "bg-amber-100 text-amber-800"
              : "bg-blue-100 text-blue-700",
          ].join(
            " "
          )}
        >
          {member.displayName
            .slice(
              0,
              1
            )
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-black text-stone-900">
              {
                member.displayName
              }
            </p>

            {member.userId ===
              currentUserId && (
              <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black text-stone-500">
                Ty
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] font-semibold text-stone-400">
            {
              member.productCount
            }{" "}
            ofert
          </p>
        </div>

        <span
          className={[
            "rounded-full px-2.5 py-1 text-[9px] font-black",
            member.role ===
            "owner"
              ? "bg-amber-100 text-amber-800"
              : "bg-blue-100 text-blue-700",
          ].join(
            " "
          )}
        >
          {member.role ===
          "owner"
            ? "Właściciel"
            : "Admin"}
        </span>
      </div>

      <details className="mt-3 overflow-hidden rounded-[14px] border border-stone-200 bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-[10px] font-black text-stone-500">
          Edytuj użytkownika

          <span className="text-base text-stone-300">
            ›
          </span>
        </summary>

        <div className="space-y-3 border-t border-stone-100 p-3">
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
              Nazwa
            </label>

            <input
              type="text"
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event.target
                    .value
                )
              }
              maxLength={
                60
              }
              className="min-h-12 w-full rounded-[14px] border border-stone-200 bg-white px-3 text-base font-bold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.08em] text-stone-400">
              Rola
            </label>

            <select
              value={
                role
              }
              disabled={
                isLastOwner
              }
              onChange={(
                event
              ) =>
                setRole(
                  event.target
                    .value as
                    AdminRole
                )
              }
              className="min-h-12 w-full rounded-[14px] border border-stone-200 bg-white px-3 text-base font-bold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:bg-stone-100 disabled:text-stone-400 sm:text-sm"
            >
              <option value="editor">
                Administrator
              </option>

              <option value="owner">
                Właściciel
              </option>
            </select>

            {isLastOwner && (
              <p className="mt-1 text-[9px] leading-4 text-stone-400">
                Ostatni właściciel
                systemu jest chroniony.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              save
            }
            disabled={
              saving ||
              !changed
            }
            className="min-h-12 w-full rounded-[14px] bg-stone-950 px-4 text-xs font-black text-white disabled:opacity-40"
          >
            {saving
              ? "Zapisywanie..."
              : "Zapisz zmiany"}
          </button>
        </div>
      </details>
    </article>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}