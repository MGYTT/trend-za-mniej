
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  SheinPromotion,
} from "@/lib/shein-promotions";

type Category =
  | "all"
  | "new-users"
  | "fashion"
  | "beauty"
  | "accessories"
  | "home"
  | "kids"
  | "sale";

type CategoryOption = {
  id: Category;
  label: string;
};

type CodeFilter = "all" | "campaign" | "coupon";

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Wszystkie" },
  { id: "new-users", label: "Dla nowych" },
  { id: "fashion", label: "Moda" },
  { id: "beauty", label: "Beauty" },
  {
    id: "accessories",
    label: "Buty i dodatki",
  },
  { id: "home", label: "Dom" },
  { id: "kids", label: "Dzieci" },
  { id: "sale", label: "Wyprzedaże" },
];

const FASHION_IDS = new Set([
  "nowy-sezon-nowe-trendy",
  "bestsellery-dla-kobiet",
  "techniczne-spojrzenie-nowy-sezon",
  "odziez-nocna-bielizna",
  "nowy-sezon-nowy-ruch",
  "wakacyjna-kolekcja",
  "emery-rose-wyprzedaz",
  "anewsta-wiosna-lato",
  "shein-curve-nowy-sezon",
]);

const BEAUTY_IDS = new Set([
  "kosmetyki-bestsellery",
  "sheglam-super-wyprzedaz",
  "promienne-piekno",
]);

const ACCESSORIES_IDS = new Set([
  "bestsellery-bizuteria-dodatki",
  "bestsellery-torebki-buty",
]);

const HOME_IDS = new Set([
  "kuchnia-jadalnia",
  "shein-lifestyle",
  "zabawki-antystresowe",
]);

const KIDS_IDS = new Set([
  "dzieci-niemowleta-bestsellery",
]);

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

function newUserPromotion(
  promotion: SheinPromotion
) {
  if (
    promotion.id ===
    "kupon-60-nowi-uzytkownicy"
  ) {
    return true;
  }

  const text = normalize(
    [
      promotion.title,
      promotion.description,
      promotion.note,
      promotion.badge,
    ].join(" ")
  );

  return (
    text.includes("nowych uzytkownik") ||
    text.includes("nowi uzytkownicy") ||
    text.includes("nowym uzytkownik")
  );
}

function salePromotion(
  promotion: SheinPromotion
) {
  const text = normalize(
    [
      promotion.title,
      promotion.description,
      promotion.badge,
    ].join(" ")
  );

  return (
    text.includes("wyprzedaz") ||
    text.includes("przecen") ||
    text.includes("obniz") ||
    text.includes("ponizej")
  );
}

function matchesCategory(
  promotion: SheinPromotion,
  category: Category
) {
  // New-customer and sale campaigns can also be in beauty, fashion or accessories.
  if (category !== "all" && category !== "new-users" && category !== "sale" && promotion.category) return promotion.category === category;
  switch (category) {
    case "all":
      return true;

    case "new-users":
      return promotion.category === category || newUserPromotion(promotion);

    case "fashion":
      return FASHION_IDS.has(promotion.id);

    case "beauty":
      return BEAUTY_IDS.has(promotion.id);

    case "accessories":
      return ACCESSORIES_IDS.has(
        promotion.id
      );

    case "home":
      return HOME_IDS.has(promotion.id);

    case "kids":
      return KIDS_IDS.has(promotion.id);

    case "sale":
      return promotion.category === category || salePromotion(promotion);
  }
}

const INITIAL_VISIBLE = 6;
const STEP = 6;

const PREFERRED_IDS = [
  "kupon-60-nowi-uzytkownicy",
  "produkty-ponizej-4-99",
  "wyselekcjonowane-produkty",
  "sheglam-super-wyprzedaz",
  "bestsellery-dla-kobiet",
  "bestsellery-torebki-buty",
];

const ranked = (items: SheinPromotion[]) =>
  [...items].sort((a, b) => {
    const aRank = a.sortOrder ?? (PREFERRED_IDS.indexOf(a.id) < 0 ? 999 : PREFERRED_IDS.indexOf(a.id));
    const bRank = b.sortOrder ?? (PREFERRED_IDS.indexOf(b.id) < 0 ? 999 : PREFERRED_IDS.indexOf(b.id));
    return aRank - bRank;
  });

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

