"use client";

import {
  useEffect,
  useRef,
} from "react";

type Props = {
  enabled: boolean;
};

const SYNC_INTERVAL =
  5 * 60 * 1000;

export default function SearchVisibilitySync({
  enabled,
}: Props) {
  const runningRef =
    useRef(
      false
    );

  useEffect(() => {
    if (
      !enabled
    ) {
      return;
    }

    async function sync() {
      if (
        runningRef.current
      ) {
        return;
      }

      runningRef.current =
        true;

      try {
        await fetch(
          "/api/admin/indexnow/process",
          {
            method:
              "POST",

            credentials:
              "same-origin",

            cache:
              "no-store",
          }
        );
      } catch {
        /*
         * Synchronizacja z wyszukiwarkami
         * nigdy nie może utrudniać
         * administratorowi pracy.
         *
         * Niewysłane URL-e pozostaną
         * w kolejce i spróbujemy później.
         */
      } finally {
        runningRef.current =
          false;
      }
    }

    function handleFocus() {
      void sync();
    }

    void sync();

    const interval =
      window.setInterval(
        () => {
          void sync();
        },
        SYNC_INTERVAL
      );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    enabled,
  ]);

  return null;
}