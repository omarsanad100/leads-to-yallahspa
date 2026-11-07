"use client";

import type { MouseEvent } from "react";
import { MAIN_SITE_URL } from "@/lib/site";

const IOS_DEVICE = /iPhone|iPad|iPod/i;
const ANDROID_DEVICE = /Android/i;

/**
 * Android intent that hands the URL over to the device browser. The
 * `browser_fallback_url` covers devices where the intent cannot be handled.
 */
function buildAndroidBrowserIntent(url: string) {
  const { protocol, host, pathname, search } = new URL(url);
  const path = `${host}${pathname}${search}`;

  return (
    `intent://${path}#Intent;scheme=${protocol.replace(":", "")};` +
    "action=android.intent.action.VIEW;" +
    "category=android.intent.category.BROWSABLE;" +
    `S.browser_fallback_url=${encodeURIComponent(url)};end`
  );
}

const ANDROID_BROWSER_INTENT = buildAndroidBrowserIntent(MAIN_SITE_URL);

/**
 * iOS browser hand-off attempts, tried in order:
 *
 * 1. `googlechromes://` -> Google Chrome (https).
 * 2. `googlechrome://` -> Google Chrome (http variant).
 * 3. `x-safari-` -> Safari.
 * 4. `google://` -> the Google app (last resort; it has no documented scheme
 *    for opening an arbitrary URL, so it only launches the app itself).
 *
 * No prompt and no in-webview fallback: the goal is to get the visitor into a
 * real browser. In-app browsers such as TikTok's WKWebView may block all of
 * them, in which case nothing happens and the visitor stays on this page.
 */
const IOS_ESCAPE_SCHEMES = [
  `googlechromes://${MAIN_SITE_URL.replace(/^https?:\/\//i, "")}`,
  `googlechrome://${MAIN_SITE_URL.replace(/^https?:\/\//i, "")}`,
  `x-safari-${MAIN_SITE_URL}`,
  "google://",
];

const IOS_ATTEMPT_DELAY = 700;

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

    if (IOS_DEVICE.test(userAgent)) {
      tryIosSchemes(0);
      return;
    }

    if (ANDROID_DEVICE.test(userAgent)) {
      openAndroidIntent();
      return;
    }

    window.location.replace(MAIN_SITE_URL);
  }

  /**
   * Tries the iOS browser schemes one after another. A successful hand-off
   * hides the page, so a still-visible page means the attempt was blocked.
   */
  function tryIosSchemes(index: number) {
    if (document.visibilityState !== "visible") {
      return;
    }

    if (index >= IOS_ESCAPE_SCHEMES.length) {
      return;
    }

    try {
      window.location.assign(IOS_ESCAPE_SCHEMES[index]);
    } catch {
      // Some webviews throw on unsupported schemes; move on to the next one.
    }

    window.setTimeout(() => tryIosSchemes(index + 1), IOS_ATTEMPT_DELAY);
  }

  function openAndroidIntent() {
    const intentFrame = document.createElement("iframe");
    intentFrame.style.display = "none";
    intentFrame.src = ANDROID_BROWSER_INTENT;
    document.body.appendChild(intentFrame);

    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.replace(MAIN_SITE_URL);
      }
    }, 1200);

    window.setTimeout(() => intentFrame.remove(), 2500);
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
