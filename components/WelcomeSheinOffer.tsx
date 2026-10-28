"use client";

import { useEffect, useState } from "react";

const VISIT_KEY = "trendzamniej:shein-welcome-sbnsl5d:v1";
const CAMPAIGN_CODE = "SBNSL5D";
const CAMPAIGN_URL = "https://onelink.shein.com/58/66hx4q3nwzrl";
const SHOW_AFTER_MS = 10_000;

// Fallback only if browser storage is disabled; never collect visitor identifiers.
let shownInThisTab = false;

/**
 * One-time, dismissible welcome offer on the home page.
 *
 * Deliberately not a blocking full-screen interstitial: the site can still be
 * read and used. A short delay gives visitors time to see the actual page first.
 * Offer details must be confirmed by SHEIN, not promised by this site.
 */
export default function WelcomeSheinOffer() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shownInThisTab) return;

    try {
      if (window.localStorage.getItem(VISIT_KEY)) return;
    } catch {
      // Private browsing or blocked storage: session-only fallback below.
    }

    const timer = window.setTimeout(() => {
      if (shownInThisTab) return;
      try {
        if (window.localStorage.getItem(VISIT_KEY)) return;
        window.localStorage.setItem(VISIT_KEY, "seen");
      } catch {
        // Storage may be unavailable. Avoid repeated displays in this tab.
      }
      shownInThisTab = true;
      setOpen(true);
    }, SHOW_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(CAMPAIGN_CODE);
      setCopied(true);
      return;
    } catch {
      // Fallback for browsers without Clipboard API permission.
    }

    const input = document.createElement("textarea");
    input.value = CAMPAIGN_CODE;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand("copy");
    input.remove();
    setCopied(success);
  }

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="welcome-shein-title"
      aria-describedby="welcome-shein-description"
      className="fixed left-1/2 top-1/2 z-[80] w-[min(92vw,450px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[30px] border border-rose-100 bg-white shadow-[0_16px_70px_rgba(49,21,31,0.28)] max-h-[min(80dvh,680px)] motion-safe:animate-[welcomeFadeIn_400ms_ease-out] sm:w-[450px]"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fff0ed] via-[#ffe6df] to-[#fff3ce] px-6 pb-5 pt-7 text-center sm:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-14 h-40 w-40 rounded-full bg-[#ffc6bb]/70 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -bottom-12 h-40 w-40 rounded-full bg-[#ffe07b]/80 blur-2xl" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Zamknij ofertę powitalną"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/90 text-xl font-medium text-stone-700 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="relative mx-auto inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-orange-800">
          <span aria-hidden="true">🎁</span> Oferta powitalna SHEIN
        </div>
        <p className="relative mt-4 text-lg font-black text-stone-900">
          Gratulacje! <span aria-hidden="true">🎉</span>
        </p>
        <h2 id="welcome-shein-title" className="relative mt-1 text-balance text-[clamp(1.5rem,5vw,1.95rem)] font-black leading-tight tracking-tight text-stone-950">
          Ekskluzywna oferta dla Ciebie! <span aria-hidden="true">🎁</span>
        </h2>

        <div className="relative mx-auto mt-4 flex w-fit items-baseline justify-center gap-3 rounded-[22px] border border-white/80 bg-white/80 px-6 py-3 shadow-[0_6px_30px_rgba(201,80,31,0.1)]">
          <span className="text-sm font-black uppercase text-orange-700">Do</span>
          <strong className="text-6xl font-black leading-none tracking-[-0.07em] text-[#fa4d19] sm:text-7xl">60%</strong>
          <span className="text-lg font-black text-[#fa4d19]">zniżki</span>
        </div>
        <p className="relative mt-3 text-sm font-bold text-stone-700">
          Tylko dla kwalifikujących się nowych użytkowników
        </p>
      </div>

      <div className="px-5 pb-6 pt-5 text-center sm:px-8">
        <p id="welcome-shein-description" className="text-sm leading-6 text-stone-700">
          <span aria-hidden="true">🌟</span> Wyszukaj poniższy kod w aplikacji SHEIN, aby sprawdzić ofertę:
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 px-4 py-3">
          <code className="text-2xl font-black tracking-[0.12em] text-stone-950">{CAMPAIGN_CODE}</code>
          <button
            type="button"
            onClick={copyCode}
            aria-live="polite"
            className="min-h-11 shrink-0 rounded-xl bg-white px-4 text-xs font-black text-orange-800 shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            {copied ? "Skopiowano ✓" : "Kopiuj kod"}
          </button>
        </div>

        <a
          href={CAMPAIGN_URL}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={() => setOpen(false)}
          className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#f04416] px-5 py-3.5 text-base font-black text-white shadow-[0_8px_24px_rgba(240,68,22,0.22)] transition hover:bg-[#dc3811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
        >
          Sprawdź ofertę w SHEIN <span aria-hidden="true">↗</span>
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 min-h-11 px-3 text-sm font-bold text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline focus-visible:outline-2 focus-visible:outline-rose-700"
        >
          Nie teraz, przeglądaj stylizacje
        </button>

        <p className="mt-3 border-t border-stone-100 pt-3 text-[11px] leading-5 text-stone-500">
          Link afiliacyjny. Oferta pochodzi z materiału kampanii; kod do wyszukania nie gwarantuje rabatu w koszyku.
          Wysokość zniżki, kwalifikacja konta i pozostałe warunki zależą od SHEIN.
        </p>
      </div>
    </aside>
  );
}
