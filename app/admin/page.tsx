import Link from "next/link";
import { redirect } from "next/navigation";

import AdminProductList from "@/components/admin/AdminProductList";

import {
  createClient,
} from "@/lib/supabase/server";

type ProductStatRow = {
  product_id: string;
  clicks: number | string;
};

export default async function AdminPage() {
  const supabase =
    await createClient();

  const { data: authData } =
    await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const [
    productsResult,
    clicksResult,
    todayClicksResult,
    productStatsResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      ),

    supabase
      .from(
        "affiliate_clicks"
      )
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "affiliate_clicks"
      )
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "created_at",
        today.toISOString()
      ),

    supabase.rpc(
      "get_product_click_stats",
      {
        p_days: 30,
      }
    ),
  ]);

  const products =
    productsResult.data ??
    [];

  const activeProducts =
    products.filter(
      (product) =>
        product.active
    ).length;

  const hiddenProducts =
    products.length -
    activeProducts;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured
    ).length;

  const totalClicks =
    clicksResult.count ??
    0;

  const todayClicks =
    todayClicksResult.count ??
    0;

  const productStats = (
    (
      productStatsResult.data ??
      []
    ) as ProductStatRow[]
  ).reduce<
    Record<string, number>
  >(
    (
      result,
      item
    ) => {
      result[
        item.product_id
      ] =
        Number(
          item.clicks
        );

      return result;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-2xl font-black">
              Trend za Mniej
            </p>

            <p className="text-sm text-stone-500">
              Panel
              administratora
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold transition hover:border-rose-300 hover:text-rose-600"
            >
              Zobacz stronę
            </Link>

            <form
              action="/auth/signout"
              method="post"
            >
              <button
                type="submit"
                className="rounded-full bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
              >
                Wyloguj
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-rose-600">
              ✨ Centrum
              zarządzania
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Panel Trend za
              Mniej
            </h1>

            <p className="mt-2 text-stone-500">
              Zarządzaj ofertami
              i obserwuj
              zainteresowanie
              użytkowników.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/statystyki"
              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-7 py-4 font-bold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50"
            >
              📊 Statystyki
            </Link>

            <Link
              href="/admin/nowa-oferta"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              + Dodaj nową ofertę
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            icon="🛍️"
            title="Wszystkie produkty"
            value={
              products.length
            }
          />

          <StatCard
            icon="✅"
            title="Opublikowane"
            value={
              activeProducts
            }
          />

          <StatCard
            icon="🙈"
            title="Ukryte"
            value={
              hiddenProducts
            }
          />

          <StatCard
            icon="🔥"
            title="Gorące okazje"
            value={
              featuredProducts
            }
          />

          <StatCard
            icon="🖱️"
            title="Kliknięcia łącznie"
            value={
              totalClicks
            }
          />

          <StatCard
            icon="📈"
            title="Kliknięcia dzisiaj"
            value={
              todayClicks
            }
          />
        </section>

        <AdminProductList
          products={
            products
          }
          productStats={
            productStats
          }
        />
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-stone-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}