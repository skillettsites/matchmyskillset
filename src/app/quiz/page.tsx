import Link from "next/link";
import { FaqSection, type FaqItem } from "@/components/content";
import { SOURCE, getCareerProfile, sourceLine } from "@/data/careers";
import { QuizClient, type QuizArchetype, type QuizCareer } from "./QuizClient";

/*
 * The quiz sorts answers into one of six broad work styles (editorial). Each
 * style lists five curated careers from @/data/careers, and every pay figure
 * shown is the ONS ASHE median for that career's SOC 2020 unit group. Only the
 * few fields the result screen needs are sent to the browser.
 */

interface ArchetypeSpec {
  archetype: string;
  description: string;
  traits: string[];
  careers: { id: string; why: string }[];
}

const ARCHETYPES: ArchetypeSpec[] = [
  {
    archetype: "The Analyst",
    description: "You enjoy data, logic and hard problems. You are the person a team turns to when it needs a clear answer.",
    traits: ["analytical", "technical"],
    careers: [
      { id: "data-analyst", why: "Spotting patterns in data and explaining what they mean is most of the job." },
      { id: "business-analyst", why: "Working out what an organisation needs and how a change would work, step by step." },
      { id: "user-researcher", why: "Careful research into how people use a product, turned into clear findings." },
      { id: "compliance-officer", why: "Close reading of rules and checking that they are followed." },
      { id: "accountant", why: "Numbers, models and commercial judgement every day." },
    ],
  },
  {
    archetype: "The Connector",
    description: "You are drawn to people. You build trust quickly, understand what others need and form relationships that get results.",
    traits: ["people", "coaching"],
    careers: [
      { id: "hr-officer", why: "Helping staff and managers with recruitment, problems at work and policy." },
      { id: "counsellor", why: "Listening closely and helping people work through difficult times." },
      { id: "careers-adviser", why: "Helping people understand their options and plan their next step." },
      { id: "customer-service-manager", why: "Building trust with customers and leading the team that serves them." },
      { id: "youth-worker", why: "Building relationships with young people and helping them grow." },
    ],
  },
  {
    archetype: "The Creator",
    description: "You see possibilities where others see a blank page. You want variety, creative freedom and the chance to make something original.",
    traits: ["creative", "communication"],
    careers: [
      { id: "copywriter", why: "Turning ideas into words that persuade and engage." },
      { id: "ux-designer", why: "Designing products that are easy and pleasant to use." },
      { id: "marketing-manager", why: "Creative campaigns backed by a clear plan." },
      { id: "social-media-manager", why: "Planning and creating content for an audience, then learning from the results." },
      { id: "web-developer", why: "Building websites and the pages people see and use." },
    ],
  },
  {
    archetype: "The Builder",
    description: "You are practical and technical. You want to create systems and products, and you think about what could exist as well as what does.",
    traits: ["technical", "entrepreneurial"],
    careers: [
      { id: "software-developer", why: "Building tools and systems that solve real problems." },
      { id: "it-project-manager", why: "Where technical understanding meets getting things delivered." },
      { id: "data-scientist", why: "Building models that predict outcomes from data." },
      { id: "cyber-security-analyst", why: "Protecting systems by thinking about how they could be attacked." },
      { id: "network-engineer", why: "Designing and running the networks that other systems depend on." },
    ],
  },
  {
    archetype: "The Leader",
    description: "You rally people, take charge and drive results. You see the bigger picture and know how to get a team there.",
    traits: ["leadership", "sales"],
    careers: [
      { id: "management-consultant", why: "Strategic thinking and persuasion are the main tools." },
      { id: "business-development-manager", why: "Winning new business through relationships and commercial sense." },
      { id: "project-manager", why: "Leading a team towards a clear goal, on time and on budget." },
      { id: "sales-representative", why: "Persuading and negotiating to win and grow accounts." },
      { id: "hr-manager", why: "Leading how an organisation hires, develops and looks after its people." },
    ],
  },
  {
    archetype: "The Organiser",
    description: "You are the calm in the storm. You bring structure, reliability and order, and teams run better with you in them.",
    traits: ["organised", "operational"],
    careers: [
      { id: "project-support-officer", why: "Keeping plans, records and timelines in order for a project team." },
      { id: "office-manager", why: "Keeping an office and the people in it running smoothly." },
      { id: "events-manager", why: "Planning every detail so an event runs to time." },
      { id: "facilities-manager", why: "Managing buildings, contractors and the day-to-day running of a site." },
      { id: "logistics-manager", why: "Coordinating the flow of goods with precision." },
    ],
  },
];

