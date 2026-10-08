import type {
  Metadata,
} from "next";

import SearchVisibilitySync from "@/components/admin/SearchVisibilitySync";

import {
  getIndexNowConfig,
} from "@/lib/indexnow";

export const metadata: Metadata = {
  title:
    "Panel administratora",

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,
  },
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
    <>
      <SearchVisibilitySync
        enabled={
          indexNow.configured
        }
      />

      {children}
    </>
  );
}