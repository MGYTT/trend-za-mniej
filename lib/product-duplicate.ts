export type SheinIdentitySource =
  | "goods-id"
  | "product-url"
  | "product-id"
  | "sku";

export type SheinProductIdentity = {
  key: string;
  value: string;
  source: SheinIdentitySource;

  confidence:
    | "high"
    | "medium";
};

export type ComparableProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  imageUrl: string;
  affiliateUrl: string;

  sheinProductKey:
    | string
    | null;

  price:
    | number
    | string;

  active: boolean;
};

export type ProductDuplicateCandidate = {
  id: string;
  slug: string;
  shortName: string;
  category: string;
  imageUrl: string;
  price: number;
  active: boolean;
  similarity: number;

  signals?: string[];
};

export type DuplicateBlockReason =
  | "shein-key"
  | "affiliate-url";

export type ProductDuplicateStatus =
  | "idle"
  | "checking"
  | "clear"
  | "warning"
  | "blocked"
  | "error";

export type ProductDuplicateCheck = {
  status:
    ProductDuplicateStatus;

  identity:
    | SheinProductIdentity
    | null;

  exactMatch:
    | ProductDuplicateCandidate
    | null;

  similarMatches:
    ProductDuplicateCandidate[];

  blockingReason:
    | DuplicateBlockReason
    | null;
};

const NAME_STOP_WORDS =
  new Set([
    "shein",
    "ezwear",
    "essnce",
    "lune",
    "bae",
    "vcay",
    "mod",
    "clasi",
    "prive",
    "motf",
    "dazy",
    "sxy",
    "petite",
    "curve",
    "tall",
    "young",
    "dla",
    "oraz",
    "and",
    "with",
    "women",
    "woman",
    "womens",
    "kobiet",
    "kobiety",
  ]);

const AFFILIATE_TRACKING_PARAMS =
  new Set([
    "ismg_ol",
    "aff_id",
    "affid",
    "affiliate_id",
    "affiliateid",
    "aff_trace_key",
    "affiliate",
    "affiliate_code",
    "source",
    "sourceid",
    "src_identifier",
    "src_module",
    "src_tab_page_id",
    "ref",
    "referrer",
    "referral",
    "mallcode",
    "mall_code",
    "url_from",
    "campaign",
    "campaign_id",
    "share_from",
    "share_type",
  ]);

export function createEmptyProductDuplicateCheck():
  ProductDuplicateCheck {
  return {
    status:
      "idle",

    identity:
      null,

    exactMatch:
      null,

    similarMatches:
      [],

    blockingReason:
      null,
  };
}

function safelyDecodeText(
  value: string
) {
  try {
    return decodeURIComponent(
      value
    );
  } catch {
    return value;
  }
}

function cleanSku(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]/g,
      ""
    );
}

