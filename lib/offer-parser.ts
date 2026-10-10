import {
  recognizeProductType,
} from "@/lib/product-recognition";

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

  signals:
    string[];
};

export type ParsedOffer = {
  name:
    string;

  shortName:
    string;

  price:
    string;

  oldPrice:
    string;

  affiliateUrl:
    string;

  category:
    string;

  soldText:
    string;

  confidence:
    ParserConfidence;

  warnings:
    string[];

  diagnostics:
    ParsedOfferDiagnostics;
};

type TitleCandidate = {
  value:
    string;

  score:
    number;
};

type PriceCandidate = {
  raw:
    string;

  numeric:
    number;

  score:
    number;
};

type PriceResult = {
  price:
    string;

  oldPrice:
    string;

  confidence:
    DetectionConfidence;

  oldPriceInferred:
    boolean;
};

type AffiliateResult = {
  url:
    string;

  kind:
    AffiliateKind;
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

  /^dostawa$/i,
  /^wysylka$/i,
  /^shipping$/i,

  /^zwrot$/i,
  /^returns?$/i,

  /^opis$/i,
  /^opis produktu$/i,

  /^szczegoly$/i,
  /^szczegoly produktu$/i,

  /^specyfikacja$/i,

  /^recenzje$/i,
  /^opinie$/i,
  /^oceny$/i,
  /^reviews?$/i,

  /^kod produktu$/i,
  /^sku\b/i,
  /^id produktu$/i,

  /^zaloguj/i,
  /^rejestracja/i,
  /^konto$/i,

  /^ulubione/i,
  /^wishlist/i,

  /^podobne produkty/i,
  /^polecane/i,

  /^[xsml]{1,4}$/i,

  /^\d+(?:[.,]\d+)?\s*\/\s*5$/i,
  /^\d+(?:[.,]\d+)?\s*gwiazdek?$/i,

  /^[-–—]+$/,
];

