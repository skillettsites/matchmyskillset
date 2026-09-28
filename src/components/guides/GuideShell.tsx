import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/components/site";

/** Page-width wrapper used by every guide. */
export function GuideShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-page px-4 pb-16 sm:px-6 ${className}`}>{children}</div>;
}

/** A titled section inside a guide, with a serif H2 and an anchor id. */
export function GuideSection({
  id,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`mt-14 scroll-mt-24 ${className}`}>
      <h2 id={`${id}-title`} className="max-w-reading font-serif text-h2 font-semibold text-ink">
        {title}
      </h2>
      {intro && <div className="mt-4 max-w-reading text-lg text-ink-2">{intro}</div>}
      {children}
    </section>
  );
}

export interface ArticleJsonLdProps {
  /** Site path of the page. */
  path: string;
  /** Headline, normally the H1 text. */
  headline: string;
  description: string;
  /** ISO date the content was last changed. */
  dateModified: string;
}

/**
 * Article structured data. The author and publisher are the site itself
 * (the Organization from the root layout): no invented people.
 */
export function ArticleJsonLd({ path, headline, description, dateModified }: ArticleJsonLdProps) {
  const org = { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL };
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        inLanguage: "en-GB",
        dateModified,
        author: org,
        publisher: org,
      }}
    />
  );
}

/** "On this page" list of anchor links for long guides. */
export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="mt-10 max-w-reading rounded-lg border border-rule bg-surface p-5">
      <p className="kicker">On this page</p>
      <ol className="mt-3 grid gap-1 sm:grid-cols-2 sm:gap-x-6">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:text-accent hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A plain list of related internal links at the foot of a guide. */
export function RelatedLinks({ title = "Related guides", links }: { title?: string; links: { href: string; label: string; note?: string }[] }) {
  return (
    <nav aria-label={title} className="mt-14 max-w-reading">
      <h2 className="font-serif text-h3 font-semibold text-ink">{title}</h2>
      <ul className="mt-3 border-t border-ink">
        {links.map((link) => (
          <li key={link.href} className="border-b border-rule">
            <Link href={link.href} className="flex min-h-12 flex-col justify-center py-2 text-lg text-ink hover:text-accent">
              <span className="underline-offset-4 hover:underline">{link.label}</span>
              {link.note && <span className="text-sm text-muted">{link.note}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
