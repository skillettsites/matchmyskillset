import type { Metadata } from "next";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SourceNote,
  ToolCallout,
  formatGBP,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";
import {
  ApprenticeshipSourceNote,
  AsheSourceNote,
  RouteList,
  UK_FT_MEDIAN,
  occupationPayById,
  type OccupationPay,
} from "@/components/guides/pay";

const PATH = "/jobs-for-people-with-adhd";
const TITLE = "Jobs for people with ADHD: UK pay, rights and support";
const DESCRIPTION =
  "What to look for in a job if you have ADHD, ONS pay for some options, and the UK help you can use: Access to Work, reasonable adjustments and your rights.";
const H1 = "Jobs for people with ADHD, and the support you can get at work";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Sources, all checked on 28 September 2026.
const NHS_ADHD = "https://www.nhs.uk/conditions/adhd-adults/";
const ATW = "https://www.gov.uk/access-to-work";
const ATW_ELIGIBILITY = "https://www.gov.uk/access-to-work/eligibility";
const ATW_APPLY = "https://www.gov.uk/access-to-work/apply";
const ADJUSTMENTS = "https://www.gov.uk/reasonable-adjustments-for-disabled-workers";
const DISABILITY_DEFINITION = "https://www.gov.uk/definition-of-disability-under-equality-act-2010";
const DISABILITY_RIGHTS = "https://www.gov.uk/rights-disabled-person/employment";
const FLEXIBLE_WORKING = "https://www.gov.uk/flexible-working";
const ACAS_TALKING = "https://www.acas.org.uk/neurodiversity-at-work/talking-about-neurodiversity";
const ACAS_ADJUSTMENTS = "https://www.acas.org.uk/reasonable-adjustments/adjustments-for-neurodiversity";
const ADHD_DRIVING = "https://www.gov.uk/adhd-and-driving";

interface JobRow {
  kind: string;
  pay: OccupationPay;
  worth: string;
}

/** Editorial selection, grouped by how the work is organised. */
const JOB_PICKS: { kind: string; id: string; worth: string }[] = [
  {
    kind: "Practical work where you move about",
    id: "electrician",
    worth: "Varied sites and hands-on problems. Training takes years, and the ONS figure leaves out self-employed electricians.",
  },
  {
    kind: "Practical work where you move about",
    id: "vehicle-technician",
    worth: "Each car or van brings a new problem to diagnose and fix.",
  },
  {
    kind: "Practical work where you move about",
    id: "plumber",
    worth: "Work on gas needs Gas Safe registration. The ONS figure leaves out self-employed plumbers.",
  },
  {
    kind: "Response work, where each call is different",
    id: "paramedic",
    worth: "You need an approved degree or degree apprenticeship and HCPC registration. Ambulance services run around the clock, so expect shifts.",
  },
  {
    kind: "Response work, where each call is different",
    id: "firefighter",
    worth: "The National Careers Service lists a fitness test, a medical and a full driving licence among the requirements. Expect shifts.",
  },
  {
    kind: "Project work with a clear finish",
    id: "software-developer",
    worth: "Work comes in short cycles with visible results, but there is also testing, documentation and long debugging sessions.",
  },
  {
    kind: "Project work with a clear finish",
    id: "ux-designer",
    worth: "A mix of research, sketching and testing with users. The ONS group is small, so the pay estimate is less precise.",
  },
  {
    kind: "Project work with a clear finish",
    id: "events-manager",
    worth: "Fixed deadlines and a busy day of delivery, with a lot of planning, budgets and supplier admin before it.",
  },
  {
    kind: "People-facing work with quick results",
    id: "sales-representative",
    worth: "Targets give clear, short-term goals. Commission can make pay uneven from month to month.",
  },
  {
    kind: "People-facing work with quick results",
    id: "recruitment-consultant",
    worth: "Busy and varied, with a lot of calls. Usually target driven, which some people find motivating and others find draining.",
  },
];

