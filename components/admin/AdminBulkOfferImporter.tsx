"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreRecord } from "@/lib/stores";
import type { ExtensionOfferRow } from "@/components/admin/AdminCouponStudio";
import { validateExtensionOffer } from "@/lib/extension-offer-validation";
import { merchantDestination } from "@/lib/store-destination";
import {
  OFFER_IMPORT_HEADER, MAX_IMPORT_ROWS, offerDraftFingerprint, parseOfferDraftTable,
  type OfferDraft,
} from "@/lib/offer-draft-import";

type Preview = { row: OfferDraft; error: string | null; line: number };

export default function AdminBulkOfferImporter({
  stores, existingOffers,
}: { stores: StoreRecord[]; existingOffers: ExtensionOfferRow[] }) {
  const router = useRouter();
  const [table, setTable] = useState(OFFER_IMPORT_HEADER + "\n");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const preview = useMemo((): { rows: Preview[]; error: string | null } => {
    const parsed = parseOfferDraftTable(table);
    if ("error" in parsed) return { rows: [], error: parsed.error };
    const known = new Set(existingOffers.filter(item => item.store_slug).map(item => offerDraftFingerprint({
      storeSlug: item.store_slug || "", title: item.title,
      offerType: item.offer_type, code: item.code,
    })));
    const encountered = new Set<string>();
    const rows = parsed.rows.map((row, index): Preview => {
      const store = stores.find(item => item.slug === row.storeSlug);
      let error: string | null = null;
      if (!store) error = "Nieznany sklep — dodaj go najpierw w panelu.";
      else if (row.offerType === "promotion" && row.code)
        error = "Promocja bez kodu musi mieć pustą kolumnę kod.";
      else {
        const checked = validateExtensionOffer({
          ...row, id: null, storeName: store.name, storeDomains: store.domains,
          pagePath: "/kody-rabatowe/" + store.slug,
          published: false, verified: false,
        });
        if ("error" in checked) error = checked.error;
        else if (row.destinationUrl && !merchantDestination(row.destinationUrl, store.domains))
          error = "Link musi prowadzić na oficjalną domenę sklepu.";
      }
      const fingerprint = offerDraftFingerprint(row);
      if (!error && (known.has(fingerprint) || encountered.has(fingerprint)))
        error = "Podobna oferta istnieje już w bazie lub w tej tabeli.";
      encountered.add(fingerprint);
      return { row, error, line: index + 2 };
    });
    return { rows, error: null };
  }, [table, stores, existingOffers]);

  const errors = preview.rows.filter(item => item.error);
  const ready = !preview.error && preview.rows.length > 0 && errors.length === 0;

  async function importDrafts() {
    if (busy || !ready || !window.confirm(
      "Zapisać " + preview.rows.length + " ofert jako SZKICE? Żadna nie będzie opublikowana."
    )) return;
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/extension-offers/import", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview.rows.map(item => item.row) }),
      });
      const result = await response.json() as { error?: string; created?: number; published?: number };
      if (!response.ok) {
        setMessage({ error: true, text: result.error || "Import się nie powiódł." }); return;
      }
      setTable(OFFER_IMPORT_HEADER + "\n");
      setMessage({ error: false, text: "Zapisano " + result.created + " szkiców. Każdą ofertę sprawdź i opublikuj w edytorze poniżej." });
      router.refresh();
    } catch {
      setMessage({ error: true, text: "Nie można połączyć się z serwerem." });
    } finally { setBusy(false); }
  }

  return (
    <section id="szybki-import" aria-labelledby="bulk-import-heading"
      className="mt-8 rounded-3xl border border-rose-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-700">Szybkie dodawanie</p>
          <h2 id="bulk-import-heading" className="mt-2 text-xl font-black sm:text-2xl">Importuj oferty jako szkice</h2>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          Maksymalnie {MAX_IMPORT_ROWS} ofert naraz
        </span>
      </div>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-600">
        Skopiuj wiersze z arkusza albo wklej tabelę CSV oddzieloną średnikami.
        Pierwszy wiersz musi zawierać poniższe nazwy kolumn. Import zapisuje wyłącznie
        nieopublikowane szkice; kod i warunki należy zweryfikować osobno przed publikacją.
        SHEIN ma własny menedżer kampanii.
      </p>
      <div className="mt-4 rounded-xl bg-stone-50 p-4">
        <p className="text-xs font-bold text-stone-700">Wymagane kolumny</p>
        <code className="mt-2 block overflow-x-auto text-xs leading-6 text-stone-800">{OFFER_IMPORT_HEADER}</code>
        <p className="mt-2 text-xs leading-6 text-stone-500">
          <strong>sklep</strong> = identyfikator z katalogu (np. zalando); <strong>typ</strong> =
          coupon, campaign lub promotion; <strong>kod</strong> jest pusty dla promotion;
          <strong>data</strong> = RRRR-MM-DD; <strong>link</strong> = oficjalna domena sklepu.
          Pola data i link są opcjonalne. Użyj cudzysłowów przy średnikach w opisach.
        </p>
      </div>
      <label htmlFor="bulk-offer-paste" className="mt-5 block text-sm font-black text-stone-900">
        Wklej tabelę ofert
      </label>
      <textarea id="bulk-offer-paste" value={table} maxLength={32000}
        onChange={event => { setTable(event.target.value); setMessage(null); }}
        rows={7} spellCheck={false}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-xs leading-6 outline-none focus:border-rose-500"
        aria-describedby="bulk-import-description" />
      <p id="bulk-import-description" className="mt-2 text-xs text-stone-500">
        Tabela jest analizowana lokalnie. Serwer ponownie weryfikuje dane, domeny i duplikaty przed zapisem.
      </p>

      {preview.error ? (
        <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">{preview.error}</p>
      ) : (
        <div className="mt-5">
          <h3 className="text-sm font-black">Podgląd przed importem: {preview.rows.length} ofert</h3>
          <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[670px] text-left text-xs">
              <thead className="sticky top-0 bg-stone-100">
                <tr>
                  <th className="p-3">Wiersz</th><th className="p-3">Sklep</th>
                  <th className="p-3">Tytuł</th><th className="p-3">Rodzaj / kod</th><th className="p-3">Weryfikacja</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map(item => (
                  <tr key={item.line} className="border-t border-stone-100">
                    <td className="p-3 font-bold">{item.line}</td>
                    <td className="p-3">{item.row.storeSlug}</td>
                    <td className="p-3">{item.row.title}</td>
                    <td className="p-3">{item.row.offerType} {item.row.code && "· " + item.row.code}</td>
                    <td className={"p-3 font-semibold " + (item.error ? "text-rose-800" : "text-emerald-800")}>
                      {item.error || "Gotowe do zapisania jako szkic"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.length > 0 && (
            <p role="status" className="mt-3 text-xs font-bold text-rose-800">
              Popraw {errors.length} wierszy. Przy błędzie żaden wpis nie zostanie zaimportowany.
            </p>
          )}
        </div>
      )}
      {message && (
        <p role="status" className={"mt-4 rounded-xl p-4 text-sm font-semibold " +
          (message.error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-900")}>
          {message.text}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!ready || busy} onClick={() => void importDrafts()}
          className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Zapisuję…" : "Zapisz " + preview.rows.length + " ofert jako szkice"}
        </button>
        <button type="button" disabled={busy} onClick={() => { setTable(OFFER_IMPORT_HEADER + "\n"); setMessage(null); }}
          className="min-h-11 rounded-xl border border-stone-200 bg-white px-4 text-xs font-black text-stone-700">
          Wyczyść tabelę
        </button>
      </div>
    </section>
  );
}
