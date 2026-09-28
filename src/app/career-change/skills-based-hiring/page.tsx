import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout, formatGBP } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote, occupationPayById, type OccupationPay } from "@/components/guides/pay";
import { getApprenticeshipStandard, type ApprenticeshipStandard } from "@/data/careers";

const PATH = "/career-change/skills-based-hiring";
const TITLE = "Skills-based hiring: what it means for UK job seekers";
const DESCRIPTION =
  "How UK employers assess skills rather than job titles, shown through Civil Service Success Profiles and apprenticeship standards, and how to prepare.";
const H1 = "Skills-based hiring: what it means for career changers";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const SUCCESS_PROFILES_URL = "https://www.gov.uk/government/publications/success-profiles";
const CANDIDATE_OVERVIEW_URL =
  "https://www.gov.uk/government/publications/success-profiles/success-profiles-candidate-overview";
const BEHAVIOURS_URL =
  "https://www.gov.uk/government/publications/success-profiles/success-profiles-civil-service-behaviours";
const STAR_URL = "https://www.gov.uk/guidance/a-brief-guide-to-competencies";
const OCCUPATIONAL_STANDARD_URL = "https://occupational-maps.skillsengland.education.gov.uk/what-is-an-occupational-standard/";
const NHS_VBR_URL = "https://www.nhsemployers.org/articles/values-based-recruitment";

// Civil Service behaviours, as listed on the Success Profiles behaviours page (updated 29 January 2025).
const BEHAVIOURS = [
  "Seeing the big picture",
  "Changing and improving",
  "Making effective decisions",
  "Leadership",
  "Communicating and influencing",
  "Working together",
  "Developing self and others",
  "Managing a quality service",
  "Delivering at pace",
];

// Apprenticeship standards for common career-change destinations (references from the careers dataset).
const STANDARD_REFS = ["ST0118", "ST0310", "ST0117", "ST0239", "ST0562", "ST0071"];

// Occupations in the dataset that need a licence, registration or named qualification.
const REGULATED_IDS = ["nurse", "paramedic", "social-worker", "secondary-school-teacher", "solicitor", "security-officer", "hgv-driver"];

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

interface RegulatedRow {
  id: string;
  p: OccupationPay;
}

