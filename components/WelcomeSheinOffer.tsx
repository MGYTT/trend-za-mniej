"use client";

import { useEffect, useState } from "react";
import WelcomeSheinOfferCard from "@/components/WelcomeSheinOfferCard";
import type { WelcomeSheinSettings } from "@/lib/welcome-shein-settings";

/** Legacy visit key is retained so existing visitors don't get the same popup twice. */
const LEGACY_VISIT_KEY = "trendzamniej:shein-welcome-sbnsl5d:v1";
let shownInThisTab = false;

export default function WelcomeSheinOffer({ settings }: { settings: WelcomeSheinSettings }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const VISIT_KEY = settings.campaignVersion === 1 ? LEGACY_VISIT_KEY
    : "trendzamniej:shein-welcome:v" + settings.campaignVersion;
  const SHOW_AFTER_MS = settings.delaySeconds * 1000;

  useEffect(() => {
    if (!settings.enabled || shownInThisTab) return;
    try {
      if (window.localStorage.getItem(VISIT_KEY)) return;
    } catch {
      // Blocked browser storage: fall back to the current tab only.
    }
    const timer = window.setTimeout(() => {
      if (shownInThisTab) return;
      try {
        if (window.localStorage.getItem(VISIT_KEY)) return;
        window.localStorage.setItem(VISIT_KEY, "seen");
      } catch {
        // No identifiers or server-side tracking.
      }
      shownInThisTab = true;
      setOpen(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [settings.enabled, VISIT_KEY, SHOW_AFTER_MS]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(settings.campaignCode);
      setCopied(true);
      return;
    } catch {
      // Clipboard API can be blocked in older browsers.
    }
    const input = document.createElement("textarea");
    input.value = settings.campaignCode;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand("copy");
    input.remove();
    setCopied(success);
  }

  if (!open) return null;
  return (
    <aside role="dialog" aria-modal="false" aria-labelledby="welcome-shein-title"
      aria-describedby="welcome-shein-description"
      className="fixed left-1/2 top-1/2 z-[80] w-[min(92vw,450px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[30px] max-h-[min(80dvh,680px)] motion-safe:animate-[welcomeFadeIn_400ms_ease-out] sm:w-[450px]">
      <WelcomeSheinOfferCard settings={settings} copied={copied}
        onCopy={() => void copyCode()} onClose={() => setOpen(false)} />
    </aside>
  );
}
