import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/components/site";

// Headings: a warm, characterful serif. The optical-size axis gives the
// display cut at large sizes and the text cut at small ones.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

// UI and body: a humanist sans with tabular figures for salary columns.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: the UK guide for people leaving a job`,
    template: "%s | MatchMySkillset",
  },
  description: `${SITE_TAGLINE} Start from the job you do now, or paste your CV for a free analysis with no account.`,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
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
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: {
      "msvalidate.01": "8467B89365C947F24710AB7D84B06F92",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  colorScheme: "light",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/logo.png"),
    width: 512,
    height: 512,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-GB",
  description: SITE_TAGLINE,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <GoogleAnalytics />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
