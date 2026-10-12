export type SeoQualitySeverity =
  | "high"
  | "medium"
  | "low";

export type SeoQualityStatus =
  | "good"
  | "warning"
  | "critical";

export type SeoQualityIssue = {
  id: string;
  severity: SeoQualitySeverity;
  title: string;
  message: string;
  recommendation: string;
};

export type SeoQualityProductInput = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  imageUrl: string;
  active: boolean;
};

export type SeoQualityAudit =
  SeoQualityProductInput & {
    score: number;
    status: SeoQualityStatus;
    issues: SeoQualityIssue[];
  };

const GENERIC_NAMES =
  new Set([
    "t shirt casualowy",
    "tshirt casualowy",
    "bluzka casualowa",
    "sukienka damska",
    "sweter damski",
    "sweter damska",
    "kurtka damska",
    "spodnie damskie",
    "jeansy damskie",
    "koszula damska",
    "bluza damska",
    "top damski",
    "top damska",
    "legginsy damskie",
    "kardigan damski",
    "buty damskie",
  ]);

const GENERIC_TOKENS =
  new Set([
    "damska",
    "damski",
    "damskie",
    "meska",
    "meski",
    "meskie",
    "casualowa",
    "casualowy",
    "casualowe",
    "modna",
    "modny",
    "modne",
    "elegancka",
    "elegancki",
    "eleganckie",
    "produkt",
    "shein",
  ]);

function normalizeText(
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

function meaningfulTokens(
  value: string
) {
  return normalizeText(
    value
  )
    .split(
      " "
    )
    .filter(
      (
        token
      ) =>
        token.length >=
          3 &&
        !GENERIC_TOKENS.has(
          token
        )
    );
}

function normalizeDescription(
  value: string
) {
  return normalizeText(
    value
  );
}

function hasValidImageUrl(
  value: string
) {
  const clean =
    value.trim();

  if (
    clean.startsWith(
      "/"
    )
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        clean
      );

    return (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    );
  } catch {
    return false;
  }
}

function hasPriceInSlug(
  slug: string
) {
  return (
    /(^|-)cena(?:-|$)/i.test(
      slug
    ) ||
    /(^|-)\d+(?:-\d+)?(?:zl|pln)(?:-|$)/i.test(
      slug
    )
  );
}

function isGenericName(
  value: string
) {
  const normalized =
    normalizeText(
      value
    );

  if (
    GENERIC_NAMES.has(
      normalized
    )
  ) {
    return true;
  }

  const tokens =
    meaningfulTokens(
      value
    );

  return (
    value.trim().length <
      28 &&
    tokens.length <=
      1
  );
}

function addIssue(
  issues: SeoQualityIssue[],
  issue: SeoQualityIssue
) {
  if (
    issues.some(
      (
        current
      ) =>
        current.id ===
        issue.id
    )
  ) {
    return;
  }

  issues.push(
    issue
  );
}

