export const PRODUCT_CATEGORY = {
  tshirts: "Koszulki i T-shirty",
  tops: "Topy",
  blouses: "Bluzki",
  bodysuits: "Body",
  shirts: "Koszule",
  hoodies: "Bluzy",
  sweaters: "Swetry",
  cardigans: "Kardigany",
  trousers: "Spodnie",
  jeans: "Jeansy",
  leggings: "Legginsy",
  shorts: "Szorty",
  skirts: "Spódnice",
  dresses: "Sukienki",
  jumpsuits: "Kombinezony",
  sets: "Komplety i zestawy",
  blazers: "Marynarki i żakiety",
  outerwear: "Kurtki i płaszcze",
  waistcoats: "Kamizelki",
  underwear: "Bielizna",
  sleepwear: "Piżamy i odzież domowa",
  swimwear: "Stroje kąpielowe",
  socksAndTights: "Skarpetki i rajstopy",
  sportswear: "Odzież sportowa",
  shoes: "Buty",
  bags: "Torebki",
  jewelry: "Biżuteria",
  accessories: "Akcesoria",
  beautyAccessories: "Akcesoria kosmetyczne",
  beauty: "Uroda",
  home: "Dom i lifestyle",
  other: "Inne",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY];

export type ProductPublicGroup =
  | "clothes"
  | "accessories"
  | "beauty"
  | "home"
  | "other";

export type ProductCategoryGroup = {
  id: string;
  label: string;
  icon: string;
  publicGroup: ProductPublicGroup;
  categories: readonly ProductCategory[];
};

export type ProductCategorySearchGroup = {
  id: string;
  label: string;
  icon: string;
  publicGroup: ProductPublicGroup;
  categories: ProductCategory[];
};

