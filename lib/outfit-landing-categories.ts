import type { ResolvedLook } from "@/lib/stylizacje";

/** Human-edited landing pages: no empty, keyword-stuffed or query-string index pages. */
export type OutfitCategory = {
  slug: string;
  label: string;
  heading: string;
  description: string;
  intro: string;
  advice: string;
};

export const OUTFIT_CATEGORIES: readonly OutfitCategory[] = [
  {
    slug: "do-100-zl",
    label: "Do 100 zł",
    heading: "Stylizacje damskie do 100 zł",
    description: "Stylizacje damskie do 100 zł z produktów Trend za Mniej. Odkryj tanie zestawy na uczelnię i na co dzień, poznaj ich skład i sumę zapisanych cen.",
    intro: "Niedrogi zestaw nie musi być przypadkowy. Wybraliśmy połączenia, w których góra i dół tworzą spójną bazę do noszenia z dodatkami, które już masz.",
    advice: "Przy małym budżecie szczególnie warto porównać wymiary produktów. Buty, torba i dostawa nie są częścią zestawu, chyba że wskazano inaczej.",
  },
  {
    slug: "do-150-zl",
    label: "Do 150 zł",
    heading: "Stylizacje damskie do 150 zł",
    description: "Gotowe stylizacje damskie do 150 zł na randkę, imprezę, do pracy i na weekend. Sprawdź prawdziwe produkty, skład zestawów i ich sumę cen.",
    intro: "Budżet 150 zł pozwala zestawić nie tylko dwa klasyczne elementy, lecz czasem również dodatkową warstwę. Zobacz różne okazje i fasony bez deklarowania nieistniejących rabatów.",
    advice: "Suma dotyczy produktów widocznych w danej stylizacji. Przed zakupem sprawdź cenę, rozmiar, wariant i koszt wysyłki u sprzedawcy.",
  },
  {
    slug: "do-200-zl",
    label: "Do 200 zł",
    heading: "Stylizacje damskie do 200 zł",
    description: "Stylizacje do 200 zł: eleganckie zestawy, warstwy na jesień i pomysły na zimowe wyjścia. Obejrzyj ubrania i sprawdź budżet każdego kompletu.",
    intro: "Do 200 zł można skomponować bardziej warstwowy look lub dobrać wyrazisty element, taki jak marynarka albo okrycie. Każdy zestaw ma pokazany rzeczywisty skład.",
    advice: "Nawet jeśli zestaw zawiera okrycie wierzchnie, jego właściwości termiczne należy zweryfikować w opisie oferty. Budżet nie obejmuje niewymienionych dodatków.",
  },
  {
    slug: "na-randke",
    label: "Na randkę",
    heading: "Stylizacje na randkę w małym budżecie",
    description: "Pomysły na stylizacje na randkę do 100 i 150 zł: sukienki, dzianina i romantyczne warstwy. Zobacz konkretne ubrania oraz sumę cen zestawu.",
    intro: "Randka może oznaczać kawę po południu albo kolację wieczorem. Dlatego proponujemy różne poziomy elegancji — od miękkiej dzianiny po koronkową sukienkę z okryciem.",
    advice: "Przy sukience zwróć uwagę na długość, linię talii i wybrany rozmiar. Okrycie i obuwie dobierz do miejsca spotkania i pogody.",
  },
  {
    slug: "na-impreze",
    label: "Na imprezę",
    heading: "Stylizacje na imprezę do 150 zł",
    description: "Stylizacje na imprezę z produktów w katalogu: połyskująca koszula, Y2K i wieczorowe akcenty. Porównaj składy i sumy cen do 150 zł.",
    intro: "Nie każda impreza wymaga tej samej stylizacji. Zebraliśmy zarówno prosty wieczorowy look z błyszczącą koszulą, jak i odważniejszą propozycję na festiwal.",
    advice: "Pomyśl o wygodzie i rodzaju wydarzenia. Przy mikro-szortach sprawdź długość, a przy wieczorowej górze prześwitywanie materiału.",
  },
  {
    slug: "do-pracy",
    label: "Do pracy",
    heading: "Stylizacje do pracy do 150 zł",
    description: "Stylizacje damskie do pracy do 100 i 150 zł. Białe bluzki, spodnie i marynarki w zestawach smart casual z dokładnym składem i zapisanymi cenami.",
    intro: "W pracy najczęściej przydaje się kilka rzeczy, które pasują do siebie również osobno. Proponujemy klasyczny kontrast bieli z czernią i wariant z kolorową marynarką.",
    advice: "Dobór zależy od dress code'u firmy. Przy bluzkach sprawdź dekolt i prześwitywanie, a przy spodniach — długość nogawek.",
  },
  {
    slug: "na-co-dzien",
    label: "Na co dzień",
    heading: "Stylizacje na co dzień do 100 i 150 zł",
    description: "Codzienne stylizacje damskie w budżecie: bluzy, T-shirty, dzianina i spodnie. Zobacz autorskie połączenia i faktyczne sumy cen produktów.",
    intro: "Codzienne zestawy powinny być proste do noszenia i łatwe do zmiany. Zebraliśmy kombinacje z jednym wyraźniejszym detalem albo wygodnymi, gładkimi fasonami.",
    advice: "Pamiętaj o proporcjach: przy luźnej górze sprawdź długość spodni, a przy krótkim topie wysokość stanu.",
  },
  {
    slug: "na-uczelnie",
    label: "Na uczelnię",
    heading: "Stylizacje na uczelnię do 100 zł",
    description: "Stylizacje na uczelnię do 100 zł — od bluzy i czarnych spodni po koszulę lub sweter. Poznaj wygodne zestawy i szczegółowe ceny elementów.",
    intro: "Na wykładach ważne są wygoda i warstwy. Pokazujemy trzy różne bazy: sportową, bardziej uporządkowaną i dzianinową na chłodniejszy dzień.",
    advice: "Długość spodni, wygodne rękawy i miejsce na okrycie bywają ważniejsze od chwilowego trendu. Plecak i buty nie są domyślnie wliczane.",
  },
  {
    slug: "na-weekend",
    label: "Na weekend",
    heading: "Weekendowe stylizacje damskie do 150 zł",
    description: "Stylizacje na weekend do 150 zł: koszule w kratę, jeansy i wygodne bluzy. Sprawdź zestawy na spacer, spotkanie oraz krótszy wyjazd.",
    intro: "Na weekend sprawdzają się elementy, które można wykorzystać także w tygodniu. Dlatego łączymy casualowy denim zarówno z koszulą, jak i miękką bluzą.",
    advice: "Sprawdź krój jeansów i długość koszuli, a na wyjazd weź pod uwagę temperaturę oraz dodatkowe warstwy.",
  },
  {
    slug: "eleganckie",
    label: "Eleganckie",
    heading: "Eleganckie stylizacje damskie do 200 zł",
    description: "Eleganckie stylizacje do 200 zł z realnych produktów: spodnie, koszule, marynarki i sukienki. Odkryj zestawy oraz ich zapisane ceny.",
    intro: "Elegancja nie musi oznaczać kupowania pełnego garnituru. Zestawiliśmy ponadczasowe proste kroje z przemyślanym detalem, który wyróżnia całość.",
    advice: "Zweryfikuj materiał i formalność marynarki; dzianinowy fason będzie bardziej swobodny niż klasyczna tkanina garniturowa.",
  },
  {
    slug: "casualowe",
    label: "Casualowe",
    heading: "Casualowe stylizacje damskie w budżecie",
    description: "Casualowe stylizacje damskie do 100 i 150 zł: T-shirty, bluzy, jeansy i spodnie. Zobacz pomysły na wygodne zestawy z katalogu.",
    intro: "Casual dobrze działa wtedy, gdy elementy można łatwo wymieniać między zestawami. Tutaj znajdziesz prosty denim, gładkie dzianiny i grafikę na jednej części stroju.",
    advice: "Sprawdź rzeczywisty krój: etykieta oversize może oznaczać różne wymiary w zależności od producenta.",
  },
  {
    slug: "na-jesien",
    label: "Na jesień",
    heading: "Stylizacje na jesień do 200 zł",
    description: "Jesienne stylizacje do 200 zł z płaszczem, swetrem i spodniami lub softshellem. Sprawdź warstwy, skład i sumę zapisanych cen.",
    intro: "Jesień sprzyja warstwom. Proponujemy dwa różne kierunki: miejski płaszcz ze swetrem i bardziej praktyczny zestaw z kurtką z kapturem.",
    advice: "Samo określenie 'jesienny' nie potwierdza nieprzemakalności ani ocieplenia. Sprawdź właściwości tkanin w ofercie.",
  },
  {
    slug: "na-zime",
    label: "Na zimę",
    heading: "Stylizacje na zimowe wyjścia do 200 zł",
    description: "Pomysły na zimowe stylizacje damskie do 200 zł. Odkryj połączenia sukienek i okryć oraz sprawdź, jakie elementy nie są wliczone w cenę.",
    intro: "Zimowa stylizacja na spotkanie w mieście może łączyć dzianinę z fakturowanym okryciem. Pokazujemy tylko elementy dostępne w katalogu, nie obiecujemy ochrony na silny mróz.",
    advice: "Przy niskich temperaturach potrzebne są dodatkowe warstwy, ciepłe buty i akcesoria. Ich koszt uwzględniamy tylko wtedy, gdy wyraźnie są w składzie.",
  },
];

