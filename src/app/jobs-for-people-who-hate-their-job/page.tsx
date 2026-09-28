import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, entryApprenticeship, occupationPayById, UK_FT_MEDIAN, type OccupationPay } from "@/components/guides/pay";

const PATH = "/jobs-for-people-who-hate-their-job";
const TITLE = "I hate my job: what to do next (UK guide)";
const DESCRIPTION =
  "Hate your job? Work out if it is the manager, the pay or the work itself, look after your health, know your notice rights, and plan a way out.";
const H1 = "I hate my job: what should I do?";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const HSE_STRESS_URL = "https://www.hse.gov.uk/Statistics/assets/docs/stress.pdf";
const NOTICE_URL = "https://www.gov.uk/handing-in-your-notice/giving-notice";
const FIT_NOTE_URL = "https://www.gov.uk/taking-sick-leave";
const TALKING_THERAPIES_URL =
  "https://www.nhs.uk/nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/";
const CONSTRUCTIVE_URL = "https://www.acas.org.uk/dismissals/constructive-dismissal";
const GRIEVANCE_URL = "https://www.acas.org.uk/grievance-procedure-step-by-step";

// Jobs paying above the UK full-time median where ONS or the National Careers
// Service describe a way in below degree level. Selection is ours.
const KEEP_PAY_IDS = [
  "project-manager",
  "business-development-manager",
  "railway-signaller",
  "business-analyst",
  "compliance-officer",
  "health-and-safety-adviser",
  "train-conductor",
  "engineering-technician",
  "firefighter",
  "facilities-manager",
];

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

interface ProblemRow {
  problem: string;
  signs: string;
  helps: ReactNode;
}

const PROBLEMS: ProblemRow[] = [
  {
    problem: "Your manager",
    signs: "You liked the work before they arrived, and the dread started with them.",
    helps: "A move to another team or employer in the same kind of job. The work may be fine.",
  },
  {
    problem: "The employer or culture",
    signs: "Unreasonable expectations, poor treatment or values that clash with yours.",
    helps: "The same job at a different organisation. Ask people who work there before you accept.",
  },
  {
    problem: "The pay",
    signs: "You like the work but resent what you are paid for it.",
    helps: (
      <>
        Check what the job pays elsewhere (<Link href="/what-jobs">ONS pay by job</Link>), then ask for a review or move
        employer.
      </>
    ),
  },
  {
    problem: "The hours",
    signs: "The work is fine but the hours or commute are not.",
    helps: "A flexible working request, which you can make from your first day in a job.",
  },
  {
    problem: "Burnout",
    signs: "You used to cope, but now feel exhausted, cynical and less effective.",
    helps: "Rest and support first, decisions later. See your GP if it is affecting your health.",
  },
  {
    problem: "The work itself",
    signs: "Even on good days the tasks bore or drain you, and it has been that way for a long time.",
    helps: "A career change. A new manager or employer will not change the work.",
  },
];

interface PayRow {
  id: string;
  p: OccupationPay;
  median: number | null;
}

