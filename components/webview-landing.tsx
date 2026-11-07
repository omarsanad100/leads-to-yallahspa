"use client";

import { useRef, useState, type MouseEvent } from "react";
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
 * iOS hand-off attempts, tried in order:
 *
 * 1. `x-safari-` -> Safari (the default browser on most iPhones).
 * 2. `googlechromes://` -> Chrome, only opens when Chrome is installed.
 *
 * Both are best effort: in-app browsers such as TikTok's WKWebView are allowed
 * to block these navigations, and Apple offers no documented way for a web page
 * to open Safari. When every attempt is blocked the page falls back to a short
 * instruction sheet with a "copy the link" button.
 */
const IOS_ESCAPE_SCHEMES = [
  `x-safari-${MAIN_SITE_URL}`,
  `googlechromes://${MAIN_SITE_URL.replace(/^https?:\/\//i, "")}`,
];

const IOS_ATTEMPT_DELAY = 700;

export default function WebViewLanding() {
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);
  const attemptId = useRef(0);

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
      attemptIosEscape();
      return;
    }

    if (ANDROID_DEVICE.test(userAgent)) {
      openAndroidIntent();
      return;
    }

    window.location.replace(MAIN_SITE_URL);
  }

  /**
   * Walks through the iOS escape schemes. A successful hand-off hides the page,
   * so a still-visible page means the in-app browser blocked the attempt.
   */
  function attemptIosEscape() {
    const attempt = ++attemptId.current;

    setCopied(false);
    setShowIosHelp(false);
    setOpening(true);

    let index = 0;

    const tryNext = () => {
      if (attempt !== attemptId.current) return;

      if (document.visibilityState !== "visible") {
        setOpening(false);
        return;
      }

      if (index >= IOS_ESCAPE_SCHEMES.length) {
        setOpening(false);
        setShowIosHelp(true);
        return;
      }

      try {
        window.location.href = IOS_ESCAPE_SCHEMES[index++];
      } catch {
        // Some webviews throw on unsupported schemes; move on to the next one.
      }

      window.setTimeout(tryNext, IOS_ATTEMPT_DELAY);
    };

    tryNext();
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(MAIN_SITE_URL);
      setCopied(true);
      return;
    } catch {
      // Clipboard API is frequently blocked inside in-app webviews.
    }

    const field = document.createElement("textarea");
    field.value = MAIN_SITE_URL;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);

    try {
      field.select();
      field.setSelectionRange(0, MAIN_SITE_URL.length);
      setCopied(document.execCommand("copy"));
    } catch {
      setCopied(false);
    } finally {
      field.remove();
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#06110e] px-6 text-center text-[#f7f2e7]">
      <h1 className="text-2xl font-bold">Yallah Spa</h1>

      <a
        href={MAIN_SITE_URL}
        onClick={handleOpenMainSite}
        aria-busy={opening}
        className="rounded-full bg-[#d3af6d] px-8 py-3.5 text-base font-bold text-[#08120f] transition active:scale-[0.98]"
      >
        {opening ? "جارٍ الفتح…" : "افتح الموقع"}
      </a>

      {showIosHelp && (
        <div
          role="presentation"
          onClick={() => setShowIosHelp(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-help-title"
            dir="rtl"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#0d1b17] p-5 text-right text-[#f7f2e7] shadow-xl"
          >
            <h2 id="ios-help-title" className="text-lg font-bold">
              افتح الموقع في المتصفح
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/70">
              هذا المتصفح داخل التطبيق يمنع الفتح التلقائي. اضغط على زر{" "}
              <span className="font-bold text-white">⋯</span> أو زر المشاركة في
              أعلى الشاشة، ثم اختر{" "}
              <span className="font-bold text-white">«فتح في المتصفح»</span>.
            </p>

            <p className="mt-3 text-sm leading-6 text-white/70">
              أو انسخ الرابط التالي وافتحه في متصفح هاتفك:
            </p>

            <div
              dir="ltr"
              className="mt-2 select-all break-all rounded-xl bg-black/30 px-3 py-2 text-left text-xs text-white/80"
            >
              {MAIN_SITE_URL}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-full bg-[#d3af6d] px-4 py-3 text-sm font-bold text-[#08120f] transition active:scale-[0.98]"
              >
                {copied ? "تم النسخ ✓" : "نسخ الرابط"}
              </button>

              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                className="rounded-full border border-white/20 px-4 py-3 text-sm font-bold text-white/80 transition active:scale-[0.98]"
              >
                إغلاق
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.location.replace(MAIN_SITE_URL)}
              className="mt-3 w-full text-center text-xs font-bold text-white/50 underline underline-offset-4"
            >
              المتابعة داخل هذا المتصفح
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
