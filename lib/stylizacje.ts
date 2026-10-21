import type { Product } from "@/lib/products";

export type LookConfig = {
  slug: string;
  title: string;
  occasion: string;
  style: string;
  intro: string;
  tip: string;
  productSlugs: readonly string[];
};

export const LOOKS: readonly LookConfig[] = [
  {
    slug: "casual-do-150-zl",
    title: "Casual do 150 zł",
    occasion: "Na co dzień",
    style: "Casual",
    intro: "Prosty zestaw na zwykły dzień: dopasowana góra i wygodne spodnie.",
    tip: "Sprawdź tabelę rozmiarów obu produktów — dopasowanie jest ważniejsze niż oznaczenie S/M/L.",
    productSlugs: ["damski-dopasowany-basic-t-shirt", "damskie-czarne-casualowe-spodnie"],
  },
  {
    slug: "do-pracy-do-150-zl",
    title: "Do pracy do 150 zł",
    occasion: "Do pracy",
    style: "Smart casual",
    intro: "Neutralna bluzka i spodnie z wysokim stanem tworzą prostą bazę do pracy.",
    tip: "Przed zakupem sprawdź skład materiałów oraz zasady ubioru w miejscu pracy.",
    productSlugs: ["bluzka-damska-z-dlugim-rekawem", "damskie-eleganckie-casualowe-spodnie"],
  },
  {
    slug: "weekend-do-150-zl",
    title: "Weekend do 150 zł",
    occasion: "Na weekend",
    style: "Luźny",
    intro: "Luźna koszula i jeansy do swobodnego zestawu weekendowego.",
    tip: "To zestaw dwóch elementów, bez butów i dodatków. Sprawdź długość nogawek przed zakupem.",
    productSlugs: ["damska-koszula-na-co-dzien-o-luznym-kroju", "damskie-letnie-jeansy-z-prostymi-nogawkami"],
  },
  {
    slug: "jesienny-look-do-200-zl",
    title: "Jesienny look do 200 zł",
    occasion: "Na chłodniejsze dni",
    style: "Warstwowy",
    intro: "Top, jeansy i lekki trencz — zestaw z dodatkową warstwą na przejściową pogodę.",
    tip: "Trencz może nie wystarczyć w deszczu lub zimnie; sprawdź parametry materiału i wymiary.",
    productSlugs: ["damski-top-bazowy-z-wstawkam", "damskie-zwezane-jeansy", "bezowy-luzny-krotki-trencz"],
  },
  {
    slug: "sweter-i-jeansy-do-100-zl",
    title: "Sweter i jeansy do 100 zł",
    occasion: "Na co dzień",
    style: "Minimalistyczny",
    intro: "Dwie proste rzeczy tworzą bazę codziennej stylizacji.",
    tip: "Kwota obejmuje wyłącznie te dwa produkty, bez dostawy i dodatków.",
    productSlugs: ["damski-sweter-casualowy-w-kolorze", "damskie-jeansy-z-wzorem"],
  },
];

export type ResolvedLook = LookConfig & {
  products: Product[];
  total: number;
  missing: number;
  available: boolean;
};

export function resolveLooks(products: Product[]): ResolvedLook[] {
  const lookup = new Map(products.filter((p) => p.active).map((p) => [p.slug, p]));
  return LOOKS.map((look) => {
    const found = look.productSlugs.map((slug) => lookup.get(slug));
    const selected = found.filter((p): p is Product => Boolean(p));
    const total = Math.round(selected.reduce((sum, p) => sum + p.price, 0) * 100) / 100;
    return {
      ...look,
      products: selected,
      total,
      missing: found.length - selected.length,
      available: selected.length === look.productSlugs.length && selected.every((p) => Number.isFinite(p.price) && p.price >= 0),
    };
  });
}
