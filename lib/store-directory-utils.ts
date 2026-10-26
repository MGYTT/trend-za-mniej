/** Pure helpers for the public merchant directory (no invented offers or discounts). */
export type DirectoryStore = {
  slug: string;
  name: string;
  category: string;
  description: string;
  offerCount: number;
};

export type DirectoryMode = "all" | "available" | "favourites";
export type DirectorySort = "recommended" | "alphabetical";
export type DirectoryFilters = {
  query: string;
  category: string;
  mode: DirectoryMode;
  sort: DirectorySort;
};

const collator = new Intl.Collator("pl", { sensitivity: "base", numeric: true });

export function normalizeDirectoryText(input: string): string {
  return input.toLocaleLowerCase("pl").replace(/ł/g, "l")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
}

export function offerCountLabel(count: number): string {
  const value = Math.max(0, Math.floor(count));
  const last = value % 10;
  const teen = value % 100;
  const suffix = value === 1 ? "oferta"
    : last >= 2 && last <= 4 && (teen < 12 || teen > 14) ? "oferty" : "ofert";
  return value + " " + suffix;
}

export function selectDirectoryStores<T extends DirectoryStore>(
  stores: readonly T[],
  filters: DirectoryFilters,
  favourites: readonly string[],
): T[] {
  const tokens = normalizeDirectoryText(filters.query).split(" ").filter(Boolean);
  const saved = new Set(favourites);
  return stores.filter(store => {
    if (filters.category !== "all" && store.category !== filters.category) return false;
    if (filters.mode === "available" && store.offerCount === 0) return false;
    if (filters.mode === "favourites" && !saved.has(store.slug)) return false;
    const haystack = normalizeDirectoryText(
      [store.name, store.category, store.description, store.slug].join(" "),
    );
    return tokens.every(token => haystack.includes(token));
  }).sort((a, b) => {
    if (filters.sort === "recommended" && a.offerCount !== b.offerCount) {
      return b.offerCount - a.offerCount;
    }
    return collator.compare(a.name, b.name);
  });
}
