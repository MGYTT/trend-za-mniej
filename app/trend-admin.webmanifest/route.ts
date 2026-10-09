export const dynamic =
  "force-static";

export function GET() {
  const manifest = {
    id:
      "/admin",

    name:
      "Trend za Mniej Admin",

    short_name:
      "Trend Admin",

    description:
      "Mobilny panel administratora Trend za Mniej do zarządzania ofertami, Social Media Studio i statystykami.",

    lang:
      "pl-PL",

    dir:
      "ltr",

    start_url:
      "/admin?source=pwa",

    /*
     * Bez końcowego "/".
     *
     * Dzięki temu zarówno:
     * /admin
     * jak i:
     * /admin/social
     * /admin/statystyki
     * /admin/nowa-oferta
     *
     * należą do zakresu aplikacji.
     */
    scope:
      "/admin",

    display:
      "standalone",

    display_override: [
      "standalone",
    ],

    background_color:
      "#f7f7f8",

    theme_color:
      "#fafaf9",

    orientation:
      "portrait-primary",

    prefer_related_applications:
      false,

    categories: [
      "business",
      "productivity",
    ],

    icons: [
      {
        src:
          "/pwa/admin-icon-192",

        sizes:
          "192x192",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/icon",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "any",
      },
    ],

    shortcuts: [
      {
        name:
          "Dodaj ofertę",

        short_name:
          "Dodaj",

        description:
          "Dodaj nowy produkt do Trend za Mniej.",

        url:
          "/admin/nowa-oferta",
      },

      {
        name:
          "Social Media",

        short_name:
          "Social",

        description:
          "Otwórz Social Media Studio.",

        url:
          "/admin/social",
      },

      {
        name:
          "Statystyki",

        short_name:
          "Statystyki",

        description:
          "Sprawdź statystyki kliknięć.",

        url:
          "/admin/statystyki",
      },
    ],
  };

  return new Response(
    JSON.stringify(
      manifest
    ),
    {
      headers: {
        "Content-Type":
          "application/manifest+json; charset=utf-8",

        /*
         * Na etapie PWA nie chcemy,
         * żeby Android długo trzymał
         * starą, błędną wersję.
         */
        "Cache-Control":
          "no-cache, must-revalidate",
      },
    }
  );
}