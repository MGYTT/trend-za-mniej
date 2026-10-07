export type ParserConfidence =
  | "high"
  | "medium"
  | "low";

export type ParsedOffer = {
  name: string;
  shortName: string;
  price: string;
  oldPrice: string;
  affiliateUrl: string;
  category: string;
  soldText: string;
  confidence: ParserConfidence;
  warnings: string[];
};

type TitleCandidate = {
  original: string;
  cleaned: string;
  score: number;
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

const PRODUCT_KEYWORDS = [
  "bluza",
  "bluzka",
  "sweter",
  "kardigan",
  "top",
  "koszulka",
  "t-shirt",
  "tshirt",
  "koszula",
  "sukienka",
  "spodnie",
  "jeans",
  "jeansy",
  "spódnica",
  "kurtka",
  "płaszcz",
  "kamizelka",
  "kombinezon",
  "szorty",
  "buty",
  "sandały",
  "trampki",
  "sneakers",
  "torebka",
  "torba",
  "kolczyki",
  "naszyjnik",
  "bransoletka",
  "pierścionek",
  "gąbka",
  "gąbeczka",
  "pędzel",
  "akcesoria",
  "zestaw",
  "hoodie",
  "sweatshirt",
  "sweater",
  "dress",
  "shirt",
  "skirt",
  "pants",
  "jacket",
  "coat",
];

const UI_LINE_PATTERNS = [
  /^strona główna$/i,
  /^home$/i,
  /^shein$/i,
  /^kobiety$/i,
  /^mężczyźni$/i,
  /^dzieci$/i,
  /^uroda$/i,
  /^dom$/i,
  /^odzież damska$/i,
  /^odzież męska$/i,
  /^wyprzedaż$/i,
  /^sale$/i,

  /^wyszukaj/i,
  /^szukaj/i,

  /^wybierz kolor/i,
  /^kolor$/i,
  /^color$/i,

  /^wybierz rozmiar/i,
  /^rozmiar$/i,
  /^size$/i,

  /^tabela rozmiarów/i,
  /^przewodnik po rozmiarach/i,

  /^dodaj do koszyka/i,
  /^dodaj do torby/i,
  /^kup teraz/i,
  /^add to bag/i,
  /^add to cart/i,
  /^buy now/i,

  /^dostawa/i,
  /^wysyłka/i,
  /^shipping/i,

  /^zwrot/i,
  /^returns?/i,

  /^bezpłatna dostawa/i,
  /^darmowa dostawa/i,

  /^opis$/i,
  /^opis produktu/i,
  /^szczegóły/i,
  /^szczegóły produktu/i,
  /^specyfikacja/i,

  /^recenzje/i,
  /^opinie/i,
  /^oceny/i,
  /^reviews?/i,

  /^kod produktu/i,
  /^sku\b/i,
  /^id produktu/i,

  /^promocja/i,
  /^kupon/i,
  /^kod rabatowy/i,
  /^rabat/i,
  /^zniżka/i,

  /^zaloguj/i,
  /^rejestracja/i,
  /^konto$/i,

  /^ulubione/i,
  /^wishlist/i,

  /^podobne produkty/i,
  /^może ci się spodobać/i,
  /^polecane/i,

  /^sprzedano/i,
  /^sprzedanych/i,

  /^\d+(?:[.,]\d+)?\s*\/\s*5$/i,
  /^\d+(?:[.,]\d+)?\s*gwiazdek?$/i,

  /^[xsml]{1,4}$/i,
  /^\d{2,3}\s*(?:cm|kg)$/i,

  /^[-–—]+$/,
];

const CATEGORY_RULES: Array<{
  category: string;
  patterns: RegExp[];
}> = [
  {
    category:
      "Kardigany",

    patterns: [
      /\bkardigan/i,
      /\bcardigan/i,
    ],
  },

  {
    category:
      "Bluzy",

    patterns: [
      /\bbluz[ayę]/i,
      /\bhoodie\b/i,
      /\bsweatshirt\b/i,
    ],
  },

  {
    category:
      "Swetry",

    patterns: [
      /\bsweter/i,
      /\bpullover/i,
      /\bsweater/i,
    ],
  },

  {
    category:
      "Koszule",

    patterns: [
      /\bkoszul[aeęy]/i,
      /\bshirt\b/i,
    ],
  },

  {
    category:
      "Sukienki",

    patterns: [
      /\bsukienk/i,
      /\bdress\b/i,
    ],
  },

  {
    category:
      "Spódnice",

    patterns: [
      /\bspódnic/i,
      /\bskirt\b/i,
    ],
  },

  {
    category:
      "Spodnie",

    patterns: [
      /\bspodn/i,
      /\bjeans/i,
      /\bjeansy\b/i,
      /\btrousers?\b/i,
      /\bpants?\b/i,
    ],
  },

  {
    category:
      "Kurtki i płaszcze",

    patterns: [
      /\bkurtk/i,
      /\bpłaszcz/i,
      /\bcoat\b/i,
      /\bjacket\b/i,
    ],
  },

  {
    category:
      "Torebki",

    patterns: [
      /\btorebk/i,
      /\btorba\b/i,
      /\bhandbag\b/i,
      /\bshoulder bag\b/i,
    ],
  },

  {
    category:
      "Buty",

    patterns: [
      /\bbuty\b/i,
      /\bsandał/i,
      /\btrampk/i,
      /\bsneaker/i,
      /\bbotk/i,
      /\bszpilk/i,
      /\bloafers?\b/i,
    ],
  },

  {
    category:
      "Biżuteria",

    patterns: [
      /\bkolczyk/i,
      /\bnaszyjnik/i,
      /\bbransolet/i,
      /\bpierścion/i,
      /\bjewelry\b/i,
      /\bearrings?\b/i,
      /\bnecklace\b/i,
    ],
  },

  {
    category:
      "Akcesoria kosmetyczne",

    patterns: [
      /\bgąbk/i,
      /\bgąbeczk/i,
      /\bpędzel/i,
      /\baplikator/i,
      /\bmakeup sponge\b/i,
      /\bmakeup brush\b/i,
    ],
  },

  {
    category:
      "Topy",

    patterns: [
      /\btop\b/i,
      /\bcrop top\b/i,
      /\bkoszulk/i,
      /\bt-?shirt\b/i,
      /\btank top\b/i,
    ],
  },

  {
    category:
      "Akcesoria",

    patterns: [
      /\bopask/i,
      /\bspink/i,
      /\bokular/i,
      /\bszal\b/i,
      /\bpasek\b/i,
      /\baccessor/i,
    ],
  },
];

function normalizeText(
  value: string
) {
  return value
    .replace(/\r/g, "\n")
    .replace(
      /\u00a0/g,
      " "
    )
    .replace(
      /[\u200B-\u200D\uFEFF]/g,
      ""
    )
    .replace(/\t/g, " ")
    .replace(
      /\n{3,}/g,
      "\n\n"
    );
}

function cleanLine(
  value: string
) {
  return value
    .replace(
      /^[•·●▪▫►▶✓✔★☆]+\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function normalizePrice(
  value: string
) {
  return value
    .replace(/\s/g, "")
    .replace(".", ",");
}

function numericPrice(
  value: string
) {
  const parsed =
    Number(
      value
        .replace(/\s/g, "")
        .replace(",", ".")
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
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

  const shortened =
    clean.slice(
      0,
      maxLength + 1
    );

  const lastSpace =
    shortened.lastIndexOf(
      " "
    );

  if (
    lastSpace >=
    Math.floor(
      maxLength * 0.65
    )
  ) {
    return shortened
      .slice(
        0,
        lastSpace
      )
      .replace(
        /[,;:\-–—]+$/,
        ""
      )
      .trim();
  }

  return clean
    .slice(
      0,
      maxLength
    )
    .replace(
      /[,;:\-–—]+$/,
      ""
    )
    .trim();
}

function cleanProductName(
  value: string
) {
  let result =
    cleanLine(value)
      .replace(
        /\s*\|\s*SHEIN.*$/i,
        ""
      )
      .replace(
        /\s*[-–—]\s*SHEIN.*$/i,
        ""
      )
      .replace(
        /^produkt\s*[:\-–—]\s*/i,
        ""
      )
      .replace(
        /^nazwa\s*[:\-–—]\s*/i,
        ""
      )
      .replace(
        /^SHEIN\s+/i,
        ""
      )
      .trim();

  for (
    let index = 0;
    index < 2;
    index += 1
  ) {
    let changed =
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

    if (!changed) {
      break;
    }
  }

  result =
    result
      .replace(
        /\bSKU\s*[:#]?\s*[A-Z0-9-]+\b/gi,
        ""
      )
      .replace(
        /\bID\s*[:#]?\s*[A-Z0-9-]+\b/gi,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .replace(
        /^[,;:\-–—\s]+/,
        ""
      )
      .replace(
        /[,;:\-–—\s]+$/,
        ""
      )
      .trim();

  return truncateAtWord(
    result,
    180
  );
}

function createShortName(
  value: string
) {
  const name =
    cleanProductName(
      value
    );

  if (!name) {
    return "";
  }

  const clauses =
    name
      .split(
        /[,;|]/
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(
        Boolean
      );

  const firstClause =
    clauses[0] ??
    name;

  const base =
    firstClause.length >=
      18 &&
    firstClause.length <=
      78
      ? firstClause
      : name;

  return truncateAtWord(
    base,
    68
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

function looksLikeUrl(
  value: string
) {
  return /https?:\/\//i.test(
    value
  );
}

function containsCurrency(
  value: string
) {
  return (
    /(?:\d[\d\s]*(?:[.,]\d{1,2})?)\s*(?:zł|zl|pln)\b/i.test(
      value
    ) ||
    /\bpln\s*\d/i.test(
      value
    )
  );
}

function looksLikeUiLine(
  value: string
) {
  return UI_LINE_PATTERNS.some(
    (pattern) =>
      pattern.test(
        value
      )
  );
}

function hasProductKeyword(
  value: string
) {
  const normalized =
    value.toLocaleLowerCase(
      "pl"
    );

  return PRODUCT_KEYWORDS.some(
    (keyword) =>
      normalized.includes(
        keyword
      )
  );
}

function scoreTitleLine(
  value: string
) {
  const line =
    cleanLine(value);

  if (
    !line ||
    looksLikeUrl(line) ||
    containsCurrency(line) ||
    looksLikeUiLine(line)
  ) {
    return -1000;
  }

  if (
    /^\d+(?:[.,]\d+)?%?$/.test(
      line
    )
  ) {
    return -1000;
  }

  if (
    /^[-+]?\d+\s*%/.test(
      line
    )
  ) {
    return -1000;
  }

  if (
    line.length < 8
  ) {
    return -100;
  }

  if (
    line.length > 240
  ) {
    return -50;
  }

  const words =
    line
      .split(/\s+/)
      .filter(Boolean);

  const letters =
    line.match(
      /[a-ząćęłńóśźż]/gi
    )?.length ?? 0;

  const letterRatio =
    letters /
    Math.max(
      line.length,
      1
    );

  let score = 0;

  if (
    hasProductKeyword(
      line
    )
  ) {
    score += 28;
  }

  if (
    /^SHEIN\b/i.test(
      line
    )
  ) {
    score += 12;
  }

  if (
    words.length >= 4 &&
    words.length <= 24
  ) {
    score += 12;
  } else if (
    words.length >= 2 &&
    words.length <= 30
  ) {
    score += 5;
  }

  if (
    line.length >= 20 &&
    line.length <= 150
  ) {
    score += 10;
  }

  if (
    letterRatio >= 0.65
  ) {
    score += 8;
  } else if (
    letterRatio <
    0.45
  ) {
    score -= 12;
  }

  if (
    /damsk|męsk|kobiet|dziewcz|oversize|dekolt|kapturem|dzianin|bawełn|jednolit|paski|krótki rękaw|długi rękaw/i.test(
      line
    )
  ) {
    score += 7;
  }

  if (
    /promocj|rabat|kupon|gratis|dostaw|zwrot|punkty|aplikacj/i.test(
      line
    )
  ) {
    score -= 30;
  }

  if (
    /\d{5,}/.test(
      line
    )
  ) {
    score -= 15;
  }

  return score;
}

function extractName(
  lines: string[]
): {
  name: string;
  shortName: string;
  score: number;
} {
  const candidates: TitleCandidate[] =
    lines
      .map(
        (
          line
        ): TitleCandidate => ({
          original:
            line,

          cleaned:
            cleanProductName(
              line
            ),

          score:
            scoreTitleLine(
              line
            ),
        })
      )
      .filter(
        (candidate) =>
          candidate.cleaned
            .length >= 8 &&
          candidate.score >
            -100
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  const winner =
    candidates[0];

  if (!winner) {
    return {
      name: "",
      shortName: "",
      score: 0,
    };
  }

  const name =
    winner.cleaned;

  return {
    name,
    shortName:
      createShortName(
        name
      ),
    score:
      winner.score,
  };
}

function extractUrls(
  text: string
) {
  const matches =
    text.match(
      /https?:\/\/[^\s<>"']+/gi
    ) ?? [];

  return matches
    .map(
      (url) =>
        url.replace(
          /[)\],.;!?]+$/,
          ""
        )
    )
    .filter(
      (url) => {
        try {
          new URL(url);

          return true;
        } catch {
          return false;
        }
      }
    );
}

function extractAffiliateUrl(
  text: string
) {
  const urls =
    extractUrls(
      text
    );

  if (
    urls.length === 0
  ) {
    return "";
  }

  const onelink =
    urls.find(
      (url) =>
        /onelink\.shein\.com/i.test(
          url
        )
    );

  if (onelink) {
    return onelink;
  }

  const sheinUrl =
    urls.find(
      (url) =>
        /(?:^|\.)shein\.com/i.test(
          getHostname(
            url
          )
        ) ||
        /shein\.com/i.test(
          url
        )
    );

  return (
    sheinUrl ??
    urls[0]
  );
}

function getHostname(
  url: string
) {
  try {
    return new URL(
      url
    ).hostname;
  } catch {
    return "";
  }
}

function extractExplicitCurrentPrice(
  text: string
) {
  const patterns = [
    /(?:aktualna\s+cena|cena\s+promocyjna|cena\s+teraz|cena|price)\s*[:=\[\-–—]?\s*(?:PLN\s*)?(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|PLN)?/i,

    /(?:teraz|now)\s*[:=\[\-–—]?\s*(?:PLN\s*)?(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|PLN)/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      return normalizePrice(
        match[1]
      );
    }
  }

  return "";
}

function extractExplicitOldPrice(
  text: string
) {
  const patterns = [
    /(?:stara\s+cena|cena\s+regularna|regularna\s+cena|cena\s+detaliczna|pierwotna\s+cena|old\s+price|regular\s+price|retail\s+price|było|przedtem)\s*[:=\[\-–—]?\s*(?:PLN\s*)?(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|PLN)?/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      return normalizePrice(
        match[1]
      );
    }
  }

  return "";
}

function extractCurrencyPrices(
  value: string
) {
  const result: string[] =
    [];

  const afterNumber =
    value.matchAll(
      /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|PLN)\b/gi
    );

  for (
    const match
    of afterNumber
  ) {
    if (
      match[1]
    ) {
      result.push(
        normalizePrice(
          match[1]
        )
      );
    }
  }

  const beforeNumber =
    value.matchAll(
      /\bPLN\s*(\d{1,5}(?:[.,]\d{1,2})?)/gi
    );

  for (
    const match
    of beforeNumber
  ) {
    if (
      match[1]
    ) {
      result.push(
        normalizePrice(
          match[1]
        )
      );
    }
  }

  return [
    ...new Set(
      result
    ),
  ].filter(
    (price) => {
      const numeric =
        numericPrice(
          price
        );

      return (
        numeric !== null &&
        numeric >= 1 &&
        numeric <= 50000
      );
    }
  );
}

function extractPrices(
  text: string,
  lines: string[]
) {
  let price =
    extractExplicitCurrentPrice(
      text
    );

  let oldPrice =
    extractExplicitOldPrice(
      text
    );

  const priceLines =
    lines
      .map(
        (line) => ({
          line,
          prices:
            extractCurrencyPrices(
              line
            ),
        })
      )
      .filter(
        (item) =>
          item.prices
            .length > 0
      );

  if (
    !price &&
    priceLines.length > 0
  ) {
    price =
      priceLines[0]
        .prices[0] ??
      "";
  }

  if (!oldPrice) {
    for (
      const item
      of priceLines
    ) {
      if (
        item.prices.length <
        2
      ) {
        continue;
      }

      const values =
        item.prices
          .map(
            (itemPrice) => ({
              raw:
                itemPrice,

              numeric:
                numericPrice(
                  itemPrice
                ),
            })
          )
          .filter(
            (
              itemPrice
            ): itemPrice is {
              raw: string;
              numeric: number;
            } =>
              itemPrice.numeric !==
              null
          )
          .sort(
            (a, b) =>
              a.numeric -
              b.numeric
          );

      if (
        values.length <
        2
      ) {
        continue;
      }

      if (!price) {
        price =
          values[0].raw;
      }

      const currentNumeric =
        numericPrice(
          price
        );

      const bigger =
        values.find(
          (value) =>
            currentNumeric !==
              null &&
            value.numeric >
              currentNumeric *
                1.02
        );

      if (bigger) {
        oldPrice =
          bigger.raw;

        break;
      }
    }
  }

  if (
    price &&
    oldPrice
  ) {
    const current =
      numericPrice(
        price
      );

    const old =
      numericPrice(
        oldPrice
      );

    if (
      current !== null &&
      old !== null &&
      old <= current
    ) {
      oldPrice = "";
    }
  }

  return {
    price,
    oldPrice,
  };
}

function inferCategory(
  name: string
) {
  if (!name) {
    return "";
  }

  for (
    const rule
    of CATEGORY_RULES
  ) {
    if (
      rule.patterns.some(
        (pattern) =>
          pattern.test(
            name
          )
      )
    ) {
      return rule.category;
    }
  }

  return "";
}

function extractSoldText(
  text: string
) {
  const patterns = [
    /(\d+(?:[.,]\d+)?\s*[kK]?\+?)\s*(?:sprzedanych|sprzedano|sprzedaży)/i,

    /(\d+(?:[.,]\d+)?\s*[kK]?\+?)\s*(?:sold)/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      text.match(
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

function calculateConfidence({
  titleScore,
  name,
  price,
  affiliateUrl,
}: {
  titleScore: number;
  name: string;
  price: string;
  affiliateUrl: string;
}): ParserConfidence {
  let score = 0;

  if (
    name &&
    titleScore >= 35
  ) {
    score += 3;
  } else if (
    name &&
    titleScore >= 20
  ) {
    score += 2;
  } else if (name) {
    score += 1;
  }

  if (price) {
    score += 2;
  }

  if (
    affiliateUrl &&
    /onelink\.shein\.com/i.test(
      affiliateUrl
    )
  ) {
    score += 3;
  } else if (
    affiliateUrl
  ) {
    score += 1;
  }

  if (score >= 7) {
    return "high";
  }

  if (score >= 4) {
    return "medium";
  }

  return "low";
}

export function parseOfferText(
  text: string
): ParsedOffer {
  const normalizedText =
    normalizeText(
      text
    );

  const lines =
    normalizedText
      .split("\n")
      .map(
        cleanLine
      )
      .filter(
        Boolean
      );

  const title =
    extractName(
      lines
    );

  const {
    price,
    oldPrice,
  } =
    extractPrices(
      normalizedText,
      lines
    );

  const affiliateUrl =
    extractAffiliateUrl(
      normalizedText
    );

  const category =
    inferCategory(
      title.name
    );

  const soldText =
    extractSoldText(
      normalizedText
    );

  const confidence =
    calculateConfidence({
      titleScore:
        title.score,

      name:
        title.name,

      price,

      affiliateUrl,
    });

  const warnings: string[] =
    [];

  if (!title.name) {
    warnings.push(
      "Nie udało się pewnie rozpoznać nazwy produktu."
    );
  } else if (
    title.score < 20
  ) {
    warnings.push(
      "Nazwa została rozpoznana z niską pewnością — sprawdź ją ręcznie."
    );
  }

  if (!price) {
    warnings.push(
      "Nie znaleziono jednoznacznej ceny."
    );
  }

  if (
    !affiliateUrl
  ) {
    warnings.push(
      "Nie znaleziono linku wklejonego razem z ofertą."
    );
  } else if (
    !/onelink\.shein\.com/i.test(
      affiliateUrl
    )
  ) {
    warnings.push(
      "Znaleziony link nie wygląda jak standardowy link afiliacyjny SHEIN OneLink."
    );
  }

  if (
    !category &&
    title.name
  ) {
    warnings.push(
      "Nie rozpoznano automatycznie kategorii."
    );
  }

  return {
    name:
      title.name,

    shortName:
      title.shortName,

    price,

    oldPrice,

    affiliateUrl,

    category,

    soldText,

    confidence,

    warnings,
  };
}