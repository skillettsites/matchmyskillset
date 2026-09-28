import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/components/site";

/** Page-width wrapper used by every guide. */
export function GuideShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-page px-4 pb-24 sm:px-6 ${className}`}>{children}</div>;
}

/** A titled section inside a guide, with a bold display H2 and an anchor id. */
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
    <section id={id} aria-labelledby={`${id}-title`} className={`mt-20 scroll-mt-24 [&>h2+.prose-mms]:mt-5 ${className}`}>
      <h2 id={`${id}-title`} className="max-w-[26ch] text-h2 font-bold text-ink">
        {title}
      </h2>
      {intro && <div className="mt-5 max-w-reading space-y-4 text-lg leading-relaxed text-ink-2">{intro}</div>}
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
    <nav aria-label="On this page" className="mt-10 max-w-reading rounded-[22px] bg-cloud p-5 sm:p-6">
      <p className="kicker">On this page</p>
      <ol className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="inline-flex min-h-11 items-center text-[15px] text-ink-2 underline-offset-4 hover:text-link hover:underline">
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
    <nav aria-label={title} className="mt-16 max-w-reading">
      <h2 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">{title}</h2>
      <ul className="mt-5 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="group flex min-h-14 items-center justify-between gap-4 py-3 text-ink">
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">{link.label}</span>
                {link.note && <span className="block text-[14px] text-mute">{link.note}</span>}
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
