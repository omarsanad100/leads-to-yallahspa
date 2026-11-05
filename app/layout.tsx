import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Spa",
  description: "افتح موقع Yalla Spa في المتصفح الأساسي.",
  applicationName: "Yalla Spa",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#06110e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
