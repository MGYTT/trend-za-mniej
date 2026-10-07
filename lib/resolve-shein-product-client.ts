import {
  extractSheinProductIdentity,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

type ResolveResponse = {
  identity?:
    | SheinProductIdentity
    | null;

  method?:
    | "input"
    | "redirect"
    | "html"
    | "none";

  error?: string;
};

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

export async function resolveSheinProductIdentityForAdmin({
  sourceText,
  affiliateUrl,
}: {
  sourceText: string;
  affiliateUrl: string;
}) {
  /*
   * Najpierw unikamy niepotrzebnego
   * requestu do serwera, jeżeli
   * pewne ID jest już widoczne
   * lokalnie.
   */

  const affiliateIdentity =
    extractSheinProductIdentity(
      affiliateUrl
    );

  if (
    isCanonicalIdentity(
      affiliateIdentity
    )
  ) {
    return affiliateIdentity;
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
    return sourceIdentity;
  }

  if (
    !affiliateUrl.trim()
  ) {
    return (
      sourceIdentity ??
      affiliateIdentity ??
      null
    );
  }

  const response =
    await fetch(
      "/api/admin/shein-product/resolve",
      {
        method:
          "POST",

        credentials:
          "same-origin",

        cache:
          "no-store",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            sourceText,
            affiliateUrl,
          }),
      }
    );

  let data:
    ResolveResponse = {};

  try {
    data =
      await response.json() as
        ResolveResponse;
  } catch {
    // Obsłużymy niżej.
  }

  if (!response.ok) {
    throw new Error(
      data.error ??
        "Nie udało się rozpoznać produktu SHEIN."
    );
  }

  return (
    data.identity ??
    sourceIdentity ??
    affiliateIdentity ??
    null
  );
}