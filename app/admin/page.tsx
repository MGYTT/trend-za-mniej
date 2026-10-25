import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileDashboard from "@/components/admin/AdminMobileDashboard";
import AdminProductList from "@/components/admin/AdminProductList";
import DuplicateProtectionStatus from "@/components/admin/DuplicateProtectionStatus";

import {
  canManageOffer,
  type AdminRole,
  type AdminTeamMember,
} from "@/lib/admin-permissions";

import {
  createClient,
} from "@/lib/supabase/server";

type AdminRow = {
  user_id: string;

  display_name:
    | string
    | null;

  role:
    AdminRole;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams:
    Promise<{
      notice?: string;
      view?: string;
    }>;
}) {
  const params =
    await searchParams;
  const requestedView = params.view === "hidden" || params.view === "featured" || params.view === "active"
    ? params.view : "all";

  const supabase =
    await createClient();

  const {
    data:
      authData,
  } =
    await supabase.auth
      .getClaims();

  const userId =
    authData
      ?.claims
      ?.sub;

  if (
    !userId
  ) {
    redirect(
      "/login"
    );
  }

  /*
   * Najpierw pobieramy tylko dane
   * potrzebne do ustalenia roli.
   */
  const [
    currentAdminResult,
    ownerModeResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "admins"
        )
        .select(
          "user_id, display_name, role"
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle(),

      supabase.rpc(
        "owner_role_exists"
      ),
    ]);

  if (
    !currentAdminResult.data
  ) {
    redirect(
      "/login"
    );
  }

  const currentAdmin =
    currentAdminResult.data as
      AdminRow;

  const currentRole =
    currentAdmin.role;

  const ownerModeActive =
    Boolean(
      ownerModeResult.data
    );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * Dla właściciela lista zespołu
   * ładuje się równolegle z
   * produktami i licznikami.
   *
   * Nie czekamy najpierw na
   * produkty, a dopiero później
   * na administratorów.
   */
  const adminRowsPromise =
    currentRole ===
    "owner"
      ? supabase
          .from(
            "admins"
          )
          .select(
            "user_id, display_name, role"
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            }
          )
      : Promise.resolve({
          data: [
            currentAdmin,
          ] as AdminRow[],

          error:
            null,
        });

  /*
   * Nie używamy select("*").
   *
   * Opisy, linki afiliacyjne
   * i pozostałe duże pola nie są
   * potrzebne do listy produktów
   * w panelu.
   *
   * Statystyki poszczególnych
   * produktów pobierze już
   * AdminProductList po
   * wyświetleniu panelu.
   */
  const [
    productsResult,
    clicksResult,
    todayClicksResult,
    adminsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "products"
        )
        .select(
          "id, slug, name, short_name, price, old_price, category, image_url, featured, active, created_at, updated_at, created_by, shein_product_key, shein_identity_status"
        )
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
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        ),

      supabase
        .from(
          "affiliate_clicks"
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .gte(
          "created_at",
          today.toISOString()
        ),

      adminRowsPromise,
    ]);

  const products =
    productsResult.data ??
    [];

  const adminRows =
    (
      adminsResult.data ??
      [
        currentAdmin,
      ]
    ) as AdminRow[];

  const productCounts =
    new Map<
      string,
      number
    >();

  for (
    const product
    of products
  ) {
    if (
      !product.created_by
    ) {
      continue;
    }

    productCounts.set(
      product.created_by,
      (
        productCounts.get(
          product.created_by
        ) ??
        0
      ) +
        1
    );
  }

  const teamMembers:
    AdminTeamMember[] =
    adminRows.map(
      (
        admin
      ) => ({
        userId:
          admin.user_id,

        displayName:
          admin.display_name
            ?.trim() ||
          "Administrator",

        role:
          admin.role,

        productCount:
          productCounts.get(
            admin.user_id
          ) ??
          0,
      })
    );

  const activeProducts =
    products.filter(
      (
        product
      ) =>
        product.active
    ).length;

  const hiddenProducts =
    products.length -
    activeProducts;

  const featuredProducts =
    products.filter(
      (
        product
      ) =>
        product.featured
    ).length;

  const totalClicks =
    clicksResult.count ??
    0;

  const todayClicks =
    todayClicksResult.count ??
    0;

  const duplicateSummary = {
    total:
      products.length,

    withIdentity:
      products.filter(
        (
          product
        ) =>
          Boolean(
            product.shein_product_key
          )
      ).length,

    withoutIdentity:
      products.filter(
        (
          product
        ) =>
          !product.shein_product_key
      ).length,

    conflicts:
      products.filter(
        (
          product
        ) =>
          product.shein_identity_status ===
          "conflict"
      ).length,
  };

  const recentProducts =
    products
      .slice(
        0,
        4
      )
      .map(
        (
          product
        ) => ({
          id:
            product.id,

          slug:
            product.slug,

          shortName:
            product.short_name,

          category:
            product.category,

          imageUrl:
            product.image_url,

          price:
            product.price,

          active:
            product.active,

          featured:
            product.featured,

          canManage:
            canManageOffer({
              currentUserId:
                userId,

              currentRole,

              ownerModeActive,

              productOwnerId:
                product.created_by,
            }),
        })
      );

  const displayName =
    currentAdmin.display_name
      ?.trim() ||
    "Administrator";

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        {params.notice ===
          "foreign-offer" && (
          <div className="mb-4 rounded-[18px] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-900">
              🔒 Oferta jest
              chroniona
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800 sm:text-sm">
              Ta oferta należy do
              innego administratora.
              Możesz ją zobaczyć
              w katalogu, ale nie
              możesz zmieniać jej
              danych ani linku
              afiliacyjnego.
            </p>
          </div>
        )}

        <AdminMobileDashboard
          displayName={
            displayName
          }
          currentRole={
            currentRole
          }
          ownerModeActive={
            ownerModeActive
          }
          totalProducts={
            products.length
          }
          activeProducts={
            activeProducts
          }
          hiddenProducts={
            hiddenProducts
          }
          featuredProducts={
            featuredProducts
          }
          totalClicks={
            totalClicks
          }
          todayClicks={
            todayClicks
          }
          duplicateConflicts={
            duplicateSummary.conflicts
          }
          recentProducts={
            recentProducts
          }
        />

        <div className="hidden lg:block">
          <section aria-labelledby="desktop-dashboard-title" className="admin-desktop-workspace-hero rounded-[28px] p-7 2xl:p-9">
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">
                  Centrum zarządzania · Trend za Mniej
                </p>
                <h1 id="desktop-dashboard-title" className="mt-3 text-[clamp(1.9rem,3vw,2.8rem)] font-black leading-[1.1] tracking-[-0.055em] text-stone-950">
                  Dzień dobry, {displayName}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                  Twoje oferty, stylizacje i wyniki w jednym miejscu. Zacznij od tego, co wymaga uwagi.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
                  <span className="rounded-full border border-white bg-white px-3 py-1.5 text-rose-700 shadow-sm">
                    {currentRole === "owner" ? "Właściciel" : "Administrator"}
                  </span>
                  {ownerModeActive && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-800">
                      Kontrola własności ofert aktywna
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/nowa-oferta"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-[0_10px_26px_rgba(225,29,72,0.18)] transition hover:bg-rose-700">
                  + Dodaj ofertę
                </Link>
                <Link href="/admin/stylizacje"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 text-sm font-black text-rose-800 transition hover:bg-rose-50">
                  Kreator stylizacji →
                </Link>
              </div>
            </div>
          </section>

          <section aria-labelledby="desktop-kpis" className="mt-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="desktop-kpis" className="text-base font-black tracking-tight text-stone-950">Przegląd serwisu</h2>
              <Link href="/admin/statystyki" className="inline-flex min-h-10 items-center text-xs font-black text-rose-700 hover:underline">
                Pełne statystyki →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
              <StatCard icon="box" title="Wszystkie" value={products.length} />
              <StatCard icon="active" title="Aktywne" value={activeProducts} />
              <StatCard icon="hidden" title="Ukryte" value={hiddenProducts} />
              <StatCard icon="hot" title="Wyróżnione" value={featuredProducts} />
              <StatCard icon="click" title="Kliknięcia" value={totalClicks} subtitle="łącznie" />
              <StatCard icon="today" title="Dzisiaj" value={todayClicks} subtitle="kliknięć" />
            </div>
          </section>

          <div className="mt-7 grid items-start gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <section aria-labelledby="desktop-tasks" className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm xl:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-rose-700">Twój dzień</p>
                  <h2 id="desktop-tasks" className="mt-1 text-xl font-black tracking-tight text-stone-950">Do przejrzenia</h2>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-black text-stone-600">
                  {hiddenProducts + duplicateSummary.conflicts} pozycji
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {hiddenProducts > 0 && (
                  <Link href="/admin?view=hidden#admin-offers"
                    className="admin-desktop-dashboard-task flex min-h-16 items-center gap-4 rounded-2xl border border-stone-200 bg-[#fcfbfb] px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg text-amber-700" aria-hidden="true">◌</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-black text-stone-950">Ukryte oferty</strong>
                      <small className="mt-1 block text-xs leading-5 text-stone-500">Sprawdź produkty przed publikacją</small>
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">{hiddenProducts}</span>
                    <span aria-hidden="true" className="text-lg text-stone-400">›</span>
                  </Link>
                )}
                {duplicateSummary.conflicts > 0 && (
                  <a href="#admin-duplicate-review"
                    className="admin-desktop-dashboard-task flex min-h-16 items-center gap-4 rounded-2xl border border-stone-200 bg-[#fcfbfb] px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-lg text-rose-700" aria-hidden="true">!</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-black text-stone-950">Możliwe duplikaty</strong>
                      <small className="mt-1 block text-xs leading-5 text-stone-500">Przejrzyj oznaczone konflikty</small>
                    </span>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">{duplicateSummary.conflicts}</span>
                    <span aria-hidden="true" className="text-lg text-stone-400">›</span>
                  </a>
                )}
                {hiddenProducts === 0 && duplicateSummary.conflicts === 0 && (
                  <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700" aria-hidden="true">✓</span>
                    <p className="text-sm font-bold leading-6 text-stone-700">Nie ma ukrytych ofert ani oznaczonych konfliktów.</p>
                  </div>
                )}
              </div>
              <Link href="/admin?view=all#admin-offers" className="mt-4 inline-flex min-h-10 items-center text-xs font-black text-rose-700 hover:underline">
                Przejdź do katalogu →
              </Link>
            </section>

            <section aria-labelledby="desktop-tools" className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm xl:p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-rose-700">Skróty</p>
                <h2 id="desktop-tools" className="mt-1 text-xl font-black tracking-tight text-stone-950">Najczęstsze działania</h2>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                <QuickAction href="/admin/nowa-oferta" icon="add" title="Nowa oferta" description="Dodaj produkt do katalogu" />
                <QuickAction href="/admin/statystyki" icon="stats" title="Analityka" description="Przegląd kliknięć afiliacyjnych" />
                <QuickAction href="/admin/zespol" icon="team" title="Zespół" description="Role i właściciele ofert" />
              </div>
            </section>
          </div>

          <section id="admin-duplicate-review" aria-label="Kontrola jakości katalogu" className="mt-7 scroll-mt-28">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-black tracking-tight text-stone-950">Kontrola jakości katalogu</h2>
              <span className="text-xs text-stone-500">Diagnostyka i możliwe duplikaty</span>
            </div>
            <DuplicateProtectionStatus initialSummary={duplicateSummary} />
          </section>
        </div>

        <div
          id="admin-offers"
          className="scroll-mt-24"
        >
          <AdminProductList
            key={requestedView}
            initialStatus={requestedView}
            products={
              products
            }
            currentUserId={
              userId
            }
            currentRole={
              currentRole
            }
            ownerModeActive={
              ownerModeActive
            }
            teamMembers={
              teamMembers
            }
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon:
    | "box"
    | "active"
    | "hidden"
    | "hot"
    | "click"
    | "today";

  title:
    string;

  value:
    number;

  subtitle?:
    string;
}) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 text-rose-600">
          <StatIcon
            type={
              icon
            }
          />
        </span>

        <p className="text-2xl font-black tracking-[-0.04em] text-stone-900">
          {value}
        </p>
      </div>

      <p className="mt-3 text-xs font-black text-stone-700 sm:text-sm">
        {title}
      </p>

      {subtitle && (
        <p className="mt-0.5 text-[10px] text-stone-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href:
    string;

  icon:
    | "add"
    | "stats"
    | "team";

  title:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      className="group flex min-h-[72px] items-center gap-3 rounded-[18px] border border-stone-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-rose-600 transition group-hover:bg-rose-50">
        <QuickIcon
          type={
            icon
          }
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-stone-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-stone-500">
          {description}
        </p>
      </div>

      <span className="ml-auto text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-500">
        →
      </span>
    </Link>
  );
}