export const PRODUCT_CATEGORY_GROUPS: readonly ProductCategoryGroup[] = [
  {
    id: "tops",
    label: "Góra",
    icon: "👕",
    publicGroup: "clothes",
    categories: [
      PRODUCT_CATEGORY.tshirts,
      PRODUCT_CATEGORY.tops,
      PRODUCT_CATEGORY.blouses,
      PRODUCT_CATEGORY.bodysuits,
      PRODUCT_CATEGORY.shirts,
      PRODUCT_CATEGORY.hoodies,
      PRODUCT_CATEGORY.sweaters,
      PRODUCT_CATEGORY.cardigans,
    ],
  },
  {
    id: "bottoms",
    label: "Dół",
    icon: "👖",
    publicGroup: "clothes",
    categories: [
      PRODUCT_CATEGORY.trousers,
      PRODUCT_CATEGORY.jeans,
      PRODUCT_CATEGORY.leggings,
      PRODUCT_CATEGORY.shorts,
      PRODUCT_CATEGORY.skirts,
    ],
  },
  {
    id: "dresses",
    label: "Sukienki i zestawy",
    icon: "👗",
    publicGroup: "clothes",
    categories: [
      PRODUCT_CATEGORY.dresses,
      PRODUCT_CATEGORY.jumpsuits,
      PRODUCT_CATEGORY.sets,
    ],
  },
  {
    id: "outerwear",
    label: "Okrycia",
    icon: "🧥",
    publicGroup: "clothes",
    categories: [
      PRODUCT_CATEGORY.blazers,
      PRODUCT_CATEGORY.outerwear,
      PRODUCT_CATEGORY.waistcoats,
    ],
  },
  {
    id: "underwear",
    label: "Bielizna i plaża",
    icon: "🩷",
    publicGroup: "clothes",
    categories: [
      PRODUCT_CATEGORY.underwear,
      PRODUCT_CATEGORY.sleepwear,
      PRODUCT_CATEGORY.swimwear,
      PRODUCT_CATEGORY.socksAndTights,
    ],
  },
  {
    id: "sport",
    label: "Sport",
    icon: "🏃",
    publicGroup: "clothes",
    categories: [PRODUCT_CATEGORY.sportswear],
  },
  {
    id: "accessories",
    label: "Buty i dodatki",
    icon: "👜",
    publicGroup: "accessories",
    categories: [
      PRODUCT_CATEGORY.shoes,
      PRODUCT_CATEGORY.bags,
      PRODUCT_CATEGORY.jewelry,
      PRODUCT_CATEGORY.accessories,
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "💄",
    publicGroup: "beauty",
    categories: [
      PRODUCT_CATEGORY.beautyAccessories,
      PRODUCT_CATEGORY.beauty,
    ],
  },
  {
    id: "home",
    label: "Dom",
    icon: "🏠",
    publicGroup: "home",
    categories: [PRODUCT_CATEGORY.home],
  },
  {
    id: "other",
    label: "Pozostałe",
    icon: "📦",
    publicGroup: "other",
    categories: [PRODUCT_CATEGORY.other],
  },
];

export const PRODUCT_CATEGORIES: readonly ProductCategory[] =
  PRODUCT_CATEGORY_GROUPS.flatMap((group) => [...group.categories]);

export const PRODUCT_CATEGORY_HELP: Record<ProductCategory, string> = {
  [PRODUCT_CATEGORY.tshirts]:
    "Klasyczne koszulki, T-shirty oraz modele z krótkim lub długim rękawem.",

  [PRODUCT_CATEGORY.tops]:
    "Crop topy, tank topy, topy na ramiączkach i podobne fasony.",

  [PRODUCT_CATEGORY.blouses]:
    "Bluzki codzienne i eleganckie, które nie są klasycznym T-shirtem ani koszulą.",

  [PRODUCT_CATEGORY.bodysuits]:
    "Body i bodysuity noszone jako górna część stylizacji.",

  [PRODUCT_CATEGORY.shirts]:
    "Koszule klasyczne, oversize, casualowe i eleganckie.",

  [PRODUCT_CATEGORY.hoodies]:
    "Bluzy z kapturem i bez kaptura, modele oversize i sweatshirt.",

  [PRODUCT_CATEGORY.sweaters]:
    "Swetry, golfy i dzianinowe modele zakładane przez głowę.",

  [PRODUCT_CATEGORY.cardigans]:
    "Rozpinane swetry i kardigany.",

  [PRODUCT_CATEGORY.trousers]:
    "Spodnie materiałowe, garniturowe, cargo i inne poza jeansami, legginsami i szortami.",

  [PRODUCT_CATEGORY.jeans]:
    "Jeansy oraz spodnie wykonane z denimu.",

  [PRODUCT_CATEGORY.leggings]:
    "Legginsy codzienne, sportowe i inne dopasowane modele.",

  [PRODUCT_CATEGORY.shorts]:
    "Szorty i krótkie spodnie.",

  [PRODUCT_CATEGORY.skirts]:
    "Spódnice mini, midi, maxi i inne fasony.",

  [PRODUCT_CATEGORY.dresses]:
    "Sukienki codzienne, wieczorowe, mini, midi i maxi.",

  [PRODUCT_CATEGORY.jumpsuits]:
    "Kombinezony długie, krótkie i modele typu romper.",

  [PRODUCT_CATEGORY.sets]:
    "Gotowe komplety dwu- lub wieloczęściowe sprzedawane jako jeden produkt.",

  [PRODUCT_CATEGORY.blazers]:
    "Marynarki, blezery i żakiety.",

  [PRODUCT_CATEGORY.outerwear]:
    "Kurtki, płaszcze, parki, trencze i inne okrycia wierzchnie.",

  [PRODUCT_CATEGORY.waistcoats]:
    "Kamizelki modowe, garniturowe i ocieplane.",

  [PRODUCT_CATEGORY.underwear]:
    "Biustonosze, majtki, komplety bielizny i podobne produkty.",

  [PRODUCT_CATEGORY.sleepwear]:
    "Piżamy, koszule nocne i odzież przeznaczona do noszenia w domu.",

  [PRODUCT_CATEGORY.swimwear]:
    "Stroje kąpielowe, bikini i pozostała odzież plażowa.",

  [PRODUCT_CATEGORY.socksAndTights]:
    "Skarpetki, rajstopy, pończochy i podobne produkty.",

  [PRODUCT_CATEGORY.sportswear]:
    "Odzież treningowa, komplety sportowe, fitness i activewear.",

  [PRODUCT_CATEGORY.shoes]:
    "Sneakersy, sandały, trampki, botki, kozaki, szpilki i inne obuwie.",

  [PRODUCT_CATEGORY.bags]:
    "Torebki, shopperki, torby na ramię, crossbody i podobne modele.",

  [PRODUCT_CATEGORY.jewelry]:
    "Kolczyki, naszyjniki, bransoletki, pierścionki i pozostała biżuteria.",

  [PRODUCT_CATEGORY.accessories]:
    "Paski, okulary, czapki, kapelusze, szale, spinki i inne dodatki.",

  [PRODUCT_CATEGORY.beautyAccessories]:
    "Pędzle, gąbki, aplikatory, zalotki i inne akcesoria kosmetyczne.",

  [PRODUCT_CATEGORY.beauty]:
    "Kosmetyki i pozostałe produkty beauty.",

  [PRODUCT_CATEGORY.home]:
    "Dekoracje, organizery, tekstylia i inne produkty do domu.",

  [PRODUCT_CATEGORY.other]:
    "Używaj tylko wtedy, gdy produkt naprawdę nie pasuje do żadnej dokładniejszej kategorii.",
};

const PRODUCT_CATEGORY_SEARCH_TERMS: Partial<
  Record<ProductCategory, readonly string[]>
> = {
  [PRODUCT_CATEGORY.tshirts]: [
    "koszulka",
    "koszulki",
    "tshirt",
    "t shirt",
    "tee",
  ],

  [PRODUCT_CATEGORY.tops]: [
    "top",
    "crop top",
    "tank top",
    "ramiaczka",
  ],

  [PRODUCT_CATEGORY.blouses]: [
    "bluzka",
    "bluzki",
    "blouse",
  ],

  [PRODUCT_CATEGORY.bodysuits]: [
    "body",
    "bodysuit",
  ],

  [PRODUCT_CATEGORY.shirts]: [
    "koszula",
    "koszule",
    "shirt",
  ],

  [PRODUCT_CATEGORY.hoodies]: [
    "bluza",
    "bluzy",
    "hoodie",
    "sweatshirt",
  ],

  [PRODUCT_CATEGORY.sweaters]: [
    "sweter",
    "swetry",
    "golf",
    "sweater",
  ],

  [PRODUCT_CATEGORY.cardigans]: [
    "kardigan",
    "kardigany",
    "cardigan",
  ],

  [PRODUCT_CATEGORY.trousers]: [
    "spodnie",
    "cargo",
    "trousers",
    "pants",
  ],

  [PRODUCT_CATEGORY.jeans]: [
    "jeans",
    "jeansy",
    "denim",
  ],

  [PRODUCT_CATEGORY.leggings]: [
    "legginsy",
    "leggings",
  ],

  [PRODUCT_CATEGORY.shorts]: [
    "szorty",
    "shorts",
    "krotkie spodnie",
  ],

  [PRODUCT_CATEGORY.skirts]: [
    "spodnica",
    "spodnice",
    "skirt",
  ],

  [PRODUCT_CATEGORY.dresses]: [
    "sukienka",
    "sukienki",
    "dress",
  ],

  [PRODUCT_CATEGORY.jumpsuits]: [
    "kombinezon",
    "kombinezony",
    "jumpsuit",
    "romper",
  ],

  [PRODUCT_CATEGORY.sets]: [
    "komplet",
    "komplety",
    "zestaw",
    "dwuczesciowy",
  ],

  [PRODUCT_CATEGORY.blazers]: [
    "marynarka",
    "marynarki",
    "zakiet",
    "blazer",
  ],

  [PRODUCT_CATEGORY.outerwear]: [
    "kurtka",
    "kurtki",
    "plaszcz",
    "plaszcze",
    "trencz",
    "parka",
    "bomber",
  ],

  [PRODUCT_CATEGORY.waistcoats]: [
    "kamizelka",
    "kamizelki",
    "vest",
  ],

  [PRODUCT_CATEGORY.underwear]: [
    "bielizna",
    "biustonosz",
    "stanik",
    "majtki",
    "lingerie",
  ],

  [PRODUCT_CATEGORY.sleepwear]: [
    "pizama",
    "pizamy",
    "koszula nocna",
    "sleepwear",
  ],

  [PRODUCT_CATEGORY.swimwear]: [
    "bikini",
    "stroj kapielowy",
    "kostium kapielowy",
    "swimsuit",
  ],

  [PRODUCT_CATEGORY.socksAndTights]: [
    "skarpetki",
    "rajstopy",
    "ponczochy",
  ],

  [PRODUCT_CATEGORY.sportswear]: [
    "sport",
    "sportowe",
    "fitness",
    "silownia",
    "activewear",
  ],

  [PRODUCT_CATEGORY.shoes]: [
    "buty",
    "sneakers",
    "sneakersy",
    "sandaly",
    "trampki",
    "botki",
    "kozaki",
    "szpilki",
    "mokasyny",
  ],

  [PRODUCT_CATEGORY.bags]: [
    "torebka",
    "torebki",
    "torba",
    "shopper",
    "crossbody",
  ],

  [PRODUCT_CATEGORY.jewelry]: [
    "bizuteria",
    "kolczyki",
    "naszyjnik",
    "bransoletka",
    "pierscionek",
  ],

  [PRODUCT_CATEGORY.accessories]: [
    "akcesoria",
    "pasek",
    "okulary",
    "czapka",
    "kapelusz",
    "szalik",
    "chusta",
    "spinki",
  ],

  [PRODUCT_CATEGORY.beautyAccessories]: [
    "pedzel",
    "pedzle",
    "gabka",
    "gabeczka",
    "aplikator",
    "zalotka",
  ],

  [PRODUCT_CATEGORY.beauty]: [
    "uroda",
    "kosmetyki",
    "makijaz",
    "pomadka",
    "szminka",
    "tusz",
    "mascara",
    "serum",
    "body lotion",
    "body mist",
  ],

  [PRODUCT_CATEGORY.home]: [
    "dom",
    "dekoracje",
    "organizer",
    "posciel",
    "poszewka",
    "koc",
    "recznik",
    "kuchnia",
  ],
};

function normalizeCategorySearchText(
  value: string
) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /ł/g,
      "l"
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

export function isProductCategory(
  value: string
): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(
    value as ProductCategory
  );
}

