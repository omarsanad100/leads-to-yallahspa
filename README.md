# Yallah Spa — lightweight webview landing

A tiny Next.js page that only in-app browsers see (TikTok, Instagram, Facebook,
…). It gives them one clear button that opens the main site in the phone's real
browser, because the heavy main site does not load inside TikTok's webview.

## How it works

1. A request hits `/`.
2. `proxy.ts` reads the `User-Agent`:
   - **In-app browser / webview** → render the lightweight page.
   - **Normal browser** → `307` redirect to <https://yallahspa.com/>.
3. The button in the page tries to leave the webview:
   - iOS → `x-safari-https://…` (Safari)
   - Android → an `intent://` that hands the URL to the browser
   - If the escape hatch is blocked, it falls back to normal navigation.
4. A small hint tells the user how to use “Open in browser” from TikTok's menu.

The route is fully static (no images, no external fonts), so it loads fast even
on a weak connection.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000/?preview=1> to preview the page in a desktop
browser (the `preview=1` flag bypasses the redirect).

To test the real redirect, open <http://localhost:3000/> in a normal browser —
you will be sent to the main site.

To simulate TikTok without a phone:

```bash
curl -i -A "TikTok/35.1.0" http://localhost:3000/
curl -i http://localhost:3000/          # normal UA -> 307
```

## Configuration

All destination/behaviour settings live in `lib/site.ts`:

| Setting                             | Meaning                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `MAIN_SITE_URL`                     | Where the button and the non-webview redirect point.        |
| `REDIRECT_VISITORS_OUTSIDE_WEBVIEW` | Set to `false` to show the lightweight page to everyone.     |
| `PREVIEW_QUERY_PARAM`               | Query flag used to preview the page (`?preview=1`).          |

Webview detection lives in `lib/webview.ts`; add or remove User-Agent patterns
there if a new app needs to be covered.

## Files

```
app/page.tsx                 lightweight page shell
app/layout.tsx               RTL Arabic layout + metadata
app/globals.css              theme, system fonts, animation
components/webview-landing.tsx  UI + smart "open in browser" button
lib/site.ts                  destination + behaviour config
lib/webview.ts               User-Agent webview detection
proxy.ts                     the route condition (webview vs. browser)
```

## Build

```bash
npm run build
npm run start
```
