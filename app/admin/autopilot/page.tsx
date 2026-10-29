import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import AdminHeader from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/server";
import { polishToday } from "@/lib/offer-lifecycle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Centrum Autopilota",
  robots: { index: false, follow: false },
};

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};
type CountCard = {
  title: string;
  value: number | null;
  hint: string;
  href: string;
  action: string;
  important?: boolean;
};

function countOf(row: CountResult): number | null {
  return row.error ? null : row.count;
}
function numberLabel(value: number | null) {
  return value === null ? "—" : value.toLocaleString("pl-PL");
}

function IssueCard({ item }: { item: CountCard }) {
  const needsAttention = item.value !== null && item.value > 0;
  return (
    <Link href={item.href}
      className={["group block min-h-44 rounded-[23px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700",
        needsAttention && item.important
          ? "border-amber-200 bg-amber-50/60"
          : "border-stone-200 bg-white"].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.13em] text-stone-500">{item.title}</span>
        <span aria-hidden="true" className="text-lg text-stone-400 transition group-hover:translate-x-1">↗</span>
      </div>
      <p className={["mt-3 text-3xl font-black tracking-tight",
        needsAttention && item.important ? "text-amber-900" : "text-stone-950"].join(" ")}>
        {numberLabel(item.value)}
      </p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-stone-600">{item.hint}</p>
      <p className="mt-3 text-sm font-black text-rose-700">{item.action} →</p>
    </Link>
  );
}

const AUTOMATION_PROCESSES = [
  {
    name: "Wygaszanie ofert po terminie",
    state: "automated",
    stateLabel: "Automatyczne",
    detail: "Supabase Cron uruchamia regułę co 5 minut. Dotyczy wyłącznie ofert z ustaloną datą ważności.",
    href: "/admin/terminy-promocji",
    action: "Sprawdź terminy",
  },
  {
    name: "IndexNow i zgłoszenia wyszukiwarek",
    state: "assisted",
    stateLabel: "Zależne od panelu",
    detail: "Kolejka jest obsługiwana automatycznie podczas otwartej sesji administratora. Nie jest to niezależne zadanie w tle.",
    href: "/admin/widocznosc",
    action: "Zobacz kolejkę",
  },
  {
    name: "Ceny i dostępność produktów",
    state: "manual",
    stateLabel: "Do integracji",
    detail: "Brak potwierdzonej ciągłej synchronizacji z aktualnym katalogiem partnera; zapisane ceny wymagają sprawdzenia.",
    href: "/admin#admin-offers",
    action: "Sprawdź katalog",
  },
  {
    name: "Nowe stylizacje",
    state: "manual",
    stateLabel: "Redakcyjne",
    detail: "Kreator i publikacja działają, lecz dobór nowych zestawów nie odbywa się samodzielnie.",
    href: "/admin/stylizacje",
    action: "Otwórz stylizacje",
  },
  {
    name: "Publikacje w social mediach",
    state: "manual",
    stateLabel: "Ręczne",
    detail: "Materiały można przygotowywać w panelu, ale publikowanie na zewnętrznych kontach wymaga autoryzowanych integracji.",
    href: "/admin/social",
    action: "Otwórz studio",
  },
] as const;

