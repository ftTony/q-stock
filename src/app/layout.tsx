import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import {
  gaMeasurementId,
  googleSiteVerification,
} from "@/lib/seo/analytics";
import { siteOrigin } from "@/lib/seo/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteVerification = googleSiteVerification();

/** Locale-agnostic shell metadata; copy is filled in `[locale]/layout`. */
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(siteVerification
    ? { verification: { google: siteVerification } }
    : {}),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/logo.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/logo.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      { url: "/logo.png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
    { media: "(prefers-color-scheme: light)", color: "#0b1220" },
  ],
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const gaId = gaMeasurementId();

  return (
    <html
      lang={locale}
      className="dark"
      data-change="cn"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {gaId ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={gaId} />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
