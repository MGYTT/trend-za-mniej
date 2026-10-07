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
  status: ProductDuplicateStatus;

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

export function createEmptyProductDuplicateCheck():
  ProductDuplicateCheck {
  return {
    status: "idle",
    identity: null,
    exactMatch: null,
    similarMatches: [],
    blockingReason: null,
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
  if (!value.trim()) {
    return null;
  }

  const text =
    safelyDecodeText(
      value
    );

  const goodsPatterns: Array<{
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
      sku.length < 5 ||
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

function normalizeComparableName(
  value: string
) {
  return value
    .toLocaleLowerCase(
      "pl"
    )
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
    .split(" ")
    .map(
      (token) =>
        token.trim()
    )
    .filter(
      (token) =>
        token.length >= 3 &&
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
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (
    const token
    of firstTokens
  ) {
    if (
      secondTokens.has(
        token
      )
    ) {
      intersection += 1;
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
        ? [normalized]
        : []
    );
  }

  const trigrams =
    new Set<string>();

  for (
    let index = 0;
    index <=
    normalized.length -
      3;
    index += 1
  ) {
    trigrams.add(
      normalized.slice(
        index,
        index + 3
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
    firstSet.size === 0 ||
    secondSet.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (
    const gram
    of firstSet
  ) {
    if (
      secondSet.has(
        gram
      )
    ) {
      intersection += 1;
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

export function findSimilarProducts({
  name,
  shortName,
  category,
  products,
  limit = 3,
}: {
  name: string;
  shortName: string;
  category: string;
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
      ): ProductDuplicateCandidate | null => {
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

        let similarity =
          Math.max(
            ...scores
          );

        const candidateCategory =
          normalizeCategory(
            product.category
          );

        if (
          normalizedCategory &&
          candidateCategory &&
          normalizedCategory !==
            candidateCategory
        ) {
          similarity *=
            0.82;
        }

        if (
          similarity <
          0.76
        ) {
          return null;
        }

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
            Number(
              product.price
            ),

          active:
            product.active,

          similarity:
            Math.round(
              similarity *
                100
            ),
        };
      }
    )
    .filter(
      (
        product
      ): product is
        ProductDuplicateCandidate =>
        product !== null
    )
    .sort(
      (a, b) =>
        b.similarity -
        a.similarity
    )
    .slice(
      0,
      limit
    );
}

export function createDuplicateCandidate(
  product:
    ComparableProduct,
  similarity = 100
): ProductDuplicateCandidate {
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
      Number(
        product.price
      ),

    active:
      product.active,

    similarity,
  };
}