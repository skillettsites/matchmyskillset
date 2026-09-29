import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SHORTLIST_PARTNER_NAME, SHORTLIST_PARTNER_URL, SITE_NAME } from "@/lib/site";
import { CAREERS_HREF, ENGINEERING_HUBS } from "@/components/site";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";
import { HeroGlow, MoreLink, StepList } from "@/components/marketing";

export const metadata: Metadata = {
  title: "About",
  description:
    "What MatchMySkillset does, who runs it (a joint venture with Flintstone Associates), who it is for, how the CV check works and how your data is handled.",
};

const h2 = "mt-16 text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[32px]";

const STEPS = [
  {
    title: "Tell us what you do",
    text: "Upload or paste your CV. No account is needed.",
  },
  {
    title: "Software picks out your skills",
    text: "An AI model (Anthropic's Claude) reads the text and identifies your skills.",
  },
  {
    title: "See jobs you could apply for",
    text: "Live adverts from Reed, Adzuna, GOV.UK Teaching Vacancies, Himalayas and Remotive, and jobs posted by employers here, each scored against your skills.",
  },
  {
    title: "See the careers that fit",
    text: `Suggested careers with ONS pay, the skills you already have for each and the gaps to fill. If you want more on one career, there is an optional Career Change Report for ${REPORT_PRICE_LABEL}, paid once.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-12 pt-14 sm:px-6 md:pt-20">
        <HeroGlow top="-40%" opacity={0.16} />
        <div className="relative mx-auto max-w-[760px]">
          <p className="eyebrow text-link">About</p>
          <h1 className="display mt-2">About {SITE_NAME}</h1>
          <p className="lede mt-6">
            A UK website that matches your CV to live jobs and shows the careers your skills could take you to, with a focus on engineering,
            manufacturing and Industry 4.0. It is a joint venture with the recruitment firm {SHORTLIST_PARTNER_NAME}.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[760px] px-4 pb-24 sm:px-6">
        <div className="prose-mms max-w-none">
          <h2 className={h2} id="who-we-are">
            Who we are
          </h2>
          <p>
            {SITE_NAME} is a joint venture with{" "}
            <a href={SHORTLIST_PARTNER_URL} rel="noopener">
              {SHORTLIST_PARTNER_NAME}
            </a>
            , a specialist recruitment firm. {SITE_NAME} runs the website, the CV matching and the job board. Recruiters from{" "}
            {SHORTLIST_PARTNER_NAME} prepare the shortlists that employers can ask for on our Growth and Enterprise plans, from people
            who applied for the job or chose to let employers find them. Nobody else is put on a shortlist.
          </p>

          <h2 className={h2}>Who it is for</h2>
          <p>We built it around engineering, manufacturing and Industry 4.0 (3D printing, robotics and automation, and AI and connected technology in production), and the people moving into that work:</p>
          <ul>
            <li>ex-military technicians and engineers moving into maintenance, automation, robotics and additive manufacturing;</li>
            <li>graduates and early-career engineers starting out in advanced manufacturing;</li>
            <li>technicians and operators moving up into automation, robotics and AI-enabled production;</li>
            <li>experienced people in commercial, software, engineering, operations, service and product roles in advanced manufacturing.</li>
          </ul>
          <p>
            The CV match itself works for any job. If you are a nurse, a teacher or anything else, upload your CV and you will see live
            jobs scored against your skills in the same way.
          </p>

          <h2 className={h2}>Why it exists</h2>
          <p>
            Most job searches start with a job title. That works if you want the same job somewhere else, but not if you want to move on.
            A maintenance technician already finds faults, reads drawings and keeps machines running, yet searching for &quot;maintenance
            technician&quot; will not show automation or field service roles where those skills are valued. Starting from your skills
            instead makes those jobs easier to spot, and makes it clearer which adverts you could apply for today.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {ENGINEERING_HUBS.map((h) => (
            <li key={h.href}>
              <Link href={h.href} className="flex h-full flex-col rounded-[20px] bg-cloud px-5 py-4 transition-colors hover:bg-hair">
                <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{h.label}</span>
                <span className="mt-0.5 text-[14px] text-mute">{h.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className={h2} id="how-it-works">
          How it works
        </h2>
        <StepList steps={STEPS} className="mt-8" />

        <div className="prose-mms max-w-none">
          <h2 className={h2}>For employers</h2>
          <p>
            Employers can post jobs on a paid plan and see candidates matched to each role by their skills. Candidates who choose
            to be found appear without their name or contact details, and an employer only gets those if the candidate agrees. On
            Growth and Enterprise, recruiters from {SHORTLIST_PARTNER_NAME} can put together a shortlist for each role.{" "}
            <Link href="/employers">How it works for employers</Link>.
          </p>

          <h2 className={h2}>What it is not</h2>
          <ul>
            <li>
              The job matches and career suggestions you see are generated automatically. Nobody reviews them by hand, so treat them as
              a starting point for your own research, not professional careers advice.
            </li>
            <li>
              Pay figures are medians for whole occupation groups from the Office for National Statistics, so a particular employer
              may pay more or less.
            </li>
            <li>We cannot promise interviews or jobs.</li>
          </ul>

          <h2 className={h2}>Your data</h2>
          <p>
            Your results are kept for 12 months so your results link works. Your CV only goes to an employer if you apply to one of
            their jobs on {SITE_NAME}, or accept their request to contact you. Analytics cookies are only used if you accept them.
            The <Link href="/privacy">Privacy Policy</Link> has the details.
          </p>

          <h2 className={h2}>Contact</h2>
          <p>
            Questions, corrections or feedback: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/discover" className="btn btn-primary btn-lg">
            Upload your CV
          </Link>
          <MoreLink href={CAREERS_HREF}>Engineering and manufacturing careers</MoreLink>
        </div>
      </div>
    </>
  );
}
