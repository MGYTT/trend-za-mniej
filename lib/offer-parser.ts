export type ParserConfidence =
  | "high"
  | "medium"
  | "low";

export type DetectionConfidence =
  | "high"
  | "medium"
  | "low"
  | "none";

export type AffiliateKind =
  | "onelink"
  | "shein"
  | "other"
  | "none";

export type ParsedOfferDiagnostics = {
  sourceKind:
    | "shein"
    | "mixed"
    | "unknown";

  sourceLines: number;

  ignoredNoiseLines: number;

  productType: string;

  nameConfidence:
    DetectionConfidence;

  priceConfidence:
    DetectionConfidence;

  categoryConfidence:
    DetectionConfidence;

  affiliateKind:
    AffiliateKind;

  signals: string[];
};

export type ParsedOffer = {
  name: string;
  shortName: string;
  price: string;
  oldPrice: string;
  affiliateUrl: string;
  category: string;
  soldText: string;

  confidence:
    ParserConfidence;

  warnings:
    string[];

  diagnostics:
    ParsedOfferDiagnostics;
};

type TitleCandidate = {
  value: string;
  score: number;
};

type PriceCandidate = {
  raw: string;
  numeric: number;
  lineIndex: number;
  score: number;
};

type PriceResult = {
  price: string;
  oldPrice: string;

  confidence:
    DetectionConfidence;

  oldPriceInferred:
    boolean;
};

type ProductRecognition = {
  type: string;
  category: string;

  confidence:
    DetectionConfidence;
};

type AffiliateResult = {
  url: string;
  kind: AffiliateKind;
};

const SHEIN_COLLECTIONS = [
  "EZwear",
  "Essnce",
  "LUNE",
  "Bae",
  "VCAY",
  "MOD",
  "Clasi",
  "Privé",
  "MOTF",
  "DAZY",
  "SXY",
  "PETITE",
  "CURVE",
  "TALL",
  "Young",
];

