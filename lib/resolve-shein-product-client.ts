import {
  extractSheinProductIdentity,
  type SheinProductIdentity,
} from "@/lib/product-duplicate";

export async function resolveSheinProductIdentityForAdmin({
  sourceText,
  affiliateUrl,
}: {
  sourceText: string;
  affiliateUrl: string;
}): Promise<
  SheinProductIdentity | null
> {
  /*
   * Ochrona duplikatów działa
   * wyłącznie na danych dostarczonych
   * przez administratora.
   *
   * Nie pobieramy strony SHEIN,
   * nie rozwijamy automatycznie
   * OneLinków i nie wykonujemy
   * żadnych requestów do SHEIN.
   *
   * Możemy rozpoznać:
   * - ID produktu z wklejonego tekstu,
   * - ID produktu z bezpośredniego URL,
   * - SKU z wklejonych danych.
   */

  const sourceIdentity =
    extractSheinProductIdentity(
      sourceText
    );

  if (sourceIdentity) {
    return sourceIdentity;
  }

  const affiliateIdentity =
    extractSheinProductIdentity(
      affiliateUrl
    );

  if (affiliateIdentity) {
    return affiliateIdentity;
  }

  return null;
}