import {
  extractSheinProductIdentity,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

const MAX_REDIRECTS = 8;
const MAX_HTML_BYTES = 600_000;
const REQUEST_TIMEOUT_MS = 10_000;

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
    value.protocol !==
    "https:"
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
  return value
    .replace(
      /\\u002f/gi,
      "/"
    )
    .replace(
      /\\u003a/gi,
      ":"
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
  url: URL
) {
  const timeout =
    createTimeoutSignal(
      REQUEST_TIMEOUT_MS
    );

  try {
    return await fetch(
      url,
      {
        method:
          "GET",

        redirect:
          "manual",

        cache:
          "no-store",

        signal:
          timeout.signal,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TrendZaMniej/1.0)",

          Accept:
            "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",

          "Accept-Language":
            "pl-PL,pl;q=0.9,en;q=0.7",
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

  let total = 0;
  let result = "";

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
        remaining <= 0
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
            stream: true,
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
      // Nic nie robimy.
    }
  }

  result +=
    decoder.decode();

  return result;
}

function isCanonicalIdentity(
  identity:
    SheinProductIdentity | null
) {
  return Boolean(
    identity &&
      identity.source !==
        "sku"
  );
}

function extractUrlFromHtmlAttribute(
  html: string,
  pattern: RegExp
) {
  const match =
    html.match(
      pattern
    );

  if (!match?.[1]) {
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
    ) ?? [];

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

function extractIdentityFromHtml(
  html: string
) {
  const canonical =
    extractCanonicalUrl(
      html
    );

  if (canonical) {
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

  if (openGraph) {
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

  const productUrl =
    extractProductUrlFromHtml(
      html
    );

  if (productUrl) {
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

  return null;
}

export async function resolveSheinProductIdentity({
  sourceText,
  affiliateUrl,
}: {
  sourceText: string;
  affiliateUrl: string;
}): Promise<SheinResolveResult> {
  const affiliateIdentity =
    extractSheinProductIdentity(
      affiliateUrl
    );

  if (
    isCanonicalIdentity(
      affiliateIdentity
    )
  ) {
    return {
      identity:
        affiliateIdentity,

      method:
        "input",
    };
  }

  const sourceIdentity =
    extractSheinProductIdentity(
      sourceText
    );

  if (
    isCanonicalIdentity(
      sourceIdentity
    )
  ) {
    return {
      identity:
        sourceIdentity,

      method:
        "input",
    };
  }

  const startingUrl =
    parseAllowedSheinUrl(
      affiliateUrl.trim()
    );

  if (!startingUrl) {
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
    let index = 0;
    index <
    MAX_REDIRECTS;
    index += 1
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
          index === 0
            ? "input"
            : "redirect",
      };
    }

    let response:
      Response;

    try {
      response =
        await fetchSheinUrl(
          currentUrl
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

      if (!location) {
        break;
      }

      const nextUrl =
        parseAllowedSheinUrl(
          location,
          currentUrl
        );

      if (!nextUrl) {
        break;
      }

      const identity =
        extractSheinProductIdentity(
          nextUrl.toString()
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

      if (identity) {
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