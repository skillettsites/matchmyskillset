import Link from "next/link";
import {
  EMPLOYER_LINKS,
  ENGINEERING_HUBS,
  FIT_LINKS,
  GUIDE_LINKS,
  JOBSEEKER_LINKS,
  OTHER_CAREER_HUBS,
  SITE_NAME,
  type NavItem,
} from "@/components/site";
import { LogoMark } from "@/components/ui/Logo";
import { CookieSettingsButton } from "@/components/GoogleAnalytics";

const ENGINEERING_LINKS: NavItem[] = ENGINEERING_HUBS.map((h) => ({ label: h.label, href: h.href }));

const OTHER_LINKS: NavItem[] = [
  ...OTHER_CAREER_HUBS.filter((h) => h.href !== "/careers-for").map((h) => ({ label: h.label, href: h.href })),
  { label: "All professions", href: "/careers-for" },
];

const COLS: { title: string; links: NavItem[] }[] = [
  { title: "Job seekers", links: JOBSEEKER_LINKS },
  { title: "Engineering careers", links: ENGINEERING_LINKS },
  { title: "Other careers", links: OTHER_LINKS },
  { title: "Guides", links: [...GUIDE_LINKS, ...FIT_LINKS] },
  { title: "Employers", links: EMPLOYER_LINKS },
];

const LEGAL: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Site footer: job seeker links, engineering careers, other careers, guides, employer links and the legal line. */
export function Footer() {
  return (
    <footer className="bg-cloud text-[12px] leading-[1.35] text-mute">
      <div className="mx-auto max-w-[1128px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b hairline py-12 md:grid-cols-5 lg:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))] lg:gap-7">
          <div className="col-span-2 md:col-span-5 lg:col-span-1">
            <Link href="/" aria-label={`${SITE_NAME}, home`} className="inline-flex min-h-11 items-center gap-2.5 text-ink">
              <LogoMark size={24} />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">{SITE_NAME}</span>
            </Link>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-mute">
              Upload your CV and see live UK jobs scored against your skills, with a focus on engineering, manufacturing and Industry 4.0.
              Hiring? Post a job and meet candidates matched to it.
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-mute">
              A joint venture with Flintstone Associates, our recruitment partner.{" "}
              <Link href="/about" className="underline underline-offset-2 hover:text-ink">
                About us
              </Link>
            </p>
            <Link href="/discover" className="btn btn-primary btn-sm mt-5">
              Upload your CV
            </Link>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[12px] font-semibold tracking-normal text-ink">{col.title}</h2>
              <ul className="mt-2 md:mt-3 md:space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center text-[13px] text-mute transition-colors hover:text-ink hover:underline md:min-h-0 md:py-0.5"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {SITE_NAME}. Made in the UK.
          </p>
          <ul className="flex flex-wrap items-center gap-x-1">
            {LEGAL.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i > 0 && (
                  <span className="mx-2 text-line" aria-hidden="true">
                    |
                  </span>
                )}
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-ink hover:underline sm:min-h-0">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center">
              <span className="mx-2 text-line" aria-hidden="true">
                |
              </span>
              <CookieSettingsButton className="inline-flex min-h-11 items-center hover:text-ink hover:underline sm:min-h-0" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
