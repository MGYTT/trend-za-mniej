import type { PromotionDraft } from "@/lib/promotion-draft-assistant";

export default function PromotionSeoPreview({ draft }: { draft: PromotionDraft | null }) {
 if (!draft) return null;
 return (
  <section aria-label="Podgląd SEO i kontrola treści" className="mt-4 min-w-0 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:p-5">
   <p className="text-xs font-black uppercase tracking-wide text-rose-700">Asystent treści · podgląd SEO</p>
   <p className="mt-2 text-xs leading-5 text-stone-600">
    To propozycja na podstawie Twojego tekstu, bez sprawdzania oferty na żywo. SEO korzysta z tytułu i opisu w formularzu; lista fraz to wskazówki redakcyjne, nie osobne tagi meta.
   </p>
   <div className="mt-3 min-w-0 rounded-xl border border-stone-200 bg-white p-4">
    <p className="break-words text-[11px] font-semibold text-emerald-700">trendzamniej.pl · propozycja wyniku wyszukiwania</p>
    <p className="mt-1 break-words text-base font-bold leading-6 text-blue-800">{draft.seoTitle}</p>
    <p className="mt-1 break-words text-xs leading-5 text-stone-600">{draft.seoDescription}</p>
   </div>
   <p className="mt-4 text-xs font-black text-stone-800">Proponowane słowa kluczowe</p>
   <div className="mt-2 flex flex-wrap gap-2">
    {draft.keywords.map((keyword) => (
     <span key={keyword} className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800">{keyword}</span>
    ))}
   </div>
   <p className="mt-4 text-xs font-black text-stone-800">Kontrola przed publikacją</p>
   <ul className="mt-2 space-y-2 text-xs leading-5 text-amber-950">
    {draft.warnings.map((warning) => <li key={warning} className="rounded-lg bg-amber-50 px-3 py-2">⚠ {warning}</li>)}
    <li className="rounded-lg bg-amber-50 px-3 py-2">⚠ Sprawdź kod, typ promocji, adres docelowy i rzeczywiste warunki bezpośrednio u partnera.</li>
   </ul>
  </section>
 );
}
