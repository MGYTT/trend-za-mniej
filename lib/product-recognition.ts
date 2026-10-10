import {
  PRODUCT_CATEGORY,
  type ProductCategory,
} from "@/lib/product-categories";

export type ProductTypeConfidence =
  | "high"
  | "medium"
  | "none";

export type ProductTypeSource =
  | "name"
  | "content"
  | "none";

export type ProductRecognition = {
  type:
    string;

  /*
   * Stara, szeroka kategoria.
   *
   * Utrzymujemy ją chwilowo,
   * żeby obecny formularz
   * działał bez zmian.
   */
  category:
    string;

  /*
   * Nowa dokładna kategoria.
   *
   * W kolejnym kroku stanie się
   * właściwą wartością zapisywaną
   * w formularzu.
   */
  suggestedCategory:
    ProductCategory | "";

  confidence:
    ProductTypeConfidence;

  source:
    ProductTypeSource;
};

type ProductRule = {
  type:
    string;

  category:
    string;

  suggestedCategory:
    ProductCategory;

  patterns:
    RegExp[];
};

const PRODUCT_RULES:
  readonly ProductRule[] =
  [
    /*
     * ========================================================
     * GÓRA
     * ========================================================
     */

    {
      type:
        "Koszulka / T-shirt",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.tshirts,

      patterns: [
        /\bkoszulk/i,
        /\bt shirt\b/i,
        /\btshirt\b/i,
        /\btee\b/i,
        /\btee shirt\b/i,
      ],
    },

    {
      type:
        "Bluzka",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.blouses,

      patterns: [
        /\bbluzk/i,
        /\bblouse\b/i,
      ],
    },

    {
      type:
        "Body",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.bodysuits,

      patterns: [
        /\bbody\b/i,
        /\bbodysuit/i,
      ],
    },

    {
      type:
        "Crop top",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.tops,

      patterns: [
        /\bcrop top\b/i,
        /\bcropped top\b/i,
      ],
    },

    {
      type:
        "Top na ramiączkach",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.tops,

      patterns: [
        /\btop na ramiaczk/i,
        /\btank top\b/i,
        /\bcami top\b/i,
        /\bcamisole\b/i,
      ],
    },

    {
      type:
        "Koszula",

      category:
        "Koszule",

      suggestedCategory:
        PRODUCT_CATEGORY.shirts,

      patterns: [
        /\bkoszula\b/i,
        /\bkoszule\b/i,
        /\bkoszuli\b/i,
        /\bshirt\b/i,
      ],
    },

    {
      type:
        "Bluza z kapturem",

      category:
        "Bluzy",

      suggestedCategory:
        PRODUCT_CATEGORY.hoodies,

      patterns: [
        /\bbluza z kapturem\b/i,
        /\bhoodie\b/i,
      ],
    },

    {
      type:
        "Bluza",

      category:
        "Bluzy",

      suggestedCategory:
        PRODUCT_CATEGORY.hoodies,

      patterns: [
        /\bbluza\b/i,
        /\bbluzy\b/i,
        /\bbluze\b/i,
        /\bsweatshirt\b/i,
      ],
    },

    {
      type:
        "Kardigan",

      category:
        "Kardigany",

      suggestedCategory:
        PRODUCT_CATEGORY.cardigans,

      patterns: [
        /\bkardigan/i,
        /\bcardigan/i,
      ],
    },

    {
      type:
        "Golf",

      category:
        "Swetry",

      suggestedCategory:
        PRODUCT_CATEGORY.sweaters,

      patterns: [
        /\bgolf\b/i,
        /\bturtleneck\b/i,
      ],
    },

    {
      type:
        "Sweter",

      category:
        "Swetry",

      suggestedCategory:
        PRODUCT_CATEGORY.sweaters,

      patterns: [
        /\bsweter/i,
        /\bsweater\b/i,
        /\bpullover\b/i,
        /\bjumper\b/i,
      ],
    },

    {
      type:
        "Top",

      category:
        "Topy",

      suggestedCategory:
        PRODUCT_CATEGORY.tops,

      patterns: [
        /\btop\b/i,
      ],
    },

    /*
     * ========================================================
     * SUKIENKI I ZESTAWY
     * ========================================================
     */

    {
      type:
        "Sukienka",

      category:
        "Sukienki",

      suggestedCategory:
        PRODUCT_CATEGORY.dresses,

      patterns: [
        /\bsukienk/i,
        /\bdress\b/i,
      ],
    },

    {
      type:
        "Kombinezon",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.jumpsuits,

      patterns: [
        /\bkombinezon/i,
        /\bjumpsuit\b/i,
        /\bromper\b/i,
      ],
    },

    {
      type:
        "Komplet",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.sets,

      patterns: [
        /\bkomplet/i,
        /\bzestaw ubran/i,
        /\bzestaw odziez/i,
        /\bdwuczesciow/i,
        /\btwo piece\b/i,
        /\b2 piece\b/i,
        /\bmatching set\b/i,
      ],
    },

    /*
     * ========================================================
     * DÓŁ
     * ========================================================
     */

    {
      type:
        "Jeansy",

      category:
        "Spodnie",

      suggestedCategory:
        PRODUCT_CATEGORY.jeans,

      patterns: [
        /\bjeans/i,
        /\bdenim pants\b/i,
        /\bdenim trousers\b/i,
      ],
    },

    {
      type:
        "Legginsy",

      category:
        "Spodnie",

      suggestedCategory:
        PRODUCT_CATEGORY.leggings,

      patterns: [
        /\bleggins/i,
        /\bleggings/i,
      ],
    },

    {
      type:
        "Szorty",

      category:
        "Spodnie",

      suggestedCategory:
        PRODUCT_CATEGORY.shorts,

      patterns: [
        /\bszort/i,
        /\bshorts?\b/i,
      ],
    },

    {
      type:
        "Spódnica",

      category:
        "Spódnice",

      suggestedCategory:
        PRODUCT_CATEGORY.skirts,

      patterns: [
        /\bspodnic/i,
        /\bskirt\b/i,
      ],
    },

    {
      type:
        "Spodnie cargo",

      category:
        "Spodnie",

      suggestedCategory:
        PRODUCT_CATEGORY.trousers,

      patterns: [
        /\bspodn[a-z]* cargo\b/i,
        /\bcargo pants?\b/i,
        /\bcargo trousers?\b/i,
      ],
    },

    {
      type:
        "Spodnie",

      category:
        "Spodnie",

      suggestedCategory:
        PRODUCT_CATEGORY.trousers,

      patterns: [
        /\bspodn/i,
        /\btrousers?\b/i,
        /\bpants?\b/i,
      ],
    },

    /*
     * ========================================================
     * OKRYCIA
     * ========================================================
     */

    {
      type:
        "Marynarka / żakiet",

      category:
        "Kurtki i płaszcze",

      suggestedCategory:
        PRODUCT_CATEGORY.blazers,

      patterns: [
        /\bmarynark/i,
        /\bzakiet/i,
        /\bblazer\b/i,
      ],
    },

    {
      type:
        "Kamizelka",

      category:
        "Kurtki i płaszcze",

      suggestedCategory:
        PRODUCT_CATEGORY.waistcoats,

      patterns: [
        /\bkamizelk/i,
        /\bwaistcoat\b/i,
        /\bvest\b/i,
      ],
    },

    {
      type:
        "Płaszcz",

      category:
        "Kurtki i płaszcze",

      suggestedCategory:
        PRODUCT_CATEGORY.outerwear,

      patterns: [
        /\bplaszcz/i,
        /\bcoat\b/i,
        /\bovercoat\b/i,
        /\btrench\b/i,
      ],
    },

    {
      type:
        "Kurtka",

      category:
        "Kurtki i płaszcze",

      suggestedCategory:
        PRODUCT_CATEGORY.outerwear,

      patterns: [
        /\bkurtk/i,
        /\bjacket\b/i,
        /\bparka\b/i,
        /\bbomber\b/i,
      ],
    },

    /*
     * ========================================================
     * BIELIZNA / PLAŻA / DOMOWE
     * ========================================================
     */

    {
      type:
        "Piżama",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.sleepwear,

      patterns: [
        /\bpizam/i,
        /\bpajamas?\b/i,
        /\bpyjamas?\b/i,
        /\bsleepwear\b/i,
      ],
    },

    {
      type:
        "Koszula nocna",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.sleepwear,

      patterns: [
        /\bkoszul[a-z]* nocn/i,
        /\bnightdress\b/i,
        /\bnightgown\b/i,
      ],
    },

    {
      type:
        "Biustonosz",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.underwear,

      patterns: [
        /\bbiustonosz/i,
        /\bstanik/i,
        /\bbra\b/i,
      ],
    },

    {
      type:
        "Bielizna",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.underwear,

      patterns: [
        /\bbielizn/i,
        /\blingerie\b/i,
        /\bunderwear\b/i,
        /\bpanties\b/i,
        /\bmajtki\b/i,
      ],
    },

    {
      type:
        "Bikini",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.swimwear,

      patterns: [
        /\bbikini\b/i,
      ],
    },

    {
      type:
        "Strój kąpielowy",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.swimwear,

      patterns: [
        /\bstroj[a-z]* kapiel/i,
        /\bkostium[a-z]* kapiel/i,
        /\bswimsuit\b/i,
        /\bswimwear\b/i,
      ],
    },

    {
      type:
        "Skarpetki",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.socksAndTights,

      patterns: [
        /\bskarpet/i,
        /\bsocks?\b/i,
      ],
    },

    {
      type:
        "Rajstopy",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.socksAndTights,

      patterns: [
        /\brajstop/i,
        /\bponczoch/i,
        /\btights?\b/i,
      ],
    },

    /*
     * ========================================================
     * SPORT
     * ========================================================
     */

    {
      type:
        "Odzież sportowa",

      category:
        "Inne",

      suggestedCategory:
        PRODUCT_CATEGORY.sportswear,

      patterns: [
        /\bodziez sport/i,
        /\bubran[a-z]* sport/i,
        /\bkomplet[a-z]* sport/i,
        /\bactivewear\b/i,
        /\bsportswear\b/i,
        /\bgym wear\b/i,
        /\bgym set\b/i,
      ],
    },

    /*
     * ========================================================
     * BUTY
     * ========================================================
     */

    {
      type:
        "Sneakersy",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bsneaker/i,
      ],
    },

    {
      type:
        "Sandały",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bsandal/i,
      ],
    },

    {
      type:
        "Botki",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bbotk/i,
        /\bankle boots?\b/i,
      ],
    },

    {
      type:
        "Kozaki",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bkozak/i,
        /\bknee high boots?\b/i,
      ],
    },

    {
      type:
        "Szpilki / obcasy",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bszpilk/i,
        /\bhigh heels?\b/i,
        /\bheels?\b/i,
      ],
    },

    {
      type:
        "Mokasyny / loafersy",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bmokasyn/i,
        /\bloafer/i,
      ],
    },

    {
      type:
        "Trampki",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\btrampk/i,
        /\bcanvas shoes?\b/i,
      ],
    },

    {
      type:
        "Buty",

      category:
        "Buty",

      suggestedCategory:
        PRODUCT_CATEGORY.shoes,

      patterns: [
        /\bbuty\b/i,
        /\bshoes?\b/i,
        /\bfootwear\b/i,
      ],
    },

    /*
     * ========================================================
     * TOREBKI
     * ========================================================
     */

    {
      type:
        "Torebka crossbody",

      category:
        "Torebki",

      suggestedCategory:
        PRODUCT_CATEGORY.bags,

      patterns: [
        /\bcrossbody\b/i,
      ],
    },

    {
      type:
        "Torebka na ramię",

      category:
        "Torebki",

      suggestedCategory:
        PRODUCT_CATEGORY.bags,

      patterns: [
        /\bshoulder bag\b/i,
      ],
    },

    {
      type:
        "Shopperka",

      category:
        "Torebki",

      suggestedCategory:
        PRODUCT_CATEGORY.bags,

      patterns: [
        /\bshopper\b/i,
        /\btote bag\b/i,
      ],
    },

    {
      type:
        "Torebka / torba",

      category:
        "Torebki",

      suggestedCategory:
        PRODUCT_CATEGORY.bags,

      patterns: [
        /\btorebk/i,
        /\btorba\b/i,
        /\bhandbag\b/i,
        /\bbag\b/i,
      ],
    },

    /*
     * ========================================================
     * BIŻUTERIA
     * ========================================================
     */

    {
      type:
        "Kolczyki",

      category:
        "Biżuteria",

      suggestedCategory:
        PRODUCT_CATEGORY.jewelry,

      patterns: [
        /\bkolczyk/i,
        /\bearrings?\b/i,
      ],
    },

    {
      type:
        "Naszyjnik",

      category:
        "Biżuteria",

      suggestedCategory:
        PRODUCT_CATEGORY.jewelry,

      patterns: [
        /\bnaszyjnik/i,
        /\bnecklace\b/i,
      ],
    },

    {
      type:
        "Bransoletka",

      category:
        "Biżuteria",

      suggestedCategory:
        PRODUCT_CATEGORY.jewelry,

      patterns: [
        /\bbransolet/i,
        /\bbracelet\b/i,
      ],
    },

    {
      type:
        "Pierścionek",

      category:
        "Biżuteria",

      suggestedCategory:
        PRODUCT_CATEGORY.jewelry,

      patterns: [
        /\bpierscion/i,
        /\bring\b/i,
      ],
    },

    {
      type:
        "Biżuteria",

      category:
        "Biżuteria",

      suggestedCategory:
        PRODUCT_CATEGORY.jewelry,

      patterns: [
        /\bbizuter/i,
        /\bjewelry\b/i,
        /\bjewellery\b/i,
      ],
    },

    /*
     * ========================================================
     * AKCESORIA
     * ========================================================
     */

    {
      type:
        "Pasek",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.accessories,

      patterns: [
        /\bpasek\b/i,
        /\bbelt\b/i,
      ],
    },

    {
      type:
        "Okulary",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.accessories,

      patterns: [
        /\bokular/i,
        /\bsunglasses\b/i,
      ],
    },

    {
      type:
        "Czapka / kapelusz",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.accessories,

      patterns: [
        /\bczapk/i,
        /\bkapelusz/i,
        /\bhat\b/i,
        /\bcap\b/i,
      ],
    },

    {
      type:
        "Szalik / chusta",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.accessories,

      patterns: [
        /\bszal\b/i,
        /\bchust/i,
        /\bscarf\b/i,
      ],
    },

    {
      type:
        "Akcesoria",

      category:
        "Akcesoria",

      suggestedCategory:
        PRODUCT_CATEGORY.accessories,

      patterns: [
        /\bopask/i,
        /\bspink/i,
        /\baccessor/i,
      ],
    },

    /*
     * ========================================================
     * BEAUTY
     * ========================================================
     */

    {
      type:
        "Pędzel kosmetyczny",

      category:
        "Akcesoria kosmetyczne",

      suggestedCategory:
        PRODUCT_CATEGORY.beautyAccessories,

      patterns: [
        /\bpedzel/i,
        /\bmakeup brush\b/i,
      ],
    },

    {
      type:
        "Gąbka kosmetyczna",

      category:
        "Akcesoria kosmetyczne",

      suggestedCategory:
        PRODUCT_CATEGORY.beautyAccessories,

      patterns: [
        /\bgabk/i,
        /\bmakeup sponge\b/i,
        /\bbeauty blender\b/i,
      ],
    },

    {
      type:
        "Akcesoria kosmetyczne",

      category:
        "Akcesoria kosmetyczne",

      suggestedCategory:
        PRODUCT_CATEGORY.beautyAccessories,

      patterns: [
        /\baplikator/i,
        /\bzalotk/i,
        /\bmakeup tool/i,
      ],
    },

    {
      type:
        "Pomadka / szminka",

      category:
        "Uroda",

      suggestedCategory:
        PRODUCT_CATEGORY.beauty,

      patterns: [
        /\bszmink/i,
        /\bpomadk/i,
        /\blipstick\b/i,
      ],
    },

    {
      type:
        "Błyszczyk",

      category:
        "Uroda",

      suggestedCategory:
        PRODUCT_CATEGORY.beauty,

      patterns: [
        /\bblyszczyk/i,
        /\blip gloss\b/i,
      ],
    },

    {
      type:
        "Tusz do rzęs",

      category:
        "Uroda",

      suggestedCategory:
        PRODUCT_CATEGORY.beauty,

      patterns: [
        /\btusz do rzes/i,
        /\bmascara\b/i,
      ],
    },

    {
      type:
        "Kosmetyk",

      category:
        "Uroda",

      suggestedCategory:
        PRODUCT_CATEGORY.beauty,

      patterns: [
        /\beyeliner\b/i,
        /\bconcealer\b/i,
        /\bfoundation\b/i,
        /\bserum\b/i,
        /\bkrem do/i,
        /\bmakeup\b/i,
      ],
    },

    /*
     * ========================================================
     * DOM
     * ========================================================
     */

    {
      type:
        "Organizer",

      category:
        "Dom i lifestyle",

      suggestedCategory:
        PRODUCT_CATEGORY.home,

      patterns: [
        /\borganizer/i,
      ],
    },

    {
      type:
        "Tekstylia domowe",

      category:
        "Dom i lifestyle",

      suggestedCategory:
        PRODUCT_CATEGORY.home,

      patterns: [
        /\bposzewk/i,
        /\bposciel/i,
        /\bkoc\b/i,
        /\brecznik/i,
      ],
    },

    {
      type:
        "Dekoracja",

      category:
        "Dom i lifestyle",

      suggestedCategory:
        PRODUCT_CATEGORY.home,

      patterns: [
        /\bdekorac/i,
        /\bhome decor\b/i,
      ],
    },

    {
      type:
        "Produkt do domu",

      category:
        "Dom i lifestyle",

      suggestedCategory:
        PRODUCT_CATEGORY.home,

      patterns: [
        /\bkitchen\b/i,
        /\bpojemnik/i,
        /\bhome\b/i,
      ],
    },
  ];

