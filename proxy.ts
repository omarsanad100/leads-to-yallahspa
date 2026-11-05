import { NextResponse, type NextRequest } from "next/server";
import {
  MAIN_SITE_URL,
  PREVIEW_QUERY_PARAM,
  REDIRECT_VISITORS_OUTSIDE_WEBVIEW,
} from "@/lib/site";
import { isWebView } from "@/lib/webview";

/**
 * Traffic gate for the root route.
 *
 * - In-app browser (TikTok, Instagram, Facebook...) -> show the lightweight
 *   page with the "open the main site" button.
 * - Normal browser -> redirect to the main site.
 * - `?preview=1` -> always show the lightweight page (handy for local checks).
 */
export function proxy(request: NextRequest) {
  if (!REDIRECT_VISITORS_OUTSIDE_WEBVIEW) {
    return NextResponse.next();
  }

  if (request.nextUrl.searchParams.get(PREVIEW_QUERY_PARAM) === "1") {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent");

  if (isWebView(userAgent)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(MAIN_SITE_URL, 307);
}

export const config = {
  matcher: "/",
};
