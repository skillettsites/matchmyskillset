import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  DataTable,
  FaqSection,
  PageHeader,
  Prose,
  SourceNote,
  ToolCallout,
  type DataTableColumn,
} from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";

const PATH = "/skills-employers-want-2026";
const TITLE = "Top skills UK employers want in 2026: survey evidence";
const DESCRIPTION =
  "The skills UK employers say applicants and staff lack, from the Employer Skills Survey 2024 of 22,712 employers, and how to show them if you change career.";
const H1 = "The skills UK employers want in 2026: what the latest survey found";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Sources, checked on 28 September 2026.
const ESS_STATS = "https://explore-education-statistics.service.gov.uk/find-statistics/employer-skills-survey/2024";
const ESS_UK = "https://www.gov.uk/government/publications/employer-skills-survey-2024-uk-findings";
const ESS_REPORT =
  "https://assets.publishing.service.gov.uk/media/6a1eef8d050971fbebf3bd92/Employer_Skills_Survey_2024_UK_report.pdf";

/**
 * Employer Skills Survey 2024, full UK research report (November 2025, updated June 2026),
 * figures 2-6, 2-7, 4-6 and 4-7, checked against the UK data tables 40, 48, 187 and 195.
 * Percentages of skill-shortage vacancies (applicants) and of skills gaps (existing staff)
 * where employers said the skill was lacking. More than one skill could be named.
 */
interface SkillRow {
  skill: string;
  applicants2024: number;
  applicants2022: number;
  staff2024: number;
}

const TECHNICAL: SkillRow[] = [
  { skill: "Specialist skills or knowledge needed for the role", applicants2024: 66, applicants2022: 63, staff2024: 50 },
  { skill: "Solving complex problems", applicants2024: 45, applicants2022: 36, staff2024: 41 },
  { skill: "Knowledge of the organisation's products and services", applicants2024: 45, applicants2022: 40, staff2024: 42 },
  { skill: "Creative and innovative thinking", applicants2024: 43, applicants2022: 40, staff2024: 41 },
  { skill: "Knowledge of how the organisation works", applicants2024: 34, applicants2022: 36, staff2024: 37 },
  { skill: "Reading and understanding instructions or reports", applicants2024: 30, applicants2022: 34, staff2024: 29 },
  { skill: "Writing instructions or reports", applicants2024: 26, applicants2022: 27, staff2024: 23 },
  { skill: "Basic numerical skills", applicants2024: 26, applicants2022: 29, staff2024: 21 },
  { skill: "Adapting to new equipment or materials", applicants2024: 26, applicants2022: 21, staff2024: 28 },
  { skill: "Advanced or specialist IT skills", applicants2024: 25, applicants2022: 17, staff2024: 21 },
  { skill: "Complex numerical or statistical skills", applicants2024: 25, applicants2022: 22, staff2024: 20 },
  { skill: "Computer literacy or basic IT skills", applicants2024: 21, applicants2022: 24, staff2024: 24 },
  { skill: "Manual dexterity", applicants2024: 20, applicants2022: 16, staff2024: 13 },
  { skill: "Communicating in a foreign language", applicants2024: 14, applicants2022: 18, staff2024: 12 },
];

const PEOPLE: SkillRow[] = [
  { skill: "Managing your own time and prioritising tasks", applicants2024: 48, applicants2022: 48, staff2024: 57 },
  { skill: "Managing your own feelings, or handling those of others", applicants2024: 37, applicants2022: 38, staff2024: 44 },
  { skill: "Customer handling", applicants2024: 36, applicants2022: 36, staff2024: 44 },
  { skill: "Team working", applicants2024: 35, applicants2022: 34, staff2024: 47 },
  { skill: "Managing or motivating other staff", applicants2024: 35, applicants2022: 31, staff2024: 38 },
  { skill: "Instructing, teaching or training people", applicants2024: 25, applicants2022: 25, staff2024: 27 },
  { skill: "Persuading or influencing others", applicants2024: 24, applicants2022: 24, staff2024: 28 },
  { skill: "Setting objectives for others and planning resources", applicants2024: 22, applicants2022: 20, staff2024: 21 },
  { skill: "Sales skills", applicants2024: 20, applicants2022: 17, staff2024: 25 },
  { skill: "Making speeches or presentations", applicants2024: 17, applicants2022: 13, staff2024: 15 },
];

