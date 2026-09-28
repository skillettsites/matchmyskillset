import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DataTable, FaqSection, PageHeader, Prose, SourceNote, ToolCallout } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideSection, GuideShell, OnThisPage, RelatedLinks } from "@/components/guides/GuideShell";

const PATH = "/how-to-write-a-cv-for-career-change";
const TITLE = "How to write a CV for a career change: a UK guide";
const DESCRIPTION =
  "A skills-based CV structure for career changers, with example lines to adapt, what to leave out and how to match the job advert. Based on UK guidance.";
const H1 = "How to write a CV for a career change";

export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const NCS_CV_URL = "https://nationalcareers.service.gov.uk/careers-advice/cv-sections";
const CS_CANDIDATE_URL =
  "https://www.gov.uk/government/publications/success-profiles/success-profiles-candidate-overview";
const STAR_URL = "https://www.gov.uk/guidance/a-brief-guide-to-competencies";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link" rel="noopener">
      {children}
    </a>
  );
}

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-rule bg-surface p-4">
      <p className="kicker text-muted">Example</p>
      <div className="mt-1 text-ink-2">{children}</div>
    </div>
  );
}

interface LineRow {
  move: string;
  before: string;
  after: string;
}

// Illustrative CV lines. Square brackets mark the figures a reader must replace with their own.
const LINES: LineRow[] = [
  {
    move: "Teacher to learning and development",
    before: "Planned and taught Key Stage 3 English lessons.",
    after:
      "Designed and delivered structured learning for groups of [number], adapting material for different needs and tracking progress through regular assessment.",
  },
  {
    move: "Nurse to health and safety",
    before: "Looked after patients on a busy ward.",
    after:
      "Carried out risk assessments and kept safety records on a [number]-bed ward, reported and followed up incidents, and trained colleagues on new procedures.",
  },
  {
    move: "Retail manager to operations",
    before: "Managed the day-to-day running of the store.",
    after:
      "Ran daily operations for a store taking £[amount] a year: [number] staff, rotas and stock control, against weekly sales and cost targets.",
  },
  {
    move: "Site supervisor to project management",
    before: "Ran building sites.",
    after:
      "Managed site work worth £[amount], coordinating [number] subcontractors to programme and budget and keeping the site compliant with CDM and Building Regulations.",
  },
  {
    move: "Police officer to investigation or compliance",
    before: "Attended incidents and did the paperwork.",
    after:
      "Gathered and assessed evidence, interviewed witnesses and prepared case files to evidential standards within set deadlines.",
  },
  {
    move: "Administrator to project support",
    before: "Did the office admin.",
    after:
      "Coordinated diaries, meetings and records for a team of [number], tracked actions to deadlines and produced weekly progress reports.",
  },
];