export function extractSheinProductIdentity(
  value: string
):
  | SheinProductIdentity
  | null {
  if (
    !value.trim()
  ) {
    return null;
  }

  const text =
    safelyDecodeText(
      value
    );

  const goodsPatterns:
    Array<{
      pattern: RegExp;

      source:
        SheinIdentitySource;
    }> = [
      {
        pattern:
          /(?:goods[_-]?id|goodsid)\s*["']?\s*[:=]\s*["']?(\d{5,20})/i,

        source:
          "goods-id",
      },

      {
        pattern:
          /-p-(\d{5,20})(?:\.html)?(?=$|[/?#&\s])/i,

        source:
          "product-url",
      },

      {
        pattern:
          /(?:id\s+produktu|product\s+id|item\s+id)\s*[:#=\-–—]?\s*(\d{5,20})/i,

        source:
          "product-id",
      },
    ];

  for (
    const {
      pattern,
      source,
    } of goodsPatterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      const id =
        match[1];

      return {
        key:
          `goods:${id}`,

        value:
          id,

        source,

        confidence:
          "high",
      };
    }
  }

  const skuPatterns = [
    /\bSKU\s*[:#=\-–—]?\s*([a-z0-9][a-z0-9_-]{4,39})/i,

    /kod\s+produktu\s*[:#=\-–—]?\s*([a-z0-9][a-z0-9_-]{4,39})/i,

    /product\s+sku\s*[:#=\-–—]?\s*([a-z0-9][a-z0-9_-]{4,39})/i,
  ];

  for (
    const pattern
    of skuPatterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      !match?.[1]
    ) {
      continue;
    }

    const sku =
      cleanSku(
        match[1]
      );

    if (
      sku.length <
        5 ||
      !/\d/.test(
        sku
      )
    ) {
      continue;
    }

    return {
      key:
        `sku:${sku}`,

      value:
        sku,

      source:
        "sku",

      confidence:
        "high",
    };
  }

  return null;
}

export function getSheinIdentityLabel(
  identity:
    SheinProductIdentity
) {
  if (
    identity.source ===
    "sku"
  ) {
    return `SKU: ${identity.value.toUpperCase()}`;
  }

  return `ID SHEIN: ${identity.value}`;
}

function isTrackingParameter(
  key: string
) {
  const normalized =
    key
      .trim()
      .toLowerCase();

  return (
    AFFILIATE_TRACKING_PARAMS.has(
      normalized
    ) ||
    normalized.startsWith(
      "utm_"
    )
  );
}

function normalizeAffiliateUrl(
  value: string
) {
  const clean =
    value.trim();

  if (
    !clean
  ) {
    return null;
  }

  try {
    const url =
      new URL(
        clean
      );

    if (
      url.protocol !==
        "https:" &&
      url.protocol !==
        "http:"
    ) {
      return null;
    }

    url.protocol =
      "https:";

    url.hostname =
      url.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );

    url.hash =
      "";

    const keys =
      Array.from(
        url.searchParams.keys()
      );

    for (
      const key
      of keys
    ) {
      if (
        isTrackingParameter(
          key
        )
      ) {
        url.searchParams.delete(
          key
        );
      }
    }

    const remainingParams =
      Array.from(
        url.searchParams.entries()
      ).sort(
        (
          [firstKey, firstValue],
          [secondKey, secondValue]
        ) => {
          const keyComparison =
            firstKey.localeCompare(
              secondKey
            );

          if (
            keyComparison !==
            0
          ) {
            return keyComparison;
          }

          return firstValue.localeCompare(
            secondValue
          );
        }
      );

    url.search =
      "";

    for (
      const [
        key,
        parameterValue,
      ] of remainingParams
    ) {
      url.searchParams.append(
        key,
        parameterValue
      );
    }

    if (
      url.pathname.length >
        1
    ) {
      url.pathname =
        url.pathname.replace(
          /\/+$/,
          ""
        );
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function areAffiliateUrlsEquivalent(
  first: string,
  second: string
) {
  const firstNormalized =
    normalizeAffiliateUrl(
      first
    );

  const secondNormalized =
    normalizeAffiliateUrl(
      second
    );

  if (
    !firstNormalized ||
    !secondNormalized
  ) {
    return false;
  }

  return (
    firstNormalized ===
    secondNormalized
  );
}

function normalizeComparableName(
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
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getMeaningfulTokens(
  value: string
) {
  return normalizeComparableName(
    value
  )
    .split(
      " "
    )
    .map(
      (
        token
      ) =>
        token.trim()
    )
    .filter(
      (
        token
      ) =>
        token.length >=
          3 &&
        !NAME_STOP_WORDS.has(
          token
        )
    );
}

function tokenDiceSimilarity(
  first: string,
  second: string
) {
  const firstTokens =
    new Set(
      getMeaningfulTokens(
        first
      )
    );

  const secondTokens =
    new Set(
      getMeaningfulTokens(
        second
      )
    );

  if (
    firstTokens.size ===
      0 ||
    secondTokens.size ===
      0
  ) {
    return 0;
  }

  let intersection =
    0;

  for (
    const token
    of firstTokens
  ) {
    if (
      secondTokens.has(
        token
      )
    ) {
      intersection +=
        1;
    }
  }

  return (
    (
      2 *
      intersection
    ) /
    (
      firstTokens.size +
      secondTokens.size
    )
  );
}

function createTrigrams(
  value: string
) {
  const normalized =
    normalizeComparableName(
      value
    ).replace(
      /\s+/g,
      ""
    );

  if (
    normalized.length <
    3
  ) {
    return new Set(
      normalized
        ? [
            normalized,
          ]
        : []
    );
  }

  const trigrams =
    new Set<string>();

  for (
    let index =
      0;
    index <=
      normalized.length -
        3;
    index +=
      1
  ) {
    trigrams.add(
      normalized.slice(
        index,
        index +
          3
      )
    );
  }

  return trigrams;
}

function trigramDiceSimilarity(
  first: string,
  second: string
) {
  const firstSet =
    createTrigrams(
      first
    );

  const secondSet =
    createTrigrams(
      second
    );

  if (
    firstSet.size ===
      0 ||
    secondSet.size ===
      0
  ) {
    return 0;
  }

  let intersection =
    0;

  for (
    const gram
    of firstSet
  ) {
    if (
      secondSet.has(
        gram
      )
    ) {
      intersection +=
        1;
    }
  }

  return (
    (
      2 *
      intersection
    ) /
    (
      firstSet.size +
      secondSet.size
    )
  );
}

export function calculateProductNameSimilarity(
  first: string,
  second: string
) {
  const firstNormalized =
    normalizeComparableName(
      first
    );

  const secondNormalized =
    normalizeComparableName(
      second
    );

  if (
    !firstNormalized ||
    !secondNormalized
  ) {
    return 0;
  }

  if (
    firstNormalized ===
    secondNormalized
  ) {
    return 1;
  }

  const tokenScore =
    tokenDiceSimilarity(
      first,
      second
    );

  const trigramScore =
    trigramDiceSimilarity(
      first,
      second
    );

  return (
    tokenScore *
      0.72 +
    trigramScore *
      0.28
  );
}

function normalizeCategory(
  value: string
) {
  return normalizeComparableName(
    value
  );
}

function parseComparablePrice(
  value:
    | number
    | string
    | null
    | undefined
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return null;
  }

  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value
    ) &&
      value >
        0
      ? value
      : null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s/g,
        ""
      )
      .replace(
        ",",
        "."
      )
      .replace(
        /[^0-9.-]/g,
        ""
      );

  if (
    !normalized
  ) {
    return null;
  }

  const parsed =
    Number(
      normalized
    );

  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <=
      0
  ) {
    return null;
  }

  return parsed;
}

function calculatePriceDifferenceRatio(
  first:
    | number
    | string
    | null
    | undefined,

  second:
    | number
    | string
    | null
    | undefined
) {
  const firstPrice =
    parseComparablePrice(
      first
    );

  const secondPrice =
    parseComparablePrice(
      second
    );

  if (
    firstPrice ===
      null ||
    secondPrice ===
      null
  ) {
    return null;
  }

  const denominator =
    Math.max(
      firstPrice,
      secondPrice
    );

  if (
    denominator <=
    0
  ) {
    return null;
  }

  return (
    Math.abs(
      firstPrice -
        secondPrice
    ) /
    denominator
  );
}

function buildSimilaritySignals({
  nameSimilarity,
  categoryMatch,
  categoryMismatch,
  priceDifference,
}: {
  nameSimilarity:
    number;

  categoryMatch:
    boolean;

  categoryMismatch:
    boolean;

  priceDifference:
    number |
    null;
}) {
  const signals:
    string[] = [];

  if (
    nameSimilarity >=
    0.95
  ) {
    signals.push(
      "niemal identyczna nazwa"
    );
  } else if (
    nameSimilarity >=
    0.86
  ) {
    signals.push(
      "bardzo podobna nazwa"
    );
  } else if (
    nameSimilarity >=
    0.76
  ) {
    signals.push(
      "podobna nazwa"
    );
  }

  if (
    categoryMatch
  ) {
    signals.push(
      "ta sama kategoria"
    );
  }

  if (
    categoryMismatch
  ) {
    signals.push(
      "inna kategoria"
    );
  }

  if (
    priceDifference !==
    null
  ) {
    if (
      priceDifference <=
      0.03
    ) {
      signals.push(
        "niemal identyczna cena"
      );
    } else if (
      priceDifference <=
      0.08
    ) {
      signals.push(
        "bardzo zbliżona cena"
      );
    } else if (
      priceDifference <=
      0.15
    ) {
      signals.push(
        "zbliżona cena"
      );
    }
  }

  return signals;
}

export function findSimilarProducts({
  name,
  shortName,
  category,
  price,
  products,
  limit = 3,
}: {
  name: string;
  shortName: string;
  category: string;

  price?:
    | number
    | string
    | null;

  products:
    ComparableProduct[];

  limit?: number;
}) {
  const normalizedCategory =
    normalizeCategory(
      category
    );

  return products
    .map(
      (
        product
      ):
        | ProductDuplicateCandidate
        | null => {
        const scores = [
          calculateProductNameSimilarity(
            name,
            product.name
          ),

          calculateProductNameSimilarity(
            name,
            product.shortName
          ),

          calculateProductNameSimilarity(
            shortName,
            product.name
          ),

          calculateProductNameSimilarity(
            shortName,
            product.shortName
          ),
        ];

        const nameSimilarity =
          Math.max(
            ...scores
          );

        const candidateCategory =
          normalizeCategory(
            product.category
          );

        const categoryMatch =
          Boolean(
            normalizedCategory &&
            candidateCategory &&
            normalizedCategory ===
              candidateCategory
          );

        const categoryMismatch =
          Boolean(
            normalizedCategory &&
            candidateCategory &&
            normalizedCategory !==
              candidateCategory
          );

        const priceDifference =
          calculatePriceDifferenceRatio(
            price,
            product.price
          );

        let similarity =
          nameSimilarity;

        /*
         * Kategoria jest sygnałem pomocniczym.
         *
         * Ta sama kategoria lekko wzmacnia wynik,
         * a inna kategoria go obniża.
         */
        if (
          categoryMatch
        ) {
          similarity =
            Math.min(
              1,
              similarity +
                0.03
            );
        } else if (
          categoryMismatch
        ) {
          similarity *=
            0.82;
        }

        /*
         * Cena nigdy nie jest dowodem duplikatu.
         *
         * Może tylko nieznacznie podnieść wynik,
         * jeśli nazwa już jest podobna.
         */
        if (
          priceDifference !==
            null &&
          nameSimilarity >=
            0.68
        ) {
          if (
            priceDifference <=
            0.03
          ) {
            similarity =
              Math.min(
                1,
                similarity +
                  0.02
              );
          } else if (
            priceDifference <=
            0.08
          ) {
            similarity =
              Math.min(
                1,
                similarity +
                  0.01
              );
          }
        }

        /*
         * Sam produkt o podobnej cenie i kategorii
         * nie może trafić do wyników bez
         * wystarczającego podobieństwa nazwy.
         */
        if (
          nameSimilarity <
            0.70 ||
          similarity <
            0.76
        ) {
          return null;
        }

        const signals =
          buildSimilaritySignals({
            nameSimilarity,
            categoryMatch,
            categoryMismatch,
            priceDifference,
          });

        const numericPrice =
          parseComparablePrice(
            product.price
          );

        return {
          id:
            product.id,

          slug:
            product.slug,

          shortName:
            product.shortName,

          category:
            product.category,

          imageUrl:
            product.imageUrl,

          price:
            numericPrice ??
            0,

          active:
            product.active,

          similarity:
            Math.round(
              similarity *
                100
            ),

          signals,
        };
      }
    )
    .filter(
      (
        product
      ): product is
        ProductDuplicateCandidate =>
        product !==
        null
    )
    .sort(
      (
        first,
        second
      ) =>
        second.similarity -
        first.similarity
    )
    .slice(
      0,
      limit
    );
}

export function createDuplicateCandidate(
  product:
    ComparableProduct,

  similarity =
    100,

  signals:
    string[] = []
): ProductDuplicateCandidate {
  const price =
    parseComparablePrice(
      product.price
    );

  return {
    id:
      product.id,

    slug:
      product.slug,

    shortName:
      product.shortName,

    category:
      product.category,

    imageUrl:
      product.imageUrl,

    price:
      price ??
      0,

    active:
      product.active,

    similarity,

    signals,
  };
}