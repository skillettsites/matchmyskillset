import Link from "next/link";
import type { ReactNode } from "react";

/** Props for {@link Disclosure}. */
export interface DisclosureProps {
  /** Custom wording. Defaults to the standard affiliate line. */
  children?: ReactNode;
  /** Link to a page explaining how the site is funded. */
  href?: string;
  /** Text for that link. Defaults to "How we make money". */
  linkLabel?: string;
  /** Extra classes. */
  className?: string;
}

/**
 * Affiliate disclosure line. Place it above the first affiliate link on any
 * page that has one (and mark those links `rel="sponsored"`).
 */
export function Disclosure({ children, href, linkLabel = "How we make money", className = "" }: DisclosureProps) {
  return (
    <p className={`flex gap-2 rounded-md border border-rule bg-paper-2/60 px-3 py-2.5 text-sm text-ink-2 ${className}`}>
      <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 9v5M10 6.2v.1" strokeLinecap="round" />
      </svg>
      <span>
        {children ?? (
          <>
            Some links on this page are affiliate links. If you sign up or buy
            through one, we may earn a commission at no extra cost to you.
          </>
        )}
        {href && (
          <>
            {" "}
            <Link href={href} className="link">
              {linkLabel}
            </Link>
            .
          </>
        )}
      </span>
    </p>
  );
}
