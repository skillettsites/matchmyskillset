import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, absoluteUrl } from "@/components/site";

/**
 * A plain Article object for a hub: headline, description, URL and the date
 * the content was last checked. No author or reviewer is claimed.
 */
export function ArticleJsonLd({
  path,
  headline,
  description,
  dateModified,
}: {
  path: string;
  headline: string;
  description: string;
  dateModified: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        dateModified,
        inLanguage: "en-GB",
        publisher: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}