const PRODUCT_RULES: Array<{
  type: string;
  category: string;
  patterns: RegExp[];
}> = [
  {
    type:
      "Kardigan",

    category:
      "Kardigany",

    patterns: [
      /\bkardigan/i,
      /\bcardigan/i,
    ],
  },

  {
    type:
      "Koszulka / T-shirt",

    category:
      "Topy",

    patterns: [
      /\bkoszulk/i,
      /\bt shirt\b/i,
      /\btshirt\b/i,
      /\btee\b/i,
    ],
  },

  {
    type:
      "Bluzka",

    category:
      "Topy",

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

    patterns: [
      /\btank top\b/i,
      /\bcami top\b/i,
      /\bcamisole\b/i,
      /\btop na ramiaczk/i,
    ],
  },

  {
    type:
      "Koszula",

    category:
      "Koszule",

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

    patterns: [
      /\bbluza\b/i,
      /\bbluzy\b/i,
      /\bbluze\b/i,
      /\bsweatshirt\b/i,
    ],
  },

  {
    type:
      "Golf",

    category:
      "Swetry",

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

    patterns: [
      /\btop\b/i,
    ],
  },

  {
    type:
      "Sukienka",

    category:
      "Sukienki",

    patterns: [
      /\bsukienk/i,
      /\bdress\b/i,
    ],
  },

  {
    type:
      "Spódnica",

    category:
      "Spódnice",

    patterns: [
      /\bspodnic/i,
      /\bskirt\b/i,
    ],
  },

  {
    type:
      "Jeansy",

    category:
      "Spodnie",

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

    patterns: [
      /\bszort/i,
      /\bshorts?\b/i,
    ],
  },

  {
    type:
      "Spodnie cargo",

    category:
      "Spodnie",

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

    patterns: [
      /\bspodn/i,
      /\btrousers?\b/i,
      /\bpants?\b/i,
    ],
  },

  {
    type:
      "Marynarka / żakiet",

    category:
      "Kurtki i płaszcze",

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

    patterns: [
      /\bkurtk/i,
      /\bjacket\b/i,
      /\bparka\b/i,
      /\bbomber\b/i,
    ],
  },

  {
    type:
      "Torebka crossbody",

    category:
      "Torebki",

    patterns: [
      /\bcrossbody\b/i,
    ],
  },

  {
    type:
      "Torebka na ramię",

    category:
      "Torebki",

    patterns: [
      /\bshoulder bag\b/i,
    ],
  },

  {
    type:
      "Shopperka",

    category:
      "Torebki",

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

    patterns: [
      /\btorebk/i,
      /\btorba\b/i,
      /\bhandbag\b/i,
      /\bbag\b/i,
    ],
  },

  {
    type:
      "Sneakersy",

    category:
      "Buty",

    patterns: [
      /\bsneaker/i,
    ],
  },

  {
    type:
      "Sandały",

    category:
      "Buty",

    patterns: [
      /\bsandal/i,
    ],
  },

  {
    type:
      "Botki",

    category:
      "Buty",

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

    patterns: [
      /\bszpilk/i,
      /\bhigh heels?\b/i,
      /\bheels?\b/i,
    ],
  },

  {
    type:
      "Trampki",

    category:
      "Buty",

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

    patterns: [
      /\bbuty\b/i,
      /\bshoes?\b/i,
      /\bfootwear\b/i,
    ],
  },

  {
    type:
      "Kolczyki",

    category:
      "Biżuteria",

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

    patterns: [
      /\bbizuter/i,
      /\bjewelry\b/i,
      /\bjewellery\b/i,
    ],
  },

  {
    type:
      "Pędzel kosmetyczny",

    category:
      "Akcesoria kosmetyczne",

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

    patterns: [
      /\bgabk/i,
      /\bbeauty blender\b/i,
      /\bmakeup sponge\b/i,
    ],
  },

  {
    type:
      "Akcesoria kosmetyczne",

    category:
      "Akcesoria kosmetyczne",

    patterns: [
      /\bzalotk/i,
      /\baplikator/i,
      /\bmakeup tool/i,
    ],
  },

  {
    type:
      "Kosmetyk",

    category:
      "Uroda",

    patterns: [
      /\bszmink/i,
      /\bpomadk/i,
      /\bblyszczyk/i,
      /\bmascara\b/i,
      /\beyeliner\b/i,
      /\bconcealer\b/i,
      /\bfoundation\b/i,
      /\blipstick\b/i,
      /\blip gloss\b/i,
      /\bserum\b/i,
    ],
  },

  {
    type:
      "Akcesoria",

    category:
      "Akcesoria",

    patterns: [
      /\bpasek\b/i,
      /\bbelt\b/i,
      /\bokular/i,
      /\bsunglasses\b/i,
      /\bczapk/i,
      /\bkapelusz/i,
      /\bszal\b/i,
      /\bscarf\b/i,
      /\bopask/i,
      /\bspink/i,
    ],
  },

  {
    type:
      "Produkt do domu",

    category:
      "Dom i lifestyle",

    patterns: [
      /\borganizer/i,
      /\bposzewk/i,
      /\bposciel/i,
      /\bkoc\b/i,
      /\bdekorac/i,
      /\bhome decor\b/i,
      /\bkitchen\b/i,
      /\bpojemnik/i,
      /\brecznik/i,
    ],
  },
];