function getBaseIssues(
  product: SeoQualityProductInput
) {
  const issues:
    SeoQualityIssue[] = [];

  const name =
    product.name.trim();

  const shortName =
    product.shortName.trim();

  const description =
    product.description.trim();

  const category =
    product.category.trim();

  const slug =
    product.slug.trim();

  if (
    !name
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-name",

        severity:
          "high",

        title:
          "Brak pełnej nazwy",

        message:
          "Strona produktu nie ma pełnej nazwy, która jednoznacznie opisuje produkt.",

        recommendation:
          "Dodaj konkretną nazwę zawierającą typ produktu i cechę, która go odróżnia.",
      }
    );
  } else if (
    name.length <
    20
  ) {
    addIssue(
      issues,
      {
        id:
          "short-name",

        severity:
          "medium",

        title:
          "Pełna nazwa jest bardzo krótka",

        message:
          "Krótka nazwa może przekazywać Google i użytkownikowi za mało informacji o produkcie.",

        recommendation:
          "Rozszerz nazwę o fason, kolor, zastosowanie, materiał lub inną istotną cechę.",
      }
    );
  } else if (
    name.length >
    120
  ) {
    addIssue(
      issues,
      {
        id:
          "very-long-name",

        severity:
          "low",

        title:
          "Pełna nazwa jest bardzo długa",

        message:
          "Bardzo długa nazwa jest trudniejsza do czytania i może wyglądać jak automatycznie skopiowany tytuł sklepu.",

        recommendation:
          "Skróć nazwę do najważniejszych informacji o produkcie.",
      }
    );
  }

  if (
    !shortName
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-short-name",

        severity:
          "high",

        title:
          "Brak krótkiej nazwy",

        message:
          "Krótka nazwa jest wykorzystywana w tytule SEO i na wielu listach produktów.",

        recommendation:
          "Dodaj naturalną, konkretną krótką nazwę produktu.",
      }
    );
  } else {
    const seoTitleLength =
      `${shortName} – cena i oferta SHEIN | Trend za Mniej`.length;

    if (
      shortName.length >
      70
    ) {
      addIssue(
        issues,
        {
          id:
            "long-short-name",

          severity:
            "medium",

          title:
            "Krótka nazwa jest za długa",

          message:
            "Długa krótka nazwa rozciąga tytuł SEO oraz kafelki produktu.",

          recommendation:
            "Skróć ją do najważniejszego określenia produktu.",
        }
      );
    }

    if (
      seoTitleLength >
      70
    ) {
      addIssue(
        issues,
        {
          id:
            "long-seo-title",

          severity:
            "medium",

          title:
            "Tytuł SEO będzie bardzo długi",

          message:
            `Aktualny tytuł produktu ma około ${seoTitleLength} znaków po dodaniu nazwy serwisu.`,

          recommendation:
            "Skróć krótką nazwę tak, aby najważniejsze słowa znalazły się na początku tytułu.",
        }
      );
    }

    if (
      isGenericName(
        shortName
      )
    ) {
      addIssue(
        issues,
        {
          id:
            "generic-short-name",

          severity:
            "medium",

          title:
            "Nazwa jest zbyt ogólna",

          message:
            `„${shortName}” słabo odróżnia tę stronę od podobnych produktów.`,

          recommendation:
            "Dodaj jedną lub dwie cechy wyróżniające, np. fason, kolor, materiał albo zastosowanie.",
        }
      );
    }
  }

  if (
    !description
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-description",

        severity:
          "high",

        title:
          "Brak opisu produktu",

        message:
          "Strona bez opisu ma bardzo mało unikalnej treści do oceny przez wyszukiwarkę.",

        recommendation:
          "Dodaj własny opis produktu napisany dla użytkownika, a nie tylko skopiowany tytuł sklepu.",
      }
    );
  } else if (
    description.length <
    80
  ) {
    addIssue(
      issues,
      {
        id:
          "very-short-description",

        severity:
          "high",

        title:
          "Opis jest bardzo krótki",

        message:
          `Opis ma tylko ${description.length} znaków i może nie dawać stronie wystarczająco dużo własnej treści.`,

        recommendation:
          "Dodaj informacje o fasonie, wyglądzie, zastosowaniu i najważniejszych cechach produktu.",
      }
    );
  } else if (
    description.length <
    140
  ) {
    addIssue(
      issues,
      {
        id:
          "short-description",

        severity:
          "medium",

        title:
          "Opis można rozbudować",

        message:
          `Opis ma ${description.length} znaków. Jest poprawny, ale dość krótki jak na osobną stronę produktu.`,

        recommendation:
          "Dodaj jeszcze 1–2 naturalne zdania pomagające użytkownikowi ocenić produkt.",
      }
    );
  }

  if (
    !category
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-category",

        severity:
          "high",

        title:
          "Brak kategorii",

        message:
          "Produkt bez kategorii ma słabsze linkowanie wewnętrzne i kontekst tematyczny.",

        recommendation:
          "Przypisz właściwą kategorię produktu.",
      }
    );
  }

  if (
    !product.imageUrl.trim()
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-image",

        severity:
          "high",

        title:
          "Brak obrazu produktu",

        message:
          "Strona produktu bez obrazu traci ważny element jakości i widoczności w wynikach graficznych.",

        recommendation:
          "Dodaj reprezentatywne zdjęcie produktu.",
      }
    );
  } else if (
    !hasValidImageUrl(
      product.imageUrl
    )
  ) {
    addIssue(
      issues,
      {
        id:
          "invalid-image-url",

        severity:
          "medium",

        title:
          "Adres obrazu wygląda niepoprawnie",

        message:
          "Google może mieć problem z pobraniem obrazu produktu.",

        recommendation:
          "Sprawdź, czy obraz ma poprawny publiczny adres HTTP lub HTTPS.",
      }
    );
  }

  if (
    !slug
  ) {
    addIssue(
      issues,
      {
        id:
          "missing-slug",

        severity:
          "high",

        title:
          "Brak adresu produktu",

        message:
          "Produkt nie ma poprawnego sluga do utworzenia publicznego URL-u.",

        recommendation:
          "Wygeneruj krótki, czytelny slug na podstawie nazwy produktu.",
      }
    );
  } else {
    if (
      slug.length >
      100
    ) {
      addIssue(
        issues,
        {
          id:
            "long-slug",

          severity:
            "medium",

          title:
            "Adres produktu jest bardzo długi",

          message:
            "Bardzo długi slug jest trudniejszy do czytania i udostępniania.",

          recommendation:
            "Przy kolejnej zmianie adresu użyj krótszego sluga zawierającego najważniejsze słowa.",
        }
      );
    }

    if (
      hasPriceInSlug(
        slug
      )
    ) {
      addIssue(
        issues,
        {
          id:
            "price-in-slug",

          severity:
            "medium",

          title:
            "Cena znajduje się w adresie URL",

          message:
            "Cena może się zmienić, a slug produktu powinien pozostać stabilny przez długi czas.",

          recommendation:
            "Usuń cenę z adresu przy kontrolowanej zmianie sluga i ustaw przekierowanie ze starego URL-u.",
        }
      );
    }

    if (
      !/^[a-z0-9-]+$/.test(
        slug
      )
    ) {
      addIssue(
        issues,
        {
          id:
            "unsafe-slug",

          severity:
            "medium",

          title:
            "Slug zawiera nietypowe znaki",

          message:
            "Adres produktu powinien być prosty, czytelny i stabilny.",

          recommendation:
            "Użyj małych liter, cyfr oraz myślników.",
        }
      );
    }
  }

  return issues;
}