/** Share of employers rating each factor critical or significant when recruiting (ESS 2024, table 3-1). */
const HIRING: { factor: string; pct: number }[] = [
  { factor: "Relevant work experience", pct: 61 },
  { factor: "Maths and English at GCSE grade A* to C (or equivalent)", pct: 53 },
  { factor: "Vocational qualifications", pct: 43 },
  { factor: "Academic qualifications", pct: 41 },
  { factor: "Having completed a relevant apprenticeship", pct: 30 },
  { factor: "A degree or equivalent", pct: 20 },
];

const pct = (n: number) => `${n}%`;

function skillColumns(): DataTableColumn<SkillRow>[] {
  return [
    { key: "skill", header: "Skill", rowHeader: true },
    {
      key: "applicants2024",
      header: "Lacking in applicants, 2024",
      mobileLabel: "Applicants 2024",
      numeric: true,
      render: (r: SkillRow) => pct(r.applicants2024),
    },
    {
      key: "applicants2022",
      header: "Lacking in applicants, 2022",
      mobileLabel: "Applicants 2022",
      numeric: true,
      render: (r: SkillRow) => pct(r.applicants2022),
    },
    {
      key: "staff2024",
      header: "Lacking in existing staff, 2024",
      mobileLabel: "Existing staff 2024",
      numeric: true,
      render: (r: SkillRow) => pct(r.staff2024),
    },
  ];
}

function EssSource({ tables }: { tables: string }) {
  return (
    <SourceNote
      source="Department for Education, Employer Skills Survey 2024: full UK research report"
      href={ESS_REPORT}
      published="November 2025, updated June 2026"
      note={`Carried out by IFF Research. ${tables}`}
    />
  );
}

