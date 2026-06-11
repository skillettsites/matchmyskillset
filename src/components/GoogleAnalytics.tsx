import Script from "next/script";

export function GoogleAnalytics() {
  // Env values in this stack can carry a trailing literal "\n", which would
  // corrupt the inline script and the gtag URL. Strip it.
  const gaId = (process.env.NEXT_PUBLIC_GA_ID || "").replace(/\\n$/, "").trim();
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
