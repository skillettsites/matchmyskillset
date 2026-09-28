import type { Metadata } from "next";
import Link from "next/link";
import { CvUploadCard } from "@/components/cv/CvUploadCard";
import { JOB_FIT_SUMMARY } from "@/lib/apis/jobs/fit";
import { CAREER_OCCUPATIONS } from "@/data/careers";

export const metadata: Metadata = {
  title: "Upload your CV, see UK jobs that match it",
  description:
    "Upload your CV and get live UK jobs from Reed, Adzuna and more, each scored against your skills, plus careers that fit you with ONS pay. Free, no sign-up.",
  alternates: { canonical: "/discover" },
};

const STEPS: [string, string][] = [
  ["Add your CV", "Drop in a PDF or Word file, or paste it. Add where you want to work."],
  ["See live jobs that fit", "Each job gets a match score, the skills you have that it asks for, and the ones you would need."],
  ["Apply or get alerts", "Apply on the original advert, or with MatchMySkillset for jobs posted here. Get new matches by email."],
];

export default function DiscoverPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-8%] !opacity-[0.18]" aria-hidden="true" />
      <section className="relative px-4 pb-16 pt-12 sm:px-5 md:pt-20">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[1fr_520px] lg:items-start">
          <div className="lg:pt-8">
            <p className="eyebrow rise text-blue">Free CV job match</p>
            <h1 className="display rise rise-1 mt-2">
              Jobs that fit
              <br />
              <span className="gradient-text">your CV.</span>
            </h1>
            <p className="lede rise rise-2 mt-6 max-w-[520px]">
              Upload your CV and see live UK jobs you could apply for today, each scored on the skills you actually have. Plus the careers your skills could take you
              to, with pay from the Office for National Statistics.
            </p>
            <ol className="rise rise-3 mt-10 space-y-5">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white">{i + 1}</span>
                  <div>
                    <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{t}</p>
                    <p className="text-[15px] text-mute">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rise rise-2">
            <CvUploadCard variant="page" />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="relative border-t border-hair bg-snow px-4 py-16 sm:px-5">
        <div className="mx-auto max-w-[860px]">
          <h2 id="how-title" className="headline !text-[32px] sm:!text-[40px]">
            How the matching works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="card-white p-6">
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Your skills</p>
              <p className="mt-2 text-[15px] text-ink-2">
                An AI model (Claude, by Anthropic) reads your CV and picks your skills from our fixed list of skills. It does not choose your jobs or careers. Starting
                from a job title instead uses the skills that job usually involves, with no AI.
              </p>
            </div>
            <div className="card-white p-6">
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Live jobs</p>
              <p className="mt-2 text-[15px] text-ink-2">
                We search Reed, Adzuna, GOV.UK Teaching Vacancies, remote job boards and jobs posted on MatchMySkillset for your own job and your closest careers, near
                where you want to work. Adverts more than 60 days old are left out.
              </p>
            </div>
            <div className="card-white p-6">
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">The match score</p>
              <p className="mt-2 text-[15px] text-ink-2">{JOB_FIT_SUMMARY}</p>
            </div>
            <div className="card-white p-6">
              <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Careers that fit</p>
              <p className="mt-2 text-[15px] text-ink-2">
                We also compare your skills with {CAREER_OCCUPATIONS.length} UK careers people commonly move into, with ONS pay and the ways in from the National Careers
                Service and Skills England.
              </p>
            </div>
          </div>
          <p className="mt-8 text-[15px] text-mute">
            Your CV text is used for the analysis and not kept afterwards, unless you later ask us to share it with an employer. Your results are saved behind a private
            link for 12 months. See our{" "}
            <Link href="/privacy" className="text-link hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
