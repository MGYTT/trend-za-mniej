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
    intro: "Czarny total look z charakterem: dopasowana góra z kwadratowym dekoltem i spodnie z asymetryczną talią. Dwa elementy, które mogą działać także osobno z Twoją garderobą.",
    tip: "Porównaj obwód talii i długość nogawek z własnymi spodniami. Zwróć uwagę na długość góry, aby nie zasłaniała ozdobnego wykończenia pasa.",
    whyItWorks: [
      "Czarny top z długim rękawem i kwadratowym dekoltem stanowi prostą bazę.",
      "Spodnie z talią w kształcie litery V dodają charakteru bez potrzeby dokupowania dodatków.",
    ],
    excluded: "Buty, torba i biżuteria nie są wliczone do ceny.",
    maxBudget: 150,
    productSlugs: ["damski-dopasowany-basic-t-shirt", "damskie-czarne-casualowe-spodnie"],
  },
  {
    slug: "minimalizm-bez-i-czern-do-100-zl",
    title: "Beż i czerń do 100 zł",
    occasion: "Na co dzień",
    style: "Minimalizm",
    intro: "Beżowy dzianinowy top z krótkim rękawem i czarne spodnie z szeroką nogawką. Spokojne połączenie, do którego możesz dobrać buty i dodatki ze swojej szafy.",
    tip: "Dopasuj proporcje: sprawdź długość topu i stan spodni. Przy szerokiej nogawce zweryfikuj długość do posiadanego obuwia.",
    whyItWorks: [
      "Gładki beżowy top jest łagodnym kontrastem do czarnych spodni i nie konkuruje z szerokim krojem nogawki.",
      "Dwa neutralne kolory pozwalają uzupełnić komplet własnymi dodatkami, bez wymyślania osobnej palety całego stroju."
    ],
    excluded: "Buty, torba, okrycie i biżuteria nie należą do zestawu; suma nie obejmuje dostawy.",
    maxBudget: 100,
    productSlugs: ["bezowy-dzianinowy-top-damski", "czarne-spodnie-damskie-z-szerokimi-nogawkami"],
  },
  {
    slug: "do-pracy-do-150-zl",
    title: "Prosty zestaw do pracy do 150 zł",
    occasion: "Do pracy",
    style: "Smart casual",
    intro: "Bluzka z wiązaniem nadaje temu zestawowi charakteru, a czarne spodnie z prostą nogawką utrzymują spokojny, biurowy wygląd. Baza do pracy przy swobodniejszym dress codzie.",
    tip: "Sprawdź skład i prześwitywanie bluzki, długość nogawek oraz firmowe zasady ubioru. Formalność stroju zależy od miejsca pracy, nie od samej nazwy produktu.",
    whyItWorks: [
      "Wiązanie i kontrastowe wykończenie bluzki stanowią subtelny element dekoracyjny.",
      "Czarne spodnie z wysokim stanem i prostymi nogawkami są neutralnym uzupełnieniem góry.",
    ],
    excluded: "Obuwie, okrycie wierzchnie i torba nie są wliczone do ceny.",
    maxBudget: 150,
    productSlugs: ["bluzka-damska-z-dlugim-rekawem", "damskie-eleganckie-casualowe-spodnie"],
  },
  {
    slug: "wygodny-luz-do-100-zl",
    title: "Wygodny luz do 100 zł",
    occasion: "Na weekend",
    style: "Sportowy casual",
    intro: "Biała bluza z kapturem i spodnie o swobodnej, szerokiej nogawce. Propozycja na spokojny dzień, drogę na zajęcia lub odpoczynek, bez udawania stroju do intensywnego treningu.",
    tip: "Zwróć uwagę na faktyczną długość bluzy i spodni oraz kolor wybranego wariantu. Nazwa spodni nie potwierdza przydatności do konkretnej aktywności sportowej.",
    whyItWorks: [
      "Prosta biała bluza stanowi jasną bazę, a luźniejsza dolna część nadaje zestawowi swobodny charakter.",
      "Oba elementy możesz nosić niezależnie; przed zakupem sprawdź, czy spodnie mają oczekiwany kolor i skład materiału."
    ],
    excluded: "Obuwie sportowe, torba, kurtka i ewentualna dostawa są poza sumą zestawu.",
    maxBudget: 100,
    productSlugs: ["biala-bluza-damska-z-kapturem-attitoon", "spodnie-do-jogi-z-szerokimi-nogawkami"],
  },
  {
    slug: "weekend-do-150-zl",
    title: "Luźny weekend do 150 zł",
    occasion: "Na weekend",
    style: "Swobodny casual",
    intro: "Kraciasta, luźna koszula i jeansy z talią paperbag tworzą weekendową bazę do spaceru czy spotkania. Własne buty i okrycie dobierz do pogody.",
    tip: "Luźna koszula może zakrywać podwyższoną talię jeansów. Sprawdź długość obu elementów i porównaj rozmiary z rzeczami, które już nosisz.",
    whyItWorks: [
      "Kraciasta koszula wprowadza wzór, a prosta nogawka jeansów równoważy luźną górę.",
      "Obie rzeczy można nosić osobno z innymi ubraniami z własnej szafy.",
    ],
    excluded: "Buty i akcesoria nie należą do zestawu; nie obejmuje on również dostawy.",
    maxBudget: 150,
    productSlugs: ["damska-koszula-na-co-dzien-o-luznym-kroju", "damskie-letnie-jeansy-z-prostymi-nogawkami"],
  },
  {
    slug: "dzianina-i-denim-do-150-zl",
    title: "Dzianina i denim do 150 zł",
    occasion: "Na chłodniejsze dni",
    style: "Codzienny denim",
    intro: "Jednokolorowy sweter typu pullover i jeansy o zwężanym kroju tworzą prostą bazę na chłodniejsze dni. Ostateczny efekt zależy od wybranego koloru i fasonu.",
    tip: "Sprawdź skład i grubość swetra, odcień dostępnego wariantu oraz obwód i długość jeansów. Nie traktuj nazwy swetra jako gwarancji ocieplenia.",
    whyItWorks: [
      "Gładka góra uspokaja stylizację, a denim dodaje jej codziennego charakteru bez dodatkowych wzorów.",
      "Sweter możesz łączyć z innymi spodniami, a jeansy z koszulą; zestaw nie wymaga zakupu nowej torby czy butów."
    ],
    excluded: "Buty, kurtka, torba i koszt dostawy nie są wliczone; odporność na chłód zależy od materiału.",
    maxBudget: 150,
    productSlugs: ["jednokolorowy-casualowy-sweter-pullover", "damskie-zwezane-jeansy"],
  },
  {
    slug: "jesienny-look-do-200-zl",
    title: "Zestaw z trenczem do 200 zł",
    occasion: "Na chłodniejsze dni",
    style: "Warstwowy casual",
    intro: "Trzy warstwy na przejściową pogodę: top z ozdobnymi detalami, jeansy i krótki beżowy trencz. To inspiracja na łagodne dni, nie zastępstwo ocieplanej kurtki.",
    tip: "Zobacz długość trencza i topu oraz grubość tkanin. Nie zakładaj wodoodporności ani ocieplenia — te cechy muszą być potwierdzone w opisie sklepu.",
    whyItWorks: [
      "Beżowy krótki trencz może pełnić funkcję wierzchniej warstwy na chłodniejsze dni.",
      "Top z ozdobnymi detalami tworzy kontrast z jeansami i pozwala zdjąć trencz w pomieszczeniu.",
    ],
    excluded: "Obuwie, torba oraz dodatki nie są ujęte w sumie; trencz nie zastępuje kurtki zimowej.",
    maxBudget: 200,
    productSlugs: ["damski-top-bazowy-z-wstawkam", "damskie-zwezane-jeansy", "bezowy-luzny-krotki-trencz"],
  },
  {
    slug: "smart-casual-koszula-do-150-zl",
    title: "Koszula smart casual do 150 zł",
    occasion: "Do pracy",
    style: "Minimalistyczne biuro",
    intro: "Gładka koszula z długim rękawem i czarne spodnie z prostą nogawką — spokojna dwuelementowa baza do pracy, w której obowiązuje swobodniejszy dress code.",
    tip: "Sprawdź odcień i prześwitywanie koszuli, szerokość ramion oraz wymiary spodni. Odpowiedniość stroju zależy od zasad konkretnego miejsca pracy.",
    whyItWorks: [
      "Jednolita koszula i proste, czarne spodnie nie konkurują ze sobą wzorami, dlatego łatwo dopasować do nich własne obuwie.",
      "Każdy z tych elementów może pracować w kilku zestawach, zamiast tworzyć jeden komplet kupowany na jedną okazję."
    ],
    excluded: "Nie uwzględniamy butów, marynarki, paska, torby ani kosztów dostawy.",
    maxBudget: 150,
    productSlugs: ["inawly-koszula-damska-casualowa-w-jednolitym-kolorze", "damskie-eleganckie-casualowe-spodnie"],
  },
  {
    slug: "streetwear-do-100-zl",
    title: "Streetwear do 100 zł",
    occasion: "Na co dzień",
    style: "Streetwear",
    intro: "Moro gra pierwsze skrzypce: jeansy z wyrazistym wzorem zestawiliśmy z prostszą górą z krótkim rękawem. Stylizacja na łagodniejszą pogodę, bez konieczności dokupowania dodatków.",
    tip: "Przed zakupem porównaj obwód elastycznego pasa jeansów. Górny element ma krótki rękaw — przy chłodzie potrzebna będzie dodatkowa warstwa z Twojej szafy.",
    whyItWorks: [
      "Jeansy z kamuflażowym wzorem są wyrazistym elementem całego zestawu.",
      "Sweter o jednolitym kolorze i krótkim rękawie pozwala zachować równowagę między wzorem a górą.",
    ],
    excluded: "Buty, kurtka i dodatki nie są wliczone do sumy.",
    maxBudget: 100,
    productSlugs: ["damski-sweter-casualowy-w-kolorze", "damskie-jeansy-z-wzorem"],
  },
  {
    slug: "czarna-mini-i-botki-do-200-zl",
    title: "Czarna mini i botki do 200 zł",
    occasion: "Na wieczór",
    style: "Prosta elegancja",
    intro: "Czarna sukienka mini z marszczeniami i botki za kostkę — dwa wyraźne elementy na wieczorne wyjście. Dodatki i okrycie dobierz z własnej garderoby.",
    tip: "Sprawdź długość sukienki, szerokość w talii i obwód bioder. Przy botkach ważne są rozmiar wkładki, wysokość obcasa i warunki planowanego wyjścia.",
    whyItWorks: [
      "Czarna, dopasowana sukienka tworzy czytelną bazę, a botki mogą nadać całości bardziej miejski, mniej formalny charakter.",
      "Zestaw składa się z sukienki i obuwia; do chłodu lub bardziej oficjalnej okazji wykorzystaj własne okrycie i dodatki."
    ],
    excluded: "Rajstopy, okrycie wierzchnie, biżuteria, torba i dostawa nie są wliczone do ceny.",
    maxBudget: 200,
    productSlugs: ["damska-elegancka-mini-sukienka", "modne-wygodne-casualowe-damskie-botki-za-kostke"],
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