export default function SheinPromotionsExplorer({
  promotions,
}: {
  promotions: SheinPromotion[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [codeFilter, setCodeFilter] = useState<CodeFilter>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const pendingAnchorRef = useRef<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean } | null>(null);

  const codeCounts = useMemo(() => ({
    campaign: promotions.filter((promotion) => promotion.codeKind !== "coupon").length,
    coupon: promotions.filter((promotion) => promotion.codeKind === "coupon").length,
  }), [promotions]);

  const categoryCounts = useMemo(
    () => Object.fromEntries(
      CATEGORIES.map((item) => [
        item.id,
        promotions.filter((promotion) =>
          matchesCategory(promotion, item.id) &&
          (codeFilter === "all" ||
            (codeFilter === "coupon" ? promotion.codeKind === "coupon" : promotion.codeKind !== "coupon"))
        ).length,
      ])
    ) as Record<Category, number>,
    [codeFilter, promotions]
  );

  const matches = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return ranked(promotions.filter((promotion) => {
      if (!matchesCategory(promotion, category)) return false;
      if (codeFilter === "coupon" && promotion.codeKind !== "coupon") return false;
      if (codeFilter === "campaign" && promotion.codeKind === "coupon") return false;
      if (terms.length === 0) return true;
      const searchable = normalize([
        promotion.title,
        promotion.badge,
        promotion.description,
        promotion.code,
        promotion.note,
      ].join(" "));
      return terms.every((term) => searchable.includes(term));
    }));
  }, [category, codeFilter, promotions, query]);

  const displayed = matches.slice(0, visibleCount);

  // Open a shared #campaign-id even if the item was initially hidden in later batches.
  useEffect(() => {
    const revealHash = () => {
      const id = window.location.hash.slice(1);
      const index = ranked(promotions).findIndex((promotion) => promotion.id === id);
      if (index < 0) return;
      pendingAnchorRef.current = id;
      setCategory("all");
      setCodeFilter("all");
      setQuery("");
      setVisibleCount(Math.max(INITIAL_VISIBLE, Math.ceil((index + 1) / STEP) * STEP));
    };
    revealHash();
    window.addEventListener("hashchange", revealHash);
    return () => window.removeEventListener("hashchange", revealHash);
  }, [promotions]);

  useEffect(() => {
    if (!pendingAnchorRef.current) return;
    const anchor = document.getElementById(pendingAnchorRef.current);
    if (anchor) {
      pendingAnchorRef.current = null;
      anchor.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [displayed]);

  function chooseCategory(next: Category) {
    setCategory(next);
    setVisibleCount(INITIAL_VISIBLE);
    setFeedback(null);
  }

  function changeCodeFilter(next: CodeFilter) {
    setCodeFilter(next);
    setVisibleCount(INITIAL_VISIBLE);
    setFeedback(null);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setVisibleCount(INITIAL_VISIBLE);
    setFeedback(null);
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setCodeFilter("all");
    setVisibleCount(INITIAL_VISIBLE);
    setFeedback(null);
  }

  async function copyCode(promotion: SheinPromotion) {
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promotion.code);
        success = true;
      }
    } catch {
      // A blocked clipboard permission should not hide the code.
    }

    if (!success) {
      const input = document.getElementById("campaign-code-" + promotion.id) as HTMLInputElement | null;
      input?.focus();
      input?.select();
      try {
        success = document.execCommand("copy");
      } catch {
        success = false;
      }
    }
    setFeedback({ id: promotion.id, success });
  }

  return (
    <div>
      <div className="rounded-[26px] border border-rose-100 bg-white p-4 shadow-[0_14px_42px_rgba(136,19,55,0.07)] sm:p-6">
        <label htmlFor="shein-promotion-search" className="mb-2 block text-sm font-black text-stone-950">
          Co chcesz znaleźć?
        </label>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-600">
            <SearchIcon />
          </span>
          <input
            id="shein-promotion-search"
            type="search"
            enterKeyHint="search"
            value={query}
            maxLength={100}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Np. buty, kosmetyki, SHEGLAM lub kod"
            className="min-h-14 w-full min-w-0 rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-12 text-base font-medium text-stone-950 outline-none placeholder:text-stone-500 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
          {query && (
            <button type="button" onClick={() => changeQuery("")} aria-label="Wyczyść wyszukiwanie"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-xl text-stone-600 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500">
              ×
            </button>
          )}
        </div>
        {codeCounts.coupon > 0 && (
          <div role="group" aria-label="Rodzaj kodu" className="mt-4 flex flex-wrap gap-2">
            {([
              { id: "all", label: "Wszystkie oferty", count: promotions.length },
              { id: "campaign", label: "Kody kampanii", count: codeCounts.campaign },
              { id: "coupon", label: "Kupony rabatowe", count: codeCounts.coupon },
            ] as const).map((option) => (
              <button type="button" key={option.id} aria-pressed={codeFilter === option.id}
                onClick={() => changeCodeFilter(option.id)}
                className={`min-h-11 rounded-xl border px-3 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-rose-500 ${codeFilter === option.id
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"}`}>
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-stone-900">Wybierz kategorię</p>
          {(query || category !== "all" || codeFilter !== "all") && (
            <button type="button" onClick={clearFilters}
              className="min-h-10 text-xs font-black text-rose-700 underline underline-offset-4 hover:text-rose-800">
              Wyczyść filtry
            </button>
          )}
        </div>
        <div role="group" aria-label="Filtruj kampanie według kategorii"
          className="horizontal-scroll -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => chooseCategory(item.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-rose-500 ${category === item.id
                ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                : "border-rose-100 bg-rose-50/50 text-stone-700 hover:border-rose-300 hover:bg-rose-50"}`}
            >
              {item.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${category === item.id ? "bg-white/20 text-white" : "bg-white text-rose-700"}`}>
                {categoryCounts[item.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div id="lista-promocji" className="mb-5 mt-8 flex flex-wrap items-end justify-between gap-3 scroll-mt-24">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">Kampanie z katalogu</p>
          <h3 className="mt-1 text-[clamp(1.5rem,5vw,2rem)] font-black tracking-tight text-stone-950">
            Wybierz ofertę
          </h3>
        </div>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-stone-600">
          {matches.length} {matches.length === 1 ? "oferta" : matches.length < 5 && matches.length > 1 ? "oferty" : "ofert"}
          {matches.length > displayed.length ? ` · pokazano ${displayed.length}` : ""}
        </p>
      </div>

      {displayed.length > 0 ? (
        <>
          <div className="grid items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
            {displayed.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                feedback={feedback?.id === promotion.id ? feedback : null}
                onCopy={() => void copyCode(promotion)}
              />
            ))}
          </div>
          {displayed.length < matches.length && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setVisibleCount((count) => count + STEP)}
                className="min-h-12 w-full rounded-2xl border border-rose-200 bg-white px-6 text-sm font-black text-rose-700 shadow-sm transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500 sm:w-auto">
                Pokaż kolejne promocje ({matches.length - displayed.length}) ↓
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[24px] border border-dashed border-rose-200 bg-white px-6 py-12 text-center">
          <h3 className="text-xl font-black text-stone-950">Brak kampanii pasujących do wyszukiwania</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-stone-600">
            Spróbuj innego słowa lub wybierz wszystkie kategorie.
          </p>
          <button type="button" onClick={clearFilters}
            className="mt-5 min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700">
            Pokaż wszystkie
          </button>
        </div>
      )}
    </div>
  );
}

function PromotionCard({
  promotion,
  feedback,
  onCopy,
}: {
  promotion: SheinPromotion;
  feedback: { id: string; success: boolean } | null;
  onCopy: () => void;
}) {
  const isNewUserCoupon = promotion.id === "kupon-60-nowi-uzytkownicy";
  const isCoupon = promotion.codeKind === "coupon";

  return (
    <article id={promotion.id}
      className="flex h-full min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_8px_28px_rgba(28,25,23,0.05)] transition hover:border-rose-200 hover:shadow-lg">
      <div className="flex h-full min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">
            {promotion.badge}
          </span>
          <span className="text-[11px] font-bold text-stone-500">
            {isCoupon ? "Kupon według opisu" : isNewUserCoupon ? "Oferta dla nowych" : "Kod kampanii"}
          </span>
        </div>
        <h4 className="mt-4 text-pretty text-xl font-black leading-snug tracking-[-0.035em] text-stone-950 sm:text-[22px]">
          {promotion.title}
        </h4>
        {promotion.reviewedRecently === false && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-950">
            Aktualność kodu i warunków nie została potwierdzona w ostatnich 14 dniach.
            Kod może być nieaktywny — sprawdź zasady i ewentualny rabat bezpośrednio w SHEIN.
          </p>
        )}
        <p className="mt-2 text-xs leading-6 text-stone-600">
          {isCoupon
            ? "Kupon może zadziałać po spełnieniu warunków SHEIN. Nie weryfikujemy go na żywo."
            : isNewUserCoupon
              ? "Oferta dla nowych klientów. Sprawdź zasady i kwalifikację w SHEIN."
              : "Kod kampanii służy do znalezienia oferty — nie musi obniżać ceny w koszyku."}
        </p>

        <div className="mt-auto pt-5">
          <label htmlFor={"campaign-code-" + promotion.id} className="mb-2 block text-xs font-black text-stone-600">
            {isCoupon ? "Kupon do sprawdzenia w SHEIN" : isNewUserCoupon ? "Kod powiązany z ofertą" : "Kod do wyszukania w SHEIN"}
          </label>
          <div className="flex min-w-0 flex-wrap items-stretch gap-2">
            <input
              id={"campaign-code-" + promotion.id}
              type="text"
              value={promotion.code}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              spellCheck={false}
              aria-label={"Kod kampanii: " + promotion.code}
              className="min-h-12 min-w-0 flex-1 basis-[145px] rounded-xl border border-dashed border-rose-200 bg-rose-50 px-3 font-mono text-base font-black tracking-widest text-stone-950 outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            />
            <button type="button" onClick={onCopy}
              aria-label={"Kopiuj kod kampanii " + promotion.code}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-500">
              {feedback?.success ? "✓ Skopiowano" : "Kopiuj"}
            </button>
          </div>
          <span role="status" aria-live="polite" className="sr-only">
            {feedback?.success ? "Kod został skopiowany." : ""}
          </span>
          {feedback && !feedback.success && (
            <p role="status" className="mt-2 text-xs leading-5 text-rose-700">
              Kopiowanie zablokowane. Kod jest zaznaczony — możesz skopiować go ręcznie.
            </p>
          )}
          <details className="group mt-3 rounded-xl border border-stone-100 bg-stone-50/70">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 text-xs font-bold text-stone-700 [&::-webkit-details-marker]:hidden">
              Opis i warunki kampanii
              <span aria-hidden="true" className="text-lg text-rose-600 transition group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-stone-100 px-3.5 pb-4 pt-3 text-xs leading-6 text-stone-600">
              <p>{promotion.description}</p>
              <p className="mt-2 font-semibold">{promotion.note}</p>
            </div>
          </details>
          <p className="mt-4 text-xs leading-5 text-stone-700">
             <strong>Reklama · link afiliacyjny SHEIN.</strong> Możemy otrzymać prowizję
             za kwalifikujący się zakup. Zasady rabatów sprawdź w SHEIN.
           </p>
           <a href={"/promocje-shein/go/" + encodeURIComponent(promotion.id)}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-center text-sm font-black leading-6 text-white shadow-[0_8px_20px_rgba(225,29,72,0.16)] transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400"
          >
            {promotion.ctaLabel} <ExternalIcon />
          </a>
          <p className="mt-2 text-center text-[11px] leading-5 text-stone-500">
            Link afiliacyjny · nowa karta · warunki w SHEIN
          </p>
        </div>
      </div>
    </article>
  );
}