function toCareer(id: string, why: string): QuizCareer {
  const p = getCareerProfile(id);
  if (!p) throw new Error(`[quiz] unknown career id ${id}`);
  const ft = p.pay.ft.median;
  const all = p.pay.all.median;
  return {
    id,
    title: p.occupation.title,
    why,
    median: ft ?? all,
    basis: ft !== null ? "ft" : all !== null ? "all" : null,
    soc: p.unitGroup.code,
    socTitle: p.unitGroup.title,
  };
}

const QUIZ_ARCHETYPES: QuizArchetype[] = ARCHETYPES.map((a) => ({
  archetype: a.archetype,
  description: a.description,
  traits: a.traits,
  careers: a.careers.map((c) => toCareer(c.id, c.why)),
}));

const PAY_SOURCE = {
  name: `ONS, Annual Survey of Hours and Earnings ${SOURCE.year} (${SOURCE.edition}), Table ${SOURCE.table}`,
  href: SOURCE.datasetUrl,
  published: SOURCE.releaseDate,
};

const BECOME_APPRENTICE = "https://www.gov.uk/become-apprentice";

const FAQ: FaqItem[] = [
  {
    question: "How accurate is this career quiz?",
    answer:
      "It sorts your answers into one of six broad work styles. It is a starting point, not a test: it does not look at your skills, qualifications or experience. For careers matched to your own skills, start from the job you do now or paste your CV.",
  },
  {
    question: "Where do the salary figures come from?",
    answer: `Each figure is the median gross annual pay for full-time employees in the job's SOC 2020 unit group, UK, from the Office for National Statistics. ${sourceLine()}. A median covers everyone in the group, including people with years of experience, so starting pay is usually lower.`,
  },
  {
    question: "Do I need to create an account?",
    answer: "No. The quiz is free with no sign-up. The CV check needs no account or email either: your results get their own private link, kept for 12 months.",
  },
  {
    question: "What career suits me if I am an introvert?",
    answer: (
      <p>
        Jobs with more focused, solo work include data analysis, software development, user research, technical writing and
        compliance. See our guide to{" "}
        <Link href="/jobs-for-introverts" className="link">
          jobs for introverts
        </Link>
        .
      </p>
    ),
    answerText:
      "Jobs with more focused, solo work include data analysis, software development, user research, technical writing and compliance. See our guide to jobs for introverts.",
  },
  {
    question: "Can I change careers at 30, 40 or 50?",
    answer: (
      <p>
        Yes. In England you can start an apprenticeship at 16 or over if you are not in full-time education, with no upper
        age limit given, according to{" "}
        <a href={BECOME_APPRENTICE} className="link" rel="noopener">
          GOV.UK
        </a>
        . Our guides to changing career{" "}
        <Link href="/career-change-at-30" className="link">
          at 30
        </Link>{" "}
        and{" "}
        <Link href="/career-change-at-50" className="link">
          at 50
        </Link>{" "}
        set out the routes, what they cost and how long they take.
      </p>
    ),
    answerText:
      "Yes. In England you can start an apprenticeship at 16 or over if you are not in full-time education, with no upper age limit given, according to GOV.UK. Our guides to changing career at 30 and at 50 set out the routes, what they cost and how long they take.",
  },
];

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <QuizClient archetypes={QUIZ_ARCHETYPES} paySource={PAY_SOURCE} />
      <FaqSection items={FAQ} heading="Questions about the quiz" />
      <nav aria-labelledby="related-title" className="mt-10 border-t border-rule pt-8">
        <h2 id="related-title" className="mb-3 text-sm font-semibold text-muted">
          Related pages
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <li>
            <Link href="/careers-for" className="link">
              Career change by profession
            </Link>
          </li>
          <li>
            <Link href="/what-jobs" className="link">
              What jobs can I get?
            </Link>
          </li>
          <li>
            <Link href="/jobs-for-introverts" className="link">
              Jobs for introverts
            </Link>
          </li>
          <li>
            <Link href="/career-change-at-30" className="link">
              Career change at 30
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
