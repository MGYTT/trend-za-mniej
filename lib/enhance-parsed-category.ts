import type {
  DetectionConfidence,
  ParsedOffer,
} from "@/lib/offer-parser";

import {
  PRODUCT_CATEGORY,
  isProductCategory,
  type ProductCategory,
} from "@/lib/product-categories";

type CategoryMatch = {
  category: ProductCategory;
  productType: string;
  confidence: DetectionConfidence;
};

type CategoryRule = {
  category: ProductCategory;
  productType: string;
  patterns: RegExp[];
};

const TYPE_TO_CATEGORY: Record<
  string,
  ProductCategory
> = {
  "Koszulka / T-shirt":
    PRODUCT_CATEGORY.tshirts,

  Bluzka:
    PRODUCT_CATEGORY.blouses,

  Body:
    PRODUCT_CATEGORY.bodysuits,

  "Crop top":
    PRODUCT_CATEGORY.tops,

  "Top na ramiączkach":
    PRODUCT_CATEGORY.tops,

  Top:
    PRODUCT_CATEGORY.tops,

  Koszula:
    PRODUCT_CATEGORY.shirts,

  "Bluza z kapturem":
    PRODUCT_CATEGORY.hoodies,

  Bluza:
    PRODUCT_CATEGORY.hoodies,

  Sweter:
    PRODUCT_CATEGORY.sweaters,

  Golf:
    PRODUCT_CATEGORY.sweaters,

  Kardigan:
    PRODUCT_CATEGORY.cardigans,

  Spodnie:
    PRODUCT_CATEGORY.trousers,

  "Spodnie cargo":
    PRODUCT_CATEGORY.trousers,

  Jeansy:
    PRODUCT_CATEGORY.jeans,

  Legginsy:
    PRODUCT_CATEGORY.leggings,

  Szorty:
    PRODUCT_CATEGORY.shorts,

  "Spódnica":
    PRODUCT_CATEGORY.skirts,

  Sukienka:
    PRODUCT_CATEGORY.dresses,

  Kombinezon:
    PRODUCT_CATEGORY.jumpsuits,

  Komplet:
    PRODUCT_CATEGORY.sets,

  "Marynarka / żakiet":
    PRODUCT_CATEGORY.blazers,

  "Płaszcz":
    PRODUCT_CATEGORY.outerwear,

  "Płaszcz / trencz":
    PRODUCT_CATEGORY.outerwear,

  Kurtka:
    PRODUCT_CATEGORY.outerwear,

  Kamizelka:
    PRODUCT_CATEGORY.waistcoats,

  "Piżama":
    PRODUCT_CATEGORY.sleepwear,

  "Koszula nocna":
    PRODUCT_CATEGORY.sleepwear,

  Bielizna:
    PRODUCT_CATEGORY.underwear,

  Biustonosz:
    PRODUCT_CATEGORY.underwear,

  Bikini:
    PRODUCT_CATEGORY.swimwear,

  "Strój kąpielowy":
    PRODUCT_CATEGORY.swimwear,

  Skarpetki:
    PRODUCT_CATEGORY.socksAndTights,

  Rajstopy:
    PRODUCT_CATEGORY.socksAndTights,

  "Rajstopy / pończochy":
    PRODUCT_CATEGORY.socksAndTights,

  "Odzież sportowa":
    PRODUCT_CATEGORY.sportswear,

  Buty:
    PRODUCT_CATEGORY.shoes,

  Sneakersy:
    PRODUCT_CATEGORY.shoes,

  "Sandały":
    PRODUCT_CATEGORY.shoes,

  Trampki:
    PRODUCT_CATEGORY.shoes,

  Botki:
    PRODUCT_CATEGORY.shoes,

  Kozaki:
    PRODUCT_CATEGORY.shoes,

  "Szpilki / obcasy":
    PRODUCT_CATEGORY.shoes,

  "Mokasyny / loafersy":
    PRODUCT_CATEGORY.shoes,

  "Torebka / torba":
    PRODUCT_CATEGORY.bags,

  "Torebka crossbody":
    PRODUCT_CATEGORY.bags,

  "Torebka na ramię":
    PRODUCT_CATEGORY.bags,

  Shopperka:
    PRODUCT_CATEGORY.bags,

  "Biżuteria":
    PRODUCT_CATEGORY.jewelry,

  Kolczyki:
    PRODUCT_CATEGORY.jewelry,

  Naszyjnik:
    PRODUCT_CATEGORY.jewelry,

  Bransoletka:
    PRODUCT_CATEGORY.jewelry,

  "Pierścionek":
    PRODUCT_CATEGORY.jewelry,

  Akcesoria:
    PRODUCT_CATEGORY.accessories,

  Pasek:
    PRODUCT_CATEGORY.accessories,

  Okulary:
    PRODUCT_CATEGORY.accessories,

  "Czapka / kapelusz":
    PRODUCT_CATEGORY.accessories,

  "Szalik / chusta":
    PRODUCT_CATEGORY.accessories,

  "Akcesoria kosmetyczne":
    PRODUCT_CATEGORY.beautyAccessories,

  "Pędzel kosmetyczny":
    PRODUCT_CATEGORY.beautyAccessories,

  "Gąbka kosmetyczna":
    PRODUCT_CATEGORY.beautyAccessories,

  Kosmetyk:
    PRODUCT_CATEGORY.beauty,

  "Pomadka / szminka":
    PRODUCT_CATEGORY.beauty,

  "Błyszczyk":
    PRODUCT_CATEGORY.beauty,

  "Tusz do rzęs":
    PRODUCT_CATEGORY.beauty,

  "Produkt do domu":
    PRODUCT_CATEGORY.home,

  Organizer:
    PRODUCT_CATEGORY.home,

  "Tekstylia domowe":
    PRODUCT_CATEGORY.home,

  Dekoracja:
    PRODUCT_CATEGORY.home,
};

