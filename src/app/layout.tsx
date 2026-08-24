import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";
import JsonLd from "@/components/JsonLd";
import { getSettingsAction } from "@/lib/actions";
import { Analytics } from "@vercel/analytics/next";
import {
  DEFAULT_DESCRIPTION,
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Pakistan shipping calculator",
    "Leopard courier rates",
    "TCS rates Pakistan",
    "ecommerce Pakistan",
    "COD courier comparison",
    "DigitalDuniya",
    "Pakistan blog",
    "online business Pakistan",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = { siteLogo: "", adsenseId: "", groqKey: "", geminiKey: "", youtubeKey: "" };
  try {
    settings = await getSettingsAction();
  } catch {
    // DB may be unavailable during build or cold start
  }

  return (
    <html lang="en-PK">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} RSS Feed`}
          href={`${SITE_URL}/feed.xml`}
        />
        {settings.adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="antialiased">
        <JsonLd data={websiteJsonLd()} />
        <SiteLayout siteLogo={settings.siteLogo}>
          {children}
        </SiteLayout>
        <Analytics />
      </body>
    </html>
  );
}
