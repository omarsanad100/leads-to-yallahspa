/**
 * In-app browser (webview) detection based on the User-Agent string.
 *
 * Server-side on purpose: the decision happens in `proxy.ts` before the page is
 * rendered, so there is no flash of the wrong page and no client-side JS needed
 * for the routing decision.
 */

const IN_APP_BROWSER_PATTERNS: RegExp[] = [
  // TikTok / ByteDance
  /TikTok/i,
  /musical_ly/i,
  /BytedanceWebview/i,
  /zhiliaoapp/i,
  /com\.ss\.android\.ugc\.trill/i,
  /trill_/i,
  // Meta
  /Instagram/i,
  /FBAN|FBAV|FB_IAB|FBIOS|FB4A/i,
  /Messenger/i,
  // Other social / messaging apps
  /Snapchat/i,
  /Twitter/i,
  /LinkedInApp/i,
  /Pinterest/i,
  /Reddit/i,
  /Telegram/i,
  /MicroMessenger/i,
  /Line\//i,
  // Google app, Android system webview, legacy Android webviews
  /GSA\//i,
  /; wv\)/i,
  /Version\/4\.0.*Chrome/i,
];

const IOS_DEVICE = /iPhone|iPad|iPod/i;
const IOS_REAL_BROWSER = /Safari|CriOS|FxiOS|EdgiOS|OPiOS/i;

export function isWebView(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;

  if (IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return true;
  }

  // On iOS every in-app browser is a WKWebView without the Safari suffix,
  // while real browsers (Safari, Chrome, Firefox, Edge, Opera) keep it.
  if (IOS_DEVICE.test(userAgent) && !IOS_REAL_BROWSER.test(userAgent)) {
    return true;
  }

  return false;
}