const UI_PATTERNS = [
  /^strona glowna$/i,
  /^home$/i,
  /^shein$/i,

  /^kobiety$/i,
  /^mezczyzni$/i,
  /^dzieci$/i,

  /^wyszukaj/i,
  /^szukaj/i,

  /^kolor$/i,
  /^color$/i,

  /^rozmiar$/i,
  /^size$/i,

  /^wybierz kolor/i,
  /^wybierz rozmiar/i,

  /^tabela rozmiarow/i,
  /^przewodnik po rozmiarach/i,

  /^dodaj do koszyka/i,
  /^dodaj do torby/i,
  /^kup teraz/i,

  /^add to bag/i,
  /^add to cart/i,
  /^buy now/i,

  /^dostawa/i,
  /^wysylka/i,
  /^shipping/i,

  /^zwrot/i,
  /^returns?$/i,

  /^opis$/i,
  /^opis produktu/i,

  /^szczegoly$/i,
  /^szczegoly produktu/i,

  /^specyfikacja/i,

  /^recenzje/i,
  /^opinie/i,
  /^oceny/i,
  /^reviews?/i,

  /^kod produktu/i,
  /^sku\b/i,
  /^id produktu/i,

  /^promocja$/i,
  /^kupon$/i,
  /^rabat$/i,

  /^zaloguj/i,
  /^rejestracja/i,
  /^konto$/i,

  /^ulubione/i,
  /^wishlist/i,

  /^podobne produkty/i,
  /^polecane/i,

  /^sprzedano$/i,
  /^sprzedanych$/i,

  /^[xsml]{1,4}$/i,

  /^\d+(?:[.,]\d+)?\s*\/\s*5$/i,

  /^\d+(?:[.,]\d+)?\s*gwiazdek?$/i,

  /^[-–—]+$/,
];

const CURRENT_PRICE_MARKERS = [
  "aktualna cena",
  "cena promocyjna",
  "cena teraz",
  "sale price",
  "current price",
  "teraz",
  "now",
  "price",
  "cena",
];

const OLD_PRICE_MARKERS = [
  "stara cena",
  "cena regularna",
  "regularna cena",
  "pierwotna cena",
  "cena detaliczna",
  "old price",
  "regular price",
  "retail price",
  "original price",
  "bylo",
  "przedtem",
  "was",
];

const BAD_PRICE_CONTEXT = [
  "dostawa",
  "wysylka",
  "shipping",
  "kupon",
  "coupon",
  "kod rabatowy",
  "punkty",
  "points",
  "cashback",
  "minimalne zamowienie",
  "minimum order",
  "darmowa dostawa",
  "bezplatna dostawa",
];

