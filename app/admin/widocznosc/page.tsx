import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import IndexNowQueuePanel from "@/components/admin/IndexNowQueuePanel";

import {
  getIndexNowConfig,
} from "@/lib/indexnow";

import {
  getSiteUrl,
} from "@/lib/site";

import {
  createClient,
} from "@/lib/supabase/server";

type QueueRow = {
  id: number;

  path: string;

  reason: string;

  created_at: string;

  submitted_at:
    | string
    | null;

  last_status:
    | number
    | null;

  last_error:
    | string
    | null;
};

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}

function reasonLabel(
  value: string
) {
  const labels:
    Record<
      string,
      string
    > = {
    "product-created":
      "Nowy produkt",

    "product-updated":
      "Aktualizacja produktu",

    "product-published":
      "Publikacja produktu",

    "product-hidden":
      "Ukrycie produktu",

    "product-deleted":
      "Usunięcie produktu",

    "old-product-url-changed":
      "Zmiana adresu",

    "catalog-changed":
      "Zmiana katalogu",

    "homepage-changed":
      "Zmiana strony głównej",

    "category-changed":
      "Zmiana kategorii",
  };

  return (
    labels[
      value
    ] ??
    "Zmiana strony"
  );
}

export default async function VisibilityPage() {
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

  if (!userId) {
    redirect(
      "/login"
    );
  }

  const {
    data:
      admin,
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

  if (!admin) {
    redirect(
      "/login"
    );
  }

  const [
    pendingResult,
    failedResult,
    recentResult,
    productResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "search_index_queue"
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
        .is(
          "submitted_at",
          null
        ),

      supabase
        .from(
          "search_index_queue"
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
        .is(
          "submitted_at",
          null
        )
        .not(
          "last_error",
          "is",
          null
        ),

      supabase
        .from(
          "search_index_queue"
        )
        .select(
          "id, path, reason, created_at, submitted_at, last_status, last_error"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(
          12
        ),

      supabase
        .from(
          "products"
        )
        .select(
          "id, category"
        )
        .eq(
          "active",
          true
        ),
    ]);

  const indexNow =
    getIndexNowConfig();

  const siteUrl =
    getSiteUrl();

  const activeProducts =
    productResult.data ??
    [];

  const categories =
    new Set(
      activeProducts
        .map(
          (
            product
          ) =>
            product.category
        )
        .filter(
          Boolean
        )
    );

  const googleConfigured =
    Boolean(
      process.env
        .NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
        ?.trim()
    );

  const pinterestConfigured =
    Boolean(
      process.env
        .NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION
        ?.trim()
    );

  const recent =
    (
      recentResult.data ??
      []
    ) as QueueRow[];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <AdminHeader />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
            Widoczność 2.1
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            Wyszukiwarki i udostępnianie
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
            Tutaj kontrolujesz
            techniczną widoczność
            strony. Publikowanie
            produktów działa
            niezależnie od tych
            mechanizmów.
          </p>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatusCard
            title="Aktywne produkty"
            value={String(
              activeProducts.length
            )}
            good
          />

          <StatusCard
            title="Kategorie"
            value={String(
              categories.size
            )}
            good
          />

          <StatusCard
            title="Google"
            value={
              googleConfigured
                ? "Zweryfikowane"
                : "Sprawdź"
            }
            good={
              googleConfigured
            }
          />

          <StatusCard
            title="IndexNow"
            value={
              indexNow.configured
                ? "Aktywne"
                : "Konfiguracja"
            }
            good={
              indexNow.configured
            }
          />
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <IndexNowQueuePanel
            configured={
              indexNow.configured
            }
            pendingCount={
              pendingResult.count ??
              0
            }
            failedCount={
              failedResult.count ??
              0
            }
          />

          <section className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.13em] text-rose-600">
              Techniczne SEO
            </p>

            <h2 className="mt-1 text-xl font-black">
              Stan strony
            </h2>

            <div className="mt-5 space-y-3">
              <CheckRow
                label="Sitemap XML"
                description="Aktywne produkty i kategorie"
                ok
                href={`${siteUrl}/sitemap.xml`}
              />

              <CheckRow
                label="robots.txt"
                description="Wskazuje sitemapę i chroni panel"
                ok
                href={`${siteUrl}/robots.txt`}
              />

              <CheckRow
                label="Product JSON-LD"
                description="Dane strukturalne na stronach produktów"
                ok
              />

              <CheckRow
                label="Breadcrumbs"
                description="Okruszki oraz BreadcrumbList"
                ok
              />

              <CheckRow
                label="Duże podglądy obrazów"
                description="max-image-preview: large"
                ok
              />

              <CheckRow
                label="Pinterest"
                description="Weryfikacja domeny"
                ok={
                  pinterestConfigured
                }
              />

              <CheckRow
                label="Plik IndexNow"
                description="Potwierdzenie domeny dla IndexNow"
                ok={
                  indexNow.configured
                }
                href={
                  indexNow.validKey
                    ? `${siteUrl}/indexnow-key.txt`
                    : undefined
                }
              />
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em] text-rose-600">
                Historia
              </p>

              <h2 className="mt-1 text-xl font-black">
                Ostatnie zmiany dla wyszukiwarek
              </h2>

              <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">
                Pokazujemy tylko
                zmiany zarejestrowane
                od momentu włączenia
                systemu.
              </p>
            </div>

            <Link
              href="/admin"
              className="text-sm font-black text-rose-600 hover:text-rose-700"
            >
              ← Panel
            </Link>
          </div>

          {recent.length >
          0 ? (
            <div className="mt-5 divide-y divide-stone-100">
              {recent.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-stone-800">
                        {
                          item.path
                        }
                      </p>

                      <p className="mt-0.5 text-[10px] font-semibold text-stone-400 sm:text-xs">
                        {reasonLabel(
                          item.reason
                        )}{" "}
                        •{" "}
                        {formatDate(
                          item.created_at
                        )}
                      </p>
                    </div>

                    <span
                      className={[
                        "w-fit shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black",
                        item.submitted_at
                          ? "bg-green-50 text-green-700"
                          : item.last_error
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700",
                      ].join(
                        " "
                      )}
                    >
                      {item.submitted_at
                        ? "✓ Wysłano"
                        : item.last_error
                          ? "⚠ Ponowimy"
                          : "Oczekuje"}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-[16px] border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center">
              <p className="text-sm font-black text-stone-700">
                Brak nowych zmian
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-400">
                To prawidłowe.
                Nie wysyłamy
                hurtowo starych
                adresów.
              </p>
            </div>
          )}
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm transition hover:border-rose-200"
          >
            <p className="text-sm font-black">
              Google Search Console ↗
            </p>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              Indeksowanie, wyniki
              wyszukiwania i problemy
              techniczne Google.
            </p>
          </a>

          <a
            href="https://www.bing.com/webmasters/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm transition hover:border-rose-200"
          >
            <p className="text-sm font-black">
              Bing Webmaster Tools ↗
            </p>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              Tutaj możesz później
              obserwować również
              aktywność IndexNow.
            </p>
          </a>
        </section>
      </div>
    </main>
  );
}

function StatusCard({
  title,
  value,
  good,
}: {
  title: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm">
      <span
        className={[
          "inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
          good
            ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700",
        ].join(
          " "
        )}
      >
        {good
          ? "✓"
          : "!"}
      </span>

      <p className="mt-3 text-xs font-black text-stone-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-black text-stone-900">
        {value}
      </p>
    </div>
  );
}

function CheckRow({
  label,
  description,
  ok,
  href,
}: {
  label: string;
  description: string;
  ok: boolean;
  href?: string;
}) {
  const content = (
    <>
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
          ok
            ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700",
        ].join(
          " "
        )}
      >
        {ok
          ? "✓"
          : "!"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-stone-800 sm:text-sm">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-stone-400 sm:text-xs">
          {description}
        </p>
      </div>

      {href && (
        <span className="text-xs font-black text-rose-600">
          ↗
        </span>
      )}
    </>
  );

  if (
    href
  ) {
    return (
      <a
        href={
          href
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 transition hover:border-rose-100 hover:bg-rose-50/30"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
      {content}
    </div>
  );
}