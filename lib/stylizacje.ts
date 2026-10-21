import type { Product } from "@/lib/products";

export type LookConfig = {
  slug: string;
  title: string;
  occasion: string;
  style: string;
  intro: string;
  tip: string;
  whyItWorks: readonly string[];
  excluded: string;
  maxBudget: number;
  productSlugs: readonly string[];
};

export const LOOKS: readonly LookConfig[] = [
  {
    slug: "casual-do-150-zl",
    title: "Czarny casual do 150 zł",
    occasion: "Na co dzień",
    style: "Casual z detalem",
    intro: "Czarny top z kwadratowym dekoltem i spodnie z asymetryczną talią — zestaw oparty na dwóch dopasowanych kolorystycznie elementach.",
    tip: "Sprawdź wymiary w talii i długość nogawek; oznaczenie rozmiaru może różnić się między modelami.",
    whyItWorks: [
      "Czarny top z długim rękawem i kwadratowym dekoltem stanowi prostą bazę.",
      "Spodnie z talią w kształcie litery V dodają charakteru bez potrzeby dokupowania dodatków.",
    ],
    excluded: "Buty, torba i biżuteria nie są wliczone do ceny.",
    maxBudget: 150,
    productSlugs: ["damski-dopasowany-basic-t-shirt", "damskie-czarne-casualowe-spodnie"],
  },
  {
    slug: "do-pracy-do-150-zl",
    title: "Prosty zestaw do pracy do 150 zł",
    occasion: "Do pracy",
    style: "Smart casual",
    intro: "Bluzka z długim rękawem i wiązaniem zestawiona z czarnymi spodniami o prostych nogawkach.",
    tip: "Sprawdź materiał bluzki i tabelę rozmiarów obu produktów; poziom formalności zależy od miejsca pracy.",
    whyItWorks: [
      "Wiązanie i kontrastowe wykończenie bluzki stanowią subtelny element dekoracyjny.",
      "Czarne spodnie z wysokim stanem i prostymi nogawkami są neutralnym uzupełnieniem góry.",
    ],
    excluded: "Obuwie, okrycie wierzchnie i torba nie są wliczone do ceny.",
    maxBudget: 150,
    productSlugs: ["bluzka-damska-z-dlugim-rekawem", "damskie-eleganckie-casualowe-spodnie"],
  },
  {
    slug: "weekend-do-150-zl",
    title: "Luźny weekend do 150 zł",
    occasion: "Na weekend",
    style: "Swobodny casual",
    intro: "Koszula w kratę o luźnym kroju i letnie jeansy z prostymi nogawkami oraz talią paperbag.",
    tip: "Koszula ma luźny krój, a jeansy talię paperbag; zwróć uwagę na rzeczywiste wymiary i materiał.",
    whyItWorks: [
      "Kraciasta koszula wprowadza wzór, a prosta nogawka jeansów równoważy luźną górę.",
      "Obie rzeczy można nosić osobno z innymi ubraniami z własnej szafy.",
    ],
    excluded: "Buty i akcesoria nie należą do zestawu; nie obejmuje on również dostawy.",
    maxBudget: 150,
    productSlugs: ["damska-koszula-na-co-dzien-o-luznym-kroju", "damskie-letnie-jeansy-z-prostymi-nogawkami"],
  },
  {
    slug: "jesienny-look-do-200-zl",
    title: "Zestaw z trenczem do 200 zł",
    occasion: "Na chłodniejsze dni",
    style: "Warstwowy casual",
    intro: "Top z koronkowymi detalami, jeansy i krótki beżowy trencz — trzy elementy na przejściową pogodę.",
    tip: "Sprawdź, czy trencz odpowiada oczekiwanej porze roku; oferta nie potwierdza wodoodporności ani ocieplenia.",
    whyItWorks: [
      "Beżowy krótki trencz może pełnić funkcję wierzchniej warstwy na chłodniejsze dni.",
      "Top z ozdobnymi detalami tworzy kontrast z jeansami i pozwala zdjąć trencz w pomieszczeniu.",
    ],
    excluded: "Obuwie, torba oraz dodatki nie są ujęte w sumie; trencz nie zastępuje kurtki zimowej.",
    maxBudget: 200,
    productSlugs: ["damski-top-bazowy-z-wstawkam", "damskie-zwezane-jeansy", "bezowy-luzny-krotki-trencz"],
  },
  {
    slug: "streetwear-do-100-zl",
    title: "Streetwear do 100 zł",
    occasion: "Na co dzień",
    style: "Streetwear",
    intro: "Sweter z krótkim rękawem zestawiony z jeansami we wzór kamuflażu — wyrazista, codzienna propozycja.",
    tip: "Wzór moro przyciąga uwagę. Przed zakupem sprawdź pas jeansów oraz to, że sweter ma krótki rękaw.",
    whyItWorks: [
      "Jeansy z kamuflażowym wzorem są wyrazistym elementem całego zestawu.",
      "Sweter o jednolitym kolorze i krótkim rękawie pozwala zachować równowagę między wzorem a górą.",
    ],
    excluded: "Buty, kurtka i dodatki nie są wliczone do sumy.",
    maxBudget: 100,
    productSlugs: ["damski-sweter-casualowy-w-kolorze", "damskie-jeansy-z-wzorem"],
  },
];

export type ResolvedLook = LookConfig & {
  products: Product[];
  total: number;
  missing: number;
  withinBudget: boolean;
  available: boolean;
};

/**
 * Resolves outfit configurations against current active catalog records.
 * Do not expose inactive, incomplete or over-budget outfits in navigation.
 */
export function resolveLooks(products: Product[]): ResolvedLook[] {
  const lookup = new Map(products.filter((p) => p.active).map((p) => [p.slug, p]));
  return LOOKS.map((look) => {
    const found = look.productSlugs.map((slug) => lookup.get(slug));
    const selected = found.filter((p): p is Product => Boolean(p));
    const validPrices = selected.every(
      (p) => Number.isFinite(p.price) && p.price >= 0
    );
    // Sum in grosze so decimal prices do not introduce rounding drift.
    const totalCents = validPrices
      ? selected.reduce((sum, p) => sum + Math.round(p.price * 100), 0)
      : NaN;
    const total = totalCents / 100;
    const missing = found.length - selected.length;
    const withinBudget = validPrices && totalCents <= Math.round(look.maxBudget * 100);
    const distinctProducts = new Set(look.productSlugs).size === look.productSlugs.length;
    return {
      ...look,
      products: selected,
      total,
      missing,
      withinBudget,
      available: missing === 0 && distinctProducts && withinBudget,
    };
  });
}

/** Active outfits that include the given product in the current catalog. */
export function getLooksForProduct(
  looks: readonly ResolvedLook[],
  productSlug: string
): ResolvedLook[] {
  return looks.filter(
    (look) =>
      look.available &&
      look.products.some((product) => product.slug === productSlug)
  );
}

/** Active outfits containing at least one product in a category. */
export function getLooksForCategory(
  looks: readonly ResolvedLook[],
  category: string
): ResolvedLook[] {
  const normalizedCategory = category.trim().toLocaleLowerCase("pl-PL");
  if (!normalizedCategory) return [];

  return looks.filter(
    (look) =>
      look.available &&
      look.products.some(
        (product) =>
          product.category.trim().toLocaleLowerCase("pl-PL") ===
          normalizedCategory
      )
  );
}
