import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import EditProductForm from "@/components/admin/EditProductForm";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase =
    await createClient();

  const { data: authData } =
    await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const {
    data: product,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    notFound();
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
              Edycja oferty
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
            ✏️ Edycja
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Edytuj ofertę
          </h1>

          <p className="mt-2 text-stone-500">
            Zmień cenę, opis, zdjęcie,
            status lub link afiliacyjny.
          </p>
        </div>

        <EditProductForm
          product={{
            id: product.id,
            name: product.name,
            shortName:
              product.short_name,
            description:
              product.description,
            price: Number(
              product.price
            ),
            oldPrice:
              product.old_price ===
              null
                ? null
                : Number(
                    product.old_price
                  ),
            category:
              product.category,
            imageUrl:
              product.image_url,
            affiliateUrl:
              product.affiliate_url,
            featured:
              product.featured,
            soldText:
              product.sold_text,
            active:
              product.active,
          }}
        />
      </div>
    </main>
  );
}