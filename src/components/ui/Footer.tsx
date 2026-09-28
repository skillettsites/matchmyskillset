import Link from "next/link";
import {
  COMPANY_LINKS,
  FIT_LINKS,
  GUIDE_LINKS,
  JOB_HUBS,
  SITE_NAME,
  TOOL_LINKS,
  type NavItem,
} from "@/components/site";
import { Logo } from "@/components/ui/Logo";
import { CookieSettingsButton } from "@/components/GoogleAnalytics";

function FooterColumn({ title, links }: { title: string; links: NavItem[] }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-bold uppercase tracking-[0.09em] text-night-muted">
        {title}
      </h2>
      <ul className="mt-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center py-1 text-[0.9375rem] leading-snug text-night-text underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Site footer: hub links, guides, tools and the legal pages. Server component. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-night text-night-text">
      <div className="mx-auto max-w-page px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <Link href="/" aria-label={`${SITE_NAME} home`} className="inline-flex min-h-11 items-center focus-visible:outline-highlight">
              <Logo tone="dark" />
            </Link>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-night-muted">
              The UK guide for people leaving a job: where people like you go
              next, what it pays, and how to get there.
            </p>
          </div>
          <FooterColumn title="Leaving your job" links={JOB_HUBS} />
          <FooterColumn title="Guides" links={GUIDE_LINKS} />
          <FooterColumn title="Finding the right fit" links={FIT_LINKS} />
          <FooterColumn title="Tools" links={TOOL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {SITE_NAME}
          </p>
          <ul className="flex flex-wrap gap-x-6">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-night-text underline-offset-4 hover:underline focus-visible:outline-highlight"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton className="inline-flex min-h-11 items-center text-night-text underline-offset-4 hover:underline focus-visible:outline-highlight" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
