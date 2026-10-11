import {
  extractSheinProductIdentity,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

const MAX_REDIRECTS = 10;
const MAX_HTML_BYTES = 800_000;
const REQUEST_TIMEOUT_MS = 12_000;

export type SheinResolveResult = {
  identity: SheinProductIdentity | null;

  method:
    | "input"
    | "redirect"
    | "html"
    | "none";
};

function isAllowedSheinUrl(
  value: URL
) {
  if (
    value.protocol !== "https:"
  ) {
    return false;
  }

  if (
    value.username ||
    value.password
  ) {
    return false;
  }

  if (
    value.port &&
    value.port !== "443"
  ) {
    return false;
  }

  const hostname =
    value.hostname
      .toLowerCase()
      .replace(/\.$/, "");

  return (
    hostname === "shein.com" ||
    hostname.endsWith(
      ".shein.com"
    )
  );
}

function parseAllowedSheinUrl(
  value: string,
  base?: URL
) {
  try {
    const url =
      base
        ? new URL(
            value,
            base
          )
        : new URL(
            value
          );

    return isAllowedSheinUrl(
      url
    )
      ? url
      : null;
  } catch {
    return null;
  }
}

function normalizeResolverText(
  value: string
) {
  let result =
    value;

  try {
    result =
      decodeURIComponent(
        result
      );
  } catch {
    // Niektóre odpowiedzi mają mieszane kodowanie.
  }

  return result
    .replace(
      /\\u002f/gi,
      "/"
    )
    .replace(
      /\\u003a/gi,
      ":"
    )
    .replace(
      /\\u0026/gi,
      "&"
    )
    .replace(
      /\\u003d/gi,
      "="
    )
    .replace(
      /\\\//g,
      "/"
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
      /&#34;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    );
}

function isCanonicalIdentity(
  identity:
    | SheinProductIdentity
    | null
) {
  return Boolean(
    identity &&
      identity.source !==
        "sku"
  );
}

function safelyExtractEmbeddedUrl(
  value: string
) {
  const match =
    value.match(
      /https?:\/\/[^\s"'<>]+/i
    );

  return match?.[0] ??
    null;
}

function extractIdentityFromAnyText(
  value: string
) {
  const normalized =
    normalizeResolverText(
      value
    );

  return (
    extractSheinProductIdentity(
      normalized
    ) ??
    extractSheinProductIdentity(
      safelyExtractEmbeddedUrl(
        normalized
      ) ??
        ""
    )
  );
}

function createTimeoutSignal(
  timeoutMs: number
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      timeoutMs
    );

  return {
    signal:
      controller.signal,

    clear() {
      clearTimeout(
        timeout
      );
    },
  };
}

async function fetchSheinUrl(
  url: URL,
  method:
    | "HEAD"
    | "GET"
) {
  const timeout =
    createTimeoutSignal(
      REQUEST_TIMEOUT_MS
    );

  try {
    return await fetch(
      url,
      {
        method,

        redirect:
          "manual",

        cache:
          "no-store",

        signal:
          timeout.signal,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/json;q=0.9,text/plain;q=0.8,*/*;q=0.7",

          "Accept-Language":
            "pl-PL,pl;q=0.9,en-US;q=0.7,en;q=0.6",
        },
      }
    );
  } finally {
    timeout.clear();
  }
}

async function readLimitedText(
  response: Response,
  maxBytes: number
) {
  if (!response.body) {
    return "";
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let total =
    0;

  let result =
    "";

  try {
    while (true) {
      const {
        done,
        value,
      } =
        await reader.read();

      if (
        done ||
        !value
      ) {
        break;
      }

      const remaining =
        maxBytes -
        total;

      if (
        remaining <=
        0
      ) {
        break;
      }

      const chunk =
        value.byteLength >
        remaining
          ? value.slice(
              0,
              remaining
            )
          : value;

      total +=
        chunk.byteLength;

      result +=
        decoder.decode(
          chunk,
          {
            stream:
              true,
          }
        );

      if (
        total >=
        maxBytes
      ) {
        break;
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Brak akcji.
    }
  }

  result +=
    decoder.decode();

  return result;
}

function extractUrlFromHtmlAttribute(
  html: string,
  pattern: RegExp
) {
  const match =
    html.match(
      pattern
    );

  if (
    !match?.[1]
  ) {
    return null;
  }

  return parseAllowedSheinUrl(
    normalizeResolverText(
      match[1]
    )
  );
}

function extractCanonicalUrl(
  html: string
) {
  return (
    extractUrlFromHtmlAttribute(
      html,
      /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i
    ) ??
    extractUrlFromHtmlAttribute(
      html,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["']/i
    )
  );
}

function extractOpenGraphUrl(
  html: string
) {
  return (
    extractUrlFromHtmlAttribute(
      html,
      /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i
    ) ??
    extractUrlFromHtmlAttribute(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i
    )
  );
}

function extractMetaRefreshTarget(
  html: string
) {
  const patterns = [
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url\s*=\s*([^"'>;\s]+)[^"']*["']/i,

    /<meta[^>]+content=["'][^"']*url\s*=\s*([^"'>;\s]+)[^"']*["'][^>]+http-equiv=["']?refresh["']?/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      html.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      return normalizeResolverText(
        match[1]
      );
    }
  }

  return null;
}

function extractScriptRedirectTargets(
  html: string
) {
  const normalized =
    normalizeResolverText(
      html
    );

  const patterns = [
    /(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/gi,

    /location\.replace\(\s*["']([^"']+)["']\s*\)/gi,

    /["'](?:redirectUrl|redirect_url|deeplink|deepLink|targetUrl|target_url|landingUrl|landing_url)["']\s*:\s*["']([^"']+)["']/gi,
  ];

  const values:
    string[] = [];

  for (
    const pattern
    of patterns
  ) {
    let match:
      RegExpExecArray |
      null;

    while (
      (
        match =
          pattern.exec(
            normalized
          )
      ) !==
      null
    ) {
      if (
        match[1]
      ) {
        values.push(
          match[1]
        );
      }

      if (
        values.length >=
        20
      ) {
        return values;
      }
    }
  }

  return values;
}

function extractProductUrlFromHtml(
  html: string
) {
  const normalized =
    normalizeResolverText(
      html
    );

  const matches =
    normalized.match(
      /https:\/\/[^\s"'<>\\]+-p-\d{5,20}(?:\.html)?[^\s"'<>\\]*/gi
    ) ??
    [];

  for (
    const raw
    of matches
  ) {
    const clean =
      raw.replace(
        /[),.;\]}]+$/,
        ""
      );

    const url =
      parseAllowedSheinUrl(
        clean
      );

    if (url) {
      return url;
    }
  }

  return null;
}

function extractProductIdentityFromJson(
  value: unknown
): SheinProductIdentity | null {
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
      "string" ||
    typeof value ===
      "number"
  ) {
    return extractIdentityFromAnyText(
      String(
        value
      )
    );
  }

  if (
    Array.isArray(
      value
    )
  ) {
    for (
      const item
      of value
    ) {
      const identity =
        extractProductIdentityFromJson(
          item
        );

      if (
        identity
      ) {
        return identity;
      }
    }

    return null;
  }

  if (
    typeof value !==
    "object"
  ) {
    return null;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  const type =
    record["@type"];

  const isProduct =
    type ===
      "Product" ||
    (
      Array.isArray(
        type
      ) &&
      type.includes(
        "Product"
      )
    );

  if (
    isProduct
  ) {
    for (
      const key
      of [
        "url",
        "productID",
        "productId",
        "goods_id",
        "goodsId",
        "sku",
      ]
    ) {
      const raw =
        record[
          key
        ];

      if (
        raw ===
          null ||
        raw ===
          undefined
      ) {
        continue;
      }

      const rawText =
        String(
          raw
        ).trim();

      if (
        (
          key ===
            "productID" ||
          key ===
            "productId" ||
          key ===
            "goods_id" ||
          key ===
            "goodsId"
        ) &&
        /^\d{5,20}$/.test(
          rawText
        )
      ) {
        return {
          key:
            `goods:${rawText}`,

          value:
            rawText,

          source:
            "goods-id",

          confidence:
            "high",
        };
      }

      const label =
        key ===
        "sku"
          ? "SKU"
          : key ===
                "productID" ||
              key ===
                "productId"
            ? "product id"
            : key;

      const identity =
        extractIdentityFromAnyText(
          `${label}: ${rawText}`
        );

      if (
        identity
      ) {
        return identity;
      }
    }
  }

  for (
    const nested
    of Object.values(
      record
    )
  ) {
    const identity =
      extractProductIdentityFromJson(
        nested
      );

    if (
      identity
    ) {
      return identity;
    }
  }

  return null;
}

function extractJsonLdIdentity(
  html: string
) {
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match:
    RegExpExecArray |
    null;

  while (
    (
      match =
        pattern.exec(
          html
        )
    ) !==
    null
  ) {
    const raw =
      match[1]
        ?.trim();

    if (!raw) {
      continue;
    }

    try {
      const parsed =
        JSON.parse(
          raw
        );

      const identity =
        extractProductIdentityFromJson(
          parsed
        );

      if (
        identity
      ) {
        return identity;
      }
    } catch {
      const identity =
        extractIdentityFromAnyText(
          raw
        );

      if (
        identity
      ) {
        return identity;
      }
    }
  }

  return null;
}

function extractTargetedGoodsIdentity(
  html: string
) {
  const normalized =
    normalizeResolverText(
      html
    );

  const contextualPatterns = [
    /(?:productIntroData|goodsInfo|productInfo)[\s\S]{0,6000}?(?:goods[_-]?id|goodsId)["']?\s*[:=]\s*["']?(\d{5,20})/i,

    /(?:goods[_-]?id|goodsId)["']?\s*[:=]\s*["']?(\d{5,20})[\s\S]{0,6000}?(?:productIntroData|goodsInfo|productInfo)/i,
  ];

  for (
    const pattern
    of contextualPatterns
  ) {
    const match =
      normalized.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      return {
        key:
          `goods:${match[1]}`,

        value:
          match[1],

        source:
          "goods-id" as const,

        confidence:
          "high" as const,
      };
    }
  }

  return null;
}

function extractIdentityFromHtml(
  html: string
) {
  const canonical =
    extractCanonicalUrl(
      html
    );

  if (
    canonical
  ) {
    const identity =
      extractSheinProductIdentity(
        canonical.toString()
      );

    if (
      isCanonicalIdentity(
        identity
      )
    ) {
      return identity;
    }
  }

  const openGraph =
    extractOpenGraphUrl(
      html
    );

  if (
    openGraph
  ) {
    const identity =
      extractSheinProductIdentity(
        openGraph.toString()
      );

    if (
      isCanonicalIdentity(
        identity
      )
    ) {
      return identity;
    }
  }

  const metaRefresh =
    extractMetaRefreshTarget(
      html
    );

  if (
    metaRefresh
  ) {
    const identity =
      extractIdentityFromAnyText(
        metaRefresh
      );

    if (
      identity
    ) {
      return identity;
    }
  }

  for (
    const target
    of extractScriptRedirectTargets(
      html
    )
  ) {
    const identity =
      extractIdentityFromAnyText(
        target
      );

    if (
      identity
    ) {
      return identity;
    }
  }

  const productUrl =
    extractProductUrlFromHtml(
      html
    );

  if (
    productUrl
  ) {
    const identity =
      extractSheinProductIdentity(
        productUrl.toString()
      );

    if (
      isCanonicalIdentity(
        identity
      )
    ) {
      return identity;
    }
  }

  const jsonLdIdentity =
    extractJsonLdIdentity(
      html
    );

  if (
    jsonLdIdentity
  ) {
    return jsonLdIdentity;
  }

  return extractTargetedGoodsIdentity(
    html
  );
}

function getRedirectIdentity(
  location: string
) {
  return extractIdentityFromAnyText(
    location
  );
}

async function requestRedirectOnly(
  currentUrl: URL
) {
  try {
    return await fetchSheinUrl(
      currentUrl,
      "HEAD"
    );
  } catch {
    return null;
  }
}

export async function resolveSheinProductIdentity({
  sourceText,
  affiliateUrl,
}: {
  sourceText: string;
  affiliateUrl: string;
}): Promise<SheinResolveResult> {
  const sourceIdentity =
    extractSheinProductIdentity(
      sourceText
    );

  const affiliateIdentity =
    extractSheinProductIdentity(
      affiliateUrl
    );

  const immediateCanonical =
    [
      sourceIdentity,
      affiliateIdentity,
    ].find(
      isCanonicalIdentity
    ) ??
    null;

  if (
    immediateCanonical
  ) {
    return {
      identity:
        immediateCanonical,

      method:
        "input",
    };
  }

  const startingUrl =
    parseAllowedSheinUrl(
      affiliateUrl.trim()
    );

  if (
    !startingUrl
  ) {
    return {
      identity:
        sourceIdentity ??
        affiliateIdentity ??
        null,

      method:
        sourceIdentity ||
        affiliateIdentity
          ? "input"
          : "none",
    };
  }

  let currentUrl =
    startingUrl;

  for (
    let index =
      0;
    index <
      MAX_REDIRECTS;
    index +=
      1
  ) {
    const currentIdentity =
      extractSheinProductIdentity(
        currentUrl.toString()
      );

    if (
      isCanonicalIdentity(
        currentIdentity
      )
    ) {
      return {
        identity:
          currentIdentity,

        method:
          index ===
          0
            ? "input"
            : "redirect",
      };
    }

    const headResponse =
      await requestRedirectOnly(
        currentUrl
      );

    if (
      headResponse &&
      headResponse.status >=
        300 &&
      headResponse.status <
        400
    ) {
      const location =
        headResponse.headers.get(
          "location"
        );

      if (
        location
      ) {
        const redirectIdentity =
          getRedirectIdentity(
            location
          );

        if (
          redirectIdentity
        ) {
          return {
            identity:
              redirectIdentity,

            method:
              "redirect",
          };
        }

        const nextUrl =
          parseAllowedSheinUrl(
            location,
            currentUrl
          );

        if (
          nextUrl
        ) {
          currentUrl =
            nextUrl;

          continue;
        }
      }
    }

    let response:
      Response;

    try {
      response =
        await fetchSheinUrl(
          currentUrl,
          "GET"
        );
    } catch (
      error
    ) {
      console.error(
        "Błąd rozwijania linku SHEIN:",
        error
      );

      break;
    }

    if (
      response.status >=
        300 &&
      response.status <
        400
    ) {
      const location =
        response.headers.get(
          "location"
        );

      if (
        !location
      ) {
        break;
      }

      const redirectIdentity =
        getRedirectIdentity(
          location
        );

      if (
        redirectIdentity
      ) {
        return {
          identity:
            redirectIdentity,

          method:
            "redirect",
        };
      }

      const nextUrl =
        parseAllowedSheinUrl(
          location,
          currentUrl
        );

      if (
        !nextUrl
      ) {
        break;
      }

      currentUrl =
        nextUrl;

      continue;
    }

    if (
      !response.ok
    ) {
      break;
    }

    const responseUrl =
      parseAllowedSheinUrl(
        response.url
      );

    if (
      responseUrl
    ) {
      const identity =
        extractSheinProductIdentity(
          responseUrl.toString()
        );

      if (
        isCanonicalIdentity(
          identity
        )
      ) {
        return {
          identity,

          method:
            "redirect",
        };
      }
    }

    const contentType =
      response.headers
        .get(
          "content-type"
        )
        ?.toLowerCase() ??
      "";

    if (
      !contentType.includes(
        "text/html"
      ) &&
      !contentType.includes(
        "application/xhtml+xml"
      ) &&
      !contentType.includes(
        "text/plain"
      ) &&
      !contentType.includes(
        "application/json"
      )
    ) {
      break;
    }

    try {
      const html =
        await readLimitedText(
          response,
          MAX_HTML_BYTES
        );

      const identity =
        extractIdentityFromHtml(
          html
        );

      if (
        identity
      ) {
        return {
          identity,

          method:
            "html",
        };
      }
    } catch (
      error
    ) {
      console.error(
        "Błąd odczytu odpowiedzi SHEIN:",
        error
      );
    }

    break;
  }

  return {
    identity:
      sourceIdentity ??
      affiliateIdentity ??
      null,

    method:
      sourceIdentity ||
      affiliateIdentity
        ? "input"
        : "none",
  };
}