export function getProductCategoryGroup(
  category: string
): ProductCategoryGroup | null {
  return (
    PRODUCT_CATEGORY_GROUPS.find(
      (group) =>
        group.categories.includes(
          category as ProductCategory
        )
    ) ??
    null
  );
}

export function getProductCategoryHelp(
  category: string
) {
  if (
    !isProductCategory(
      category
    )
  ) {
    return "";
  }

  return PRODUCT_CATEGORY_HELP[
    category
  ];
}

export function getCategoryPublicGroup(
  category: string
): ProductPublicGroup {
  return (
    getProductCategoryGroup(
      category
    )?.publicGroup ??
    "other"
  );
}

export function searchProductCategories(
  query: string
): ProductCategorySearchGroup[] {
  const normalizedQuery =
    normalizeCategorySearchText(
      query
    );

  if (
    !normalizedQuery
  ) {
    return PRODUCT_CATEGORY_GROUPS.map(
      (group) => ({
        id:
          group.id,

        label:
          group.label,

        icon:
          group.icon,

        publicGroup:
          group.publicGroup,

        categories: [
          ...group.categories,
        ],
      })
    );
  }

  return PRODUCT_CATEGORY_GROUPS.map(
    (
      group
    ): ProductCategorySearchGroup => {
      const matchingCategories =
        group.categories.filter(
          (category) => {
            const extraTerms =
              PRODUCT_CATEGORY_SEARCH_TERMS[
                category
              ] ??
              [];

            const searchable =
              normalizeCategorySearchText(
                [
                  category,
                  PRODUCT_CATEGORY_HELP[
                    category
                  ],
                  group.label,
                  ...extraTerms,
                ].join(
                  " "
                )
              );

            return searchable.includes(
              normalizedQuery
            );
          }
        );

      return {
        id:
          group.id,

        label:
          group.label,

        icon:
          group.icon,

        publicGroup:
          group.publicGroup,

        categories:
          matchingCategories,
      };
    }
  ).filter(
    (group) =>
      group.categories.length >
      0
  );
}