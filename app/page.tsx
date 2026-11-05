import WebViewLanding from "@/components/webview-landing";

/**
 * The routing decision (webview vs. normal browser) happens in `proxy.ts`.
 * This page is a static, lightweight shell with the call-to-action button.
 */
export default function Page() {
  return <WebViewLanding />;
}
