import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { JsonLd } from "@/components/JsonLd";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { GuideSection, GuideShell } from "@/components/guides/GuideShell";
import { ASHE_BULLETIN_URL, ASHE_PUBLISHED, UK_FT_MEDIAN } from "@/components/guides/pay";
import { JOB_HUBS, SITE_NAME, SITE_URL, absoluteUrl } from "@/components/site";

const PATH = "/career-change";
const TITLE = "Career change guides for the UK, with real pay data";
const DESCRIPTION =
  "Free UK guides to changing career: how to switch, CVs, starting with no experience and skills-based hiring, plus ONS pay for the jobs you could move to.";
const H1 = "Changing career in the UK";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION, ogType: "website" });

interface GuideLink {
  href: string;
  label: string;
  note?: string;
  external?: boolean;
}

const PLANNING: GuideLink[] = [
  {
    href: "/career-change/how-to-change-careers",
    label: "How to change careers in the UK",
    note: "Six steps in order, with ONS pay and the official rules on notice, training time and course funding.",
  },
  {
    href: "/career-change-no-experience",
    label: "Changing career with no experience",
    note: "Routes built for new entrants, such as apprenticeships and funded courses, and what the jobs pay.",
  },
  {
    href: "/how-to-write-a-cv-for-career-change",
    label: "How to write a CV for a career change",
    note: "A skills-based structure with example lines you can adapt.",
  },
  {
    href: "/career-change/skills-based-hiring",
    label: "Skills-based hiring explained",
    note: "How the Civil Service and apprenticeship standards assess skills rather than job titles.",
  },
  { href: "/transferable-skills", label: "Transferable skills" },
  { href: "/career-change-with-no-money", label: "Changing career with no money" },
  { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
];

const DECIDING: GuideLink[] = [
  {
    href: "/what-job-is-right-for-me",
    label: "What job is right for me?",
    note: "Narrow it down by skills, values, working style and pay, with example jobs and ONS pay.",
  },
  {
    href: "/jobs-for-people-who-hate-their-job",
    label: "I hate my job: what should I do?",
    note: "Work out what is really wrong before you decide, and what to do if it is affecting your health.",
  },
  { href: "/low-stress-jobs-uk", label: "Low-stress jobs in the UK" },
  { href: "/best-jobs-for-work-life-balance", label: "Jobs with a good work-life balance" },
  { href: "/jobs-for-introverts", label: "Jobs for introverts" },
  { href: "/jobs-for-people-with-adhd", label: "Jobs for people with ADHD" },
  { href: "/best-jobs-for-women-returning-to-work", label: "Jobs for women returning to work" },
];

const BY_AGE: GuideLink[] = [
  { href: "/career-change-at-30", label: "Career change at 30" },
  {
    href: "https://aicareerswap.com/guides/career-change-at-40",
    label: "Career change at 40",
    note: "On our sister site, AICareerSwap.",
    external: true,
  },
  { href: "/career-change-at-50", label: "Career change at 50" },
];

const PAY_AND_DATA: GuideLink[] = [
  { href: "/highest-paying-careers-uk", label: "Highest paying careers in the UK" },
  { href: "/jobs-without-a-degree", label: "Jobs without a degree" },
  { href: "/what-jobs", label: "What jobs can I do?" },
  { href: "/what-jobs/jobs-that-pay-30k", label: "Jobs that pay £30k" },
  { href: "/what-jobs/jobs-that-pay-40k", label: "Jobs that pay £40k" },
  { href: "/what-jobs/jobs-that-pay-50k", label: "Jobs that pay £50k" },
  { href: "/best-careers-for-the-future-uk", label: "Careers with a future in the UK" },
  { href: "/skills-employers-want-2026", label: "Skills employers want" },
];

const WORK_STYLE: GuideLink[] = [
  { href: "/work-from-home-jobs", label: "Work from home jobs" },
  { href: "/jobs-you-can-do-from-home-with-no-experience", label: "Home-based jobs with no experience" },
  { href: "/highest-paying-remote-jobs-uk", label: "Highest paying remote jobs" },
  { href: "/freelance-careers-uk", label: "Freelance careers" },
  { href: "/best-side-hustles-uk", label: "Side hustles" },
];

function LinkList({ links }: { links: GuideLink[] }) {
  return (
    <ul className="mt-5 max-w-reading border-t border-ink">
      {links.map((link) => {
        const inner = (
          <>
            <span className="underline-offset-4 group-hover:underline">
              {link.label}
              {link.external && <span className="sr-only"> (opens AICareerSwap)</span>}
            </span>
            {link.note && <span className="text-sm text-muted">{link.note}</span>}
          </>
        );
        const className = "group flex min-h-12 flex-col justify-center py-2 text-lg text-ink hover:text-accent";
        return (
          <li key={link.href} className="border-b border-rule">
            {link.external ? (
              <a href={link.href} className={className} rel="noopener">
                {inner}
              </a>
            ) : (
              <Link href={link.href} className={className}>
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Page() {
  const internal = [...PLANNING, ...DECIDING, ...BY_AGE, ...JOB_HUBS, ...PAY_AND_DATA, ...WORK_STYLE].filter(
    (l) => !("external" in l && l.external),
  );
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: H1,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    inLanguage: "en-GB",
    dateModified: REVAMP_DATE,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: internal.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(l.href),
        name: l.label,
      })),
    },
  };

  return (
    <GuideShell>
      <JsonLd data={collection} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change" }]} />}
        kicker="Guides"
        title={H1}
        intro={
          <>
            <p>
              Start with the guide that matches where you are. If you do not know what you want yet, begin with{" "}
              <Link href="/what-job-is-right-for-me" className="link">
                what job is right for me
              </Link>
              . If you know the job but not the route, read{" "}
              <Link href="/career-change/how-to-change-careers" className="link">
                how to change careers
              </Link>
              .
            </p>
            <p className="mt-3">
              The guides use ONS pay data for the whole UK, and link each rule to GOV.UK or the body that sets it.
            </p>
          </>
        }
        updated={REVAMP_DATE}
      />

      <Prose>
        <p>
          A useful benchmark before you compare jobs: the median pay for full-time employee jobs in the UK was{" "}
          <strong>{formatGBP(UK_FT_MEDIAN)}</strong> a year in the tax year to April 2025. Half of full-time jobs paid
          more than that and half paid less.
        </p>
      </Prose>
      <SourceNote
        className="mt-2 max-w-reading"
        source="ONS, Employee earnings in the UK: 2025"
        href={ASHE_BULLETIN_URL}
        published={ASHE_PUBLISHED}
        note="The 2026 figures are due on 22 October 2026."
      />

      <GuideSection id="planning" title="Planning the move">
        <LinkList links={PLANNING} />
      </GuideSection>

      <GuideSection id="deciding" title="Deciding what to do next">
        <LinkList links={DECIDING} />
      </GuideSection>

      <GuideSection id="by-age" title="By age">
        <LinkList links={BY_AGE} />
      </GuideSection>

      <GuideSection id="by-job" title="Starting from the job you do now">
        <LinkList links={JOB_HUBS.map((h) => ({ href: h.href, label: h.label }))} />
      </GuideSection>

      <div className="mt-14">
        <ToolCallout />
      </div>

      <GuideSection id="pay" title="Pay and data">
        <LinkList links={PAY_AND_DATA} />
      </GuideSection>

      <GuideSection id="work-style" title="Remote, freelance and extra income">
        <LinkList links={WORK_STYLE} />
      </GuideSection>
    </GuideShell>
  );
}