function ProcessPill({ state, label }: { state: string; label: string }) {
  const style = state === "automated"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : state === "assisted"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-stone-200 bg-stone-100 text-stone-700";
  return <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${style}`}>{label}</span>;
}

function Shortcut({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="group flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-rose-200 hover:bg-rose-50/40">
      <span>
        <strong className="block text-sm font-black text-stone-950">{title}</strong>
        <span className="mt-1 block text-xs text-stone-500">{description}</span>
      </span>
      <span aria-hidden="true" className="text-rose-700 transition group-hover:translate-x-1">→</span>
    </Link>
  );
}

export default async function AdminAutopilotPage() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (authError || !userId) redirect("/login");
  const { data: admin, error: adminError } = await supabase.from("admins")
    .select("role").eq("user_id", userId).maybeSingle();
  if (adminError || !admin) redirect("/login");

  if (admin.role !== "owner") {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-stone-950">
        <AdminHeader />
        <section className="mx-auto max-w-4xl px-5 py-14">
          <h1 className="text-3xl font-black">Centrum Autopilota</h1>
          <p className="mt-4 text-stone-600">Podsumowanie systemu jest dostępne tylko dla właściciela.</p>
          <Link href="/admin" className="mt-6 inline-flex text-sm font-black text-rose-700">Wróć do panelu →</Link>
        </section>
      </main>
    );
  }

  const today = polishToday();
  // Small head-only count queries; owner RLS applies. An error is not a zero.
  const [
    activeProducts, unknownIdentity, conflictingIdentity,
    campaignsUnreviewed, campaignsUndated, campaignsExpired,
    merchantUnverified, indexPending, indexFailed, publishedOutfits, draftOutfits,
  ]: CountResult[] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true).is("shein_product_key", null),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true).eq("shein_identity_status", "conflict"),
    supabase.from("shein_campaigns").select("id", { count: "exact", head: true }).eq("published", true).is("last_reviewed_at", null),
    supabase.from("shein_campaigns").select("id", { count: "exact", head: true }).eq("published", true).is("valid_until", null),
    supabase.from("shein_campaigns").select("id", { count: "exact", head: true }).eq("published", true).lt("valid_until", today),
    supabase.from("extension_offers").select("id", { count: "exact", head: true }).eq("published", true).is("last_verified_at", null),
    supabase.from("search_index_queue").select("id", { count: "exact", head: true }).is("submitted_at", null),
    supabase.from("search_index_queue").select("id", { count: "exact", head: true }).is("submitted_at", null).not("last_error", "is", null),
    supabase.from("editorial_outfits").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("editorial_outfits").select("id", { count: "exact", head: true }).eq("published", false),
  ]);

  const checks: CountCard[] = [
    { title: "Kampanie bez kontroli", value: countOf(campaignsUnreviewed),
      hint: "Opublikowane kampanie SHEIN bez zapisanej daty ostatniej weryfikacji.", href: "/admin/terminy-promocji", action: "Zweryfikuj kampanie", important: true },
    { title: "Kampanie bez terminu", value: countOf(campaignsUndated),
      hint: "Bez daty ważności automat nie ma podstaw do wygaszenia kampanii.", href: "/admin/terminy-promocji", action: "Ustal terminy", important: true },
    { title: "Zaległe wygaszenia", value: countOf(campaignsExpired),
      hint: "Opublikowane kampanie z datą ważności wcześniejszą niż dziś.", href: "/admin/terminy-promocji", action: "Sprawdź wygaszanie", important: true },
    { title: "IndexNow oczekujące", value: countOf(indexPending),
      hint: "Adresy jeszcze niezgłoszone; przetwarzanie zależy od otwartego panelu.", href: "/admin/widocznosc", action: "Otwórz widoczność" },
    { title: "Błędy IndexNow", value: countOf(indexFailed),
      hint: "Niewysłane wpisy z zapisanym błędem.", href: "/admin/widocznosc", action: "Zbadaj błędy", important: true },
    { title: "Produkty bez ID SHEIN", value: countOf(unknownIdentity),
      hint: "Brak przypisanego identyfikatora w bazie; nie oznacza automatycznie nieaktywnej oferty.", href: "/admin#admin-duplicate-review", action: "Przejrzyj tożsamość" },
    { title: "Konflikty produktów", value: countOf(conflictingIdentity),
      hint: "Produkty oznaczone jako potencjalnie kolidujące.", href: "/admin#admin-duplicate-review", action: "Sprawdź konflikty", important: true },
    { title: "Inne promocje bez kontroli", value: countOf(merchantUnverified),
      hint: "Opublikowane oferty pozostałych sklepów bez daty weryfikacji.", href: "/admin/terminy-promocji", action: "Przejrzyj oferty", important: true },
  ];

  const hasErrors = [
    activeProducts, unknownIdentity, conflictingIdentity, campaignsUnreviewed,
    campaignsUndated, campaignsExpired, merchantUnverified, indexPending,
    indexFailed, publishedOutfits, draftOutfits,
  ].some((value) => Boolean(value.error));

  const alerts = checks.filter((item) => item.important && (item.value ?? 0) > 0);
  const generatedAt = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-24 text-stone-950 lg:pb-10">
      <AdminHeader />
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-5 sm:px-6 sm:py-8">
        <header className="rounded-[28px] bg-stone-950 p-6 text-white sm:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.17em] text-rose-300">Centrum zarządzania · Trend za Mniej</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">Centrum Autopilota</h1>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Jedno miejsce na codzienną kontrolę. Zobacz, co wymaga decyzji,
                jakie procesy działają automatycznie, a które dopiero trzeba zautomatyzować.
              </p>
              <p className="mt-3 text-xs font-medium text-stone-400">Stan danych: {generatedAt} · dane odświeżane przy otwarciu strony</p>
            </div>
            <Link href="/admin" className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-black text-stone-950 hover:bg-rose-50">
              Katalog i oferty →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "Aktywne produkty", value: countOf(activeProducts) },
              { name: "Opublikowane stylizacje", value: countOf(publishedOutfits) },
              { name: "Szkice stylizacji", value: countOf(draftOutfits) },
              { name: "Obszary do sprawdzenia", value: hasErrors ? null : alerts.length },
            ].map((metric) => (
              <div key={metric.name} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                <p className="text-[11px] font-semibold leading-5 text-stone-300">{metric.name}</p>
                <strong className="mt-1 block text-2xl font-black">{numberLabel(metric.value)}</strong>
              </div>
            ))}
          </div>
        </header>

        {hasErrors && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-900">
            Nie udało się odczytać wszystkich danych. Symbol „—” oznacza brak odczytu, a nie zero problemów.
          </div>
        )}

        <section aria-labelledby="autopilot-attention-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">01 / Działania</p>
              <h2 id="autopilot-attention-heading" className="mt-1 text-2xl font-black tracking-tight">Co wymaga uwagi?</h2>
              <p className="mt-2 text-sm text-stone-600">Liczby pochodzą z rzeczywistych rekordów bazy; jeden wpis może występować w kilku kategoriach.</p>
            </div>
            <Link href="/admin/terminy-promocji" className="text-sm font-black text-rose-700 hover:underline">Terminy promocji →</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {checks.map((item) => <IssueCard key={item.title} item={item} />)}
          </div>
        </section>

        <section aria-labelledby="autopilot-status-heading" className="rounded-[26px] border border-stone-200 bg-white p-5 sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">02 / System</p>
            <h2 id="autopilot-status-heading" className="mt-1 text-2xl font-black tracking-tight">Co naprawdę działa automatycznie?</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Status opisuje sposób działania funkcji, a nie ciągłą kontrolę dostępności usługi. Nie udajemy, że ręczne zadania są automatami.</p>
          </div>
          <div className="mt-5 divide-y divide-stone-100">
            {AUTOMATION_PROCESSES.map((process) => (
              <div key={process.name} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-stone-950">{process.name}</h3>
                    <ProcessPill state={process.state} label={process.stateLabel} />
                  </div>
                  <p className="mt-2 max-w-3xl text-xs leading-6 text-stone-600">{process.detail}</p>
                </div>
                <Link href={process.href} className="text-sm font-black text-rose-700 hover:underline">{process.action} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="autopilot-shortcuts-heading">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">03 / Szybka nawigacja</p>
          <h2 id="autopilot-shortcuts-heading" className="mt-1 text-2xl font-black tracking-tight">Gdzie chcesz pracować?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Shortcut href="/admin#admin-offers" title="Produkty i katalog" description="Wyszukaj, sprawdź lub edytuj ofertę" />
            <Shortcut href="/admin/stylizacje" title="Stylizacje" description="Zestawy i publikacje" />
            <Shortcut href="/admin/promocje-shein" title="Kampanie SHEIN" description="Kody, linki i zasady ofert" />
            <Shortcut href="/admin/social" title="Social Media" description="Przygotowanie materiałów" />
            <Shortcut href="/admin/skutecznosc" title="Skuteczność kanałów" description="Rzeczywiste kliknięcia" />
            <Shortcut href="/admin/seo" title="Kontrola SEO" description="Jakość kart i opisów" />
          </div>
        </section>
      </div>
    </main>
  );
}
