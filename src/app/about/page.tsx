import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";
import { HeroGlow, MoreLink, StepList } from "@/components/marketing";

export const metadata: Metadata = {
  title: "About",
  description:
    "What MatchMySkillset does, how the CV check works, what it cannot do, and how your data is handled.",
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
            An independent UK website that matches your CV to live jobs, and shows the careers your skills could take you to.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[760px] px-4 pb-24 sm:px-6">
        <div className="prose-mms max-w-none">
          <h2 className={h2}>Why it exists</h2>
          <p>
            Most job searches start with a job title. That works if you want the same job somewhere else, but not if you want a
            change. A teacher already plans, explains, manages groups and handles difficult conversations, yet searching for
            &quot;teacher&quot; will never show roles such as learning and development or customer success, where those skills
            are valued. Starting from your skills instead makes those jobs easier to spot, and makes it clearer which adverts you
            could apply for today.
          </p>
        </div>

        <h2 className={h2} id="how-it-works">
          How it works
        </h2>
        <StepList steps={STEPS} className="mt-8" />

        <div className="prose-mms max-w-none">
          <h2 className={h2}>For employers</h2>
          <p>
            Employers can post jobs on a paid plan and see candidates matched to each role by their skills. Candidates who choose
            to be found appear without their name or contact details, and an employer only gets those if the candidate agrees.{" "}
            <Link href="/employers">How it works for employers</Link>.
          </p>

          <h2 className={h2}>What it is not</h2>
          <ul>
            <li>
              Matches and suggestions are generated automatically. Nobody reviews them by hand, so treat them as a starting point
              for your own research, not professional careers advice.
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
          <MoreLink href="/jobs">Browse live jobs</MoreLink>
        </div>
      </div>
    </>
  );
}