function scoreIssues(
  issues: SeoQualityIssue[]
) {
  const penalty =
    issues.reduce(
      (
        total,
        issue
      ) => {
        if (
          issue.severity ===
          "high"
        ) {
          return total +
            20;
        }

        if (
          issue.severity ===
          "medium"
        ) {
          return total +
            10;
        }

        return total +
          4;
      },
      0
    );

  return Math.max(
    0,
    100 -
      penalty
  );
}

function getStatus(
  score: number,
  issues: SeoQualityIssue[]
): SeoQualityStatus {
  if (
    issues.some(
      (
        issue
      ) =>
        issue.severity ===
        "high"
    ) ||
    score <
      70
  ) {
    return "critical";
  }

  if (
    issues.length >
      0 ||
    score <
      90
  ) {
    return "warning";
  }

  return "good";
}

function createCountMap(
  values: Array<{
    id: string;
    value: string;
  }>
) {
  const map =
    new Map<
      string,
      string[]
    >();

  for (
    const item
    of values
  ) {
    const key =
      normalizeText(
        item.value
      );

    if (
      !key
    ) {
      continue;
    }

    const current =
      map.get(
        key
      ) ??
      [];

    current.push(
      item.id
    );

    map.set(
      key,
      current
    );
  }

  return map;
}

export function auditSeoCatalog(
  products: SeoQualityProductInput[]
): SeoQualityAudit[] {
  const publicProducts =
    products.filter(
      (
        product
      ) =>
        product.active
    );

  const fullNameMap =
    createCountMap(
      publicProducts.map(
        (
          product
        ) => ({
          id:
            product.id,

          value:
            product.name,
        })
      )
    );

  const shortNameMap =
    createCountMap(
      publicProducts.map(
        (
          product
        ) => ({
          id:
            product.id,

          value:
            product.shortName,
        })
      )
    );

  const descriptionMap =
    createCountMap(
      publicProducts
        .filter(
          (
            product
          ) =>
            normalizeDescription(
              product.description
            ).length >=
            60
        )
        .map(
          (
            product
          ) => ({
            id:
              product.id,

            value:
              normalizeDescription(
                product.description
              ),
          })
        )
    );

  return products.map(
    (
      product
    ) => {
      const issues =
        getBaseIssues(
          product
        );

      if (
        product.active
      ) {
        const normalizedName =
          normalizeText(
            product.name
          );

        const normalizedShortName =
          normalizeText(
            product.shortName
          );

        const normalizedDescription =
          normalizeDescription(
            product.description
          );

        if (
          normalizedName &&
          (
            fullNameMap.get(
              normalizedName
            )?.length ??
            0
          ) >
            1
        ) {
          addIssue(
            issues,
            {
              id:
                "duplicate-full-name",

              severity:
                "high",

              title:
                "Pełna nazwa powtarza się w katalogu",

              message:
                "Co najmniej dwie publiczne strony produktów mają identyczną pełną nazwę.",

              recommendation:
                "Dodaj cechę wyróżniającą każdy produkt, aby strony nie wyglądały jak duplikaty.",
            }
          );
        }

        if (
          normalizedShortName &&
          (
            shortNameMap.get(
              normalizedShortName
            )?.length ??
            0
          ) >
            1
        ) {
          addIssue(
            issues,
            {
              id:
                "duplicate-short-name",

              severity:
                "medium",

              title:
                "Krótka nazwa powtarza się",

              message:
                "Kilka publicznych produktów używa tej samej krótkiej nazwy, więc ich tytuły SEO mogą być bardzo podobne.",

              recommendation:
                "Zróżnicuj krótkie nazwy najważniejszą cechą produktu.",
            }
          );
        }

        if (
          normalizedDescription.length >=
            60 &&
          (
            descriptionMap.get(
              normalizedDescription
            )?.length ??
            0
          ) >
            1
        ) {
          addIssue(
            issues,
            {
              id:
                "duplicate-description",

              severity:
                "high",

              title:
                "Opis jest identyczny jak na innej stronie",

              message:
                "Powtarzający się opis zmniejsza unikalność strony produktu.",

              recommendation:
                "Napisz własny opis odnoszący się do konkretnych cech tego produktu.",
            }
          );
        }
      }

      const score =
        scoreIssues(
          issues
        );

      return {
        ...product,

        score,

        status:
          getStatus(
            score,
            issues
          ),

        issues,
      };
    }
  );
}