import { WELCOME_AFFILIATE_DISCLOSURE, type WelcomeSheinSettings } from "@/lib/welcome-shein-settings";

const THEMES = {
  peach: {
    header: "from-[#fff0ed] via-[#ffe6df] to-[#fff3ce]",
    haloLeft: "bg-[#ffc6bb]/70", haloRight: "bg-[#ffe07b]/80",
    accent: "text-[#fa4d19]", button: "bg-[#f04416] hover:bg-[#dc3811]",
    pill: "border-orange-200 text-orange-800", code: "border-orange-300 bg-orange-50",
  },
  rose: {
    header: "from-[#ffe7ef] via-[#fff1f6] to-[#ffe6e1]",
    haloLeft: "bg-[#fecdd3]/70", haloRight: "bg-[#ffb6d0]/70",
    accent: "text-[#df2459]", button: "bg-[#df2459] hover:bg-[#bf1746]",
    pill: "border-rose-200 text-rose-800", code: "border-rose-300 bg-rose-50",
  },
  lavender: {
    header: "from-[#f0e8ff] via-[#f9ebff] to-[#ffeef5]",
    haloLeft: "bg-[#ddd6fe]/70", haloRight: "bg-[#fecdd3]/65",
    accent: "text-[#8151d5]", button: "bg-[#8151d5] hover:bg-[#683bbb]",
    pill: "border-violet-200 text-violet-800", code: "border-violet-300 bg-violet-50",
  },
} as const;

export default function WelcomeSheinOfferCard({
  settings, onClose, onCopy, copied = false, preview = false,
}: {
  settings: WelcomeSheinSettings;
  onClose?: () => void;
  onCopy?: () => void;
  copied?: boolean;
  preview?: boolean;
}) {
  const palette = THEMES[settings.theme];
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-rose-100 bg-white shadow-[0_16px_70px_rgba(49,21,31,0.13)]">
      <div className={"relative overflow-hidden bg-gradient-to-br " + palette.header + " px-6 pb-5 pt-7 text-center sm:px-8"}>
        <div aria-hidden="true" className={"pointer-events-none absolute -left-12 -top-14 h-40 w-40 rounded-full blur-2xl " + palette.haloLeft} />
        <div aria-hidden="true" className={"pointer-events-none absolute -right-14 -bottom-12 h-40 w-40 rounded-full blur-2xl " + palette.haloRight} />
        {preview ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-stone-500">PODGLĄD</span>
        ) : (
          <button type="button" onClick={onClose} aria-label="Zamknij ofertę powitalną"
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/90 text-xl font-medium text-stone-700 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-rose-700">
            <span aria-hidden="true">×</span>
          </button>
        )}
        <div className={"relative mx-auto inline-flex max-w-[calc(100%-58px)] items-center justify-center rounded-full border bg-white/85 px-4 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] " + palette.pill}>
          {settings.eyebrow}
        </div>
        <p className="relative mt-4 break-words text-lg font-black text-stone-900">{settings.greeting}</p>
        <h2 id={preview ? undefined : "welcome-shein-title"}
          className="relative mt-1 break-words text-balance text-[clamp(1.4rem,5vw,1.95rem)] font-black leading-tight tracking-tight text-stone-950">
          {settings.headline}
        </h2>
        <div className="relative mx-auto mt-4 flex w-fit max-w-full flex-wrap items-baseline justify-center gap-x-3 gap-y-1 rounded-[22px] border border-white/80 bg-white/80 px-6 py-3 shadow-[0_6px_30px_rgba(201,80,31,0.1)]">
          <span className={"text-sm font-black uppercase " + palette.accent}>{settings.discountPrefix}</span>
          <strong className={"text-6xl font-black leading-none tracking-[-0.07em] sm:text-7xl " + palette.accent}>
            {settings.discountPercent}%
          </strong>
          <span className={"text-lg font-black " + palette.accent}>{settings.discountSuffix}</span>
        </div>
        <p className="relative mt-3 break-words text-sm font-bold text-stone-700">{settings.audience}</p>
      </div>
      <div className="px-5 pb-6 pt-5 text-center sm:px-8">
        <p id={preview ? undefined : "welcome-shein-description"}
          className="break-words text-sm leading-6 text-stone-700">{settings.instruction}</p>
        <div className={"mt-3 flex min-w-0 items-center justify-between gap-2 rounded-2xl border-2 border-dashed px-3 py-3 sm:px-4 " + palette.code}>
          <code className="min-w-0 break-all text-left text-xl font-black tracking-[0.1em] text-stone-950 sm:text-2xl">{settings.campaignCode}</code>
          <button type="button" disabled={preview} onClick={onCopy} aria-live="polite"
            className="min-h-11 shrink-0 rounded-xl bg-white px-3 text-xs font-black text-stone-800 shadow-sm ring-1 ring-stone-200 hover:bg-white/80 disabled:cursor-default sm:px-4">
            {copied ? "Skopiowano ✓" : "Kopiuj kod"}
          </button>
        </div>
        <p className="mt-4 text-left text-xs leading-5 text-stone-700">
          <strong>Reklama · link afiliacyjny SHEIN.</strong> Za kwalifikujący się zakup
          po przejściu przez link możemy otrzymać prowizję. Rabat nie jest gwarantowany;
          warunki i dostępność sprawdź w SHEIN.
        </p>
        {preview ? (
          <div className={"mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-black text-white " + palette.button}>
            {settings.ctaLabel} <span aria-hidden="true">↗</span>
          </div>
        ) : (
          <a href={settings.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer"
            onClick={onClose}
            className={"mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-black text-white shadow-[0_8px_24px_rgba(120,35,42,0.2)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 " + palette.button}>
            {settings.ctaLabel} <span aria-hidden="true">↗</span>
          </a>
        )}
        <button type="button" disabled={preview} onClick={onClose}
          className="mt-3 min-h-11 px-3 text-sm font-bold text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline disabled:cursor-default">
          {settings.dismissLabel}
        </button>
        {settings.extraNote && <p className="mt-2 break-words text-xs leading-5 text-stone-600">{settings.extraNote}</p>}
        <p className="mt-3 border-t border-stone-100 pt-3 text-[11px] leading-5 text-stone-500">
          {WELCOME_AFFILIATE_DISCLOSURE}
        </p>
      </div>
    </div>
  );
}