const CURRENT_PRICE_MARKERS = [
  "aktualna cena",
  "cena aktualna",
  "cena promocyjna",
  "cena teraz",
  "sale price",
  "current price",
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

function decodeHtmlEntities(
  value:
    string
) {
  return value
    .replace(
      /&#x([0-9a-f]+);/gi,
      (
        _match,
        hex:
          string
      ) => {
        const code =
          Number.parseInt(
            hex,
            16
          );

        return Number.isFinite(
          code
        )
          ? String.fromCodePoint(
              code
            )
          : " ";
      }
    )
    .replace(
      /&#(\d+);/g,
      (
        _match,
        decimal:
          string
      ) => {
        const code =
          Number.parseInt(
            decimal,
            10
          );

        return Number.isFinite(
          code
        )
          ? String.fromCodePoint(
              code
            )
          : " ";
      }
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;|&apos;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    );
}

function getHostname(
  value:
    string
) {
  try {
    return new URL(
      value
    ).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isFacebookAssetUrl(
  value:
    string
) {
  const hostname =
    getHostname(
      value
    );

  return (
    hostname ===
      "fbcdn.net" ||
    hostname.endsWith(
      ".fbcdn.net"
    ) ||
    hostname ===
      "facebook.com" ||
    hostname.endsWith(
      ".facebook.com"
    )
  );
}

function isSheinHostname(
  hostname:
    string
) {
  return (
    hostname ===
      "shein.com" ||
    hostname.endsWith(
      ".shein.com"
    )
  );
}

function stripMarkdownLinks(
  value:
    string
) {
  return value.replace(
    /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi,
    (
      _full,
      label:
        string,
      url:
        string
    ) => {
      const cleanLabel =
        label
          .replace(
            /\*\*/g,
            ""
          )
          .replace(
            /__/g,
            ""
          )
          .trim();

      /*
       * Linki Facebooka prowadzące
       * do obrazków emoji są tylko
       * technicznym śmieciem.
       *
       * Zamieniamy je na separator,
       * dzięki czemu:
       *
       * 💰 Cena
       * 🛒 Produkt
       * 🎁 Kupon
       *
       * stają się osobnymi blokami.
       */
      if (
        isFacebookAssetUrl(
          url
        )
      ) {
        return "\n";
      }

      const hostname =
        getHostname(
          url
        );

      /*
       * Gdy tekst linku jest samym
       * adresem, zachowujemy tylko
       * czysty adres.
       */
      if (
        /^https?:\/\//i.test(
          cleanLabel
        )
      ) {
        return `\n${cleanLabel}\n`;
      }

      /*
       * Dla linków SHEIN zachowujemy
       * adres, nawet jeśli link ma
       * inny tekst widoczny.
       */
      if (
        hostname ===
          "onelink.shein.com" ||
        isSheinHostname(
          hostname
        )
      ) {
        return cleanLabel
          ? `\n${cleanLabel}\n${url}\n`
          : `\n${url}\n`;
      }

      /*
       * Zwykły Markdown:
       *
       * [nazwa](url)
       *
       * pozostawiamy jako nazwę.
       */
      return cleanLabel
        ? ` ${cleanLabel} `
        : "\n";
    }
  );
}

function normalizeWhitespace(
  value:
    string
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
      /\n[ ]+/g,
      "\n"
    )
    .replace(
      /[ ]+\n/g,
      "\n"
    )
    .replace(
      /\n{2,}/g,
      "\n"
    )
    .trim();
}

function preprocessOfferText(
  input:
    string
) {
  let text =
    decodeHtmlEntities(
      input
    );

  /*
   * Najpierw usuwamy składnię
   * Markdown charakterystyczną
   * dla postów kopiowanych
   * z Facebooka.
   */
  text =
    stripMarkdownLinks(
      text
    );

  text =
    text
      .replace(
        /<[^>]+>/g,
        " "
      )
      .replace(
        /\*\*([^*]+)\*\*/g,
        "$1"
      )
      .replace(
        /__([^_]+)__/g,
        "$1"
      )
      .replace(
        /`([^`]+)`/g,
        "$1"
      );

  /*
   * Jeśli post został skopiowany
   * z prawdziwymi emoji zamiast
   * Markdowna, również traktujemy
   * je jako separatory.
   */
  text =
    text.replace(
      /[🔥💰🛒🎁]/gu,
      "\n"
    );

  /*
   * Rozdzielamy blok kuponu.
   */
  text =
    text.replace(
      /\b(Kupon|Coupon|Kod rabatowy)\b/gi,
      "\n$1"
    );

  /*
   * Najważniejsza poprawka dla:
   *
   * Cena[40,70zł] -45%
   * Cena: 40,70 zł
   * Cena 40,70zł
   *
   * Cały blok ceny trafia do
   * osobnego wiersza i nie może
   * zostać nazwą produktu.
   */
  text =
    text.replace(
      /((?:Cena|Price)\s*[\[(:=\-–—]?\s*\d{1,5}(?:[.,]\d{1,2})?\s*(?:zł|zl|pln)\s*\]?\s*(?:-\s*\d{1,3}\s*%|\d{1,3}\s*%\s*OFF)?)/gi,
      "\n$1\n"
    );

  /*
   * Każdy surowy URL otrzymuje
   * własny wiersz.
   */
  text =
    text.replace(
      /(https?:\/\/[^\s<>"'\])}*]+)/gi,
      "\n$1\n"
    );

  return normalizeWhitespace(
    text
  );
}

function normalizeForMatch(
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
  value:
    string
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

function isUrlLine(
  value:
    string
) {
  return /^https?:\/\/\S+$/i.test(
    value.trim()
  );
}

function hasCurrency(
  value:
    string
) {
  return (
    /\d[\d\s]*(?:[.,]\d{1,2})?\s*(?:zł|zl|pln)(?=$|[\s\]\),;.!?%\-])/i.test(
      value
    ) ||
    /\bpln\s*\d/i.test(
      value
    )
  );
}

function isUiLine(
  value:
    string
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

function isMarketingNoise(
  value:
    string
) {
  const normalized =
    normalizeForMatch(
      value
    );

  if (
    !normalized
  ) {
    return true;
  }

  const patterns = [
    /\bnie przegap\b/i,
    /\bgorac[a-z]* ofert/i,
    /\bmega znizk/i,
    /\bsuper znizk/i,
    /\bduz[a-z]* znizk/i,

    /\bkupon\b/i,
    /\bcoupon\b/i,
    /\bkod rabatow/i,

    /\bnowego uzytkownika\b/i,
    /\bnowy uzytkownik\b/i,
    /\bnew user\b/i,

    /\b\d{1,3}\s*%\s*off\b/i,

    /\bsprawdz teraz\b/i,
    /\bkliknij\b.*\blink\b/i,
  ];

  return patterns.some(
    (
      pattern
    ) =>
      pattern.test(
        normalized
      )
  );
}

function isNoiseUrlLine(
  value:
    string
) {
  if (
    !isUrlLine(
      value
    )
  ) {
    return false;
  }

  return isFacebookAssetUrl(
    value
  );
}

function escapeRegExp(
  value:
    string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function truncateAtWord(
  value:
    string,
  maxLength:
    number
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
      0.55
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
  value:
    string
) {
  let result =
    cleanLine(
      value
    );

  result =
    result
      .replace(
        /^(?:produkt|nazwa produktu)\s*[:\-–—]\s*/i,
        ""
      )
      .replace(
        /^SHEIN\s+/i,
        ""
      );

  /*
   * Usuwamy kolekcje SHEIN
   * z początku nazwy, ale tylko
   * gdy rzeczywiście są prefiksem.
   */
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

  result =
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
      .trim();

  return truncateAtWord(
    result,
    190
  );
}

function hasProductSignal(
  value:
    string
) {
  const recognition =
    recognizeProductType({
      name:
        value,

      content:
        "",
    });

  return Boolean(
    recognition.type
  );
}

function scoreTitle(
  line:
    string,
  lineIndex:
    number
) {
  const clean =
    cleanLine(
      line
    );

  if (
    !clean ||
    isUrlLine(
      clean
    ) ||
    hasCurrency(
      clean
    ) ||
    isUiLine(
      clean
    ) ||
    isMarketingNoise(
      clean
    )
  ) {
    return -1000;
  }

  const normalized =
    normalizeForMatch(
      clean
    );

  if (
    /^[-+]?\d{1,3}\s*%/.test(
      normalized
    )
  ) {
    return -1000;
  }

  if (
    clean.length <
    5
  ) {
    return -200;
  }

  if (
    clean.length >
    260
  ) {
    return -100;
  }

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

  /*
   * Rozpoznany typ produktu jest
   * zdecydowanie najsilniejszym
   * sygnałem.
   */
  if (
    hasProductSignal(
      clean
    )
  ) {
    score +=
      70;
  }

  if (
    words.length >=
      2 &&
    words.length <=
      28
  ) {
    score +=
      18;
  }

  if (
    clean.length >=
      10 &&
    clean.length <=
      180
  ) {
    score +=
      15;
  }

  /*
   * Słowa typowe dla realnego
   * opisu produktu.
   */
  if (
    /damsk|mesk|dziewczyn|chlop|kobiet|oversize|dekolt|rekaw|dzianin|dopasowan|eleganck|casual|uniwersal|wide leg|slim|regular|jesien|zim|wiosn|letn/i.test(
      normalized
    )
  ) {
    score +=
      10;
  }

  /*
   * Reklama i CTA znacząco
   * obniżają wynik.
   */
  if (
    /promocj|rabat|kupon|gratis|dostaw|zwrot|punkty|aplikacj|wyprzedaz|znizk|ofert/i.test(
      normalized
    )
  ) {
    score -=
      65;
  }

  if (
    /\d{5,}/.test(
      clean
    )
  ) {
    score -=
      20;
  }

  if (
    lineIndex <=
    8
  ) {
    score +=
      5;
  }

  return score;
}

function extractName(
  lines:
    string[]
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
        const value =
          cleanProductName(
            line
          );

        if (
          value.length >=
          5
        ) {
          candidates.push({
            value,
            score,
          });
        }
      }

      /*
       * Jeżeli sklep złamał nazwę
       * produktu na dwa wiersze,
       * sprawdzamy również ich
       * połączenie.
       */
      const next =
        lines[
          index +
            1
        ];

      if (
        !next ||
        isUrlLine(
          line
        ) ||
        isUrlLine(
          next
        ) ||
        hasCurrency(
          line
        ) ||
        hasCurrency(
          next
        ) ||
        isMarketingNoise(
          line
        ) ||
        isMarketingNoise(
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
        !hasProductSignal(
          combined
        )
      ) {
        return;
      }

      const combinedScore =
        scoreTitle(
          combined,
          index
        );

      if (
        combinedScore >
        -100
      ) {
        candidates.push({
          value:
            cleanProductName(
              combined
            ),

          score:
            combinedScore +
            4,
        });
      }
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
    candidates[0];

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
    80
      ? "high"
      : winner.score >=
          45
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

function removeShortNameSeasonTail(
  value:
    string
) {
  return value
    .replace(
      /\s+na\s+(?:jesień|jesien|zimę|zime|zimę\/jesień|zime\/jesien|jesień\/zimę|jesien\/zime|wiosnę|wiosne|lato)\s*$/i,
      ""
    )
    .replace(
      /\s+na\s+(?:jesień|jesien|zimę|zime|wiosnę|wiosne|lato)\s*\/\s*(?:jesień|jesien|zimę|zime|wiosnę|wiosne|lato)\s*$/i,
      ""
    )
    .trim();
}

function createShortName(
  name:
    string,
  productType:
    string
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

  /*
   * Najczęściej pierwszy segment
   * przed przecinkiem jest najlepszą
   * nazwą na kafelek.
   *
   * Przykład:
   *
   * Sweter dla nastoletniej dziewczyny
   * na jesień/zimę, casualowy...
   *
   * ->
   *
   * Sweter dla nastoletniej dziewczyny
   */
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

  result =
    removeShortNameSeasonTail(
      result
    );

  /*
   * Jeśli pierwszy segment jest
   * bardzo ogólny, np. tylko
   * "Sweter", dokładamy drugi
   * sensowny fragment.
   */
  if (
    result.length <
      14 &&
    parts[1]
  ) {
    const second =
      removeShortNameSeasonTail(
        parts[1]
      );

    const combined =
      `${result} ${second}`
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    if (
      combined.length <=
      58
    ) {
      result =
        combined;
    }
  }

  /*
   * Awaryjnie nie pozwalamy,
   * aby krótka nazwa była samym
   * słowem marketingowym.
   */
  if (
    isMarketingNoise(
      result
    ) &&
    productType
  ) {
    result =
      productType;
  }

  return truncateAtWord(
    result,
    58
  );
}

function normalizePrice(
  value:
    string
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
  value:
    string
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
  line:
    string
) {
  const values:
    string[] =
    [];

  for (
    const match
    of line.matchAll(
      /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|pln)(?=$|[\s\]\),;.!?%\-])/gi
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
  value:
    string,
  markers:
    string[]
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

function extractExplicitCurrentPrice(
  lines:
    string[]
) {
  for (
    const line
    of lines
  ) {
    /*
     * Wiersze zawierające jawny
     * marker starej ceny nigdy
     * nie są ceną aktualną.
     */
    if (
      containsMarker(
        line,
        OLD_PRICE_MARKERS
      )
    ) {
      continue;
    }

    const match =
      line.match(
        /\b(?:cena(?:\s+(?:aktualna|promocyjna|teraz))?|price|sale price|current price)\s*[\[(:=\-–—]?\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł|zl|pln)\s*\]?/i
      );

    if (
      match?.[1]
    ) {
      const normalized =
        normalizePrice(
          match[1]
        );

      const numeric =
        numericPrice(
          normalized
        );

      if (
        numeric !==
          null &&
        numeric >=
          1 &&
        numeric <=
          50000
      ) {
        return normalized;
      }
    }
  }

  return "";
}

function extractExplicitOldPrice(
  lines:
    string[]
) {
  for (
    const line
    of lines
  ) {
    if (
      !containsMarker(
        line,
        OLD_PRICE_MARKERS
      )
    ) {
      continue;
    }

    const prices =
      extractPricesFromLine(
        line
      );

    if (
      prices[0]
    ) {
      return prices[0];
    }
  }

  return "";
}

function extractPrices(
  lines:
    string[]
): PriceResult {
  /*
   * Najpierw obsługujemy najczęstszy
   * format Twoich postów:
   *
   * Cena[40,70zł] -45%
   */
  const explicitCurrent =
    extractExplicitCurrentPrice(
      lines
    );

  const explicitOld =
    extractExplicitOldPrice(
      lines
    );

  if (
    explicitCurrent
  ) {
    const currentNumeric =
      numericPrice(
        explicitCurrent
      );

    const oldNumeric =
      explicitOld
        ? numericPrice(
            explicitOld
          )
        : null;

    return {
      price:
        explicitCurrent,

      oldPrice:
        currentNumeric !==
          null &&
        oldNumeric !==
          null &&
        oldNumeric >
          currentNumeric
          ? explicitOld
          : "",

      confidence:
        "high",

      oldPriceInferred:
        false,
    };
  }

  const candidates:
    PriceCandidate[] =
    [];

  lines.forEach(
    (
      line,
      index
    ) => {
      if (
        containsMarker(
          line,
          OLD_PRICE_MARKERS
        )
      ) {
        return;
      }

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

          let score =
            20;

          if (
            currentMarker
          ) {
            score +=
              65;
          }

          if (
            badContext
          ) {
            score -=
              90;
          }

          if (
            index <=
            8
          ) {
            score +=
              5;
          }

          score -=
            valueIndex *
            2;

          candidates.push({
            raw,
            numeric,
            score,
          });
        }
      );
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

  const selected =
    candidates.find(
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

  const oldNumeric =
    explicitOld
      ? numericPrice(
          explicitOld
        )
      : null;

  return {
    price:
      selected.raw,

    oldPrice:
      oldNumeric !==
        null &&
      oldNumeric >
        selected.numeric
        ? explicitOld
        : "",

    confidence:
      selected.score >=
      60
        ? "high"
        : selected.score >=
            25
          ? "medium"
          : "low",

    oldPriceInferred:
      false,
  };
}

function cleanExtractedUrl(
  value:
    string
) {
  return decodeHtmlEntities(
    value
  )
    .replace(
      /^\*+|\*+$/g,
      ""
    )
    .replace(
      /[.,;!?]+$/,
      ""
    )
    .trim();
}

function extractUrls(
  input:
    string
) {
  const urls =
    new Set<string>();

  /*
   * Najpierw bierzemy adresy
   * z celu linku Markdown:
   *
   * [tekst](URL)
   */
  for (
    const match
    of input.matchAll(
      /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi
    )
  ) {
    const value =
      cleanExtractedUrl(
        match[1]
      );

    if (
      value
    ) {
      urls.add(
        value
      );
    }
  }

  /*
   * Potem zwykłe adresy URL.
   *
   * Celowo zatrzymujemy się przed:
   * ] ) } *
   *
   * dzięki czemu:
   *
   * [**https://...**](...)
   *
   * nie tworzy uszkodzonego URL.
   */
  for (
    const match
    of input.matchAll(
      /https?:\/\/[^\s<>"'\])}*]+/gi
    )
  ) {
    const value =
      cleanExtractedUrl(
        match[0]
      );

    if (
      value
    ) {
      urls.add(
        value
      );
    }
  }

  return [
    ...urls,
  ].filter(
    (
      value
    ) => {
      try {
        const parsed =
          new URL(
            value
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
  );
}

function extractAffiliateUrl(
  input:
    string
): AffiliateResult {
  const urls =
    extractUrls(
      input
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

  /*
   * Najwyższy priorytet:
   * SHEIN OneLink.
   */
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

  /*
   * Następnie zwykły link SHEIN.
   */
  const shein =
    urls.find(
      (
        url
      ) =>
        isSheinHostname(
          getHostname(
            url
          )
        )
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

  /*
   * Linków do obrazków Facebooka
   * nigdy nie traktujemy jako
   * link afiliacyjny.
   */
  const other =
    urls.find(
      (
        url
      ) =>
        !isFacebookAssetUrl(
          url
        )
    );

  if (
    !other
  ) {
    return {
      url:
        "",

      kind:
        "none",
    };
  }

  return {
    url:
      other,

    kind:
      "other",
  };
}

function extractSoldText(
  text:
    string
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
  input:
    string,
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
      input
    ).includes(
      "shein"
    )
  ) {
    return "shein";
  }

  if (
    /https?:\/\//i.test(
      input
    )
  ) {
    return "mixed";
  }

  return "unknown";
}

export function parseOfferText(
  input:
    string
): ParsedOffer {
  /*
   * sourceText:
   * tekst oczyszczony z Markdown,
   * linków emoji Facebooka,
   * encji HTML itd.
   */
  const sourceText =
    preprocessOfferText(
      input
    );

  const rawLines =
    sourceText
      .split(
        "\n"
      )
      .map(
        cleanLine
      )
      .filter(
        Boolean
      );

  /*
   * Linie używane do rozpoznawania
   * nazwy i typu produktu.
   *
   * Usuwamy reklamę, kupony,
   * elementy UI i same adresy URL.
   */
  const usefulLines =
    rawLines.filter(
      (
        line
      ) =>
        !isUiLine(
          line
        ) &&
        !isMarketingNoise(
          line
        ) &&
        !isUrlLine(
          line
        ) &&
        !isNoiseUrlLine(
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

  /*
   * Rozpoznawanie typu korzysta
   * z obecnego systemu kategorii.
   */
  let product =
    recognizeProductType({
      name:
        nameResult.name,

      content:
        usefulLines.join(
          "\n"
        ),
    });

  /*
   * Ochrona przed popularnym
   * false-positive:
   *
   * "body lotion"
   * nie jest kategorią Body.
   *
   * Dokładniejszy enhancer kategorii
   * w formularzu może później
   * zakwalifikować taki produkt
   * jako Uroda.
   */
  if (
    product.type ===
      "Body" &&
    /\bbody\s+(?:lotion|cream|mist|spray|oil|wash|scrub)\b/i.test(
      normalizeForMatch(
        `${nameResult.name} ${sourceText}`
      )
    )
  ) {
    product = {
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

  const category =
    product.suggestedCategory ||
    product.category;

  const categoryConfidence:
    DetectionConfidence =
    product.confidence ===
    "high"
      ? "high"
      : product.confidence ===
          "medium"
        ? "medium"
        : "none";

  const shortName =
    createShortName(
      nameResult.name,
      product.type
    );

  const priceResult =
    extractPrices(
      rawLines
    );

  /*
   * Link analizujemy na oryginalnym
   * tekście, aby nie stracić
   * miejsca docelowego linku Markdown.
   */
  const affiliate =
    extractAffiliateUrl(
      input
    );

  const soldText =
    extractSoldText(
      sourceText
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
    shortName
  ) {
    signals.push(
      "krótka nazwa"
    );
  }

  if (
    product.type
  ) {
    signals.push(
      `typ: ${product.type}`
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
    category
  ) {
    signals.push(
      `kategoria: ${category}`
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
    ignoredNoiseLines >
    0
  ) {
    signals.push(
      "oczyszczono treść promocyjną"
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
    !shortName &&
    nameResult.name
  ) {
    warnings.push(
      "Nie udało się przygotować krótkiej nazwy produktu."
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
      "Rozpoznano starą cenę. Sprawdź, czy faktycznie jest wcześniejszą ceną produktu."
    );
  }

  if (
    !category
  ) {
    warnings.push(
      "Nie udało się automatycznie dobrać kategorii."
    );
  } else if (
    categoryConfidence ===
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

      categoryConfidence,

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

    category,

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
          input,
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

      categoryConfidence,

      affiliateKind:
        affiliate.kind,

      signals: [
        ...new Set(
          signals
        ),
      ],
    },
  };
}