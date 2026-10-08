"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

function getTrackedPath(
  pathname: string
) {
  if (
    pathname.startsWith(
      "/admin/nowa-oferta"
    )
  ) {
    return "/admin/nowa-oferta";
  }

  if (
    pathname.startsWith(
      "/admin/statystyki"
    )
  ) {
    return "/admin/statystyki";
  }

  if (
    pathname.startsWith(
      "/admin/zespol"
    )
  ) {
    return "/admin/zespol";
  }

  if (
    pathname.startsWith(
      "/admin/widocznosc"
    )
  ) {
    return "/admin/widocznosc";
  }

  if (
    pathname.startsWith(
      "/admin/edytuj"
    )
  ) {
    return "/admin/edytuj";
  }

  return "/admin";
}

export default function AdminPresenceHeartbeat() {
  const pathname =
    usePathname();

  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );

  useEffect(() => {
    let disposed =
      false;

    const trackedPath =
      getTrackedPath(
        pathname
      );

    async function touch() {
      if (
        disposed ||
        document.visibilityState !==
          "visible"
      ) {
        return;
      }

      const {
        error,
      } =
        await supabase.rpc(
          "touch_admin_presence",
          {
            p_path:
              trackedPath,
          }
        );

      if (
        error &&
        !disposed
      ) {
        console.error(
          "Nie udało się zaktualizować aktywności administratora:",
          error
        );
      }
    }

    void touch();

    const interval =
      window.setInterval(
        () => {
          void touch();
        },
        45_000
      );

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void touch();
      }
    }

    function handleFocus() {
      void touch();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      disposed =
        true;

      window.clearInterval(
        interval
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    pathname,
    supabase,
  ]);

  return null;
}