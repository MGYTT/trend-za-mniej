import type {
  Metadata,
  Viewport,
} from "next";

import {
  Analytics,
} from "@vercel/analytics/next";

import "./globals.css";

import {
  getSiteUrl,
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/site";

const siteUrl =
  getSiteUrl();

const googleVerification =
  process.env
    .NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const pinterestVerification =
  process.env
    .NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION;

const contactEmail =
  process.env
    .NEXT_PUBLIC_CONTACT_EMAIL
    ?.trim();

export const viewport: Viewport = {
  themeColor: "#e11d48",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase:
    new URL(siteUrl),

  title: {
    default:
      SITE_DEFAULT_TITLE,

    template:
      "%s | Trend za Mniej",
  },

  description:
    SITE_DESCRIPTION,

  applicationName:
    SITE_NAME,

  manifest:
    "/manifest.webmanifest",

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
      name:
        SITE_NAME,
    },
  ],

  creator:
    SITE_NAME,

  publisher:
    SITE_NAME,

  alternates: {
    canonical: "/",
  },

  verification: {
    ...(googleVerification
      ? {
          google:
            googleVerification,
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

    locale:
      SITE_LANGUAGE,

    url: "/",

    siteName:
      SITE_NAME,

    title:
      SITE_DEFAULT_TITLE,

    description:
      SITE_DESCRIPTION,

    images: [
      {
        url:
          "/opengraph-image",

        width:
          1200,

        height:
          630,

        alt:
          "Trend za Mniej - moda damska, ubrania i okazje",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      SITE_DEFAULT_TITLE,

    description:
      SITE_DESCRIPTION,

    images: [
      "/opengraph-image",
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  category:
    "fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "Organization",

        "@id":
          `${siteUrl}/#organization`,

        name:
          SITE_NAME,

        alternateName:
          "Trend za Mniej | Moda i okazje",

        url:
          siteUrl,

        description:
          SITE_DESCRIPTION,

        logo: {
          "@type":
            "ImageObject",

          url:
            `${siteUrl}/icon`,

          contentUrl:
            `${siteUrl}/icon`,

          width:
            512,

          height:
            512,
        },

        ...(contactEmail
          ? {
              email:
                contactEmail,

              contactPoint: {
                "@type":
                  "ContactPoint",

                contactType:
                  "general inquiries",

                email:
                  contactEmail,

                availableLanguage: [
                  "pl",
                ],
              },
            }
          : {}),
      },

      {
        "@type":
          "WebSite",

        "@id":
          `${siteUrl}/#website`,

        url:
          siteUrl,

        name:
          SITE_NAME,

        alternateName:
          "Trend za Mniej | Moda i okazje",

        description:
          SITE_DESCRIPTION,

        inLanguage:
          SITE_LANGUAGE,

        publisher: {
          "@id":
            `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="pl">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />

        {children}

        <Analytics />
      </body>
    </html>
  );
}