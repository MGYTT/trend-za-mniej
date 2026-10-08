"use client";

import type {
  FormEvent,
} from "react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(
      true
    );

    setError(
      null
    );

    const supabase =
      createClient();

    const {
      data:
        signInData,
      error:
        signInError,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });

    if (
      signInError
    ) {
      setError(
        "Nieprawidłowy e-mail lub hasło."
      );

      setLoading(
        false
      );

      return;
    }

    const userId =
      signInData.user
        ?.id;

    if (!userId) {
      await supabase.auth
        .signOut();

      setError(
        "Nie udało się potwierdzić konta administratora."
      );

      setLoading(
        false
      );

      return;
    }

    const {
      data:
        admin,
      error:
        adminError,
    } =
      await supabase
        .from(
          "admins"
        )
        .select(
          "user_id"
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle();

    if (
      adminError ||
      !admin
    ) {
      await supabase.auth
        .signOut();

      setError(
        "To konto nie ma uprawnień administratora."
      );

      setLoading(
        false
      );

      return;
    }

    const {
      error:
        activityError,
    } =
      await supabase.rpc(
        "record_admin_login",
        {
          p_path:
            "/admin",
        }
      );

    if (
      activityError
    ) {
      console.error(
        "Nie udało się zapisać logowania administratora:",
        activityError
      );
    }

    router.push(
      "/admin"
    );

    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-2xl text-white">
            ✨
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Trend za Mniej
          </h1>

          <p className="mt-2 text-stone-500">
            Panel administratora
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              required
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              placeholder="twoj@email.pl"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold"
            >
              Hasło
            </label>

            <input
              id="password"
              type="password"
              required
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target
                    .value
                )
              }
              placeholder="••••••••"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Logowanie..."
              : "Zaloguj się"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-stone-500 hover:text-rose-600"
        >
          ← Wróć na stronę
        </a>
      </div>
    </main>
  );
}