export default function Page() {
  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change CV" }]} />
        }
        kicker="Career change"
        title={H1}
        intro={
          <p>
            Lead with what the new job needs, not with your old job titles. Put a short profile and a skills section that
            uses the advert&apos;s wording at the top, then your work history rewritten to show those skills, with real
            results. Keep personal details off: the National Careers Service says not to include your age, date of birth,
            marital status or nationality.
          </p>
        }
        updated={REVAMP_DATE}
      />

      <OnThisPage
        items={[
          { id: "why", label: "Why your current CV works against you" },
          { id: "structure", label: "The skills-based structure" },
          { id: "lines", label: "Example lines, before and after" },
          { id: "advert", label: "Matching the advert" },
          { id: "leave-out", label: "What to leave out" },
          { id: "cover-letter", label: "Cover letter or supporting statement" },
          { id: "faq", label: "Common questions" },
        ]}
      />

      <GuideSection id="why" title="Why your current CV works against you">
        <Prose className="mt-4">
          <p>
            A standard CV lists your jobs, newest first, and describes each one in the language of your current sector.
            That works when you want the same job somewhere else. When you are changing career, the first thing the
            reader sees is a job title that does not match, and the skills they are looking for are buried in bullet
            points written for a different audience.
          </p>
          <p>
            If an employer uses software to sort or search applications, it can only find the words that are actually on
            your CV. A teacher applying for a training role who writes &ldquo;Key Stage 3 curriculum&rdquo; has the right
            experience in the wrong words. The fix is to translate your experience, not invent it.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="structure"
        title="The skills-based structure"
        intro={
          <p>
            This keeps a normal work history, so nothing looks hidden, but puts the evidence for the new job first. The
            National Careers Service says a CV should include contact details, an introduction, education
            history, work history and references (<Ext href={NCS_CV_URL}>How to write a CV</Ext>). A career change CV
            reorders and adds to them.
          </p>
        }
      >
        <Prose className="mt-6">
          <h3>1. Contact details and a headline</h3>
          <p>
            Name, phone, email and the town you live in. Under it, a one-line headline for the kind of role you are
            applying for, not &ldquo;career changer&rdquo;.
          </p>
          <Example>Training and learning professional</Example>

          <h3>2. Profile (three or four lines)</h3>
          <p>
            Say what you offer the new employer, using their words. One short line on what you are looking for is fine;
            do not apologise for the change or lead with &ldquo;looking for a new challenge&rdquo;.
          </p>
          <Example>
            Secondary teacher with [number] years&apos; experience of designing and delivering learning for groups,
            tracking progress with data, and working with parents, colleagues and outside agencies. Completed [course
            name] in [year]. Looking to bring this experience to a learning and development role.
          </Example>

          <h3>3. Key skills (six to ten)</h3>
          <p>
            Take them from the advert&apos;s essential criteria, and list only skills you can back up with an example.
            Our <Link href="/transferable-skills">transferable skills guide</Link> has CV-ready wording for common
            skills.
          </p>
          <Example>
            Programme design and delivery; Presenting to groups; Stakeholder management; Coaching and feedback; Tracking
            and reporting progress; Safeguarding
          </Example>

          <h3>4. Relevant achievements (three to five)</h3>
          <p>
            Results from any setting, including volunteering or a side project, each with what happened because of what
            you did.
          </p>
          <Example>
            Planned and ran a [length] induction programme for [number] new staff, rewriting the materials after feedback;
            [result you can prove].
          </Example>

          <h3>5. Work history</h3>
          <p>
            Newest first, with your real job titles. Give recent roles two to four lines about the parts that match the
            new job. Older roles can be a single line.
          </p>

          <h3>6. Training and qualifications</h3>
          <p>
            Put recent, relevant training first, including short courses taken for the move, then older qualifications
            that still help.
          </p>

          <h3>7. References</h3>
          <p>
            The National Careers Service says not to put someone else&apos;s contact details on your CV; you can write
            &ldquo;References are available on request&rdquo; instead.
          </p>
        </Prose>
      </GuideSection>

      <GuideSection
        id="lines"
        title="Example lines, before and after"
        intro={
          <p>
            Translation means describing the same work in words your target sector uses. Every line must describe
            something you actually did: replace the square brackets with your own figures, or leave the number out.
          </p>
        }
      >
        <DataTable<LineRow>
          caption="Rewriting a CV line for a new sector"
          description="Illustrations written by us. The figures in square brackets are for you to fill in."
          columns={[
            { key: "move", header: "Move", rowHeader: true },
            { key: "before", header: "Before" },
            { key: "after", header: "After" },
          ]}
          rows={LINES}
          rowKey={(r) => r.move}
        />
      </GuideSection>

      <div className="mt-14">
        <ToolCallout heading="Not sure which skills to lead with?" />
      </div>

      <GuideSection id="advert" title="Matching the advert">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Use the advert&apos;s words</strong>{" "}wherever they truthfully describe your experience. If it says
              &ldquo;stakeholder engagement&rdquo;, write that rather than &ldquo;parent liaison&rdquo;.
            </li>
            <li>
              <strong>Use plain headings</strong> such as Profile, Skills, Work history, and Education and training.
            </li>
            <li>
              <strong>Keep the layout simple:</strong> one column, with no text boxes, images or page headers holding
              important details, so the text copies cleanly into online application forms.
            </li>
            <li>
              <strong>Send the file type the advert asks for.</strong>
            </li>
            <li>
              <strong>Rewrite the top third for each application:</strong> the headline, profile and key skills. Your
              work history can stay largely the same.
            </li>
          </ul>
        </Prose>
      </GuideSection>

      <GuideSection id="leave-out" title="What to leave out">
        <Prose className="mt-4">
          <ul>
            <li>
              <strong>Personal details.</strong> The National Careers Service says you should not include your age, date
              of birth, whether you are married or your nationality (<Ext href={NCS_CV_URL}>How to write a CV</Ext>).
            </li>
            <li>
              <strong>Jargon from your old sector.</strong>{" "}Replace terms such as &ldquo;EYFS framework&rdquo; with the
              skill underneath, such as working to a statutory framework.
            </li>
            <li>
              <strong>Duties that only matter in your old job.</strong>{" "}&ldquo;Marked Year 9 homework&rdquo; becomes
              &ldquo;gave written feedback against set criteria&rdquo;, or goes.
            </li>
            <li>
              <strong>Qualifications that do not help.</strong> A teaching qualification supports a move into training;
              it adds less to an application for a finance role.
            </li>
            <li>
              <strong>Length.</strong> We suggest two pages at most. A short CV that tells one clear story is easier to
              read than a full history.
            </li>
          </ul>
          <p>
            Some employers ask for less. The Civil Service may ask for an anonymised CV without details such as your
            name, age or gender, and may ask you to include only the educational qualifications relevant to the role (
            <Ext href={CS_CANDIDATE_URL}>Success Profiles candidate overview, updated 29 January 2025</Ext>).
          </p>
        </Prose>
      </GuideSection>

      <GuideSection id="cover-letter" title="Cover letter or supporting statement">
        <Prose className="mt-4">
          <p>
            This is where the change itself belongs. In two or three sentences, say why you want this kind of work and
            what you bring from your current job, then spend the rest showing how you meet the essential criteria.
          </p>
          <p>
            For Civil Service supporting statements, the guidance is to show how you meet the essential criteria, with
            examples of similar tasks and the skills in the advert, and it suggests the STAR method: situation, task,
            action, result (<Ext href={CS_CANDIDATE_URL}>Success Profiles</Ext>;{" "}
            <Ext href={STAR_URL}>A brief guide to competencies</Ext>). Our guide to{" "}
            <Link href="/career-change/skills-based-hiring">skills-based hiring</Link> covers this in more detail.
          </p>
        </Prose>
      </GuideSection>

      <SourceNote
        className="mt-10 max-w-reading"
        label="Sources"
        source="National Careers Service, How to write a CV"
        href={NCS_CV_URL}
        note="Civil Service Success Profiles candidate overview (Cabinet Office, updated 29 January 2025). Both checked 28 September 2026."
      />

      <FaqSection
        items={[
          {
            question: "Should I use a functional or a chronological CV for a career change?",
            answer:
              "Use a mix. A purely skills-based (functional) CV with no dates can look as if you are hiding something, and a purely chronological one buries your transferable skills. Put a profile, key skills and relevant achievements first, then a normal work history with dates.",
          },
          {
            question: "Should I explain the career change on my CV?",
            answer:
              "Briefly at most. One line in your profile saying what kind of role you want is enough. Save the explanation for your cover letter or supporting statement.",
          },
          {
            question: "Should I put my date of birth on my CV?",
            answer:
              "No. The National Careers Service says you should not include your age, date of birth, whether you are married or your nationality.",
          },
          {
            question: "How do I show a career gap on a career change CV?",
            answer:
              "Give the dates and a short, honest reason, such as caring, study or travel, and include anything relevant you did in that time, such as a course or volunteering. Then move on.",
          },
          {
            question: "How long should a career change CV be?",
            answer:
              "We suggest two pages at most. Keep the detail for the parts that match the new job and cut the rest.",
          },
          {
            question: "Do I need a different CV for every application?",
            answer:
              "Rewrite the headline, profile and key skills for each advert so they use its wording. The work history can stay largely the same.",
          },
        ]}
      />

      <RelatedLinks
        links={[
          { href: "/transferable-skills", label: "Find your transferable skills", note: "CV-ready wording for common skills" },
          { href: "/career-change/skills-based-hiring", label: "Skills-based hiring explained" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/career-change-no-experience", label: "Changing career with no experience" },
          { href: "/jobs", label: "Search live vacancies" },
        ]}
      />
    </GuideShell>
  );
}
