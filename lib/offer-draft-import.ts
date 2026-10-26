/** Safe semicolon CSV / tab-separated import for manually reviewed merchant offer drafts. */
export const OFFER_IMPORT_HEADER = "sklep;tytul;opis;typ;kod;data;link";
export const MAX_IMPORT_ROWS = 20;

export type OfferDraft = {
  storeSlug: string;
  title: string;
  description: string;
  offerType: "coupon" | "campaign" | "promotion";
  code: string | null;
  validUntil: string | null;
  destinationUrl: string | null;
};

export function offerDraftFingerprint(
  row: Pick<OfferDraft, "storeSlug" | "title" | "offerType" | "code">,
): string {
  const key = row.offerType === "promotion" ? row.title : (row.code || "");
  return [row.storeSlug, row.offerType, key.trim().toLocaleLowerCase("pl").replace(/\s+/g, " ")].join("::");
}

export function parseOfferDraftTable(source: string):
  | { rows: OfferDraft[] }
  | { error: string } {
  if (typeof source !== "string" || source.length > 32000)
    return { error: "Tabela jest zbyt długa (maksymalnie 32 000 znaków)." };
  // Preserve trailing tabs: spreadsheets use them for empty optional columns.
  const text = source.replace(/^\uFEFF/, "");
  if (!text.trim()) return { error: "Wklej tabelę zawierającą nagłówek i oferty." };
  const delimiter = text.split(/\r?\n/, 1)[0].includes("\t") ? "\t" : ";";
  const records: string[][] = [];
  let current = "", fields: string[] = [], quote = false, closed = false;
  const push = () => {
    fields.push(current.trim());
    if (fields.some(field => field.length > 0)) records.push(fields);
    current = ""; fields = []; closed = false;
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quote && text[i + 1] === '"') { current += '"'; i++; }
      else if (quote) { quote = false; closed = true; }
      else if (!closed && !current.trim()) { quote = true; }
      else return { error: "Nieprawidłowy cudzysłów w tabeli." };
    } else if (!quote && (char === delimiter || char === "\n" || char === "\r")) {
      if (char === delimiter) {
        fields.push(current.trim()); current = ""; closed = false;
      } else {
        push();
        if (char === "\r" && text[i + 1] === "\n") i++;
      }
    } else if (closed && !/^\s$/.test(char)) {
      return { error: "Po zamknięciu cudzysłowu użyj separatora kolumn." };
    } else {
      current += char;
    }
    if (records.length > MAX_IMPORT_ROWS + 1) return { error: "Jednorazowo możesz importować maksymalnie 20 ofert." };
  }
  if (quote) return { error: "W tabeli pozostawiono niedomknięty cudzysłów." };
  push();
  const expected = OFFER_IMPORT_HEADER.split(";");
  if (records.length === 0 || records[0].length !== expected.length ||
    records[0].some((field, i) => field.toLocaleLowerCase("pl") !== expected[i]))
    return { error: "Pierwszy wiersz musi zawierać: " + OFFER_IMPORT_HEADER };
  if (records.length < 2) return { error: "Pod nagłówkiem dodaj co najmniej jedną ofertę." };
  if (records.length > MAX_IMPORT_ROWS + 1) return { error: "Jednorazowo możesz importować maksymalnie 20 ofert." };
  for (let i = 1; i < records.length; i++) {
    if (records[i].length !== 7) return { error: "Wiersz " + (i + 1) + " musi zawierać dokładnie 7 kolumn." };
  }
  return {
    rows: records.slice(1).map(fields => ({
      storeSlug: fields[0],
      title: fields[1],
      description: fields[2],
      offerType: fields[3] as OfferDraft["offerType"],
      code: fields[4] || null,
      validUntil: fields[5] || null,
      destinationUrl: fields[6] || null,
    })),
  };
}
