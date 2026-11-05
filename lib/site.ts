/**
 * Central place for the destination we send traffic to.
 * Change it here and the proxy + the button stay in sync.
 */
export const MAIN_SITE_URL = "https://yallahspa.com/";

/**
 * When `true`:
 * - visitors inside an in-app browser (TikTok, Instagram, Facebook...) see the
 *   lightweight page with the button.
 * - everyone else (normal browsers) is redirected straight to the main site.
 *
 * Set to `false` if you ever want the lightweight page to be visible to
 * everyone.
 */
export const REDIRECT_VISITORS_OUTSIDE_WEBVIEW = true;

/**
 * Appending `?preview=1` to the URL bypasses the redirect so you can preview
 * the lightweight page on a desktop browser.
 */
export const PREVIEW_QUERY_PARAM = "preview";
