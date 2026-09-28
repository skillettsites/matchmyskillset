import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_LINKS, JOB_HUBS } from "@/components/site";
import { HeroGlow } from "@/components/marketing";
import { ChevronRight } from "@/components/marketing/Icons";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or has moved.",
  // Next.js adds its own robots "noindex" tag to 404 responses; a second tag here would duplicate it.
  robots: null,
  // The layout's self canonical would resolve to /_not-found here.
  alternates: { canonical: null },
};

function LinkColumn({ id, title, links }: { id: string; title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-labelledby={id} className="tile p-6 text-left sm:p-7">
      <h2 id={id} className="kicker">
        {title}
      </h2>
      <ul className="mt-2 divide-y divide-black/[0.06]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group flex min-h-12 items-center justify-between gap-3 text-[17px] text-ink">
              <span className="group-hover:underline group-hover:underline-offset-4">{l.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Root 404. Next.js serves it with a 404 status for unmatched URLs and for
 * notFound() calls in statically rendered routes.
 */
export default function NotFound() {
  return (
    <div className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 md:pt-24">
      <HeroGlow top="-30%" opacity={0.16} />
      <div className="relative mx-auto max-w-[760px] text-center">
        <p className="text-[15px] font-semibold text-mute">Error 404</p>
        <h1 className="display mt-2">This page is not here.</h1>
        <p className="lede mx-auto mt-5 max-w-[540px]">It may have moved, or the link may be wrong. These are good places to pick up from.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/discover" className="btn btn-primary btn-lg">
            Upload your CV
          </Link>
          <Link href="/" className="btn btn-secondary btn-lg">
            Go to the homepage
          </Link>
        </div>
      </div>
      <div className="relative mx-auto mt-16 grid max-w-[880px] gap-4 md:grid-cols-2">
        <LinkColumn id="nf-jobs" title="Leaving your job" links={JOB_HUBS} />
        <LinkColumn id="nf-guides" title="Popular guides" links={GUIDE_LINKS} />
      </div>
    </div>
  );
}
