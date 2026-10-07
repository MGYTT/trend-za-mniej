import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trend za Mniej | Moda i okazje",
    short_name: "Trend za Mniej",
    description:
      "Modne ubrania, dodatki, promocje i najlepsze okazje w jednym miejscu.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#e11d48",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
