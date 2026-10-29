"use client";

import { useState } from "react";
import WelcomeSheinOfferCard from "@/components/WelcomeSheinOfferCard";
import {
  DEFAULT_WELCOME_SHEIN,
  validateWelcomeSheinSettings,
  type WelcomeSheinSettings,
  type WelcomeTheme,
} from "@/lib/welcome-shein-settings";

const inputClass = "mt-1.5 min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const labelClass = "block min-w-0 text-xs font-black text-stone-700";

const THEMES: { value: WelcomeTheme; label: string; colors: string }[] = [
  { value: "peach", label: "Brzoskwinia", colors: "from-[#ffe3d4] to-[#fff1ac]" },
  { value: "rose", label: "Różowy", colors: "from-[#ffd8e5] to-[#ffece9]" },
  { value: "lavender", label: "Lawenda", colors: "from-[#e5dbff] to-[#ffddea]" },
];

export default function WelcomeSheinEditor({ initialSettings }: { initialSettings: WelcomeSheinSettings }) {
  const [form, setForm] = useState<WelcomeSheinSettings>(initialSettings);
  const [lastSaved, setLastSaved] = useState<WelcomeSheinSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const changed = JSON.stringify(form) !== JSON.stringify(lastSaved);
  const isExpired = Boolean(form.validUntil && form.validUntil < new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()));

  function patch<K extends keyof WelcomeSheinSettings>(field: K, value: WelcomeSheinSettings[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  async function save() {
    if (saving || !changed) return;
    const checked = validateWelcomeSheinSettings(form);
    if ("error" in checked) {
      setMessage({ text: checked.error, success: false });
      return;
    }
    if (checked.value.enabled && checked.value.validUntil && isExpired) {
      if (!window.confirm("Data zakończenia już minęła. Oferta pozostanie niewidoczna. Zapisać mimo to?")) return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/welcome-shein", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.value),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage({ text: result.error || "Nie udało się zapisać ustawień.", success: false });
        return;
      }
      setForm(checked.value);
      setLastSaved(checked.value);
      setMessage({ text: "Ustawienia zapisane. Strona główna odświeży widok oferty; sprawdź ją w nowym oknie prywatnym.", success: true });
    } catch {
      setMessage({ text: "Brak połączenia z serwerem. Spróbuj ponownie.", success: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      <div className="min-w-0 space-y-5">
        <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-rose-700">01 / Stan oferty</p>
              <h2 className="mt-1 text-xl font-black text-stone-950">Widoczność na stronie głównej</h2>
              <p className="mt-2 text-xs leading-6 text-stone-600">
                Wyłączona oferta nie pojawi się nowym odwiedzającym. Zmiana wymaga zapisania.
              </p>
            </div>
            <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2">
              <input type="checkbox" role="switch" aria-label="Włącz ofertę powitalną SHEIN"
                checked={form.enabled} onChange={(e) => patch("enabled", e.target.checked)}
                className="h-6 w-6 accent-rose-600" />
              <span className={"text-xs font-black " + (form.enabled ? "text-emerald-700" : "text-stone-600")}>
                {form.enabled ? "Włączona" : "Wyłączona"}
              </span>
            </label>
          </div>
          {isExpired && (
            <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
              Termin tej oferty minął. Popup pozostanie niewidoczny, nawet jeśli przełącznik jest włączony.
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Opóźnienie pojawienia się (sekundy)
              <input type="number" min={3} max={60} step={1} className={inputClass}
                value={form.delaySeconds} onChange={(e) => patch("delaySeconds", Number(e.target.value))} />
              <span className="mt-1 block font-normal leading-5 text-stone-500">3–60 s. Okno nie zasłania strony natychmiast po wejściu.</span>
            </label>
            <label className={labelClass}>
              Ostatni dzień ważności (opcjonalnie)
              <input type="date" className={inputClass} value={form.validUntil || ""}
                onChange={(e) => patch("validUntil", e.target.value || null)} />
              <span className="mt-1 block font-normal leading-5 text-stone-500">Po terminie popup przestanie się wyświetlać.</span>
            </label>
          </div>
        </section>

        <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-wide text-rose-700">02 / Teksty i kod</p>
          <h2 className="mt-1 text-xl font-black">Personalizacja oferty</h2>
          <div className="mt-5 grid gap-4">
            <label className={labelClass}>Etykieta u góry
              <input className={inputClass} maxLength={90} value={form.eyebrow}
                onChange={(e) => patch("eyebrow", e.target.value)} />
            </label>
            <label className={labelClass}>Powitanie
              <input className={inputClass} maxLength={100} value={form.greeting}
                onChange={(e) => patch("greeting", e.target.value)} />
            </label>
            <label className={labelClass}>Główny nagłówek
              <textarea rows={2} className={inputClass} maxLength={150} value={form.headline}
                onChange={(e) => patch("headline", e.target.value)} />
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_95px_minmax(0,1fr)] gap-2">
              <label className={labelClass}>Przed procentem
                <input className={inputClass} maxLength={12} value={form.discountPrefix}
                  onChange={(e) => patch("discountPrefix", e.target.value)} />
              </label>
              <label className={labelClass}>Zniżka %
                <input type="number" min={1} max={100} className={inputClass} value={form.discountPercent}
                  onChange={(e) => patch("discountPercent", Number(e.target.value))} />
              </label>
              <label className={labelClass}>Po procencie
                <input className={inputClass} maxLength={24} value={form.discountSuffix}
                  onChange={(e) => patch("discountSuffix", e.target.value)} />
              </label>
            </div>
            <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">
              Wysokość procentu jest wyłącznie treścią kampanii — nie jest automatycznie sprawdzana w SHEIN. Potwierdź ją przed zapisaniem.
            </p>
            <label className={labelClass}>Dla kogo jest oferta?
              <input className={inputClass} maxLength={200} value={form.audience}
                onChange={(e) => patch("audience", e.target.value)} />
            </label>
            <label className={labelClass}>Instrukcja dla użytkownika
              <textarea rows={2} className={inputClass} maxLength={300} value={form.instruction}
                onChange={(e) => patch("instruction", e.target.value)} />
            </label>
            <label className={labelClass}>Kod kampanii SHEIN
              <input spellCheck={false} className={inputClass + " font-mono tracking-widest"} maxLength={14}
                value={form.campaignCode} onChange={(e) => patch("campaignCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
            </label>
            <label className={labelClass}>Link afiliacyjny SHEIN
              <input type="url" inputMode="url" className={inputClass} value={form.affiliateUrl}
                onChange={(e) => patch("affiliateUrl", e.target.value)} />
              <span className="mt-1 block font-normal leading-5 text-stone-500">
                Akceptowany jest tylko bezpieczny adres onelink.shein.com w formacie /numer/kod.
              </span>
            </label>
            <label className={labelClass}>Tekst pomarańczowego przycisku
              <input className={inputClass} maxLength={100} value={form.ctaLabel}
                onChange={(e) => patch("ctaLabel", e.target.value)} />
            </label>
            <label className={labelClass}>Tekst przycisku zamknięcia
              <input className={inputClass} maxLength={100} value={form.dismissLabel}
                onChange={(e) => patch("dismissLabel", e.target.value)} />
            </label>
            <label className={labelClass}>Dodatkowa informacja (opcjonalnie)
              <textarea className={inputClass} rows={2} maxLength={400} value={form.extraNote}
                onChange={(e) => patch("extraNote", e.target.value)} placeholder="Np. Dostępność zależy od kraju i konta." />
            </label>
          </div>
        </section>

        <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-wide text-rose-700">03 / Wygląd i częstotliwość</p>
          <h2 className="mt-1 text-xl font-black">Kolory i nowa kampania</h2>
          <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Motyw kolorystyczny">
            {THEMES.map((theme) => (
              <button key={theme.value} type="button" aria-pressed={form.theme === theme.value}
                onClick={() => patch("theme", theme.value)}
                className={"min-h-24 rounded-2xl border-2 p-2 text-xs font-black transition active:scale-[0.97] " +
                  (form.theme === theme.value ? "border-rose-600 bg-rose-50 text-rose-800" : "border-stone-200 bg-white text-stone-700")}>
                <span className={"mb-2 block h-10 rounded-xl bg-gradient-to-r " + theme.colors} />
                {theme.label}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-black">Komu pojawi się popup?</h3>
            <p className="mt-2 text-xs leading-6 text-stone-600">
              Oferta wyświetla się raz na przeglądarkę w danej wersji kampanii.
              Samo edytowanie tekstu nie powoduje ponownego wyskakiwania okna osobom, które widziały je wcześniej.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-black text-stone-800">Wersja kampanii: {form.campaignVersion}</span>
              <button type="button" disabled={form.campaignVersion >= 1000000}
                onClick={() => patch("campaignVersion", form.campaignVersion + 1)}
                className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-xs font-black text-rose-700 disabled:opacity-40">
                Pokaż również wcześniejszym odwiedzającym
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Kliknięcie podnosi wersję kampanii. Zadziała po zapisaniu. Używaj przy rzeczywiście nowej ofercie.
            </p>
          </div>
        </section>

        <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur-lg lg:bottom-4">
          {message && <p role="status" aria-live="polite"
            className={"mb-3 rounded-xl p-3 text-xs font-bold leading-5 " +
              (message.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>{message.text}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={saving || !changed} onClick={() => void save()}
              className="min-h-12 flex-1 rounded-xl bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
            <button type="button" disabled={saving || !changed} onClick={() => { setForm(lastSaved); setMessage(null); }}
              className="min-h-12 rounded-xl border border-stone-200 px-4 text-xs font-bold text-stone-600 disabled:opacity-40">
              Cofnij
            </button>
          </div>
          {changed && <p className="mt-2 text-center text-[11px] font-bold text-amber-800">Masz niezapisane zmiany.</p>}
        </div>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-24">
        <section className="rounded-[28px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-rose-700">Podgląd na żywo</p>
              <h2 className="mt-1 text-xl font-black">Tak zobaczy go odwiedzający</h2>
            </div>
            <span className={"rounded-full px-3 py-1 text-xs font-black " +
              (form.enabled && !isExpired ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600")}>
              {form.enabled && !isExpired ? "Włączona" : "Niewidoczna"}
            </span>
          </div>
          <div className="mx-auto mt-5 w-full max-w-[450px]">
            <WelcomeSheinOfferCard settings={form} preview />
          </div>
          <p className="mt-5 text-xs leading-6 text-stone-600">
            Podgląd zmienia się podczas pisania, ale odwiedzający zobaczą dopiero zapisaną wersję.
            W podglądzie przyciski celowo nie otwierają linków.
          </p>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-rose-200 px-4 text-sm font-black text-rose-700 hover:bg-rose-50">
            Otwórz stronę główną ↗
          </a>
        </section>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
          <strong>Bezpieczeństwo promocji:</strong> podpis afiliacyjny i informacja o konieczności weryfikacji warunków w SHEIN pozostają na dole okna, nawet po edycji treści.
        </div>
      </aside>
    </div>
  );
}