function jobRows(): JobRow[] {
  return JOB_PICKS.map((p) => ({ kind: p.kind, pay: occupationPayById(p.id), worth: p.worth }));
}

function payCell(p: OccupationPay) {
  if (p.median === null) {
    return <span className="text-ink-2">ONS did not publish a reliable figure</span>;
  }
  return (
    <span className="block">
      <span className="block">{formatGBP(p.median)}</span>
      {p.payNote && <span className="mt-1 block text-xs font-normal text-muted">{p.payNote}</span>}
    </span>
  );
}

export default function AdhdJobsPage() {
  const rows = jobRows();
  const aboveUk = rows.filter((r) => (r.pay.median ?? 0) > UK_FT_MEDIAN).length;

  const faq = [
    {
      question: "Is ADHD classed as a disability at work?",
      answer:
        "It can be. Under the Equality Act 2010 you are disabled if you have a physical or mental impairment that has a substantial (more than minor or trivial) and long-term (12 months or more) negative effect on your ability to do normal daily activities. Acas says being neurodivergent, which includes having ADHD, will often amount to a disability under the Act, and that you do not need a diagnosis to be treated as disabled. The Equality Act does not apply in Northern Ireland.",
    },
    {
      question: "Do I have to tell my employer I have ADHD?",
      answer:
        "No. Acas says nobody has to tell their employer they are neurodivergent, and if you do decide to, it is up to you when and how. Telling them can help you get support and adjustments, and it matters if there is a health and safety risk. Separately, GOV.UK says you must tell DVLA if your ADHD or your ADHD medication affects your ability to drive safely.",
    },
    {
      question: "Can Access to Work help if I have ADHD?",
      answer:
        "It can. GOV.UK lists ADHD among the conditions that can qualify, and you do not need a diagnosis to apply. You must be 16 or over, in paid work (or starting within 12 weeks) and live and work in England, Scotland or Wales. A grant can pay for things like assistive software, specialist equipment or a job coach. It does not pay for reasonable adjustments, which your employer must make itself.",
    },
    {
      question: "What adjustments can I ask for with ADHD?",
      answer:
        "Acas gives examples such as noise-cancelling headphones or a quiet place to work, regular breaks, a standing desk, instructions broken into clear steps, planners that highlight deadlines, extra reminders, regular check-ins with your manager and breaking work into smaller tasks. The NHS adds written instructions as well as spoken ones. What helps one person may not help another, so agree adjustments with your employer and review them.",
    },
    {
      question: "Can I ask to change my hours or work from home?",
      answer:
        "Yes. All employees in England, Scotland and Wales can make a statutory request for flexible working from their first day in a job, and can make 2 requests in any 12 months. The employer must deal with it reasonably and decide within 2 months, unless you agree to longer. They can refuse for one of the business reasons set out in law. Northern Ireland has different rules.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Jobs for people with ADHD" }]} />
        }
        kicker="Work and ADHD"
        title={H1}
        intro={
          <p>
            No job suits everyone with ADHD. The NHS describes it as a condition where the brain works differently,
            and Acas points out that the strengths and challenges it brings are not the same for everyone. So
            start with how a job is organised, then use the support UK law and government schemes give you: reasonable
            adjustments, flexible working and Access to Work grants.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "what-to-look-for", label: "What to look for in a job" },
          { id: "jobs", label: "Jobs worth a look, with pay" },
          { id: "access-to-work", label: "Access to Work grants" },
          { id: "adjustments", label: "Adjustments and your rights" },
          { id: "telling-your-employer", label: "Telling an employer" },
          { id: "diagnosis", label: "Getting assessed as an adult" },
        ]}
      />

      <GuideSection id="what-to-look-for" title="Start with how the job is organised">
        <Prose>
          <p>
            The{" "}
            <a href={NHS_ADHD} className="link" rel="noopener">
              NHS page on ADHD in adults
            </a>{" "}
            lists signs such as being easily distracted or forgetful, finding it hard to organise your time or finish
            tasks, and having a lot of energy or feeling restless. Most people have a mix of inattentive and
            hyperactive-impulsive symptoms; some have only one type. Which ones affect you, and how much, tells you more
            about the right job than any list of &ldquo;ADHD jobs&rdquo; can.
          </p>
          <p>Before you apply for something, try these questions on the advert or at interview:</p>
          <ul>
            <li>
              <strong>How is the day split up?</strong> Short, varied tasks, or long stretches on one piece of work?
            </li>
            <li>
              <strong>Who sets the deadlines?</strong> Fixed outside deadlines help some people start; constant urgency
              wears others out.
            </li>
            <li>
              <strong>How much routine admin is there?</strong> Could templates, software or a colleague take some of it
              on?
            </li>
            <li>
              <strong>Where will you work?</strong> Open plan, hot desks and constant interruptions are harder for many
              people to focus in. Ask whether there is a quiet space.
            </li>
            <li>
              <strong>How are instructions given?</strong> In writing, in meetings, or on the fly?
            </li>
            <li>
              <strong>Can you move about?</strong> Some jobs keep you at a desk all day; others have you on your feet.
            </li>
          </ul>
          <p>
            These are our suggestions, not findings from research. Use them to test whether a job fits the way you
            work, then use the adjustments and support further down this page to close the gaps.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="jobs"
        title="Some jobs worth a look, and what they pay"
        intro={
          <p>
            Grouped by the kind of work involved. This is our own selection, not a ranking, and it is no reason to rule
            anything else out: with the right adjustments, the job that suits you may not be on this list. {aboveUk} of
            these {rows.length} have an ONS median above the UK figure of {formatGBP(UK_FT_MEDIAN)} for full-time work.
          </p>
        }
      >
        <DataTable<JobRow>
          caption="Jobs grouped by how the work is organised, with UK median pay"
          description="Median gross annual pay for full-time employees in 2025, for the whole ONS occupation group."
          rowKey={(r) => r.pay.id}
          columns={[
            {
              key: "job",
              header: "Job",
              rowHeader: true,
              render: (r) => (
                <span className="block">
                  <span className="block">{r.pay.title}</span>
                  <span className="block text-xs font-normal text-muted">{r.kind}</span>
                </span>
              ),
            },
            {
              key: "work",
              header: "What the work involves",
              render: (r) => (
                <span className="block space-y-1.5">
                  <span className="block">{r.pay.description}</span>
                  <span className="block text-sm text-ink-2">
                    <strong className="font-semibold text-ink">Worth knowing: </strong>
                    {r.worth}
                  </span>
                </span>
              ),
            },
            { key: "median", header: "Median pay", numeric: true, render: (r) => payCell(r.pay) },
            { key: "route", header: "Way in", render: (r) => <RouteList occupations={[r.pay]} /> },
          ]}
          rows={rows}
          source={
            <div className="space-y-1.5">
              <AsheSourceNote />
              <ApprenticeshipSourceNote />
            </div>
          }
          notes="Job descriptions and the notes on each job are our own summaries. The pay figure is for everyone ONS codes to that occupation group, most of them experienced, so a new starter usually earns less."
        />
      </GuideSection>

      <GuideSection
        id="access-to-work"
        title="Access to Work: a grant for support at work"
        intro={
          <p>
            Access to Work is a government scheme that can pay for practical support if a health condition or
            disability affects how you do your job or get to it. GOV.UK names ADHD among the conditions it covers.
          </p>
        }
      >
        <Prose>
          <h3>What it can pay for</h3>
          <p>
            According to{" "}
            <a href={ATW} className="link" rel="noopener">
              GOV.UK
            </a>
            , a grant can help pay for things like:
          </p>
          <ul>
            <li>specialist equipment and assistive software</li>
            <li>support workers, such as a job coach</li>
            <li>the cost of getting to work if you cannot use public transport</li>
            <li>changes to your workplace, which can include your home if you work there</li>
          </ul>
          <p>
            There is also separate mental health support at work, such as a tailored plan and one-to-one sessions with a
            mental health professional, which you apply for directly through Able Futures or Maximus (one of them, not
            both). You can only get that support once.
          </p>
          <p>
            A grant does not affect your other benefits and you do not pay it back. You or your employer may need to pay
            some costs first and claim them back. Access to Work will not pay for reasonable adjustments: those are your
            employer&apos;s legal responsibility.
          </p>

          <h3>Who can get it</h3>
          <p>
            The{" "}
            <a href={ATW_ELIGIBILITY} className="link" rel="noopener">
              eligibility rules
            </a>{" "}
            say you must be 16 or over, in paid work (or about to start or return to work within 12 weeks), and live and
            work in England, Scotland or Wales. Northern Ireland has a different system. Employment, self-employment,
            apprenticeships, work trials and internships count; voluntary work does not. You do not need a diagnosis to
            apply. If you are self-employed, your business needs an annual turnover of at least £6,500. Civil servants
            get support from their employer instead.
          </p>

          <h3>How to apply</h3>
          <p>
            You can{" "}
            <a href={ATW_APPLY} className="link" rel="noopener">
              apply online
            </a>{" "}
            or through the Access to Work helpline on 0800 121 7479 (Monday to Friday, 9am to 5pm). You will need your
            workplace address, a description of how your condition affects your work and what support you think would
            help, and the details of a workplace contact who can confirm you work there. GOV.UK says that contact will
            not be approached without your permission. Someone from Access to Work will then talk to you about your
            application, may arrange an assessment of your workplace, and will send a decision letter setting out the
            grant.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="GOV.UK, Access to Work: get support if you have a disability or health condition"
          href={ATW}
          note="Checked 28 September 2026."
        />
      </GuideSection>

      <GuideSection id="adjustments" title="Reasonable adjustments and your rights">
        <Prose>
          <h3>When the Equality Act protects you</h3>
          <p>
            Under the{" "}
            <a href={DISABILITY_DEFINITION} className="link" rel="noopener">
              Equality Act 2010
            </a>{" "}
            you are disabled if you have a physical or mental impairment that has a &ldquo;substantial&rdquo; and
            &ldquo;long-term&rdquo; negative effect on your ability to do normal daily activities. Substantial means
            more than minor or trivial; long-term means 12 months or more. The Act does not apply in Northern Ireland.
          </p>
          <p>
            <a href={ACAS_ADJUSTMENTS} className="link" rel="noopener">
              Acas
            </a>{" "}
            says some neurodivergent people do not see themselves as disabled, but being neurodivergent will often
            amount to a disability under the Act, and a worker does not need a diagnosis to count. An employer may ask
            for proof, such as an NHS letter, but you are not legally required to provide it, and Acas says employers
            should offer support whether or not you have a diagnosis.
          </p>

          <h3>What adjustments look like</h3>
          <p>
            Employers must make{" "}
            <a href={ADJUSTMENTS} className="link" rel="noopener">
              reasonable adjustments
            </a>{" "}
            so disabled workers are not put at a substantial disadvantage. Examples Acas gives for neurodivergent workers
            include:
          </p>
          <ul>
            <li>
              <strong>For concentration:</strong> headphones or ear defenders, a quiet place to work, a standing desk,
              regular breaks.
            </li>
            <li>
              <strong>For organisation and time:</strong> regular check-ins on how work is going, planners that
              highlight deadlines, extra reminders, work broken into smaller tasks, extra time to plan.
            </li>
            <li>
              <strong>For instructions:</strong> information talked through as well as written down, and instructions
              broken into clear steps.
            </li>
          </ul>
          <p>
            One of Acas&apos;s own examples is a worker with ADHD in a call centre who uses a standing desk to help them
            focus. Acas also says adjustments that suit one person may not help someone else with the same condition, so
            try them and review them. If an employer fails to make reasonable adjustments, that can be disability
            discrimination.
          </p>

          <h3>Flexible working</h3>
          <p>
            Separately from adjustments, all employees can make a{" "}
            <a href={FLEXIBLE_WORKING} className="link" rel="noopener">
              statutory request for flexible working
            </a>{" "}
            from their first day in a job: different hours, start and finish times, days or place of work. You can make
            2 requests in any 12 months. The employer must decide within 2 months (or longer if you agree) and can only
            refuse for one of the business reasons set out in the rules. Northern Ireland has its own rules.
          </p>
        </Prose>
        <div className="mt-4 max-w-reading space-y-1.5">
          <SourceNote
            source="Acas, Adjustments for neurodiversity"
            href={ACAS_ADJUSTMENTS}
            note="Page last updated 30 January 2025; checked 28 September 2026."
          />
          <SourceNote
            label="Also"
            source="GOV.UK guidance on the definition of disability, reasonable adjustments and flexible working"
            href={DISABILITY_DEFINITION}
            note="Checked 28 September 2026."
          />
        </div>
      </GuideSection>

      <GuideSection id="telling-your-employer" title="Do you have to tell an employer?">
        <Prose>
          <p>
            No.{" "}
            <a href={ACAS_TALKING} className="link" rel="noopener">
              Acas
            </a>{" "}
            says nobody has to tell their employer they are neurodivergent, and if you choose to, it is up to you when
            and how. An employer should take you seriously and offer support whenever you tell them, even if that is
            only once a formal procedure has started, and whether or not you have a diagnosis.
          </p>
          <p>
            Telling your employer can make it easier to get adjustments. Acas also notes it can matter for health and
            safety: its example is an employee with ADHD who is struggling to concentrate while using heavy machinery.
          </p>
          <p>
            <strong>During recruitment</strong>, GOV.UK says an employer can only{" "}
            <a href={DISABILITY_RIGHTS} className="link" rel="noopener">
              ask about your health or disability
            </a>{" "}
            for limited reasons, such as working out whether you can do a task that is essential to the job, whether you
            can take part in an interview, or what adjustments you need for the selection process.
          </p>
          <p>
            <strong>If the job involves driving</strong>, the rules are different.{" "}
            <a href={ADHD_DRIVING} className="link" rel="noopener">
              GOV.UK
            </a>{" "}
            says you must tell DVLA if your ADHD or your ADHD medication affects your ability to drive safely, and you
            can be fined up to £1,000 if you do not. If your driving is not affected, you do not need to tell DVLA. Ask
            your doctor if you are unsure.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="Acas, Talking about neurodiversity"
          href={ACAS_TALKING}
          note="Page last updated 16 December 2025; checked 28 September 2026."
        />
      </GuideSection>

      <GuideSection id="diagnosis" title="Getting assessed as an adult">
        <Prose>
          <p>
            If ADHD symptoms are affecting your work, the NHS suggests seeing a GP, who may refer you for an assessment
            with an ADHD specialist such as a psychiatrist. The NHS says waiting times vary and you may wait several
            months or years. In England you may be able to find a clinic with a shorter wait through the Right to Choose
            scheme, via your GP.
          </p>
          <p>
            You do not have to wait for a diagnosis to get help at work. Access to Work does not require one, and Acas
            says employers should support workers and make reasonable adjustments whether or not they have a diagnosis.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="NHS, ADHD in adults"
          href={NHS_ADHD}
          note="Page last reviewed 19 March 2025; checked 28 September 2026."
        />
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which jobs fit the skills you already have"
        body={
          <p>
            Paste your CV or type the job you do now. We show the skills you already have, the jobs they lead to and
            what they pay. It is free and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/jobs-for-introverts", label: "Jobs for introverts", note: "Quieter jobs, with ONS pay" },
          { href: "/low-stress-jobs-uk", label: "Lower-stress jobs in the UK" },
          { href: "/best-jobs-for-work-life-balance", label: "Jobs with a better work-life balance" },
          { href: "/work-from-home-jobs", label: "Work from home jobs" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
        ]}
      />
    </GuideShell>
  );
}
