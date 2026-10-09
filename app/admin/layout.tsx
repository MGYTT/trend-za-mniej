import type {
  Metadata,
  Viewport,
} from "next";

import AdminAppShell from "@/components/admin/AdminAppShell";
import AdminPresenceHeartbeat from "@/components/admin/AdminPresenceHeartbeat";
import SearchVisibilitySync from "@/components/admin/SearchVisibilitySync";

import {
  getIndexNowConfig,
} from "@/lib/indexnow";

export const metadata: Metadata = {
  title: {
    default:
      "Trend Admin",

    template:
      "%s | Trend Admin",
  },

  description:
    "Mobilny panel administratora Trend za Mniej.",

  /*
   * Manifest jest publiczny.
   *
   * Nie może być za autoryzacją,
   * ponieważ Android / Chromium
   * musi móc pobrać go niezależnie
   * podczas procesu instalacji.
   */
  manifest:
    "/trend-admin.webmanifest",

  appleWebApp: {
    capable:
      true,

    title:
      "Trend Admin",

    statusBarStyle:
      "default",
  },

  icons: {
    icon: [
      {
        url:
          "/icon",

        type:
          "image/png",

        sizes:
          "512x512",
      },
    ],

    apple: [
      {
        url:
          "/apple-icon",

        type:
          "image/png",

        sizes:
          "180x180",
      },
    ],
  },

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,
  },
};

export const viewport: Viewport = {
  themeColor:
    "#fafaf9",

  colorScheme:
    "light",

  viewportFit:
    "cover",
};

export default function AdminLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const indexNow =
    getIndexNowConfig();

  return (
    <AdminAppShell>
      <AdminPresenceHeartbeat />

      <SearchVisibilitySync
        enabled={
          indexNow.configured
        }
      />

      {children}
    </AdminAppShell>
  );
}