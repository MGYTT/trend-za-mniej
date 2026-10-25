/** Pure validation is shared by API and tests. Prices are recalculated on the server. */
export type CatalogChoice = { id: string; price: number | string; active: boolean };

export type OutfitInput = {
  slug: string;
  title: string;
  occasion: string;
  style: string;
  intro: string;
  tip: string;
  whyItWorks: string[];
  excluded: string;
  productIds: string[];
  published: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function recommendedBudget(total: number): number {
  if (!Number.isFinite(total) || total <= 0 || total > 1000) return 0;
  const cents = Math.round(total * 100);
  for (const budget of [100, 150, 200]) {
    if (cents <= budget * 100) return budget;
  }
  return Math.ceil(cents / 5000) * 50;
}

export function validateOutfitInput(
  input: unknown,
  catalog: readonly CatalogChoice[]
): { value: OutfitInput & { maxBudget: number; total: number } } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Nieprawidłowe dane stylizacji." };
  const obj = input as Record<string, unknown>;
  const text = (key: string, min: number, max: number) => {
    const value = obj[key];
    return typeof value === "string" && value.trim().length >= min && value.trim().length <= max ? value.trim() : null;
  };
  const slug = text("slug", 5, 90);
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "Adres stylizacji musi mieć 5–90 znaków: małe litery, cyfry i myślniki." };
  const title = text("title", 8, 120);
  const occasion = text("occasion", 2, 80);
  const style = text("style", 2, 80);
  const intro = text("intro", 30, 700);
  const tip = text("tip", 20, 700);
  const excluded = text("excluded", 15, 500);
  if (!title || !occasion || !style || !intro || !tip || !excluded) return { error: "Uzupełnij opisy, okazję, styl i informacje o wyłączeniach." };
  const why = obj.whyItWorks;
  if (!Array.isArray(why) || why.length !== 2 || !why.every((x) => typeof x === "string" && x.trim().length >= 15 && x.trim().length <= 350)) return { error: "Podaj dwa powody, dla których elementy pasują do siebie (min. 15 znaków każdy)." };
  const ids = obj.productIds;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 6 || !ids.every((id) => typeof id === "string" && uuidPattern.test(id)) || new Set(ids).size !== ids.length) return { error: "Wybierz 2–6 różnych produktów z katalogu." };
  if (typeof obj.published !== "boolean") return { error: "Nieprawidłowy status publikacji." };
  const products = new Map(catalog.map((p) => [p.id, p]));
  let totalCents = 0;
  for (const id of ids as string[]) {
    const product = products.get(id);
    const price = Number(product?.price);
    if (!product?.active || !Number.isFinite(price) || price <= 0) return { error: "Wybrany produkt jest nieaktywny lub ma nieprawidłową cenę." };
    totalCents += Math.round(price * 100);
  }
  const total = totalCents / 100;
  const maxBudget = recommendedBudget(total);
  if (!maxBudget) return { error: "Zestaw przekracza limit 1000 zł lub ma nieprawidłową sumę cen." };
  return {
    value: {
      slug, title, occasion, style, intro, tip, excluded,
      whyItWorks: why.map((x: string) => x.trim()),
      productIds: [...ids] as string[], published: obj.published,
      maxBudget, total,
    },
  };
}
