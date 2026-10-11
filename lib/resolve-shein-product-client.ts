import {
  extractSheinProductIdentity,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

type ResolveResponse = {
  identity?: unknown;
  method?: unknown;
  error?: unknown;
};

function isSheinProductIdentity(
  value: unknown
): value is SheinProductIdentity {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<SheinProductIdentity>;

  return Boolean(
    typeof candidate.key ===
      "string" &&
      candidate.key.trim() &&
      typeof candidate.value ===
        "string" &&
      candidate.value.trim() &&
      (
        candidate.source ===
          "goods-id" ||
        candidate.source ===
          "product-url" ||
        candidate.source ===
          "product-id" ||
        candidate.source ===
          "sku"
      ) &&
      (
        candidate.confidence ===
          "high" ||
        candidate.confidence ===
          "medium"
      )
  );
}

export async function resolveSheinProductIdentityForAdmin({
  sourceText,
  affiliateUrl,
}: {
  sourceText: string;
  affiliateUrl: string;
}): Promise<SheinProductIdentity | null> {
  const localIdentity =
    extractSheinProductIdentity(
      `${sourceText}\n${affiliateUrl}`
    );

  const hasInput =
    Boolean(
      sourceText.trim()
    ) ||
    Boolean(
      affiliateUrl.trim()
    );

  if (
    !hasInput
  ) {
    return null;
  }

  try {
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

    if (
      !response.ok
    ) {
      return localIdentity;
    }

    const payload =
      await response.json() as
        ResolveResponse;

    if (
      isSheinProductIdentity(
        payload.identity
      )
    ) {
      return payload.identity;
    }

    return localIdentity;
  } catch (
    error
  ) {
    console.warn(
      "Nie udało się rozwinąć linku SHEIN po stronie serwera. Używam lokalnie rozpoznanej tożsamości.",
      error
    );

    return localIdentity;
  }
}