import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, ToolCallout } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";
import { AsheSourceNote } from "@/components/guides/pay";
import { CAREER_OCCUPATIONS } from "@/data/careers";
import { TransferableSkillsTool } from "./TransferableSkillsTool";
import { buildToolData } from "./tool-data";

const PATH = "/transferable-skills";
const TITLE = "Transferable skills: examples and CV wording for your job";
const DESCRIPTION =
  "Pick the job you do now to see the skills that carry over, CV-ready wording for each, and the jobs that use the same skills, with ONS pay. Free, no sign-up.";
const H1 = "Find your transferable skills";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

interface ExampleRow {
  kind: string;
  examples: string;
  from: string;
}

const EXAMPLES: ExampleRow[] = [
  {
    kind: "Communication",
    examples: "Explaining things clearly, writing reports, presenting, listening, handling difficult conversations",
    from: "Teaching, customer service, nursing, policing",
  },
  {
    kind: "Organisation",
    examples: "Planning work, managing deadlines, scheduling, keeping accurate records",
    from: "Administration, care work, logistics, the armed forces",
  },
  {
    kind: "Leading people",
    examples: "Managing rotas, training new starters, running one-to-ones, dealing with performance",
    from: "Retail and hospitality management, the armed forces, senior nursing",
  },
  {
    kind: "Working with numbers",
    examples: "Budgets, stock control, analysing results, reconciling accounts",
    from: "Retail management, bookkeeping, teaching (assessment data), warehouse work",
  },
  {
    kind: "Handling pressure",
    examples: "Making decisions quickly, staying calm with upset people, managing risk",
    from: "Policing, paramedic and nursing work, chefs, the armed forces",
  },
  {
    kind: "Rules and safety",
    examples: "Safeguarding, health and safety, data protection, following legislation",
    from: "Social work, teaching, care, driving, hospitality",
  },
];

