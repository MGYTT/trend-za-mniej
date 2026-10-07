export type CategorySeo = {
  name: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  tips: string[];
};

type CategorySeoOverride = {
  title?: string;
  description?: string;
  intro?: string;
  tips?: string[];
};

const CATEGORY_SEO: Record<
  string,
  CategorySeoOverride
> = {
  Bluzy: {
    title:
      "Bluzy damskie SHEIN – modne okazje i znaleziska",
    description:
      "Zobacz wybrane bluzy damskie SHEIN: modele oversize, bluzy z kapturem i wygodne fasony na co dzień. Sprawdź ceny i aktualne oferty.",
    intro:
      "W tej kategorii zbieramy wybrane bluzy damskie w różnych fasonach i kolorach. Możesz szybko porównać ceny, zobaczyć zdjęcia i przejść do aktualnej oferty w sklepie.",
    tips: [
      "Porównaj wymiary produktu z własną odzieżą, zamiast kierować się wyłącznie oznaczeniem rozmiaru.",
      "Sprawdź skład materiału oraz informacje o fasonie przed zakupem.",
      "Zweryfikuj aktualną cenę i dostępność bezpośrednio w sklepie.",
    ],
  },

  Swetry: {
    title:
      "Swetry damskie SHEIN – modne swetry i okazje",
    description:
      "Przeglądaj wybrane swetry damskie SHEIN: klasyczne, oversize i dzianinowe modele na chłodniejsze dni. Zobacz ceny i aktualne oferty.",
    intro:
      "Zebraliśmy tutaj wybrane swetry damskie, które łatwo zestawić z jeansami, spódnicą lub codzienną stylizacją. Każda oferta prowadzi do aktualnej strony produktu w sklepie.",
    tips: [
      "Przed zakupem sprawdź skład dzianiny i sposób pielęgnacji.",
      "Zwróć uwagę na długość swetra i wymiary podane w tabeli produktu.",
      "Cena widoczna w Trend za Mniej jest ceną z chwili publikacji lub aktualizacji.",
    ],
  },

  Topy: {
    title:
      "Topy damskie SHEIN – modne topy i tanie znaleziska",
    description:
      "Odkrywaj wybrane topy damskie SHEIN na co dzień i do stylizacji. Porównaj fasony, ceny i przejdź do aktualnej oferty produktu.",
    intro:
      "W kategorii topów znajdziesz lekkie modele do codziennych stylizacji, noszenia solo lub pod marynarkę, kardigan czy kurtkę.",
    tips: [
      "Sprawdź długość oraz krój produktu na podstawie wymiarów.",
      "Przy jasnych materiałach warto zwrócić uwagę na informacje o prześwitywaniu.",
      "Przed zakupem sprawdź aktualną cenę, wariant kolorystyczny i dostępny rozmiar.",
    ],
  },

  Koszule: {
    title:
      "Koszule damskie SHEIN – modne fasony i okazje",
    description:
      "Zobacz wybrane koszule damskie SHEIN: modele casualowe, oversize i klasyczne. Porównaj ceny i sprawdź aktualne oferty.",
  },

  Kardigany: {
    title:
      "Kardigany damskie SHEIN – modne okazje",
    description:
      "Wybrane kardigany damskie SHEIN do codziennych i jesiennych stylizacji. Sprawdź fasony, ceny i aktualną dostępność.",
  },

  Sukienki: {
    title:
      "Sukienki damskie SHEIN – modne sukienki i okazje",
    description:
      "Przeglądaj wybrane sukienki damskie SHEIN na co dzień i różne okazje. Zobacz ceny, fasony i aktualne oferty.",
  },

  Spodnie: {
    title:
      "Spodnie damskie SHEIN – modne fasony i okazje",
    description:
      "Zobacz wybrane spodnie damskie SHEIN w różnych fasonach. Porównaj ceny i sprawdź aktualne oferty.",
  },

  Spódnice: {
    title:
      "Spódnice damskie SHEIN – modne okazje",
    description:
      "Przeglądaj wybrane spódnice damskie SHEIN: krótkie, midi i inne modne fasony. Sprawdź ceny oraz aktualne oferty.",
  },

  "Kurtki i płaszcze": {
    title:
      "Kurtki i płaszcze damskie SHEIN – modne okazje",
    description:
      "Zobacz wybrane kurtki i płaszcze damskie SHEIN na chłodniejsze dni. Porównaj fasony, ceny i dostępne oferty.",
  },

  Buty: {
    title:
      "Buty damskie SHEIN – modne modele i okazje",
    description:
      "Odkrywaj wybrane buty damskie SHEIN. Zobacz modele, ceny i sprawdź aktualną ofertę produktu.",
  },

  Torebki: {
    title:
      "Torebki damskie SHEIN – modne dodatki i okazje",
    description:
      "Przeglądaj wybrane torebki SHEIN do codziennych i bardziej eleganckich stylizacji. Sprawdź ceny i aktualne oferty.",
  },

  Biżuteria: {
    title:
      "Biżuteria SHEIN – modne dodatki i okazje",
    description:
      "Zobacz wybraną biżuterię i modne dodatki SHEIN. Porównaj produkty, ceny i aktualne oferty.",
  },

  Akcesoria: {
    title:
      "Akcesoria SHEIN – modne dodatki i okazje",
    description:
      "Przeglądaj wybrane akcesoria i dodatki SHEIN. Sprawdź ceny i przejdź do aktualnych ofert.",
  },

  "Akcesoria kosmetyczne": {
    title:
      "Akcesoria kosmetyczne SHEIN – okazje i znaleziska",
    description:
      "Wybrane akcesoria kosmetyczne SHEIN w jednym miejscu. Zobacz produkty, ceny i aktualne oferty.",
  },

  Uroda: {
    title:
      "Uroda SHEIN – kosmetyczne znaleziska i okazje",
    description:
      "Przeglądaj wybrane produkty z kategorii uroda i kosmetyczne znaleziska SHEIN. Sprawdź ceny oraz aktualne oferty.",
  },

  "Dom i lifestyle": {
    title:
      "Dom i lifestyle SHEIN – praktyczne okazje i znaleziska",
    description:
      "Odkrywaj wybrane produkty do domu i codziennego użytku. Porównaj ceny i sprawdź aktualne oferty SHEIN.",
  },
};

export function slugifyCategory(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/ł/g, "l")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

export function getCategorySeo(
  name: string
): CategorySeo {
  const override =
    CATEGORY_SEO[name];

  const slug =
    slugifyCategory(name);

  return {
    name,
    slug,

    title:
      override?.title ??
      `${name} – modne okazje i znaleziska`,

    description:
      override?.description ??
      `Przeglądaj wybrane produkty z kategorii ${name}. Porównaj ceny, zobacz najnowsze znaleziska i sprawdź aktualne oferty.`,

    intro:
      override?.intro ??
      `W kategorii ${name} zbieramy wybrane produkty, które możesz szybko porównać i sprawdzić bez przeglądania setek ofert.`,

    tips:
      override?.tips ?? [
        "Sprawdź dokładne wymiary i opis produktu przed zakupem.",
        "Porównaj aktualną cenę z ceną widoczną w chwili publikacji oferty.",
        "Zweryfikuj dostępność wybranego wariantu bezpośrednio w sklepie.",
      ],
  };
}

export function findCategoryBySlug(
  categories: string[],
  slug: string
) {
  const category =
    categories.find(
      (item) =>
        slugifyCategory(
          item
        ) === slug
    );

  if (!category) {
    return null;
  }

  return getCategorySeo(
    category
  );
}