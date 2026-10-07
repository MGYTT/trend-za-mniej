import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

const siteUrl = getSiteUrl();

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const pinterestVerification =
  process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION;

export const viewport: Viewport = {
  themeColor: "#e11d48",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Trend za Mniej | Moda i okazje",
    template: "%s | Trend za Mniej",
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icon",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  authors: [
    {
      name: SITE_NAME,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  verification: {
    ...(googleVerification
      ? {
          google: googleVerification,
        }
      : {}),

    ...(pinterestVerification
      ? {
          other: {
            "p:domain_verify":
              pinterestVerification,
          },
        }
      : {}),
  },

  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: SITE_NAME,
    title: "Trend za Mniej | Moda i okazje",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Trend za Mniej - moda i okazje",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Trend za Mniej | Moda i okazje",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