export default function Page() {
  const standards = STANDARD_REFS.map((ref) => getApprenticeshipStandard(ref)).filter(
    (s): s is ApprenticeshipStandard => Boolean(s),
  );
  const regulated: RegulatedRow[] = REGULATED_IDS.map((id) => ({ id, p: occupationPayById(id) }));

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Skills-based hiring" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            Skills-based hiring means an employer judges you on what you can show you are able to do, through examples,
            tests or a piece of work, rather than on your past job titles or degree. It helps career changers most when
            the advert lists skills and behaviours instead of years in the industry. Two large UK systems show how it
            works: Civil Service recruitment and apprenticeship standards.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <GuideSection id="what-it-means" title="What it looks like in practice">
        <Prose className="mt-4">
          <p>In a job advert that hires on skills, you will usually see some of these:</p>
          <ul>
            <li>
              Essential criteria written as things you can do, such as &ldquo;explain complex information to the
              public&rdquo;, rather than a job title or a number of years in the sector.
            </li>
            <li>
              Assessment by examples you write or talk through, a test, a task or presentation, or questions about what
              you enjoy and do well.
            </li>
            <li>A qualification asked for only where the job legally or practically needs one.</li>
          </ul>
          <p>
            For a career changer, that shifts the question from &ldquo;have you done this job?&rdquo; to &ldquo;can you
            show you can do these things?&rdquo;. Your evidence can come from a different sector, as long as it matches
            what the advert asks for.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="civil-service" title="Example 1: the Civil Service">
        <Prose className="mt-4">
          <p>
            The Civil Service recruits using a framework called{" "}
            <Ext href={SUCCESS_PROFILES_URL}>Success Profiles</Ext> (first published 18 June 2018, last updated 29
            January 2025). It has five elements, and each job advert says which ones will be assessed and how:
          </p>
          <ul>
            <li>
              <strong>Behaviours:</strong> the actions and activities that result in effective performance in a job.
            </li>
            <li>
              <strong>Strengths:</strong> the things you do regularly, do well and that motivate you.
            </li>
            <li>
              <strong>Ability:</strong> the aptitude or potential to perform to the required standard, sometimes
              assessed with online tests.
            </li>
            <li>
              <strong>Experience:</strong> knowledge or mastery of an activity or subject gained through doing it.
            </li>
            <li>
              <strong>Technical:</strong> specific professional skills, knowledge or qualifications.
            </li>
          </ul>
          <p>
            There are nine <Ext href={BEHAVIOURS_URL}>Civil Service behaviours</Ext>: {BEHAVIOURS.join(", ").toLowerCase()}.
            You will not be asked for all of them in one job.
          </p>
          <p>Three points in the <Ext href={CANDIDATE_OVERVIEW_URL}>candidate overview</Ext> matter most if you are changing career:</p>
          <ul>
            <li>
              Your examples of behaviours can come from work or from somewhere else, such as work experience,
              volunteering or a hobby.
            </li>
            <li>
              You may be asked for an anonymised CV that leaves out information such as your name, age or gender, and to
              include only educational qualifications relevant to the role.
            </li>
            <li>
              Interviews usually last 30 to 60 minutes and may include questions about your interests and what you
              enjoy, which assess your strengths.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection
        id="apprenticeships"
        title="Example 2: apprenticeship standards"
        intro={
          <p>
            In England every apprenticeship is built on an occupational standard. Skills England describes a standard as
            a description of an occupation, setting out the knowledge, skills and behaviours (KSBs) someone needs to be
            competent in its duties. Standards are developed by employers.
          </p>
        }
      >
        <Prose className="mt-4">
          <p>
            Skills England also notes that behaviours &ldquo;tend to be very transferable. They may be more similar across
            occupations than knowledge and skills&rdquo; (
            <Ext href={OCCUPATIONAL_STANDARD_URL}>What is an occupational standard?</Ext>). That is useful even if you
            never start an apprenticeship: the standard for your target job lists, in employers&apos; own words, the
            duties and skills they expect. Read it, tick off what you can already evidence, and you have a list of gaps
            and a vocabulary for your CV.
          </p>
        </Prose>
        <DataTable<ApprenticeshipStandard>
          caption="Occupational standards worth reading for common career moves"
          columns={[
            {
              key: "title",
              header: "Standard",
              rowHeader: true,
              render: (s) => <Ext href={s.url}>{s.title}</Ext>,
            },
            { key: "level", header: "Level", numeric: true },
            {
              key: "typicalDurationMonths",
              header: "Typical length",
              numeric: true,
              render: (s) => `${s.typicalDurationMonths} months`,
            },
          ]}
          rows={standards}
          rowKey={(s) => s.referenceNumber}
          source={
            <SourceNote
              source="Skills England, apprenticeship standards"
              href="https://skillsengland.education.gov.uk/apprenticeships/"
              note="Checked 28 September 2026. Typical lengths are as Skills England publishes them. Standards apply in England."
            />
          }
        />
      </GuideSection>

      <GuideSection id="nhs" title="Example 3: values-based recruitment in the NHS">
        <Prose className="mt-4">
          <p>
            NHS Employers describes values-based recruitment as an approach that helps employers find people whose
            personal values match the organisation&apos;s, by assessing candidates&apos; values and behaviours against
            the NHS Constitution (<Ext href={NHS_VBR_URL}>NHS Employers, 23 May 2024</Ext>). If you apply for an NHS role,
            read the values in the NHS Constitution and prepare real examples of acting on them, in the same way as for
            Civil Service behaviours.
          </p>
        </Prose>
      </GuideSection>

      <div className="mt-14">
        <ToolCallout heading="See which of your skills carry over" />
      </div>

      <GuideSection
        id="limits"
        title="What skills-based hiring does not change"
        intro={
          <p>
            Some jobs need a licence, registration or named qualification before you can do the work. No amount of
            transferable skill replaces it, so check this first for any regulated job on your list.
          </p>
        }
      >
        <DataTable<RegulatedRow>
          caption="Jobs that need a licence, registration or qualification"
          columns={[
            { key: "job", header: "Job", rowHeader: true, render: (r) => r.p.title },
            {
              key: "licence",
              header: "What you need",
              render: (r) =>
                r.p.licences.map((l, i) => (
                  <span key={l.id} className="block">
                    <Ext href={l.sources[0].url}>{l.name}</Ext> ({l.body}
                    {l.scope ? `, ${l.scope}` : ""}){i < r.p.licences.length - 1 ? ";" : ""}
                  </span>
                )),
            },
            {
              key: "median",
              header: "Median pay",
              numeric: true,
              render: (r) => (r.p.median === null ? <span className="text-muted">Not published</span> : formatGBP(r.p.median)),
            },
          ]}
          rows={regulated}
          rowKey={(r) => r.id}
          source={
            <>
              <AsheSourceNote />
              <SourceNote
                className="mt-1"
                source="Licence and registration bodies, linked in each row"
                note="Checked 28 September 2026."
              />
            </>
          }
        />
      </GuideSection>

      <GuideSection id="prepare" title="How to prepare for a skills-based application">
        <Prose className="mt-4">
          <ol>
            <li>
              <strong>List the essential criteria.</strong> Copy each one from the advert or person specification onto
              its own line.
            </li>
            <li>
              <strong>Find one example for each.</strong>{" "}Pick a real situation where you did the thing being asked for.
              GOV.UK&apos;s guide to competencies says to use evidence from work if you can, &ldquo;though your examples
              don&apos;t need to be work related&rdquo; (<Ext href={STAR_URL}>A brief guide to competencies</Ext>).
            </li>
            <li>
              <strong>Write it up with STAR.</strong> Situation (what was going on), Task (what you were trying to
              achieve), Action (what you did, how and why) and Result (what happened, and whether you met your goal).
            </li>
            <li>
              <strong>Use the advert&apos;s words.</strong>{" "}If it says &ldquo;stakeholder engagement&rdquo;, use that
              phrase rather than your old sector&apos;s term for the same thing.
            </li>
            <li>
              <strong>Practise any tests.</strong> The Civil Service says practice questions are available before its{" "}
              <Ext href="https://www.gov.uk/guidance/civil-service-online-tests">online tests</Ext>.
            </li>
          </ol>
          <p>
            Our <Link href="/transferable-skills">transferable skills guide</Link> helps with the wording, and the{" "}
            <Link href="/how-to-write-a-cv-for-career-change">career change CV guide</Link> shows where the examples go
            on your CV.
          </p>
        </Prose>
      </GuideSection>

      <FaqSection
        items={[
          {
            question: "What is skills-based hiring?",
            answer:
              "An approach where employers judge candidates on skills and behaviours they can show, through written examples, tests, tasks or interviews, rather than mainly on job titles, sector experience or degrees. The Civil Service Success Profiles framework is a large UK example.",
          },
          {
            question: "What is the STAR method?",
            answer:
              "A way to structure an example: Situation, Task, Action and Result. GOV.UK's brief guide to competencies explains it and says your examples do not need to be work related, although work evidence is preferred where you have it.",
          },
          {
            question: "What are the Civil Service behaviours?",
            answer: `There are nine: ${BEHAVIOURS.join(", ").toLowerCase()}. Each job advert says which ones will be assessed; you will not be asked for all of them.`,
          },
          {
            question: "Can I use examples from outside work?",
            answer:
              "Yes, for the Civil Service. Its candidate overview says examples of behaviours can come from work or from elsewhere, such as work experience, volunteering or a hobby. Other employers vary, so check the advert.",
          },
          {
            question: "Does skills-based hiring mean I do not need qualifications?",
            answer:
              "Not for regulated jobs. Nurses need NMC registration, social workers in England need Social Work England registration, new solicitors in England and Wales qualify through the Solicitors Qualifying Examination (SQE), and licensable security work needs an SIA licence. Skills-based hiring changes how employers assess you, not the entry rules of a regulated profession.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/how-to-write-a-cv-for-career-change", label: "How to write a CV for a career change" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/jobs-without-a-degree", label: "Jobs without a degree, with ONS pay" },
          { href: "/career-change", label: "All career change guides" },
        ]}
      />
    </GuideShell>
  );
}
