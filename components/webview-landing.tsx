"use client";

import type { MouseEvent } from "react";
import { MAIN_SITE_URL } from "@/lib/site";

const IOS_DEVICE = /iPhone|iPad|iPod/i;
const ANDROID_DEVICE = /Android/i;

/**
 * Android intent that hands the URL over to the device browser. The
 * `browser_fallback_url` covers devices where the intent cannot be handled.
 */
const ANDROID_BROWSER_INTENT =
  "intent://yallahspa.com/#Intent;scheme=https;" +
  "action=android.intent.action.VIEW;" +
  "category=android.intent.category.BROWSABLE;" +
  `S.browser_fallback_url=${encodeURIComponent(MAIN_SITE_URL)};end`;

/**
 * Tries to escape the in-app webview and open the main site in the real
 * browser. If the escape hatch is blocked, it falls back to navigating in the
 * current webview.
 */
export default function WebViewLanding() {
  function handleOpenMainSite(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    const userAgent = navigator.userAgent;

    const fallbackToMainSite = () => {
      if (document.visibilityState === "visible") {
        window.location.replace(MAIN_SITE_URL);
      }
    };

    if (IOS_DEVICE.test(userAgent)) {
      window.location.replace(`x-safari-${MAIN_SITE_URL}`);
      window.setTimeout(fallbackToMainSite, 1200);
      return;
    }

    if (ANDROID_DEVICE.test(userAgent)) {
      const intentFrame = document.createElement("iframe");
      intentFrame.style.display = "none";
      intentFrame.src = ANDROID_BROWSER_INTENT;
      document.body.appendChild(intentFrame);

      window.setTimeout(fallbackToMainSite, 1200);
      window.setTimeout(() => intentFrame.remove(), 2500);
      return;
    }

    window.location.replace(MAIN_SITE_URL);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#06110e] px-6 text-center text-[#f7f2e7]">
      <h1 className="text-2xl font-bold">Yallah Spa</h1>

      <a
        href={MAIN_SITE_URL}
        onClick={handleOpenMainSite}
        className="rounded-full bg-[#d3af6d] px-8 py-3.5 text-base font-bold text-[#08120f] transition active:scale-[0.98]"
      >
        افتح الموقع
      </a>
    </main>
  );
}
