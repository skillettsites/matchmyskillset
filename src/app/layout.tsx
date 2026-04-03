import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://matchmyskillset.com"
  ),
  title: {
    default: "MatchMySkillset - Discover Careers You Never Knew Existed",
    template: "%s | MatchMySkillset",
  },
  description:
    "AI-powered career matching that finds jobs based on your actual skills, not just your job title. Discover career paths you never knew existed.",
  keywords: [
    "career change UK",
    "transferable skills finder",
    "skills based job matching",
    "career transition tool",
    "what jobs match my skills",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "MatchMySkillset",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MatchMySkillset",
              url: "https://matchmyskillset.com",
              description: "AI-powered career matching that finds jobs based on your actual skills, not just your job title.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
              creator: {
                "@type": "Organization",
                name: "MatchMySkillset",
                url: "https://matchmyskillset.com",
              },
            }),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