export function getOutfitCategory(slug: string): OutfitCategory | undefined {
  return OUTFIT_CATEGORIES.find((category) => category.slug === slug);
}

export function matchesOutfitCategory(category: OutfitCategory, look: Pick<ResolvedLook, "total" | "occasion" | "style">): boolean {
  switch (category.slug) {
    case "do-100-zl": return Math.round(look.total * 100) <= 10000;
    case "do-150-zl": return Math.round(look.total * 100) <= 15000;
    case "do-200-zl": return Math.round(look.total * 100) <= 20000;
    case "na-randke": return look.occasion === "Na randkę";
    case "na-impreze": return look.occasion === "Na imprezę" || look.occasion === "Na wieczór";
    case "do-pracy": return look.occasion === "Do pracy";
    case "na-co-dzien": return look.occasion === "Na co dzień";
    case "na-uczelnie": return look.occasion === "Na uczelnię";
    case "na-weekend": return look.occasion === "Na weekend";
    case "eleganckie": return look.occasion === "Elegancko" || /elegancj/i.test(look.style);
    case "casualowe": return look.occasion === "Casualowo" || /casual|streetwear|athleisure|swobod/i.test(look.style);
    case "na-jesien": return look.occasion === "Na jesień" || look.occasion === "Na chłodniejsze dni";
    case "na-zime": return look.occasion === "Na zimę";
    default: return false;
  }
}
