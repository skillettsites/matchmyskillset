import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_LINKS, JOB_HUBS } from "@/components/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or has moved.",
  robots: { index: false, follow: true },
  // The layout's self canonical would resolve to /_not-found here.
  alternates: { canonical: null },
};

/**
 * Root 404. Next.js serves it with a 404 status for unmatched URLs and for
 * notFound() calls in statically rendered routes.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-page px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="kicker text-accent">Error 404</p>
          <h1 className="mt-3 text-h1 font-semibold text-ink">This route does not go anywhere</h1>
          <p className="mt-5 max-w-reading text-lede text-ink-2">
            The page you were looking for does not exist, or it has moved.
            These are the best places to pick up the trail.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary btn-lg">
              Go to the homepage
            </Link>
            <Link href="/discover" className="btn btn-secondary btn-lg">
              Analyse my CV
            </Link>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
          <nav aria-labelledby="nf-jobs">
            <h2 id="nf-jobs" className="kicker font-sans tracking-[0.09em]">
              Leaving your job
            </h2>
            <ul className="mt-3 border-t border-ink">
              {JOB_HUBS.map((hub) => (
                <li key={hub.href} className="border-b border-rule">
                  <Link href={hub.href} className="flex min-h-12 items-center text-lg text-ink hover:text-accent hover:underline">
                    {hub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="nf-guides">
            <h2 id="nf-guides" className="kicker font-sans tracking-[0.09em]">
              Popular guides
            </h2>
            <ul className="mt-3 border-t border-ink">
              {GUIDE_LINKS.map((link) => (
                <li key={link.href} className="border-b border-rule">
                  <Link href={link.href} className="flex min-h-12 items-center text-lg text-ink hover:text-accent hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
