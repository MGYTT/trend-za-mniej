import "server-only";

import {
  getSiteUrl,
} from "@/lib/site";

const INDEXNOW_ENDPOINT =
  "https://api.indexnow.org/indexnow";

const KEY_PATTERN =
  /^[A-Za-z0-9-]{8,128}$/;

function getKey() {
  return (
    process.env
      .INDEXNOW_KEY
      ?.trim() ??
    ""
  );
}

function isPublicWebsite(
  value: URL
) {
  const hostname =
    value.hostname
      .toLowerCase();

  return (
    value.protocol ===
      "https:" &&
    hostname !==
      "localhost" &&
    hostname !==
      "127.0.0.1" &&
    hostname !==
      "::1"
  );
}

export function getIndexNowConfig() {
  const siteUrl =
    getSiteUrl();

  let site:
    URL | null =
    null;

  try {
    site =
      new URL(
        siteUrl
      );
  } catch {
    site =
      null;
  }

  const key =
    getKey();

  const validKey =
    KEY_PATTERN.test(
      key
    );

  const publicSite =
    Boolean(
      site &&
      isPublicWebsite(
        site
      )
    );

  return {
    key,

    siteUrl:
      site?.origin ??
      siteUrl,

    keyLocation:
      site
        ? `${site.origin}/indexnow-key.txt`
        : "",

    validKey,

    publicSite,

    configured:
      Boolean(
        validKey &&
        publicSite
      ),
  };
}

function normalizeUrls(
  values: string[],
  siteUrl: string
) {
  const base =
    new URL(
      siteUrl
    );

  const result =
    new Set<string>();

  for (
    const value
    of values
  ) {
    try {
      const url =
        new URL(
          value,
          base
        );

      if (
        url.host !==
          base.host ||
        url.protocol !==
          base.protocol
      ) {
        continue;
      }

      url.hash =
        "";

      result.add(
        url.toString()
      );
    } catch {
      // Niepoprawny URL pomijamy.
    }

    if (
      result.size >=
      10_000
    ) {
      break;
    }
  }

  return [
    ...result,
  ];
}

export type IndexNowSubmitResult = {
  success: boolean;

  accepted: boolean;

  status: number;

  count: number;

  message: string;
};

export async function submitIndexNowUrls(
  values: string[]
): Promise<IndexNowSubmitResult> {
  const config =
    getIndexNowConfig();

  if (
    !config.validKey
  ) {
    return {
      success:
        false,

      accepted:
        false,

      status:
        0,

      count:
        0,

      message:
        "Brak poprawnego klucza INDEXNOW_KEY.",
    };
  }

  if (
    !config.publicSite
  ) {
    return {
      success:
        false,

      accepted:
        false,

      status:
        0,

      count:
        0,

      message:
        "IndexNow działa dopiero na publicznym adresie HTTPS.",
    };
  }

  const urls =
    normalizeUrls(
      values,
      config.siteUrl
    );

  if (
    urls.length ===
    0
  ) {
    return {
      success:
        true,

      accepted:
        true,

      status:
        200,

      count:
        0,

      message:
        "Brak nowych adresów do wysłania.",
    };
  }

  let response:
    Response;

  try {
    response =
      await fetch(
        INDEXNOW_ENDPOINT,
        {
          method:
            "POST",

          cache:
            "no-store",

          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
          },

          body:
            JSON.stringify({
              host:
                new URL(
                  config.siteUrl
                ).host,

              key:
                config.key,

              keyLocation:
                config.keyLocation,

              urlList:
                urls,
            }),
        }
      );
  } catch (
    error
  ) {
    console.error(
      "Błąd połączenia z IndexNow:",
      error
    );

    return {
      success:
        false,

      accepted:
        false,

      status:
        0,

      count:
        urls.length,

      message:
        "Nie udało się połączyć z IndexNow.",
    };
  }

  const accepted =
    response.status ===
      200 ||
    response.status ===
      202;

  let responseText =
    "";

  try {
    responseText =
      (
        await response.text()
      ).trim();
  } catch {
    // Odpowiedź może być pusta.
  }

  if (
    accepted
  ) {
    return {
      success:
        true,

      accepted:
        true,

      status:
        response.status,

      count:
        urls.length,

      message:
        response.status ===
        202
          ? "Adresy zostały przyjęte. Trwa weryfikacja klucza IndexNow."
          : "Adresy zostały przekazane do IndexNow.",
    };
  }

  const fallbackMessage =
    response.status ===
      403
      ? "IndexNow nie potwierdził klucza witryny."
      : response.status ===
          422
        ? "IndexNow odrzucił adresy lub konfigurację hosta."
        : response.status ===
            429
          ? "IndexNow ograniczył liczbę żądań. Spróbujemy później."
          : "IndexNow odrzucił zgłoszenie.";

  return {
    success:
      false,

    accepted:
      false,

    status:
      response.status,

    count:
      urls.length,

    message:
      responseText
        ? `${fallbackMessage} (${responseText.slice(
            0,
            180
          )})`
        : fallbackMessage,
  };
}