export default function Page() {
  const payRows: PayRow[] = KEEP_PAY_IDS.map((id) => {
    const p = occupationPayById(id);
    return { id, p, median: p.median };
  }).sort((a, b) => (b.median ?? -1) - (a.median ?? -1));

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "I hate my job" }]} />}
        kicker="Leaving your job"
        title={H1}
        intro={
          <p>
            Work out which part you hate before you decide anything: the manager, the employer, the pay, the hours or the
            work itself. Only the last one needs a new career. If the job is affecting your health, deal with that first:
            HSE estimates that 964,000 workers in Great Britain had work-related stress, depression or anxiety in 2024/25.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "diagnose", label: "Work out what you actually hate" },
          { id: "health", label: "If it is affecting your health" },
          { id: "fix", label: "Try to fix it where you are" },
          { id: "quit", label: "Should you quit?" },
          { id: "new-work", label: "If the work itself is the problem" },
          { id: "exit", label: "Plan your way out" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection
        id="diagnose"
        title="Work out what you actually hate"
        intro={<p>The fix for a bad manager is different from the fix for work you dislike. Be honest about which this is.</p>}
      >
        <DataTable<ProblemRow>
          caption="What is really wrong, and what usually helps"
          columns={[
            { key: "problem", header: "The problem", rowHeader: true },
            { key: "signs", header: "Signs" },
            { key: "helps", header: "What usually helps", render: (r) => r.helps },
          ]}
          rows={PROBLEMS}
          rowKey={(r) => r.problem}
        />
      </GuideSection>

      <GuideSection id="health" title="If it is affecting your health">
        <Prose className="mt-4">
          <p>
            You are far from the only one. In 2024/25 an estimated 964,000 workers in Great Britain had work-related
            stress, depression or anxiety, a rate of 2,770 per 100,000 workers, and 22.1 million working days were lost
            to it. Over 2022/23 to 2024/25, rates were higher than average in public administration and defence, human
            health and social work, and education. The main causes workers gave were workload, including tight deadlines and too much
            responsibility, and a lack of support from managers.
          </p>
        </Prose>
        <SourceNote
          className="mt-2 max-w-reading"
          source="HSE, Work-related stress, depression or anxiety statistics in Great Britain, 2025"
          href={HSE_STRESS_URL}
          published="2025-11-20"
          note="The causes come from Labour Force Survey questions asked in 2009/10 to 2011/12."
        />
        <Prose className="mt-6">
          <ul>
            <li>
              <strong>Talk to your GP.</strong> If you are off sick for more than 7 days in a row you need a fit note,
              which can come from a GP, hospital doctor, registered nurse, occupational therapist, pharmacist or
              physiotherapist. For 7 days or less you do not need one (<Ext href={FIT_NOTE_URL}>GOV.UK</Ext>).
            </li>
            <li>
              <strong>Refer yourself for talking therapy.</strong> In England, adults can refer themselves to NHS talking
              therapies for anxiety and depression without going through a GP, and you do not need a diagnosis (
              <Ext href={TALKING_THERAPIES_URL}>NHS</Ext>).
            </li>
            <li>
              <strong>If you are struggling to cope,</strong> call Samaritans free on 116 123, 24 hours a day, 365 days a
              year (<Ext href="https://www.samaritans.org/">Samaritans</Ext>). <Ext href="https://www.mind.org.uk/">Mind</Ext>{" "}
              has information on mental health at work.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="fix" title="Try to fix it where you are">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Say what is wrong.</strong> A specific conversation with your manager, or their manager, about one
              or two changes is more likely to get somewhere than a general complaint.
            </li>
            <li>
              <strong>Ask for flexible working.</strong> Every employee can request changes to their hours, start and
              finish times, days or place of work from their first day in a job (
              <Ext href="https://www.gov.uk/flexible-working">GOV.UK</Ext>).
            </li>
            <li>
              <strong>Raise a formal grievance</strong> if talking has not worked. Acas explains the{" "}
              <Ext href={GRIEVANCE_URL}>grievance procedure step by step</Ext>.
            </li>
            <li>
              <strong>Look at internal moves.</strong> A different team can fix a manager or culture problem while you keep
              your pay, pension and service.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="quit" title="Should you quit? An honest checklist">
        <div className="mt-6 grid max-w-reading gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-rule bg-surface p-5">
            <h3 className="font-serif text-h3 font-semibold text-ink">Leaving makes sense if</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
              <li>your health is getting worse</li>
              <li>you have tried to fix the specific problem and nothing changed</li>
              <li>you have felt this way for a long time, rather than a bad few weeks</li>
              <li>you have savings to live on or another offer</li>
            </ul>
          </div>
          <div className="rounded-lg border border-rule bg-surface p-5">
            <h3 className="font-serif text-h3 font-semibold text-ink">Wait a little if</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
              <li>you have not yet tried to fix the problem</li>
              <li>it started recently</li>
              <li>you have no money to fall back on</li>
              <li>you are deciding in the middle of burnout or after one bad day</li>
            </ul>
          </div>
        </div>
        <Prose className="mt-6">
          <p>
            <strong>Give proper notice.</strong> The legal minimum is one week once you have been in the job for more
            than a month, but your contract can ask for more, and leaving without enough notice can breach it (
            <Ext href={NOTICE_URL}>GOV.UK</Ext>).
          </p>
          <p>
            <strong>If your employer has treated you very badly,</strong> you may be able to claim constructive dismissal:
            resigning because your employer seriously breached your contract. Acas says to get legal advice before you
            resign. You usually need 2 years&apos; service to claim, with exceptions for some reasons such as
            whistleblowing, and the time limit is 3 months minus 1 day (
            <Ext href={CONSTRUCTIVE_URL}>Acas, updated 18 February 2026</Ext>).
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="new-work"
        title="If the work itself is the problem"
        intro={
          <p>
            Start from what you want to be different: less contact with the public, more variety, more purpose, better
            hours. Our guides to <Link href="/what-job-is-right-for-me">what job is right for me</Link>,{" "}
            <Link href="/low-stress-jobs-uk">low-stress jobs</Link> and{" "}
            <Link href="/best-jobs-for-work-life-balance">jobs with a good work-life balance</Link> help you narrow it
            down.
          </p>
        }
      >
        <Prose className="mt-4">
          <p>
            If you need to keep your income, the jobs below all have an ONS full-time median above the UK median of{" "}
            {formatGBP(UK_FT_MEDIAN)}, and ONS or the National Careers Service describe a way in without a degree.
          </p>
        </Prose>
        <DataTable<PayRow>
          caption="Jobs paying above the UK median without a degree"
          columns={[
            {
              key: "job",
              header: "Job",
              rowHeader: true,
              render: (r) => (
                <>
                  {r.p.title}
                  {r.p.payNote && <span className="mt-1 block text-sm font-normal text-muted">{r.p.payNote}</span>}
                </>
              ),
            },
            {
              key: "median",
              header: "Median pay",
              numeric: true,
              render: (r) => (r.median === null ? <span className="text-muted">Not published</span> : formatGBP(r.median)),
            },
            {
              key: "way",
              header: "An apprenticeship route in (England)",
              mobileLabel: "Apprenticeship",
              render: (r) => {
                const s = entryApprenticeship(r.p);
                if (!s) return <span className="text-muted">None listed</span>;
                return (
                  <>
                    <Ext href={s.url}>{s.title}</Ext>, level {s.level}, typically {s.typicalDurationMonths} months
                  </>
                );
              },
            },
          ]}
          rows={payRows}
          rowKey={(r) => r.id}
          source={
            <>
              <AsheSourceNote />
              <SourceNote
                className="mt-1"
                source="Skills England, apprenticeship standards"
                href="https://skillsengland.education.gov.uk/apprenticeships/"
                note="Checked 28 September 2026. Medians include experienced staff, so starting pay is often lower."
              />
            </>
          }
        />
      </GuideSection>

      <div className="mt-14">
        <ToolCallout heading="See where your experience could take you instead" />
      </div>

      <GuideSection id="exit" title="Plan your way out">
        <Prose className="mt-4">
          <ol>
            <li>
              <strong>Work out your runway.</strong> How many months could you pay your bills without a salary? That
              decides how carefully you need to plan.
            </li>
            <li>
              <strong>Decide what you are moving towards,</strong> not only what you are leaving. The{" "}
              <Link href="/career-change/how-to-change-careers">step-by-step career change guide</Link> covers checking
              pay, entry routes and funding.
            </li>
            <li>
              <strong>Apply while you are still employed</strong> if you can. You can be choosier, and you are not
              negotiating from an empty bank account.
            </li>
            <li>
              <strong>Close the gap with the shortest route that works:</strong> a course, a Skills Bootcamp or an
              apprenticeship, rather than starting a degree by default.
            </li>
            <li>
              <strong>Leave on good terms.</strong> Give your notice in writing and keep it professional; you may need a
              reference.
            </li>
          </ol>
        </Prose>
      </GuideSection>

      <FaqSection
        items={[
          {
            question: "Should I quit my job without another one lined up?",
            answer:
              "Only if your health is at risk or you have enough savings to cover several months. Otherwise it is usually easier to look for work while you are still paid. Either way, give the notice your contract requires: at least one week if you have been in the job for more than a month.",
          },
          {
            question: "Can I be signed off work with stress?",
            answer:
              "Yes, if a healthcare professional agrees you are not fit to work. You need a fit note if you are off sick for more than 7 days in a row; it can come from a GP, hospital doctor, registered nurse, occupational therapist, pharmacist or physiotherapist. For 7 days or less you can self-certify.",
          },
          {
            question: "How much notice do I have to give?",
            answer:
              "At least one week if you have been in your job for more than a month, according to GOV.UK. Your contract can require more and may say notice must be in writing.",
          },
          {
            question: "What is constructive dismissal?",
            answer:
              "Resigning because your employer seriously breached your employment contract, and then claiming at an employment tribunal. Acas says to get legal advice before resigning. You usually need 2 years' service, with some exceptions, and the time limit is 3 months minus 1 day.",
          },
          {
            question: "Who can I talk to if my job is making me feel low?",
            answer:
              "Your GP is a good first step. In England you can also refer yourself to NHS talking therapies for anxiety and depression without seeing a GP. If you are struggling to cope, Samaritans are free to call on 116 123, 24 hours a day.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/what-job-is-right-for-me", label: "What job is right for me?" },
          { href: "/low-stress-jobs-uk", label: "Low-stress jobs in the UK" },
          { href: "/best-jobs-for-work-life-balance", label: "Jobs with a good work-life balance" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/careers-for", label: "Start from the job you do now" },
        ]}
      />
    </GuideShell>
  );
}
