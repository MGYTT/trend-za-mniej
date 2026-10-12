export type ProductSlugReservation = {
  slug: string;
  productId: string;

  kind:
    | "current"
    | "redirect";
};

export type ProductSlugIssue = {
  type:
    | "error"
    | "warning";

  message: string;
};

const RECOMMENDED_MAX_LENGTH =
  72;

const HARD_MAX_LENGTH =
  90;

const VOLATILE_WORDS =
  new Set([
    "cena",
    "promocja",
    "promocyjny",
    "promocyjna",
    "promocyjne",
    "rabat",
    "wyprzedaz",
    "okazja",
    "kod",
    "kupon",
  ]);

function normalizeAscii(
  value: string
) {
  return value
    .toLowerCase()
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
    );
}

function extractSlugSource(
  value: string
) {
  const clean =
    value.trim();

  if (!clean) {
    return "";
  }

  try {
    if (
      clean.startsWith(
        "http://"
      ) ||
      clean.startsWith(
        "https://"
      )
    ) {
      const url =
        new URL(
          clean
        );

      const parts =
        url.pathname
          .split(
            "/"
          )
          .filter(
            Boolean
          );

      const productIndex =
        parts.lastIndexOf(
          "produkt"
        );

      if (
        productIndex >=
          0 &&
        parts[
          productIndex +
            1
        ]
      ) {
        return decodeURIComponent(
          parts[
            productIndex +
              1
          ]
        );
      }

      return decodeURIComponent(
        parts[
          parts.length -
            1
        ] ??
          ""
      );
    }
  } catch {
    // Traktujemy wartość jak zwykły slug.
  }

  const productMarker =
    "/produkt/";

  const markerIndex =
    clean.lastIndexOf(
      productMarker
    );

  if (
    markerIndex >=
    0
  ) {
    return clean
      .slice(
        markerIndex +
          productMarker.length
      )
      .split(
        /[?#]/
      )[0];
  }

  return clean.replace(
    /^\/?produkt\//i,
    ""
  );
}

export function sanitizeProductSlug(
  value: string
) {
  return normalizeAscii(
    extractSlugSource(
      value
    )
  )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .replace(
      /-{2,}/g,
      "-"
    );
}

function removeVolatileText(
  value: string
) {
  let clean =
    normalizeAscii(
      value
    );

  clean =
    clean.replace(
      /\b(?:cena|za|od|tylko)?\s*\d+(?:[.,]\d{1,2})?\s*(?:zl|pln)\b/gi,
      " "
    );

  clean =
    clean.replace(
      /-?\d+(?:[.,]\d+)?\s*%/g,
      " "
    );

  clean =
    clean.replace(
      /\b\d+(?:[.,]\d+)?\s*procent\b/g,
      " "
    );

  clean =
    clean.replace(
      /\b(?:cena|promocja|promocyjny|promocyjna|promocyjne|rabat|wyprzedaz|okazja|kod|kupon|bestseller|hit|viral|nowosc|shein)\b/g,
      " "
    );

  return clean
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function trimSlug(
  slug: string,
  maxLength =
    RECOMMENDED_MAX_LENGTH
) {
  if (
    slug.length <=
    maxLength
  ) {
    return slug;
  }

  const shortened =
    slug.slice(
      0,
      maxLength
    );

  const lastDash =
    shortened.lastIndexOf(
      "-"
    );

  if (
    lastDash >=
    Math.floor(
      maxLength *
        0.65
    )
  ) {
    return shortened
      .slice(
        0,
        lastDash
      )
      .replace(
        /-+$/g,
        ""
      );
  }

  return shortened.replace(
    /-+$/g,
    ""
  );
}

function countSlugWords(
  slug: string
) {
  return slug
    .split(
      "-"
    )
    .filter(
      Boolean
    ).length;
}

export function buildSuggestedProductSlug({
  shortName,
  name,
  category,
}: {
  shortName: string;
  name: string;
  category: string;
}) {
  const shortCandidate =
    sanitizeProductSlug(
      removeVolatileText(
        shortName
      )
    );

  const nameCandidate =
    sanitizeProductSlug(
      removeVolatileText(
        name
      )
    );

  const categoryCandidate =
    sanitizeProductSlug(
      removeVolatileText(
        category
      )
    );

  let candidate =
    shortCandidate;

  if (
    !candidate ||
    countSlugWords(
      candidate
    ) <
      2
  ) {
    if (
      nameCandidate &&
      countSlugWords(
        nameCandidate
      ) >
        countSlugWords(
          candidate
        )
    ) {
      candidate =
        nameCandidate;
    }
  }

  if (
    !candidate
  ) {
    candidate =
      categoryCandidate ||
      "produkt";
  }

  return trimSlug(
    candidate
  );
}

export function hasPriceInProductSlug(
  slug: string
) {
  return /(^|-)(?:cena-)?\d+(?:-\d{1,2})?-?(?:zl|pln)(-|$)/i.test(
    slug
  );
}

function hasVolatileWord(
  slug: string
) {
  return slug
    .split(
      "-"
    )
    .some(
      (
        token
      ) =>
        VOLATILE_WORDS.has(
          token
        )
    );
}

export function getProductSlugIssues(
  value: string
): ProductSlugIssue[] {
  const slug =
    value.trim();

  const issues:
    ProductSlugIssue[] =
    [];

  if (!slug) {
    issues.push({
      type:
        "error",

      message:
        "Adres produktu nie może być pusty.",
    });

    return issues;
  }

  if (
    slug.length <
    3
  ) {
    issues.push({
      type:
        "error",

      message:
        "Adres produktu jest zbyt krótki.",
    });
  }

  if (
    slug.length >
    HARD_MAX_LENGTH
  ) {
    issues.push({
      type:
        "error",

      message:
        `Adres może mieć maksymalnie ${HARD_MAX_LENGTH} znaków.`,
    });
  } else if (
    slug.length >
    RECOMMENDED_MAX_LENGTH
  ) {
    issues.push({
      type:
        "warning",

      message:
        `Adres jest dość długi. Najlepiej zmieścić się w około ${RECOMMENDED_MAX_LENGTH} znakach.`,
    });
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug
    )
  ) {
    issues.push({
      type:
        "error",

      message:
        "Adres może zawierać tylko małe litery bez polskich znaków, cyfry i myślniki.",
    });
  }

  if (
    hasPriceInProductSlug(
      slug
    )
  ) {
    issues.push({
      type:
        "error",

      message:
        "Usuń cenę z adresu. Cena może się zmienić, a URL powinien pozostać stały.",
    });
  }

  if (
    hasVolatileWord(
      slug
    )
  ) {
    issues.push({
      type:
        "error",

      message:
        "Usuń z adresu określenia promocyjne, takie jak cena, promocja, rabat, wyprzedaż, okazja, kod lub kupon.",
    });
  }

  if (
    countSlugWords(
      slug
    ) <
      2
  ) {
    issues.push({
      type:
        "warning",

      message:
        "Adres jest bardzo ogólny. Jeśli możesz, dodaj cechę odróżniającą produkt.",
    });
  }

  return issues;
}

export function isProductSlugAvailable({
  slug,
  productId,
  reservations,
}: {
  slug: string;
  productId: string;

  reservations:
    ProductSlugReservation[];
}) {
  const normalized =
    sanitizeProductSlug(
      slug
    );

  if (!normalized) {
    return false;
  }

  return !reservations.some(
    (
      reservation
    ) =>
      reservation.slug ===
        normalized &&
      reservation.productId !==
        productId
  );
}

export function findAvailableProductSlug({
  baseSlug,
  productId,
  reservations,
}: {
  baseSlug: string;
  productId: string;

  reservations:
    ProductSlugReservation[];
}) {
  const normalizedBase =
    trimSlug(
      sanitizeProductSlug(
        baseSlug
      )
    );

  if (
    !normalizedBase
  ) {
    return "";
  }

  if (
    isProductSlugAvailable({
      slug:
        normalizedBase,

      productId,

      reservations,
    })
  ) {
    return normalizedBase;
  }

  for (
    let counter = 2;
    counter <= 999;
    counter += 1
  ) {
    const suffix =
      `-${counter}`;

    const candidate =
      `${trimSlug(
        normalizedBase,
        RECOMMENDED_MAX_LENGTH -
          suffix.length
      )}${suffix}`;

    if (
      isProductSlugAvailable({
        slug:
          candidate,

        productId,

        reservations,
      })
    ) {
      return candidate;
    }
  }

  return normalizedBase;
}