function normalizeText(
  value: string
) {
  return value
    .replace(
      /\r\n?/g,
      "\n"
    )
    .replace(
      /\u00a0/g,
      " "
    )
    .replace(
      /[\u200B-\u200D\uFEFF]/g,
      ""
    )
    .replace(
      /\t/g,
      " "
    )
    .replace(
      /[ ]{2,}/g,
      " "
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}

function normalizeForMatch(
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
      /[^a-z0-9%+.,:/\-\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function cleanLine(
  value: string
) {
  return value
    .replace(
      /^[•·●▪▫►▶✓✔★☆◆◇]+\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function isUrl(
  value: string
) {
  return /https?:\/\//i.test(
    value
  );
}

function hasCurrency(
  value: string
) {
  return (
    /\d[\d\s]*(?:[.,]\d{1,2})?\s*(?:zł|zl|pln)\b/i.test(
      value
    ) ||
    /\bpln\s*\d/i.test(
      value
    )
  );
}

function isUiLine(
  value: string
) {
  const normalized =
    normalizeForMatch(
      value
    );

  return UI_PATTERNS.some(
    (
      pattern
    ) =>
      pattern.test(
        normalized
      )
  );
}

function escapeRegExp(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function truncateAtWord(
  value: string,
  maxLength: number
) {
  const clean =
    value.trim();

  if (
    clean.length <=
    maxLength
  ) {
    return clean;
  }

  const sliced =
    clean.slice(
      0,
      maxLength +
        1
    );

  const space =
    sliced.lastIndexOf(
      " "
    );

  if (
    space <
    maxLength *
      0.6
  ) {
    return clean
      .slice(
        0,
        maxLength
      )
      .trim();
  }

  return sliced
    .slice(
      0,
      space
    )
    .trim();
}

function cleanProductName(
  value: string
) {
  let result =
    cleanLine(
      value
    );

  result =
    result.replace(
      /^SHEIN\s+/i,
      ""
    );

  let changed =
    true;

  while (
    changed
  ) {
    changed =
      false;

    for (
      const collection
      of SHEIN_COLLECTIONS
    ) {
      const pattern =
        new RegExp(
          `^${escapeRegExp(
            collection
          )}\\s+`,
          "i"
        );

      if (
        pattern.test(
          result
        )
      ) {
        result =
          result
            .replace(
              pattern,
              ""
            )
            .trim();

        changed =
          true;

        break;
      }
    }
  }

  return truncateAtWord(
    result
      .replace(
        /\bSKU\s*[:#]?\s*[A-Z0-9_-]+\b/gi,
        ""
      )
      .replace(
        /\bID\s*(?:produktu)?\s*[:#]?\s*[A-Z0-9_-]+\b/gi,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .replace(
        /^[,;:\-–—|\s]+/,
        ""
      )
      .replace(
        /[,;:\-–—|\s]+$/,
        ""
      )
      .trim(),
    190
  );
}

function recognizeProduct(
  value: string
):
  | {
      type:
        string;

      category:
        string;
    }
  | null {
  const normalized =
    normalizeForMatch(
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
      return {
        type:
          rule.type,

        category:
          rule.category,
      };
    }
  }

  return null;
}

function containsProductSignal(
  value: string
) {
  return (
    recognizeProduct(
      value
    ) !==
    null
  );
}

function scoreTitle(
  line: string,
  lineIndex: number
) {
  const clean =
    cleanLine(
      line
    );

  if (
    !clean ||
    isUrl(
      clean
    ) ||
    hasCurrency(
      clean
    ) ||
    isUiLine(
      clean
    )
  ) {
    return -1000;
  }

  if (
    clean.length <
    7
  ) {
    return -100;
  }

  if (
    clean.length >
    260
  ) {
    return -70;
  }

  const normalized =
    normalizeForMatch(
      clean
    );

  const words =
    clean
      .split(
        /\s+/
      )
      .filter(
        Boolean
      );

  let score =
    0;

  if (
    containsProductSignal(
      clean
    )
  ) {
    score +=
      42;
  }

  if (
    words.length >=
      3 &&
    words.length <=
      24
  ) {
    score +=
      15;
  } else if (
    words.length ===
    2
  ) {
    score +=
      5;
  }

  if (
    clean.length >=
      18 &&
    clean.length <=
      150
  ) {
    score +=
      12;
  }

  if (
    /damsk|mesk|kobiet|oversize|dekolt|rekaw|dzianin|dopasowan|eleganck|casual|wide leg|slim|regular/i.test(
      normalized
    )
  ) {
    score +=
      8;
  }

  if (
    /promocj|rabat|kupon|gratis|dostaw|zwrot|punkty|aplikacj|wyprzedaz/i.test(
      normalized
    )
  ) {
    score -=
      40;
  }

  if (
    /\d{5,}/.test(
      clean
    )
  ) {
    score -=
      18;
  }

  if (
    lineIndex <=
    5
  ) {
    score +=
      8;
  } else if (
    lineIndex <=
    12
  ) {
    score +=
      3;
  }

  return score;
}

function extractName(
  lines: string[]
) {
  const candidates:
    TitleCandidate[] =
    [];

  lines.forEach(
    (
      line,
      index
    ) => {
      const score =
        scoreTitle(
          line,
          index
        );

      if (
        score >
        -100
      ) {
        candidates.push({
          value:
            cleanProductName(
              line
            ),

          score,
        });
      }

      const next =
        lines[
          index +
            1
        ];

      if (
        !next
      ) {
        return;
      }

      if (
        isUrl(
          line
        ) ||
        isUrl(
          next
        ) ||
        hasCurrency(
          line
        ) ||
        hasCurrency(
          next
        ) ||
        isUiLine(
          line
        ) ||
        isUiLine(
          next
        )
      ) {
        return;
      }

      const combined =
        `${line} ${next}`;

      if (
        combined.length >
        190
      ) {
        return;
      }

      if (
        !containsProductSignal(
          combined
        )
      ) {
        return;
      }

      candidates.push({
        value:
          cleanProductName(
            combined
          ),

        score:
          scoreTitle(
            combined,
            index
          ) +
          3,
      });
    }
  );

  candidates.sort(
    (
      first,
      second
    ) =>
      second.score -
      first.score
  );

  const winner =
    candidates.find(
      (
        candidate
      ) =>
        candidate.value.length >=
        7
    );

  if (
    !winner
  ) {
    return {
      name:
        "",

      score:
        0,

      confidence:
        "none" as const,
    };
  }

  const confidence:
    DetectionConfidence =
    winner.score >=
    55
      ? "high"
      : winner.score >=
          28
        ? "medium"
        : "low";

  return {
    name:
      winner.value,

    score:
      winner.score,

    confidence,
  };
}

function createShortName(
  name: string
) {
  const clean =
    cleanProductName(
      name
    );

  if (
    !clean
  ) {
    return "";
  }

  const parts =
    clean
      .split(
        /[,;|]/
      )
      .map(
        (
          value
        ) =>
          value.trim()
      )
      .filter(
        Boolean
      );

  let result =
    parts[0] ??
    clean;

  if (
    result.length <
      16 &&
    parts[1]
  ) {
    const combined =
      `${result} ${parts[1]}`;

    if (
      combined.length <=
      68
    ) {
      result =
        combined;
    }
  }

  return truncateAtWord(
    result,
    68
  );
}

function normalizePrice(
  value: string
) {
  return value
    .replace(
      /\s/g,
      ""
    )
    .replace(
      ".",
      ","
    );
}

function numericPrice(
  value: string
) {
  const number =
    Number(
      value
        .replace(
          /\s/g,
          ""
        )
        .replace(
          ",",
          "."
        )
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function extractPricesFromLine(
  line: string
) {
  const values:
    string[] =
    [];

  for (
    const match
    of line.matchAll(
      /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|pln)\b/gi
    )
  ) {
    if (
      match[1]
    ) {
      values.push(
        normalizePrice(
          match[1]
        )
      );
    }
  }

  for (
    const match
    of line.matchAll(
      /\bpln\s*(\d{1,5}(?:[.,]\d{1,2})?)/gi
    )
  ) {
    if (
      match[1]
    ) {
      values.push(
        normalizePrice(
          match[1]
        )
      );
    }
  }

  return [
    ...new Set(
      values
    ),
  ].filter(
    (
      value
    ) => {
      const number =
        numericPrice(
          value
        );

      return (
        number !==
          null &&
        number >=
          1 &&
        number <=
          50000
      );
    }
  );
}

function containsMarker(
  value: string,
  markers: string[]
) {
  const normalized =
    normalizeForMatch(
      value
    );

  return markers.some(
    (
      marker
    ) =>
      normalized.includes(
        normalizeForMatch(
          marker
        )
      )
  );
}

function extractPrices(
  lines: string[]
): PriceResult {
  const current:
    PriceCandidate[] =
    [];

  const old:
    PriceCandidate[] =
    [];

  lines.forEach(
    (
      line,
      lineIndex
    ) => {
      const prices =
        extractPricesFromLine(
          line
        );

      if (
        prices.length ===
        0
      ) {
        return;
      }

      const badContext =
        containsMarker(
          line,
          BAD_PRICE_CONTEXT
        );

      const currentMarker =
        containsMarker(
          line,
          CURRENT_PRICE_MARKERS
        );

      const oldMarker =
        containsMarker(
          line,
          OLD_PRICE_MARKERS
        );

      const numbers =
        prices
          .map(
            numericPrice
          )
          .filter(
            (
              value
            ): value is number =>
              value !==
              null
          );

      const minimum =
        numbers.length
          ? Math.min(
              ...numbers
            )
          : null;

      const maximum =
        numbers.length
          ? Math.max(
              ...numbers
            )
          : null;

      prices.forEach(
        (
          raw,
          valueIndex
        ) => {
          const numeric =
            numericPrice(
              raw
            );

          if (
            numeric ===
            null
          ) {
            return;
          }

          let currentScore =
            20;

          let oldScore =
            5;

          if (
            badContext
          ) {
            currentScore -=
              80;

            oldScore -=
              80;
          }

          if (
            currentMarker
          ) {
            currentScore +=
              50;
          }

          if (
            oldMarker
          ) {
            oldScore +=
              70;

            currentScore -=
              30;
          }

          if (
            lineIndex <=
            12
          ) {
            currentScore +=
              5;
          }

          if (
            minimum !==
              null &&
            numbers.length >
              1 &&
            numeric ===
              minimum
          ) {
            currentScore +=
              18;
          }

          if (
            minimum !==
              null &&
            maximum !==
              null &&
            maximum >
              minimum *
                1.02 &&
            numeric ===
              maximum
          ) {
            oldScore +=
              28;
          }

          currentScore -=
            valueIndex *
            2;

          current.push({
            raw,
            numeric,
            lineIndex,
            score:
              currentScore,
          });

          old.push({
            raw,
            numeric,
            lineIndex,
            score:
              oldScore,
          });
        }
      );
    }
  );

  current.sort(
    (
      first,
      second
    ) =>
      second.score -
      first.score
  );

  old.sort(
    (
      first,
      second
    ) =>
      second.score -
      first.score
  );

  const selected =
    current.find(
      (
        candidate
      ) =>
        candidate.score >
        0
    );

  if (
    !selected
  ) {
    return {
      price:
        "",

      oldPrice:
        "",

      confidence:
        "none",

      oldPriceInferred:
        false,
    };
  }

  let oldPrice =
    "";

  let oldPriceInferred =
    false;

  const explicitOld =
    old.find(
      (
        candidate
      ) =>
        candidate.score >=
          55 &&
        candidate.numeric >
          selected.numeric *
            1.02
    );

  if (
    explicitOld
  ) {
    oldPrice =
      explicitOld.raw;
  } else {
    const sameLineHigher =
      current.find(
        (
          candidate
        ) =>
          candidate.lineIndex ===
            selected.lineIndex &&
          candidate.numeric >
            selected.numeric *
              1.02
      );

    if (
      sameLineHigher
    ) {
      oldPrice =
        sameLineHigher.raw;

      oldPriceInferred =
        true;
    }
  }

  const confidence:
    DetectionConfidence =
    selected.score >=
    65
      ? "high"
      : selected.score >=
          35
        ? "medium"
        : "low";

  return {
    price:
      selected.raw,

    oldPrice,

    confidence,

    oldPriceInferred,
  };
}

function extractUrls(
  text: string
) {
  const matches =
    text.match(
      /https?:\/\/[^\s<>"']+/gi
    ) ??
    [];

  return [
    ...new Set(
      matches
        .map(
          (
            url
          ) =>
            url.replace(
              /[)\],.;!?]+$/,
              ""
            )
        )
        .filter(
          (
            url
          ) => {
            try {
              const parsed =
                new URL(
                  url
                );

              return (
                parsed.protocol ===
                  "https:" ||
                parsed.protocol ===
                  "http:"
              );
            } catch {
              return false;
            }
          }
        )
    ),
  ];
}

function getHostname(
  value: string
) {
  try {
    return new URL(
      value
    ).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function extractAffiliateUrl(
  text: string
): AffiliateResult {
  const urls =
    extractUrls(
      text
    );

  if (
    urls.length ===
    0
  ) {
    return {
      url:
        "",

      kind:
        "none",
    };
  }

  const oneLink =
    urls.find(
      (
        url
      ) =>
        getHostname(
          url
        ) ===
        "onelink.shein.com"
    );

  if (
    oneLink
  ) {
    return {
      url:
        oneLink,

      kind:
        "onelink",
    };
  }

  const shein =
    urls.find(
      (
        url
      ) => {
        const host =
          getHostname(
            url
          );

        return (
          host ===
            "shein.com" ||
          host.endsWith(
            ".shein.com"
          )
        );
      }
    );

  if (
    shein
  ) {
    return {
      url:
        shein,

      kind:
        "shein",
    };
  }

  return {
    url:
      urls[0],

    kind:
      "other",
  };
}

function recognizeCategory({
  name,
  text,
}: {
  name: string;
  text: string;
}): ProductRecognition {
  const nameRecognition =
    recognizeProduct(
      name
    );

  if (
    nameRecognition
  ) {
    return {
      ...nameRecognition,

      confidence:
        "high",
    };
  }

  const textRecognition =
    recognizeProduct(
      text
    );

  if (
    textRecognition
  ) {
    return {
      ...textRecognition,

      confidence:
        "medium",
    };
  }

  return {
    type:
      "",

    category:
      "",

    confidence:
      "none",
  };
}

function extractSoldText(
  text: string
) {
  const normalized =
    normalizeForMatch(
      text
    );

  const patterns = [
    /(\d+(?:[.,]\d+)?\s*k?\+?)\s*(?:sprzedanych|sprzedano|sprzedazy)/i,

    /(?:sprzedano|sprzedanych)\s*(\d+(?:[.,]\d+)?\s*k?\+?)/i,

    /(\d+(?:[.,]\d+)?\s*k?\+?)\s*sold\b/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      normalized.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      const count =
        match[1]
          .replace(
            /\s+/g,
            ""
          )
          .toUpperCase();

      return `${count} sprzedanych`;
    }
  }

  return "";
}

function confidencePoints(
  value:
    DetectionConfidence
) {
  switch (
    value
  ) {
    case "high":
      return 25;

    case "medium":
      return 18;

    case "low":
      return 8;

    default:
      return 0;
  }
}

function calculateOverallConfidence({
  nameConfidence,
  priceConfidence,
  categoryConfidence,
  affiliateKind,
}: {
  nameConfidence:
    DetectionConfidence;

  priceConfidence:
    DetectionConfidence;

  categoryConfidence:
    DetectionConfidence;

  affiliateKind:
    AffiliateKind;
}): ParserConfidence {
  let score =
    confidencePoints(
      nameConfidence
    ) +
    confidencePoints(
      priceConfidence
    ) +
    confidencePoints(
      categoryConfidence
    );

  if (
    affiliateKind ===
    "onelink"
  ) {
    score +=
      30;
  } else if (
    affiliateKind ===
    "shein"
  ) {
    score +=
      20;
  } else if (
    affiliateKind ===
    "other"
  ) {
    score +=
      5;
  }

  if (
    score >=
    80
  ) {
    return "high";
  }

  if (
    score >=
    50
  ) {
    return "medium";
  }

  return "low";
}

function detectSourceKind(
  text: string,
  affiliateKind:
    AffiliateKind
):
  | "shein"
  | "mixed"
  | "unknown" {
  if (
    affiliateKind ===
      "onelink" ||
    affiliateKind ===
      "shein" ||
    normalizeForMatch(
      text
    ).includes(
      "shein"
    )
  ) {
    return "shein";
  }

  if (
    /https?:\/\//i.test(
      text
    )
  ) {
    return "mixed";
  }

  return "unknown";
}

export function parseOfferText(
  input: string
): ParsedOffer {
  const text =
    normalizeText(
      input
    );

  const rawLines =
    text
      .split(
        "\n"
      )
      .map(
        cleanLine
      )
      .filter(
        Boolean
      );

  const usefulLines =
    rawLines.filter(
      (
        line
      ) =>
        !isUiLine(
          line
        )
    );

  const ignoredNoiseLines =
    rawLines.length -
    usefulLines.length;

  const nameResult =
    extractName(
      usefulLines
    );

  const shortName =
    createShortName(
      nameResult.name
    );

  const priceResult =
    extractPrices(
      rawLines
    );

  const product =
    recognizeCategory({
      name:
        nameResult.name,

      text:
        usefulLines.join(
          "\n"
        ),
    });

  const affiliate =
    extractAffiliateUrl(
      text
    );

  const soldText =
    extractSoldText(
      text
    );

  const signals:
    string[] =
    [];

  if (
    nameResult.name
  ) {
    signals.push(
      "nazwa"
    );
  }

  if (
    product.type
  ) {
    signals.push(
      product.type
    );
  }

  if (
    priceResult.price
  ) {
    signals.push(
      "cena"
    );
  }

  if (
    product.category
  ) {
    signals.push(
      product.category
    );
  }

  if (
    affiliate.kind ===
    "onelink"
  ) {
    signals.push(
      "SHEIN OneLink"
    );
  } else if (
    affiliate.kind ===
    "shein"
  ) {
    signals.push(
      "link SHEIN"
    );
  }

  if (
    soldText
  ) {
    signals.push(
      "sprzedaż"
    );
  }

  const warnings:
    string[] =
    [];

  if (
    !nameResult.name
  ) {
    warnings.push(
      "Nie udało się jednoznacznie rozpoznać nazwy produktu."
    );
  } else if (
    nameResult.confidence ===
    "low"
  ) {
    warnings.push(
      "Nazwa produktu została rozpoznana z niską pewnością."
    );
  }

  if (
    !priceResult.price
  ) {
    warnings.push(
      "Nie znaleziono jednoznacznej aktualnej ceny."
    );
  } else if (
    priceResult.confidence ===
    "low"
  ) {
    warnings.push(
      "Sprawdź cenę — system nie ma pełnej pewności, czy rozpoznana kwota jest ceną produktu."
    );
  }

  if (
    priceResult.oldPrice
  ) {
    warnings.push(
      priceResult.oldPriceInferred
        ? "Stara cena została wywnioskowana z dwóch kwot obok siebie. Sprawdź ją przed publikacją."
        : "Rozpoznano starą cenę. Sprawdź, czy faktycznie jest wcześniejszą ceną produktu."
    );
  }

  if (
    !product.category
  ) {
    warnings.push(
      "Nie udało się automatycznie dobrać kategorii."
    );
  } else if (
    product.confidence ===
    "medium"
  ) {
    warnings.push(
      "Kategoria została rozpoznana na podstawie dodatkowej treści, a nie samej nazwy."
    );
  }

  if (
    !affiliate.url
  ) {
    warnings.push(
      "Nie znaleziono linku we wklejonej treści."
    );
  } else if (
    affiliate.kind ===
    "other"
  ) {
    warnings.push(
      "Znaleziony link nie wygląda jak link SHEIN."
    );
  } else if (
    affiliate.kind ===
    "shein"
  ) {
    warnings.push(
      "Rozpoznano zwykły link SHEIN. Sprawdź, czy jest właściwym linkiem afiliacyjnym."
    );
  }

  if (
    soldText
  ) {
    warnings.push(
      "Informację o sprzedaży publikuj tylko wtedy, gdy nadal jest aktualna."
    );
  }

  const confidence =
    calculateOverallConfidence({
      nameConfidence:
        nameResult.confidence,

      priceConfidence:
        priceResult.confidence,

      categoryConfidence:
        product.confidence,

      affiliateKind:
        affiliate.kind,
    });

  return {
    name:
      nameResult.name,

    shortName,

    price:
      priceResult.price,

    oldPrice:
      priceResult.oldPrice,

    affiliateUrl:
      affiliate.url,

    category:
      product.category,

    soldText,

    confidence,

    warnings: [
      ...new Set(
        warnings
      ),
    ],

    diagnostics: {
      sourceKind:
        detectSourceKind(
          text,
          affiliate.kind
        ),

      sourceLines:
        rawLines.length,

      ignoredNoiseLines,

      productType:
        product.type,

      nameConfidence:
        nameResult.confidence,

      priceConfidence:
        priceResult.confidence,

      categoryConfidence:
        product.confidence,

      affiliateKind:
        affiliate.kind,

      signals:
        [
          ...new Set(
            signals
          ),
        ],
    },
  };
}