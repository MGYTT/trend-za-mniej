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
  currentUserId: string;

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
  ] = useState(false);

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

    if (!confirmed) {
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
        <section className="rounded-[22px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              👑
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">
                Konfiguracja
                jednorazowa
              </p>

              <h2 className="mt-1 text-lg font-black text-amber-950">
                Wybierz głównego
                właściciela
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Obecnie system
                działa jeszcze w
                trybie zgodności i
                administratorzy mają
                dotychczasowe
                uprawnienia. Ten
                przycisk należy
                nacisnąć wyłącznie
                na koncie, które ma
                mieć pełną kontrolę
                nad projektem.
              </p>

              <button
                type="button"
                onClick={
                  claimOwner
                }
                disabled={
                  claiming
                }
                className="mt-4 min-h-11 rounded-xl bg-amber-900 px-5 text-sm font-black text-white shadow-sm disabled:opacity-50"
              >
                {claiming
                  ? "Aktywowanie..."
                  : "👑 Aktywuj mnie jako właściciela"}
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
          <section className="rounded-[20px] border border-blue-100 bg-blue-50 p-4 sm:p-5">
            <p className="text-sm font-black text-blue-900">
              Twoje uprawnienia
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700 sm:text-sm sm:leading-6">
              Jako administrator
              możesz dodawać nowe
              produkty oraz w pełni
              zarządzać ofertami,
              których jesteś
              właścicielem. Oferty
              innych osób pozostają
              widoczne, ale są
              chronione przed
              edycją, usunięciem i
              podmianą linku
              afiliacyjnego.
            </p>
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
  ] = useState(
    currentMember
      ?.displayName ??
      "Administrator"
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

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

    if (error) {
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

  return (
    <section className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
            Twoje konto
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black text-stone-600">
              {getAdminRoleLabel(
                currentMember
                  ?.role ??
                  "editor"
              )}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
              {
                currentMember
                  ?.productCount ??
                0
              }{" "}
              ofert
            </span>
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
            className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-base outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:text-sm"
          />
        </div>

        <button
          type="button"
          onClick={
            save
          }
          disabled={
            saving
          }
          className="min-h-11 rounded-xl bg-stone-900 px-5 text-sm font-black text-white disabled:opacity-50"
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
  currentUserId: string;
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
    <section className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
          Zespół
        </p>

        <h2 className="mt-1 text-xl font-black text-stone-900">
          Administratorzy
        </h2>

        <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
          Właściciel ma pełną
          kontrolę. Administrator
          zarządza tylko własnymi
          ofertami.
        </p>
      </div>

      <div className="mt-4 space-y-3">
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

      <div className="mt-4 rounded-xl bg-stone-50 p-3 text-[10px] leading-5 text-stone-500 sm:text-xs">
        Usuwania kont
        administratorów celowo
        jeszcze tutaj nie ma.
        Najpierw oferta powinna
        zostać przypisana do innej
        osoby, aby żaden produkt nie
        stracił opiekuna.
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
  ] = useState(
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
  ] = useState(false);

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

    if (error) {
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
    <div className="rounded-[16px] border border-stone-200 bg-stone-50 p-3.5">
      <div className="flex flex-wrap items-center gap-2">
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
            ? "👑 Właściciel"
            : "Administrator"}
        </span>

        {member.userId ===
          currentUserId && (
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-stone-500">
            Ty
          </span>
        )}

        <span className="text-[10px] font-bold text-stone-400">
          {
            member.productCount
          }{" "}
          ofert
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
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
            className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
            className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:bg-stone-100 disabled:text-stone-400"
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
              Ostatni właściciel jest
              chroniony.
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
          className="min-h-10 self-end rounded-xl bg-stone-900 px-4 text-xs font-black text-white disabled:opacity-40"
        >
          {saving
            ? "..."
            : "Zapisz"}
        </button>
      </div>
    </div>
  );
}