export default function SkillsEmployersWantPage() {
  const faq = [
    {
      question: "What are the top skills UK employers want in 2026?",
      answer:
        "The most recent evidence is the Employer Skills Survey 2024, which interviewed 22,712 UK employers between June 2024 and January 2025. When a vacancy was hard to fill because applicants lacked skills, the skills most often missing were specialist knowledge for the role (66% of those vacancies), managing time and priorities (48%), solving complex problems (45%), knowledge of the employer's products and services (45%) and creative and innovative thinking (43%).",
    },
    {
      question: "Do UK employers care more about experience or qualifications?",
      answer:
        "Experience comes first in the survey. 61% of employers said relevant work experience was a critical or significant factor when recruiting, compared with 53% for maths and English at GCSE grade A* to C or equivalent, 43% for vocational qualifications, 41% for academic qualifications, 30% for a relevant apprenticeship and 20% for a degree. Employers struggling to fill vacancies because of skills put even more weight on experience: 77%, against 60% of employers without those vacancies.",
    },
    {
      question: "Do UK employers want AI skills?",
      answer:
        "The 2024 survey suggests AI is still a small part of the picture. 14% of employers said their site used AI. Among existing staff, a lack of AI skills was behind 5% of digital skills gaps. Employers that use AI were more likely to expect to need to upskill staff in the next 12 months (74%, against 56% of those that do not).",
    },
    {
      question: "Which jobs are hardest to fill because of skills?",
      answer:
        "In 2024, 48% of vacancies for skilled trades were hard to fill because applicants lacked skills, qualifications or experience, the highest of any occupation group. Caring and leisure roles came next (30%), then professional roles and machine operatives (29% each). By sector, construction had the highest share (45% of its vacancies), followed by education (36%), then manufacturing and the primary sector and utilities (34% each).",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Skills employers want" }]} />
        }
        kicker="Skills"
        title={H1}
        intro={
          <p>
            The latest edition of the government&apos;s Employer Skills Survey (2024) found that when a vacancy was hard
            to fill for lack of skills, the gap was most often specialist knowledge for the role (66% of those
            vacancies). Next came managing time and priorities (48%), solving complex problems (45%) and knowing the
            employer&apos;s products and services (45%). When hiring, relevant work experience mattered most.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "about-the-survey", label: "What the survey measured" },
          { id: "technical", label: "Technical and practical skills" },
          { id: "people", label: "People and personal skills" },
          { id: "hiring", label: "What employers look for when hiring" },
          { id: "next", label: "Where employers expect new needs" },
          { id: "show-it", label: "How to show these skills" },
        ]}
      />

      <GuideSection id="about-the-survey" title="What the survey measured, and when">
        <Prose>
          <p>
            The Employer Skills Survey is the Department for Education&apos;s large survey of UK employers, funded
            jointly with the Scottish and Welsh Governments and Northern Ireland&apos;s Department for the Economy, and
            carried out by IFF Research. The 2024 edition
            interviewed 22,712 employers by telephone between June 2024 and January 2025. It covers sites with at least
            two people on the payroll. The key figures were published as official statistics on 24 July 2025, and the
            full UK report followed in November 2025. It is the latest edition.
          </p>
          <p>Two measures matter for this guide:</p>
          <ul>
            <li>
              <strong>Skill-shortage vacancies</strong>{" "}are vacancies that are hard to fill because applicants lack the
              skills, qualifications or experience needed. Employers reported 250,500 of them in 2024, 27% of all
              vacancies (down from 36% in 2022, when the number of vacancies was the highest in the survey&apos;s history).
            </li>
            <li>
              <strong>Skills gaps</strong>{" "}are existing staff their employer judges not fully proficient. Employers put
              that at 1.26 million people, or 4.0% of the workforce, the lowest in the survey&apos;s history.
            </li>
          </ul>
          <p>
            Employers with either problem were read a list of skills and asked which were lacking. So the tables below
            show which skills are hardest to find, which is not quite the same as a list of everything employers value.
            A skill almost every applicant has will not appear, however much it matters.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="Department for Education and Skills England, Employer Skills Survey 2024 (official statistics)"
          href={ESS_STATS}
          published="2025-07-24"
          note="Last updated 1 August 2025."
        />
      </GuideSection>

      <GuideSection
        id="technical"
        title="Technical and practical skills employers could not find"
        intro={
          <p>
            Technical and practical skills were a factor in 87% of skill-shortage vacancies. Specialist knowledge for
            the job was the biggest gap by a distance. The sharpest rises since 2022 were in solving complex problems
            (36% to 45%) and advanced or specialist IT skills (17% to 25%).
          </p>
        }
      >
        <DataTable<SkillRow>
          caption="Technical and practical skills lacking, UK employers"
          description="Share of skill-shortage vacancies (applicants) and of skills gaps (existing staff) where employers said each skill was lacking. Employers could name more than one."
          rowKey={(r) => r.skill}
          columns={skillColumns()}
          rows={TECHNICAL}
          source={<EssSource tables="Figures 2-6 and 4-6, checked against UK data tables 40 and 187." />}
        />
        <Prose className="mt-6">
          <p>
            Where IT skills were lacking in applicants, the most common problems were basic Microsoft Office skills (29%
            of those vacancies) and specialist software, hardware or internal systems (28%), followed by app programming
            and development (15%) and foundation digital skills such as typing and connecting to the internet (14%).
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="people"
        title="People and personal skills employers could not find"
        intro={
          <p>
            People and personal skills were a factor in 69% of skill-shortage vacancies. Managing your own time and
            priorities topped the list for applicants and for existing staff. Among applicants, the order of these
            skills was the same as in 2022.
          </p>
        }
      >
        <DataTable<SkillRow>
          caption="People and personal skills lacking, UK employers"
          description="Share of skill-shortage vacancies (applicants) and of skills gaps (existing staff) where employers said each skill was lacking. Employers could name more than one."
          rowKey={(r) => r.skill}
          columns={skillColumns()}
          rows={PEOPLE}
          source={<EssSource tables="Figures 2-7 and 4-7, checked against UK data tables 48 and 195." />}
        />
      </GuideSection>

      <GuideSection
        id="hiring"
        title="What employers look for when they hire"
        intro={
          <p>
            Employers were also asked how much weight they give to different things when recruiting. Experience came
            well ahead of qualifications.
          </p>
        }
      >
        <DataTable<{ factor: string; pct: number }>
          caption="What UK employers rate as critical or significant when recruiting, 2024"
          rowKey={(r) => r.factor}
          columns={[
            { key: "factor", header: "Factor", rowHeader: true },
            { key: "pct", header: "Employers rating it critical or significant", mobileLabel: "Critical or significant", numeric: true, render: (r) => pct(r.pct) },
          ]}
          rows={HIRING}
          source={<EssSource tables="Chapter 3, table 3-1." />}
        />
        <Prose className="mt-6">
          <p>
            Employers that had skill-shortage vacancies leaned even harder on experience: 77% rated relevant work
            experience critical or significant, against 60% of employers without them. They were also more likely to
            value a relevant apprenticeship (45% against 28%) and a degree (28% against 19%).
          </p>
          <p>
            For someone changing career, that is the central problem: you are short of the experience employers want
            most. The practical answer is to show that experience you already have counts, and to close the specialist
            knowledge gap with training or an apprenticeship aimed at the new job.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="next" title="Where employers expect to need new skills">
        <Prose>
          <p>
            59% of employers expected to need to upskill their staff in the next 12 months, down from 62% in 2022. The
            most common reasons were new technologies or equipment (37%), new laws or regulations (37%), new products
            and services (34%) and new working practices (32%).
          </p>
          <p>
            2024 was the first year the survey asked about artificial intelligence. 14% of employers said their site
            used it, rising to about a quarter of those with 100 or more staff, and a lack of AI skills was behind 5% of
            digital skills gaps among existing staff. Employers that use AI were more likely to expect to need to
            upskill their staff (74% against 56%).
          </p>
          <p>
            For a longer view, our guide to the{" "}
            <Link href="/best-careers-for-the-future-uk" className="link">
              best careers for the future
            </Link>{" "}
            covers the published projections of jobs and skills to 2035.
          </p>
        </Prose>
        <SourceNote
          className="mt-4 max-w-reading"
          source="Department for Education, Employer Skills Survey 2024: UK findings"
          href={ESS_UK}
          note="Chapters 9 and 10 of the full UK research report. Checked 28 September 2026."
        />
      </GuideSection>

      <GuideSection
        id="show-it"
        title="How to show these skills if you are changing career"
        intro={
          <p>
            Many of the skills employers struggle to find are ones you can build in any job. Specialist knowledge is
            the exception. These are our suggestions for turning past work into evidence.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>
              <strong>Specialist knowledge:</strong> this is the gap you usually have to close. Look for the
              qualification, short course or{" "}
              <Link href="/apprenticeships-for-adults-uk" className="link">
                adult apprenticeship
              </Link>{" "}
              that the new job asks for, and start it before you apply if you can.
            </li>
            <li>
              <strong>Managing time and priorities:</strong> describe a time you ran several deadlines or a caseload at
              once, and what you dropped or delegated to get the important things done.
            </li>
            <li>
              <strong>Solving complex problems:</strong> pick one real problem, explain what made it hard, what you did
              and what changed as a result. One detailed example beats a list of adjectives.
            </li>
            <li>
              <strong>Handling feelings, yours and other people&apos;s:</strong> complaints, upset customers, patients
              or parents, and difficult conversations with colleagues all count.
            </li>
            <li>
              <strong>Knowledge of the employer&apos;s products and services:</strong> this is one gap you can start
              closing before an interview. Read what they sell or provide, who their customers are, and what has changed for
              them recently.
            </li>
            <li>
              <strong>Managing or motivating others:</strong> you do not need a manager title. Training a new starter,
              leading a project or organising a rota is evidence.
            </li>
          </ul>
          <p>
            Our guides to{" "}
            <Link href="/transferable-skills" className="link">
              transferable skills
            </Link>{" "}
            and{" "}
            <Link href="/how-to-write-a-cv-for-career-change" className="link">
              writing a CV for a career change
            </Link>{" "}
            go into this in more detail.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="See which of these skills you already have"
        body={
          <p>
            Paste your CV or type the job you do now. We pick out the skills you already have and show the jobs they
            lead to. It is free and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/best-careers-for-the-future-uk", label: "Best careers for the future in the UK" },
          { href: "/career-change/skills-based-hiring", label: "Skills-based hiring" },
          { href: "/apprenticeships-for-adults-uk", label: "Apprenticeships for adults" },
          { href: "/career-change-with-no-money", label: "Changing career with no money" },
        ]}
      />
    </GuideShell>
  );
}