/*
 * Kolejność jest ważna.
 *
 * Najbardziej konkretne typy
 * występują przed bardziej
 * ogólnymi określeniami.
 *
 * Dzięki temu np.:
 *
 * jeansowa spódnica -> Spódnice
 * denim shorts      -> Szorty
 * jeansowa kurtka   -> Kurtki i płaszcze
 */
const CATEGORY_RULES:
  readonly CategoryRule[] =
  [
    {
      category:
        PRODUCT_CATEGORY.sleepwear,

      productType:
        "Piżama / odzież domowa",

      patterns: [
        /\bpizam/i,
        /\bkoszul[a-z]* nocn/i,
        /\bpajamas?\b/i,
        /\bpyjamas?\b/i,
        /\bnightwear\b/i,
        /\bsleepwear\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.swimwear,

      productType:
        "Strój kąpielowy",

      patterns: [
        /\bstroj[a-z]* kapiel/i,
        /\bkostium[a-z]* kapiel/i,
        /\bbikini\b/i,
        /\bswimsuit\b/i,
        /\bswimwear\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.sportswear,

      productType:
        "Odzież sportowa",

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

    {
      category:
        PRODUCT_CATEGORY.dresses,

      productType:
        "Sukienka",

      patterns: [
        /\bsukienk/i,
        /\bdress\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.jumpsuits,

      productType:
        "Kombinezon",

      patterns: [
        /\bkombinezon/i,
        /\bjumpsuit\b/i,
        /\bromper\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.sets,

      productType:
        "Komplet",

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

    {
      category:
        PRODUCT_CATEGORY.skirts,

      productType:
        "Spódnica",

      patterns: [
        /\bspodnic/i,
        /\bskirt\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.shorts,

      productType:
        "Szorty",

      patterns: [
        /\bszort/i,
        /\bshorts?\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.leggings,

      productType:
        "Legginsy",

      patterns: [
        /\bleggins/i,
        /\bleggings/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.blazers,

      productType:
        "Marynarka / żakiet",

      patterns: [
        /\bmarynark/i,
        /\bzakiet/i,
        /\bblazer\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.waistcoats,

      productType:
        "Kamizelka",

      patterns: [
        /\bkamizelk/i,
        /\bwaistcoat\b/i,
        /\bvest\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.outerwear,

      productType:
        "Kurtka / płaszcz",

      patterns: [
        /\bkurtk/i,
        /\bplaszcz/i,
        /\bcoat\b/i,
        /\bjacket\b/i,
        /\bparka\b/i,
        /\bbomber\b/i,
        /\btrench\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.jeans,

      productType:
        "Jeansy",

      patterns: [
        /\bjeansy\b/i,
        /\bjeans\b/i,
        /\bdenim pants\b/i,
        /\bdenim trousers\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.trousers,

      productType:
        "Spodnie",

      patterns: [
        /\bspodn/i,
        /\btrousers?\b/i,
        /\bpants?\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.cardigans,

      productType:
        "Kardigan",

      patterns: [
        /\bkardigan/i,
        /\bcardigan/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.tshirts,

      productType:
        "Koszulka / T-shirt",

      patterns: [
        /\bkoszulk/i,
        /\bt shirt\b/i,
        /\btshirt\b/i,
        /\btee\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.blouses,

      productType:
        "Bluzka",

      patterns: [
        /\bbluzk/i,
        /\bblouse\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.bodysuits,

      productType:
        "Body",

      patterns: [
        /\bbody\b(?!\s+(?:lotion|cream|mist|spray|oil|wash|scrub))/i,
        /\bbodysuit/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.shirts,

      productType:
        "Koszula",

      patterns: [
        /\bkoszula\b/i,
        /\bkoszule\b/i,
        /\bkoszuli\b/i,
        /\bshirt\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.hoodies,

      productType:
        "Bluza",

      patterns: [
        /\bbluza\b/i,
        /\bbluzy\b/i,
        /\bbluze\b/i,
        /\bhoodie\b/i,
        /\bsweatshirt\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.sweaters,

      productType:
        "Sweter",

      patterns: [
        /\bsweter/i,
        /\bgolf\b/i,
        /\bpullover\b/i,
        /\bsweater\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.tops,

      productType:
        "Top",

      patterns: [
        /\bcrop top\b/i,
        /\btank top\b/i,
        /\bcamisole\b/i,
        /\btop\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.underwear,

      productType:
        "Bielizna",

      patterns: [
        /\bbielizn/i,
        /\bbiustonosz/i,
        /\bstanik/i,
        /\bmajtki\b/i,
        /\blingerie\b/i,
        /\bunderwear\b/i,
        /\bbra\b/i,
        /\bpanties\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.socksAndTights,

      productType:
        "Skarpetki / rajstopy",

      patterns: [
        /\bskarpet/i,
        /\brajstop/i,
        /\bponczoch/i,
        /\bsocks?\b/i,
        /\btights?\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.bags,

      productType:
        "Torebka / torba",

      patterns: [
        /\btorebk/i,
        /\btorba\b/i,
        /\bhandbag\b/i,
        /\bshoulder bag\b/i,
        /\bcrossbody\b/i,
        /\bshopper\b/i,
        /\btote bag\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.shoes,

      productType:
        "Buty",

      patterns: [
        /\bbuty\b/i,
        /\bsandal/i,
        /\btrampk/i,
        /\bsneaker/i,
        /\bbotk/i,
        /\bkozak/i,
        /\bszpilk/i,
        /\bloafer/i,
        /\bheels?\b/i,
        /\bboots?\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.jewelry,

      productType:
        "Biżuteria",

      patterns: [
        /\bkolczyk/i,
        /\bnaszyjnik/i,
        /\bbransolet/i,
        /\bpierscion/i,
        /\bjewelry\b/i,
        /\bjewellery\b/i,
        /\bearrings?\b/i,
        /\bnecklace\b/i,
        /\bbracelet\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.beautyAccessories,

      productType:
        "Akcesoria kosmetyczne",

      patterns: [
        /\bgabk/i,
        /\bpedzel/i,
        /\baplikator/i,
        /\bzalotk/i,
        /\bmakeup sponge\b/i,
        /\bmakeup brush\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.beauty,

      productType:
        "Uroda",

      patterns: [
        /\bbody (?:lotion|cream|mist|spray|oil|wash|scrub)\b/i,
        /\bszmink/i,
        /\bpomadk/i,
        /\bblyszczyk/i,
        /\btusz do rzes/i,
        /\bmascara\b/i,
        /\beyeliner\b/i,
        /\bconcealer\b/i,
        /\bfoundation\b/i,
        /\blipstick\b/i,
        /\bserum\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.accessories,

      productType:
        "Akcesoria",

      patterns: [
        /\bopask/i,
        /\bspink/i,
        /\bokular/i,
        /\bszal\b/i,
        /\bchust/i,
        /\bpasek\b/i,
        /\bczapk/i,
        /\bkapelusz/i,
        /\baccessor/i,
        /\bbelt\b/i,
        /\bscarf\b/i,
        /\bsunglasses\b/i,
      ],
    },

    {
      category:
        PRODUCT_CATEGORY.home,

      productType:
        "Dom i lifestyle",

      patterns: [
        /\bposzewk/i,
        /\bposciel/i,
        /\bkoc\b/i,
        /\bdekorac/i,
        /\borganizer/i,
        /\bkitchen\b/i,
        /\bhome decor\b/i,
        /\bpojemnik/i,
        /\brecznik/i,
      ],
    },
  ];

function normalize(
  value: string
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

function matchRules(
  value: string
):
  | Omit<
      CategoryMatch,
      "confidence"
    >
  | null {
  const normalized =
    normalize(
      value
    );

  if (
    !normalized
  ) {
    return null;
  }

  for (
    const rule
    of CATEGORY_RULES
  ) {
    if (
      rule.patterns.some(
        (pattern) =>
          pattern.test(
            normalized
          )
      )
    ) {
      return {
        category:
          rule.category,

        productType:
          rule.productType,
      };
    }
  }

  return null;
}

function canTrustMappedType(
  productType: string,
  sourceText: string
) {
  if (
    productType !==
    "Body"
  ) {
    return true;
  }

  const normalized =
    normalize(
      sourceText
    );

  return !/\bbody (?:lotion|cream|mist|spray|oil|wash|scrub)\b/i.test(
    normalized
  );
}

export function enhanceParsedOfferCategory(
  parsed: ParsedOffer,
  sourceText: string
): ParsedOffer {
  let match:
    | CategoryMatch
    | null =
    null;

  /*
   * Najpierw sprawdzamy nazwę.
   * Jest to najpewniejsze źródło
   * dokładnego typu produktu.
   */
  const nameMatch =
    matchRules(
      parsed.name
    );

  if (
    nameMatch
  ) {
    match = {
      ...nameMatch,
      confidence:
        "high",
    };
  }

  /*
   * Następnie możemy użyć
   * rozpoznania wykonanego już
   * przez Szybki start 2.0.
   */
  if (
    !match
  ) {
    const mappedFromType =
      parsed.diagnostics
        .productType &&
      canTrustMappedType(
        parsed.diagnostics
          .productType,
        sourceText
      )
        ? TYPE_TO_CATEGORY[
            parsed.diagnostics
              .productType
          ]
        : undefined;

    if (
      mappedFromType
    ) {
      match = {
        category:
          mappedFromType,

        productType:
          parsed.diagnostics
            .productType,

        confidence:
          parsed.diagnostics
            .categoryConfidence ===
          "none"
            ? "medium"
            : parsed.diagnostics
                .categoryConfidence,
      };
    }
  }

  /*
   * Dopiero na końcu analizujemy
   * całą wklejoną treść.
   */
  if (
    !match
  ) {
    const sourceMatch =
      matchRules(
        sourceText
      );

    if (
      sourceMatch
    ) {
      match = {
        ...sourceMatch,
        confidence:
          "medium",
      };
    }
  }

  if (
    !match &&
    isProductCategory(
      parsed.category
    )
  ) {
    return parsed;
  }

  if (
    !match
  ) {
    return parsed;
  }

  const warnings =
    parsed.warnings.filter(
      (warning) =>
        warning !==
          "Nie udało się automatycznie dobrać kategorii." &&
        !warning.startsWith(
          "Kategoria została rozpoznana na podstawie"
        )
    );

  if (
    match.confidence ===
    "medium"
  ) {
    warnings.push(
      "Kategoria została dobrana na podstawie dodatkowej treści produktu. Sprawdź ją przed publikacją."
    );
  }

  const signals =
    parsed.diagnostics.signals.filter(
      (signal) =>
        signal !==
          parsed.category &&
        !signal.startsWith(
          "kategoria:"
        ) &&
        !signal.startsWith(
          "typ:"
        )
    );

  signals.push(
    `typ: ${match.productType}`
  );

  signals.push(
    `kategoria: ${match.category}`
  );

  return {
    ...parsed,

    category:
      match.category,

    warnings: [
      ...new Set(
        warnings
      ),
    ],

    diagnostics: {
      ...parsed.diagnostics,

      productType:
        match.productType,

      categoryConfidence:
        match.confidence,

      signals: [
        ...new Set(
          signals
        ),
      ],
    },
  };
}