function StatIcon({
  type,
}: {
  type:
    | "box"
    | "active"
    | "hidden"
    | "hot"
    | "click"
    | "today";
}) {
  if (
    type ===
    "active"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="m5 12 4 4 10-10" />
      </svg>
    );
  }

  if (
    type ===
    "hidden"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 3 18 18" />

        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 9 4 10 8a12 12 0 0 1-2.2 4.2" />

        <path d="M6.2 6.2A11.8 11.8 0 0 0 2 12c1 4 5 8 10 8a10.8 10.8 0 0 0 3.8-.7" />
      </svg>
    );
  }

  if (
    type ===
    "hot"
  ) {
    return (
      <span className="text-sm">
        🔥
      </span>
    );
  }

  if (
    type ===
    "click"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 3 7 17 2.5-6.5L21 11Z" />
      </svg>
    );
  }

  if (
    type ===
    "today"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7 12 3l8 4-8 4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function QuickIcon({
  type,
}: {
  type:
    | "add"
    | "stats"
    | "team";
}) {
  if (
    type ===
    "add"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (
    type ===
    "team"
  ) {
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
        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <path d="M3 20a6 6 0 0 1 12 0" />

        <circle
          cx="17"
          cy="9"
          r="2"
        />

        <path d="M16 15a5 5 0 0 1 5 5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </svg>
  );
}