export function normalizeProductText(
  value:
    string
) {
  return value
    .toLocaleLowerCase(
      "pl"
    )
    .normalize(
      "NFD"
    )
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

function matchProduct(
  value:
    string
) {
  const normalized =
    normalizeProductText(
      value
    );

  if (
    !normalized
  ) {
    return null;
  }

  for (
    const rule
    of PRODUCT_RULES
  ) {
    if (
      rule.patterns.some(
        (
          pattern
        ) =>
          pattern.test(
            normalized
          )
      )
    ) {
      return rule;
    }
  }

  return null;
}

export function recognizeProductType({
  name,
  content,
}: {
  name:
    string;

  content:
    string;
}): ProductRecognition {
  const nameMatch =
    matchProduct(
      name
    );

  if (
    nameMatch
  ) {
    return {
      type:
        nameMatch.type,

      category:
        nameMatch.category,

      suggestedCategory:
        nameMatch.suggestedCategory,

      confidence:
        "high",

      source:
        "name",
    };
  }

  const contentMatch =
    matchProduct(
      content
    );

  if (
    contentMatch
  ) {
    return {
      type:
        contentMatch.type,

      category:
        contentMatch.category,

      suggestedCategory:
        contentMatch.suggestedCategory,

      confidence:
        "medium",

      source:
        "content",
    };
  }

  return {
    type:
      "",

    category:
      "",

    suggestedCategory:
      "",

    confidence:
      "none",

    source:
      "none",
  };
}