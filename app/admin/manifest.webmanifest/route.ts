export const dynamic =
  "force-static";

export function GET() {
  const manifest = {
    id:
      "/admin/",

    name:
      "Trend za Mniej Admin",

    short_name:
      "Trend Admin",

    description:
      "Panel administratora Trend za Mniej do zarządzania ofertami, Social Media Studio i statystykami.",

    start_url:
      "/admin?source=app",

    scope:
      "/admin/",

    display:
      "standalone",

    display_override: [
      "standalone",
    ],

    background_color:
      "#fafaf9",

    theme_color:
      "#fafaf9",

    orientation:
      "portrait-primary",

    categories: [
      "business",
      "productivity",
    ],

    icons: [
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

      {
        src:
          "/apple-icon",

        sizes:
          "180x180",

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
          "Przygotuj grafikę produktu do social media.",

        url:
          "/admin/social",
      },

      {
        name:
          "Statystyki",

        short_name:
          "Statystyki",

        description:
          "Otwórz statystyki administratora.",

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

        "Cache-Control":
          "public, max-age=3600",
      },
    }
  );
}