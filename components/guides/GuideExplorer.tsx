"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import type { StyleGuide } from "@/lib/poradniki";

export type GuideTeaser = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  topic: StyleGuide["topic"];
  readMinutes: number;
  quickSteps: readonly string[];
  image: { src: string; alt: string } | null;
};

const FILTERS: Array<"Wszystkie" | GuideTeaser["topic"]> = [
  "Wszystkie", "Budżet", "Zakupy online", "Styl", "Okazje",
];

const COLORS: Record<GuideTeaser["topic"], string> = {
  "Budżet": "from-[#ffe4e9] to-[#fff8f5]",
  "Zakupy online": "from-[#e5eafa] to-[#f7f8ff]",
  "Styl": "from-[#f5e7fa] to-[#fff6fc]",
  "Okazje": "from-[#fce9e1] to-[#fff8f3]",
};
const ICONS: Record<GuideTeaser["topic"], string> = {
  "Budżet": "zł", "Zakupy online": "↗", "Styl": "✦", "Okazje": "♡",
};

export default function GuideExplorer({ guides }: { guides: GuideTeaser[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<(typeof FILTERS)[number]>("Wszystkie");
  const visible = useMemo(() => guides.filter((guide) => {
    if (topic !== "Wszystkie" && guide.topic !== topic) return false;
    const search = query.trim().toLocaleLowerCase("pl");
    if (!search) return true;
    return [guide.title, guide.summary, guide.category, guide.topic, ...guide.quickSteps]
      .join(" ").toLocaleLowerCase("pl").includes(search);
  }), [guides, query, topic]);

  return (
    <section id="znajdz-poradnik" aria-labelledby="guide-explorer-title"
      className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">Wybierz swój temat</p>
          <h2 id="guide-explorer-title" className="mt-2 text-2xl font-black tracking-[-0.04em] text-stone-950 sm:text-3xl">
            Znajdź rozwiązanie, nie kolejny długi artykuł
          </h2>
        </div>
        <span className="rounded-full border border-rose-100 bg-white px-4 py-2 text-xs font-bold text-stone-600">
          {guides.length} praktycznych poradników
        </span>
      </div>
      <div className="mt-7 rounded-[26px] border border-rose-100 bg-white p-4 shadow-[0_10px_28px_rgba(136,19,55,0.035)] sm:p-5">
        <label htmlFor="guide-search" className="mb-2 block text-xs font-bold text-stone-700">
          Czego chcesz się dowiedzieć?
        </label>
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400">
            <circle cx="10.7" cy="10.7" r="6.2"/><path d="m15.3 15.3 5.2 5.2"/>
          </svg>
          <input id="guide-search" type="search" enterKeyHint="search" value={query}
            onChange={(event) => setQuery(event.target.value)} maxLength={100}
            placeholder="Np. rozmiar online, praca, 100 zł, kolory..."
            className="min-h-12 w-full rounded-2xl border border-stone-200 bg-[#fbfafb] py-3 pl-12 pr-12 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"/>
          {query && (
            <button type="button" aria-label="Wyczyść wyszukiwanie poradników" onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-xl text-stone-500 hover:bg-rose-50">
              ×
            </button>
          )}
        </div>
        <div role="group" aria-label="Filtr tematów poradników" className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button type="button" key={item} onClick={() => setTopic(item)}
              aria-pressed={item === topic}
              className={["min-h-11 rounded-full border px-4 text-xs font-extrabold transition active:scale-[0.98]",
                item === topic ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                  : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50"].join(" ")}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-5 text-sm font-semibold text-stone-500">
        {visible.length === guides.length
          ? `Wszystkie poradniki · ${visible.length}`
          : `Znaleziono poradniki: ${visible.length}`}
      </p>
      {visible.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((guide) => (
            <article key={guide.slug}
              className="group flex min-w-0 flex-col overflow-hidden rounded-[27px] border border-stone-200 bg-white shadow-[0_10px_30px_rgba(30,20,25,0.035)] transition duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg">
              <Link href={"/poradniki/" + guide.slug} aria-label={"Otwórz poradnik: " + guide.title}
                className={`relative block aspect-[16/8.5] overflow-hidden bg-gradient-to-br ${COLORS[guide.topic]}`}>
                {guide.image ? (
                  <ProductPhoto src={guide.image.src} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"/>
                ) : (
                  <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[32px] border border-white/80 bg-white/65 text-5xl font-black text-rose-700 shadow-xl backdrop-blur-sm">
                      {ICONS[guide.topic]}
                    </div>
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full border border-white bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-rose-800 shadow-sm">
                  {guide.category}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-semibold text-stone-400">Praktyczny poradnik · ok. {guide.readMinutes} min</p>
                <h3 className="mt-2 text-xl font-black leading-snug tracking-tight text-stone-950">
                  <Link href={"/poradniki/" + guide.slug} className="focus-visible:rounded focus-visible:outline-2 focus-visible:outline-rose-500 group-hover:text-rose-700">
                    {guide.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{guide.summary}</p>
                <div className="mt-4 rounded-2xl bg-[#fff7f8] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-rose-800">Zrobisz od razu</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-stone-700">{guide.quickSteps[0]}</p>
                </div>
                <Link href={"/poradniki/" + guide.slug}
                  className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 pt-5 text-sm font-black text-rose-700">
                  Zobacz konkretne kroki <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[26px] border border-dashed border-rose-200 bg-white px-5 py-10 text-center">
          <p className="text-lg font-black text-stone-900">Nie znaleźliśmy takiego poradnika</p>
          <p className="mt-2 text-sm text-stone-600">Spróbuj hasła „rozmiar”, „budżet” lub wybierz wszystkie tematy.</p>
          <button type="button" onClick={() => { setQuery(""); setTopic("Wszystkie"); }}
            className="mt-5 min-h-11 rounded-xl bg-rose-600 px-5 text-sm font-black text-white">
            Pokaż wszystkie poradniki
          </button>
        </div>
      )}
    </section>
  );
}
