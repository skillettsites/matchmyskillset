import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/components/site";

/** One step in the trail. */
export interface BreadcrumbItem {
  /** Visible name, e.g. "Leaving your job". */
  name: string;
  /** Site path. Leave it off the last item (the current page). */
  href?: string;
}

/** Props for {@link Breadcrumbs}. */
export interface BreadcrumbsProps {
  /** Trail after "Home", ending with the current page. */
  items: BreadcrumbItem[];
  /** Prepend a "Home" link. Defaults to true. */
  includeHome?: boolean;
  /** Emit BreadcrumbList JSON-LD. Defaults to true. */
  schema?: boolean;
  /** Extra classes for the nav. */
  className?: string;
}

/**
 * Visual breadcrumb trail plus matching BreadcrumbList JSON-LD with absolute
 * URLs. The last item is marked `aria-current="page"`.
 */
export function Breadcrumbs({ items, includeHome = true, schema = true, className = "" }: BreadcrumbsProps) {
  const trail: BreadcrumbItem[] = includeHome ? [{ name: "Home", href: "/" }, ...items] : items;
  if (trail.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 text-[14px] text-mute">
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="inline-flex items-center gap-x-1.5">
              {i > 0 && (
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3 text-mute-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              )}
              {item.href && !last ? (
                <Link href={item.href} className="inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-ink hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="inline-flex min-h-11 items-center text-ink-2">
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {schema && <JsonLd data={jsonLd} />}
    </nav>
  );
}