export default function TransferableSkillsPage() {
  const jobs = buildToolData();
  const teacher = jobs.find((j) => j.key === "secondary-teacher");

  const faq = [
    {
      question: "What are transferable skills?",
      answer:
        "Transferable skills are abilities you build in one job that are useful in another: explaining things clearly, organising work, leading a team, handling data or staying calm under pressure. They are what let you change career without starting from nothing, because an employer in a new field can see you already do part of the job.",
    },
    {
      question: "What are some examples of transferable skills?",
      answer:
        "Common examples are communication, organisation and time management, leading and training people, working with numbers and data, problem solving, handling complaints and conflict, and following rules such as safeguarding or health and safety. The tool on this page shows the ones that usually come with your current job, with CV wording for each.",
    },
    ...(teacher
      ? [
          {
            question: "What transferable skills do teachers have?",
            answer: `Teachers usually bring ${teacher.skills
              .slice(0, 5)
              .map((s) => s.name.toLowerCase())
              .join(", ")}. The jobs in our list that share the most of those skills include ${teacher.destinations
              .slice(0, 3)
              .map((d) => d.title.toLowerCase())
              .join(", ")}.`,
          },
        ]
      : []),
    {
      question: "How do I show transferable skills on my CV?",
      answer:
        "Put a short profile at the top that names the job you want and the skills you bring to it. Then, under each past job, lead with the parts that match the new role and give each one a result or a number: how many people, how much money, how often. Use the new field's words rather than your old job's jargon.",
    },
  ];

  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Transferable skills" }]} />}
        kicker="Free tool"
        title={H1}
        intro={
          <p>
            Transferable skills are the things you do well now that another employer would also pay for. Pick your
            current job below to see the skills that usually carry over, CV lines you can copy and adapt, and the jobs
            that use the same skills, with ONS pay for each.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <TransferableSkillsTool jobs={jobs} />
      <div className="mt-3 max-w-reading space-y-1.5">
        <AsheSourceNote note="Median gross annual pay for full-time employee jobs, UK, 2025, for each job's SOC 2020 group." />
        <p className="text-xs leading-relaxed text-muted">
          The skills listed for each job, and the CV lines, are our own judgement of what the job usually involves,
          not official data. Destinations come from our list of {CAREER_OCCUPATIONS.length} career-change
          occupations, each mapped to its ONS occupation group.
        </p>
      </div>

      <GuideSection id="what-are-they" title="What are transferable skills?">
        <Prose>
          <p>
            A transferable skill is anything you have learned to do in one job that is useful in a different one.
            Some are general, such as explaining things clearly, organising your time or managing people. Others are
            more specialist but still travel: a nurse&apos;s careful clinical record keeping is central to clinical
            research, and a police officer&apos;s report writing and case handling are part of fraud investigation.
          </p>
          <p>
            They matter most when you change career. A new employer will not expect you to know their field yet, but
            they will want evidence that you already do part of the job. Your transferable skills are that evidence, as
            long as you describe them in the new employer&apos;s terms.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="examples" title="Examples of transferable skills">
        <DataTable<ExampleRow>
          caption="Common transferable skills and the jobs that build them"
          rowKey={(r) => r.kind}
          columns={[
            { key: "kind", header: "Skill area", rowHeader: true },
            { key: "examples", header: "What it looks like" },
            { key: "from", header: "Jobs that often build it" },
          ]}
          rows={EXAMPLES}
          notes="Our own examples, not official data."
        />
      </GuideSection>

      <GuideSection id="on-your-cv" title="How to put transferable skills on your CV">
        <Prose>
          <ol>
            <li>
              <strong>Start from the job you want.</strong> Read three or four adverts for it and note the skills that
              come up every time.
            </li>
            <li>
              <strong>Match them to your experience.</strong> Use the tool above to find the skills you already have
              that appear in those adverts.
            </li>
            <li>
              <strong>Give each one evidence.</strong> A number, a result or a scale: how many people, how much money,
              how often, what changed.
            </li>
            <li>
              <strong>Translate the language.</strong> &ldquo;Differentiated lessons for mixed-ability classes&rdquo;
              becomes &ldquo;adapted training for learners with different levels of experience&rdquo;.
            </li>
            <li>
              <strong>Lead with them.</strong> Put the most relevant skills in a short profile at the top of your CV,
              not buried under your old job title.
            </li>
          </ol>
          <p>
            Our guide to <Link href="/how-to-write-a-cv-for-career-change">writing a CV for a career change</Link> goes
            through this step by step.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="method" title="How this tool works">
        <Prose>
          <p>
            Each starting job has a short list of skills, rated for how central they are to that job. Each destination
            in our list of career-change occupations has its own rated skills. The tool ranks destinations by the skills
            they share with your current job, giving more weight to skills that are central to both. It does not use AI
            and it does not produce a match percentage, because a single number would suggest more precision than a
            list of skills can give. For an analysis of your own experience,{" "}
            <Link href="/discover">paste your CV</Link>.
          </p>
        </Prose>
      </GuideSection>

      <ToolCallout
        className="mt-14"
        heading="Want a list based on your own CV?"
        body={
          <p>
            Paste your CV and we will pick out the skills in it, the jobs they lead to with ONS pay, and the gaps to
            close. Free, and you do not need an account.
          </p>
        }
      />

      <FaqSection items={faq} />

      <RelatedLinks
        links={[
          { href: "/how-to-write-a-cv-for-career-change", label: "How to write a CV for a career change" },
          { href: "/career-change-from-teaching", label: "Leaving teaching" },
          { href: "/non-clinical-jobs-for-nurses", label: "Non-clinical jobs for nurses" },
          { href: "/jobs-for-ex-military", label: "Jobs for ex-military" },
          { href: "/career-change-from-retail", label: "Leaving retail" },
          { href: "/jobs-without-a-degree", label: "Well-paid jobs without a degree" },
        ]}
      />
    </GuideShell>
  );
}
